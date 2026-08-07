const departmentService = require('../services/departmentService');
const { successResponse, errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

class DepartmentController {
  async getAll(req, res, next) {
    try {
      const depts = await departmentService.getAllDepartments();
      return successResponse(res, 'Departments retrieved', depts);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { code, name, username, password } = req.body;
      if (!code || !name || !username) {
        return errorResponse(res, 'Department Code, Name, and Username are required', ['ValidationFailed'], HTTP_STATUS.BAD_REQUEST);
      }

      const id = await departmentService.createDepartment({ code, name, username, password, created_by: req.user.id });
      return successResponse(res, 'Department created successfully', { id }, HTTP_STATUS.CREATED);
    } catch (err) {
      return errorResponse(res, err.message, ['DepartmentCreationError'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;
      await departmentService.updateDepartment(id, { name, is_active, updated_by: req.user.id });
      return successResponse(res, 'Department updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (!password) {
        return errorResponse(res, 'New password is required', ['ValidationFailed'], HTTP_STATUS.BAD_REQUEST);
      }

      await departmentService.resetPassword(id, password);
      return successResponse(res, 'Department password reset successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DepartmentController();
