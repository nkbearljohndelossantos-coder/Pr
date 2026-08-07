const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per window
  handler: (req, res) => {
    return errorResponse(res, 'Too many login attempts. Please try again after 15 minutes.', ['RateLimitExceeded'], HTTP_STATUS.TOO_MANY_REQUESTS);
  }
});

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  handler: (req, res) => {
    return errorResponse(res, 'Too many requests. Please slow down.', ['RateLimitExceeded'], HTTP_STATUS.TOO_MANY_REQUESTS);
  }
});

module.exports = { authRateLimiter, globalRateLimiter };
