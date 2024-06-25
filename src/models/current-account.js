const mongoose = require("mongoose");

const currentAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    address: {
      type: String,
    },
    currency: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    balance: {
      type: Number,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ledger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("CurrentAccount", currentAccountSchema);
