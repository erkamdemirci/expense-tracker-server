const { validationResult } = require('express-validator');
const Transfer = require('../models/transfer');
const dayjs = require('dayjs');

exports.createTransfer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const transfer = new Transfer({ ...req.body, createdBy: req.user._id });
    await transfer.save();
    res.status(201).json(transfer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  const { transferType, ledgerId, month, year, page, limit } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: 'Ledger ID is required' });
  }

  const query = { ledger: ledgerId, user: req.user._id };

  if (transferType) {
    query.type = transferType;
  }

  if (month && year) {
    const startDate = dayjs().startOf('month').toDate();
    const endDate = dayjs().endOf('month').toDate();
    query.date = { $gte: startDate, $lte: endDate };
  }

  // if (page && limit) {
  //   page = parseInt(page);
  //   limit = parseInt(limit);
  //   skip = (page - 1) * limit;
  // }

  try {
    const transfers = page && limit ? await Transfer.find(query).skip(skip).limit(limit) : await Transfer.find(query);

    const total = await Transfer.countDocuments();
    res.json({ transfers, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.status(200).json(transfer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true });
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    res.status(200).json(transfer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  const { ledgerId } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: 'Ledger ID is required' });
  }

  try {
    const query = { ledger: ledgerId, user: req.user._id, status: 'completed' };

    const startDate = dayjs().startOf('month').toDate();
    const endDate = dayjs().endOf('month').toDate();
    query.date = { $gte: startDate, $lte: endDate };

    const transfers = await Transfer.find(query);

    if (transfers.length === 0) {
      return res.json({ income: 0, expense: 0, total: 0 });
    }

    const income = transfers.filter((transfer) => transfer.type === 'income').reduce((acc, transfer) => acc + transfer.amount, 0);
    const expense = transfers.filter((transfer) => transfer.type === 'expense').reduce((acc, transfer) => acc + transfer.amount, 0);
    const total = income - expense;

    res.json({ income, expense, total });
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLastSixMonthsSummary = async (req, res) => {
  const { ledgerId } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: 'Ledger ID is required' });
  }

  const query = { ledger: ledgerId, user: req.user._id, status: 'completed' };

  const startDate = dayjs().startOf('month').toDate();
  const endDate = dayjs().endOf('month').toDate();
  query.date = { $gte: startDate, $lte: endDate };

  try {
    const transfers = await Transfer.find(query);

    let income = {};
    let expense = {};

    for (let i = 0; i < 6; i++) {
      const month = new Date(new Date().getFullYear(), new Date().getMonth() - i).getMonth() + 1;
      income[month] = 0;
      expense[month] = 0;
    }

    if (transfers.length === 0) {
      return res.json({ income, expense });
    }

    transfers.forEach((transfer) => {
      const month = new Date(transfer.date).getMonth() + 1;
      if (transfer.type === 'income') {
        income[month] += transfer.amount;
      } else {
        expense[month] += transfer.amount;
      }
    });

    res.json({ income, expense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
