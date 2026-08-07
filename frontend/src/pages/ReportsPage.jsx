import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, Filter, DollarSign, FileCheck, Clock, TrendingUp } from 'lucide-react';
import { reportApi, requestApi, departmentApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function ReportsPage() {
  const { addToast } = useNotification();
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department_id: '',
    status: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, deptRes] = await Promise.all([
        requestApi.getAll(filters),
        departmentApi.getAll()
      ]);
      setRequests(reqRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) {
      addToast('Failed to load report analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.department_id, filters.status]);

  const handleExport = async (type) => {
    try {
      const res = type === 'excel' ? await reportApi.exportExcel() : await reportApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Enterprise_Requisitions_Report_${new Date().toISOString().slice(0,10)}.${type === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      addToast(`Exported ${type.toUpperCase()} report successfully!`, 'success');
    } catch (e) {
      addToast('Export failed.', 'error');
    }
  };

  const totalVolume = requests.length;
  const totalCost = requests.reduce((acc, r) => acc + (Number(r.total_estimated_cost) || 0), 0);
  const approvedCost = requests.filter(r => r.status === 'Approved' || r.status === 'Completed').reduce((acc, r) => acc + (Number(r.total_estimated_cost) || 0), 0);
  const pendingCount = requests.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;

  const statusDistribution = [
    { label: 'Approved & Completed', count: requests.filter(r => r.status === 'Approved' || r.status === 'Completed').length, color: 'bg-emerald-500' },
    { label: 'Submitted & Reviewing', count: requests.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length, color: 'bg-blue-500' },
    { label: 'Draft / Revision', count: requests.filter(r => r.status === 'Draft').length, color: 'bg-amber-500' },
    { label: 'Rejected', count: requests.filter(r => r.status === 'Rejected').length, color: 'bg-rose-500' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Executive Analytics & Reporting Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time expenditure metrics, status distribution, and corporate export generation.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel (.XLSX)
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" /> CSV Export
          </button>
        </div>
      </div>

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-erp p-5 bg-white border border-slate-200/80 rounded-xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Volume</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{totalVolume}</p>
          <p className="text-[11px] text-slate-400 font-medium">Requisition Documents</p>
        </div>

        <div className="card-erp p-5 bg-white border border-slate-200/80 rounded-xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Value</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-slate-400 font-medium">Gross Estimated Amount</p>
        </div>

        <div className="card-erp p-5 bg-white border border-slate-200/80 rounded-xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved Cost</span>
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">${approvedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Released Commitments</p>
        </div>

        <div className="card-erp p-5 bg-white border border-slate-200/80 rounded-xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-[11px] text-amber-600 font-medium">Awaiting Action</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-erp p-4 bg-white border border-slate-200 rounded-xl flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" /> Filter Analytics:
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filters.department_id}
            onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Status Distribution Progress Bars */}
      <div className="card-erp p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Document Status Breakdown</h3>
        <div className="space-y-3">
          {statusDistribution.map((item, idx) => {
            const pct = totalVolume > 0 ? Math.round((item.count / totalVolume) * 100) : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{item.label}</span>
                  <span>{item.count} docs ({pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

