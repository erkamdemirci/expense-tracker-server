const { validationResult } = require("express-validator");
const Category = require("../models/category");
const Transaction = require("../models/transaction");

exports.createCategory = async (req, res) => {
  try {
    const category = new Category({ ...req.body, user: req.user._id });
    await category.save();
    res.status(201).json(category);
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

exports.addSubcategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    category.subcategories.push(req.body);
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
