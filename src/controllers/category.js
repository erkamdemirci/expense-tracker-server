const Category = require("../models/category");
const Transaction = require("../models/transaction");

exports.createCategory = async (req, res) => {
  try {
    const category = new Category({ ...req.body, user: req.user._id });
    await category.save();
    console.log({ category });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getCategory = async (req, res) => {
  const { transactions } = req.query;

  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (transactions) {
      const transaction = await Transaction.find({
        category: category._id,
      })
        .populate({ path: "user", select: "username -_id" })
        .populate({ path: "account", select: "name -_id" })
        .populate({ path: "category", select: "name icon color -_id" })
        .populate({ path: "toAccount", select: "name -_id" })
        .populate({ path: "currentAccount", select: "name" })
        .populate({ path: "debtLoanAccount", select: "name" });

      category.transactions = transaction;
    }

    const total = category.transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );

    res.status(200).json({ ...category.toObject(), total });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  const { ledgerId } = req.query;

  if (!ledgerId) {
    return res.status(400).json({ error: "Ledger ID is required" });
  }

  try {
    const categories = await Category.find({
      user: req.user._id,
      ledger: ledgerId,
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

exports.getMostExpenseCategories = async (req, res) => {
  const { ledgerId, count } = req.query;

  try {
    const categories = await Category.find({
      user: req.user._id,
      ledger: ledgerId,
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    const transactions = await Transaction.find({
      user: req.user._id,
      ledger: ledgerId,
      category: { $in: categories.map((category) => category._id) },
      date: { $gte: startDate, $lte: endDate },
    });

    const categoriesWithAmount = categories.map((category) => {
      const total = transactions
        .filter(
          (transaction) =>
            transaction.category.toString() === category._id.toString()
        )
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      return {
        ...category.toObject(),
        total: total ?? 0,
      };
    });

    let mostExpenseCategories = categoriesWithAmount.sort(
      (a, b) => b.total - a.total
    );
    if (count) {
      mostExpenseCategories = mostExpenseCategories.slice(0, Number(count));
    }
    res.status(200).json(mostExpenseCategories);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
