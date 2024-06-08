const Ledger = require('../models/ledger');

exports.createLedger = async (req, res) => {
  try {
    const ledger = new Ledger({ ...req.body, createdBy: req.user._id, users: [req.user._id] });
    await ledger.save();
    res.status(201).json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find({ createdBy: req.user._id });
    res.status(200).json(ledgers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!ledger) {
      return res.status(404).json({ error: 'Ledger not found' });
    }
    res.status(200).json(ledger);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
