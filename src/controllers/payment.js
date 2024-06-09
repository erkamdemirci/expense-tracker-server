const Transfer = require('../models/transfer');
const dayjs = require('dayjs');

exports.getPayments = async (req, res) => {
  const { transferType, ledgerId, month, year } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: 'Ledger ID is required' });
  }

  const query = {
    ledger: ledgerId,
    user: req.user._id,
    class: { $in: ['recurring', 'installment'] }
  };

  if (transferType) {
    query.type = transferType;
  }

  if (month && year) {
    const startDate = dayjs().startOf('month').toDate();
    const endDate = dayjs().endOf('month').toDate();
    query.date = { $gte: startDate, $lte: endDate };
  }

  try {
    const payments = await Transfer.find(query);
    res.status(200).json(payments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
