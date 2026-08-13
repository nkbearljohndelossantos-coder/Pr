const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Attempt to load .env from multiple probable locations
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(process.cwd(), '.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

// Fail-safe UPLOAD_DIR and BACKUP_DIR resolution inside backend folder
const defaultUploadDir = path.join(__dirname, '../uploads');
const defaultBackupDir = path.join(__dirname, '../backups');

try {
  if (!fs.existsSync(defaultUploadDir)) fs.mkdirSync(defaultUploadDir, { recursive: true });
} catch (e) {}

try {
  if (!fs.existsSync(defaultBackupDir)) fs.mkdirSync(defaultBackupDir, { recursive: true });
} catch (e) {}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'enterprise_erp_jwt_secret_key_2026_safe_32_bytes',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'enterprise_erp_jwt_refresh_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'u335953510_Request',
  DB_PASS: process.env.DB_PASS || 'NkbManufacturing2025',
  DB_NAME: process.env.DB_NAME || 'u335953510_pr_data',
  DB_TYPE: process.env.DB_TYPE || 'mysql',
  UPLOAD_DIR: process.env.UPLOAD_DIR || defaultUploadDir,
  BACKUP_DIR: process.env.BACKUP_DIR || defaultBackupDir,
  COMPANY_NAME: process.env.COMPANY_NAME || 'NKB Manufacturing',
  COMPANY_CODE: process.env.COMPANY_CODE || 'NKB'
};
