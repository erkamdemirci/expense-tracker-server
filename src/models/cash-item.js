const mongoose = require("mongoose");

const cashItemSchema = new mongoose.Schema({
  amount: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    required: true,
  },
  currentAccount: {
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
});

module.exports = mongoose.model("CashItem", cashItemSchema);
