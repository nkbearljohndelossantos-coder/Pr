const { ROLES } = require('../constants/roles');
const { errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        'Access forbidden. You do not have permission to access this resource.',
        ['Forbidden'],
        HTTP_STATUS.FORBIDDEN
      );
    }
    next();
  };
};

const isAdmin = authorizeRoles(ROLES.SYSTEM_ADMIN);
const isExecOrAdmin = authorizeRoles(ROLES.SYSTEM_ADMIN, ROLES.EXEC_ADMIN);
const isDept = authorizeRoles(ROLES.DEPARTMENT, ROLES.SYSTEM_ADMIN);

module.exports = {
  authorizeRoles,
  isAdmin,
  isExecOrAdmin,
  isDept
};
