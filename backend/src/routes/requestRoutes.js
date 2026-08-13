const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isExecOrAdmin } = require('../middlewares/rbacMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authenticateToken);

router.post('/', upload.array('attachments', 10), (req, res, next) => requestController.create(req, res, next));
router.get('/', (req, res, next) => requestController.list(req, res, next));
router.get('/dashboard', (req, res, next) => requestController.getDashboard(req, res, next));
router.get('/:id', (req, res, next) => requestController.getById(req, res, next));
router.put('/:id', upload.array('attachments', 10), (req, res, next) => requestController.update(req, res, next));
router.put('/:id/status', isExecOrAdmin, (req, res, next) => requestController.updateStatus(req, res, next));
router.get('/:id/pdf', (req, res, next) => requestController.printPdf(req, res, next));

module.exports = router;
