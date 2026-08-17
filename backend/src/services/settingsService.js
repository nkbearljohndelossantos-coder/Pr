const db = require('../config/db');
const env = require('../config/env');
const emailService = require('./emailService');

const DEFAULT_CANTEEN_URL = 'https://canteen.nkbmanufacturing.com/api/integration/employees?api_key=NkbCanteenIntegrationSecretApiKey2026';
const DEFAULT_CANTEEN_KEY = 'NkbCanteenIntegrationSecretApiKey2026';

class SettingsService {
  async getRawSettings() {
    const rawSettings = {
      approver_email: process.env.APPROVER_EMAIL || env.APPROVER_EMAIL || 'boss@company.com',
      smtp_host: process.env.SMTP_HOST || env.SMTP_HOST || '',
      smtp_port: Number(process.env.SMTP_PORT || env.SMTP_PORT || 587),
      smtp_user: process.env.SMTP_USER || env.SMTP_USER || '',
      smtp_pass: process.env.SMTP_PASS || env.SMTP_PASS || '',
      smtp_from: process.env.SMTP_FROM || env.SMTP_FROM || `"NKB ERP System" <${process.env.SMTP_USER || 'notifications@nkbmanufacturing.com'}>`,
      canteen_api_url: process.env.CANTEEN_API_URL || env.CANTEEN_API_URL || DEFAULT_CANTEEN_URL,
      canteen_api_key: process.env.CANTEEN_API_KEY || env.CANTEEN_API_KEY || DEFAULT_CANTEEN_KEY
    };

    try {
      const [rows] = await db.query(`SELECT setting_key, setting_value FROM system_settings`);
      if (rows && Array.isArray(rows) && rows.length > 0) {
        rows.forEach(r => {
          if (r.setting_key && r.setting_value !== undefined && r.setting_value.trim() !== '') {
            rawSettings[r.setting_key] = r.setting_value;
          }
        });
      }
    } catch (err) {}

    return rawSettings;
  }

  async getSettings() {
    const raw = await this.getRawSettings();
    return {
      ...raw,
      smtp_pass: raw.smtp_pass ? '********' : ''
    };
  }

  async updateSettings(data) {
    const keys = ['approver_email', 'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from', 'canteen_api_url', 'canteen_api_key'];
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== '********') {
        const val = String(data[key]).trim();
        try {
          await db.query(
            `INSERT INTO system_settings (setting_key, setting_value)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
            [key, val]
          );
        } catch (e) {}
      }
    }

    const rawUpdated = await this.getRawSettings();
    emailService.updateConfig(rawUpdated);
    return await this.getSettings();
  }
}

module.exports = new SettingsService();
