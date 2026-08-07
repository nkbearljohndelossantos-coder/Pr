const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authRateLimiter } = require('../middlewares/rateLimiter');

router.post('/login', authRateLimiter, (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticateToken, (req, res, next) => authController.me(req, res, next));

module.exports = router;
