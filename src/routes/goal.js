const express = require('express');
const { getGoals } = require('../controllers/goal');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authenticateToken, getGoals);

module.exports = router;
