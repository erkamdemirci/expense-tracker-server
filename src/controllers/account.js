const Account = require("../models/account");
const Transaction = require("../models/transaction");

exports.createAccount = async (req, res) => {
  try {
    console.log(req.body);
    const account = new Account({
      ...req.body,
      user: req.user._id,
    });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAccounts = async (req, res) => {
  const { ledgerId } = req.query;
  try {
    const accounts = await Account.find({
      ledger: ledgerId,
      user: req.user._id,
    });
    res.status(200).json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAccount = async (req, res) => {
  const { transactions } = req.query;

  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (transactions) {
      const transaction = await Transaction.find({
        $or: [{ account: account._id }, { toAccount: account._id }],
      })
        .populate({ path: "category", select: "name icon color -_id" })
        .populate({ path: "user", select: "username -_id" })
        .populate({ path: "account", select: "name -_id" })
        .populate({ path: "toAccount", select: "name -_id" })
        .populate({ path: "currentAccount", select: "name" })
        .populate({ path: "debtLoanAccount", select: "name" });
      account.transactions = transaction;
    }

    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
