import React from 'react';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { parseNum, formatCurrency } from '../utils/numberFormat';

export default function DynamicSubscriptionRows({ subscriptions = [], onChange }) {
  const handleSubscriptionChange = (index, field, value) => {
    const updated = [...subscriptions];
    updated[index][field] = value;
    onChange(updated);
  };

  const addSubscriptionRow = () => {
    onChange([
      ...subscriptions,
      { item_description: '', quantity: 1, unit: '12_MONTHS', estimated_cost: 0, remarks: '', item_type: 'subscription' }
    ]);
  };

  const removeSubscriptionRow = (index) => {
    const updated = subscriptions.filter((_, i) => i !== index);
    onChange(updated);
  };

  const totalSubscriptionsAmount = subscriptions.reduce((acc, item) => {
    const q = parseNum(item.quantity);
    const c = parseNum(item.estimated_cost);
    return acc + q * c;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Subscriptions Breakdown ({subscriptions.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={addSubscriptionRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Subscription Row</span>
        </button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-indigo-50/60 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2.5 w-10">#</th>
              <th className="px-3 py-2.5">Subscription / Service Name <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-32">Billing Cycle <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-24">Seats / Qty <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-36">Unit Rate (₱) <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-36">Total (₱)</th>
              <th className="px-3 py-2.5 w-48">Period / Renewal Notes <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-400 italic">
                  No subscriptions added. Click "Add Subscription Row" above if your request includes SaaS/Software/Cloud services.
                </td>
              </tr>
            ) : (
              subscriptions.map((item, idx) => {
                const qty = parseNum(item.quantity);
                const cost = parseNum(item.estimated_cost);
                const rowTotal = qty * cost;

                return (
                  <tr key={idx} className="hover:bg-indigo-50/20">
                    <td className="px-3 py-2 text-indigo-500 font-bold">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        required
                        value={item.item_description}
                        onChange={(e) => handleSubscriptionChange(idx, 'item_description', e.target.value)}
                        placeholder="e.g. Microsoft 365 E5 / AWS Cloud Hosting"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        required
                        value={item.unit || '12_MONTHS'}
                        onChange={(e) => handleSubscriptionChange(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-none font-semibold text-slate-800"
                      >
                        <option value="1_MONTH">1 Month (Monthly)</option>
                        <option value="3_MONTHS">3 Months (Quarterly)</option>
                        <option value="6_MONTHS">6 Months (Semi-Annual)</option>
                        <option value="12_MONTHS">12 Months (1 Year)</option>
                        <option value="24_MONTHS">24 Months (2 Years)</option>
                        <option value="36_MONTHS">36 Months (3 Years)</option>
                        <option value="48_MONTHS">48 Months (4 Years)</option>
                        <option value="60_MONTHS">60 Months (5 Years)</option>
                        <option value="ONE_TIME">One-Time Permanent License</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={item.quantity}
                        onChange={(e) => handleSubscriptionChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none font-semibold"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={item.estimated_cost}
                        onChange={(e) => handleSubscriptionChange(idx, 'estimated_cost', e.target.value)}
                        placeholder="0.00 or 20,000.00"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none font-mono"
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-indigo-900 font-mono">
                      {formatCurrency(rowTotal)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        required
                        value={item.remarks}
                        onChange={(e) => handleSubscriptionChange(idx, 'remarks', e.target.value)}
                        placeholder="e.g. Renewal Date: Nov 2026 *"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeSubscriptionRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove Subscription Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {subscriptions.length > 0 && (
          <div className="p-3 bg-indigo-50/80 border-t border-indigo-200 flex items-center justify-between text-xs font-bold text-indigo-900">
            <span>TOTAL SUBSCRIPTIONS ESTIMATED COST:</span>
            <span className="text-sm text-indigo-700 font-mono">{formatCurrency(totalSubscriptionsAmount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
