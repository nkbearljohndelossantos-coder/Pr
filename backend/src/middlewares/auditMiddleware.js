const db = require('../config/db');
const logger = require('../utils/logger');

const logAuditAction = async ({ userId, username, deptCode, role, action, targetResource, oldValue, newValue, ipAddress, browser }) => {
  try {
    const sql = `
      INSERT INTO audit_logs (user_id, username, department_code, role, action, target_resource, old_value, new_value, ip_address, browser)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [
      userId || null,
      username || 'system',
      deptCode || null,
      role || 'system',
      action,
      targetResource || null,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      ipAddress || null,
      browser || null
    ]);
  } catch (err) {
    logger.error('Failed to log audit action:', err);
  }
};

const auditMiddleware = (action, targetResource = '') => {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const browser = req.headers['user-agent'] || 'Unknown';

        logAuditAction({
          userId: req.user.id,
          username: req.user.username,
          deptCode: req.user.department_code || null,
          role: req.user.role,
          action: `${req.method} ${action}`,
          targetResource: targetResource || req.originalUrl,
          oldValue: null,
          newValue: req.body ? { ...req.body, password: undefined } : null,
          ipAddress,
          browser
        });
      }
    });
    next();
  };
};

module.exports = { logAuditAction, auditMiddleware };
