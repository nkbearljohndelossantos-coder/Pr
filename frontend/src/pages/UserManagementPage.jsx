import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Lock, 
  Key, 
  Printer, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  FileText, 
  Building2 
} from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function UserManagementPage() {
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [printSlipModalOpen, setPrintSlipModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('department');
  const [editPassword, setEditPassword] = useState('');

  // Dedicated Password Change Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    setEditPassword('');
    setEditModalOpen(true);
  };

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setPasswordModalOpen(true);
  };

  const handleOpenPrintSlip = (user) => {
    setSelectedUser(user);
    setPrintSlipModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let pass = 'Pr@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '26!';
    setNewPassword(pass);
    setConfirmPassword(pass);
    setShowPassword(true);
    addToast('Generated strong password template.', 'info');
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
        password: editPassword && editPassword.trim() !== '' ? editPassword.trim() : undefined
      });

      addToast(`Credentials for user '${username}' updated successfully!`, 'success');
      setEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user credentials.', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!newPassword || newPassword.trim().length < 4) {
      addToast('Password must be at least 4 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    try {
      await systemApi.updateUser(selectedUser.id, {
        username: selectedUser.username,
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        role: selectedUser.role,
        password: newPassword.trim()
      });

      addToast(`Password for '${selectedUser.full_name} (${selectedUser.username})' updated successfully!`, 'success');
      setPasswordModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user password.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await systemApi.deleteUser(selectedUser.id);
      addToast(`User account '${selectedUser.username}' deleted successfully.`, 'success');
      setDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (e) {
      addToast('Failed to delete user account.', 'error');
    }
  };

  const handlePrintRoster = () => {
    window.print();
  };

  const [visiblePasswords, setVisiblePasswords] = useState({});

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'info');
  };

  const columns = [
    { 
      header: 'Full Name', 
      key: 'full_name', 
      sortable: true, 
      render: (r) => (
        <div>
          <span className="font-bold text-slate-800 block">{r.full_name}</span>
          <span className="text-[10px] text-slate-400 font-mono">User ID: #{r.id}</span>
        </div>
      ) 
    },
    { 
      header: 'Username', 
      key: 'username', 
      sortable: true, 
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
            {r.username}
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(r.username, 'Username')}
            className="text-slate-400 hover:text-blue-600 print:hidden"
            title="Copy Username"
          >
            📋
          </button>
        </div>
      ) 
    },
    {
      header: 'Access Password',
      key: 'temp_password',
      render: (r) => {
        const pass = r.temp_password || (r.username === 'admin' ? 'admin123' : r.username === 'boss' ? 'boss123' : 'dept123');
        const isVisible = Boolean(visiblePasswords[r.id]);

        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
              {isVisible ? pass : '••••••••'}
            </span>
            <button
              type="button"
              onClick={() => togglePasswordVisibility(r.id)}
              className="text-slate-400 hover:text-slate-700 print:hidden"
              title={isVisible ? 'Hide Password' : 'Show Password'}
            >
              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(pass, 'Password')}
              className="text-slate-400 hover:text-amber-600 print:hidden"
              title="Copy Password"
            >
              📋
            </button>
          </div>
        );
      }
    },
    {
      header: 'Role Access Level',
      key: 'role',
      sortable: true,
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          r.role === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
          r.role === 'executive' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
          'bg-slate-100 text-slate-700 border border-slate-300'
        }`}>
          {r.role === 'admin' ? '🛡️ SYSTEM ADMIN' : r.role === 'executive' ? '👔 EXECUTIVE' : '🏢 DEPARTMENT'}
        </span>
      )
    },
    { 
      header: 'Department', 
      key: 'department_name', 
      render: (r) => (
        <span className="font-medium text-slate-700 text-xs">
          {r.department_name || (r.role === 'admin' ? 'System Infrastructure' : 'Executive Management')}
        </span>
      ) 
    },
    { header: 'Email Address', key: 'email', render: (r) => <span className="text-slate-600 text-xs">{r.email || 'N/A'}</span> },
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
      header: 'Security Actions',
      key: 'actions',
      render: (r) => (
        <div className="flex flex-wrap items-center gap-1.5 print:hidden">
          {/* Quick Change Password Button */}
          <button
            onClick={() => handleOpenPasswordModal(r)}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-bold transition-all shadow-2xs"
            title="Change User Password"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Password</span>
          </button>

          {/* Print Credential Slip Button */}
          <button
            onClick={() => handleOpenPrintSlip(r)}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold transition-all shadow-2xs"
            title="Print User Credential Slip"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Print Slip</span>
          </button>

          {/* Edit User Info Button */}
          <button
            onClick={() => handleOpenEditModal(r)}
            className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition-colors"
            title="Edit Credentials & Role"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          
          {/* Delete User Button */}
          {r.username !== 'admin' && r.username !== 'boss' && (
            <button
              onClick={() => { setSelectedUser(r); setDeleteModalOpen(true); }}
              className="flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold transition-colors"
              title="Permanently Delete User Account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Print Master Roster Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>User & Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System Admin Security Control Center for User Credentials, Password Resets, Role Hierarchy, and Access Slip Printing
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrintRoster}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Credentials Roster</span>
          </button>
        </div>
      </div>

      {/* Role Hierarchy Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="card-erp p-4 border-l-4 border-l-purple-600 bg-linear-to-br from-white to-purple-50/30">
          <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <span>🛡️ 1. System Administrator (IT)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Full master authority: password reset, user provisioning, database backups, audit logs, and security controls.</p>
        </div>
        <div className="card-erp p-4 border-l-4 border-l-blue-600 bg-linear-to-br from-white to-blue-50/30">
          <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <span>👔 2. Executive Administrator (Boss)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Enterprise approval engine: cross-department review, executive valuation dashboards, budget approval/rejection.</p>
        </div>
        <div className="card-erp p-4 border-l-4 border-l-emerald-600 bg-linear-to-br from-white to-emerald-50/30">
          <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
            <span>🏢 3. Department User</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Operational accounts: departmental purchase requisition creation, cost estimation, file attachments, and status tracking.</p>
        </div>
      </div>

      {/* Printable Master Roster (Visible only when printing) */}
      <div className="hidden print:block mb-6">
        <div className="p-4 border-b-2 border-slate-900 text-center mb-4">
          <h2 className="text-xl font-black tracking-wider uppercase text-slate-900">NKB MANUFACTURING ENTERPRISE ERP</h2>
          <h3 className="text-sm font-bold text-slate-800 uppercase mt-1">OFFICIAL USER CREDENTIALS & SECURITY ACCESS ROSTER</h3>
          <p className="text-[10px] text-slate-600 mt-1 font-mono">Portal URL: https://pr.nkbmanufacturing.com/ | Generated: {new Date().toLocaleString()} | STRICTLY CONFIDENTIAL</p>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 font-bold text-slate-900">
              <th className="border border-slate-400 p-2 text-center w-8">#</th>
              <th className="border border-slate-400 p-2 text-left">Full Name</th>
              <th className="border border-slate-400 p-2 text-left">Username</th>
              <th className="border border-slate-400 p-2 text-left">Access Password</th>
              <th className="border border-slate-400 p-2 text-left">Role Access</th>
              <th className="border border-slate-400 p-2 text-left">Department</th>
              <th className="border border-slate-400 p-2 text-left">Signature / Acknowledgment</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const pass = u.temp_password || (u.username === 'admin' ? 'admin123' : u.username === 'boss' ? 'boss123' : 'dept123');
              return (
                <tr key={u.id} className="border-b border-slate-300">
                  <td className="border border-slate-400 p-2 text-center font-bold">{idx + 1}</td>
                  <td className="border border-slate-400 p-2 font-bold text-slate-900">{u.full_name}</td>
                  <td className="border border-slate-400 p-2 font-mono font-bold text-blue-800">{u.username}</td>
                  <td className="border border-slate-400 p-2 font-mono font-bold text-amber-900 bg-amber-50/50">{pass}</td>
                  <td className="border border-slate-400 p-2 uppercase font-semibold text-[10px]">{u.role}</td>
                  <td className="border border-slate-400 p-2 text-slate-700">{u.department_name || 'System Level'}</td>
                  <td className="border border-slate-400 p-2 text-center w-36"></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-slate-400 text-[10px] text-slate-600">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="font-bold text-slate-900">Issued By: IT Security Administrator</p>
              <p className="mt-8 border-t border-slate-400 w-52 text-center pt-1">Authorized Signature</p>
            </div>
            <div>
              <p className="font-bold text-slate-900">Approved By: Executive Management</p>
              <p className="mt-8 border-t border-slate-400 w-52 text-center pt-1">Executive Signature</p>
            </div>
          </div>
          <p className="text-center italic">This document contains sensitive enterprise login credentials. Store securely and destroy/archive in compliance with IT security policy.</p>
        </div>
      </div>

      <div className="print:hidden">
        <DataTable columns={columns} data={users} totalCount={users.length} loading={loading} />
      </div>

      {/* DEDICATED CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
                  <p className="text-[11px] text-slate-500">Update security login credentials</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Target Account Badge */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">{selectedUser?.full_name}</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  @{selectedUser?.username}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Role: <strong className="uppercase text-slate-700">{selectedUser?.role}</strong> | Dept: {selectedUser?.department_name || 'System Level'}
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">New Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new strong password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL CREDENTIAL SLIP PRINT MODAL */}
      {printSlipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">User Security Credential Handover Slip</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPrintSlipModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Slip Printable Content */}
            <div className="border-2 border-slate-900 rounded-xl p-5 bg-white space-y-4">
              <div className="text-center border-b border-slate-300 pb-3">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest block">NKB MANUFACTURING ENTERPRISE ERP</span>
                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase mt-0.5">OFFICIAL USER ACCESS CREDENTIAL SLIP</h4>
                <span className="text-[9px] text-slate-500">Security Classification: Internal & Confidential</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Employee / User Name:</span>
                  <strong className="text-slate-900 text-sm">{selectedUser?.full_name}</strong>
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">Assigned Username:</span>
                  <strong className="text-blue-800 font-mono text-base">{selectedUser?.username}</strong>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">🔑 Login Access Password:</span>
                    <span className="text-[10px] text-amber-600 font-semibold">(Case-Sensitive)</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <strong className="text-amber-900 font-mono text-base tracking-wider bg-white px-3 py-1 rounded border border-amber-300">
                      {selectedUser?.temp_password || (selectedUser?.username === 'admin' ? 'admin123' : selectedUser?.username === 'boss' ? 'boss123' : 'dept123')}
                    </strong>
                    <span className="text-[10px] text-slate-500 italic">Please change after 1st login if required</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Access Role:</span>
                  <strong className="text-slate-800 uppercase text-xs">{selectedUser?.role}</strong>
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Department:</span>
                  <strong className="text-slate-800 text-xs">{selectedUser?.department_name || 'System Level'}</strong>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1 text-amber-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Security & Compliance Notice:</span>
                </p>
                <p className="text-[10px] leading-relaxed">
                  1. Keep login credentials strictly confidential. Never share passwords with unauthorized personnel.
                </p>
                <p className="text-[10px] leading-relaxed">
                  2. Official ERP Portal URL: <strong className="text-blue-700 font-mono">https://pr.nkbmanufacturing.com/</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-[10px]">
                <div>
                  <p className="text-slate-500 font-bold">Issued By (IT Admin):</p>
                  <p className="mt-6 border-t border-slate-400 pt-1 text-center font-semibold">IT Security Officer</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold">Received & Acknowledged:</p>
                  <p className="mt-6 border-t border-slate-400 pt-1 text-center font-semibold">Account Holder Signature</p>
                </div>
              </div>
            </div>

            {/* Slip Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 print:hidden">
              <button 
                type="button" 
                onClick={() => setPrintSlipModalOpen(false)} 
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button 
                type="button" 
                onClick={() => window.print()} 
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
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

      {/* Delete User Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Delete User Account?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to permanently delete <strong>{selectedUser?.full_name} ({selectedUser?.username})</strong>? This user account will no longer have access to the system.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-1.5 border rounded text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleConfirmDelete} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow-sm">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
