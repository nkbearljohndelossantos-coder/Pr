const REQUEST_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CLOSED: 'Closed'
};

const STATUS_COLORS = {
  [REQUEST_STATUS.DRAFT]: 'bg-slate-100 text-slate-700 border-slate-300',
  [REQUEST_STATUS.SUBMITTED]: 'bg-blue-50 text-blue-700 border-blue-200',
  [REQUEST_STATUS.UNDER_REVIEW]: 'bg-purple-50 text-purple-700 border-purple-200',
  [REQUEST_STATUS.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [REQUEST_STATUS.REJECTED]: 'bg-rose-50 text-rose-700 border-rose-200',
  [REQUEST_STATUS.COMPLETED]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  [REQUEST_STATUS.CLOSED]: 'bg-gray-100 text-gray-600 border-gray-300'
};

module.exports = { REQUEST_STATUS, STATUS_COLORS };
