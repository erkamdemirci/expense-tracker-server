const mongoose = require("mongoose");

const ledgerInviteSchema = new mongoose.Schema(
  {
    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("LedgerInvite", ledgerInviteSchema);
