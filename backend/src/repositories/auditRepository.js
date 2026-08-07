const db = require('../config/db');

class AuditRepository {
  async findAll({ search, action, limit = 50, offset = 0 }) {
    let sql = `SELECT * FROM audit_logs WHERE 1=1`;
    const params = [];

    if (action) {
      sql += ` AND action LIKE ?`;
      params.push(`%${action}%`);
    }
    if (search) {
      sql += ` AND (username LIKE ? OR target_resource LIKE ? OR ip_address LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = new AuditRepository();
