import React, { useState, useEffect } from 'react';
import { Archive, Plus, Download, HardDrive } from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function BackupPage() {
  const { addToast } = useNotification();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getBackups();
      if (res.data.success) setBackups(res.data.data);
    } catch (e) {
      addToast('Failed to load backups.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const res = await systemApi.createBackup();
      if (res.data.success) {
        addToast(`Database backup '${res.data.data.filename}' created!`, 'success');
        fetchBackups();
      }
    } catch (e) {
      addToast('Failed to generate backup.', 'error');
    }
  };

  const columns = [
    { header: 'Backup File Name', key: 'filename', sortable: true, render: (r) => <span className="font-mono font-bold text-blue-600">{r.filename}</span> },
    { header: 'Created By', key: 'created_by', sortable: true },
    { header: 'Size', key: 'filesize', render: (r) => <span className="font-mono">{ (r.filesize / 1024).toFixed(1) } KB</span> },
    { header: 'Date Created', key: 'created_at', render: (r) => <span className="font-mono text-slate-500">{new Date(r.created_at).toLocaleString()}</span> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Database Backup & Recovery</h1>
          <p className="text-xs text-slate-500">Generate, download, and manage system database snapshots</p>
        </div>
        <button
          onClick={handleCreateBackup}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Backup Snapshot</span>
        </button>
      </div>

      <DataTable columns={columns} data={backups} totalCount={backups.length} loading={loading} />
    </div>
  );
}
