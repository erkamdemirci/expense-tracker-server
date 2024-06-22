const CurrentAccount = require("../models/current-account");
const Transaction = require("../models/transaction");

exports.createCurrentAccount = async (req, res) => {
  try {
    const account = new CurrentAccount({ ...req.body, user: req.user._id });
    await account.save();
    res.status(201).json(account);
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
    });
    res.status(200).json(accounts);
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
