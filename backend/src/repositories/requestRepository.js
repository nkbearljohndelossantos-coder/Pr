const db = require('../config/db');

class RequestRepository {
  async create({ request_number, department_id, prepared_by, position, required_date, purpose, business_justification, priority, status, total_estimated_cost, created_by }) {
    const statusVal = status === 'Submitted' ? 'Submitted' : 'Draft';
    const costVal = Number(total_estimated_cost) || 0.00;
    const [res] = await db.query(
      `INSERT INTO requests (request_number, department_id, prepared_by, position, required_date, purpose, business_justification, priority, status, total_estimated_cost, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [request_number, department_id, prepared_by, position, required_date, purpose, business_justification, priority, statusVal, costVal, created_by || null]
    );
    return res.insertId;
  }

  async addItem({ request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks, item_type }) {
    const typeVal = item_type || 'subscription';
    try {
      const [res] = await db.query(
        `INSERT INTO request_items (request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks, item_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks || '', typeVal]
      );
      return res.insertId;
    } catch (e) {
      const [res] = await db.query(
        `INSERT INTO request_items (request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [request_id, item_description, quantity, unit, estimated_cost, total_cost, remarks || '']
      );
      return res.insertId;
    }
  }

  async addAttachment({ request_id, original_name, filename, file_path, file_type, file_size }) {
    const [res] = await db.query(
      `INSERT INTO attachments (request_id, original_name, filename, file_path, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [request_id, original_name, filename, file_path, file_type, file_size]
    );
    return res.insertId;
  }

  async findById(id) {
    const [reqs] = await db.query(
      `SELECT r.*, d.name as department_name, d.code as department_code 
       FROM requests r 
       LEFT JOIN departments d ON r.department_id = d.id 
       WHERE r.id = ? AND r.is_deleted = 0`,
      [id]
    );

    if (!reqs || reqs.length === 0) return null;

    const request = reqs[0];
    const [items] = await db.query(`SELECT * FROM request_items WHERE request_id = ? AND is_deleted = 0`, [id]);
    const [attachments] = await db.query(`SELECT * FROM attachments WHERE request_id = ? AND is_deleted = 0`, [id]);

    request.items = items;
    request.attachments = attachments;

    if ((!request.total_estimated_cost || Number(request.total_estimated_cost) === 0) && items && items.length > 0) {
      request.total_estimated_cost = items.reduce((sum, item) => sum + (Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost))), 0);
    }

    return request;
  }

  async findAll(filters = {}) {
    const { department_id, status, search, page = 1, limit = 20 } = filters;
    let query = `SELECT r.*, d.name as department_name, d.code as department_code 
                 FROM requests r 
                 LEFT JOIN departments d ON r.department_id = d.id 
                 WHERE r.is_deleted = 0`;
    const params = [];

    if (department_id) {
      query += ` AND r.department_id = ?`;
      params.push(department_id);
    }
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (r.request_number LIKE ? OR r.purpose LIKE ? OR r.prepared_by LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    const offset = (page - 1) * limit;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);

    for (const row of rows) {
      const [items] = await db.query(`SELECT * FROM request_items WHERE request_id = ? AND is_deleted = 0`, [row.id]);
      const [attachments] = await db.query(`SELECT * FROM attachments WHERE request_id = ? AND is_deleted = 0`, [row.id]);
      row.items = items;
      row.attachments = attachments;
      if ((!row.total_estimated_cost || Number(row.total_estimated_cost) === 0) && items && items.length > 0) {
        row.total_estimated_cost = items.reduce((sum, item) => sum + (Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost))), 0);
      }
    }

    return rows;
  }

  async countAll(filters = {}) {
    const { department_id, status, search } = filters;
    let query = `SELECT COUNT(*) as count FROM requests r WHERE r.is_deleted = 0`;
    const params = [];

    if (department_id) {
      query += ` AND r.department_id = ?`;
      params.push(department_id);
    }
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (r.request_number LIKE ? OR r.purpose LIKE ? OR r.prepared_by LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [rows] = await db.query(query, params);
    return rows[0]?.count || 0;
  }

  async update(id, data) {
    const {
      department_id,
      prepared_by,
      position,
      required_date,
      purpose,
      business_justification,
      priority,
      status,
      total_estimated_cost,
      revision_number,
      updated_at
    } = data;

    await db.query(
      `UPDATE requests SET 
         department_id = COALESCE(?, department_id),
         prepared_by = ?,
         position = ?,
         required_date = ?,
         purpose = ?,
         business_justification = ?,
         priority = ?,
         status = COALESCE(?, status),
         total_estimated_cost = ?,
         revision_number = ?,
         updated_at = ?
       WHERE id = ? AND is_deleted = 0`,
      [
        department_id || null,
        prepared_by,
        position,
        required_date,
        purpose,
        business_justification,
        priority,
        status || null,
        total_estimated_cost || 0,
        revision_number || 1,
        updated_at || new Date().toISOString(),
        id
      ]
    );
  }

  async deleteItemsByRequestId(requestId) {
    await db.query(`DELETE FROM request_items WHERE request_id = ?`, [requestId]);
  }

  async deleteAttachmentsByRequestId(requestId) {
    await db.query(`DELETE FROM attachments WHERE request_id = ?`, [requestId]);
  }

  async deleteAttachment(attachmentId) {
    await db.query(`DELETE FROM attachments WHERE id = ?`, [attachmentId]);
  }

  async updateStatus(id, status, remarks, updated_by) {
    await db.query(
      `UPDATE requests SET status = ?, remarks = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, remarks || '', updated_by || null, id]
    );
  }

  async softDelete(id, deleted_by) {
    await db.query(`DELETE FROM request_items WHERE request_id = ?`, [id]);
    await db.query(`DELETE FROM attachments WHERE request_id = ?`, [id]);
    await db.query(`DELETE FROM requests WHERE id = ?`, [id]);
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
      `SELECT r.*, d.name as department_name, d.code as department_code 
       FROM requests r 
       LEFT JOIN departments d ON r.department_id = d.id 
       WHERE r.is_deleted = 0 
       ORDER BY r.created_at DESC LIMIT 5`,
      []
    );

    for (const row of recentRows) {
      const [items] = await db.query(`SELECT * FROM request_items WHERE request_id = ? AND is_deleted = 0`, [row.id]);
      row.items = items;
      if ((!row.total_estimated_cost || Number(row.total_estimated_cost) === 0) && items && items.length > 0) {
        row.total_estimated_cost = items.reduce((sum, item) => sum + (Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost))), 0);
      }
    }

    return {
      status_counts: statusRows || [],
      department_counts: deptRows || [],
      recent_requests: recentRows || [],
      statusCounts: statusRows || [],
      departmentBreakdown: deptRows || [],
      recentRequests: recentRows || []
    };
  }
}

module.exports = new RequestRepository();
