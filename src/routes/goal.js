const express = require('express');
const { check, validationResult } = require('express-validator');
const { createGoal, getGoals, getGoal, updateGoal, deleteGoal } = require('../controllers/goal');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticateToken, getGoals);

module.exports = router;
