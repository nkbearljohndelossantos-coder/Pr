import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function DynamicItemRows({ items = [], onChange, uomOptions = [] }) {
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    onChange(updated);
  };

  const addItemRow = () => {
    onChange([
      ...items,
      { item_description: '', quantity: 1, unit: 'PCS', estimated_cost: 0, remarks: '' }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const totalAmount = items.reduce((acc, item) => {
    const q = parseFloat(item.quantity) || 0;
    const c = parseFloat(item.estimated_cost) || 0;
    return acc + q * c;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Request Items Breakdown ({items.length})
        </h3>
        <button
          type="button"
          onClick={addItemRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item Row</span>
        </button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-10">#</th>
              <th className="px-3 py-2">Item Description *</th>
              <th className="px-3 py-2 w-24">Quantity</th>
              <th className="px-3 py-2 w-28">Unit</th>
              <th className="px-3 py-2 w-32">Est. Cost ($)</th>
              <th className="px-3 py-2 w-32">Total ($)</th>
              <th className="px-3 py-2 w-40">Remarks</th>
              <th className="px-3 py-2 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const qty = parseFloat(item.quantity) || 0;
              const cost = parseFloat(item.estimated_cost) || 0;
              const rowTotal = qty * cost;

              return (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-3 py-2 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      required
                      value={item.item_description}
                      onChange={(e) => handleItemChange(idx, 'item_description', e.target.value)}
                      placeholder="e.g. Server Ram 64GB DDR4"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    >
                      {uomOptions.length > 0 ? (
                        uomOptions.map((u) => (
                          <option key={u.code} value={u.code}>{u.label}</option>
                        ))
                      ) : (
                        <>
                          <option value="PCS">PCS</option>
                          <option value="BOX">BOX</option>
                          <option value="SET">SET</option>
                          <option value="LOT">LOT</option>
                          <option value="KG">KG</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.estimated_cost}
                      onChange={(e) => handleItemChange(idx, 'estimated_cost', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-800">
                    ${rowTotal.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)}
                      placeholder="Optional notes"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Total Summary Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
          <span>GRAND TOTAL ESTIMATED COST:</span>
          <span className="text-sm text-blue-600">${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
