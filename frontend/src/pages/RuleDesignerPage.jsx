import React, { useState, useEffect } from 'react';
import { ShieldAlert, Play, Plus, CheckCircle, Sliders } from 'lucide-react';
import DataTable from '../components/DataTable';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function RuleDesignerPage() {
  const { addToast } = useNotification();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testPayload, setTestPayload] = useState('{\n  "total_amount": 75000,\n  "currency": "PHP",\n  "priority": "Urgent"\n}');
  const [testResult, setTestResult] = useState(null);

  const initialRules = [
    {
      id: 'rule_high_val_executive',
      name: 'High Value Requisition Executive Approval Threshold',
      phase: 'BEFORE_APPROVAL',
      priority: 1,
      is_active: 1,
      condition_summary: 'total_amount > 50000 AND currency == PHP',
      action_summary: 'REQUIRE_EXECUTIVE_APPROVAL'
    },
    {
      id: 'rule_urgent_priority_alert',
      name: 'Urgent Priority Immediate Manager Alert',
      phase: 'AFTER_SAVE',
      priority: 2,
      is_active: 1,
      condition_summary: 'priority == Urgent',
      action_summary: 'SEND_NOTIFICATION'
    }
  ];

  useEffect(() => {
    setRules(initialRules);
    setLoading(false);
  }, []);

  const handleTestRule = async () => {
    try {
      const parsed = JSON.parse(testPayload);
      const res = await api.post('/rules/execute', { payload: parsed, phase: 'BEFORE_APPROVAL' });
      setTestResult(res.data.data);
      addToast('Rule simulation test executed!', 'success');
    } catch (e) {
      addToast('Invalid JSON payload or evaluation error.', 'error');
    }
  };

  const columns = [
    { header: 'Rule ID', accessor: 'id', render: (row) => <span className="font-mono text-[11px] font-bold text-blue-600">{row.id}</span> },
    { header: 'Rule Name', accessor: 'name', render: (row) => <span className="font-bold text-slate-800">{row.name}</span> },
    { header: 'Phase', accessor: 'phase', render: (row) => <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 uppercase">{row.phase}</span> },
    { header: 'Condition Rule', accessor: 'condition_summary', render: (row) => <code className="p-1 bg-slate-100 rounded text-[11px] font-mono text-slate-700">{row.condition_summary}</code> },
    { header: 'Action', accessor: 'action_summary', render: (row) => <span className="font-bold text-emerald-600">{row.action_summary}</span> },
    { header: 'Status', accessor: 'is_active', render: (row) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span> }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" /> Business Rules Engine (BRE) & Process Automation
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure rule-based routing, automatic threshold approvals (PHP), and simulation testing.</p>
        </div>
      </div>

      <DataTable columns={columns} data={rules} loading={loading} />

      {/* Interactive Simulation Runner */}
      <div className="card-erp p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-600" /> BRE Rule Simulation Runner
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sample Document JSON Payload</label>
            <textarea
              rows={5}
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="w-full p-3 font-mono bg-slate-900 text-emerald-400 rounded-lg text-xs"
            />
            <button
              onClick={handleTestRule}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Play className="w-4 h-4" /> Run Simulation Test
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Simulation Execution Output</label>
            {testResult ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-mono text-xs">
                <p className="text-emerald-700 font-bold">✓ Execution Time: {testResult.executionTimeMs}ms</p>
                <p className="text-slate-700">Matched Rules: {JSON.stringify(testResult.matchedRules)}</p>
                <p className="text-blue-700 font-bold">Executive Approval Required: {String(testResult.requireExecutiveApproval)}</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-center">
                Click 'Run Simulation Test' to inspect rule evaluation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
