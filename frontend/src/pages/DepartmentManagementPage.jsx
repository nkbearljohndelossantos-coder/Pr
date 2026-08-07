import React, { useState, useEffect } from 'react';
import { Building2, Plus, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import { departmentApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function DepartmentManagementPage() {
  const { addToast } = useNotification();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.getAll();
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (e) {
      addToast('Failed to load departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const res = await departmentApi.create({ code, name, username, password });
      if (res.data.success) {
        addToast(`Department '${name}' created successfully!`, 'success');
        setAddModalOpen(false);
        setCode(''); setName(''); setUsername(''); setPassword('');
        fetchDepartments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create department.', 'error');
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      await departmentApi.update(dept.id, { name: dept.name, is_active: !dept.is_active });
      addToast(`Department '${dept.name}' ${dept.is_active ? 'deactivated' : 'activated'}.`, 'success');
      fetchDepartments();
    } catch (e) {
      addToast('Failed to toggle status.', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !selectedDept) return;
    try {
      await departmentApi.resetPassword(selectedDept.id, { password: newPassword });
      addToast(`Password for '${selectedDept.name}' reset successfully!`, 'success');
      setResetModalOpen(false);
      setNewPassword('');
      setSelectedDept(null);
    } catch (e) {
      addToast('Failed to reset password.', 'error');
    }
  };

  const columns = [
    { header: 'Code', key: 'code', sortable: true, render: (row) => <span className="font-bold text-blue-600">{row.code}</span> },
    { header: 'Department Name', key: 'name', sortable: true, render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
    { header: 'Login Username', key: 'username', sortable: true, render: (row) => <span className="font-mono text-slate-600">{row.username}</span> },
    { header: 'Sequence Counter', key: 'seq_counter', sortable: true, render: (row) => <span className="font-bold text-slate-700">{row.seq_counter}</span> },
    {
      header: 'Status',
      key: 'is_active',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {row.is_active ? 'Active' : 'Deactivated'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleActive(row)}
            className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
              row.is_active ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => { setSelectedDept(row); setResetModalOpen(true); }}
            className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
            title="Reset Password"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Department Account Management</h1>
          <p className="text-xs text-slate-500">System Admin Control Center for Shared Department Accounts</p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      <DataTable columns={columns} data={departments} totalCount={departments.length} loading={loading} />

      {/* Add Department Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Create New Department Account</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Department Code * (e.g. IT, HR, PROD)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Department Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Login Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 border rounded font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Reset Password for {selectedDept?.name}</h3>
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setResetModalOpen(false)} className="px-4 py-1.5 border rounded font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
