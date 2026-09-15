const ROLES = {
  SYSTEM_ADMIN: 'admin',
  EXEC_ADMIN: 'executive',
  PURCHASING: 'purchasing',
  DEPARTMENT: 'department'
};

const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: 'System Administrator (IT)',
  [ROLES.EXEC_ADMIN]: 'Executive Administrator',
  [ROLES.PURCHASING]: 'Purchasing & Procurement Officer',
  [ROLES.DEPARTMENT]: 'Department Account'
};

module.exports = { ROLES, ROLE_LABELS };
