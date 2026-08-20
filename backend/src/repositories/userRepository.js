const db = require('../config/db');

class UserRepository {
  async findByUsername(username) {
    const [rows] = await db.query(
      `SELECT u.*, d.code as department_code, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE LOWER(u.username) = LOWER(?) AND u.is_deleted = 0`,
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
    try {
      const [rows] = await db.query(
        `SELECT u.id, u.username, u.role, u.full_name, u.email, u.is_active, u.temp_password, u.created_at, d.name as department_name, d.code as department_code
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.is_deleted = 0
         ORDER BY u.created_at DESC`
      );
      return (rows || []).map(r => ({
        ...r,
        temp_password: r.temp_password || (r.username === 'admin' ? 'admin123' : r.username === 'boss' ? 'boss123' : 'dept123')
      }));
    } catch(e) {
      const [rows] = await db.query(
        `SELECT u.id, u.username, u.role, u.full_name, u.email, u.is_active, u.created_at, d.name as department_name, d.code as department_code
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         WHERE u.is_deleted = 0
         ORDER BY u.created_at DESC`
      );
      return (rows || []).map(r => ({
        ...r,
        temp_password: (r.username === 'admin' ? 'admin123' : r.username === 'boss' ? 'boss123' : 'dept123')
      }));
    }
  }

  async updateUser(id, { username, full_name, email, role, password_hash, temp_password, is_active }) {
    const userId = Number(id);
    const user = await this.findById(userId);
    const newUsername = username ? username.trim() : (user ? user.username : null);
    const newFullName = full_name ? full_name.trim() : (user ? user.full_name : null);
    const newEmail = email !== undefined ? (email ? email.trim() : '') : (user ? user.email : '');
    const newRole = role || (user ? user.role : 'department');
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;

    if (password_hash) {
      try {
        await db.query(
          `UPDATE users SET username = ?, full_name = ?, email = ?, role = ?, password_hash = ?, temp_password = ?, is_active = ? WHERE id = ?`,
          [newUsername, newFullName, newEmail, newRole, password_hash, temp_password || null, activeVal, userId]
        );
      } catch (e) {
        await db.query(
          `UPDATE users SET username = ?, full_name = ?, email = ?, role = ?, password_hash = ?, is_active = ? WHERE id = ?`,
          [newUsername, newFullName, newEmail, newRole, password_hash, activeVal, userId]
        );
      }
    } else {
      await db.query(
        `UPDATE users SET username = ?, full_name = ?, email = ?, role = ?, is_active = ? WHERE id = ?`,
        [newUsername, newFullName, newEmail, newRole, activeVal, userId]
      );
    }
  }

  async deleteUser(id) {
    const userId = Number(id);
    const user = await this.findById(userId);
    if (user && (user.username === 'admin' || user.username === 'boss')) {
      throw new Error('System Administrator and Executive Boss root accounts cannot be deleted.');
    }

    try {
      await db.query(`UPDATE requests SET created_by = NULL WHERE created_by = ?`, [userId]);
      await db.query(`UPDATE requests SET updated_by = NULL WHERE updated_by = ?`, [userId]);
      await db.query(`UPDATE requests SET deleted_by = NULL WHERE deleted_by = ?`, [userId]);
      await db.query(`DELETE FROM notifications WHERE user_id = ?`, [userId]);
    } catch (e) {}

    await db.query(`DELETE FROM users WHERE id = ?`, [userId]);
  }
}

module.exports = new UserRepository();
