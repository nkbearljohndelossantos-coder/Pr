import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CheckCheck, 
  Plus, 
  ArrowRight,
  Building2,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import KpiCard from '../components/KpiCard';
import { requestApi } from '../services/systemApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/numberFormat';
import { STATUS_COLORS } from '../constants/status';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#8B5CF6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await requestApi.getDashboard();
      if (res.data.success) {
        setMetrics(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const rawStatusCounts = metrics?.statusCounts || metrics?.status_counts || [];
  const rawDeptBreakdown = metrics?.departmentBreakdown || metrics?.department_counts || [];
  const rawRecentRequests = metrics?.recentRequests || metrics?.recent_requests || [];

  const getStatusCount = (statusName) => {
    const found = rawStatusCounts.find((s) => s.status === statusName);
    return found ? Number(found.count) : 0;
  };

  const totalRequests = rawStatusCounts.reduce((acc, curr) => acc + Number(curr.count || 0), 0);
  const pendingRequests = getStatusCount('Submitted') + getStatusCount('Under Review');
  const approvedRequests = getStatusCount('Approved');
  const rejectedRequests = getStatusCount('Rejected');
  const completedRequests = getStatusCount('Completed');

  const deptChartData = rawDeptBreakdown.map((d) => ({
    name: d.department_code || d.code || d.name || 'Dept',
    count: Number(d.count || 0)
  }));

  const statusPieData = rawStatusCounts.map((s) => ({
    name: s.status,
    value: Number(s.count || 0)
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Welcome back, {user?.full_name || user?.username}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'department' 
              ? `Department Requisition Control Center (${user?.department_name || user?.department_code})` 
              : 'Global Executive ERP Requisition & Approval Dashboard'}
          </p>
        </div>

        <button
          onClick={() => navigate('/requests/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Request</span>
        </button>
      </div>

      {/* 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Requests"
          value={totalRequests}
          icon={FileText}
          color="blue"
          subtext="All Requisitions"
          onClick={() => navigate('/requests')}
        />
        <KpiCard
          title="Pending Approvals"
          value={pendingRequests}
          icon={Clock}
          color="amber"
          subtext="Requires Review"
          onClick={() => navigate('/requests')}
        />
        <KpiCard
          title="Approved"
          value={approvedRequests}
          icon={CheckCircle2}
          color="emerald"
          subtext="Authorized Requests"
          onClick={() => navigate('/requests')}
        />
        <KpiCard
          title="Rejected"
          value={rejectedRequests}
          icon={XCircle}
          color="rose"
          subtext="Declined Requisitions"
          onClick={() => navigate('/requests')}
        />
        <KpiCard
          title="Completed"
          value={completedRequests}
          icon={CheckCheck}
          color="purple"
          subtext="Fulfilled Requests"
          onClick={() => navigate('/requests')}
        />
      </div>

      {/* Recharts Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Requests Bar Chart */}
        <div className="lg:col-span-2 card-erp p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Requests Volume by Department</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Department Distribution</span>
          </div>

          <div className="h-64 w-full">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department request data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="card-erp p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Request Status Share</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Breakdown</span>
          </div>

          <div className="h-64 w-full">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No status data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="card-erp p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Recent Requisitions Overview
          </h3>
          <button
            onClick={() => navigate('/requests')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Request Number</th>
                <th className="px-4 py-2.5">Department</th>
                <th className="px-4 py-2.5">Prepared By</th>
                <th className="px-4 py-2.5">Required Date</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Est. Total (₱)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rawRecentRequests && rawRecentRequests.length > 0 ? (
                rawRecentRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-blue-600">{req.request_number}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{req.department_name || req.department_code || 'General'}</td>
                    <td className="px-4 py-3 text-slate-600">{req.prepared_by}</td>
                    <td className="px-4 py-3 text-slate-500">{req.required_date ? req.required_date.split('T')[0] : 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[req.status] || 'bg-slate-100'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800 font-mono">
                      {formatCurrency(
                        (req.items && req.items.length > 0 && (!req.total_estimated_cost || Number(req.total_estimated_cost) === 0))
                          ? req.items.reduce((sum, i) => sum + (Number(i.total_cost) || (Number(i.quantity) * Number(i.estimated_cost))), 0)
                          : (Number(req.total_estimated_cost) || 0)
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    No recent requests recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
