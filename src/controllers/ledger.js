const Ledger = require("../models/ledger");
const LedgerInvites = require("../models/ledger-invites");
const User = require("../models/user");

const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

exports.createLedger = async (req, res) => {
  try {
    const ledger = new Ledger({
      ...req.body,
      createdBy: req.user._id,
      users: [req.user._id],
      startOfMonth: req.body.startOfMonth || 1,
    });
    await ledger.save();
    res.status(201).json(ledger);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getLedgers = async (req, res) => {
  try {
    const ledgerInvites = await LedgerInvites.find({
      $or: [{ user: req.user._id }, { createdBy: req.user._id }],
      is_active: true,
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .populate({
        path: "ledger",
      })
      .populate({
        path: "user",
        select: "-password -__v",
      })
      .populate({
        path: "createdBy",
        select: "-password -__v",
      });

    const ledgers = await Ledger.find({ users: req.user._id }).populate({
      path: "users",
      select: "-password -__v",
    });
    res.status(200).json({ ledgers, ledgerInvites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!ledger) {
      return res.status(404).json({ error: "Ledger not found" });
    }
    res.status(200).json(ledger);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.cancelLedgerInvite = async (req, res) => {
  console.log(req.params);
  const inviteId = req.params.inviteId;
  try {
    const ledgerInvite = await LedgerInvites.findByIdAndUpdate(inviteId, {
      is_active: false,
    });
    if (!ledgerInvite) {
      return res.status(404).json({ error: "Ledger invite not found" });
    }
    res.status(200).json(ledgerInvite);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.answerLedgerInvite = async (req, res) => {
  const inviteId = req.params.inviteId;
  const accepted = req.body.accepted;

  try {
    const ledgerInvite = await LedgerInvites.findById(inviteId);
    if (!ledgerInvite) {
      return res.status(404).json({ error: "Ledger invite not found" });
    }
    if (accepted) {
      await Ledger.findByIdAndUpdate(ledgerInvite.ledger, {
        $push: { users: ledgerInvite.user },
      });
    } else {
      await Ledger.findByIdAndUpdate(ledgerInvite.ledger, {
        $pull: { users: ledgerInvite.user },
      });
    }
    ledgerInvite.is_active = false;
    await ledgerInvite.save();

    res.status(200).json(ledgerInvite);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUserFromLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByIdAndUpdate(req.params.id, {
      $pull: { users: req.params.userId },
    });
    if (!ledger) {
      return res.status(404).json({ error: "Ledger not found" });
    }
    res.status(200).json(ledger);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.newLedgerInvite = async (req, res) => {
  const email = req.body.email;
  const ledgerId = req.params.id;
  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // check if user is already in the ledger
  const ledger = await Ledger.findById(ledgerId);
  if (ledger.users.includes(user._id)) {
    return res.status(400).json({ message: "User already in the ledger" });
  }

  // check if user is already invited to the ledger
  const ledgerInvite = await LedgerInvites.findOne({
    ledger: ledgerId,
    user: user._id,
    is_active: true,
    createdAt: { $gte: twentyFourHoursAgo },
  });
  if (ledgerInvite) {
    return res
      .status(400)
      .json({ message: "User already invited to the ledger" });
  }

  try {
    const ledgerInvite = new LedgerInvites({
      ledger: req.params.id,
      user: user._id,
      createdBy: req.user._id,
    });
    await ledgerInvite.save();

    await Ledger.findByIdAndUpdate(ledgerId, {
      $push: { ledgerInvites: ledgerInvite._id },
    });

    res.status(201).json(ledgerInvite);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!ledger) {
      return res.status(404).json({ error: "Ledger not found" });
    }
    res.status(200).json(ledger);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
      type: "joint",
    });
    if (!ledger) {
      return res
        .status(404)
        .json({ error: "Ledger not found or ledger type is personal" });
    }
    res.status(200).json(ledger);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
