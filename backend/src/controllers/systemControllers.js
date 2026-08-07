const notificationService = require('../services/notificationService');
const auditRepository = require('../repositories/auditRepository');
const backupService = require('../services/backupService');
const masterDataService = require('../services/masterDataService');
const { successResponse, errorResponse } = require('../utils/response');

class SystemController {
  async getNotifications(req, res, next) {
    try {
      const list = await notificationService.getNotificationsForUser(req.user);
      return successResponse(res, 'Notifications retrieved.', list);
    } catch (err) {
      next(err);
    }
  }

  async markNotificationRead(req, res, next) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);
      return successResponse(res, 'Notification marked as read.');
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const logs = await auditRepository.findAll({ limit: Number(limit), offset });
      return successResponse(res, 'Audit logs retrieved.', logs);
    } catch (err) {
      next(err);
    }
  }

  async getBackups(req, res, next) {
    try {
      const list = await backupService.listBackups();
      return successResponse(res, 'System backups retrieved.', list);
    } catch (err) {
      next(err);
    }
  }

  async createBackup(req, res, next) {
    try {
      const backup = await backupService.triggerBackup(req.user.id);
      return successResponse(res, 'System backup generated successfully.', backup);
    } catch (err) {
      next(err);
    }
  }

  async getMasterData(req, res, next) {
    try {
      const { category } = req.query;
      const items = await masterDataService.getDropdowns(category);
      return successResponse(res, 'Master data dropdowns retrieved.', items);
    } catch (err) {
      next(err);
    }
  }

  async addMasterData(req, res, next) {
    try {
      const { category, code, label, sort_order } = req.body;
      const id = await masterDataService.addDropdownItem({ category, code, label, sort_order });
      return successResponse(res, 'Master dropdown item added.', { id, category, code, label });
    } catch (err) {
      next(err);
    }
  }

  async toggleMasterData(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      await masterDataService.toggleActive(id, is_active);
      return successResponse(res, 'Master dropdown item status updated.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SystemController();
