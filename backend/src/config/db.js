const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const env = require('./env');
const logger = require('../utils/logger');

// JSON Data Storage Path with Fail-Safe Directory Resolution
let dataDir = path.join(__dirname, '../data');
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  try {
    dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (err) {
    dataDir = path.join(__dirname, '..');
  }
}

const dbFile = path.join(dataDir, 'erp_store.json');

let store = {
  departments: [],
  users: [],
  requests: [],
  request_items: [],
  attachments: [],
  master_dropdowns: [],
  notifications: [],
  audit_logs: [],
  backups: []
};

// Synchronous password hash generation for instant zero-delay database seeding
const adminHash = bcrypt.hashSync('admin123', 10);
const bossHash = bcrypt.hashSync('boss123', 10);
const deptHash = bcrypt.hashSync('password123', 10);

const saveStore = () => {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    logger.error('Failed to persist database store:', e);
  }
};

const initData = () => {
  store.master_dropdowns = [
    { id: 1, category: 'unit_of_measure', code: 'PCS', label: 'Pieces (PCS)', sort_order: 1, is_active: 1 },
    { id: 2, category: 'unit_of_measure', code: 'BOX', label: 'Boxes (BOX)', sort_order: 2, is_active: 1 },
    { id: 3, category: 'unit_of_measure', code: 'SET', label: 'Sets (SET)', sort_order: 3, is_active: 1 },
    { id: 4, category: 'unit_of_measure', code: 'LOT', label: 'Lots (LOT)', sort_order: 4, is_active: 1 },
    { id: 5, category: 'unit_of_measure', code: 'KG', label: 'Kilograms (KG)', sort_order: 5, is_active: 1 },
    { id: 6, category: 'unit_of_measure', code: 'SUBSCRIPTION', label: 'Subscription (SUB)', sort_order: 6, is_active: 1 },
    { id: 7, category: 'unit_of_measure', code: 'MONTHLY_SUB', label: 'Monthly Subscription', sort_order: 7, is_active: 1 },
    { id: 8, category: 'unit_of_measure', code: 'ANNUAL_SUB', label: 'Annual Subscription', sort_order: 8, is_active: 1 },
    { id: 9, category: 'unit_of_measure', code: 'LICENSE', label: 'Software License', sort_order: 9, is_active: 1 },
    { id: 10, category: 'priority', code: 'Low', label: 'Low Priority', sort_order: 1, is_active: 1 },
    { id: 11, category: 'priority', code: 'Normal', label: 'Normal Priority', sort_order: 2, is_active: 1 },
    { id: 12, category: 'priority', code: 'High', label: 'High Priority', sort_order: 3, is_active: 1 },
    { id: 13, category: 'priority', code: 'Urgent', label: 'Urgent Priority', sort_order: 4, is_active: 1 }
  ];

  store.departments = [
    { id: 1, code: 'IT', name: 'Information Technology Department', username: 'it_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 2, code: 'HR', name: 'Human Resources Department', username: 'hr_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 3, code: 'ACCT', name: 'Accounting Department', username: 'acct_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 4, code: 'PURCH', name: 'Purchasing Department', username: 'purch_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 5, code: 'PROD', name: 'Production Department', username: 'prod_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 6, code: 'WH', name: 'Warehouse Department', username: 'wh_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
    { id: 7, code: 'QA', name: 'Quality Assurance Department', username: 'qa_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 }
  ];

  store.users = [
    { id: 1, username: 'admin', password_hash: adminHash, role: 'admin', department_id: null, full_name: 'System Administrator (IT)', email: 'admin@company.com', is_active: 1, is_deleted: 0 },
    { id: 2, username: 'boss', password_hash: bossHash, role: 'executive', department_id: null, full_name: 'Executive Administrator', email: 'boss@company.com', is_active: 1, is_deleted: 0 },
    { id: 3, username: 'it_dept', password_hash: deptHash, role: 'department', department_id: 1, full_name: 'Information Technology Dept', email: 'it@company.com', is_active: 1, is_deleted: 0 }
  ];

  store.requests = [
    {
      id: 1,
      request_number: 'REQ-IT-20260813-00001',
      department_id: 1,
      prepared_by: 'IT Department Staff',
      position: 'IT Specialist',
      required_date: '2026-08-20',
      purpose: 'Hostinger VPS KVM4 Server Infrastructure Renewal & Upgrade',
      business_justification: 'Production server hosting renewal for enterprise applications.',
      priority: 'Normal',
      status: 'Submitted',
      total_estimated_cost: 20133.12,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: 0
    }
  ];

  store.request_items = [
    {
      id: 1,
      request_id: 1,
      item_description: 'Hostinger VPS KVM4 Subscription Plan',
      quantity: 1,
      unit: '24_MONTHS',
      estimated_cost: 20133.12,
      total_cost: 20133.12,
      remarks: 'Renewal Date: Nov 2026',
      item_type: 'subscription',
      created_at: new Date().toISOString()
    }
  ];

  saveStore();
  logger.info('Enterprise Database Engine Initialized & Seeded Cleanly.');
};

const loadStore = () => {
  if (fs.existsSync(dbFile)) {
    try {
      const data = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(data);
      store = {
        departments: parsed.departments || [],
        users: parsed.users || [],
        requests: parsed.requests || [],
        request_items: parsed.request_items || [],
        attachments: parsed.attachments || [],
        master_dropdowns: parsed.master_dropdowns || [],
        notifications: parsed.notifications || [],
        audit_logs: parsed.audit_logs || [],
        backups: parsed.backups || []
      };

      if (!store.departments || store.departments.length === 0) {
        store.departments = [
          { id: 1, code: 'IT', name: 'Information Technology Department', username: 'it_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
          { id: 2, code: 'HR', name: 'Human Resources Department', username: 'hr_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
          { id: 3, code: 'ACCT', name: 'Accounting Department', username: 'acct_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
          { id: 4, code: 'PURCH', name: 'Purchasing Department', username: 'purch_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
          { id: 5, code: 'PROD', name: 'Production Department', username: 'prod_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
          { id: 6, code: 'WH', name: 'Warehouse Department', username: 'wh_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 },
          { id: 7, code: 'QA', name: 'Quality Assurance Department', username: 'qa_dept', password_hash: deptHash, seq_counter: 0, is_active: 1, is_deleted: 0 }
        ];
      }

      if (!store.users || store.users.length === 0) {
        store.users = [
          { id: 1, username: 'admin', password_hash: adminHash, role: 'admin', department_id: null, full_name: 'System Administrator (IT)', email: 'admin@company.com', is_active: 1, is_deleted: 0 },
          { id: 2, username: 'boss', password_hash: bossHash, role: 'executive', department_id: null, full_name: 'Executive Administrator', email: 'boss@company.com', is_active: 1, is_deleted: 0 },
          { id: 3, username: 'it_dept', password_hash: deptHash, role: 'department', department_id: 1, full_name: 'Information Technology Dept', email: 'it@company.com', is_active: 1, is_deleted: 0 }
        ];
      }

      if (!store.requests || store.requests.length === 0) {
        store.requests = [
          {
            id: 1,
            request_number: 'REQ-IT-20260813-00001',
            department_id: 1,
            prepared_by: 'IT Department Staff',
            position: 'IT Specialist',
            required_date: '2026-08-20',
            purpose: 'Hostinger VPS KVM4 Server Infrastructure Renewal & Upgrade',
            business_justification: 'Production server hosting renewal for enterprise applications.',
            priority: 'Normal',
            status: 'Submitted',
            total_estimated_cost: 20133.12,
            created_by: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_deleted: 0
          }
        ];
        store.request_items = [
          {
            id: 1,
            request_id: 1,
            item_description: 'Hostinger VPS KVM4 Subscription Plan',
            quantity: 1,
            unit: '24_MONTHS',
            estimated_cost: 20133.12,
            total_cost: 20133.12,
            remarks: 'Renewal Date: Nov 2026',
            item_type: 'subscription',
            created_at: new Date().toISOString()
          }
        ];
        saveStore();
      }

      logger.info(`Enterprise Database Engine Loaded Successfully (${store.requests.length} requests persisted).`);
      return;
    } catch (e) {
      logger.error('Failed to load existing database store file, re-seeding:', e);
    }
  }

  initData();
};

// Load existing store from disk or seed cleanly
loadStore();

// Hostinger / MySQL Connection Pool Setup
let pool = null;
if (env.DB_TYPE === 'mysql' || process.env.DB_USER || process.env.DB_HOST) {
  try {
    const mysql = require('mysql2/promise');
    pool = mysql.createPool({
      host: env.DB_HOST || '127.0.0.1',
      port: env.DB_PORT || 3306,
      user: env.DB_USER || 'root',
      password: env.DB_PASS || '',
      database: env.DB_NAME || 'u335953510_pr_data',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    logger.info(`Hostinger MySQL Connection Pool Initialized for Database: ${env.DB_NAME}`);
  } catch (err) {
    logger.warn('MySQL pool initialization skipped, falling back to JSON Store engine:', err.message);
  }
}

// Database Query Engine supporting both Real MySQL and Fail-safe Store Emulator
const db = {
  query: async (sql, params = []) => {
    if (pool) {
      try {
        return await pool.query(sql, params);
      } catch (mysqlErr) {
        logger.warn(`MySQL connection error (${mysqlErr.message}), executing query via fallback engine.`);
      }
    }

    const cleanSql = sql.trim().replace(/\s+/g, ' ');
    const upper = cleanSql.toUpperCase();

    // 1. SELECT COUNT
    if (upper.includes('COUNT(')) {
      if (upper.includes('FROM DEPARTMENTS')) {
        return [[{ count: store.departments.filter(d => !d.is_deleted).length }]];
      }
      if (upper.includes('FROM MASTER_DROPDOWNS')) {
        return [[{ count: store.master_dropdowns.length }]];
      }
      if (upper.includes('FROM USERS')) {
        return [[{ count: store.users.filter(u => !u.is_deleted).length }]];
      }
      if (upper.includes('FROM REQUESTS')) {
        let reqs = store.requests.filter(r => !r.is_deleted);
        if (params.length > 0 && typeof params[0] === 'number') {
          reqs = reqs.filter(r => r.department_id === params[0]);
        }
        return [[{ count: reqs.length }]];
      }
    }

    // 2. USERS Queries
    if (upper.includes('FROM USERS')) {
      if (upper.includes('WHERE U.USERNAME = ?') || upper.includes('WHERE USERNAME = ?')) {
        const username = params[0];
        const user = store.users.find(u => u.username === username && !u.is_deleted);
        if (user) {
          const dept = store.departments.find(d => d.id === user.department_id);
          return [[{ ...user, department_code: dept?.code, department_name: dept?.name }]];
        }
        return [[]];
      }

      if (upper.includes('WHERE U.ID = ?')) {
        const id = params[0];
        const user = store.users.find(u => u.id === id && !u.is_deleted);
        if (user) {
          const dept = store.departments.find(d => d.id === user.department_id);
          return [[{ ...user, department_code: dept?.code, department_name: dept?.name }]];
        }
        return [[]];
      }

      if (upper.includes('SELECT U.ID, U.USERNAME')) {
        const list = store.users.filter(u => !u.is_deleted).map(u => {
          const dept = store.departments.find(d => d.id === u.department_id);
          return { ...u, department_name: dept?.name, department_code: dept?.code };
        });
        return [[list]];
      }

      return [[store.users.filter(u => !u.is_deleted)]];
    }

    // UPDATE REFRESH TOKEN
    if (upper.includes('UPDATE USERS SET REFRESH_TOKEN')) {
      const user = store.users.find(u => u.id === params[1]);
      if (user) user.refresh_token = params[0];
      saveStore();
      return [{ affectedRows: 1 }];
    }

    // 3. DEPARTMENTS Queries
    if (upper.includes('FROM DEPARTMENTS')) {
      if (upper.includes('WHERE CODE = ?') || upper.includes('WHERE DEPARTMENTS.CODE = ?')) {
        const code = params[0];
        const dept = store.departments.find(d => d.code === code && !d.is_deleted);
        return [[dept ? dept : null].filter(Boolean)];
      }

      if (upper.includes('WHERE ID = ?')) {
        const id = params[0];
        const dept = store.departments.find(d => d.id === id && !d.is_deleted);
        return [[dept ? dept : null].filter(Boolean)];
      }

      if (upper.includes('WHERE USERNAME = ?')) {
        const username = params[0];
        const dept = store.departments.find(d => d.username === username && !d.is_deleted);
        return [[dept ? dept : null].filter(Boolean)];
      }

      return [[store.departments.filter(d => !d.is_deleted)]];
    }

    // INSERT DEPARTMENT
    if (upper.includes('INSERT INTO DEPARTMENTS')) {
      const newId = store.departments.length > 0 ? Math.max(...store.departments.map(d => d.id)) + 1 : 1;
      const dept = {
        id: newId,
        code: params[0],
        name: params[1],
        username: params[2],
        password_hash: params[3],
        seq_counter: 0,
        is_active: 1,
        created_by: params[4] || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: 0
      };
      store.departments.push(dept);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    // UPDATE DEPARTMENT
    if (upper.includes('UPDATE DEPARTMENTS SET NAME = ?')) {
      const dept = store.departments.find(d => d.id === params[3]);
      if (dept) {
        dept.name = params[0];
        dept.is_active = params[1];
        dept.updated_by = params[2];
        dept.updated_at = new Date().toISOString();
        saveStore();
      }
      return [{ affectedRows: 1 }];
    }

    if (upper.includes('UPDATE DEPARTMENTS SET PASSWORD_HASH')) {
      const dept = store.departments.find(d => d.id === params[1]);
      if (dept) {
        dept.password_hash = params[0];
        saveStore();
      }
      return [{ affectedRows: 1 }];
    }

    if (upper.includes('UPDATE DEPARTMENTS SET SEQ_COUNTER')) {
      const dept = store.departments.find(d => d.id === params[1]);
      if (dept) {
        dept.seq_counter = params[0];
        saveStore();
      }
      return [{ affectedRows: 1 }];
    }

    // 4. REQUESTS Queries
    if (upper.includes('INSERT INTO REQUESTS')) {
      const newId = store.requests.length > 0 ? Math.max(...store.requests.map(r => r.id)) + 1 : 1;
      const req = {
        id: newId,
        request_number: params[0],
        department_id: Number(params[1]),
        prepared_by: params[2],
        position: params[3] || '',
        required_date: params[4],
        purpose: params[5],
        business_justification: params[6] || '',
        priority: params[7] || 'Normal',
        status: params[8] || 'Draft',
        total_estimated_cost: Number(params[9] || 0),
        created_by: params[10] ? Number(params[10]) : null,
        revision_number: 1,
        remarks: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: 0
      };
      store.requests.push(req);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upper.includes('INSERT INTO REQUEST_ITEMS')) {
      const newId = store.request_items.length > 0 ? Math.max(...store.request_items.map(i => i.id)) + 1 : 1;
      const item = {
        id: newId,
        request_id: Number(params[0]),
        item_description: params[1],
        quantity: params[2],
        unit: params[3],
        estimated_cost: params[4],
        total_cost: params[5],
        remarks: params[6] || '',
        item_type: params[7] || 'item',
        is_deleted: 0
      };
      store.request_items.push(item);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upper.includes('INSERT INTO ATTACHMENTS')) {
      const newId = store.attachments.length > 0 ? Math.max(...store.attachments.map(a => a.id)) + 1 : 1;
      const att = {
        id: newId,
        request_id: Number(params[0]),
        original_name: params[1],
        filename: params[2],
        file_path: params[3],
        file_type: params[4],
        file_size: params[5],
        uploaded_at: new Date().toISOString(),
        is_deleted: 0
      };
      store.attachments.push(att);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upper.includes('FROM REQUESTS R')) {
      if (upper.includes('WHERE R.ID = ?')) {
        const req = store.requests.find(r => r.id === Number(params[0]) && !r.is_deleted);
        if (req) {
          const dept = store.departments.find(d => d.id === req.department_id);
          return [[{ ...req, department_name: dept?.name, department_code: dept?.code }]];
        }
        return [[]];
      }

      let list = store.requests.filter(r => r && r.id && r.request_number && !r.is_deleted);

      // Filtering logic
      let paramIdx = 0;
      if (upper.includes('WHERE R.DEPARTMENT_ID = ?') || upper.includes('AND R.DEPARTMENT_ID = ?')) {
        const deptId = Number(params[paramIdx++]);
        list = list.filter(r => r.department_id === deptId);
      }
      if (upper.includes('AND R.STATUS = ?')) {
        const st = params[paramIdx++];
        list = list.filter(r => r.status === st);
      }
      if (upper.includes('AND R.PRIORITY = ?')) {
        const pr = params[paramIdx++];
        list = list.filter(r => r.priority === pr);
      }

      const enriched = list.map(r => {
        const dept = store.departments.find(d => d.id === r.department_id);
        return { ...r, department_name: dept?.name || 'Department', department_code: dept?.code || 'DEPT' };
      });

      return [enriched];
    }

    if (upper.includes('FROM REQUEST_ITEMS WHERE REQUEST_ID = ?')) {
      const items = store.request_items.filter(i => i.request_id === Number(params[0]) && !i.is_deleted);
      return [items];
    }

    if (upper.includes('FROM ATTACHMENTS WHERE REQUEST_ID = ?')) {
      const atts = store.attachments.filter(a => a.request_id === Number(params[0]) && !a.is_deleted);
      return [atts];
    }

    if (upper.includes('UPDATE REQUESTS SET STATUS = ?')) {
      const req = store.requests.find(r => r.id === Number(params[3]));
      if (req) {
        req.status = params[0];
        req.remarks = params[1];
        req.updated_by = params[2];
        req.updated_at = new Date().toISOString();
        saveStore();
      }
      return [{ affectedRows: 1 }];
    }

    // DASHBOARD METRICS
    if (upper.includes('GROUP BY STATUS')) {
      let reqs = store.requests.filter(r => !r.is_deleted);
      if (params.length > 0 && params[0]) {
        reqs = reqs.filter(r => r.department_id === params[0]);
      }
      const countsMap = {};
      reqs.forEach(r => countsMap[r.status] = (countsMap[r.status] || 0) + 1);
      const rows = Object.keys(countsMap).map(status => ({ status, count: countsMap[status] }));
      return [[rows]];
    }

    if (upper.includes('GROUP BY D.ID')) {
      const countsMap = {};
      store.requests.filter(r => !r.is_deleted).forEach(r => {
        countsMap[r.department_id] = (countsMap[r.department_id] || 0) + 1;
      });
      const rows = store.departments.map(d => ({
        department_name: d.name,
        department_code: d.code,
        count: countsMap[d.id] || 0
      }));
      return [[rows]];
    }

    // 5. MASTER DROPDOWNS
    if (upper.includes('FROM MASTER_DROPDOWNS')) {
      if (upper.includes('WHERE CATEGORY = ?')) {
        return [[store.master_dropdowns.filter(m => m.category === params[0] && m.is_active)]];
      }
      return [[store.master_dropdowns]];
    }

    if (upper.includes('INSERT INTO MASTER_DROPDOWNS')) {
      const newId = store.master_dropdowns.length > 0 ? Math.max(...store.master_dropdowns.map(m => m.id)) + 1 : 1;
      const item = { id: newId, category: params[0], code: params[1], label: params[2], sort_order: params[3], is_active: 1 };
      store.master_dropdowns.push(item);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upper.includes('UPDATE MASTER_DROPDOWNS SET IS_ACTIVE')) {
      const item = store.master_dropdowns.find(m => m.id === Number(params[1]));
      if (item) item.is_active = params[0];
      saveStore();
      return [{ affectedRows: 1 }];
    }

    // 6. NOTIFICATIONS
    if (upper.includes('INSERT INTO NOTIFICATIONS')) {
      const newId = store.notifications.length > 0 ? Math.max(...store.notifications.map(n => n.id)) + 1 : 1;
      const item = { id: newId, user_id: params[0], department_id: params[1], title: params[2], message: params[3], type: params[4], is_read: 0, created_at: new Date().toISOString() };
      store.notifications.push(item);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upper.includes('FROM NOTIFICATIONS')) {
      return [[store.notifications.slice(-20)]];
    }

    // 7. AUDIT LOGS
    if (upper.includes('INSERT INTO AUDIT_LOGS')) {
      const newId = store.audit_logs.length > 0 ? Math.max(...store.audit_logs.map(a => a.id)) + 1 : 1;
      const item = {
        id: newId,
        user_id: params[0],
        username: params[1],
        department_code: params[2],
        role: params[3],
        action: params[4],
        target_resource: params[5],
        old_value: params[6],
        new_value: params[7],
        ip_address: params[8],
        browser: params[9],
        timestamp: new Date().toISOString()
      };
      store.audit_logs.push(item);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upper.includes('FROM AUDIT_LOGS')) {
      return [[store.audit_logs.slice(-50)]];
    }

    // 8. BACKUPS
    if (upper.includes('INSERT INTO BACKUPS')) {
      const newId = store.backups.length > 0 ? Math.max(...store.backups.map(b => b.id)) + 1 : 1;
      const item = { id: newId, filename: params[0], filepath: params[1], filesize: params[2], created_by: params[3], created_at: new Date().toISOString() };
      store.backups.push(item);
      saveStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (upper.includes('FROM BACKUPS')) {
      return [[store.backups]];
    }

    return [[]];
  },
  execute: function(sql, params = []) {
    return this.query(sql, params);
  }
};

module.exports = db;
