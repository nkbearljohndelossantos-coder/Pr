import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  return (
    <main className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 min-h-screen flex flex-col items-center justify-center px-4 py-8 md:p-8">
      <div className="grid items-center gap-x-10 gap-y-12 max-w-6xl w-full lg:grid-cols-2">
        
        {/* Left Side: Logo & System Overview */}
        <div className="max-w-lg max-lg:mx-auto text-slate-50">
          <div className="mb-8">
            <img
              src="/nkb-logo.png"
              alt="NKB Requisition Logo"
              className="lg:w-64 w-52 inline-block drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold !leading-tight text-white tracking-tight">
            Seamless Requisition & Exclusive Access
          </h2>

          <p className="text-sm lg:text-base mt-4 text-slate-200 leading-relaxed font-normal">
            Immerse yourself in a hassle-free requisition and approval journey. Effortlessly submit, track, and manage your department's requests with NKB Enterprise System.
          </p>
        </div>

        {/* Right Side: Login Card Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 max-w-lg mx-auto w-full lg:max-w-md shadow-2xl">
          <h1 className="text-2xl lg:text-3xl mb-2 font-bold text-slate-900">Sign in</h1>
          <p className="text-xs text-slate-500 mb-8">Enter your credentials to access your NKB account</p>

          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="mb-1.5 text-slate-900 font-bold text-xs uppercase tracking-wide inline-block">
                Username / Department Code
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin, boss, it_dept"
                required
                className="px-3.5 py-2.5 text-sm text-slate-900 rounded-lg bg-slate-50 border border-slate-300 w-full focus:bg-white focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="mb-1.5 text-slate-900 font-bold text-xs uppercase tracking-wide inline-block">
                Password
              </label>

              <button
                type="button"
                id="togglePassword"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-8 right-2.5 p-1 flex cursor-pointer text-slate-400 hover:text-slate-600 focus:outline-none rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="size-[20px] fill-slate-400 text-slate-400 overflow-visible" viewBox="0 0 128 128">
                  <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"></path>
                  <path id="eyeStrike" className={showPassword ? 'hidden' : 'block'} d="M10.586 10.586l106.828 106.828" stroke="currentColor" strokeWidth="10" strokeLinecap="round"></path>
                </svg>
              </button>

              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="px-3.5 py-2.5 text-sm text-slate-900 rounded-lg bg-slate-50 border border-slate-300 w-full focus:bg-white focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 transition-all font-medium pr-10"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="flex items-center group cursor-pointer">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white group-has-[:checked]:bg-blue-600 group-has-[:checked]:border-blue-600 transition-all"
                  aria-hidden="true"
                >
                  <svg className="size-3 text-white opacity-0 group-has-[:checked]:opacity-100 transition-opacity" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 5l3 3 7-7" />
                  </svg>
                </span>
                <span className="ml-2.5 text-xs font-semibold text-slate-700">
                  Remember me
                </span>
              </label>

              <a href="#quick-login" className="text-xs font-semibold text-blue-600 hover:underline focus:outline-none">
                System Admin Access
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-xs rounded-xl font-bold tracking-wide text-white bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none shadow-md disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign in to Account'}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              NKB Manufacturing Enterprise Requisition System v1.0
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
