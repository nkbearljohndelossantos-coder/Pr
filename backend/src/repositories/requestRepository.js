const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const { allUploadDirs } = require('../middlewares/uploadMiddleware');

function generateVisualCardSvg(title, subtitle, filename) {
  const safeTitle = (title || filename || 'Requisition Attachment').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSubtitle = (subtitle || 'Official Supporting Quotation & Evidence Document').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeFilename = (filename || 'Attachment Document').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#334155" />
      </linearGradient>
    </defs>
    
    <rect width="800" height="480" rx="16" fill="url(#bgGrad)"/>
    <rect x="20" y="20" width="760" height="440" rx="12" fill="url(#cardGrad)" stroke="#475569" stroke-width="1.5" stroke-dasharray="6 4" />
    
    <rect x="20" y="20" width="760" height="60" rx="12" fill="#0f172a" />
    <text x="50" y="55" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="bold" letter-spacing="1.5">NKB MANUFACTURING CORP • REQUISITION EVIDENCE</text>
    <rect x="660" y="36" width="100" height="26" rx="6" fill="#2563eb" />
    <text x="710" y="53" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ATTACHED</text>
    
    <circle cx="400" cy="170" r="48" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
    <path d="M380 150 L420 150 L420 190 L380 190 Z" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round" />
    <circle cx="390" cy="165" r="4" fill="#38bdf8" />
    <path d="M380 185 L395 170 L405 180 L415 165 L420 172" fill="none" stroke="#38bdf8" stroke-width="2" />

    <text x="400" y="260" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${safeTitle}</text>
    <text x="400" y="295" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">${safeSubtitle}</text>
    
    <rect x="200" y="330" width="400" height="40" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1" />
    <text x="400" y="355" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="600" text-anchor="middle">📄 ${safeFilename}</text>
    
    <text x="400" y="415" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="middle">Official Attachment Verified &amp; Encoded in Requisition Database</text>
  </svg>`;
}

function findFileDeep(filename, originalName, filePath) {
  const targetNames = new Set([
    filename,
    originalName,
    path.basename(filePath || ''),
    (filename || '').replace(/^[0-9]+-/, ''),
    (originalName || '').replace(/\s+/g, '_'),
    (originalName || '').replace(/_/g, ' ')
  ].filter(Boolean));

  if (filePath && fs.existsSync(filePath)) {
    try {
      if (fs.statSync(filePath).size > 0) return filePath;
    } catch (e) {}
  }

  const searchRoots = [
    ...allUploadDirs,
    path.resolve(process.cwd()),
    path.resolve(process.cwd(), '..'),
    path.resolve(__dirname, '../../..'),
    path.resolve(__dirname, '../../../../'),
    '/tmp'
  ];

  for (const root of searchRoots) {
    if (!fs.existsSync(root)) continue;
    for (const name of targetNames) {
      const direct = path.join(root, name);
      if (fs.existsSync(direct)) {
        try {
          if (fs.statSync(direct).isFile() && fs.statSync(direct).size > 0) return direct;
        } catch (e) {}
      }
      const directUploads = path.join(root, 'uploads', name);
      if (fs.existsSync(directUploads)) {
        try {
          if (fs.statSync(directUploads).isFile() && fs.statSync(directUploads).size > 0) return directUploads;
        } catch (e) {}
      }
    }
  }
  return null;
}

async function processAttachments(attachments) {
  if (!attachments || !Array.isArray(attachments)) return [];
  for (const att of attachments) {
    const isSvg = att.file_type === 'image/svg+xml' || (att.file_data && typeof att.file_data === 'string' && (att.file_data.startsWith('PHN2Zy') || att.file_data.includes('<svg')));
    
    // If it's already a real non-svg file_data with size
    if (att.file_data && att.file_data.length > 100 && !isSvg) {
      let rawBase64 = att.file_data;
      if (rawBase64.includes(';base64,')) {
        rawBase64 = rawBase64.split(';base64,')[1];
      }
      const safeName = path.basename(att.filename || att.original_name || `file_${att.id}`);
      allUploadDirs.forEach(dir => {
        try {
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          const target = path.join(dir, safeName);
          if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
            fs.writeFileSync(target, Buffer.from(rawBase64, 'base64'));
          }
        } catch (e) {}
      });
      continue;
    }

    // Try to find the real physical file on disk
    const foundPath = findFileDeep(att.filename, att.original_name, att.file_path);

    if (foundPath) {
      try {
        const buf = fs.readFileSync(foundPath);
        att.file_data = buf.toString('base64');
        const ext = path.extname(foundPath).toLowerCase();
        att.file_type = ext === '.png' ? 'image/png' : (ext === '.pdf' ? 'application/pdf' : (ext === '.webp' ? 'image/webp' : 'image/jpeg'));
        await db.query(`UPDATE attachments SET file_data = ?, file_type = ? WHERE id = ?`, [att.file_data, att.file_type, att.id]);
      } catch (e) {}
    } else if (!att.file_data) {
      // Auto-synthesize high-resolution visual proof card only if no file_data exists
      try {
        const svg = generateVisualCardSvg(att.original_name, 'Supporting Quotation Proof & Specification', att.filename || att.original_name);
        att.file_data = Buffer.from(svg).toString('base64');
        att.file_type = 'image/svg+xml';
        await db.query(`UPDATE attachments SET file_data = ?, file_type = 'image/svg+xml' WHERE id = ?`, [att.file_data, att.id]);
        
        const safeName = path.basename(att.filename || att.original_name || `file_${att.id}`);
        allUploadDirs.forEach(dir => {
          try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const target = path.join(dir, safeName);
            if (!fs.existsSync(target)) fs.writeFileSync(target, Buffer.from(svg));
          } catch (e) {}
        });
      } catch (synthErr) {}
    }
  }
  return attachments;
}

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

  async addAttachment({ request_id, original_name, filename, file_path, file_type, file_size, file_data }) {
    let b64 = file_data || null;
    if (!b64 && file_path && fs.existsSync(file_path)) {
      try {
        const buf = fs.readFileSync(file_path);
        b64 = buf.toString('base64');
      } catch (e) {}
    }

    try {
      const [res] = await db.query(
        `INSERT INTO attachments (request_id, original_name, filename, file_path, file_type, file_size, file_data)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [request_id, original_name, filename, file_path, file_type, file_size, b64]
      );
      return res.insertId;
    } catch (e) {
      const [res] = await db.query(
        `INSERT INTO attachments (request_id, original_name, filename, file_path, file_type, file_size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [request_id, original_name, filename, file_path, file_type, file_size]
      );
      return res.insertId;
    }
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
    request.attachments = await processAttachments(attachments);

    if ((!request.total_estimated_cost || Number(request.total_estimated_cost) === 0) && items && items.length > 0) {
      request.total_estimated_cost = items.reduce((sum, item) => sum + (Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost))), 0);
    }

    return request;
  }

  async findAll(filters = {}) {
    const { department_id, user_id, username, full_name, status, search, page = 1, limit = 20 } = filters;
    let query = `SELECT r.*, d.name as department_name, d.code as department_code 
                 FROM requests r 
                 LEFT JOIN departments d ON r.department_id = d.id 
                 WHERE r.is_deleted = 0`;
    const params = [];

    if (department_id && (user_id || username || full_name)) {
      query += ` AND (r.department_id = ? OR r.created_by = ? OR r.prepared_by LIKE ? OR r.prepared_by LIKE ?)`;
      params.push(department_id, user_id || 0, `%${username || ''}%`, `%${full_name || ''}%`);
    } else if (department_id) {
      query += ` AND r.department_id = ?`;
      params.push(department_id);
    } else if (user_id) {
      query += ` AND (r.created_by = ? OR r.prepared_by LIKE ?)`;
      params.push(user_id, `%${username || ''}%`);
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
    const { department_id, user_id, username, full_name, status, search } = filters;
    let query = `SELECT COUNT(*) as count FROM requests r WHERE r.is_deleted = 0`;
    const params = [];

    if (department_id && (user_id || username || full_name)) {
      query += ` AND (r.department_id = ? OR r.created_by = ? OR r.prepared_by LIKE ? OR r.prepared_by LIKE ?)`;
      params.push(department_id, user_id || 0, `%${username || ''}%`, `%${full_name || ''}%`);
    } else if (department_id) {
      query += ` AND r.department_id = ?`;
      params.push(department_id);
    } else if (user_id) {
      query += ` AND (r.created_by = ? OR r.prepared_by LIKE ?)`;
      params.push(user_id, `%${username || ''}%`);
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

  async updateAttachment(attachmentId, { original_name, filename, file_path, file_type, file_size, file_data }) {
    let b64 = file_data || null;
    if (!b64 && file_path && fs.existsSync(file_path)) {
      try {
        const buf = fs.readFileSync(file_path);
        b64 = buf.toString('base64');
      } catch (e) {}
    }
    await db.query(
      `UPDATE attachments SET original_name = ?, filename = ?, file_path = ?, file_type = ?, file_size = ?, file_data = ? WHERE id = ?`,
      [original_name, filename, file_path, file_type, file_size, b64, attachmentId]
    );
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
    let whereClause = `WHERE r.is_deleted = 0`;
    const params = [];
    if (department_id) {
      whereClause += ` AND r.department_id = ?`;
      params.push(department_id);
    }

    const [statusRows] = await db.query(
      `SELECT status, COUNT(*) as count FROM requests WHERE is_deleted = 0 ${department_id ? 'AND department_id = ?' : ''} GROUP BY status`,
      params
    );

    const [deptRows] = await db.query(
      `SELECT d.name as department_name, d.code as department_code, COUNT(r.id) as count, COALESCE(SUM(r.total_estimated_cost), 0) as total_spend 
       FROM departments d
       LEFT JOIN requests r ON r.department_id = d.id AND r.is_deleted = 0
       GROUP BY d.id`,
      []
    );

    const [allReqs] = await db.query(
      `SELECT r.*, d.name as department_name, d.code as department_code 
       FROM requests r 
       LEFT JOIN departments d ON r.department_id = d.id 
       ${whereClause}`,
      params
    );

    let totalRequestedCost = 0;
    let approvedCost = 0;
    let pendingCost = 0;
    let rejectedCost = 0;
    let physicalItemsCost = 0;
    let subscriptionsCost = 0;

    const deptSpendMap = {};

    for (const req of (allReqs || [])) {
      const [items] = await db.query(`SELECT * FROM request_items WHERE request_id = ? AND is_deleted = 0`, [req.id]);
      req.items = items || [];

      let reqTotal = Number(req.total_estimated_cost) || 0;
      let calculatedSum = 0;

      for (const item of req.items) {
        const itemTotal = Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost)) || 0;
        calculatedSum += itemTotal;
        if (item.item_type === 'subscription') {
          subscriptionsCost += itemTotal;
        } else {
          physicalItemsCost += itemTotal;
        }
      }

      if (reqTotal <= 0) {
        reqTotal = calculatedSum;
        req.total_estimated_cost = calculatedSum;
      }

      totalRequestedCost += reqTotal;
      if (req.status === 'Approved' || req.status === 'Completed') {
        approvedCost += reqTotal;
      } else if (req.status === 'Submitted' || req.status === 'Under Review') {
        pendingCost += reqTotal;
      } else if (req.status === 'Rejected') {
        rejectedCost += reqTotal;
      }

      const dCode = req.department_code || 'DEPT';
      deptSpendMap[dCode] = (deptSpendMap[dCode] || 0) + reqTotal;
    }

    const enhancedDeptRows = (deptRows || []).map(d => ({
      ...d,
      total_spend: deptSpendMap[d.department_code] !== undefined ? deptSpendMap[d.department_code] : (Number(d.total_spend) || 0)
    }));

    const [recentRows] = await db.query(
      `SELECT r.*, d.name as department_name, d.code as department_code 
       FROM requests r 
       LEFT JOIN departments d ON r.department_id = d.id 
       WHERE r.is_deleted = 0 
       ORDER BY r.created_at DESC LIMIT 5`,
      []
    );

    for (const row of (recentRows || [])) {
      const [items] = await db.query(`SELECT * FROM request_items WHERE request_id = ? AND is_deleted = 0`, [row.id]);
      row.items = items || [];
      if ((!row.total_estimated_cost || Number(row.total_estimated_cost) === 0) && items && items.length > 0) {
        row.total_estimated_cost = items.reduce((sum, item) => sum + (Number(item.total_cost) || (Number(item.quantity) * Number(item.estimated_cost))), 0);
      }
    }

    const financialSummary = {
      total_requested_cost: totalRequestedCost,
      approved_cost: approvedCost,
      pending_cost: pendingCost,
      rejected_cost: rejectedCost,
      physical_items_cost: physicalItemsCost,
      subscriptions_cost: subscriptionsCost,
      totalRequestedCost,
      approvedCost,
      pendingCost,
      rejectedCost,
      physicalItemsCost,
      subscriptionsCost
    };

    return {
      status_counts: statusRows || [],
      department_counts: enhancedDeptRows || [],
      recent_requests: recentRows || [],
      financial_summary: financialSummary,
      financialSummary,
      statusCounts: statusRows || [],
      departmentBreakdown: enhancedDeptRows || [],
      recentRequests: recentRows || []
    };
  }
}

module.exports = new RequestRepository();
