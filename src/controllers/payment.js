const Account = require("../models/account");
const Payment = require("../models/payment");
const Transaction = require("../models/transaction");

exports.getPayments = async (req, res) => {
  const { transactionClass, ledgerId, selectedMonthRange } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: "Ledger ID is required" });
  }

  const query = {
    ledger: ledgerId,
    user: req.user._id,
  };

  if (selectedMonthRange)
    query.date = {
      $gte: selectedMonthRange.start,
      $lte: selectedMonthRange.end,
    };

  let payments = [];
  try {
    payments = await Payment.find(query)
      .sort({ date: -1 })
      .populate({ path: "account", select: "name type" })
      .populate({
        path: "transaction",
        select:
          "title note user transactionClass transactionType transactionRepeatType installmentPayments recurringPayments amount category currentAccount debtLoanAccount",
        populate: [
          {
            path: "user",
            select: "username",
          },
          {
            path: "category",
            select: "name icon color",
          },
          {
            path: "currentAccount",
            select: "name",
          },
          {
            path: "debtLoanAccount",
            select: "name",
          },
        ],
      });

    payments.forEach((payment) => {
      console.log({ transaction: payment.transaction });
    });

    if (transactionClass !== "all") {
      payments = payments.filter(
        (payment) => payment.transaction.transactionClass === transactionClass
      );
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  console.log(req.body);
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // find payment transaction
    const transaction = await Transaction.findById(payment.transaction);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // find account
    const account = await Account.findById(payment.account);

    console.log({ transaction });

    if (transaction.transactionRepeatType === "recurring") {
      if (transaction.transactionClass === "expense") {
        if (account.balance < payment.amount) {
          return res.status(400).json({
            message: "insufficient_balance",
            code: "insufficient_balance",
          });
        }

        account.balance -= payment.amount;
        await account.save();
      } else if (transaction.transactionClass === "income") {
        account.balance += payment.amount;
        await account.save();
      }
    }

    if (transaction.transactionRepeatType === "installment") {
      if (account.balance < payment.amount) {
        return res.status(400).json({
          message: "insufficient_balance",
          code: "insufficient_balance",
        });
      }
      if (transaction.transactionClass === "expense") {
        account.balance -= payment.amount;
        await account.save();
      } else if (transaction.transactionClass === "income") {
        account.balance += payment.amount;
        await account.save();
      }
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
