const express = require('express');
const router = express.Router();

const { createTransaction, getTransactions, getTransaction, updateTransaction, getSummary, getLastSixMonthsSummary } = require('../controllers/transaction');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createTransaction);
router.get('/', authenticateToken, getTransactions);
router.get('/summary', authenticateToken, getSummary);
router.get('/:id', authenticateToken, getTransaction);
router.put('/:id', authenticateToken, updateTransaction);
router.get('/summary/last-six-months', authenticateToken, getLastSixMonthsSummary);

module.exports = router;
