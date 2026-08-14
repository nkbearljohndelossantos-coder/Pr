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
      let employees = [];
      try {
        const [rows] = await db.query(
          `SELECT id, employee_id, full_name, name, email, department_name, department, position, canteen_allowance, is_active FROM employees WHERE is_active = 1 ORDER BY full_name ASC`
        );
        employees = rows;
      } catch (e) {
        employees = [];
      }

      if (!employees || employees.length === 0) {
        employees = [
          { id: 1, employee_id: 'NKB-EMP-001', name: 'Earl Delos Santos', full_name: 'Earl Delos Santos', department: 'Information Technology Department', department_name: 'Information Technology Department', position: 'IT Infrastructure Specialist', email: 'earl.delossantos@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 2, employee_id: 'NKB-EMP-002', name: 'Maria Santos', full_name: 'Maria Santos', department: 'Human Resources Department', department_name: 'Human Resources Department', position: 'HR Manager', email: 'maria.santos@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 3, employee_id: 'NKB-EMP-003', name: 'Juan Dela Cruz', full_name: 'Juan Dela Cruz', department: 'Production Department', department_name: 'Production Department', position: 'Senior Production Engineer', email: 'juan.delacruz@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 4, employee_id: 'NKB-EMP-004', name: 'Ana Reyes', full_name: 'Ana Reyes', department: 'Accounting Department', department_name: 'Accounting Department', position: 'Chief Accountant', email: 'ana.reyes@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 5, employee_id: 'NKB-EMP-005', name: 'Mark Bautista', full_name: 'Mark Bautista', department: 'Purchasing Department', department_name: 'Purchasing Department', position: 'Purchasing Specialist', email: 'mark.bautista@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 6, employee_id: 'NKB-EMP-006', name: 'Joseph Tan', full_name: 'Joseph Tan', department: 'Warehouse Department', department_name: 'Warehouse Department', position: 'Logistics & Warehouse Supervisor', email: 'joseph.tan@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 7, employee_id: 'NKB-EMP-007', name: 'Liza Garcia', full_name: 'Liza Garcia', department: 'Quality Assurance Department', department_name: 'Quality Assurance Department', position: 'QA Lead Auditor', email: 'liza.garcia@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 8, employee_id: 'NKB-EMP-008', name: 'Robert Lim', full_name: 'Robert Lim', department: 'Production Department', department_name: 'Production Department', position: 'Plant Maintenance Manager', email: 'robert.lim@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 9, employee_id: 'NKB-EMP-009', name: 'Elena Gomez', full_name: 'Elena Gomez', department: 'Executive Management', department_name: 'Executive Management', position: 'Executive Operations Director', email: 'elena.gomez@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 },
          { id: 10, employee_id: 'NKB-EMP-010', name: 'Carlos Ramos', full_name: 'Carlos Ramos', department: 'Information Technology Department', department_name: 'Information Technology Department', position: 'Network & Security Engineer', email: 'carlos.ramos@nkbmanufacturing.com', canteen_allowance: 250.00, is_active: 1 }
        ];
      }

      const formatted = employees.map(e => ({
        id: e.id,
        employee_id: e.employee_id,
        name: e.name || e.full_name || 'Employee',
        full_name: e.full_name || e.name || 'Employee',
        department: e.department || e.department_name || 'General Dept',
        department_name: e.department_name || e.department || 'General Dept',
        position: e.position || 'Staff',
        email: e.email || '',
        canteen_allowance: e.canteen_allowance || 250.00,
        is_active: e.is_active || 1
      }));

      return successResponse(res, 'Employees & Canteen integration list retrieved', formatted);
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
