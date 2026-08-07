const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const backupRepository = require('../repositories/backupRepository');
const env = require('../config/env');

class BackupService {
  async createBackup(username = 'admin') {
    const backupDir = env.BACKUP_DIR;
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `erp_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Extract all database data tables into a JSON snapshot
    const [departments] = await db.query('SELECT * FROM departments');
    const [users] = await db.query('SELECT * FROM users');
    const [requests] = await db.query('SELECT * FROM requests');
    const [requestItems] = await db.query('SELECT * FROM request_items');
    const [attachments] = await db.query('SELECT * FROM attachments');
    const [masterDropdowns] = await db.query('SELECT * FROM master_dropdowns');
    const [auditLogs] = await db.query('SELECT * FROM audit_logs');

    const backupContent = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      system: env.COMPANY_NAME,
      data: {
        departments,
        users: users.map(u => ({ ...u, password_hash: '***HIDDEN***' })),
        requests,
        requestItems,
        attachments,
        masterDropdowns,
        auditLogs
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(backupContent, null, 2), 'utf-8');
    const stats = fs.statSync(filepath);

    const backupId = await backupRepository.create({
      filename,
      filepath,
      filesize: stats.size,
      created_by: username
    });

    return await backupRepository.findById(backupId);
  }

  async getAllBackups() {
    return await backupRepository.findAll();
  }
}

module.exports = new BackupService();
