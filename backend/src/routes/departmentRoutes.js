const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/', (req, res, next) => departmentController.getAll(req, res, next));
router.post('/', isAdmin, (req, res, next) => departmentController.create(req, res, next));
router.put('/:id', isAdmin, (req, res, next) => departmentController.update(req, res, next));
router.post('/:id/reset-password', isAdmin, (req, res, next) => departmentController.resetPassword(req, res, next));

module.exports = router;
