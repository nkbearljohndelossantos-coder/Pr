const departmentService = require('../services/departmentService');
const { successResponse, errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

class DepartmentController {
  async getAll(req, res, next) {
    try {
      const depts = await departmentService.getAllDepartments();
      return successResponse(res, 'Departments retrieved successfully.', depts);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { code, name, username, password } = req.body;
      if (!code || !name || !username) {
        return errorResponse(res, 'Code, name, and username are required.', ['ValidationError'], HTTP_STATUS.BAD_REQUEST);
      }
      const dept = await departmentService.createDepartment({
        code,
        name,
        username,
        password,
        created_by: req.user.id
      });
      return successResponse(res, 'Department created successfully.', dept, HTTP_STATUS.CREATED);
    } catch (err) {
      return errorResponse(res, err.message, ['CreateFailed'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, is_active } = req.body;
      const updated = await departmentService.updateDepartment(id, {
        name,
        is_active,
        updated_by: req.user.id
      });
      return successResponse(res, 'Department updated successfully.', updated);
    } catch (err) {
      return errorResponse(res, err.message, ['UpdateFailed'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (!password || password.length < 6) {
        return errorResponse(res, 'Password must be at least 6 characters long.', ['ValidationError'], HTTP_STATUS.BAD_REQUEST);
      }
      await departmentService.resetPassword(id, password);
      return successResponse(res, 'Department password reset successfully.');
    } catch (err) {
      return errorResponse(res, err.message, ['ResetFailed'], HTTP_STATUS.BAD_REQUEST);
    }
  }
}

module.exports = new DepartmentController();
