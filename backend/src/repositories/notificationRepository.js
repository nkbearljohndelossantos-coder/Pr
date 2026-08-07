const db = require('../config/db');

class NotificationRepository {
  async create({ user_id, department_id, title, message, type }) {
    const [res] = await db.query(
      `INSERT INTO notifications (user_id, department_id, title, message, type) VALUES (?, ?, ?, ?, ?)`,
      [user_id || null, department_id || null, title, message, type || 'info']
    );
    return res.insertId;
  }

  async findForUser(userId, deptId) {
    const [rows] = await db.query(
      `SELECT * FROM notifications 
       WHERE (user_id = ? OR department_id = ? OR (user_id IS NULL AND department_id IS NULL))
       ORDER BY created_at DESC LIMIT 20`,
      [userId || 0, deptId || 0]
    );
    return rows;
  }

  async markAsRead(id) {
    await db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
  }
}

module.exports = new NotificationRepository();
