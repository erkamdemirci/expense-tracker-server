const Payment = require("../models/payment");

exports.getPayments = async (req, res) => {
  const { transactionClass, ledgerId, selectedMonthRange } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: "Ledger ID is required" });
  }

  const query = {
    ledger: ledgerId,
    user: req.user._id,
  };

  if (selectedMonthRange)
    query.date = {
      $gte: selectedMonthRange.start,
      $lte: selectedMonthRange.end,
    };

  let payments = [];
  try {
    payments = await Payment.find(query)
      .sort({ date: -1 })
      .populate({
        path: "transaction",
        select:
          "title note transactionClass transactionType installmentPayments amount category currentAccount debtLoanAccount",
        populate: [
          {
            path: "category",
            select: "name icon color",
          },
          {
            path: "currentAccount",
            select: "name",
          },
          {
            path: "debtLoanAccount",
            select: "name",
          },
        ],
      });

    if (transactionClass !== "all") {
      payments = payments.filter(
        (payment) => payment.transaction.transactionClass === transactionClass
      );
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: "transaction",
    });

    const { transaction } = payment;

    if (payment.transaction.installmentPayments) {
      const installmentPayments = await Payment.find({
        _id: { $in: payment.transaction.installmentPayments },
      }).select("-__v -_id");

      transaction.installmentPayments = installmentPayments;
    }

    if (!transaction) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
