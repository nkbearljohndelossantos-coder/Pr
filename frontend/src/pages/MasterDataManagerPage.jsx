import React, { useState, useEffect } from 'react';
import { Database, Plus, CheckCircle2, XCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function MasterDataManagerPage() {
  const { addToast } = useNotification();
  const [dropdowns, setDropdowns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [category, setCategory] = useState('unit_of_measure');
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [sortOrder, setSortOrder] = useState(1);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getMasterData();
      if (res.data.success) {
        setDropdowns(res.data.data);
      }
    } catch (e) {
      addToast('Failed to load master data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDropdown = async (e) => {
    e.preventDefault();
    try {
      const res = await systemApi.addMasterData({ category, code, label, sort_order: sortOrder });
      if (res.data.success) {
        addToast(`Dropdown option '${label}' added successfully!`, 'success');
        setModalOpen(false);
        setCode(''); setLabel('');
        fetchMasterData();
      }
    } catch (err) {
      addToast('Failed to add dropdown item.', 'error');
    }
  };

  const handleToggle = async (item) => {
    try {
      await systemApi.toggleMasterData(item.id, !item.is_active);
      addToast(`Toggled '${item.label}'.`, 'success');
      fetchMasterData();
    } catch (e) {
      addToast('Failed to toggle option.', 'error');
    }
  };

  const columns = [
    { header: 'Category', key: 'category', sortable: true, render: (r) => <span className="font-bold text-slate-700 uppercase">{r.category}</span> },
    { header: 'Code', key: 'code', sortable: true, render: (r) => <span className="font-mono font-bold text-blue-600">{r.code}</span> },
    { header: 'Label Name', key: 'label', sortable: true, render: (r) => <span className="font-semibold text-slate-800">{r.label}</span> },
    { header: 'Sort Order', key: 'sort_order', sortable: true },
    {
      header: 'Status',
      key: 'is_active',
      render: (r) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {r.is_active ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      header: 'Action',
      key: 'action',
      render: (r) => (
        <button
          onClick={() => handleToggle(r)}
          className={`px-3 py-1 rounded text-xs font-semibold border ${r.is_active ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
        >
          {r.is_active ? 'Disable' : 'Enable'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">ERP Master Data Manager</h1>
          <p className="text-xs text-slate-500">Configure database-driven master dropdown values (Units of Measure, Priority Badges, Categories)</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dropdown Option</span>
        </button>
      </div>

      <DataTable columns={columns} data={dropdowns} totalCount={dropdowns.length} loading={loading} />

      {/* Add Master Data Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Add Master Data Dropdown Option</h3>
            <form onSubmit={handleAddDropdown} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="unit_of_measure">Unit of Measure (UOM)</option>
                  <option value="priority">Priority Levels</option>
                  <option value="item_category">Item Categories</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Code * (e.g. PCS, PALLET, HIGH)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Pallets (PALLET)"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sort Order Number</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Save Master Option</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
