const db = require('../config/db');

class MasterDataRepository {
  async findByCategory(category) {
    const [rows] = await db.query(
      `SELECT * FROM master_dropdowns WHERE category = ? AND is_active = 1 ORDER BY sort_order ASC`,
      [category]
    );
    return rows;
  }

  async findAll() {
    const [rows] = await db.query(`SELECT * FROM master_dropdowns ORDER BY category ASC, sort_order ASC`);
    return rows;
  }

  async create({ category, code, label, sort_order }) {
    const [res] = await db.query(
      `INSERT INTO master_dropdowns (category, code, label, sort_order) VALUES (?, ?, ?, ?)`,
      [category, code, label, sort_order || 0]
    );
    return res.insertId;
  }

  async toggleActive(id, is_active) {
    await db.query(`UPDATE master_dropdowns SET is_active = ? WHERE id = ?`, [is_active ? 1 : 0, id]);
  }
}

module.exports = new MasterDataRepository();
