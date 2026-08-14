const requestRepository = require('../repositories/requestRepository');
const departmentRepository = require('../repositories/departmentRepository');
const emailService = require('./emailService');
const logger = require('../utils/logger');

const generateRequestNumber = (deptCode, seq) => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seqStr = String(seq).padStart(5, '0');
  return `REQ-${deptCode.toUpperCase()}-${dateStr}-${seqStr}`;
};

const parseNum = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  if (str.includes(',')) {
    str = str.replace(/,/g, '');
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

class RequestService {
  async createRequest(user, data, files) {
    let deptId = data?.department_id || user?.department_id || 1;
    let dept = await departmentRepository.findById(deptId);
    if (!dept) {
      const allDepts = await departmentRepository.findAll();
      if (allDepts && allDepts.length > 0) {
        dept = allDepts[0];
      } else {
        throw new Error('Invalid department specified.');
      }
    }

    const totalCount = await requestRepository.countAll({ department_id: dept.id });
    const newSeq = (totalCount || 0) + 1;
    const requestNumber = generateRequestNumber(dept.code, newSeq);

    // Calculate item total cost with comma stripping
    let items = [];
    if (typeof data.items === 'string') {
      try { items = JSON.parse(data.items); } catch(e) { items = []; }
    } else if (Array.isArray(data.items)) {
      items = data.items;
    }

    if (!items || items.length === 0) {
      throw new Error('Please add at least 1 Item or 1 Subscription to submit a requisition request.');
    }

    let totalEstimatedCost = 0;
    const itemsToInsert = items.map((item) => {
      const qty = parseNum(item.quantity) || 1;
      const cost = parseNum(item.estimated_cost);
      const total = qty * cost;
      totalEstimatedCost += total;
      return {
        item_description: item.item_description,
        quantity: qty,
        unit: item.unit || 'PCS',
        estimated_cost: cost,
        total_cost: total,
        remarks: item.remarks || '',
        item_type: item.item_type || 'item'
      };
    });

    const requestId = await requestRepository.create({
      request_number: requestNumber,
      department_id: dept.id,
      prepared_by: data.prepared_by || user?.full_name || user?.username || 'Staff',
      position: data.position || '',
      required_date: data.required_date || new Date().toISOString().split('T')[0],
      purpose: data.purpose,
      business_justification: data.business_justification || '',
      priority: data.priority || 'Normal',
      status: data.status === 'Submitted' ? 'Submitted' : 'Draft',
      total_estimated_cost: totalEstimatedCost,
      created_by: user?.id || null
    });

    // Save request items
    for (const item of itemsToInsert) {
      await requestRepository.addItem({ request_id: requestId, ...item });
    }

    // Save attachments
    if (files && files.length > 0) {
      for (const file of files) {
        await requestRepository.addAttachment({
          request_id: requestId,
          original_name: file.originalname,
          filename: file.filename,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size
        });
      }
    }

    const createdReq = await requestRepository.findById(requestId);
    if (createdReq && createdReq.status === 'Submitted') {
      emailService.sendApprovalNotification(createdReq).catch((err) => {
        logger.error('Failed to trigger background approval email notification:', err.message);
      });
    }
    return createdReq;
  }

  async updateRequest(id, user, data, files) {
    const existing = await requestRepository.findById(id);
    if (!existing) throw new Error('Request not found.');

    if (user.role === 'department' && user.department_id !== existing.department_id) {
      throw new Error('Access denied. You can only edit requests from your own department.');
    }

    if (existing.status === 'Approved') {
      throw new Error('Cannot edit a request that has already been approved.');
    }

    let items = [];
    if (typeof data.items === 'string') {
      try { items = JSON.parse(data.items); } catch (e) {}
    } else if (Array.isArray(data.items)) {
      items = data.items;
    }

    let totalEstimatedCost = existing.total_estimated_cost;
    if (items && items.length > 0) {
      totalEstimatedCost = 0;
      const itemsToInsert = items.map((item) => {
        const qty = parseNum(item.quantity) || 1;
        const cost = parseNum(item.estimated_cost);
        const total = qty * cost;
        totalEstimatedCost += total;
        return {
          item_description: item.item_description,
          quantity: qty,
          unit: item.unit || 'PCS',
          estimated_cost: cost,
          total_cost: total,
          remarks: item.remarks || '',
          item_type: item.item_type || 'item'
        };
      });

      await requestRepository.deleteItemsByRequestId(id);
      for (const item of itemsToInsert) {
        await requestRepository.addItem({ request_id: Number(id), ...item });
      }
    }

    await requestRepository.update(id, {
      prepared_by: data.prepared_by || existing.prepared_by,
      position: data.position !== undefined ? data.position : existing.position,
      required_date: data.required_date || existing.required_date,
      purpose: data.purpose || existing.purpose,
      business_justification: data.business_justification !== undefined ? data.business_justification : existing.business_justification,
      priority: data.priority || existing.priority,
      status: data.status || existing.status,
      total_estimated_cost: totalEstimatedCost,
      revision_number: (existing.revision_number || 1) + 1,
      updated_at: new Date().toISOString()
    });

    // 1. Handle soft-delete for specific removed attachments
    if (data.remove_attachment_ids) {
      let removeIds = [];
      if (typeof data.remove_attachment_ids === 'string') {
        try { removeIds = JSON.parse(data.remove_attachment_ids); } catch (e) {}
      } else if (Array.isArray(data.remove_attachment_ids)) {
        removeIds = data.remove_attachment_ids;
      }
      for (const attId of removeIds) {
        await requestRepository.deleteAttachment(attId);
      }
    }

    // 2. If new files are uploaded, replace old attachments with newly uploaded ones!
    if (files && files.length > 0) {
      await requestRepository.deleteAttachmentsByRequestId(id);
      for (const file of files) {
        await requestRepository.addAttachment({
          request_id: Number(id),
          original_name: file.originalname,
          filename: file.filename,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size
        });
      }
    }

    const updatedReq = await requestRepository.findById(id);
    if (updatedReq && updatedReq.status === 'Submitted') {
      emailService.sendApprovalNotification(updatedReq).catch((err) => {
        logger.error('Failed to trigger background approval email notification:', err.message);
      });
    }
    return updatedReq;
  }

  async getRequestById(id, user) {
    const req = await requestRepository.findById(id);
    if (!req) throw new Error('Request not found.');

    // Department accounts can only view their own department requests
    if (user.role === 'department' && user.department_id !== req.department_id) {
      throw new Error('Access denied. You can only view requests from your own department.');
    }

    return req;
  }

  async listRequests(user, filters) {
    if (user.role === 'department') {
      filters.department_id = user.department_id;
    }
    const data = await requestRepository.findAll(filters);
    const total = await requestRepository.countAll(filters);
    return { data, total, limit: filters.limit, offset: filters.offset };
  }

  async updateRequestStatus(id, user, status, remarks) {
    const req = await requestRepository.findById(id);
    if (!req) throw new Error('Request not found.');

    await requestRepository.updateStatus(id, status, remarks, user.id);
    return await requestRepository.findById(id);
  }
}

module.exports = new RequestService();
