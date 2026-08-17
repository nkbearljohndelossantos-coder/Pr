const notificationService = require('../services/notificationService');
const auditRepository = require('../repositories/auditRepository');
const backupService = require('../services/backupService');
const masterDataService = require('../services/masterDataService');
const { successResponse } = require('../utils/response');
const db = require('../config/db');
const logger = require('../utils/logger');
const https = require('https');

const fetchCanteenData = async (url, apiKey) => {
  if (typeof globalThis.fetch === 'function') {
    const headers = {};
    if (apiKey && !url.includes('api_key=')) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      headers['x-api-key'] = apiKey.trim();
    }
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    return await response.json();
  }

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

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
      const settingsService = require('../services/settingsService');
      const settings = await settingsService.getRawSettings();
      const defaultCanteenUrl = 'https://canteen.nkbmanufacturing.com/api/integration/employees?api_key=NkbCanteenIntegrationSecretApiKey2026';
      const canteenUrl = (settings.canteen_api_url && settings.canteen_api_url.trim()) || defaultCanteenUrl;

      let fetchedFromExternal = false;
      let employees = [];

      // 1. Fetch live real employees from Canteen API!
      if (canteenUrl && canteenUrl.startsWith('http')) {
        try {
          const rawData = await fetchCanteenData(canteenUrl, settings.canteen_api_key);
          let list = [];
          if (rawData && rawData.data && Array.isArray(rawData.data)) {
            list = rawData.data;
          } else if (rawData && rawData.employees && Array.isArray(rawData.employees)) {
            list = rawData.employees;
          } else if (Array.isArray(rawData)) {
            list = rawData;
          }

          if (list.length > 0) {
            // Filter active employees
            const activeOnly = list.filter(e => e && e.status !== 'inactive');
            const targetList = activeOnly.length > 0 ? activeOnly : list;

            employees = targetList.map((e, idx) => {
              const empName = (e.name || e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Employee').trim();
              const deptName = (e.department || e.department_name || e.dept_name || 'General').trim();
              const empPosition = (e.position || e.job_title || e.designation || '').trim();
              const empCode = (e.employee_id || e.emp_id || e.barcode_number || `EMP-${idx + 1}`).trim();

              return {
                id: e.id || idx + 1,
                employee_id: empCode,
                barcode_number: e.barcode_number || empCode,
                name: empName,
                full_name: empName,
                department: deptName,
                department_name: deptName,
                position: empPosition,
                email: (e.email || '').trim(),
                canteen_balance: e.current_balance || 0,
                credit_limit: e.credit_limit || 0,
                wallet_balance: e.wallet_balance || 0,
                is_active: e.status === 'inactive' ? 0 : 1
              };
            });
            fetchedFromExternal = true;

            // Cache/Upsert into MySQL employees table and fallback store!
            try {
              for (const emp of employees) {
                await db.query(
                  `INSERT INTO employees (employee_id, full_name, name, department_name, department, position, email, canteen_allowance, is_active)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
                   ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), name=VALUES(name), department_name=VALUES(department_name), department=VALUES(department), position=VALUES(position)`,
                  [emp.employee_id, emp.full_name, emp.name, emp.department_name, emp.department, emp.position, emp.email, emp.canteen_balance]
                );
              }
            } catch (e) {}
          }
        } catch (extErr) {
          logger.warn(`External Canteen API fetch error (${extErr.message}). Falling back to local cache.`);
        }
      }

      // 2. Fallback to MySQL local database cache if external API offline
      if (!fetchedFromExternal || employees.length === 0) {
        try {
          const [rows] = await db.query(
            `SELECT id, employee_id, full_name, name, email, department_name, department, position, canteen_allowance, is_active FROM employees WHERE is_active = 1 ORDER BY full_name ASC`
          );
          if (rows && rows.length > 0) {
            employees = rows.map(e => ({
              id: e.id,
              employee_id: e.employee_id,
              barcode_number: e.employee_id,
              name: e.name || e.full_name,
              full_name: e.full_name || e.name,
              department: e.department || e.department_name || 'General',
              department_name: e.department_name || e.department || 'General',
              position: e.position || '',
              email: e.email || '',
              canteen_balance: e.canteen_allowance || 0,
              is_active: 1
            }));
          }
        } catch (e) {
          employees = [];
        }
      }

      return successResponse(res, 'Live Canteen Real Employees retrieved successfully', employees, {
        total_count: employees.length,
        fetched_from_external: fetchedFromExternal,
        external_url: canteenUrl
      });
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
