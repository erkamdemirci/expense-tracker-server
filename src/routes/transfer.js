const express = require('express');
const router = express.Router();

const { createTransfer, getTransfers, updateTransfer } = require('../controllers/transfer');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createTransfer);
router.get('/', authenticateToken, getTransfers);
router.put('/:id', authenticateToken, updateTransfer);

module.exports = router;
