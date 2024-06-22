const DebtLoanAccount = require("../models/debt-loan-account");
const Transaction = require("../models/transaction");

exports.createDebtLoanAccount = async (req, res) => {
  try {
    const account = new DebtLoanAccount({ ...req.body, user: req.user._id });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getDebtLoanAccounts = async (req, res) => {
  const { ledgerId } = req.query;
  try {
    const accounts = await DebtLoanAccount.find({
      ledger: ledgerId,
      user: req.user._id,
    });
    res.status(200).json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDebtLoanAccount = async (req, res) => {
  const { transactions } = req.query;

  try {
    const account = await DebtLoanAccount.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (transactions) {
      const transaction = await Transaction.find({
        debtLoanAccount: account._id,
      })
        .populate({ path: "user", select: "username -_id" })
        .populate({ path: "account", select: "name -_id" })
        .populate({ path: "debtLoanAccount", select: "name" });

      account.transactions = transaction;
    }

    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
