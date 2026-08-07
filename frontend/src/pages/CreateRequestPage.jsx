import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, Send, ArrowLeft } from 'lucide-react';
import DynamicItemRows from '../components/DynamicItemRows';
import AttachmentUploader from '../components/AttachmentUploader';
import { requestApi, systemApi } from '../services/systemApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function CreateRequestPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [preparedBy, setPreparedBy] = useState(user?.full_name || user?.username || '');
  const [position, setPosition] = useState('');
  const [requiredDate, setRequiredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [purpose, setPurpose] = useState('');
  const [businessJustification, setBusinessJustification] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [items, setItems] = useState([
    { item_description: '', quantity: 1, unit: 'PCS', estimated_cost: 0, remarks: '' }
  ]);
  const [files, setFiles] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUomOptions();
  }, []);

  const fetchUomOptions = async () => {
    try {
      const res = await systemApi.getMasterData('unit_of_measure');
      if (res.data.success) {
        setUomOptions(res.data.data);
      }
    } catch (e) {
      // fallback
    }
  };

  const handleFormSubmit = async (statusType) => {
    if (!preparedBy || !requiredDate || !purpose) {
      addToast('Please fill in all required fields (Prepared By, Required Date, Purpose).', 'error');
      return;
    }

    if (items.some((i) => !i.item_description.trim())) {
      addToast('Please provide a description for all request item rows.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('prepared_by', preparedBy);
      formData.append('position', position);
      formData.append('required_date', requiredDate);
      formData.append('purpose', purpose);
      formData.append('business_justification', businessJustification);
      formData.append('priority', priority);
      formData.append('status', statusType);
      formData.append('items', JSON.stringify(items));

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await requestApi.create(formData);
      if (res.data.success) {
        addToast(`Request ${res.data.data.request_number} created successfully!`, 'success');
        navigate(`/requests/${res.data.data.id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Create New Department Request</h1>
            <p className="text-xs text-slate-500">
              Department: <strong className="text-blue-600">{user?.department_name || user?.department_code || 'General'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleFormSubmit('Draft')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-2xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleFormSubmit('Submitted')}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
          </button>
        </div>
      </div>

      {/* Main Request Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Section 1: Header Information */}
        <div className="card-erp p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
            1. General Requisition Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Request Number Format
              </label>
              <input
                type="text"
                disabled
                value={`REQ-${user?.department_code || 'DEPT'}-YYYYMMDD-XXXXX`}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Requested
              </label>
              <input
                type="text"
                disabled
                value={new Date().toLocaleDateString()}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Date *
              </label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Low">Low Priority</option>
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prepared By *
              </label>
              <input
                type="text"
                required
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Full name of requester"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Position / Designation
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior System Engineer"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                disabled
                value={user?.department_name || 'Department Requisition'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Purpose & Business Justification */}
        <div className="card-erp p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
            2. Purpose & Business Justification
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purpose of Request *
              </label>
              <textarea
                required
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the operational need or item purpose in detail..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Justification
              </label>
              <textarea
                rows={2}
                value={businessJustification}
                onChange={(e) => setBusinessJustification(e.target.value)}
                placeholder="Explain the business impact or ROI justification for management approval..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Request Items Table */}
        <div className="card-erp p-6">
          <DynamicItemRows items={items} onChange={setItems} uomOptions={uomOptions} />
        </div>

        {/* Section 4: Attachments */}
        <div className="card-erp p-6">
          <AttachmentUploader files={files} onFilesChange={setFiles} />
        </div>
      </form>
    </div>
  );
}
