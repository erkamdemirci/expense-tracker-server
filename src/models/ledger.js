const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String,
      enum: ["personal", "joint"],
      required: true,
    },
    startDayOfMonth: {
      type: Number,
      default: 1,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ledgerInvites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LedgerInvite",
      },
    ],
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

module.exports = mongoose.model("Ledger", ledgerSchema);
