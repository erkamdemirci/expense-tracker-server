const { validationResult } = require('express-validator');
const Category = require('../models/category');
const Transfer = require('../models/transfer');

exports.getGoals = async (req, res) => {
  const { ledgerId, count } = req.query;

  try {
    const categoriesWithGoal = await Category.find({ user: req.user._id, ledger: ledgerId, goal: { $exists: true } });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const transfers = await Transfer.find({
      user: req.user._id,
      ledger: ledgerId,
      category: { $in: categoriesWithGoal.map((category) => category._id) },
      date: { $gte: startDate, $lte: new Date() }
    });

    const goals = categoriesWithGoal.map((category) => {
      const totalSpend = transfers
        .filter((transfer) => transfer.category.toString() === category._id.toString())
        .reduce((acc, transfer) => acc + transfer.amount, 0);
      return {
        category,
        spend: totalSpend,
        target: category.goal
      };
    });

    let sortedGoals = goals.sort((a, b) => b.spend / b.target - a.spend / a.target);
    if (count) {
      sortedGoals = sortedGoals.slice(0, Number(count));
    }

    res.status(200).json(sortedGoals);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
