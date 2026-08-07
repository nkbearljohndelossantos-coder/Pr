const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const env = require('./env');
const logger = require('../utils/logger');

const dataDir = path.join(__dirname, '../../data');
const dbFile = path.join(dataDir, 'erp_store.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let store = {
  companies: [],
  branches: [],
  accounts: [],
  departments: [],
  users: [],
  requests: [],
  request_items: [],
  attachments: [],
  master_dropdowns: [],
  master_units: [],
  master_categories: [],
  master_priorities: [],
  master_statuses: [],
  permissions: [],
  role_permissions: [],
  workflow_templates: [],
  notifications: [],
  audit_logs: [],
  backups: []
};

const saveStore = () => {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    logger.error('Failed to persist database store:', e);
  }
};

const loadStore = () => {
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(raw);
      store = { ...store, ...parsed };
      logger.info(`Enterprise ERP Store loaded from disk. Active requests: ${store.requests.length}`);
      return true;
    } catch (e) {
      logger.error('Failed to load erp_store.json:', e);
    }
  }
  return false;
};

const adminHash = bcrypt.hashSync('admin123', 10);
const bossHash = bcrypt.hashSync('boss123', 10);
const deptHash = bcrypt.hashSync('password123', 10);

const initData = () => {
  const companyUuid = 'c1000000-0000-4000-a000-000000000001';
  const branchUuid = 'b1000000-0000-4000-a000-000000000001';

  store.companies = [
    { id: companyUuid, code: 'EGI-CORP', name: 'Enterprise Global Industries Inc.', is_active: 1, is_deleted: 0 }
  ];

  store.branches = [
    { id: branchUuid, company_id: companyUuid, code: 'MNL-HQ', name: 'Manila Corporate Headquarters', is_active: 1, is_deleted: 0 }
  ];

  store.master_units = [
    { id: 'u1', code: 'PCS', label: 'Pieces (PCS)', sort_order: 1, is_active: 1 },
    { id: 'u2', code: 'BOX', label: 'Boxes (BOX)', sort_order: 2, is_active: 1 },
    { id: 'u3', code: 'SET', label: 'Sets (SET)', sort_order: 3, is_active: 1 },
    { id: 'u4', code: 'LOT', label: 'Lots (LOT)', sort_order: 4, is_active: 1 },
    { id: 'u5', code: 'UNIT', label: 'Units (UNIT)', sort_order: 5, is_active: 1 },
    { id: 'u6', code: 'YEAR', label: 'Years (YEAR)', sort_order: 6, is_active: 1 },
    { id: 'u7', code: 'MONTH', label: 'Months (MONTH)', sort_order: 7, is_active: 1 }
  ];

  store.departments = [
    { id: 1, uuid: 'd1000000-0000-4000-a000-000000000001', code: 'IT', name: 'Information Technology Department', username: 'it_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 2, uuid: 'd1000000-0000-4000-a000-000000000002', code: 'HR', name: 'Human Resources Department', username: 'hr_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 3, uuid: 'd1000000-0000-4000-a000-000000000003', code: 'ACCT', name: 'Accounting Department', username: 'acct_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 4, uuid: 'd1000000-0000-4000-a000-000000000004', code: 'PURCH', name: 'Purchasing Department', username: 'purch_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 5, uuid: 'd1000000-0000-4000-a000-000000000005', code: 'PROD', name: 'Production Department', username: 'prod_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 6, uuid: 'd1000000-0000-4000-a000-000000000006', code: 'WH', name: 'Warehouse Department', username: 'wh_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 7, uuid: 'd1000000-0000-4000-a000-000000000007', code: 'QA', name: 'Quality Assurance Department', username: 'qa_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 }
  ];

  store.users = [
    { id: 1, uuid: 'a1000000-0000-4000-a000-000000000001', username: 'admin', password_hash: adminHash, role: 'admin', department_id: null, full_name: 'System Administrator (IT)', email: 'admin@company.com', is_active: 1, is_deleted: 0 },
    { id: 2, uuid: 'a1000000-0000-4000-a000-000000000002', username: 'boss', password_hash: bossHash, role: 'executive', department_id: null, full_name: 'Executive Administrator', email: 'boss@company.com', is_active: 1, is_deleted: 0 },
    { id: 3, uuid: 'a1000000-0000-4000-a000-000000000003', username: 'it_dept', password_hash: deptHash, role: 'department', department_id: 1, full_name: 'Information Technology Dept', email: 'it@company.com', is_active: 1, is_deleted: 0 }
  ];

  store.accounts = [
    { id: 'a1000000-0000-4000-a000-000000000001', username: 'admin', password_hash: adminHash, account_type: 'System Administrator', role: 'admin', department_id: null, company_id: companyUuid, branch_id: branchUuid, status: 'ACTIVE', is_deleted: 0 },
    { id: 'a1000000-0000-4000-a000-000000000002', username: 'boss', password_hash: bossHash, account_type: 'Executive Administrator', role: 'executive', department_id: null, company_id: companyUuid, branch_id: branchUuid, status: 'ACTIVE', is_deleted: 0 },
    { id: 'a1000000-0000-4000-a000-000000000003', username: 'it_dept', password_hash: deptHash, account_type: 'Department Account', role: 'department', department_id: 1, company_id: companyUuid, branch_id: branchUuid, status: 'ACTIVE', is_deleted: 0 }
  ];

  if (!store.requests || store.requests.length === 0) {
    store.requests = [
      {
        id: 1,
        uuid: '50e91f38-f12b-4285-a96a-63b5037e4bb1',
        request_number: 'REQ-IT-20260807-00001',
        department_id: 1,
        prepared_by: 'Earl John Delos Santos',
        position: 'IT Lead',
        required_date: '2026-08-25',
        purpose: 'Hostinger VPS Server KVM4 Subscription',
        business_justification: '',
        priority: 'High',
        status: 'Submitted',
        total_estimated_cost: 20133.12,
        created_by: 1,
        revision_number: 1,
        remarks: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: 0
      }
    ];

    store.request_items = [
      {
        id: 1,
        request_id: 1,
        item_description: 'Hostinger KVM4 VPS Annual Plan',
        quantity: 1,
        unit: 'YEAR',
        estimated_cost: 20133.12,
        remarks: 'Primary Server Host'
      }
    ];
  }

  saveStore();
  logger.info('Enterprise ERP Multi-Company Database Engine Initialized.');
};

const loaded = loadStore();
if (!loaded || !store.departments || store.departments.length === 0 || !store.requests || store.requests.length === 0) {
  initData();
}

const db = {
  query: async (sql, params = []) => {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');
    const upper = cleanSql.toUpperCase();

    if (upper.includes('COUNT(')) {
      if (upper.includes('FROM DEPARTMENTS')) return [[{ count: store.departments.filter(d => !d.is_deleted).length }], []];
      if (upper.includes('FROM MASTER_DROPDOWNS')) return [[{ count: store.master_dropdowns.length }], []];
      if (upper.includes('FROM USERS') || upper.includes('FROM ACCOUNTS')) return [[{ count: store.users.filter(u => !u.is_deleted).length }], []];
      if (upper.includes('FROM REQUESTS')) return [[{ count: store.requests.filter(r => !r.is_deleted).length }], []];
    }

    if (upper.includes('FROM USERS') || upper.includes('FROM ACCOUNTS')) {
      if (upper.includes('WHERE U.USERNAME = ?') || upper.includes('WHERE USERNAME = ?')) {
        const username = params[0];
        const user = store.users.find(u => u.username === username && !u.is_deleted);
        if (user) {
          const dept = store.departments.find(d => d.id === user.department_id);
          return [[{ ...user, department_code: dept?.code, department_name: dept?.name }], []];
        }
        return [[], []];
      }

      if (upper.includes('WHERE U.ID = ?')) {
        const id = params[0];
        const user = store.users.find(u => (u.id === id || u.uuid === id) && !u.is_deleted);
        if (user) {
          const dept = store.departments.find(d => d.id === user.department_id);
          return [[{ ...user, department_code: dept?.code, department_name: dept?.name }], []];
        }
        return [[], []];
      }

      return [[store.users.filter(u => !u.is_deleted)], []];
    }

    if (upper.includes('FROM DEPARTMENTS')) {
      if (upper.includes('WHERE ID = ?')) {
        const id = params[0];
        const dept = store.departments.find(d => d.id === Number(id) && !d.is_deleted);
        return [[dept || null], []];
      }
      if (upper.includes('WHERE CODE = ?')) {
        const code = params[0];
        const dept = store.departments.find(d => d.code === code && !d.is_deleted);
        return [[dept || null], []];
      }
      return [[store.departments.filter(d => !d.is_deleted)], []];
    }

    if (upper.includes('UPDATE DEPARTMENTS SET SEQ_COUNTER = SEQ_COUNTER + 1')) {
      const id = params[0];
      const dept = store.departments.find(d => d.id === Number(id));
      if (dept) {
        dept.seq_counter = (dept.seq_counter || 0) + 1;
        saveStore();
        return [[{ affectedRows: 1, seq_counter: dept.seq_counter }], []];
      }
      return [[{ affectedRows: 0 }], []];
    }

    if (upper.includes('INSERT INTO DEPARTMENTS')) {
      const newId = store.departments.length + 1;
      const newDept = {
        id: newId,
        uuid: crypto.randomUUID(),
        code: params[0],
        name: params[1],
        username: params[2],
        password_hash: bcrypt.hashSync(params[3], 10),
        seq_counter: 0,
        is_active: 1,
        is_deleted: 0
      };
      store.departments.push(newDept);

      store.users.push({
        id: store.users.length + 1,
        uuid: crypto.randomUUID(),
        username: newDept.username,
        password_hash: newDept.password_hash,
        role: 'department',
        department_id: newDept.id,
        full_name: `${newDept.name} User`,
        email: `${newDept.username}@company.com`,
        is_active: 1,
        is_deleted: 0
      });

      saveStore();
      return [{ insertId: newId, affectedRows: 1 }, []];
    }

    if (upper.includes('INSERT INTO REQUESTS')) {
      const newId = store.requests.length + 1;
      const newReq = {
        id: newId,
        uuid: crypto.randomUUID(),
        request_number: params[0],
        department_id: params[1],
        prepared_by: params[2],
        position: params[3],
        required_date: params[4],
        purpose: params[5],
        business_justification: params[6] || '',
        priority: params[7],
        status: params[8],
        total_estimated_cost: params[9],
        created_by: params[10],
        revision_number: 1,
        remarks: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: 0
      };
      store.requests.push(newReq);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }, []];
    }

    if (upper.includes('INSERT INTO REQUEST_ITEMS')) {
      const newId = store.request_items.length + 1;
      const newItem = {
        id: newId,
        request_id: params[0],
        item_description: params[1],
        quantity: params[2],
        unit: params[3],
        estimated_cost: params[4],
        total_cost: params[5],
        remarks: params[6] || ''
      };
      store.request_items.push(newItem);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }, []];
    }

    if (upper.includes('INSERT INTO ATTACHMENTS')) {
      const newId = store.attachments.length + 1;
      const newAtt = {
        id: newId,
        request_id: params[0],
        original_name: params[1],
        filename: params[2],
        file_path: params[3],
        file_type: params[4],
        file_size: params[5],
        created_at: new Date().toISOString()
      };
      store.attachments.push(newAtt);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }, []];
    }

    if (upper.includes('FROM REQUESTS R') || upper.includes('FROM REQUESTS')) {
      if (upper.includes('WHERE R.ID = ?') || upper.includes('WHERE ID = ?')) {
        const target = params[0];
        const req = store.requests.find(r => (r.id === Number(target) || r.uuid === target || r.request_number === target) && !r.is_deleted);
        if (req) {
          const dept = store.departments.find(d => d.id === req.department_id);
          const items = store.request_items.filter(i => i.request_id === req.id);
          const atts = store.attachments.filter(a => a.request_id === req.id);
          return [[{ ...req, department_name: dept?.name, department_code: dept?.code, items, attachments: atts }], []];
        }
        return [[], []];
      }

      const activeRequests = store.requests.filter(r => !r.is_deleted).map(req => {
        const dept = store.departments.find(d => d.id === req.department_id);
        const items = store.request_items.filter(i => i.request_id === req.id);
        const atts = store.attachments.filter(a => a.request_id === req.id);
        return { ...req, department_name: dept?.name, department_code: dept?.code, items, attachments: atts };
      });
      return [activeRequests, []];
    }

    if (upper.includes('UPDATE REQUESTS SET STATUS = ?')) {
      const status = params[0];
      const remarks = params[1];
      const target = params[2];
      const req = store.requests.find(r => r.id === Number(target) || r.uuid === target || r.request_number === target);
      if (req) {
        req.status = status;
        if (remarks) req.remarks = remarks;
        req.updated_at = new Date().toISOString();
        saveStore();
        return [[{ affectedRows: 1 }], []];
      }
      return [[{ affectedRows: 0 }], []];
    }

    if (upper.includes('FROM MASTER_UNITS')) {
      return [[store.master_units], []];
    }

    if (upper.includes('FROM NOTIFICATIONS')) {
      return [[store.notifications.slice(0, 10)], []];
    }

    if (upper.includes('FROM AUDIT_LOGS')) {
      return [[store.audit_logs.slice(0, 50)], []];
    }

    return [[[]], []];
  }
};

module.exports = db;
module.exports.db = db;
module.exports.store = store;
module.exports.saveStore = saveStore;
