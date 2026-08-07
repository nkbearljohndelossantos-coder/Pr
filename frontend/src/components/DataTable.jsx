import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export default function DataTable({
  columns,
  data = [],
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onSearch,
  onFilterChange,
  onExport,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="card-erp overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search records..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10 select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 ${col.sortable ? 'cursor-pointer hover:bg-slate-200/60' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                  Loading data records...
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key || col.header} className="px-4 py-3 align-middle">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {data.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
