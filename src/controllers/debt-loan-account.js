const DebtLoanAccount = require("../models/debt-loan-account");

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
  try {
    const account = await DebtLoanAccount.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
