import React, { useState, useEffect } from 'react';
import { Database, Download, Plus, HardDrive } from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function BackupPage() {
  const { addToast } = useNotification();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getBackups();
      setBackups(res.data.data || []);
    } catch (err) {
      addToast('Failed to load backups.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      const res = await systemApi.createBackup();
      addToast(`Backup ${res.data.data.filename} generated!`, 'success');
      fetchBackups();
    } catch (err) {
      addToast('Backup generation failed.', 'error');
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Backup Filename',
      accessor: 'filename',
      render: (row) => <span className="font-bold text-slate-800">{row.filename}</span>
    },
    {
      header: 'File Size',
      accessor: 'filesize',
      render: (row) => `${(row.filesize / 1024).toFixed(2)} KB`
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" /> Database Backup & Disaster Recovery
          </h1>
          <p className="text-xs text-slate-500 mt-1">Generate automated or manual SQL database snapshot dumps for enterprise data recovery.</p>
        </div>
        <button
          onClick={handleCreateBackup}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Trigger Manual Backup
        </button>
      </div>

      <DataTable columns={columns} data={backups} loading={loading} />
    </div>
  );
}
