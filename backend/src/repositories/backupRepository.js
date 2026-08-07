const db = require('../config/db');

class BackupRepository {
  async create({ filename, filepath, filesize, created_by }) {
    const [res] = await db.query(
      `INSERT INTO backups (filename, filepath, filesize, created_by) VALUES (?, ?, ?, ?)`,
      [filename, filepath, filesize, created_by]
    );
    return res.insertId;
  }

  async findAll() {
    const [rows] = await db.query(`SELECT * FROM backups ORDER BY created_at DESC`);
    return rows;
  }

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM backups WHERE id = ?`, [id]);
    return rows[0] || null;
  }
}

module.exports = new BackupRepository();
