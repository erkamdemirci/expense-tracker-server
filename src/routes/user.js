// routes/userRoutes.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();
const { getUser, updateUser, getUsers, uploadAvatar, getAvatar, getMe } = require('../controllers/user');

router.get('/:id', authenticateToken, getUser);

router.put('/:id', authenticateToken, updateUser);

router.get('/', authenticateToken, getUsers);

router.post('/upload-avatar', authenticateToken, upload.single('avatar'), uploadAvatar);

router.get('/avatar', authenticateToken, getAvatar);

module.exports = router;
