const db = require('../config/db');

class DepartmentRepository {
  async findAll() {
    const [rows] = await db.query(
      `SELECT * FROM departments WHERE is_deleted = 0 ORDER BY name ASC`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM departments WHERE id = ? AND is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  }

  async findByCode(code) {
    const [rows] = await db.query(
      `SELECT * FROM departments WHERE code = ? AND is_deleted = 0`,
      [code]
    );
    return rows[0] || null;
  }

  async create({ code, name, username, password_hash, created_by }) {
    const [res] = await db.query(
      `INSERT INTO departments (code, name, username, password_hash, created_by) VALUES (?, ?, ?, ?, ?)`,
      [code.toUpperCase().trim(), name.trim(), username.trim(), password_hash, created_by || null]
    );
    return res.insertId;
  }

  async update(id, { code, name, username, password_hash, is_active, updated_by }) {
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : null;
    if (password_hash) {
      await db.query(
        `UPDATE departments SET code = COALESCE(?, code), name = COALESCE(?, name), username = COALESCE(?, username), password_hash = ?, is_active = COALESCE(?, is_active), updated_by = ? WHERE id = ?`,
        [code ? code.toUpperCase().trim() : null, name ? name.trim() : null, username ? username.trim() : null, password_hash, activeVal, updated_by || null, id]
      );
    } else {
      await db.query(
        `UPDATE departments SET code = COALESCE(?, code), name = COALESCE(?, name), username = COALESCE(?, username), is_active = COALESCE(?, is_active), updated_by = ? WHERE id = ?`,
        [code ? code.toUpperCase().trim() : null, name ? name.trim() : null, username ? username.trim() : null, activeVal, updated_by || null, id]
      );
    }
  }

  async updatePassword(id, password_hash) {
    await db.query(
      `UPDATE departments SET password_hash = ? WHERE id = ?`,
      [password_hash, id]
    );
  }

  async incrementSeqCounter(id) {
    const dept = await this.findById(id);
    if (!dept) return 1;
    const newSeq = (dept.seq_counter || 0) + 1;
    await db.query(`UPDATE departments SET seq_counter = ? WHERE id = ?`, [newSeq, id]);
    return newSeq;
  }

  async softDelete(id) {
    await db.query(`UPDATE departments SET is_deleted = 1, is_active = 0 WHERE id = ?`, [id]);
  }
}

module.exports = new DepartmentRepository();
