const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authRateLimiter } = require('../middlewares/rateLimiter');

router.post('/login', authRateLimiter, authController.login);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
