const express = require('express');
const router = express.Router();

const { createTransfer, getTransfers, getTransfer, updateTransfer, getSummary, getLastSixMonthsSummary } = require('../controllers/transfer');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createTransfer);
router.get('/', authenticateToken, getTransfers);
router.get('/summary', authenticateToken, getSummary);
router.get('/:id', authenticateToken, getTransfer);
router.put('/:id', authenticateToken, updateTransfer);
router.get('/summary/last-six-months', authenticateToken, getLastSixMonthsSummary);

module.exports = router;
