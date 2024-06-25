const mongoose = require("mongoose");

const cashItemSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurrentAccount",
    },
    maturityDate: {
      type: Date,
      required: true,
    },
    serialNumber: {
      type: String,
    },
    bank: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("CashItem", cashItemSchema);
