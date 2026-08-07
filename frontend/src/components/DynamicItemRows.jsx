import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';

export default function DynamicItemRows({ items, setItems, units = [] }) {
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'quantity' || field === 'estimated_cost') {
      const q = Number(updated[index].quantity || 0);
      const c = Number(updated[index].estimated_cost || 0);
      updated[index].total = (q * c).toFixed(2);
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { item_description: '', quantity: 1, unit: 'PCS', estimated_cost: 0, total: '0.00', remarks: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Requisition Items List</h4>
        <button
          type="button"
          onClick={addItemRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Item Line
        </button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-3 py-2.5 w-12 text-center">#</th>
              <th className="px-3 py-2.5">Item Description</th>
              <th className="px-3 py-2.5 w-24">Qty</th>
              <th className="px-3 py-2.5 w-28">Unit</th>
              <th className="px-3 py-2.5 w-32">Est. Unit Cost (₱)</th>
              <th className="px-3 py-2.5 w-32 text-right">Total (₱)</th>
              <th className="px-3 py-2.5 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-3 py-2.5 text-center font-medium text-slate-400">{idx + 1}</td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Enter detailed description..."
                    value={item.item_description}
                    onChange={(e) => handleItemChange(idx, 'item_description', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-600"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-center focus:outline-none focus:border-blue-600"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={item.unit}
                    onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-600"
                  >
                    {units.length > 0 ? (
                      units.map((u, uIdx) => (
                        <option key={u.id || u.code || uIdx} value={u.code}>
                          {u.label}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="PCS">Pieces (PCS)</option>
                        <option value="BOX">Boxes (BOX)</option>
                        <option value="SET">Sets (SET)</option>
                        <option value="LOT">Lots (LOT)</option>
                        <option value="KG">Kilograms (KG)</option>
                      </>
                    )}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={item.estimated_cost}
                    onChange={(e) => handleItemChange(idx, 'estimated_cost', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-right focus:outline-none focus:border-blue-600"
                  />
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-slate-800">
                  {formatCurrency(item.total || 0)}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    type="button"
                    disabled={items.length <= 1}
                    onClick={() => removeItemRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
            <tr>
              <td colSpan={5} className="px-4 py-3 text-right text-slate-700">
                TOTAL ESTIMATED REQUISITION COST:
              </td>
              <td className="px-3 py-3 text-right text-blue-600 text-sm">
                {formatCurrency(grandTotal)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
