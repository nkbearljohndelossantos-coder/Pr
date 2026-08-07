import React, { useState, useEffect } from 'react';
import { Database, Plus, CheckCircle, XCircle, Tag, Filter } from 'lucide-react';
import DataTable from '../components/DataTable';
import { systemApi } from '../services/systemApi';
import { useNotification } from '../context/NotificationContext';

export default function MasterDataManagerPage() {
  const { addToast } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unit_of_measure');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: 'unit_of_measure', code: '', label: '', sort_order: 1 });

  const categories = [
    { key: 'unit_of_measure', label: 'Units of Measure' },
    { key: 'priority', label: 'Priority Levels' },
    { key: 'request_category', label: 'Request Categories' },
    { key: 'cost_center', label: 'Cost Centers' },
    { key: 'currency', label: 'Currencies' }
  ];

  const fetchMaster = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getMasterData();
      setItems(res.data.data || []);
    } catch (err) {
      addToast('Failed to load master data dropdowns.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaster();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await systemApi.addMasterData(formData);
      addToast('Master dropdown value added successfully!', 'success');
      setShowModal(false);
      setFormData({ category: activeTab, code: '', label: '', sort_order: 1 });
      fetchMaster();
    } catch (err) {
      addToast('Failed to add master data.', 'error');
    }
  };

  const filteredItems = items.filter(item => item.category === activeTab);

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">{row.category}</span>
    },
    { header: 'Code Key', accessor: 'code' },
    { header: 'Display Label', accessor: 'label' },
    { header: 'Sort Order', accessor: 'sort_order' },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Configurable Master Data Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage enterprise dropdown values, Units of Measure, Priorities, and Cost Center master tables.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, category: activeTab });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Dropdown Value
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${activeTab === cat.key ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filteredItems} loading={loading} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800">Add New Master Dropdown Option</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Option Code Key (e.g. PCS, HIGH)</label>
                <input
                  type="text"
                  required
                  placeholder="Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Label</label>
                <input
                  type="text"
                  required
                  placeholder="Label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-xs"
                >
                  Save Master Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
