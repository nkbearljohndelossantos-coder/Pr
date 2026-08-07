import React from 'react';
import { ShieldCheck, Users, Lock } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function UserManagementPage() {
  const users = [
    { id: 1, username: 'admin', full_name: 'System Administrator (IT)', role: 'admin', department_name: 'IT Department', email: 'admin@company.com', is_active: true },
    { id: 2, username: 'boss', full_name: 'Executive Administrator', role: 'executive', department_name: 'Executive Management', email: 'boss@company.com', is_active: true },
    { id: 3, username: 'it_dept', full_name: 'Information Technology Dept', role: 'department', department_name: 'IT Department', email: 'it@company.com', is_active: true },
    { id: 4, username: 'hr_dept', full_name: 'Human Resources Dept', role: 'department', department_name: 'HR Department', email: 'hr@company.com', is_active: true },
    { id: 5, username: 'acct_dept', full_name: 'Accounting Dept', role: 'department', department_name: 'Accounting Department', email: 'accounting@company.com', is_active: true }
  ];

  const columns = [
    { header: 'Full Name', key: 'full_name', sortable: true, render: (r) => <span className="font-bold text-slate-800">{r.full_name}</span> },
    { header: 'Username', key: 'username', sortable: true, render: (r) => <span className="font-mono text-blue-600">{r.username}</span> },
    {
      header: 'Role Access Level',
      key: 'role',
      sortable: true,
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          r.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
          r.role === 'executive' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          'bg-slate-100 text-slate-700'
        }`}>
          {r.role.toUpperCase()}
        </span>
      )
    },
    { header: 'Department', key: 'department_name' },
    { header: 'Email', key: 'email' },
    {
      header: 'Status',
      key: 'is_active',
      render: (r) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Active
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800">User & Role-Based Access Control (RBAC)</h1>
        <p className="text-xs text-slate-500">Configure global System Admin, Executive Admin, and Department shared accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-erp p-4 border-l-4 border-l-purple-600">
          <h3 className="text-xs font-bold text-slate-800 uppercase">1. System Administrator (IT)</h3>
          <p className="text-[11px] text-slate-500 mt-1">Full system access, department account management, master data, audit logs, and backups.</p>
        </div>
        <div className="card-erp p-4 border-l-4 border-l-blue-600">
          <h3 className="text-xs font-bold text-slate-800 uppercase">2. Executive Administrator (Boss)</h3>
          <p className="text-[11px] text-slate-500 mt-1">Cross-department request viewing, global dashboards, approval/rejection permissions, executive reports.</p>
        </div>
        <div className="card-erp p-4 border-l-4 border-l-emerald-600">
          <h3 className="text-xs font-bold text-slate-800 uppercase">3. Department Account</h3>
          <p className="text-[11px] text-slate-500 mt-1">Shared departmental accounts for requisition creation, status tracking, attachments, and PDF printing.</p>
        </div>
      </div>

      <DataTable columns={columns} data={users} totalCount={users.length} />
    </div>
  );
}
