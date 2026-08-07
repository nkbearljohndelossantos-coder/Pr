-- Hostinger phpMyAdmin 1-Click Import SQL Script
-- Database Target: u335953510_pr_data

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `seq_counter` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(30) NOT NULL DEFAULT 'department',
  `department_id` INT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `refresh_token` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Master Dropdowns Table
CREATE TABLE IF NOT EXISTS `master_dropdowns` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` VARCHAR(50) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_cat_code` (`category`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Requests Table
CREATE TABLE IF NOT EXISTS `requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_number` VARCHAR(50) NOT NULL UNIQUE,
  `department_id` INT NOT NULL,
  `prepared_by` VARCHAR(100) NOT NULL,
  `position` VARCHAR(100) NULL,
  `required_date` DATE NOT NULL,
  `purpose` TEXT NOT NULL,
  `business_justification` TEXT NULL,
  `priority` VARCHAR(20) NOT NULL DEFAULT 'Normal',
  `status` VARCHAR(30) NOT NULL DEFAULT 'Draft',
  `total_estimated_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `revision_number` INT NOT NULL DEFAULT 1,
  `remarks` TEXT NULL,
  `created_by` INT NULL,
  `updated_by` INT NULL,
  `deleted_by` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_dept` (`department_id`),
  INDEX `idx_req_no` (`request_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Request Items Table
CREATE TABLE IF NOT EXISTS `request_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT NOT NULL,
  `item_description` TEXT NOT NULL,
  `quantity` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  `unit` VARCHAR(30) NOT NULL DEFAULT 'PCS',
  `estimated_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `remarks` VARCHAR(255) NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Attachments Table
CREATE TABLE IF NOT EXISTS `attachments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `department_id` INT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(30) NOT NULL DEFAULT 'info',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `username` VARCHAR(50) NOT NULL,
  `department_code` VARCHAR(20) NULL,
  `role` VARCHAR(30) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_resource` VARCHAR(100) NULL,
  `old_value` TEXT NULL,
  `new_value` TEXT NULL,
  `ip_address` VARCHAR(50) NULL,
  `browser` VARCHAR(255) NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Backups Table
CREATE TABLE IF NOT EXISTS `backups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `filepath` VARCHAR(255) NOT NULL,
  `filesize` INT NOT NULL,
  `created_by` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Master Dropdowns
INSERT IGNORE INTO `master_dropdowns` (`category`, `code`, `label`, `sort_order`) VALUES
('unit_of_measure', 'PCS', 'Pieces (PCS)', 1),
('unit_of_measure', 'BOX', 'Boxes (BOX)', 2),
('unit_of_measure', 'SET', 'Sets (SET)', 3),
('unit_of_measure', 'LOT', 'Lots (LOT)', 4),
('unit_of_measure', 'KG', 'Kilograms (KG)', 5),
('unit_of_measure', 'MTR', 'Meters (MTR)', 6),
('unit_of_measure', 'UNIT', 'Units (UNIT)', 7),
('priority', 'Low', 'Low Priority', 1),
('priority', 'Normal', 'Normal Priority', 2),
('priority', 'High', 'High Priority', 3),
('priority', 'Urgent', 'Urgent Priority', 4);

-- Seed Default Departments
INSERT IGNORE INTO `departments` (`id`, `code`, `name`, `username`, `password_hash`) VALUES
(1, 'IT', 'Information Technology Department', 'it_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5'),
(2, 'HR', 'Human Resources Department', 'hr_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5'),
(3, 'ACCT', 'Accounting Department', 'acct_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5'),
(4, 'PURCH', 'Purchasing Department', 'purch_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5'),
(5, 'PROD', 'Production Department', 'prod_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5'),
(6, 'WH', 'Warehouse Department', 'wh_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5'),
(7, 'QA', 'Quality Assurance Department', 'qa_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5');

-- Seed Default Accounts (Admin, Executive, IT)
INSERT IGNORE INTO `users` (`id`, `username`, `password_hash`, `role`, `department_id`, `full_name`, `email`) VALUES
(1, 'admin', '$2a$10$a1B2c3D4e5F6g7H8i9J0k.wX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5', 'admin', NULL, 'System Administrator (IT)', 'admin@nkbmanufacturing.com'),
(2, 'boss', '$2a$10$b2C3d4E5f6G7h8I9j0K1l.wX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5', 'executive', NULL, 'Executive Administrator', 'boss@nkbmanufacturing.com'),
(3, 'it_dept', '$2a$10$7R0wU/n81v/Nfs9n2E8Ebe6gX2x4E3b3Y5aJ5j5j5j5j5j5j5j5j5', 'department', 1, 'Information Technology Dept', 'it@nkbmanufacturing.com');
