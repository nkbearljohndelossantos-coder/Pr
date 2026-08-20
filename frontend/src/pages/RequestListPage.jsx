import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Plus, Download, Eye, Filter, Pencil } from 'lucide-react';
import DataTable from '../components/DataTable';
import { requestApi, reportApi, departmentApi } from '../services/systemApi';
import { STATUS_COLORS } from '../constants/status';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/numberFormat';

export default function RequestListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusFilter = searchParams.get('status') || '';
  const deptFilter = searchParams.get('department_id') || '';
  const priorityFilter = searchParams.get('priority') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [searchParams, searchQuery]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (e) {}
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter,
        department_id: deptFilter,
        priority: priorityFilter,
        search: searchQuery,
        limit: 10,
        offset: (page - 1) * 10
      };
      const res = await requestApi.list(params);
      if (res.data.success) {
        const rawList = Array.isArray(res.data.data?.data)
          ? res.data.data.data
          : (Array.isArray(res.data.data) ? res.data.data : []);
        const validList = rawList.filter(r => r && r.request_number && r.id);
        setRequests(validList);
        setTotalCount(res.data.data?.total !== undefined ? res.data.data.total : validList.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleExportExcel = async () => {
    try {
      const params = { status: statusFilter, department_id: deptFilter, priority: priorityFilter };
      const res = await reportApi.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ERP_Requests_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      addToast('Excel report downloaded successfully!', 'success');
    } catch (e) {
      addToast('Failed to export Excel report.', 'error');
    }
  };

  const columns = [
    {
      header: 'Request Number',
      key: 'request_number',
      sortable: true,
      render: (row) => (
        <span
          onClick={() => navigate(`/requests/${row.id}`)}
          className="font-bold text-blue-600 hover:underline cursor-pointer"
        >
          {row.request_number}
        </span>
      )
    },
    {
      header: 'Department',
      key: 'department_name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.department_name}</span>
          <span className="text-[10px] text-slate-400 block font-mono">({row.department_code})</span>
        </div>
      )
    },
    { header: 'Prepared By', key: 'prepared_by', sortable: true },
    { header: 'Required Date', key: 'required_date', sortable: true },
    {
      header: 'Priority',
      key: 'priority',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
          {row.priority}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[row.status] || 'bg-slate-100'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Total Cost (₱)',
      key: 'total_estimated_cost',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 font-mono">
          {formatCurrency(
            (row.items && row.items.length > 0 && (!row.total_estimated_cost || Number(row.total_estimated_cost) === 0))
              ? row.items.reduce((sum, i) => sum + (Number(i.total_cost) || (Number(i.quantity) * Number(i.estimated_cost))), 0)
              : (Number(row.total_estimated_cost) || 0)
          )}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/requests/${row.id}`)}
            className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-md text-slate-600 transition-colors"
            title="View Request Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {row.status !== 'Approved' && (
            <button
              onClick={() => navigate(`/requests/${row.id}/edit`)}
              className="p-1.5 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 rounded-md transition-colors"
              title="Edit Requisition Request"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Department Request Management</h1>
          <p className="text-xs text-slate-500">
            {user?.role === 'department' ? 'View and track your department requisitions' : 'Global enterprise request audit & approval grid'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => navigate('/requests/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="card-erp p-4 flex flex-wrap items-center gap-4 bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters:</span>
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => updateParam('status', e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted (Pending)</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Department Dropdown (Admin & Executive only) */}
        {user?.role !== 'department' && (
          <select
            value={deptFilter}
            onChange={(e) => updateParam('department_id', e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>
        )}

        {/* Priority Dropdown */}
        <select
          value={priorityFilter}
          onChange={(e) => updateParam('priority', e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        {/* Clear Filters */}
        {(statusFilter || deptFilter || priorityFilter) && (
          <button
            onClick={() => setSearchParams({})}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Enterprise Data Grid */}
      <DataTable
        columns={columns}
        data={requests}
        totalCount={totalCount}
        page={page}
        pageSize={10}
        loading={loading}
        onPageChange={(p) => updateParam('page', p)}
        onSearch={(q) => setSearchQuery(q)}
      />
    </div>
  );
}
