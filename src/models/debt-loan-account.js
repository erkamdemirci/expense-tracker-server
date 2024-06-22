const mongoose = require("mongoose");

const debtLoanAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
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

module.exports = mongoose.model("DebtLoanAccount", debtLoanAccountSchema);
