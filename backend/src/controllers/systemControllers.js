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
      const data = await masterDataService.getDropdowns(req.query.category);
      return successResponse(res, 'Master data retrieved', data);
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const id = await masterDataService.addDropdown(req.body);
      return successResponse(res, 'Master data added successfully', { id });
    } catch (err) { next(err); }
  }

  async toggle(req, res, next) {
    try {
      await masterDataService.toggleDropdown(req.params.id, req.body.is_active);
      return successResponse(res, 'Master data status toggled successfully');
    } catch (err) { next(err); }
  }
}

class HealthController {
  async check(req, res) {
    return res.json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'NKB Manufacturing Enterprise Requisition System',
      version: '1.0.0'
    });
  }
}

class EmployeeController {
  async list(req, res, next) {
    try {
      const [employees] = await db.query(
        `SELECT id, employee_id, full_name, email, department_name, position FROM employees WHERE is_active = 1 ORDER BY full_name ASC`
      );
      return successResponse(res, 'Employees list retrieved', employees);
    } catch (err) { next(err); }
  }
}

class SettingsController {
  async get(req, res, next) {
    try {
      const settingsService = require('../services/settingsService');
      const settings = await settingsService.getSettings();
      return successResponse(res, 'System settings retrieved', settings);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const settingsService = require('../services/settingsService');
      const updated = await settingsService.updateSettings(req.body);
      return successResponse(res, 'System settings updated successfully', updated);
    } catch (err) { next(err); }
  }

  async sendTestEmail(req, res, next) {
    try {
      const emailService = require('../services/emailService');
      const result = await emailService.sendTestEmail(req.body.target_email);
      return successResponse(res, 'Test email operation completed', result);
    } catch (err) { next(err); }
  }
}

class UserController {
  async list(req, res, next) {
    try {
      const userRepository = require('../repositories/userRepository');
      const users = await userRepository.findAll();
      return successResponse(res, 'Users retrieved', users);
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const userRepository = require('../repositories/userRepository');
      const bcrypt = require('bcryptjs');
      const { id } = req.params;
      const { username, full_name, email, role, password } = req.body;

      let hash = null;
      if (password && password.trim() !== '') {
        hash = await bcrypt.hash(password.trim(), 10);
      }

      await userRepository.updateUser(id, {
        username,
        full_name,
        email,
        role,
        password_hash: hash
      });

      return successResponse(res, 'User credentials updated successfully');
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      const userRepository = require('../repositories/userRepository');
      const { id } = req.params;
      await userRepository.deleteUser(id);
      return successResponse(res, 'User account deleted successfully');
    } catch (err) { next(err); }
  }
}

module.exports = {
  notificationController: new NotificationController(),
  auditController: new AuditController(),
  backupController: new BackupController(),
  masterDataController: new MasterDataController(),
  healthController: new HealthController(),
  employeeController: new EmployeeController(),
  settingsController: new SettingsController(),
  userController: new UserController()
};
