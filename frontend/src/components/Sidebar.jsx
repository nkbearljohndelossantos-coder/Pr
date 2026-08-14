import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Building2, 
  Users, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Database,
  Layers,
  Sliders,
  Archive
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [requestMenuOpen, setRequestMenuOpen] = useState(true);

  const isAdmin = user?.role === 'admin';
  const isExec = user?.role === 'executive';

  return (
    <aside className="w-64 bg-[#1E293B] text-white flex flex-col fixed inset-y-0 left-0 z-30 select-none shadow-lg">
      {/* Brand Header - LOGO ONLY (PROMINENT & LARGE) */}
      <div className="py-4 px-3 flex items-center justify-center border-b border-slate-700/80 bg-slate-950/70">
        <img
          src="/nkb-logo.png"
          alt="NKB Requisition Logo"
          className="w-52 h-auto max-h-28 object-contain mx-auto drop-shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        {/* Request Management Submenu Group */}
        <div>
          <button
            onClick={() => setRequestMenuOpen(!requestMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#334155] hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Request Management</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${requestMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {requestMenuOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-slate-700/80 space-y-1">
              <NavLink
                to="/requests/new"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Request</span>
              </NavLink>

              <NavLink
                to="/requests"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive && !location.search ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{user?.role === 'department' ? 'My Requests' : 'All Requests'}</span>
              </NavLink>

              <NavLink
                to="/requests?status=Submitted"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    location.search.includes('Submitted') ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending Approvals</span>
              </NavLink>

              <NavLink
                to="/requests?status=Approved"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    location.search.includes('Approved') ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Approved</span>
              </NavLink>

              <NavLink
                to="/requests?status=Rejected"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    location.search.includes('Rejected') ? 'bg-[#2563EB] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Rejected</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* System Admin Sections */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Administration
            </div>

            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
                }`
              }
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Department Management</span>
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
                }`
              }
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>User & Role RBAC</span>
            </NavLink>

            <NavLink
              to="/master-data"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
                }`
              }
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>Master Data Manager</span>
            </NavLink>

            <NavLink
              to="/backups"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
                }`
              }
            >
              <Archive className="w-4 h-4 text-emerald-400" />
              <span>Backup & Recovery</span>
            </NavLink>
          </>
        )}

        {/* Global Reports & Audit */}
        <div className="pt-3 pb-1 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Intelligence & Logs
        </div>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
            }`
          }
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Enterprise Reports</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/audit-logs"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
              }`
            }
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Audit Trail Logs</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-300 hover:bg-[#334155] hover:text-white'
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>System Settings</span>
          </NavLink>
        )}
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-t border-slate-700/60 bg-slate-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 border border-slate-600 shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || user?.username}</p>
              <p className="text-[10px] text-slate-400 uppercase font-medium truncate">{user?.role || 'user'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
