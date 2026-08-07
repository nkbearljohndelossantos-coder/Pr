const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { notificationController, auditController, backupController, masterDataController, healthController } = require('../controllers/systemControllers');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/rbacMiddleware');

// Health Check (Public)
router.get('/health', (req, res) => healthController.check(req, res));

// Protected Routes
router.use(authenticateToken);

// Reports
router.get('/reports/excel', (req, res, next) => reportController.exportExcel(req, res, next));
router.get('/reports/csv', (req, res, next) => reportController.exportCsv(req, res, next));

// Notifications
router.get('/notifications', (req, res, next) => notificationController.list(req, res, next));
router.put('/notifications/:id/read', (req, res, next) => notificationController.markRead(req, res, next));

// Audit Logs (Admin only)
router.get('/audit-logs', isAdmin, (req, res, next) => auditController.list(req, res, next));

// Backups (Admin only)
router.post('/backups', isAdmin, (req, res, next) => backupController.create(req, res, next));
router.get('/backups', isAdmin, (req, res, next) => backupController.list(req, res, next));

// Master Data Dropdowns
router.get('/master-data', (req, res, next) => masterDataController.list(req, res, next));
router.post('/master-data', isAdmin, (req, res, next) => masterDataController.create(req, res, next));
router.put('/master-data/:id/toggle', isAdmin, (req, res, next) => masterDataController.toggle(req, res, next));

module.exports = router;
