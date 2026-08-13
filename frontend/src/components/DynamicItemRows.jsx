import React from 'react';
import { Plus, Trash2, Box } from 'lucide-react';
import { parseNum, formatCurrency } from '../utils/numberFormat';

export default function DynamicItemRows({ items = [], onChange, uomOptions = [] }) {
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    onChange(updated);
  };

  const addItemRow = () => {
    onChange([
      ...items,
      { item_description: '', quantity: 1, unit: 'PCS', estimated_cost: 0, remarks: '', item_type: 'item' }
    ]);
  };

  const removeItemRow = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const totalAmount = items.reduce((acc, item) => {
    const q = parseNum(item.quantity);
    const c = parseNum(item.estimated_cost);
    return acc + q * c;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Request Items Breakdown ({items.length})
          </h3>
        </div>
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
              <th className="px-3 py-2.5 w-10">#</th>
              <th className="px-3 py-2.5">Item Description <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-28">Quantity <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-28">Unit <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-36">Est. Cost (₱) <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-36">Total (₱)</th>
              <th className="px-3 py-2.5 w-40">Remarks / Specs <span className="text-rose-500 font-bold">*</span></th>
              <th className="px-3 py-2.5 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-slate-400 italic">
                  No physical items added. Click "Add Item Row" above if your request includes hardware or physical materials.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const qty = parseNum(item.quantity);
                const cost = parseNum(item.estimated_cost);
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
                        placeholder="e.g. Server RAM 64GB DDR4"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        placeholder="1"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        required
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
                            <option value="PCS">Pieces (PCS)</option>
                            <option value="BOX">Boxes (BOX)</option>
                            <option value="SET">Sets (SET)</option>
                            <option value="LOT">Lots (LOT)</option>
                            <option value="KG">Kilograms (KG)</option>
                            <option value="UNIT">Units (UNIT)</option>
                            <option value="MTR">Meters (MTR)</option>
                          </>
                        )}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={item.estimated_cost}
                        onChange={(e) => handleItemChange(idx, 'estimated_cost', e.target.value)}
                        placeholder="0.00 or 20,000.00"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono"
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-slate-800 font-mono">
                      {formatCurrency(rowTotal)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        required
                        value={item.remarks}
                        onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)}
                        placeholder="Specifications / Item note *"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove Row"
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

        {items.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>TOTAL PHYSICAL ITEMS ESTIMATED COST:</span>
            <span className="text-sm text-blue-600 font-mono">{formatCurrency(totalAmount)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
