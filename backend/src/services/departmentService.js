const bcrypt = require('bcryptjs');
const departmentRepository = require('../repositories/departmentRepository');

class DepartmentService {
  async getAllDepartments() {
    return await departmentRepository.findAll();
  }

  async createDepartment({ code, name, username, password, created_by }) {
    const cleanCode = (code || '').toUpperCase().trim();
    const cleanUsername = (username || '').trim();
    if (!cleanCode || !name || !cleanUsername) {
      throw new Error('Department code, name, and username are required.');
    }

    const existingCode = await departmentRepository.findByCode(cleanCode);
    if (existingCode) throw new Error(`Department code '${cleanCode}' already exists.`);

    const password_hash = bcrypt.hashSync(password || 'password123', 10);
    const id = await departmentRepository.create({ code: cleanCode, name, username: cleanUsername, password_hash, created_by });
    return await departmentRepository.findById(id);
  }

  async updateDepartment(id, { name, is_active, updated_by }) {
    await departmentRepository.update(id, { name, is_active, updated_by });
    return await departmentRepository.findById(id);
  }

  async resetPassword(id, newPassword) {
    const password_hash = bcrypt.hashSync(newPassword, 10);
    await departmentRepository.updatePassword(id, password_hash);
  }
}

module.exports = new DepartmentService();
