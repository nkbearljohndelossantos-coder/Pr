const modules = [
  { id: 'requisitions', name: 'Department Requisitions', active: true, route: '/api/requests' },
  { id: 'inventory', name: 'Inventory & Stock Management', active: false, route: '/api/inventory' },
  { id: 'purchasing', name: 'Purchase Order Management', active: false, route: '/api/purchasing' },
  { id: 'warehouse', name: 'Warehouse & Receiving', active: false, route: '/api/warehouse' },
  { id: 'production', name: 'Production & Manufacturing', active: false, route: '/api/production' },
  { id: 'accounting', name: 'Accounts Payable & General Ledger', active: false, route: '/api/accounting' },
  { id: 'hr_payroll', name: 'Human Resources & Payroll', active: false, route: '/api/hr' },
  { id: 'fixed_assets', name: 'Asset Management', active: false, route: '/api/assets' },
  { id: 'crm', name: 'Customer Relationship Management', active: false, route: '/api/crm' },
  { id: 'compliance', name: 'Audit & Compliance', active: true, route: '/api/system/audit-logs' }
];

module.exports = {
  getModules: () => modules
};
