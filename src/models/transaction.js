const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  note: String,
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: function () {
      return ["income", "expense"].includes(this.transactionClass);
    },
  },
  transactionClass: {
    type: String,
    enum: ["income", "expense", "transfer"],
    required: true,
  },
  transactionType: {
    type: String,
    enum: [
      "collection",
      "payment",
      "credit-card-debt-payment",
      "cash-advance",
      "transfer-between-accounts",
      "receivable",
      "debt",
    ],
  },
  transactionRepeatType: {
    type: String,
    enum: ["oneoff", "installment", "recurring"],
    default: "oneoff",
    required: true,
  },
  currentTransactionType: {
    type: String,
    enum: ["remittance", "cash", "document"],
    required: function () {
      return ["payment", "collection"].includes(this.transactionType);
    },
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: function () {
      return this.repeateType === "oneoff" &&
        this.transactionType !== "receivable" &&
        this.transactionType !== "debt"
        ? "completed"
        : "pending";
    },
  },
  installmentPayments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: function () {
      return this.transactionRepeatType === "oneoff";
    },
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: function () {
      return this.transactionClass === "transfer";
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
});

// Custom validation to check if 'installmentPayments' field is required
transactionSchema.pre("validate", function (next) {
  if (
    this.transactionRepeatType === "installment" &&
    (!this.installmentPayments || !this.installmentPayments.length)
  ) {
    this.invalidate(
      "installmentPayments",
      'installmentPayments details are required for transactionRepeatType "installmentPayments"'
    );
  }
  next();
});

// Custom validation to check if 'recurringPayments' field is required
transactionSchema.pre("validate", function (next) {
  if (
    this.transactionRepeatType === "recurring" &&
    (!this.recurringPayments || !this.recurringPayments.length)
  ) {
    this.invalidate(
      "recurringPayments",
      'recurringPayments details are required for transactionRepeatType "recurringPayments"'
    );
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
