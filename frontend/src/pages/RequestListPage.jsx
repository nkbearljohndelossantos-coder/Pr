import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, Plus, Eye } from 'lucide-react';
import DataTable from '../components/DataTable';
import { requestApi, reportApi } from '../services/systemApi';
import { REQUEST_STATUS, STATUS_COLORS } from '../constants/status';
import { formatCurrency } from '../utils/currencyFormatter';
import { useAuth } from '../context/AuthContext';

export default function RequestListPage({ mineOnly }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await requestApi.list({
        page,
        limit: 15,
        mineOnly,
        ...filters
      });
      setRequests(res.data.data.data || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      // Silent catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, filters, mineOnly]);

  const handleExport = async (type) => {
    try {
      const res = type === 'excel' ? await reportApi.exportExcel(filters) : await reportApi.exportCsv(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Requisitions_Report.${type === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      // Handle download fail
    }
  };

  const columns = [
    {
      header: 'Request Number',
      accessor: 'request_number',
      render: (row) => <span className="font-bold text-blue-600">{row.request_number}</span>
    },
    {
      header: 'Department',
      accessor: 'department_name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.department_name}</p>
          <span className="text-[10px] text-slate-400 font-medium">[{row.department_code}]</span>
        </div>
      )
    },
    { header: 'Prepared By', accessor: 'prepared_by' },
    {
      header: 'Required Date',
      accessor: 'required_date',
      render: (row) => new Date(row.required_date).toLocaleDateString()
    },
    {
      header: 'Priority',
      accessor: 'priority',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {row.priority}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[row.status] || 'bg-slate-100 text-slate-700'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Est. Cost',
      accessor: 'total_estimated_cost',
      render: (row) => <span className="font-bold text-slate-800">{formatCurrency(row.total_estimated_cost)}</span>
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          onClick={() => (row.id || row.request_number) && navigate(`/requests/${row.id || row.request_number}`)}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {mineOnly ? 'My Department Requisitions' : 'All Company Requisitions'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mineOnly ? 'Manage and track requisitions originating from your department.' : 'Global view of all department purchase requisitions across the enterprise.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/requests/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Requisition
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card-erp p-4 bg-white flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by Request No, Prepared By, Purpose..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
        >
          <option value="">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        onExport={handleExport}
        page={page}
        totalPages={Math.ceil(total / 15)}
        onPageChange={setPage}
      />
    </div>
  );
}
