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
      required: false,
    },
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: false,
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
