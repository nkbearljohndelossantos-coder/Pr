const sendResponse = (res, statusCode, { success = true, message = '', data = null, errors = [] }) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString()
  });
};

const successResponse = (res, message = 'Success', data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, { success: true, message, data, errors: [] });
};

const errorResponse = (res, message = 'An error occurred', errors = [], statusCode = 400) => {
  return sendResponse(res, statusCode, { success: false, message, data: null, errors });
};

module.exports = {
  sendResponse,
  successResponse,
  errorResponse
};
