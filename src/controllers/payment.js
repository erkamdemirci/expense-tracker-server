const Payment = require("../models/payment");
const Transaction = require("../models/transaction");
const dayjs = require("dayjs");

exports.getPayments = async (req, res) => {
  const { transactionClass, ledgerId, month, year } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: "Ledger ID is required" });
  }

  const query = {
    ledger: ledgerId,
    user: req.user._id,
  };

  let startDate;
  let endDate;
  if (month && year) {
    startDate = dayjs().month(month).year(year).startOf("month").toDate();
    endDate = dayjs().month(month).year(year).endOf("month").toDate();
  } else {
    startDate = dayjs().startOf("month").toDate();
    endDate = dayjs().endOf("month").toDate();
  }
  query.date = { $gte: startDate, $lte: endDate };

  let payments = [];
  try {
    payments = await Payment.find(query).populate({
      path: "transaction",
      select: "title note transactionClass installmentPayments amount category",
      populate: {
        path: "category",
        select: "name icon color",
      },
    });

    if (transactionClass) {
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
