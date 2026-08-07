const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/rbacMiddleware');
const { auditMiddleware } = require('../middlewares/auditMiddleware');

router.use(authenticateToken);

router.get('/', departmentController.getAll);
router.post('/', isAdmin, auditMiddleware('CREATE_DEPARTMENT'), departmentController.create);
router.put('/:id', isAdmin, auditMiddleware('UPDATE_DEPARTMENT'), departmentController.update);
router.post('/:id/reset-password', isAdmin, auditMiddleware('RESET_DEPT_PASSWORD'), departmentController.resetPassword);

module.exports = router;
