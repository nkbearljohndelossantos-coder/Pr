import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import KpiCard from '../components/KpiCard';
import { requestApi } from '../services/systemApi';
import { REQUEST_STATUS, STATUS_COLORS } from '../constants/status';
import { formatCurrency } from '../utils/currencyFormatter';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ statusCounts: [], departmentBreakdown: [], recentRequests: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await requestApi.getDashboard();
        setMetrics(res.data.data);
      } catch (err) {
        // Silent catch
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const countForStatus = (status) => {
    const item = metrics.statusCounts.find((s) => s.status === status);
    return item ? item.count : 0;
  };

  const totalRequests = metrics.statusCounts.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Enterprise Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time overview of department requisitions and approval workflows.</p>
        </div>
        <button
          onClick={() => navigate('/requests/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Create Requisition
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Requisitions" value={totalRequests} icon={FileText} color="blue" badgeText="All Time Records" />
        <KpiCard title="Submitted" value={countForStatus(REQUEST_STATUS.SUBMITTED)} icon={Clock} color="purple" badgeText="Pending Review" />
        <KpiCard title="Approved" value={countForStatus(REQUEST_STATUS.APPROVED)} icon={CheckCircle2} color="emerald" badgeText="Cleared Requisitions" />
        <KpiCard title="Under Review" value={countForStatus(REQUEST_STATUS.UNDER_REVIEW)} icon={AlertCircle} color="amber" badgeText="In Assessment" />
        <KpiCard title="Rejected" value={countForStatus(REQUEST_STATUS.REJECTED)} icon={XCircle} color="rose" badgeText="Declined Requisitions" />
      </div>

      {/* Analytics Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requisitions by Department Bar Chart */}
        <div className="lg:col-span-2 card-erp p-6 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Requisitions Volume by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.departmentBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="department_code" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Status Breakdown Card */}
        <div className="card-erp p-6 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Status Breakdown</h3>
          <div className="space-y-3">
            {[REQUEST_STATUS.SUBMITTED, REQUEST_STATUS.UNDER_REVIEW, REQUEST_STATUS.APPROVED, REQUEST_STATUS.REJECTED, REQUEST_STATUS.COMPLETED].map((st) => {
              const count = countForStatus(st);
              const pct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{st}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st === REQUEST_STATUS.APPROVED ? 'bg-emerald-600' : st === REQUEST_STATUS.REJECTED ? 'bg-rose-600' : 'bg-blue-600'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Requisitions Table */}
      <div className="card-erp p-6 bg-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Recent Requisition Submissions</h3>
          <button
            onClick={() => navigate('/requests/all')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            View All Requisitions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Request No</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Prepared By</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total Est. Cost</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recentRequests?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No recent requisitions submitted yet.
                  </td>
                </tr>
              ) : (
                metrics.recentRequests?.map((req, idx) => (
                  <tr key={req.id || req.request_number || idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-blue-600">{req.request_number}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{req.department_name}</td>
                    <td className="px-4 py-3 text-slate-600">{req.prepared_by}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[req.status] || 'bg-slate-100 text-slate-700'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {formatCurrency(req.total_estimated_cost)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => (req.id || req.request_number) && navigate(`/requests/${req.id || req.request_number}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
