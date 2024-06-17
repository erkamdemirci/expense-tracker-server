const { validationResult } = require("express-validator");
const Category = require("../models/category");
const Transaction = require("../models/transaction");

exports.getGoals = async (req, res) => {
  const { ledgerId, count } = req.query;

  try {
    const categoriesWithGoal = await Category.find({
      user: req.user._id,
      ledger: ledgerId,
      goal: { $exists: true },
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const transactions = await Transaction.find({
      user: req.user._id,
      ledger: ledgerId,
      category: { $in: categoriesWithGoal.map((category) => category._id) },
      date: { $gte: startDate, $lte: new Date() },
    });

    const goals = categoriesWithGoal.map((category) => {
      const totalSpend = transactions
        .filter(
          (transaction) =>
            transaction.category.toString() === category._id.toString()
        )
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      return {
        category,
        spend: totalSpend,
        target: category.goal,
      };
    });

    let sortedGoals = goals.sort(
      (a, b) => b.spend / b.target - a.spend / a.target
    );
    if (count) {
      sortedGoals = sortedGoals.slice(0, Number(count));
    }

    res.status(200).json(sortedGoals);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
