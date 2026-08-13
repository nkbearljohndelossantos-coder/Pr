const db = require('../config/db');

class UserRepository {
  async findByUsername(username) {
    const [rows] = await db.query(
      `SELECT u.*, d.code as department_code, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.username = ? AND u.is_deleted = 0`,
      [username]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT u.*, d.code as department_code, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.id = ? AND u.is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  }

  async updateRefreshToken(id, refreshToken) {
    try {
      await db.query(`UPDATE users SET refresh_token = ? WHERE id = ?`, [refreshToken, id]);
    } catch (e) {
      // Fail-safe ignore if refresh_token column is missing
    }
  }

  async findAll() {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.role, u.full_name, u.email, u.is_active, u.created_at, d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.is_deleted = 0
       ORDER BY u.created_at DESC`
    );
    return rows;
  }
}

module.exports = new UserRepository();
