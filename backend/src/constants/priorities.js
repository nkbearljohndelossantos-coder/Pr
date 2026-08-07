const PRIORITIES = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent'
};

const PRIORITY_BADGES = {
  [PRIORITIES.LOW]: 'bg-slate-100 text-slate-800 border-slate-200',
  [PRIORITIES.NORMAL]: 'bg-blue-50 text-blue-700 border-blue-200',
  [PRIORITIES.HIGH]: 'bg-amber-50 text-amber-700 border-amber-200',
  [PRIORITIES.URGENT]: 'bg-rose-50 text-rose-700 border-rose-200'
};

module.exports = { PRIORITIES, PRIORITY_BADGES };
