const db = require('../config/db');

class RequestRepository {
  async createRequest(data) {
    const {
      request_number,
      department_id,
      prepared_by,
      position,
      required_date,
      purpose,
      business_justification,
      priority,
      status,
      total_estimated_cost,
      created_by
    } = data;

    const [res] = await db.query(
      `INSERT INTO requests 
       (request_number, department_id, prepared_by, position, required_date, purpose, business_justification, priority, status, total_estimated_cost, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request_number,
        department_id,
        prepared_by,
        position || '',
        required_date,
        purpose,
        business_justification || '',
        priority || 'Normal',
        status || 'Draft',
        total_estimated_cost || 0.00,
        created_by || null
      ]
    );

    return res.insertId;
  }

  async addRequestItem(item) {
    const { request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks } = item;
    await db.query(
      `INSERT INTO request_items (request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks || '']
    );
  }

  async addAttachment(att) {
    const { request_id, original_name, filename, file_path, file_type, file_size } = att;
    await db.query(
      `INSERT INTO attachments (request_id, original_name, filename, file_path, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [request_id, original_name, filename, file_path, file_type, file_size]
    );
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT r.*, d.name as department_name, d.code as department_code
       FROM requests r
       JOIN departments d ON r.department_id = d.id
       WHERE r.id = ? AND r.is_deleted = 0`,
      [id]
    );
    if (!rows[0]) return null;

    const reqData = rows[0];
    const [items] = await db.query(`SELECT * FROM request_items WHERE request_id = ? AND is_deleted = 0`, [id]);
    const [attachments] = await db.query(`SELECT * FROM attachments WHERE request_id = ? AND is_deleted = 0`, [id]);

    reqData.items = items;
    reqData.attachments = attachments;
    return reqData;
  }

  async findAll({ department_id, created_by, status, priority, search, startDate, endDate, limit = 50, offset = 0 }) {
    let query = `
      SELECT r.*, d.name as department_name, d.code as department_code
      FROM requests r
      JOIN departments d ON r.department_id = d.id
      WHERE r.is_deleted = 0
    `;
    const params = [];

    if (department_id) {
      query += ` AND r.department_id = ?`;
      params.push(department_id);
    }
    if (created_by) {
      query += ` AND r.created_by = ?`;
      params.push(created_by);
    }
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND r.priority = ?`;
      params.push(priority);
    }
    if (search) {
      query += ` AND (r.request_number LIKE ? OR r.prepared_by LIKE ? OR r.purpose LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (startDate) {
      query += ` AND r.created_at >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND r.created_at <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);
    return rows;
  }

  async countAll({ department_id, created_by, status, priority, search, startDate, endDate }) {
    let query = `SELECT COUNT(*) as count FROM requests r WHERE r.is_deleted = 0`;
    const params = [];

    if (department_id) {
      query += ` AND r.department_id = ?`;
      params.push(department_id);
    }
    if (created_by) {
      query += ` AND r.created_by = ?`;
      params.push(created_by);
    }
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND r.priority = ?`;
      params.push(priority);
    }
    if (search) {
      query += ` AND (r.request_number LIKE ? OR r.prepared_by LIKE ? OR r.purpose LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [rows] = await db.query(query, params);
    return rows[0].count;
  }

  async updateStatus(id, status, remarks, updated_by) {
    await db.query(
      `UPDATE requests SET status = ?, remarks = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, remarks || '', updated_by || null, id]
    );
  }

  async softDelete(id, deleted_by) {
    await db.query(
      `UPDATE requests SET is_deleted = 1, deleted_by = ?, deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [deleted_by || null, id]
    );
  }

  async getDashboardMetrics(department_id = null) {
    let whereClause = `WHERE is_deleted = 0`;
    const params = [];
    if (department_id) {
      whereClause += ` AND department_id = ?`;
      params.push(department_id);
    }

    const [statusRows] = await db.query(
      `SELECT status, COUNT(*) as count FROM requests ${whereClause} GROUP BY status`,
      params
    );

    const [deptRows] = await db.query(
      `SELECT d.name as department_name, d.code as department_code, COUNT(r.id) as count 
       FROM requests r 
       JOIN departments d ON r.department_id = d.id 
       WHERE r.is_deleted = 0 
       GROUP BY d.id`,
      []
    );

    const [recentRows] = await db.query(
      `SELECT r.*, d.name as department_name 
       FROM requests r 
       JOIN departments d ON r.department_id = d.id 
       ${whereClause} 
       ORDER BY r.created_at DESC LIMIT 5`,
      params
    );

    return {
      statusCounts: statusRows,
      departmentBreakdown: deptRows,
      recentRequests: recentRows
    };
  }
}

module.exports = new RequestRepository();
