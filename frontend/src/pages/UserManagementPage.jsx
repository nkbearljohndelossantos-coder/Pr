import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Lock, Edit3, KeyRound } from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function UserManagementPage() {
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('department');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getUsers();
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      addToast('Failed to load user accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setUsername(user.username || '');
    setFullName(user.full_name || '');
    setEmail(user.email || '');
    setRole(user.role || 'department');
    setPassword('');
    setEditModalOpen(true);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await systemApi.updateUser(selectedUser.id, {
        username,
        full_name: fullName,
        email,
        role,
        password: password && password.trim() !== '' ? password.trim() : undefined
      });

      addToast(`Credentials for user '${username}' updated successfully!`, 'success');
      setEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user credentials.', 'error');
    }
  };

  const columns = [
    { header: 'Full Name', key: 'full_name', sortable: true, render: (r) => <span className="font-bold text-slate-800">{r.full_name}</span> },
    { header: 'Username', key: 'username', sortable: true, render: (r) => <span className="font-mono text-blue-600 font-semibold">{r.username}</span> },
    {
      header: 'Role Access Level',
      key: 'role',
      sortable: true,
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          r.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
          r.role === 'executive' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
          'bg-slate-100 text-slate-700'
        }`}>
          {r.role}
        </span>
      )
    },
    { header: 'Department', key: 'department_name', render: (r) => r.department_name || 'System Level' },
    { header: 'Email', key: 'email' },
    {
      header: 'Status',
      key: 'is_active',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {r.is_active ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (r) => (
        <button
          onClick={() => handleOpenEditModal(r)}
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold transition-colors"
          title="Edit Credentials & Role"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Credentials</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800">User & Role-Based Access Control (RBAC)</h1>
        <p className="text-xs text-slate-500">System Admin Control Center for Managing User Credentials, Roles, and Passwords</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-erp p-4 border-l-4 border-l-purple-600">
          <h3 className="text-xs font-bold text-slate-800 uppercase">1. System Administrator (IT)</h3>
          <p className="text-[11px] text-slate-500 mt-1">Full system control, credentials editing, master data, audit logs, and backup snapshots.</p>
        </div>
        <div className="card-erp p-4 border-l-4 border-l-blue-600">
          <h3 className="text-xs font-bold text-slate-800 uppercase">2. Executive Administrator (Boss)</h3>
          <p className="text-[11px] text-slate-500 mt-1">Cross-department request viewing, global dashboards, approval/rejection permissions, executive reports.</p>
        </div>
        <div className="card-erp p-4 border-l-4 border-l-emerald-600">
          <h3 className="text-xs font-bold text-slate-800 uppercase">3. Department Account</h3>
          <p className="text-[11px] text-slate-500 mt-1">Departmental accounts for requisition creation, status tracking, attachments, and PDF printing.</p>
        </div>
      </div>

      <DataTable columns={columns} data={users} totalCount={users.length} loading={loading} />

      {/* Edit User Credentials Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Edit3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Edit User Credentials & Role</h3>
            </div>
            <form onSubmit={handleEditUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono text-blue-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Access Role Level *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                >
                  <option value="department">DEPARTMENT USER</option>
                  <option value="executive">EXECUTIVE (BOSS / APPROVER)</option>
                  <option value="admin">SYSTEM ADMINISTRATOR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">New Password (Leave blank to keep existing password)</label>
                <input
                  type="password"
                  placeholder="Enter new password if resetting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 border rounded font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Save Credentials</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
