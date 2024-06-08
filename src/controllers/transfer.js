const { validationResult } = require('express-validator');
const Transfer = require('../models/transfer');

exports.createTransfer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const transfer = new Transfer({ ...req.body, createdBy: req.user._id });
    await transfer.save();
    res.status(201).json(transfer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find({ createdBy: req.user._id });
    res.status(200).json(transfers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true });
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.status(200).json(transfer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
