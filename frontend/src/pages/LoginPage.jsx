import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, Building2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const user = await login(username, password);
      addToast(`Welcome back, ${user.full_name}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    }
  };

  const fillQuickAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0f172a] p-6 text-white text-center border-b border-slate-700 flex flex-col items-center justify-center">
          <img
            src="/nkb-logo.png"
            alt="NKB Requisition Logo"
            className="w-56 max-h-36 object-contain mx-auto mb-1 drop-shadow-lg hover:scale-105 transition-transform duration-300"
          />
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mt-1">
            Enterprise Requisition System
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Username / Dept Code
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, boss, it_dept"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to ERP System'}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Roles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount('admin', 'admin123')}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-slate-800">System Admin</p>
                <p className="text-[10px] text-slate-400">admin / admin123</p>
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount('boss', 'boss123')}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-slate-800">Executive</p>
                <p className="text-[10px] text-slate-400">boss / boss123</p>
              </button>

              <button
                type="button"
                onClick={() => fillQuickAccount('it_dept', 'password123')}
                className="p-2 border border-slate-200 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
              >
                <p className="text-[11px] font-bold text-slate-800">IT Department</p>
                <p className="text-[10px] text-slate-400">it_dept / password123</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Enterprise ERP System v1.0 • Secure JWT RBAC Authenticated
        </div>
      </div>
    </div>
  );
}
