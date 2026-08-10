const notificationService = require('../services/notificationService');
const auditRepository = require('../repositories/auditRepository');
const backupService = require('../services/backupService');
const masterDataService = require('../services/masterDataService');
const { successResponse } = require('../utils/response');
const db = require('../config/db');

class NotificationController {
  async list(req, res, next) {
    try {
      const list = await notificationService.getUserNotifications(req.user);
      return successResponse(res, 'Notifications retrieved', list);
    } catch (err) { next(err); }
  }

  async markRead(req, res, next) {
    try {
      await notificationService.markAsRead(req.params.id);
      return successResponse(res, 'Notification marked as read');
    } catch (err) { next(err); }
  }
}

class AuditController {
  async list(req, res, next) {
    try {
      const logs = await auditRepository.findAll(req.query);
      return successResponse(res, 'Audit logs retrieved', logs);
    } catch (err) { next(err); }
  }
}

class BackupController {
  async create(req, res, next) {
    try {
      const backup = await backupService.createBackup(req.user.username);
      return successResponse(res, 'Database backup snapshot generated', backup);
    } catch (err) { next(err); }
  }

  async list(req, res, next) {
    try {
      const list = await backupService.getAllBackups();
      return successResponse(res, 'Backups retrieved', list);
    } catch (err) { next(err); }
  }
}

class MasterDataController {
  async list(req, res, next) {
    try {
      const dropdowns = await masterDataService.getDropdowns(req.query.category);
      return successResponse(res, 'Master data retrieved', dropdowns);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const id = await masterDataService.addDropdown(req.body);
      return successResponse(res, 'Master data dropdown added', { id });
    } catch (err) { next(err); }
  }

  async toggle(req, res, next) {
    try {
      await masterDataService.toggleDropdown(req.params.id, req.body.is_active);
      return successResponse(res, 'Master data dropdown toggled');
    } catch (err) { next(err); }
  }
}

class HealthController {
  async check(req, res) {
    let dbStatus = 'healthy';
    try {
      await db.query('SELECT 1');
    } catch (e) {
      dbStatus = 'unhealthy';
    }

    return res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      engine: 'Enterprise ERP Platform Core v1.0'
    });
  }
}

class EmployeeController {
  async list(req, res, next) {
    try {
      const employeeIntegrationService = require('../services/employeeIntegrationService');
      const employees = await employeeIntegrationService.getEmployees();
      return successResponse(res, 'Employees retrieved successfully', employees);
    } catch (err) { next(err); }
  }
}

module.exports = {
  notificationController: new NotificationController(),
  auditController: new AuditController(),
  backupController: new BackupController(),
  masterDataController: new MasterDataController(),
  healthController: new HealthController(),
  employeeController: new EmployeeController()
};
