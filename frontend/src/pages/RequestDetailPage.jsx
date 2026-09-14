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
  Send,
  Ban
} from 'lucide-react';
import RequestStatusStepper from '../components/RequestStatusStepper';
import ConfirmModal from '../components/ConfirmModal';
import FilePreviewModal from '../components/FilePreviewModal';
import api from '../services/api';
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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
      if (res.data?.success) {
        setRequest(res.data.data);
      }
    } catch (err) {
      addToast('Failed to load requisition details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await requestApi.updateStatus(id, {
        status,
        remarks: approvalNotes
      });
      addToast(`Requisition marked as ${status} successfully.`, 'success');
      setActionModal({ open: false, targetStatus: '' });
      setApprovalNotes('');
      fetchRequestDetails();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handlePrintPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await api.get(`/requests/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, '_blank');
      if (!printWindow) {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${request?.request_number || 'Requisition'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      addToast('Official PDF Requisition generated successfully.', 'success');
    } catch (err) {
      // Direct high-resolution print fallback
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDirectPrint = () => {
    window.print();
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

  const displayTotalCost = (request.items && request.items.length > 0 && (!request.total_estimated_cost || Number(request.total_estimated_cost) === 0))
    ? request.items.reduce((sum, item) => sum + (Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost))), 0)
    : (Number(request.total_estimated_cost) || 0);

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
          {request.status === 'Draft' && (
            <button
              onClick={() => handleStatusUpdate('Submitted')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          )}

          {/* Edit Request Button */}
          {request.status !== 'Approved' && request.status !== 'Completed' && request.status !== 'Cancelled' && (
            <button
              onClick={() => navigate(`/requests/${id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
              title="Edit Requisition Form"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Request</span>
            </button>
          )}

          {/* Cancel Request Button */}
          {request.status !== 'Approved' && request.status !== 'Completed' && request.status !== 'Cancelled' && (
            <button
              onClick={() => setActionModal({ open: true, targetStatus: 'Cancelled' })}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-600 border border-rose-200 text-rose-700 hover:text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
              title="Cancel this Requisition Request"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Request</span>
            </button>
          )}

          {/* Direct Browser A4 Print Button */}
          <button
            onClick={handleDirectPrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            title="Print 1-Page A4 Purchase Requisition Voucher"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Requisition (A4)</span>
          </button>

          {/* Download Server PDF Button */}
          <button
            onClick={handlePrintPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all disabled:opacity-60"
            title="Download Server Rendered PDF"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
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
            <span className="font-bold text-emerald-600 text-sm font-mono">{formatCurrency(displayTotalCost)}</span>
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
              <span className="text-base text-blue-600 font-mono">{formatCurrency(displayTotalCost)}</span>
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

      {/* Dynamic Print CSS for 1-Page A4 Precision */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
          }
          body * {
            visibility: hidden !important;
          }
          #print-requisition-voucher, #print-requisition-voucher * {
            visibility: visible !important;
          }
          #print-requisition-voucher {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .no-print, nav, aside, header {
            display: none !important;
          }
        }
      `}</style>

      {/* DEDICATED 1-PAGE A4 PURCHASE REQUISITION VOUCHER */}
      <div id="print-requisition-voucher" className="hidden print:block p-3 bg-white text-black" style={{ maxHeight: '280mm' }}>
        {/* Header Letterhead */}
        <div className="border-b-2 border-black pb-2 mb-3 text-center">
          <div className="flex justify-between items-center text-[9px] text-gray-600 font-mono mb-1">
            <span>NKB MANUFACTURING ENTERPRISE ERP</span>
            <span className="font-bold uppercase tracking-wider text-black">OFFICIAL PROCUREMENT VOUCHER</span>
            <span>PAGE 1 OF 1</span>
          </div>
          <h1 className="text-lg font-black tracking-wider uppercase">PURCHASE REQUISITION SLIP</h1>
          <p className="text-[10px] text-gray-700 font-mono mt-0.5">
            REQ NUMBER: <strong className="text-black font-bold">{request?.request_number}</strong> | Date: {request?.created_at ? new Date(request.created_at).toLocaleDateString() : new Date().toLocaleDateString()} | Status: <strong className="uppercase">{request?.status}</strong>
          </p>
        </div>

        {/* Metadata Table */}
        <div className="grid grid-cols-2 gap-2 text-[10px] mb-3 border border-black p-2 rounded">
          <div>
            <span className="text-gray-500 font-bold block text-[8px] uppercase">Department / Division:</span>
            <strong className="text-black text-[11px]">{request?.department_name} ({request?.department_code || 'DEPT'})</strong>
          </div>
          <div>
            <span className="text-gray-500 font-bold block text-[8px] uppercase">Requested By:</span>
            <strong className="text-black text-[11px]">{request?.prepared_by} — {request?.position || 'Staff'}</strong>
          </div>
          <div className="col-span-2 pt-1 border-t border-gray-300">
            <span className="text-gray-500 font-bold block text-[8px] uppercase">Purpose of Purchase:</span>
            <span className="text-black font-semibold text-[10px]">{request?.purpose}</span>
          </div>
          {request?.business_justification && (
            <div className="col-span-2 pt-1 border-t border-gray-300">
              <span className="text-gray-500 font-bold block text-[8px] uppercase">Business Justification:</span>
              <span className="text-gray-800 text-[9px] italic">{request.business_justification}</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-black text-[9px] my-2">
          <thead>
            <tr className="bg-gray-200 border-b border-black font-bold text-black">
              <th className="border border-black p-1 text-center w-6">#</th>
              <th className="border border-black p-1 text-left">Item Description & Specifications</th>
              <th className="border border-black p-1 text-center w-12">Qty</th>
              <th className="border border-black p-1 text-center w-14">Unit</th>
              <th className="border border-black p-1 text-right w-24">Estimated Unit Cost</th>
              <th className="border border-black p-1 text-right w-24">Total Amount (₱)</th>
            </tr>
          </thead>
          <tbody>
            {(request?.items || []).map((item, idx) => {
              const lineTotal = Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost));
              return (
                <tr key={item.id || idx} className="border-b border-gray-400">
                  <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-1 font-semibold">
                    {item.item_description}
                    {item.remarks && <span className="block text-[8px] text-gray-500 italic">Note: {item.remarks}</span>}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">{formatQuantity(item.quantity)}</td>
                  <td className="border border-black p-1 text-center uppercase">{item.unit || 'Unit'}</td>
                  <td className="border border-black p-1 text-right font-mono">{formatCurrency(item.estimated_cost)}</td>
                  <td className="border border-black p-1 text-right font-mono font-bold bg-gray-50">{formatCurrency(lineTotal)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold text-[10px] border-t-2 border-black">
              <td colSpan={5} className="border border-black p-1.5 text-right uppercase tracking-wider">
                Combined Grand Total Estimated Cost:
              </td>
              <td className="border border-black p-1.5 text-right font-mono font-black text-black">
                {formatCurrency(displayTotalCost)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Supporting Image Attachments & Quotation Photos Block */}
        {(() => {
          const imageAttachments = (request?.attachments || []).filter(att => 
            att.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.original_name || att.filename)
          );

          if (imageAttachments.length === 0) return null;

          return (
            <div className="my-3 pt-2 border-t border-black page-break-inside-avoid">
              <div className="text-[9px] font-bold uppercase tracking-wider text-black mb-1.5 flex items-center justify-between">
                <span>Attached Product Photos & Quotation Proofs ({imageAttachments.length}):</span>
                <span className="text-[8px] text-gray-500 font-mono">SUPPORTING EVIDENCE</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {imageAttachments.map((img, idx) => {
                  const previewUrl = img.filename?.startsWith('/') ? img.filename : `/uploads/${img.filename}`;
                  return (
                    <div key={img.id || idx} className="border border-black p-1 rounded bg-white text-center">
                      <img 
                        src={previewUrl} 
                        alt={img.original_name || `Attachment ${idx + 1}`} 
                        className="w-full h-24 object-contain mx-auto"
                      />
                      <p className="text-[7.5px] font-semibold text-gray-800 truncate mt-1">
                        {img.original_name || img.filename}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Signatures Block */}
        <div className="mt-4 pt-2 border-t-2 border-black text-[9px] page-break-inside-avoid">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-gray-600 font-semibold mb-5">Prepared & Requested By:</div>
              <div className="border-t border-black pt-1 font-bold text-black">{request?.prepared_by}</div>
              <div className="text-[8px] text-gray-500">Requisitioner</div>
            </div>
            <div>
              <div className="text-gray-600 font-semibold mb-5">Verified & Endorsed By:</div>
              <div className="border-t border-black pt-1 font-bold text-black">Department Head</div>
              <div className="text-[8px] text-gray-500">Department Supervisor</div>
            </div>
            <div>
              <div className="text-gray-600 font-semibold mb-5">Approved For Procurement By:</div>
              <div className="border-t border-black pt-1 font-bold text-black">Executive Management</div>
              <div className="text-[8px] text-gray-500">Authorized Signatory</div>
            </div>
          </div>
          <p className="text-[8px] text-gray-500 text-center italic mt-4">
            NKB Manufacturing Corp. • Enterprise ERP System • Generated electronically on {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* File Lightbox Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
