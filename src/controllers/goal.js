const { validationResult } = require('express-validator');
const Goal = require('../models/goal');

exports.createGoal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const goal = new Goal({ ...req.body, user: req.user._id });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).populate('category');
    res.status(200).json(goals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
