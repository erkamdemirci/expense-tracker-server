const express = require('express');
const router = express.Router();

const { createTransfer, getTransfers, getTransfer, updateTransfer } = require('../controllers/transfer');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createTransfer);
router.get('/', authenticateToken, getTransfers);
router.get('/:id', authenticateToken, getTransfer);
router.put('/:id', authenticateToken, updateTransfer);

module.exports = router;
