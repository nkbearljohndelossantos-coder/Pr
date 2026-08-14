const bcrypt = require('bcryptjs');
const departmentRepository = require('../repositories/departmentRepository');
const userRepository = require('../repositories/userRepository');
const db = require('../config/db');

class DepartmentService {
  async getAllDepartments() {
    return await departmentRepository.findAll();
  }

  async createDepartment({ code, name, username, password, created_by }) {
    const existingCode = await departmentRepository.findByCode(code);
    if (existingCode) {
      throw new Error(`Department Code '${code}' already exists.`);
    }

    const hash = await bcrypt.hash(password || 'password123', 10);
    const deptId = await departmentRepository.create({ code, name, username, password_hash: hash, created_by });

    // Also register user account for department
    await db.query(
      `INSERT INTO users (username, password_hash, role, department_id, full_name, email)
       VALUES (?, ?, 'department', ?, ?, ?)`,
      [username, hash, deptId, name, `${code.toLowerCase()}@company.com`]
    );

    return deptId;
  }

  async updateDepartment(id, { code, name, username, password, is_active, updated_by }) {
    const existing = await departmentRepository.findById(id);
    if (!existing) throw new Error('Department not found.');

    let hash = null;
    if (password && password.trim() !== '') {
      hash = await bcrypt.hash(password.trim(), 10);
    }

    await departmentRepository.update(id, {
      code,
      name,
      username,
      password_hash: hash,
      is_active,
      updated_by
    });

    // Also update associated user account in users table
    if (existing.username || username) {
      const targetUsername = username || existing.username;
      if (hash) {
        await db.query(
          `UPDATE users SET username = ?, full_name = ?, password_hash = ? WHERE username = ? OR department_id = ?`,
          [targetUsername, name || existing.name, hash, existing.username, id]
        );
      } else {
        await db.query(
          `UPDATE users SET username = ?, full_name = ? WHERE username = ? OR department_id = ?`,
          [targetUsername, name || existing.name, existing.username, id]
        );
      }
    }
  }

  async resetPassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    await departmentRepository.updatePassword(id, hash);

    const dept = await departmentRepository.findById(id);
    if (dept) {
      await db.query(`UPDATE users SET password_hash = ? WHERE username = ?`, [hash, dept.username]);
    }
  }

  async deleteDepartment(id) {
    const dept = await departmentRepository.findById(id);
    if (dept) {
      await departmentRepository.hardDelete(id);
      await db.query(`DELETE FROM users WHERE username = ? OR department_id = ?`, [dept.username, id]);
    } else {
      await departmentRepository.hardDelete(id);
    }
  }
}

module.exports = new DepartmentService();
