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
    { id: 3, username: 'it_dept', password_hash: deptHash, role: 'department', department_id: 1, full_name: 'Information Technology Dept', email: 'it@company.com', is_active: 1, is_deleted: 0 },
    { id: 4, username: 'hr_dept', password_hash: deptHash, role: 'department', department_id: 2, full_name: 'Human Resources Dept', email: 'hr@company.com', is_active: 1, is_deleted: 0 },
    { id: 5, username: 'acct_dept', password_hash: deptHash, role: 'department', department_id: 3, full_name: 'Accounting Dept', email: 'acct@company.com', is_active: 1, is_deleted: 0 },
    { id: 6, username: 'purch_dept', password_hash: deptHash, role: 'department', department_id: 4, full_name: 'Purchasing Dept', email: 'purch@company.com', is_active: 1, is_deleted: 0 },
    { id: 7, username: 'prod_dept', password_hash: deptHash, role: 'department', department_id: 5, full_name: 'Production Dept', email: 'prod@company.com', is_active: 1, is_deleted: 0 },
    { id: 8, username: 'wh_dept', password_hash: deptHash, role: 'department', department_id: 6, full_name: 'Warehouse Dept', email: 'wh@company.com', is_active: 1, is_deleted: 0 },
    { id: 9, username: 'qa_dept', password_hash: deptHash, role: 'department', department_id: 7, full_name: 'Quality Assurance Dept', email: 'qa@company.com', is_active: 1, is_deleted: 0 }
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

  store.attachments = [
    {
      id: 1,
      request_id: 1,
      original_name: 'Hostinger_VPS_Renewal_Quotation.pdf',
      filename: '1786083247-Hostinger_VPS_Renewal_Quotation.pdf',
      file_path: 'uploads/1786083247-Hostinger_VPS_Renewal_Quotation.pdf',
      file_type: 'application/pdf',
      file_size: 102400,
      uploaded_at: new Date().toISOString(),
      is_deleted: 0
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

      if (!store.users || store.users.length < 9) {
        store.users = [
          { id: 1, username: 'admin', password_hash: adminHash, role: 'admin', department_id: null, full_name: 'System Administrator (IT)', email: 'admin@company.com', is_active: 1, is_deleted: 0 },
          { id: 2, username: 'boss', password_hash: bossHash, role: 'executive', department_id: null, full_name: 'Executive Administrator', email: 'boss@company.com', is_active: 1, is_deleted: 0 },
          { id: 3, username: 'it_dept', password_hash: deptHash, role: 'department', department_id: 1, full_name: 'Information Technology Dept', email: 'it@company.com', is_active: 1, is_deleted: 0 },
          { id: 4, username: 'hr_dept', password_hash: deptHash, role: 'department', department_id: 2, full_name: 'Human Resources Dept', email: 'hr@company.com', is_active: 1, is_deleted: 0 },
          { id: 5, username: 'acct_dept', password_hash: deptHash, role: 'department', department_id: 3, full_name: 'Accounting Dept', email: 'acct@company.com', is_active: 1, is_deleted: 0 },
          { id: 6, username: 'purch_dept', password_hash: deptHash, role: 'department', department_id: 4, full_name: 'Purchasing Dept', email: 'purch@company.com', is_active: 1, is_deleted: 0 },
          { id: 7, username: 'prod_dept', password_hash: deptHash, role: 'department', department_id: 5, full_name: 'Production Dept', email: 'prod@company.com', is_active: 1, is_deleted: 0 },
          { id: 8, username: 'wh_dept', password_hash: deptHash, role: 'department', department_id: 6, full_name: 'Warehouse Dept', email: 'wh@company.com', is_active: 1, is_deleted: 0 },
          { id: 9, username: 'qa_dept', password_hash: deptHash, role: 'department', department_id: 7, full_name: 'Quality Assurance Dept', email: 'qa@company.com', is_active: 1, is_deleted: 0 }
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
        store.attachments = [
          {
            id: 1,
            request_id: 1,
            original_name: 'Hostinger_VPS_Renewal_Quotation.pdf',
            filename: '1786083247-Hostinger_VPS_Renewal_Quotation.pdf',
            file_path: 'uploads/1786083247-Hostinger_VPS_Renewal_Quotation.pdf',
            file_type: 'application/pdf',
            file_size: 102400,
            uploaded_at: new Date().toISOString(),
            is_deleted: 0
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
const mysqlHost = (env.DB_HOST === 'localhost' || process.env.DB_HOST === 'localhost') ? '127.0.0.1' : (env.DB_HOST || process.env.DB_HOST || '127.0.0.1');

if (env.DB_TYPE === 'mysql' || process.env.DB_TYPE === 'mysql' || process.env.DB_USER || process.env.DB_HOST) {
  try {
    const mysql = require('mysql2/promise');
    pool = mysql.createPool({
      host: mysqlHost,
      port: Number(env.DB_PORT || process.env.DB_PORT) || 3306,
      user: env.DB_USER || process.env.DB_USER || 'u335953510_Request',
      password: env.DB_PASS || process.env.DB_PASS || '',
      database: env.DB_NAME || process.env.DB_NAME || 'u335953510_pr_data',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    });
    logger.info(`Hostinger MySQL Connection Pool Initialized for Database: ${env.DB_NAME || process.env.DB_NAME || 'u335953510_pr_data'} at ${mysqlHost}:${env.DB_PORT || 3306}`);
  } catch (err) {
    logger.warn('MySQL pool initialization skipped, falling back to JSON Store engine:', err.message);
  }
}

// Auto Create Table Schemas in Hostinger MySQL if missing
const ensureMysqlTablesExist = async () => {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        head_user_id INT,
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted TINYINT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        department_id INT,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        refresh_token TEXT,
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted TINYINT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await pool.query(`ALTER TABLE users ADD COLUMN refresh_token TEXT`);
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_number VARCHAR(100) NOT NULL UNIQUE,
        department_id INT NOT NULL,
        prepared_by VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        required_date DATE NOT NULL,
        purpose TEXT NOT NULL,
        business_justification TEXT,
        priority VARCHAR(50) DEFAULT 'Normal',
        status VARCHAR(50) DEFAULT 'Submitted',
        total_estimated_cost DECIMAL(15,2) DEFAULT 0.00,
        created_by INT,
        approved_by INT,
        rejection_reason TEXT,
        revision_number INT DEFAULT 1,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted TINYINT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS request_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        item_description TEXT NOT NULL,
        quantity DECIMAL(15,2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        estimated_cost DECIMAL(15,2) NOT NULL,
        total_cost DECIMAL(15,2) NOT NULL,
        remarks TEXT,
        item_type VARCHAR(50) DEFAULT 'item',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted TINYINT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_type VARCHAR(100),
        file_size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted TINYINT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS master_dropdowns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        label VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0,
        is_active TINYINT DEFAULT 1
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    logger.info('Hostinger MySQL Schema Tables Verified & Created Successfully.');
  } catch (err) {
    logger.warn('MySQL table auto-creation notice:', err.message);
  }
};

const toMysqlDatetime = (dt) => {
  if (!dt) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    return d.toISOString().slice(0, 19).replace('T', ' ');
  } catch (e) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
};

// Auto Sync JSON Store to Hostinger MySQL
const syncJsonToMysql = async () => {
  if (!pool) return;
  await ensureMysqlTablesExist();
  try {
    logger.info(`Checking and syncing JSON store data into Hostinger MySQL tables...`);

    // 1. Sync Departments
    for (const d of store.departments) {
      if (!d || d.is_deleted) continue;
      await pool.query(
        `INSERT INTO departments (id, name, code, description, is_active, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE name=VALUES(name), code=VALUES(code)`,
        [d.id, d.name, d.code, d.description || '', d.is_active || 1, toMysqlDatetime(d.created_at), toMysqlDatetime(d.updated_at)]
      );
    }

    // 2. Sync Users
    for (const u of store.users) {
      if (!u || u.is_deleted) continue;
      await pool.query(
        `INSERT INTO users (id, username, password_hash, role, department_id, full_name, email, is_active, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role)`,
        [u.id, u.username, u.password_hash, u.role, u.department_id || null, u.full_name, u.email || '', u.is_active || 1, toMysqlDatetime(u.created_at), toMysqlDatetime(u.updated_at)]
      );
    }

    // 3. Sync Requests
    for (const r of store.requests) {
      if (!r || r.is_deleted) continue;
      await pool.query(
        `INSERT INTO requests 
         (id, request_number, department_id, prepared_by, position, required_date, purpose, business_justification, priority, status, total_estimated_cost, created_by, revision_number, remarks, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE prepared_by=VALUES(prepared_by), purpose=VALUES(purpose), total_estimated_cost=VALUES(total_estimated_cost), updated_at=VALUES(updated_at)`,
        [r.id, r.request_number, r.department_id, r.prepared_by, r.position || '', r.required_date, r.purpose, r.business_justification || '', r.priority || 'Normal', r.status || 'Submitted', r.total_estimated_cost || 0, r.created_by || 1, r.revision_number || 1, r.remarks || '', toMysqlDatetime(r.created_at), toMysqlDatetime(r.updated_at)]
      );
    }

    // 4. Sync Request Items
    for (const item of store.request_items) {
      if (!item || item.is_deleted) continue;
      try {
        await pool.query(
          `INSERT INTO request_items (id, request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks, item_type, is_deleted)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE item_description=VALUES(item_description), quantity=VALUES(quantity), estimated_cost=VALUES(estimated_cost)`,
          [item.id, item.request_id, item.item_description, item.quantity, item.unit, item.estimated_cost, item.total_cost, item.remarks || '', item.item_type || 'subscription']
        );
      } catch (e) {
        await pool.query(
          `INSERT INTO request_items (id, request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks, is_deleted)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE item_description=VALUES(item_description), quantity=VALUES(quantity), estimated_cost=VALUES(estimated_cost)`,
          [item.id, item.request_id, item.item_description, item.quantity, item.unit, item.estimated_cost, item.total_cost, item.remarks || '']
        );
      }
    }

    // 5. Sync Attachments
    for (const att of store.attachments) {
      if (!att || att.is_deleted) continue;
      await pool.query(
        `INSERT INTO attachments (id, request_id, original_name, filename, file_path, file_type, file_size, uploaded_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE original_name=VALUES(original_name), filename=VALUES(filename)`,
        [att.id, att.request_id, att.original_name, att.filename, att.file_path, att.file_type, att.file_size, toMysqlDatetime(att.uploaded_at)]
      );
    }

    logger.info('Migration from JSON Store to Hostinger MySQL completed successfully!');
  } catch (err) {
    logger.warn('MySQL auto sync check notice:', err.message);
  }
};

setTimeout(syncJsonToMysql, 1000);

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
      if (upper.includes('WHERE U.USERNAME = ?') || upper.includes('WHERE USERNAME = ?') || upper.includes('WHERE LOWER(U.USERNAME) = LOWER(?)')) {
        const username = String(params[0] || '').toLowerCase();
        const user = store.users.find(u => String(u.username || '').toLowerCase() === username && !u.is_deleted);
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
        uploaded_at: params[6] || new Date().toISOString(),
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

    if (upper.includes('SELECT') && upper.includes('FROM REQUEST_ITEMS')) {
      const items = store.request_items.filter(i => i.request_id === Number(params[0]) && !i.is_deleted);
      return [items];
    }

    if (upper.includes('SELECT') && upper.includes('FROM ATTACHMENTS')) {
      const atts = store.attachments.filter(a => a.request_id === Number(params[0]) && !a.is_deleted);
      return [atts];
    }

    if (upper.includes('UPDATE REQUESTS SET PREPARED_BY = ?')) {
      const targetId = Number(params[params.length - 1]);
      const req = store.requests.find(r => r.id === targetId);
      if (req) {
        req.prepared_by = params[0];
        req.position = params[1];
        req.required_date = params[2];
        req.purpose = params[3];
        req.business_justification = params[4];
        req.priority = params[5];
        if (params.length >= 11) {
          if (params[6]) req.status = params[6];
          req.total_estimated_cost = Number(params[7]);
          req.revision_number = Number(params[8]);
          req.updated_at = params[9];
        } else {
          req.total_estimated_cost = Number(params[6]);
          req.revision_number = Number(params[7]);
          req.updated_at = params[8];
        }
        saveStore();
      }
      return [{ affectedRows: 1 }];
    }

    if (upper.includes('DELETE FROM DEPARTMENTS')) {
      const deptId = Number(params[0]);
      store.departments = store.departments.filter(d => Number(d.id) !== deptId);
      saveStore();
      return [{ affectedRows: 1 }];
    }

    if (upper.includes('DELETE FROM USERS')) {
      if (upper.includes('WHERE USERNAME = ? OR DEPARTMENT_ID = ?')) {
        const usernameStr = params[0];
        const deptId = Number(params[1]);
        store.users = store.users.filter(u => u.username !== usernameStr && Number(u.department_id) !== deptId);
      } else {
        const userId = Number(params[0]);
        store.users = store.users.filter(u => Number(u.id) !== userId);
      }
      saveStore();
      return [{ affectedRows: 1 }];
    }

    if (upper.includes('DELETE FROM ATTACHMENTS')) {
      const id = Number(params[0]);
      if (upper.includes('WHERE REQUEST_ID = ?')) {
        store.attachments = store.attachments.filter(a => Number(a.request_id) !== id);
      } else {
        store.attachments = store.attachments.filter(a => Number(a.id) !== id);
      }
      saveStore();
      return [{ affectedRows: 1 }];
    }

    if (upper.includes('DELETE FROM REQUESTS')) {
      const reqId = Number(params[0]);
      store.requests = store.requests.filter(r => Number(r.id) !== reqId);
      store.request_items = store.request_items.filter(i => Number(i.request_id) !== reqId);
      store.attachments = store.attachments.filter(a => Number(a.request_id) !== reqId);
      saveStore();
      return [{ affectedRows: 1 }];
    }

    if (upper.includes('DELETE FROM REQUEST_ITEMS')) {
      const reqId = Number(params[0]);
      store.request_items = store.request_items.filter(i => Number(i.request_id) !== reqId && Number(i.id) !== reqId);
      saveStore();
      return [{ affectedRows: 1 }];
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
