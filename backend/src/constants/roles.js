const ROLES = {
  SYSTEM_ADMIN: 'admin',
  EXEC_ADMIN: 'executive',
  DEPARTMENT: 'department'
};

const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: 'System Administrator (IT)',
  [ROLES.EXEC_ADMIN]: 'Executive Administrator',
  [ROLES.DEPARTMENT]: 'Department Account'
};

module.exports = { ROLES, ROLE_LABELS };
