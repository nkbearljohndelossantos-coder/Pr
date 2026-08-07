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

  async updateDepartment(id, { name, is_active, updated_by }) {
    await departmentRepository.update(id, { name, is_active, updated_by });
  }

  async resetPassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    await departmentRepository.updatePassword(id, hash);

    const dept = await departmentRepository.findById(id);
    if (dept) {
      await db.query(`UPDATE users SET password_hash = ? WHERE username = ?`, [hash, dept.username]);
    }
  }
}

module.exports = new DepartmentService();
