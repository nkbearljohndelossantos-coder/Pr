const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemControllers');
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/rbacMiddleware');
const { auditMiddleware } = require('../middlewares/auditMiddleware');

router.use(authenticateToken);

// Reports
router.get('/reports/excel', reportController.exportExcel);
router.get('/reports/csv', reportController.exportCsv);

// Notifications
router.get('/notifications', systemController.getNotifications);
router.put('/notifications/:id/read', systemController.markNotificationRead);

// Audit & Backup
router.get('/audit-logs', isAdmin, systemController.getAuditLogs);
router.get('/backups', isAdmin, systemController.getBackups);
router.post('/backups', isAdmin, auditMiddleware('CREATE_SYSTEM_BACKUP'), systemController.createBackup);

// Master Data
router.get('/master-data', systemController.getMasterData);
router.post('/master-data', isAdmin, auditMiddleware('CREATE_MASTER_DATA'), systemController.addMasterData);
router.put('/master-data/:id/toggle', isAdmin, auditMiddleware('TOGGLE_MASTER_DATA'), systemController.toggleMasterData);

module.exports = router;
