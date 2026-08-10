import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Search, Check, ChevronDown, RotateCcw, CheckCircle2 } from 'lucide-react';
import { systemApi } from '../services/systemApi';

const DEPARTMENT_POSITION_MAP = {
  'CEO': 'Chief Executive Officer',
  'COO': 'Chief Operating Officer',
  'EXECUTIVE': 'Executive Director / Manager',
  'ADMIN': 'Administrative Officer',
  'SECURITY': 'Security Officer',
  'PRODUCTION': 'Production Specialist',
  'MAINTENANCE': 'Maintenance Technician',
  'ACCOUNTING': 'Accounting Specialist',
  'COMPOUNDING': 'Compounding Chemist / Operator',
  'CONSTRUCTION': 'Construction Engineer / Supervisor',
  'COOP': 'Cooperative Officer',
  'HR': 'HR Officer',
  'IT': 'IT Systems Engineer',
  'LOGISTICS': 'Logistics Coordinator',
  'PURCHASING': 'Purchasing Specialist',
  'QA/QC': 'Quality Inspector',
  'REGULATORY': 'Regulatory Affairs Officer',
  'SALES': 'Sales Executive',
  'WAREHOUSE': 'Warehouse / Inventory Officer',
  'VYUCEUTICAL': 'Pharma Specialist',
  'PRINTING': 'Printing Press Operator',
  'SILKSCREEN': 'Silkscreen Technician'
};

export function getSmartPosition(departmentName) {
  if (!departmentName) return 'Specialist';
  const upper = departmentName.trim().toUpperCase();
  if (DEPARTMENT_POSITION_MAP[upper]) {
    return DEPARTMENT_POSITION_MAP[upper];
  }
  
  // Partial match fallbacks
  if (upper.includes('SECURITY')) return 'Security Officer';
  if (upper.includes('PROD')) return 'Production Specialist';
  if (upper.includes('MAINT')) return 'Maintenance Technician';
  if (upper.includes('ACCT') || upper.includes('ACCOUNT')) return 'Accounting Specialist';
  if (upper.includes('HR')) return 'HR Officer';
  if (upper.includes('PURCH')) return 'Purchasing Specialist';
  if (upper.includes('WAREHOUSE')) return 'Warehouse Officer';
  if (upper.includes('QA') || upper.includes('QC')) return 'Quality Inspector';
  if (upper.includes('ENG')) return 'Project Engineer';
  if (upper.includes('PRINT')) return 'Printing Press Operator';

  return `${departmentName} Specialist`;
}

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
    const matched = employees.find(
      (e) =>
        e.name.toLowerCase() === q ||
        e.name.toLowerCase().includes(q) ||
        (e.employee_id && e.employee_id.toLowerCase() === q)
    );

    if (matched) {
      handleSelect(matched, false);
    }
  };

  const filtered = employees.filter((emp) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.employee_id?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (emp, closeMenu = true) => {
    setSelectedEmp(emp);
    setPreparedBy(emp.name);

    // Auto-fill department from API
    if (emp.department && setDepartment) {
      setDepartment(emp.department);
    }

    // Auto-fill smart position title based on department from API
    if (setPosition) {
      const posTitle = emp.position || emp.job_title || emp.designation || getSmartPosition(emp.department);
      setPosition(posTitle);
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
        <span>Prepared By (Select Employee from Canteen API) <span className="text-rose-500 font-bold">*</span></span>
        {employees.length > 0 && (
          <span className="text-[10px] text-emerald-600 font-bold">● {employees.length} API Employees Loaded</span>
        )}
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
          placeholder="Type or click to select employee name..."
          className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
        <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        <button
          type="button"
          onClick={toggleDropdown}
          className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Matched Employee Live Indicator */}
      {selectedEmp && (
        <div className="mt-1.5 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">
            <strong>Matched:</strong> Department: <span className="font-bold text-blue-700">{selectedEmp.department}</span> | Position: <span className="font-bold text-indigo-700">{getSmartPosition(selectedEmp.department)}</span>
          </span>
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute z-40 left-0 right-0 mt-1 max-h-64 overflow-auto bg-white border border-slate-200 rounded-lg shadow-xl divide-y divide-slate-100 text-xs animate-fadeIn">
          {/* Search Header */}
          <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 sticky top-0 z-10">
            <div className="flex items-center gap-1.5 flex-1 bg-white border border-slate-200 rounded px-2 py-1">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, department, or ID..."
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
              const isSelected = preparedBy && preparedBy.toLowerCase() === emp.name.toLowerCase();
              const inferredPos = getSmartPosition(emp.department);
              return (
                <div
                  key={emp.id || emp.employee_id}
                  onClick={() => handleSelect(emp, true)}
                  className={`p-2.5 cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50/80 font-semibold' : ''
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs text-slate-800 font-medium truncate">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-blue-700">{emp.department}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-indigo-600 font-medium">{inferredPos}</span>
                      {emp.employee_id && <span className="font-mono text-slate-400">({emp.employee_id})</span>}
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
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100"
              >
                Show All {employees.length} Employees
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
