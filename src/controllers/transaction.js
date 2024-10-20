const Transaction = require("../models/transaction");
const Payment = require("../models/payment");
const dayjs = require("dayjs");
const Account = require("../models/account");

exports.createTransaction = async (req, res) => {
  const transaction = new Transaction({
    ...req.body,
    user: req.user._id,
  });
  const account =
    transaction.account && (await Account.findById(transaction.account));
  const toAccount =
    transaction.toAccount && (await Account.findById(transaction.toAccount));

  console.log(req.body, account, toAccount);

  // check if transactionClass is expense and selected account is insufficient
  if (
    [
      "expense",
      "loan",
      "purchase",
      "credit-card-debt-payment",
      "transfer-between-accounts",
    ].includes(transaction.transactionType) &&
    account?.balance < transaction.amount
  ) {
    return res
      .status(400)
      .json({ message: "insufficient_balance", code: "insufficient_balance" });
  }

  if (toAccount) {
    if (transaction.transactionType === "cash-advance") {
      if (toAccount.limit - toAccount.loan < transaction.amount) {
        return res.status(400).json({ message: "insufficient_limit" });
      }
    }
  }

  try {
    if (transaction.transactionRepeatType === "installment") {
      const paymentIds = [];
      const installments = req.body.installments;
      for (let i = 0; i < installments.length; i++) {
        const payment = new Payment({
          ...installments[i],
          user: req.user._id,
          ledger: req.body.ledger,
          transaction: transaction._id,
        });
        await payment.save();
        paymentIds[i] = payment._id;
      }
      transaction.installmentPayments = paymentIds;
      delete transaction.installments;
    } else if (transaction.transactionRepeatType === "recurring") {
      const paymentIds = [];
      const recurringPayments = req.body.recurringPayments;
      for (let i = 0; i < recurringPayments.length; i++) {
        const payment = new Payment({
          ...recurringPayments[i],
          user: req.user._id,
          ledger: req.body.ledger,
          transaction: transaction._id,
        });
        await payment.save();
        paymentIds.push(payment._id);
      }
      transaction.recurringPayments = paymentIds;
    }

    if (["debt", "loan"].includes(transaction.transactionType)) {
      const payment = new Payment({
        amount: transaction.amount,
        date: transaction.maturityDate,
        user: req.user._id,
        ledger: req.body.ledger,
        transaction: transaction._id,
      });
      await payment.save();
      transaction.debtLoanPayment = payment._id;
    }

    await transaction.save();

    if (account) {
      if (transaction.transactionType === "income") {
        account.balance += transaction.amount;
      } else if (transaction.transactionType === "expense") {
        account.balance -= transaction.amount;
      }

      if (toAccount) {
        if (transaction.transactionType === "credit-card-debt-payment") {
          account.balance -= transaction.amount;
          toAccount.loan -= transaction.amount;
        } else if (transaction.transactionType === "cash-advance") {
          toAccount.balance += transaction.amount;
          account.loan += transaction.amount;
        } else if (
          transaction.transactionType === "transfer-between-accounts"
        ) {
          toAccount.balance += transaction.amount;
          account.balance -= transaction.amount;
        }
        await toAccount.save();
      }

      await account.save();
    }

    res.status(201).json(transaction);
  } catch (error) {
    // if error occurs, delete the transaction and payments
    if (transaction) {
      await Transaction.deleteOne({ _id: transaction._id });
      await Payment.deleteMany({ transaction: transaction._id });
    }

    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  const { transactionClass, ledgerId, page, limit, selectedMonthRange } =
    req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: "Ledger ID is required" });
  }

  const query = { ledger: ledgerId, user: req.user._id };

  if (transactionClass !== "all") {
    query.transactionClass = transactionClass;
  }

  if (selectedMonthRange)
    query.date = {
      $gte: selectedMonthRange.start,
      $lte: selectedMonthRange.end,
    };

  try {
    const transactions = await Transaction.find(query)
      .populate({ path: "category", select: "name icon color -_id" })
      .populate({ path: "user", select: "username -_id" })
      .populate({ path: "account", select: "name -_id" })
      .populate({ path: "toAccount", select: "name -_id" })
      .populate({ path: "currentAccount", select: "name" })
      .populate({ path: "debtLoanAccount", select: "name" })
      .sort({ date: -1 });

    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({ path: "category", select: "name icon color -_id" })
      .populate({ path: "user", select: "username -_id" })
      .populate({ path: "account", select: "name -_id" })
      .populate({ path: "toAccount", select: "name -_id" })
      .populate({ path: "installmentPayments" });

    console.log(transaction);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const transaction = await Transaction.findOne({
    _id: id,
    user: req.user._id,
  });

  console.log(transaction, req.user._id, id);
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  try {
    await Transaction.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (
      ["installment", "recurring"].includes(transaction.transactionRepeatType)
    ) {
      await Payment.deleteMany({ transaction: id });
    }

    if (["debt", "loan"].includes(transaction.transactionType)) {
      await Payment.deleteOne({ _id: transaction.debtLoanPayment });
    }
    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  const { ledgerId, selectedMonthRange } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: "Ledger ID is required" });
  }

  try {
    const query = {
      ledger: ledgerId,
      user: req.user._id,
      $or: [
        { status: "completed" },
        { status: "pending", transactionRepeatType: "installment" },
      ],
    };

    if (selectedMonthRange)
      query.date = {
        $gte: selectedMonthRange.start,
        $lte: selectedMonthRange.end,
      };

    const transactions = await Transaction.find(query);

    if (transactions.length === 0) {
      return res.json({ income: 0, expense: 0, total: 0 });
    }

    const [completedTransactions, pendingTransactions] = transactions.reduce(
      (acc, transaction) => {
        if (transaction.status === "completed") {
          acc[0].push(transaction);
        } else if (transaction.status === "pending") {
          acc[1].push(transaction);
        }
        return acc;
      },
      [[], []]
    );

    let income = completedTransactions
      .filter((transaction) => transaction.transactionClass === "income")
      .reduce((acc, transaction) => acc + transaction.amount, 0);
    let expense = completedTransactions
      .filter((transaction) => transaction.transactionClass === "expense")
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    for (let i = 0; i < pendingTransactions.length; i++) {
      const installmentPayments = await Payment.find({
        transaction: pendingTransactions[i]._id,
        status: "completed",
        date: {
          $gte: selectedMonthRange.start,
          $lte: selectedMonthRange.end,
        },
      });

      const transactionType = pendingTransactions[i].transactionClass;
      if (transactionType === "income") {
        income += installmentPayments.reduce(
          (acc, payment) => acc + payment.amount,
          0
        );
      } else {
        expense += installmentPayments.reduce(
          (acc, payment) => acc + payment.amount,
          0
        );
      }
    }

    const total = income - expense;

    res.json({ income, expense, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLastSixMonthsSummary = async (req, res) => {
  const { ledgerId } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: "Ledger ID is required" });
  }

  const query = {
    ledger: ledgerId,
    user: req.user._id,
    $or: [
      { status: "completed" },
      { status: "pending", transactionRepeatType: "installment" },
    ],
  };

  const startDate = dayjs().subtract(6, "month").startOf("month").toDate();
  const endDate = dayjs().endOf("month").toDate();
  query.date = { $gte: startDate, $lte: endDate };

  try {
    const transactions = await Transaction.find(query);

    let income = {};
    let expense = {};

    for (let i = 0; i < 6; i++) {
      const month = new Date(
        new Date().getFullYear(),
        new Date().getMonth() - i
      ).getMonth();
      income[month] = 0;
      expense[month] = 0;
    }

    if (transactions.length === 0) {
      return res.json({ income, expense });
    }

    const [completedTransactions, pendingTransactions] = transactions.reduce(
      (acc, transaction) => {
        if (transaction.status === "completed") {
          acc[0].push(transaction);
        } else if (transaction.status === "pending") {
          acc[1].push(transaction);
        }
        return acc;
      },
      [[], []]
    );

    completedTransactions.forEach((transaction) => {
      const month = new Date(transaction.date).getMonth();
      if (transaction.transactionClass === "income") {
        income[month] += transaction.amount;
      } else {
        expense[month] += transaction.amount;
      }
    });

    for (let i = 0; i < pendingTransactions.length; i++) {
      const installmentPayments = await Payment.find({
        transaction: pendingTransactions[i]._id,
        status: "completed",
        date: { $gte: startDate, $lte: endDate },
      });

      const transactionType = pendingTransactions[i].transactionClass;
      const month = new Date(pendingTransactions[i].date).getMonth();
      if (transactionType === "income") {
        income[month] += installmentPayments.reduce(
          (acc, payment) => acc + payment.amount,
          0
        );
      } else {
        expense[month] += installmentPayments.reduce(
          (acc, payment) => acc + payment.amount,
          0
        );
      }
    }

    res.json({ income, expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
