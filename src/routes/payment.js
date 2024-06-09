const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/authMiddleware');
const { getPayments } = require('../controllers/payment');

router.get('/', authenticateToken, getPayments);

module.exports = router;
