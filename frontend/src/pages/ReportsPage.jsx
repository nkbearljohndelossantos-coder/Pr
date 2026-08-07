import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { reportApi, departmentApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [departments, setDepartments] = useState([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      if (res.data.success) setDepartments(res.data.data);
    } catch (e) {}
  };

  const handleExportExcel = async () => {
    try {
      const params = { startDate, endDate, department_id: departmentId, status, priority };
      const res = await reportApi.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ERP_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      addToast('Excel report generated and downloaded!', 'success');
    } catch (e) {
      addToast('Failed to generate Excel report.', 'error');
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = { startDate, endDate, department_id: departmentId, status, priority };
      const res = await reportApi.exportCsv(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ERP_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      addToast('CSV report downloaded successfully!', 'success');
    } catch (e) {
      addToast('Failed to export CSV.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800">Enterprise Reporting Studio</h1>
        <p className="text-xs text-slate-500">Generate, filter, and export formal PDF, Excel, and CSV requisition reports</p>
      </div>

      <div className="card-erp p-6 space-y-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          Report Parameters & Filters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {user?.role !== 'department' && (
            <div>
              <label className="block font-semibold mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate & Download Excel Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
