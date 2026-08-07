import React from 'react';
import { CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { REQUEST_STATUS } from '../constants/status';

export default function RequestStatusStepper({ currentStatus }) {
  const steps = [
    { key: REQUEST_STATUS.DRAFT, label: 'Draft' },
    { key: REQUEST_STATUS.SUBMITTED, label: 'Submitted' },
    { key: REQUEST_STATUS.UNDER_REVIEW, label: 'Under Review' },
    { key: REQUEST_STATUS.APPROVED, label: 'Approved' },
    { key: REQUEST_STATUS.COMPLETED, label: 'Completed' }
  ];

  const isRejected = currentStatus === REQUEST_STATUS.REJECTED;

  const getCurrentIndex = () => {
    if (isRejected) return 2;
    const idx = steps.findIndex((s) => s.key === currentStatus);
    return idx >= 0 ? idx : 1;
  };

  const currentIndex = getCurrentIndex();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                  isCurrent && isRejected
                    ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent && isRejected ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${isCurrent ? 'text-blue-600 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
