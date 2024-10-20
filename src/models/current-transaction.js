const mongoose = require("mongoose");

const currentTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["collection", "payment", "purchase", "sale"],
    },
    paymentInstrument: {
      type: String,
      enum: ["cash", "cash-item", "bank-transfer"],
    },
    cashItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CashItem",
      required: function () {
        return this.paymentInstrument === "cash-item";
      },
    },
    note: {
      type: String,
    },
    amount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: function () {
        return ["cash", "bank-transfer"].includes(this.paymentInstrument);
      },
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

module.exports = mongoose.model("CurrentTransaction", currentTransactionSchema);
