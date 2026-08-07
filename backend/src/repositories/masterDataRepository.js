const db = require('../config/db');

class MasterDataRepository {
  async getDropdownsByCategory(category) {
    const [rows] = await db.query(
      `SELECT * FROM master_dropdowns WHERE category = ? AND is_active = 1 ORDER BY sort_order ASC`,
      [category]
    );
    return rows;
  }

  async getAllDropdowns() {
    const [rows] = await db.query(`SELECT * FROM master_dropdowns ORDER BY category ASC, sort_order ASC`);
    return rows;
  }

  async addDropdown({ category, code, label, sort_order }) {
    const [res] = await db.query(
      `INSERT INTO master_dropdowns (category, code, label, sort_order) VALUES (?, ?, ?, ?)`,
      [category.toLowerCase().trim(), code.toUpperCase().trim(), label.trim(), sort_order || 0]
    );
    return res.insertId;
  }

  async toggleDropdown(id, is_active) {
    await db.query(`UPDATE master_dropdowns SET is_active = ? WHERE id = ?`, [is_active ? 1 : 0, id]);
  }
}

module.exports = new MasterDataRepository();
