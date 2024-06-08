const Account = require('../models/account');

exports.createAccount = async (req, res) => {
  try {
    const account = new Account({ ...req.body, user: req.user._id });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
