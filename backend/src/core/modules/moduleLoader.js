const logger = require('../../utils/logger');

const modules = [
  { id: 'requisitions', name: 'Department Request Management', version: '1.0.0', active: true, route: '/api/v1/requests' },
  { id: 'inventory', name: 'Inventory & Stock Management', version: '1.0.0', active: false, route: '/api/v1/inventory' },
  { id: 'purchasing', name: 'Purchase Order Management', version: '1.0.0', active: false, route: '/api/v1/purchasing' },
  { id: 'warehouse', name: 'Warehouse & Receiving', version: '1.0.0', active: false, route: '/api/v1/warehouse' },
  { id: 'production', name: 'Production & Manufacturing', version: '1.0.0', active: false, route: '/api/v1/production' },
  { id: 'accounting', name: 'Accounts Payable & General Ledger', version: '1.0.0', active: false, route: '/api/v1/accounting' },
  { id: 'hr_payroll', name: 'Human Resources & Payroll', version: '1.0.0', active: false, route: '/api/v1/hr' },
  { id: 'fixed_assets', name: 'Fixed Asset Management', version: '1.0.0', active: false, route: '/api/v1/assets' },
  { id: 'crm', name: 'Customer Relationship Management', version: '1.0.0', active: false, route: '/api/v1/crm' },
  { id: 'compliance', name: 'Security Audit & Compliance', version: '1.0.0', active: true, route: '/api/v1/system/audit-logs' }
];

module.exports = {
  loadModules: (app) => {
    logger.info(`[ModuleLoader] ERP Core loaded ${modules.filter(m => m.active).length} active modules.`);
    return modules;
  },
  getModules: () => modules
};
