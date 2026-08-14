const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { notificationController, auditController, backupController, masterDataController, healthController, employeeController, settingsController, userController } = require('../controllers/systemControllers');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/rbacMiddleware');

// Health Check (Public)
router.get('/health', (req, res) => healthController.check(req, res));

// Protected Routes
router.use(authenticateToken);

// Employees Integration Endpoint
router.get('/employees', (req, res, next) => employeeController.list(req, res, next));

// Users & Credentials Management (Admin only)
router.get('/users', isAdmin, (req, res, next) => userController.list(req, res, next));
router.put('/users/:id', isAdmin, (req, res, next) => userController.update(req, res, next));

// System Settings (Admin only)
router.get('/settings', isAdmin, (req, res, next) => settingsController.get(req, res, next));
router.put('/settings', isAdmin, (req, res, next) => settingsController.update(req, res, next));
router.post('/settings/test-email', isAdmin, (req, res, next) => settingsController.sendTestEmail(req, res, next));

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
