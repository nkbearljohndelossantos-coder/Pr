require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const logger = require('../utils/logger');

async function runAutoMigration() {
  const dbPass = process.env.DB_PASSWORD || env.DB_PASS;
  if (!dbPass || dbPass === 'YOUR_DATABASE_PASSWORD') {
    logger.info('[AutoMigrate] Skipping MySQL migration: DB_PASSWORD not configured.');
    return;
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || env.DB_HOST || 'localhost',
      user: process.env.DB_USER || env.DB_USER || 'u335953510_Request',
      password: dbPass,
      database: process.env.DB_NAME || env.DB_NAME || 'u335953510_pr_data',
      port: Number(process.env.DB_PORT || env.DB_PORT || 3306)
    });

    logger.info(`[AutoMigrate] Connected to Hostinger MySQL [${process.env.DB_NAME || env.DB_NAME}]. Provisioning tables...`);

    // 1. Departments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        seq_counter INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'department',
        department_id INT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NULL,
        is_active TINYINT(1) DEFAULT 1,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Requests Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) NOT NULL UNIQUE,
        request_number VARCHAR(50) NOT NULL UNIQUE,
        department_id INT NOT NULL,
        prepared_by VARCHAR(100) NOT NULL,
        position VARCHAR(100) DEFAULT 'Staff',
        required_date DATE NOT NULL,
        purpose TEXT NOT NULL,
        business_justification TEXT NULL,
        priority VARCHAR(20) DEFAULT 'Normal',
        status VARCHAR(30) DEFAULT 'Submitted',
        total_estimated_cost DECIMAL(15,2) DEFAULT 0.00,
        created_by INT NULL,
        revision_number INT DEFAULT 1,
        remarks TEXT NULL,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Request Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS request_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        item_description TEXT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
        unit VARCHAR(20) DEFAULT 'PCS',
        estimated_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        total_cost DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        remarks VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Attachments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(100) NULL,
        file_size INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default departments & accounts if empty
    const [depts] = await connection.query('SELECT COUNT(*) as cnt FROM departments');
    if (depts[0].cnt === 0) {
      const deptHash = await bcrypt.hash('password123', 10);
      await connection.query(`
        INSERT INTO departments (id, uuid, code, name, username, password_hash) VALUES
        (1, 'd1000000-0000-4000-a000-000000000001', 'IT', 'Information Technology Department', 'it_dept', '${deptHash}'),
        (2, 'd1000000-0000-4000-a000-000000000002', 'HR', 'Human Resources Department', 'hr_dept', '${deptHash}'),
        (3, 'd1000000-0000-4000-a000-000000000003', 'ACCT', 'Accounting Department', 'acct_dept', '${deptHash}'),
        (4, 'd1000000-0000-4000-a000-000000000004', 'PURCH', 'Purchasing Department', 'purch_dept', '${deptHash}'),
        (5, 'd1000000-0000-4000-a000-000000000005', 'PROD', 'Production Department', 'prod_dept', '${deptHash}'),
        (6, 'd1000000-0000-4000-a000-000000000006', 'WH', 'Warehouse Department', 'wh_dept', '${deptHash}'),
        (7, 'd1000000-0000-4000-a000-000000000007', 'QA', 'Quality Assurance Department', 'qa_dept', '${deptHash}');
      `);
      logger.info('[AutoMigrate] Default departments provisioned.');
    }

    const [users] = await connection.query('SELECT COUNT(*) as cnt FROM users');
    if (users[0].cnt === 0) {
      const adminHash = await bcrypt.hash('admin123', 10);
      const bossHash = await bcrypt.hash('boss123', 10);
      const deptHash = await bcrypt.hash('password123', 10);

      await connection.query(`
        INSERT INTO users (id, uuid, username, password_hash, role, department_id, full_name, email) VALUES
        (1, 'a1000000-0000-4000-a000-000000000001', 'admin', '${adminHash}', 'admin', NULL, 'System Administrator (IT)', 'admin@company.com'),
        (2, 'a1000000-0000-4000-a000-000000000002', 'boss', '${bossHash}', 'executive', NULL, 'Executive Administrator', 'boss@company.com'),
        (3, 'a1000000-0000-4000-a000-000000000003', 'it_dept', '${deptHash}', 'department', 1, 'Information Technology Dept', 'it@company.com');
      `);
      logger.info('[AutoMigrate] Default user accounts (admin, boss, it_dept) provisioned.');
    }

    logger.info('[AutoMigrate] Hostinger MySQL Database auto-migration completed successfully!');
  } catch (err) {
    logger.warn('[AutoMigrate] Migration execution skipped or deferred:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  runAutoMigration();
}

module.exports = runAutoMigration;
