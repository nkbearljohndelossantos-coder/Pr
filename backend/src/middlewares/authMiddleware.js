const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return errorResponse(res, 'Access denied. No token provided.', ['Unauthorized'], HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token.', [err.message], HTTP_STATUS.UNAUTHORIZED);
  }
};

module.exports = { authenticateToken };
