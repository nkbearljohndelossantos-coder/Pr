import React from 'react';

export default function KpiCard({ title, value, icon: Icon, color = 'blue', subtext }) {
  const colorMap = {
    blue: 'border-l-blue-600 text-blue-600 bg-blue-50/50',
    amber: 'border-l-amber-500 text-amber-600 bg-amber-50/50',
    emerald: 'border-l-emerald-600 text-emerald-600 bg-emerald-50/50',
    rose: 'border-l-rose-600 text-rose-600 bg-rose-50/50',
    purple: 'border-l-purple-600 text-purple-600 bg-purple-50/50'
  };

  return (
    <div className={`card-erp p-5 border-l-4 ${colorMap[color] || colorMap.blue} transition-all duration-150`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          {subtext && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
