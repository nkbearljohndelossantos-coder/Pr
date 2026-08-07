import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await systemApi.getAuditLogs();
        setLogs(res.data.data || []);
      } catch (err) {
        // Silent catch
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (row) => new Date(row.timestamp).toLocaleString()
    },
    {
      header: 'User',
      accessor: 'username',
      render: (row) => <span className="font-bold text-slate-800">{row.username}</span>
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 uppercase">{row.role}</span>
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => <span className="font-semibold text-blue-600">{row.action}</span>
    },
    { header: 'Target Resource', accessor: 'target_resource' },
    { header: 'IP Address', accessor: 'ip_address' }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" /> Enterprise Compliance Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-1">Immutable security audit logs tracking system actions, requisition approvals, and user logins.</p>
      </div>

      <DataTable columns={columns} data={logs} loading={loading} />
    </div>
  );
}
