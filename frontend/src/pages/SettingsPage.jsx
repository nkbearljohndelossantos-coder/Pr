import React, { useState } from 'react';
import { Settings, Save, Shield, Building } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function SettingsPage() {
  const { addToast } = useNotification();
  const [companyName, setCompanyName] = useState('NKB Manufacturing Corporation');
  const [companyCode, setCompanyCode] = useState('NKB-MFG');
  const [taxId, setTaxId] = useState('TX-9988776655');
  const [currency, setCurrency] = useState('PHP (₱)');

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800">System & Enterprise Configurations</h1>
        <p className="text-xs text-slate-500">Manage corporate identity, document defaults, and global ERP settings</p>
      </div>

      <form onSubmit={handleSave} className="card-erp p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          Company Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Company Code</label>
            <input
              type="text"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Corporate Tax ID</label>
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-800"
            >
              <option value="PHP (₱)">Philippine Peso (₱)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
              <option value="GBP (£)">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
