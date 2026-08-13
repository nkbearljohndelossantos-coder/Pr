import React, { useState, useEffect } from 'react';
import { Mail, Server, Key, User, Send, Save, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { systemApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function AdminSettingsPage() {
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState({
    approver_email: 'boss@company.com',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '"NKB Manufacturing Requisition System" <notifications@nkbmanufacturing.com>'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getSettings();
      if (res.data?.success && res.data?.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data.data
        }));
      }
    } catch (err) {
      addToast('Failed to load system settings from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!settings.approver_email || !settings.approver_email.trim()) {
      addToast('Approver Email Address cannot be left blank.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await systemApi.updateSettings(settings);
      if (res.data?.success) {
        addToast('System Email & Notification Settings saved successfully to Database!', 'success');
        if (res.data.data) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!settings.approver_email) {
      addToast('Please enter an Approver Email address first.', 'error');
      return;
    }

    setTesting(true);
    try {
      // First save settings so backend has latest SMTP credentials
      await systemApi.updateSettings(settings);

      const res = await systemApi.sendTestEmail(settings.approver_email);
      const testResult = res.data?.data;

      if (testResult?.success) {
        addToast(`Test email notification sent successfully to ${settings.approver_email}! Please check inbox/spam.`, 'success');
      } else if (testResult?.simulated) {
        addToast(`[SMTP Credentials Missing] ${testResult.error || 'Please fill in SMTP Host, Username, and Password to send live emails.'}`, 'error');
      } else {
        addToast(`SMTP Error: ${testResult?.error || 'Failed to deliver email. Please check your credentials.'}`, 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send test email.', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading System Email Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Administrator Control Panel</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Email & Executive Approval Notification Settings
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Configure where requisition approval notification emails are sent when departments submit new purchase requests or edits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={testing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-4 h-4 ${testing ? 'animate-bounce' : ''}`} />
              <span>{testing ? 'Sending Test Email...' : 'Send Test Email'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Target Boss / Approver Email Destination */}
        <div className="card-erp p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">1. Executive Approver / Boss Email Destination</h2>
                <p className="text-[11px] text-slate-500">The recipient email address that receives instant notification alerts for pending approvals.</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Boss / Executive Approver Email Address <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={settings.approver_email || ''}
                  onChange={(e) => handleChange('approver_email', e.target.value)}
                  placeholder="e.g. boss@nkbmanufacturing.com or executive@company.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Every time a department submits a requisition request, a formatted HTML email alert with direct action buttons will be sent to this email address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sender Display Name / Title
              </label>
              <input
                type="text"
                value={settings.smtp_from || ''}
                onChange={(e) => handleChange('smtp_from', e.target.value)}
                placeholder='e.g. "NKB Manufacturing Requisition System" <notifications@nkbmanufacturing.com>'
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                System Web Platform URL
              </label>
              <input
                type="text"
                disabled
                value="https://pr.nkbmanufacturing.com"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: SMTP Mail Server Configuration */}
        <div className="card-erp p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">2. SMTP Mail Server Credentials (Hostinger / Gmail / Custom SMTP)</h2>
                <p className="text-[11px] text-slate-500">Configure your mail server details to deliver real email messages to the boss's inbox.</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Optional / Live SMTP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SMTP Server Hostname
              </label>
              <input
                type="text"
                value={settings.smtp_host || ''}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                placeholder="e.g. smtp.hostinger.com or smtp.gmail.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtp_port || 587}
                onChange={(e) => handleChange('smtp_port', e.target.value)}
                placeholder="587 or 465"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SMTP Username / Mail Account
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={settings.smtp_user || ''}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  placeholder="e.g. notifications@nkbmanufacturing.com"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SMTP Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.smtp_pass || ''}
                  onChange={(e) => handleChange('smtp_pass', e.target.value)}
                  placeholder="SMTP Account Password"
                  className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Preset Helper Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 mt-4 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Recommended SMTP Server Presets:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Hostinger Mail</strong>: Host: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">smtp.hostinger.com</code> | Port: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">587</code> (or 465 SSL)</li>
              <li><strong>Gmail SMTP</strong>: Host: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">smtp.gmail.com</code> | Port: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">587</code> (Requires Gmail App Password)</li>
              <li><strong>Office 365 / Outlook</strong>: Host: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">smtp.office365.com</code> | Port: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">587</code></li>
            </ul>
          </div>
        </div>

        {/* Bottom Save & Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={testing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4 text-blue-600" />
            <span>Send Test Email</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Saving Settings...' : 'Save Settings to Database'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
