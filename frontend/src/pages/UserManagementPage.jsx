import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, KeyRound } from 'lucide-react';
import DataTable from '../components/DataTable';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function UserManagementPage() {
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'department', full_name: '', email: '' });

  const initialAccounts = [
    { id: 'a1000000-0000-4000-a000-000000000001', username: 'admin', role: 'admin', full_name: 'System Administrator (IT)', email: 'admin@company.com', is_active: 1 },
    { id: 'a1000000-0000-4000-a000-000000000002', username: 'boss', role: 'executive', full_name: 'Executive Administrator', email: 'boss@company.com', is_active: 1 },
    { id: 'a1000000-0000-4000-a000-000000000003', username: 'it_dept', role: 'department', full_name: 'Information Technology Dept', email: 'it@company.com', is_active: 1 }
  ];

  useEffect(() => {
    setUsers(initialAccounts);
    setLoading(false);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    const newAcc = {
      id: `a_${Date.now()}`,
      username: formData.username,
      role: formData.role,
      full_name: formData.full_name,
      email: formData.email,
      is_active: 1
    };
    setUsers([...users, newAcc]);
    addToast(`Account '${formData.username}' created successfully!`, 'success');
    setShowModal(false);
    setFormData({ username: '', password: '', role: 'department', full_name: '', email: '' });
  };

  const columns = [
    {
      header: 'Account UUID / ID',
      accessor: 'id',
      render: (row) => <span className="font-mono text-[10px] text-slate-500">{String(row.id).slice(0, 8)}...</span>
    },
    {
      header: 'Username',
      accessor: 'username',
      render: (row) => <span className="font-bold text-slate-800">{row.username}</span>
    },
    { header: 'Full Display Name', accessor: 'full_name' },
    { header: 'Corporate Email', accessor: 'email' },
    {
      header: 'Account Type Role',
      accessor: 'role',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${row.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : row.role === 'executive' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
          {row.role}
        </span>
      )
    },
    {
      header: 'Security Status',
      accessor: 'is_active',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Active
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Account Management & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage system administrator, executive boss, and shared department user accounts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Create User Account
        </button>
      </div>

      <DataTable columns={columns} data={users} loading={loading} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Create New Enterprise Account</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Role Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="department">Department Account</option>
                  <option value="executive">Executive Administrator (Boss)</option>
                  <option value="admin">System Administrator (IT)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

