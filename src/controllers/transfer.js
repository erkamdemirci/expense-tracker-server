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
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const transfers = await Transfer.find().skip(skip).limit(parseInt(limit));
    const total = await Transfer.countDocuments();
    res.json({ transfers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.status(200).json(transfer);
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
