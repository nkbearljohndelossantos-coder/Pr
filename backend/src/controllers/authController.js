const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return errorResponse(res, 'Username and password are required.', ['ValidationError'], HTTP_STATUS.BAD_REQUEST);
      }
      const result = await authService.login(username, password);
      return successResponse(res, 'Login successful.', result);
    } catch (err) {
      return errorResponse(res, err.message, ['AuthFailed'], HTTP_STATUS.UNAUTHORIZED);
    }
  }

  async me(req, res) {
    return successResponse(res, 'Current authenticated user retrieved.', req.user);
  }
}

module.exports = new AuthController();
