const express = require('express');
const { check, validationResult } = require('express-validator');
const { createGoal, getGoals } = require('../controllers/goal');
const router = express.Router();

router.post(
  '/',
  [
    check('category').isMongoId().withMessage('Valid category ID is required'),
    check('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    check('targetDate').isISO8601().withMessage('Valid target date is required')
  ],
  createGoal
);

router.get('/', getGoals);

module.exports = router;
