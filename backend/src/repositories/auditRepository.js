const db = require('../config/db');

class AuditRepository {
  async findAll({ limit = 100, offset = 0 }) {
    const [rows] = await db.query(
      `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    return rows;
  }
}

module.exports = new AuditRepository();
