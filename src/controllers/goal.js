const Category = require("../models/category");
const Transaction = require("../models/transaction");

exports.getGoal = async (req, res) => {
  const { selectedMonthRange } = req.query;
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    const query = {
      user: req.user._id,
      category: category._id,
    };

    if (selectedMonthRange)
      query.date = {
        $gte: selectedMonthRange.start,
        $lte: selectedMonthRange.end,
      };

    const transactions = await Transaction.find(query);

    const totalSpend = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );

    res.status(200).json({
      category,
      transactions: transactions.map((t) => ({
        ...t.toObject(),
        category: {
          name: category.name,
          icon: category.icon,
          color: category.color,
        },
      })),
      spend: totalSpend,
      target: category.goal,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: error.message,
    });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;
  console.log(id, req.user._id);
  const category = await Category.findOne({ _id: id, user: req.user._id });
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }
  await Category.updateOne({ _id: id }, { $unset: { goal: "" } });
  res.status(200).json({ message: "Goal deleted" });
};

exports.getGoals = async (req, res) => {
  const { ledgerId, count, selectedMonthRange } = req.query;

  try {
    const categoriesWithGoal = await Category.find({
      user: req.user._id,
      ledger: ledgerId,
      goal: {
        $exists: true,
      },
    });

    const query = {
      ledger: ledgerId,
      user: req.user._id,
    };

    if (selectedMonthRange)
      query.date = {
        $gte: selectedMonthRange.start,
        $lte: selectedMonthRange.end,
      };

    const transactions = await Transaction.find({
      ...query,
      category: {
        $in: categoriesWithGoal.map((category) => category._id),
      },
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
    res.status(400).json({
      error: error.message,
    });
  }
};
