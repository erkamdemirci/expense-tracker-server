const CurrentAccount = require("../models/current-account");
const Transaction = require("../models/transaction");

exports.createCurrentAccount = async (req, res) => {
  try {
    const account = new CurrentAccount({ ...req.body, user: req.user._id });
    await account.save();

    if (req.body.email) {
      req.user.currentAccount = account._id;
      await req.user.save();
    }

    res.status(201).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateCurrentAccount = async (req, res) => {
  try {
    const account = await CurrentAccount.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    await account.updateOne(req.body);
    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getCurrentAccounts = async (req, res) => {
  const { ledgerId } = req.query;
  try {
    const accounts = await CurrentAccount.find({
      ledger: ledgerId,
      user: req.user._id,
      _id: { $ne: req.user.currentAccount },
    });

    // get transactions
    const transactions = await Transaction.find({
      currentAccount: { $in: accounts.map((account) => account._id) },
    });

    // calculate balance for each account
    const accountsWithBalance = accounts.map((account) => {
      const balance = transactions.reduce((acc, transaction) => {
        if (transaction.currentAccount.equals(account._id)) {
          if (transaction.transactionClass === "income") {
            return acc + transaction.amount;
          } else if (transaction.transactionClass === "expense") {
            return acc - transaction.amount;
          }
        }
        return acc;
      }, 0);
      return { ...account._doc, balance };
    });

    console.log(accountsWithBalance);

    res.status(200).json(accountsWithBalance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentAccount = async (req, res) => {
  const { transactions } = req.query;

  try {
    const account = await CurrentAccount.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (transactions) {
      const transaction = await Transaction.find({
        currentAccount: account._id,
      })
        .populate({ path: "user", select: "username -_id" })
        .populate({ path: "account", select: "name -_id" })
        .populate({ path: "currentAccount", select: "name" });
      account.transactions = transaction;
    }

    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
