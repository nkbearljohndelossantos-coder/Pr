import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Printer, CheckCircle2, XCircle, Clock, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import RequestStatusStepper from '../components/RequestStatusStepper';
import ConfirmModal from '../components/ConfirmModal';
import { requestApi } from '../services/systemApi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { REQUEST_STATUS, STATUS_COLORS } from '../constants/status';
import { formatCurrency } from '../utils/currencyFormatter';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, targetStatus: '' });

  const isExecutiveOrAdmin = user?.role === 'admin' || user?.role === 'executive';

  const fetchDetail = async () => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }
    try {
      const res = await requestApi.getById(id);
      setReq(res.data.data);
    } catch (err) {
      addToast('Failed to load requisition details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      await requestApi.updateStatus(id, {
        status: modalState.targetStatus,
        remarks
      });
      addToast(`Requisition ${req.request_number} updated to '${modalState.targetStatus}'!`, 'success');
      setModalState({ isOpen: false, targetStatus: '' });
      fetchDetail();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handlePrintPdf = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('erp_token');
    const baseUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin;
    const pdfUrl = `${baseUrl}/api/v1/requests/${id}/pdf?token=${token}`;
    window.open(pdfUrl, '_blank');
  };

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading requisition details...</div>;
  if (!req) return <div className="p-8 text-center text-slate-400 text-xs">Requisition record not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{req.request_number}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[req.status]}`}>
                {req.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Print Form
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Download Official A4 PDF
          </button>

          {isExecutiveOrAdmin && req.status !== REQUEST_STATUS.APPROVED && (
            <button
              onClick={() => setModalState({ isOpen: true, targetStatus: REQUEST_STATUS.APPROVED })}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Requisition
            </button>
          )}

          {isExecutiveOrAdmin && req.status !== REQUEST_STATUS.REJECTED && (
            <button
              onClick={() => setModalState({ isOpen: true, targetStatus: REQUEST_STATUS.REJECTED })}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
            >
              <XCircle className="w-4 h-4" /> Reject Requisition
            </button>
          )}
        </div>
      </div>

      {/* Workflow Stepper */}
      <RequestStatusStepper currentStatus={req.status} />

      {/* Main Printable Requisition Document View */}
      <div id="printable-area" className="card-erp p-8 bg-white space-y-6 border border-slate-200 shadow-sm">
        {/* Document Header Branding */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Enterprise Global Industries Inc.</h2>
            <p className="text-xs text-slate-500">Official Department Purchase Requisition Document</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block">REQUISITION NO</span>
            <span className="text-base font-bold text-blue-600">{req.request_number}</span>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Department</span>
            <span className="font-bold text-slate-800">{req.department_name} ({req.department_code})</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Prepared By</span>
            <span className="font-bold text-slate-800">{req.prepared_by} ({req.position || 'Staff'})</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Required Date</span>
            <span className="font-bold text-slate-800">{new Date(req.required_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Priority</span>
            <span className="font-bold text-slate-800">{req.priority}</span>
          </div>
        </div>

        {/* Purpose & Justification */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">Purpose of Requisition:</span>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap">{req.purpose}</p>
          </div>
          {req.business_justification && req.business_justification.trim() !== '' && (
            <div>
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">Business Justification:</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 whitespace-pre-wrap">{req.business_justification}</p>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Requisition Items Breakdown</h4>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-white uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Item Description</th>
                  <th className="px-3 py-2.5 text-center">Qty</th>
                  <th className="px-3 py-2.5 text-center">Unit</th>
                  <th className="px-3 py-2.5 text-right">Est. Unit Cost (₱)</th>
                  <th className="px-3 py-2.5 text-right">Total Cost (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {(req.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{item.item_description}</td>
                    <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-slate-500">{item.unit}</td>
                    <td className="px-3 py-2.5 text-right">{formatCurrency(item.estimated_cost)}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-800">{formatCurrency(item.total_cost)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-right text-slate-700 uppercase">Grand Total Estimated Cost:</td>
                  <td className="px-3 py-3 text-right text-blue-600 text-sm">{formatCurrency(req.total_estimated_cost)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Attachments Section */}
        {req.attachments?.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Attached Documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {req.attachments.map((att) => (
                <a
                  key={att.id}
                  href={`/uploads/${att.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-semibold text-slate-700 truncate">{att.original_name}</span>
                  <Download className="w-4 h-4 text-blue-600 flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Formal Enterprise Approval Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1 font-semibold text-slate-800">{req.prepared_by}</div>
            <p className="mt-1 font-bold text-slate-500 uppercase text-[10px]">Prepared By (Staff)</p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1 font-semibold text-slate-800">{req.department_code} Head</div>
            <p className="mt-1 font-bold text-slate-500 uppercase text-[10px]">Dept Head Review</p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1 font-semibold text-slate-800">Executive Director</div>
            <p className="mt-1 font-bold text-slate-500 uppercase text-[10px]">Executive Approval</p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1 font-semibold text-slate-800">President & CEO</div>
            <p className="mt-1 font-bold text-slate-500 uppercase text-[10px]">President / CEO Sign-off</p>
          </div>
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={`Confirm Status Update: ${modalState.targetStatus}`}
        message="Please provide official review notes or instructions for the department before confirming."
        confirmText={`Confirm ${modalState.targetStatus}`}
        confirmColor={modalState.targetStatus === REQUEST_STATUS.APPROVED ? 'emerald' : 'rose'}
        onCancel={() => setModalState({ isOpen: false, targetStatus: '' })}
        onConfirm={handleUpdateStatus}
      />
    </div>
  );
}
