const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

const globalErrorHandler = (err, req, res, next) => {
  logger.error(`[Unhandled Error] ${err.stack || err.message}`);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal server error occurred. Please contact system administrator.' 
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, [err.name || 'ServerError'], statusCode);
};

module.exports = globalErrorHandler;
