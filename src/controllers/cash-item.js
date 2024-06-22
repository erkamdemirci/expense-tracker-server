const CashItem = require("../models/cash-item");

exports.createCashItem = async (req, res) => {
  try {
    const cashItem = new CashItem({ ...req.body, user: req.user._id });
    await cashItem.save();
    res.status(201).json(cashItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getCashItems = async (req, res) => {
  const { ledgerId } = req.query;
  try {
    const cashItems = await CashItem.find({
      ledger: ledgerId,
      user: req.user._id,
    })
      .sort({ maturityDate: -1 })
      .populate({ path: "currentAccount", select: "name -_id" });
    res.status(200).json(cashItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCashItem = async (req, res) => {
  try {
    const cashItem = await CashItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!cashItem) {
      return res.status(404).json({ error: "cashItem not found" });
    }
    res.status(200).json(cashItem);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
