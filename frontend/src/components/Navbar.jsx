import React, { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, CheckCircle2, ShieldCheck, FileCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { systemApi } from '../services/systemApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await systemApi.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      // silent
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6 shadow-xs">
      {/* Left Search Bar */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request number, department, or keyword..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-4">
        {/* Swagger Docs Shortcut */}
        <a
          href="http://localhost:5000/api-docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-md hover:bg-slate-50 border border-slate-200 transition-colors"
          title="OpenAPI Documentation"
        >
          <FileCode className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium hidden sm:inline">API Docs</span>
        </a>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="In-App Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">In-App Notifications</h4>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs ${n.is_read ? 'opacity-60 bg-white' : 'bg-slate-50'}`}>
                      <p className="font-semibold text-slate-800">{n.title}</p>
                      <p className="text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-xs text-slate-400 text-center">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800">{user?.full_name || user?.username}</p>
              <p className="text-[10px] text-slate-500 font-medium capitalize">{user?.role} Access</p>
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500">{user?.email || 'User Account'}</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-1.5 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Role: <strong className="capitalize">{user?.role}</strong></span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
