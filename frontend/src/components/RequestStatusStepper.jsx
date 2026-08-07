import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function RequestStatusStepper({ currentStatus = 'Draft' }) {
  const steps = [
    { label: 'Draft', code: 'Draft' },
    { label: 'Submitted', code: 'Submitted' },
    { label: 'Under Review', code: 'Under Review' },
    { label: 'Approved / Rejected', code: 'Approved' },
    { label: 'Completed', code: 'Completed' },
    { label: 'Closed', code: 'Closed' }
  ];

  const getStepState = (stepCode, index) => {
    if (currentStatus === 'Rejected' && stepCode === 'Approved') {
      return 'rejected';
    }
    const statusOrder = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Completed', 'Closed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepCode);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const state = getStepState(step.code, idx);

          return (
            <div key={step.code} className="flex flex-col items-center relative z-10 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                  state === 'completed'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : state === 'active'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : state === 'rejected'
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {state === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : state === 'rejected' ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center ${
                  state === 'active'
                    ? 'text-blue-600 font-bold'
                    : state === 'completed'
                    ? 'text-emerald-700'
                    : state === 'rejected'
                    ? 'text-rose-600'
                    : 'text-slate-400'
                }`}
              >
                {state === 'rejected' ? 'Rejected' : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
