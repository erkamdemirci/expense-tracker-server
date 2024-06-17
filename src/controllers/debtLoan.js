const { validationResult } = require("express-validator");
const ReceivablePayable = require("../models/receivablePayable");

exports.createReceivablePayable = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const receivablePayable = new ReceivablePayable({
      ...req.body,
      user: req.user._id,
    });
    await receivablePayable.save();
    res.status(201).json(receivablePayable);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getReceivablesPayables = async (req, res) => {
  try {
    const receivablesPayables = await ReceivablePayable.find({
      user: req.user._id,
    });
    res.status(200).json(receivablesPayables);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
