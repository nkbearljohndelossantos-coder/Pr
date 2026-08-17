import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Search, Check, ChevronDown, RotateCcw, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { systemApi } from '../services/systemApi';

export default function EmployeeSelect({
  preparedBy,
  setPreparedBy,
  department,
  setDepartment,
  position,
  setPosition,
  onSelectEmployee
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
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
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load employees list:', err);
    } finally {
      setLoading(false);
    }
  };

  const autoMatchEmployee = (typedName) => {
    if (!typedName || !employees.length) return;
    const q = typedName.trim().toLowerCase();
    const matched = employees.find((e) => {
      const eName = (e.name || '').toLowerCase();
      const eId = (e.employee_id || '').toLowerCase();
      const eBarcode = (e.barcode_number || '').toLowerCase();
      return (
        eName === q ||
        eName.includes(q) ||
        eId === q ||
        eBarcode === q ||
        eName.replace(/,/g, '').includes(q)
      );
    });

    if (matched) {
      handleSelect(matched, false);
    }
  };

  const filtered = employees.filter((emp) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const name = (emp.name || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const empId = (emp.employee_id || '').toLowerCase();
    const barcode = (emp.barcode_number || '').toLowerCase();

    return (
      name.includes(q) ||
      name.replace(/,/g, '').includes(q) ||
      dept.includes(q) ||
      empId.includes(q) ||
      barcode.includes(q)
    );
  });

  const handleSelect = (emp, closeMenu = true) => {
    setSelectedEmp(emp);
    setPreparedBy(emp.name || emp.full_name || '');

    // Set department string from live Canteen employee
    if (setDepartment && emp.department) {
      setDepartment(emp.department);
    }

    // Set position if provided by API, otherwise keep existing
    if (setPosition && emp.position) {
      setPosition(emp.position);
    }

    if (onSelectEmployee) {
      onSelectEmployee(emp);
    }

    if (closeMenu) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span>Prepared By (Employee Requester)</span>
          <span className="text-rose-500 font-bold">*</span>
        </span>
        {loading ? (
          <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Syncing Real Canteen Employees...
          </span>
        ) : employees.length > 0 ? (
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{employees.length} Real Canteen Employees Live</span>
          </span>
        ) : null}
      </label>

      <div className="relative">
        <input
          type="text"
          required
          value={preparedBy}
          onChange={(e) => {
            const val = e.target.value;
            setPreparedBy(val);
            autoMatchEmployee(val);
          }}
          onBlur={(e) => {
            autoMatchEmployee(e.target.value);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder="Search or click to select employee name from Canteen..."
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
        <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        <button
          type="button"
          onClick={toggleDropdown}
          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Matched Employee Live Indicator */}
      {selectedEmp && (
        <div className="mt-1.5 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">
            <strong>Verified Employee:</strong> {selectedEmp.name} — Department: <span className="font-bold text-blue-700">{selectedEmp.department || 'General'}</span> {selectedEmp.employee_id && <span className="font-mono text-slate-500">({selectedEmp.employee_id})</span>}
          </span>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-auto bg-white border border-slate-200 rounded-xl shadow-2xl divide-y divide-slate-100 text-xs animate-fadeIn">
          {/* Search Header */}
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 sticky top-0 z-10">
            <div className="flex items-center gap-1.5 flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, department, or employee ID..."
                className="w-full bg-transparent text-xs text-slate-800 focus:outline-none"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-blue-600 hover:underline shrink-0 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            filtered.map((emp) => {
              const isSelected = preparedBy && preparedBy.toLowerCase() === (emp.name || '').toLowerCase();
              return (
                <div
                  key={emp.id || emp.employee_id}
                  onClick={() => handleSelect(emp, true)}
                  className={`p-2.5 cursor-pointer flex items-center justify-between hover:bg-blue-50/80 transition-colors ${
                    isSelected ? 'bg-blue-50 font-semibold border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs text-slate-800 font-semibold truncate">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-blue-700">{emp.department || 'General'}</span>
                      {emp.employee_id && (
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[9px] border border-slate-200">
                          {emp.employee_id}
                        </span>
                      )}
                      {emp.position && (
                        <span className="text-slate-400 italic truncate max-w-[120px]">
                          • {emp.position}
                        </span>
                      )}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs text-slate-500 font-medium">No matching employee for "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100 cursor-pointer"
              >
                Show All {employees.length} Real Employees
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
