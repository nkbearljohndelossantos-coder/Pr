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
  const finSummary = metrics?.financialSummary || metrics?.financial_summary || {};

  const [chartMode, setChartMode] = useState('cost'); // 'cost' or 'count'

  const getStatusCount = (statusName) => {
    const found = rawStatusCounts.find((s) => s.status === statusName);
    return found ? Number(found.count) : 0;
  };

  const totalRequests = rawStatusCounts.reduce((acc, curr) => acc + Number(curr.count || 0), 0);
  const pendingRequests = getStatusCount('Submitted') + getStatusCount('Under Review');
  const approvedRequests = getStatusCount('Approved');
  const rejectedRequests = getStatusCount('Rejected');
  const completedRequests = getStatusCount('Completed');

  const totalCost = Number(finSummary.totalRequestedCost || finSummary.total_requested_cost || 0);
  const approvedCost = Number(finSummary.approvedCost || finSummary.approved_cost || 0);
  const pendingCost = Number(finSummary.pendingCost || finSummary.pending_cost || 0);
  const rejectedCost = Number(finSummary.rejectedCost || finSummary.rejected_cost || 0);
  const subsCost = Number(finSummary.subscriptionsCost || finSummary.subscriptions_cost || 0);
  const physCost = Number(finSummary.physicalItemsCost || finSummary.physical_items_cost || 0);

  const deptChartData = rawDeptBreakdown.map((d) => ({
    name: d.department_code || d.code || d.name || 'Dept',
    fullName: d.department_name || d.name || 'Department',
    count: Number(d.count || 0),
    spend: Number(d.total_spend || 0)
  }));

  const statusPieData = rawStatusCounts.map((s) => ({
    name: s.status,
    value: Number(s.count || 0)
  }));

  const categoryPieData = [
    { name: 'Physical Goods / Items', value: physCost, color: '#2563EB' },
    { name: 'SaaS / Subscriptions', value: subsCost, color: '#4F46E5' }
  ].filter(c => c.value > 0);

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
              ? `Department Requisition & Financial Control Center (${user?.department_name || user?.department_code})` 
              : 'Global Executive ERP Financial Costing & Requisition Approval Dashboard'}
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

      {/* SECTION 1: EXECUTIVE FINANCIAL SPENDING & COSTING CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Executive Financial Requisition Costing (PHP)</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Real-Time Enterprise Budget Valuation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-erp p-5 border-l-4 border-l-blue-600 bg-linear-to-br from-white to-blue-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Requested Value</span>
              <span className="p-2 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">₱</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-slate-900 font-mono tracking-tight">{formatCurrency(totalCost)}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sum of all {totalRequests} requisition requests</p>
          </div>

          <div className="card-erp p-5 border-l-4 border-l-emerald-600 bg-linear-to-br from-white to-emerald-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Approved & Committed Spend</span>
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">✓</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-emerald-700 font-mono tracking-tight">{formatCurrency(approvedCost)}</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">{approvedRequests + completedRequests} Authorized requisitions</p>
          </div>

          <div className="card-erp p-5 border-l-4 border-l-amber-500 bg-linear-to-br from-white to-amber-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Approvals Value</span>
              <span className="p-2 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">⏳</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-amber-700 font-mono tracking-tight">{formatCurrency(pendingCost)}</span>
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-1">{pendingRequests} Requisitions awaiting sign-off</p>
          </div>

          <div className="card-erp p-5 border-l-4 border-l-indigo-600 bg-linear-to-br from-white to-indigo-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Subscriptions & SaaS Cost</span>
              <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">☁️</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-indigo-700 font-mono tracking-tight">{formatCurrency(subsCost)}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Physical Items: <strong className="text-slate-700 font-mono">{formatCurrency(physCost)}</strong></p>
          </div>
        </div>
      </div>

      {/* SECTION 2: WORKFLOW STATUS COUNTS */}
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

      {/* SECTION 3: RECHARTS DATA VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Spending / Volume Bar Chart */}
        <div className="lg:col-span-2 card-erp p-5">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{chartMode === 'cost' ? 'Expenditure & Costing (₱) by Department' : 'Requisitions Volume by Department'}</span>
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setChartMode('cost')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartMode === 'cost' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Costing (₱)
              </button>
              <button
                type="button"
                onClick={() => setChartMode('count')}
                className={`px-2.5 py-1 rounded-md transition-all ${chartMode === 'count' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Count (Qty)
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => chartMode === 'cost' ? `₱${(val / 1000).toFixed(0)}k` : val}
                  />
                  <Tooltip
                    formatter={(value) => [chartMode === 'cost' ? formatCurrency(value) : `${value} Request(s)`, chartMode === 'cost' ? 'Total Cost' : 'Volume']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '11px' }}
                  />
                  <Bar dataKey={chartMode === 'cost' ? 'spend' : 'count'} fill={chartMode === 'cost' ? '#059669' : '#2563EB'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department expenditure data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Cost Category / Status Distribution Donut Chart */}
        <div className="card-erp p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Cost Category Share</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Physical vs SaaS</span>
          </div>

          <div className="h-64 w-full">
            {(categoryPieData.length > 0 || statusPieData.length > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData.length > 0 ? categoryPieData : statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(categoryPieData.length > 0 ? categoryPieData : statusPieData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Estimated Spend']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category cost data available.
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
