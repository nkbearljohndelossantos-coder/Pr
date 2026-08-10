import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Search, Check, ChevronDown } from 'lucide-react';
import { systemApi } from '../services/systemApi';

export default function EmployeeSelect({
  preparedBy,
  setPreparedBy,
  position,
  setPosition,
  onSelectEmployee
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await systemApi.getEmployees();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load employees list:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter((emp) => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.employee_id?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (emp) => {
    setPreparedBy(emp.name);
    if (!position || position.trim() === '') {
      setPosition(emp.department ? `${emp.department} Staff` : 'Staff');
    }
    if (onSelectEmployee) {
      onSelectEmployee(emp);
    }
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        Prepared By (Select Employee or Type Name) <span className="text-rose-500 font-bold">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          required
          value={preparedBy}
          onChange={(e) => {
            setPreparedBy(e.target.value);
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search or select employee name..."
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
        <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute z-40 left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-lg shadow-xl divide-y divide-slate-100 text-xs animate-fadeIn">
          {/* Quick Search Header */}
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, department, or ID..."
              className="w-full bg-transparent text-xs text-slate-700 focus:outline-none"
            />
            {loading && <span className="text-[10px] text-blue-600 animate-pulse font-semibold">Loading...</span>}
          </div>

          {filtered.length > 0 ? (
            filtered.map((emp) => {
              const isSelected = preparedBy.toLowerCase() === emp.name.toLowerCase();
              return (
                <div
                  key={emp.id || emp.employee_id}
                  onClick={() => handleSelect(emp)}
                  className={`p-2.5 cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50/70 font-semibold' : ''
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs text-slate-800 font-medium truncate">{emp.name}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{emp.department || 'General'}</span>
                      {emp.employee_id && <span className="font-mono text-slate-400">({emp.employee_id})</span>}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center text-slate-400 text-xs">
              No matching employee found. You can type any custom name.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
