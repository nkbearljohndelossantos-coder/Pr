import React, { useState } from 'react';
import { Settings, Save, Shield, HardDrive, Palette, FileText } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function SettingsPage() {
  const { addToast } = useNotification();
  const [formData, setFormData] = useState({
    companyName: 'Enterprise Global Industries Inc.',
    companyCode: 'EGI-CORP',
    storageProvider: 'local',
    maxFileSizeMb: '10',
    primaryColor: '#2563EB',
    themeMode: 'dark_sidebar',
    documentPattern: 'REQ-{DEPT_CODE}-{YYYYMMDD}-{SEQ_NUMBER}'
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('erp_settings', JSON.stringify(formData));
    addToast('System settings saved successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" /> Enterprise System Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure company branding, storage providers, document numbering formats, and system limits.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Branding & Identity */}
        <div className="card-erp p-6 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" /> 1. Company Identity & Theme Branding
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Full Legal Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Code Prefix</label>
              <input
                type="text"
                value={formData.companyCode}
                onChange={(e) => setFormData({ ...formData, companyCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sidebar Theme</label>
              <select
                value={formData.themeMode}
                onChange={(e) => setFormData({ ...formData, themeMode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="dark_sidebar">Dark Slate (#1E293B) Sidebar</option>
                <option value="light_sidebar">Clean Light (#FFFFFF) Sidebar</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Accent Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-8 p-0 border-0 rounded cursor-pointer"
                />
                <span className="font-mono text-slate-600 font-bold">{formData.primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Storage Provider Layer */}
        <div className="card-erp p-6 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" /> 2. Attachment Storage Provider Layer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Storage Provider</label>
              <select
                value={formData.storageProvider}
                onChange={(e) => setFormData({ ...formData, storageProvider: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="local">Local Filesystem Storage (Default)</option>
                <option value="s3">Amazon S3 Storage Bucket</option>
                <option value="r2">Cloudflare R2 Object Storage</option>
                <option value="azure">Azure Blob Storage Container</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Upload File Size (MB)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.maxFileSizeMb}
                onChange={(e) => setFormData({ ...formData, maxFileSizeMb: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* 3. Document Sequencing Pattern */}
        <div className="card-erp p-6 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> 3. Document Sequencing Pattern
          </h3>
          <div className="text-xs space-y-2">
            <label className="block font-semibold text-slate-700">Sequence Format Rule</label>
            <div className="p-3 bg-slate-100 rounded-lg font-mono text-blue-700 font-bold">
              {formData.documentPattern}
            </div>
            <p className="text-[11px] text-slate-400">Sample preview: REQ-IT-20260807-00001</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            <Save className="w-4 h-4" /> Save Enterprise Settings
          </button>
        </div>
      </form>
    </div>
  );
}

