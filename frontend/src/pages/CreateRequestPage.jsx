import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Save, Send } from 'lucide-react';
import DynamicItemRows from '../components/DynamicItemRows';
import AttachmentUploader from '../components/AttachmentUploader';
import { requestApi, departmentApi, systemApi } from '../services/systemApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function CreateRequestPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    department_id: user?.department_id || '',
    prepared_by: user?.full_name || user?.username || '',
    position: 'Lead Staff',
    required_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 'Normal',
    purpose: '',
    business_justification: ''
  });

  const [items, setItems] = useState([
    { item_description: '', quantity: 1, unit: 'PCS', estimated_cost: 0, total: '0.00', remarks: '' }
  ]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [deptRes, unitRes] = await Promise.all([
          departmentApi.getAll(),
          systemApi.getMasterData('unit_of_measure')
        ]);
        setDepartments(deptRes.data.data || []);
        setUnits(unitRes.data.data || []);
        if (!formData.department_id && deptRes.data.data?.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: deptRes.data.data[0].id }));
        }
      } catch (err) {
        // Silent catch
      }
    };
    loadMaster();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_id) {
      addToast('Please select a target department.', 'warning');
      return;
    }
    if (items.some((i) => !i.item_description.trim())) {
      addToast('Please fill out descriptions for all line items.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append('items', JSON.stringify(items));
      files.forEach((file) => data.append('attachments', file));

      const res = await requestApi.create(data);
      addToast(`Requisition ${res.data.data.request_number} created successfully!`, 'success');
      navigate('/requests/my');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit requisition.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-blue-600" /> Create Department Purchase Requisition
        </h1>
        <p className="text-xs text-slate-500 mt-1">Fill out all required details and line items to trigger authorization workflows.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department & Header Information */}
        <div className="card-erp p-6 bg-white space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Header Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
              <select
                disabled={user?.role === 'department'}
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
              >
                {departments.map((d, idx) => (
                  <option key={d.id || d.code || idx} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prepared By</label>
              <input
                type="text"
                required
                value={formData.prepared_by}
                onChange={(e) => setFormData({ ...formData, prepared_by: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position / Title</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Delivery Date</label>
              <input
                type="date"
                required
                value={formData.required_date}
                onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="Low">Low Priority</option>
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Requisition</label>
              <textarea
                required
                rows={3}
                placeholder="State clearly why these items or services are needed..."
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Justification</label>
              <textarea
                rows={3}
                placeholder="Include ROI, operational impact, or project references..."
                value={formData.business_justification}
                onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Line Items Component */}
        <div className="card-erp p-6 bg-white">
          <DynamicItemRows items={items} setItems={setItems} units={units} />
        </div>

        {/* Supporting File Attachment Component */}
        <div className="card-erp p-6 bg-white">
          <AttachmentUploader files={files} setFiles={setFiles} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Requisition'}
          </button>
        </div>
      </form>
    </div>
  );
}
