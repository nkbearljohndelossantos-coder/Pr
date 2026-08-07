import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getAuditLogs();
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Timestamp', key: 'timestamp', sortable: true, render: (r) => <span className="font-mono text-slate-500">{new Date(r.timestamp).toLocaleString()}</span> },
    { header: 'User', key: 'username', sortable: true, render: (r) => <span className="font-bold text-slate-800">{r.username}</span> },
    { header: 'Role', key: 'role', render: (r) => <span className="font-mono text-xs text-blue-600">{r.role}</span> },
    { header: 'Action', key: 'action', sortable: true, render: (r) => <span className="font-semibold text-slate-700">{r.action}</span> },
    { header: 'Target Resource', key: 'target_resource', render: (r) => <span className="font-mono text-[11px] text-slate-600">{r.target_resource}</span> },
    { header: 'IP Address', key: 'ip_address', render: (r) => <span className="font-mono text-slate-500">{r.ip_address || '127.0.0.1'}</span> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">System Audit Trail Logs</h1>
          <p className="text-xs text-slate-500">Immutable enterprise action tracking (User, Action, Resource, IP Address, Timestamp)</p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <DataTable columns={columns} data={logs} totalCount={logs.length} loading={loading} />
    </div>
  );
}
