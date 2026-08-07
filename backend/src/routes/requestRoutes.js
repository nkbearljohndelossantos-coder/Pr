const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isExecOrAdmin } = require('../middlewares/rbacMiddleware');
const { auditMiddleware } = require('../middlewares/auditMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authenticateToken);

router.post('/', upload.array('attachments', 5), auditMiddleware('CREATE_REQUISITION'), requestController.create);
router.get('/', requestController.list);
router.get('/dashboard', requestController.getDashboard);
router.get('/:id', requestController.getById);
router.put('/:id/status', isExecOrAdmin, auditMiddleware('UPDATE_REQUISITION_STATUS'), requestController.updateStatus);
router.get('/:id/pdf', requestController.generatePdf);

module.exports = router;
