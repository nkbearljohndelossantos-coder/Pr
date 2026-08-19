import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ArrowLeft, 
  CheckCheck,
  ZoomIn,
  Pencil,
  Send
} from 'lucide-react';
import RequestStatusStepper from '../components/RequestStatusStepper';
import ConfirmModal from '../components/ConfirmModal';
import FilePreviewModal from '../components/FilePreviewModal';
import { requestApi } from '../services/systemApi';
import { STATUS_COLORS } from '../constants/status';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, formatQuantity } from '../utils/numberFormat';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionModal, setActionModal] = useState({ open: false, targetStatus: '' });
  const [previewFile, setPreviewFile] = useState(null);

  const actionParam = searchParams.get('action');

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  useEffect(() => {
    if (request && actionParam) {
      if (actionParam === 'approve' && request.status !== 'Approved') {
        setActionModal({ open: true, targetStatus: 'Approved' });
      } else if (actionParam === 'decline' && request.status !== 'Rejected') {
        setActionModal({ open: true, targetStatus: 'Rejected' });
      }
    }
  }, [request, actionParam]);

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
        addToast(status === 'Submitted' ? `Request submitted for Executive Approval! Notification email dispatched to Approver.` : `Request status updated to '${status}' successfully!`, 'success');
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
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Requisition Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested requisition form (ID: #{id}) could not be found or has been removed.
        </p>
        <button
          onClick={() => navigate('/requests')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Requisitions List</span>
        </button>
      </div>
    );
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
          {/* Edit & Submit for Approval Buttons */}
          {request.status === 'Draft' && (
            <button
              onClick={() => handleStatusUpdate('Submitted')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          )}

          {request.status !== 'Approved' && (
            <button
              onClick={() => navigate(`/requests/${id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Request</span>
            </button>
          )}

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
            <span className="font-bold text-emerald-600 text-sm font-mono">{formatCurrency(request.total_estimated_cost)}</span>
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

      {/* Section 2: Request Items Breakdown */}
      {(() => {
        const allItems = request.items || [];
        const physicalItems = allItems.filter(i => i.item_type !== 'subscription');
        const subscriptionItems = allItems.filter(i => i.item_type === 'subscription');

        const formatBillingCycle = (unit) => {
          const map = {
            '1_MONTH': '1 Month (Monthly)',
            'MONTHLY': '1 Month (Monthly)',
            '3_MONTHS': '3 Months (Quarterly)',
            'QUARTERLY': '3 Months (Quarterly)',
            '6_MONTHS': '6 Months (Semi-Annual)',
            'SEMI_ANNUAL': '6 Months (Semi-Annual)',
            '12_MONTHS': '12 Months (1 Year)',
            'ANNUAL': '12 Months (1 Year)',
            '24_MONTHS': '24 Months (2 Years)',
            '36_MONTHS': '36 Months (3 Years)',
            '48_MONTHS': '48 Months (4 Years)',
            '60_MONTHS': '60 Months (5 Years)',
            'ONE_TIME': 'One-Time Permanent License'
          };
          return map[unit] || unit;
        };

        return (
          <>
            {physicalItems.length > 0 && (
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
                        <th className="px-3 py-2 text-right">Est. Cost (₱)</th>
                        <th className="px-3 py-2 text-right">Total (₱)</th>
                        <th className="px-3 py-2">Remarks / Specs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {physicalItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-medium text-slate-800">{item.item_description}</td>
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{formatQuantity(item.quantity)}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-500">{item.unit}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-600">{formatCurrency(item.estimated_cost)}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800">{formatCurrency(item.total_cost)}</td>
                          <td className="px-3 py-2.5 text-slate-500">{item.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subscriptionItems.length > 0 && (
              <div className="card-erp p-6 space-y-4">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide border-b border-indigo-100 pb-2 flex items-center gap-2">
                  <span>Subscriptions Breakdown</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-indigo-50/70 text-indigo-900 font-semibold border-b border-indigo-200">
                      <tr>
                        <th className="px-3 py-2 w-10">#</th>
                        <th className="px-3 py-2">Subscription / Service Name</th>
                        <th className="px-3 py-2">Billing Cycle</th>
                        <th className="px-3 py-2 text-right">Seats / Licenses</th>
                        <th className="px-3 py-2 text-right">Unit Rate (₱)</th>
                        <th className="px-3 py-2 text-right">Total (₱)</th>
                        <th className="px-3 py-2">Period / Renewal Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {subscriptionItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-indigo-50/20">
                          <td className="px-3 py-2.5 font-bold text-indigo-500">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800">{item.item_description}</td>
                          <td className="px-3 py-2.5 font-bold text-indigo-700 font-mono">{formatBillingCycle(item.unit)}</td>
                          <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{formatQuantity(item.quantity, 0)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-600">{formatCurrency(item.estimated_cost)}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-indigo-800">{formatCurrency(item.total_cost)}</td>
                          <td className="px-3 py-2.5 text-slate-600">{item.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="card-erp p-4 bg-slate-50 flex justify-between items-center text-xs font-bold text-slate-800">
              <span>COMBINED GRAND TOTAL ESTIMATED COST:</span>
              <span className="text-base text-blue-600 font-mono">{formatCurrency(request.total_estimated_cost)}</span>
            </div>
          </>
        );
      })()}

      {/* Section 3: Attachments */}
      <div className="card-erp p-6 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
          Attachments & Uploaded Documents ({request.attachments?.length || 0})
        </h3>

        {request.attachments && request.attachments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {request.attachments.map((att) => {
              const isImg = att.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.original_name || att.filename);
              const previewUrl = att.filename?.startsWith('/') ? att.filename : `/uploads/${att.filename}`;

              return (
                <div
                  key={att.id}
                  className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all flex flex-col"
                >
                  <div
                    onClick={() => setPreviewFile(att)}
                    className="h-28 bg-slate-100 flex items-center justify-center relative cursor-pointer overflow-hidden"
                  >
                    {isImg ? (
                      <img
                        src={previewUrl}
                        alt={att.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 p-2 text-slate-500">
                        <FileText className="w-8 h-8 text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                          {(att.original_name || att.filename || 'file').split('.').pop().toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 font-bold text-xs">
                      <ZoomIn className="w-5 h-5" />
                      <span>Enlarge</span>
                    </div>
                  </div>

                  <div className="p-2 flex items-center justify-between gap-1 bg-white border-t border-slate-100">
                    <div className="truncate min-w-0 pr-1">
                      <p className="text-[11px] font-semibold text-slate-800 truncate" title={att.original_name}>
                        {att.original_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(att.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <a
                      href={previewUrl}
                      download={att.original_name}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
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

      {/* File Lightbox Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
