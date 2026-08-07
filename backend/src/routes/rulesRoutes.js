const express = require('express');
const router = express.Router();
const rulesController = require('../controllers/rulesController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/rbacMiddleware');

router.get('/', authenticateToken, rulesController.getRules);
router.post('/test', authenticateToken, isAdmin, rulesController.testRule);
router.post('/execute', authenticateToken, rulesController.executeRules);

module.exports = router;
