const notificationService = require('../services/notificationService');
const auditRepository = require('../repositories/auditRepository');
const backupService = require('../services/backupService');
const masterDataService = require('../services/masterDataService');
const { successResponse } = require('../utils/response');
const db = require('../config/db');
const logger = require('../utils/logger');
const https = require('https');
const http = require('http');

let memoryEmployeeCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

const fetchCanteenData = (url) => {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NKB-ERP/1.0',
          'Accept': 'application/json'
        },
        timeout: 8000
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            resolve(parsed);
          } catch (e) {
            logger.warn('Failed to parse Canteen API response:', e.message);
            resolve(null);
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.on('error', (err) => {
        logger.warn('Canteen API network error:', err.message);
        resolve(null);
      });
    } catch (e) {
      logger.warn('Invalid Canteen API URL:', e.message);
      resolve(null);
    }
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
  async list(req, res) {
    try {
      const now = Date.now();
      // 1. Fast path: return memory cache if fresh
      if (memoryEmployeeCache && (now - lastFetchTime) < CACHE_TTL && memoryEmployeeCache.length > 0) {
        return successResponse(res, 'Live Canteen Real Employees retrieved (cached)', memoryEmployeeCache, {
          total_count: memoryEmployeeCache.length,
          cached: true
        });
      }

      const settingsService = require('../services/settingsService');
      const settings = await settingsService.getRawSettings();
      const defaultCanteenUrl = 'https://canteen.nkbmanufacturing.com/api/integration/employees?api_key=NkbCanteenIntegrationSecretApiKey2026';
      const canteenUrl = (settings.canteen_api_url && settings.canteen_api_url.trim()) || defaultCanteenUrl;

      let rawData = await fetchCanteenData(canteenUrl);
      let list = [];

      if (rawData && rawData.data && Array.isArray(rawData.data)) {
        list = rawData.data;
      } else if (rawData && rawData.employees && Array.isArray(rawData.employees)) {
        list = rawData.employees;
      } else if (Array.isArray(rawData)) {
        list = rawData;
      }

      if (list && list.length > 0) {
        // Filter out inactive employees
        const activeOnly = list.filter(e => e && e.status !== 'inactive');
        const targetList = activeOnly.length > 0 ? activeOnly : list;

        const formatted = targetList.map((e, idx) => {
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

        memoryEmployeeCache = formatted;
        lastFetchTime = now;

        return successResponse(res, 'Live Canteen Real Employees retrieved successfully', formatted, {
          total_count: formatted.length,
          fetched_from_external: true,
          external_url: canteenUrl
        });
      }

      // 2. Fallback to memory cache if previous fetch succeeded
      if (memoryEmployeeCache && memoryEmployeeCache.length > 0) {
        return successResponse(res, 'Live Canteen Real Employees retrieved (fallback cache)', memoryEmployeeCache, {
          total_count: memoryEmployeeCache.length,
          cached: true
        });
      }

      // 3. Fallback to MySQL local database cache
      try {
        const [rows] = await db.query(
          `SELECT id, employee_id, full_name, name, email, department_name, department, position, canteen_allowance, is_active FROM employees WHERE is_active = 1 ORDER BY full_name ASC`
        );
        if (rows && rows.length > 0) {
          const formattedRows = rows.map(e => ({
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
          return successResponse(res, 'Live Canteen Real Employees retrieved (db cache)', formattedRows, {
            total_count: formattedRows.length
          });
        }
      } catch (e) {}

      return successResponse(res, 'Employees list retrieved', []);
    } catch (err) {
      logger.error('Error in EmployeeController.list:', err);
      if (memoryEmployeeCache && memoryEmployeeCache.length > 0) {
        return successResponse(res, 'Live Canteen Real Employees retrieved (emergency cache)', memoryEmployeeCache);
      }
      return successResponse(res, 'Employees list retrieved (empty)', []);
    }
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

  async sendTestEmail(req, res) {
    try {
      const emailService = require('../services/emailService');
      const targetEmail = req.body?.target_email || null;
      const result = await emailService.sendTestEmail(targetEmail);
      return res.status(200).json({
        success: true,
        message: result.success ? 'Test email operation completed' : (result.error || 'Failed to deliver test email.'),
        data: result
      });
    } catch (err) {
      logger.error('Error in sendTestEmail controller:', err);
      return res.status(200).json({
        success: true,
        message: err.message,
        data: {
          success: false,
          error: err.message || 'Failed to process test email request.'
        }
      });
    }
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
