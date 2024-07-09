const mongoose = require("mongoose");

// "recurringFrequency": {
//     "count": 1,
//     "unit": "month"
//   },
const transactionSchema = new mongoose.Schema(
  {
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
        return (
          ["income", "expense"].includes(this.transactionClass) &&
          !this.transactionType
        );
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
        "income",
        "expense",
        "collection",
        "payment",
        "purchase",
        "sale",
        "debt",
        "loan",
        "credit-card-debt-payment",
        "cash-advance",
        "transfer-between-accounts",
      ],
      required: true,
    },
    recurringFrequency: {
      count: {
        type: Number,
        required: function () {
          return this.transactionRepeatType === "recurring";
        },
      },
      unit: {
        type: String,
        enum: ["day", "week", "month", "quarter", "six-months", "year"],
        required: function () {
          return this.transactionRepeatType === "recurring";
        },
      },
    },
    paymentInstrument: {
      type: String,
      enum: ["cash", "cash-item", "remittance"],
      required: function () {
        return ["payment", "collection"].includes(this.transactionType);
      },
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: function () {
        return (
          (["payment", "collection"].includes(this.transactionType) &&
            ["cash", "remittance"].includes(this.paymentInstrument)) ||
          (["income", "expense"].includes(this.transactionType) &&
            this.transactionRepeatType === "oneoff") ||
          ["debt", "loan"].includes(this.transactionType) ||
          this.transactionClass === "transfer"
        );
      },
    },
    transactionRepeatType: {
      type: String,
      enum: ["oneoff", "installment", "recurring"],
      default: "oneoff",
      required: function () {
        return ["income", "expense"].includes(this.transactionType);
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: function () {
        return this.transactionRepeatType === "oneoff"
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
    debtLoanPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: function () {
        return ["debt", "loan"].includes(this.transactionType);
      },
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: function () {
        return this.transactionClass === "transfer";
      },
    },
    currentAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurrentAccount",
      required: function () {
        return ["collection", "payment", "purchase", "sale"].includes(
          this.transactionType
        );
      },
    },
    cashItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CashItem",
      required: function () {
        return this.paymentInstrument === "cash-item";
      },
    },
    debtLoanAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DebtLoanAccount",
      required: function () {
        return ["debt", "loan"].includes(this.transactionType);
      },
    },
    maturityDate: {
      type: Date,
      required: function () {
        return ["debt", "loan"].includes(this.transactionType);
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
  },
  { versionKey: false }
);

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
  } else if (
    this.transactionRepeatType !== "installment" &&
    (!this.installmentPayments || !this.installmentPayments.length)
  ) {
    this.installmentPayments = undefined;
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
