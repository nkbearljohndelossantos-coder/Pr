const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'enterprise_erp_jwt_secret_key_2026_safe_32_bytes',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'enterprise_erp_jwt_refresh_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',
  DB_NAME: process.env.DB_NAME || 'purchase_requisition_erp',
  DB_TYPE: process.env.DB_TYPE || 'sqlite', // 'mysql' or 'sqlite' fallback for zero-config demo
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  BACKUP_DIR: process.env.BACKUP_DIR || path.join(__dirname, '../../backups'),
  COMPANY_NAME: process.env.COMPANY_NAME || 'Enterprise Global Industries Inc.',
  COMPANY_CODE: process.env.COMPANY_CODE || 'EGI-CORP'
};
