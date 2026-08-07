import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  ArrowLeft, 
  Building2,
  FileCheck,
  CheckCheck
} from 'lucide-react';
import RequestStatusStepper from '../components/RequestStatusStepper';
import ConfirmModal from '../components/ConfirmModal';
import { requestApi } from '../services/systemApi';
import { STATUS_COLORS } from '../constants/status';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionModal, setActionModal] = useState({ open: false, targetStatus: '' });

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const res = await requestApi.getById(id);
      if (res.data.success) {
        setRequest(res.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load request details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      const res = await requestApi.updateStatus(id, { status, remarks: approvalNotes });
      if (res.data.success) {
        addToast(`Request status updated to '${status}' successfully!`, 'success');
        setRequest(res.data.data);
        setApprovalNotes('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handlePrintPdf = () => {
    const pdfUrl = `/api/requests/${id}/pdf`;
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading requisition details...</div>;
  }

  if (!request) {
    return <div className="p-8 text-center text-xs text-rose-600 font-bold">Request not found.</div>;
  }

  const canApproveOrReject = user?.role === 'admin' || user?.role === 'executive';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/requests')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">{request.request_number}</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${STATUS_COLORS[request.status]}`}>
                {request.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Requested by <strong className="text-slate-700">{request.prepared_by}</strong> ({request.department_name})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print PDF Button */}
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Print Request PDF</span>
          </button>

          {/* Admin & Executive Approval Action Buttons */}
          {canApproveOrReject && request.status !== 'Approved' && request.status !== 'Rejected' && (
            <>
              <button
                onClick={() => setActionModal({ open: true, targetStatus: 'Approved' })}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => setActionModal({ open: true, targetStatus: 'Rejected' })}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}

          {canApproveOrReject && request.status === 'Approved' && (
            <button
              onClick={() => handleStatusUpdate('Completed')}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold shadow-md"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark Completed</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Workflow Progress Stepper */}
      <RequestStatusStepper currentStatus={request.status} />

      {/* Section 1: General Info Card */}
      <div className="card-erp p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          Requisition Metadata Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Request Number</span>
            <span className="font-bold text-blue-600">{request.request_number}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-semibold text-slate-800">{request.department_name} ({request.department_code})</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Prepared By</span>
            <span className="font-semibold text-slate-800">{request.prepared_by}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Position</span>
            <span className="font-semibold text-slate-800">{request.position || 'N/A'}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Date Requested</span>
            <span className="font-medium text-slate-700">{new Date(request.created_at).toLocaleDateString()}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Required Date</span>
            <span className="font-medium text-slate-700">{request.required_date}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Priority</span>
            <span className="font-bold text-slate-800">{request.priority}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Total Estimated Cost</span>
            <span className="font-bold text-emerald-600 text-sm">${Number(request.total_estimated_cost || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium mb-1">Purpose of Request</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700">
              {request.purpose}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Business Justification</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700">
              {request.business_justification || 'No justification provided.'}
            </div>
          </div>
        </div>

        {request.remarks && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
            <span className="font-bold text-amber-800 block">Approval Remarks / Notes:</span>
            <p className="text-amber-900 mt-0.5">{request.remarks}</p>
          </div>
        )}
      </div>

      {/* Section 2: Items Table */}
      <div className="card-erp p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          Request Items Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 w-10">#</th>
                <th className="px-3 py-2">Item Description</th>
                <th className="px-3 py-2 text-right">Quantity</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2 text-right">Est. Cost ($)</th>
                <th className="px-3 py-2 text-right">Total ($)</th>
                <th className="px-3 py-2">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {request.items && request.items.length > 0 ? (
                request.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{item.item_description}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{Number(item.quantity).toFixed(2)}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-500">{item.unit}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">${Number(item.estimated_cost).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-800">${Number(item.total_cost).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-slate-500">{item.remarks || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-slate-400">No items recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-800">
          <span>GRAND TOTAL ESTIMATED COST:</span>
          <span className="text-sm text-blue-600">${Number(request.total_estimated_cost || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Section 3: Attachments */}
      <div className="card-erp p-6 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          Attachments & Uploaded Documents ({request.attachments?.length || 0})
        </h3>

        {request.attachments && request.attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {request.attachments.map((att) => (
              <a
                key={att.id}
                href={`/uploads/${att.filename}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">{att.original_name}</p>
                    <p className="text-[10px] text-slate-400">{(att.file_size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 hover:text-blue-600 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">No attachments uploaded for this request.</p>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, targetStatus: '' })}
        onConfirm={() => handleStatusUpdate(actionModal.targetStatus)}
        title={`Confirm Request ${actionModal.targetStatus}`}
        message={
          <div>
            <p className="mb-2">Are you sure you want to mark request {request.request_number} as <strong>{actionModal.targetStatus}</strong>?</p>
            <textarea
              rows={2}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add optional approval or rejection remarks..."
              className="w-full p-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none mt-2"
            />
          </div>
        }
        confirmText={`Yes, ${actionModal.targetStatus}`}
        type={actionModal.targetStatus === 'Rejected' ? 'danger' : 'primary'}
      />
    </div>
  );
}
