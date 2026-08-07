import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  ListOrdered,
  Building2,
  Users,
  Database,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  Boxes,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const [requestsOpen, setRequestsOpen] = useState(true);

  const isAdmin = user?.role === 'admin';
  const isExec = user?.role === 'executive';

  return (
    <aside className="w-64 bg-sidebar text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-700/60 bg-slate-900/50">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide leading-none">ENTERPRISE ERP</h1>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Requisition Platform</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>

        {/* Requests Submenu */}
        <div>
          <button
            onClick={() => setRequestsOpen(!requestsOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <FilePlus className="w-4 h-4" />
              <span>Request Management</span>
            </div>
            {requestsOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </button>

          {requestsOpen && (
            <div className="ml-7 mt-1 space-y-1 border-l border-slate-700/80 pl-2">
              <NavLink
                to="/requests/new"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                  }`
                }
              >
                + New Request
              </NavLink>

              <NavLink
                to="/requests/my"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                  }`
                }
              >
                My Department Requests
              </NavLink>

              {(isAdmin || isExec) && (
                <NavLink
                  to="/requests/all"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive ? 'bg-blue-600/30 text-blue-400 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                    }`
                  }
                >
                  All Company Requests
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* Executive Reports */}
        {(isAdmin || isExec) && (
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              }`
            }
          >
            <BarChart3 className="w-4 h-4" />
            Reports & Analytics
          </NavLink>
        )}

        {/* System Administration */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Administration</span>
            </div>

            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <Building2 className="w-4 h-4" />
              Departments
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <Users className="w-4 h-4" />
              User Accounts
            </NavLink>

            <NavLink
              to="/master-data"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <Database className="w-4 h-4" />
              Master Data Config
            </NavLink>

            <NavLink
              to="/rules"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <Sliders className="w-4 h-4" />
              Business Rules (BRE)
            </NavLink>

            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4" />
              Audit Logs
            </NavLink>

            <NavLink
              to="/backups"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <FileText className="w-4 h-4" />
              Database Backups
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              System Settings
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900/40">
        <span>ERP v1.0.0</span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Connected to API Server"></span>
      </div>
    </aside>
  );
}
