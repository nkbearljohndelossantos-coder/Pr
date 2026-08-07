import React from 'react';

export default function KpiCard({ title, value, icon: Icon, color = 'blue', badgeText }) {
  const colorMap = {
    blue: 'border-l-blue-600 text-blue-600 bg-blue-50/50',
    amber: 'border-l-amber-500 text-amber-600 bg-amber-50/50',
    emerald: 'border-l-emerald-600 text-emerald-600 bg-emerald-50/50',
    rose: 'border-l-rose-600 text-rose-600 bg-rose-50/50',
    purple: 'border-l-purple-600 text-purple-600 bg-purple-50/50'
  };

  return (
    <div className={`card-erp border-l-4 p-5 flex items-center justify-between transition-all duration-200 hover:shadow-md ${colorMap[color] || colorMap.blue}`}>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        {badgeText && <span className="text-[11px] text-slate-400 font-medium mt-1 block">{badgeText}</span>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
