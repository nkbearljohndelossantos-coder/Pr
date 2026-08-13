import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, ArrowLeft, AlertCircle } from 'lucide-react';
import DynamicItemRows from '../components/DynamicItemRows';
import DynamicSubscriptionRows from '../components/DynamicSubscriptionRows';
import AttachmentUploader from '../components/AttachmentUploader';
import EmployeeSelect from '../components/EmployeeSelect';
import { requestApi, systemApi } from '../services/systemApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { parseNum } from '../utils/numberFormat';

export default function CreateRequestPage() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [preparedBy, setPreparedBy] = useState(user?.full_name || user?.username || '');
  const [departmentName, setDepartmentName] = useState(user?.department_name || user?.department_code || '');
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
    { item_description: '', quantity: 1, unit: 'PCS', estimated_cost: 0, remarks: '', item_type: 'item' }
  ]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUomOptions();
    if (id) {
      fetchExistingRequest(id);
    }
  }, [id]);

  const fetchExistingRequest = async (reqId) => {
    try {
      const res = await requestApi.getById(reqId);
      if (res.data?.success) {
        const data = res.data.data;
        if (data.status === 'Approved') {
          addToast('Cannot edit a request that has already been approved.', 'error');
          navigate(`/requests/${reqId}`);
          return;
        }

        setPreparedBy(data.prepared_by || '');
        setDepartmentName(data.department_name || '');
        setPosition(data.position || '');
        setRequiredDate(data.required_date ? data.required_date.split('T')[0] : '');
        setPurpose(data.purpose || '');
        setBusinessJustification(data.business_justification || '');
        setPriority(data.priority || 'Normal');

        const physItems = (data.items || []).filter((i) => i.item_type !== 'subscription');
        const subItems = (data.items || []).filter((i) => i.item_type === 'subscription');

        if (physItems.length > 0) {
          setItems(physItems);
        }
        if (subItems.length > 0) {
          setSubscriptions(subItems);
        }
        if (data.attachments) {
          setExistingAttachments(data.attachments);
        }
      }
    } catch (err) {
      addToast('Failed to load request details for editing.', 'error');
      navigate('/requests');
    }
  };

  const fetchUomOptions = async () => {
    try {
      const res = await systemApi.getMasterData('unit_of_measure');
      if (res.data?.success) {
        setUomOptions(res.data.data);
      }
    } catch (e) {}
  };

  const getValidItems = () => {
    return items.filter(
      (i) => (i.item_description && i.item_description.trim() !== '') || Number(i.estimated_cost) > 0 || (i.remarks && i.remarks.trim() !== '')
    );
  };

  const getValidSubscriptions = () => {
    return subscriptions.filter(
      (s) => (s.item_description && s.item_description.trim() !== '') || Number(s.estimated_cost) > 0 || (s.remarks && s.remarks.trim() !== '')
    );
  };

  const validateForm = () => {
    if (!preparedBy.trim()) {
      addToast('Field Required: "Prepared By (Requester Name)" cannot be left blank.', 'error');
      return false;
    }
    if (!position.trim()) {
      addToast('Field Required: "Position / Designation" cannot be left blank.', 'error');
      return false;
    }
    if (!requiredDate) {
      addToast('Field Required: "Required Date" cannot be left blank.', 'error');
      return false;
    }
    if (!priority) {
      addToast('Field Required: "Priority Level" cannot be left blank.', 'error');
      return false;
    }
    if (!purpose.trim()) {
      addToast('Field Required: "Purpose of Request" cannot be left blank.', 'error');
      return false;
    }
    const validItems = getValidItems();
    const validSubs = getValidSubscriptions();

    if (validItems.length === 0 && validSubs.length === 0) {
      addToast('Requisition Requirement: Please add at least ONE Physical Item row OR ONE Subscription row.', 'error');
      return false;
    }

    // Validate physical items if user added physical items
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      if (!item.item_description || !item.item_description.trim()) {
        addToast(`Physical Item Row #${i + 1}: "Item Description" cannot be left blank.`, 'error');
        return false;
      }
      if (parseNum(item.quantity) <= 0) {
        addToast(`Physical Item Row #${i + 1}: "Quantity" must be a number greater than 0.`, 'error');
        return false;
      }
      if (!item.unit) {
        addToast(`Physical Item Row #${i + 1}: "Unit of Measure" must be selected.`, 'error');
        return false;
      }
      if (parseNum(item.estimated_cost) <= 0) {
        addToast(`Physical Item Row #${i + 1}: "Estimated Cost" must be a valid amount greater than ₱0.00.`, 'error');
        return false;
      }
    }

    // Validate subscriptions if user added subscriptions
    for (let i = 0; i < validSubs.length; i++) {
      const sub = validSubs[i];
      if (!sub.item_description || !sub.item_description.trim()) {
        addToast(`Subscription Row #${i + 1}: "Subscription / Service Name" cannot be left blank.`, 'error');
        return false;
      }
      if (parseNum(sub.quantity) <= 0) {
        addToast(`Subscription Row #${i + 1}: "Seats / Qty" must be a number greater than 0.`, 'error');
        return false;
      }
      if (!sub.unit) {
        addToast(`Subscription Row #${i + 1}: "Billing Cycle" must be selected.`, 'error');
        return false;
      }
      if (parseNum(sub.estimated_cost) <= 0) {
        addToast(`Subscription Row #${i + 1}: "Unit Rate" must be a valid amount greater than ₱0.00.`, 'error');
        return false;
      }
    }

    return true;
  };

  const handleFormSubmit = async (statusType) => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const validItems = getValidItems().map((i) => ({ ...i, item_type: 'item' }));
      const validSubs = getValidSubscriptions().map((s) => ({ ...s, item_type: 'subscription' }));
      const allItemsCombined = [...validItems, ...validSubs];

      const formData = new FormData();
      formData.append('prepared_by', preparedBy.trim());
      formData.append('position', position.trim());
      formData.append('required_date', requiredDate);
      formData.append('purpose', purpose.trim());
      formData.append('business_justification', businessJustification.trim());
      formData.append('priority', priority);
      formData.append('status', statusType);
      formData.append('items', JSON.stringify(allItemsCombined));

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      if (isEditMode) {
        const res = await requestApi.update(id, formData);
        if (res.data?.success) {
          addToast(`Request ${res.data.data.request_number} updated successfully!`, 'success');
          navigate(`/requests/${id}`);
        }
      } else {
        const res = await requestApi.create(formData);
        if (res.data?.success) {
          addToast(`Request ${res.data.data.request_number} created successfully!`, 'success');
          navigate(`/requests/${res.data.data.id}`);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} request.`, 'error');
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
            <h1 className="text-xl font-bold text-slate-800">
              {isEditMode ? 'Edit Department Requisition Request' : 'Create New Department Request'}
            </h1>
            <p className="text-xs text-slate-500">
              Department: <strong className="text-blue-600">{departmentName || user?.department_name || user?.department_code || 'General'}</strong>
              <span className="ml-2 text-rose-500 font-semibold">(Mandatory fields marked with *)</span>
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

      {/* Mandatory Notification Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2.5 text-xs text-amber-800 font-medium">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Notice: At least 1 Physical Item row OR 1 Subscription row is required. All added rows must have complete non-blank details (<strong className="text-rose-600">*</strong>).</span>
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
                Required Date <span className="text-rose-500 font-bold">*</span>
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
                Priority <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                required
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

            <div className="sm:col-span-2">
              <EmployeeSelect
                preparedBy={preparedBy}
                setPreparedBy={setPreparedBy}
                department={departmentName}
                setDepartment={setDepartmentName}
                position={position}
                setPosition={setPosition}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Department name"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Position / Designation <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Staff / Specialist / Manager"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                Purpose of Request <span className="text-rose-500 font-bold">*</span>
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
                Business Justification <span className="text-rose-500 font-bold">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={businessJustification}
                onChange={(e) => setBusinessJustification(e.target.value)}
                placeholder="Explain the business impact or ROI justification for management approval..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Physical Request Items Table */}
        <div className="card-erp p-6">
          <DynamicItemRows items={items} onChange={setItems} uomOptions={uomOptions} />
        </div>

        {/* Section 4: Subscriptions Breakdown Table */}
        <div className="card-erp p-6">
          <DynamicSubscriptionRows subscriptions={subscriptions} onChange={setSubscriptions} />
        </div>

        {/* Section 5: Attachments */}
        <div className="card-erp p-6">
          <AttachmentUploader files={files} onFilesChange={setFiles} />
        </div>
      </form>
    </div>
  );
}
