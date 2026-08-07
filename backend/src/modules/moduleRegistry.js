/**
 * Enterprise ERP Module Registry
 * Lists installed and pluggable domain modules
 */
const MODULE_REGISTRY = [
  {
    code: 'REQUEST_MANAGEMENT',
    name: 'Department Request Management',
    category: 'Procurement & Requisition',
    status: 'ACTIVE',
    version: '1.0.0',
    description: 'Department requisition creation, sequence numbers, dynamic item calculator, approvals, attachments, PDF/Excel reporting.',
    path: '/requests'
  },
  {
    code: 'INVENTORY_MANAGEMENT',
    name: 'Inventory & Stock Control',
    category: 'Supply Chain',
    status: 'PLUGGABLE',
    version: '1.0.0-draft',
    description: 'Stock ledger, warehouse locations, reorder alerts, material master.',
    path: '/inventory'
  },
  {
    code: 'PURCHASING_MANAGEMENT',
    name: 'Purchase Order Management',
    category: 'Procurement',
    status: 'PLUGGABLE',
    version: '1.0.0-draft',
    description: 'Vendor RFQs, Purchase Orders, Goods Receipt Notes (GRN), 3-Way Matching.',
    path: '/purchasing'
  },
  {
    code: 'HUMAN_RESOURCES',
    name: 'HR & Payroll Management',
    category: 'Human Capital',
    status: 'PLUGGABLE',
    version: '1.0.0-draft',
    description: 'Employee Directory, Leave Management, Attendance, Payroll Processing.',
    path: '/hr'
  },
  {
    code: 'FINANCIAL_ACCOUNTING',
    name: 'General Ledger & Accounts',
    category: 'Finance',
    status: 'PLUGGABLE',
    version: '1.0.0-draft',
    description: 'Chart of Accounts, Journal Entries, Accounts Payable/Receivable, Balance Sheet.',
    path: '/accounting'
  }
];

module.exports = { MODULE_REGISTRY };
