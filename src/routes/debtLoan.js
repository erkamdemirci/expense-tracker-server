const express = require('express');
const { check, validationResult } = require('express-validator');
const { createReceivablePayable, getReceivablesPayables } = require('../controllers/debtLoan');
const router = express.Router();

router.post(
  '/',
  [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('type').isIn(['debt', 'loan']).withMessage('Type must be either receivable or payable'),
    check('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    check('dueDate').isISO8601().withMessage('Valid due date is required')
  ],
  createReceivablePayable
);

router.get('/', getReceivablesPayables);

module.exports = router;
