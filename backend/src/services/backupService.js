const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const backupRepository = require('../repositories/backupRepository');

class BackupService {
  async triggerBackup(userId) {
    const backupDir = env.BACKUP_DIR;
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `erp_backup_${Date.now()}.sql`;
    const filepath = path.join(backupDir, filename);

    const dummySqlDump = `-- Enterprise ERP Backup Dump\n-- Generated: ${new Date().toISOString()}\n-- Company: ${env.COMPANY_NAME}\n\nSELECT 'ERP Database State Safe' as status;\n`;
    fs.writeFileSync(filepath, dummySqlDump, 'utf-8');

    const stats = fs.statSync(filepath);
    const id = await backupRepository.create({
      filename,
      filepath,
      filesize: stats.size,
      created_by: userId
    });

    return { id, filename, filepath, filesize: stats.size };
  }

  async listBackups() {
    return await backupRepository.findAll();
  }
}

module.exports = new BackupService();
