const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return errorResponse(res, 'Username and password are required', ['ValidationFailed'], HTTP_STATUS.BAD_REQUEST);
      }

      const result = await authService.login(username, password);
      return successResponse(res, 'Login successful', result);
    } catch (err) {
      return errorResponse(res, err.message, ['AuthenticationError'], HTTP_STATUS.UNAUTHORIZED);
    }
  }

  async me(req, res, next) {
    try {
      return successResponse(res, 'Current user profile retrieved', { user: req.user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
