import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Search, Check, ChevronDown, RotateCcw } from 'lucide-react';
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

  const getSmartPosition = (departmentName) => {
    if (!departmentName) return 'Specialist';
    const dept = departmentName.trim().toUpperCase();

    if (dept === 'CEO') return 'Chief Executive Officer';
    if (dept === 'COO') return 'Chief Operating Officer';

    const lower = departmentName.trim().toLowerCase();
    if (lower.includes('security')) return 'Security Officer';
    if (lower.includes('production')) return 'Production Specialist';
    if (lower.includes('maintenance')) return 'Maintenance Technician';
    if (lower.includes('regulatory')) return 'Regulatory Affairs Officer';
    if (lower.includes('accounting')) return 'Accounting Specialist';
    if (lower.includes('hr') || lower.includes('human')) return 'HR Officer';
    if (lower.includes('purchasing')) return 'Purchasing Specialist';
    if (lower.includes('warehouse') || lower.includes('inventory')) return 'Warehouse Officer';
    if (lower.includes('qa') || lower.includes('qc')) return 'Quality Inspector';
    if (lower.includes('engineering')) return 'Project Engineer';
    if (lower.includes('marketing')) return 'Marketing Officer';
    if (lower.includes('driver')) return 'Company Driver';
    if (lower.includes('housekeeping') || lower.includes('utility')) return 'Facilities Staff';
    if (lower.includes('r&d')) return 'R&D Specialist';

    return 'Specialist';
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

  const handleSelect = (emp) => {
    setPreparedBy(emp.name);

    // Auto-fill department
    if (emp.department && setDepartment) {
      setDepartment(emp.department);
    }

    // Auto-fill smart position title
    if (setPosition) {
      const posTitle = emp.position || emp.job_title || emp.designation || getSmartPosition(emp.department);
      setPosition(posTitle);
    }

    if (onSelectEmployee) {
      onSelectEmployee(emp);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchQuery('');
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
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder="Search or select employee name..."
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
                placeholder="Search name, dept, or ID..."
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
              return (
                <div
                  key={emp.id || emp.employee_id}
                  onClick={() => handleSelect(emp)}
                  className={`p-2.5 cursor-pointer flex items-center justify-between hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50/80 font-semibold' : ''
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs text-slate-800 font-medium truncate">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-blue-600">{emp.department || 'General'}</span>
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
