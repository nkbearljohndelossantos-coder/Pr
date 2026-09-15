const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const logger = require('../utils/logger');

async function exportAllData() {
  console.log('🔄 Exporting all Enterprise ERP data for VPS Migration...');
  const exportDir = path.join(__dirname, '../../../backups');
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(exportDir, `erp_migration_backup_${timestamp}.json`);

  try {
    const [departments] = await db.query('SELECT * FROM departments');
    const [users] = await db.query('SELECT id, username, role, department_id, full_name, email, is_active FROM users');
    const [requests] = await db.query('SELECT * FROM requests');
    const [request_items] = await db.query('SELECT * FROM request_items');
    const [attachments] = await db.query('SELECT id, request_id, original_name, filename, file_path, file_type, file_size FROM attachments');
    const [master_dropdowns] = await db.query('SELECT * FROM master_dropdowns');

    const fullDump = {
      export_timestamp: new Date().toISOString(),
      departments,
      users,
      requests,
      request_items,
      attachments,
      master_dropdowns
    };

    fs.writeFileSync(backupFile, JSON.stringify(fullDump, null, 2), 'utf8');
    console.log(`✅ Data Export Completed! Saved to: ${backupFile}`);
    console.log(`📊 Export Summary: ${users.length} users, ${departments.length} departments, ${requests.length} requests, ${attachments.length} attachments.`);
  } catch (err) {
    console.error('❌ Data export notice:', err.message);
  } finally {
    process.exit(0);
  }
}

exportAllData();