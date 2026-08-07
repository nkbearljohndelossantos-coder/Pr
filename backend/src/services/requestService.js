const requestRepository = require('../repositories/requestRepository');
const departmentRepository = require('../repositories/departmentRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { generateRequestNumber } = require('../utils/requestNumberGenerator');
const { REQUEST_STATUS } = require('../constants/status');

class RequestService {
  async createRequest(user, payload, files = []) {
    const department_id = user.role === 'department' ? user.department_id : payload.department_id;
    if (!department_id) throw new Error('Department ID is required to create a request.');

    const dept = await departmentRepository.findById(department_id);
    if (!dept) throw new Error('Target department not found.');

    const newSeq = await departmentRepository.incrementSeqCounter(dept.id);
    const request_number = generateRequestNumber(dept.code, newSeq);

    let items = [];
    if (typeof payload.items === 'string') {
      try { items = JSON.parse(payload.items); } catch (e) { items = []; }
    } else if (Array.isArray(payload.items)) {
      items = payload.items;
    }

    const total_estimated_cost = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.estimated_cost || 0)), 0);

    const requestId = await requestRepository.createRequest({
      request_number,
      department_id: dept.id,
      prepared_by: payload.prepared_by || user.full_name || user.username,
      position: payload.position || 'Staff',
      required_date: payload.required_date,
      purpose: payload.purpose,
      business_justification: payload.business_justification || '',
      priority: payload.priority || 'Normal',
      status: REQUEST_STATUS.SUBMITTED,
      total_estimated_cost,
      created_by: user.id
    });

    for (const item of items) {
      await requestRepository.addRequestItem({
        request_id: requestId,
        item_description: item.item_description,
        quantity: item.quantity,
        unit: item.unit || 'PCS',
        estimated_cost: item.estimated_cost,
        total_cost: Number(item.quantity) * Number(item.estimated_cost),
        remarks: item.remarks || ''
      });
    }

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

    await notificationRepository.create({
      title: 'New Requisition Submitted',
      message: `Requisition ${request_number} was submitted by ${dept.name} (${user.username}).`,
      type: 'info'
    });

    return await requestRepository.findById(requestId);
  }

  async getRequestById(id) {
    const req = await requestRepository.findById(id);
    if (!req) throw new Error('Request not found.');
    return req;
  }

  async listRequests(user, filters) {
    if (user.role === 'department') {
      filters.department_id = user.department_id;
    }
    if (filters.mineOnly === 'true' || filters.mineOnly === true) {
      filters.created_by = user.id;
    }
    const data = await requestRepository.findAll(filters);
    const total = await requestRepository.countAll(filters);
    return { data, total, page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1, limit: filters.limit };
  }

  async updateStatus(user, id, { status, remarks }) {
    const req = await requestRepository.findById(id);
    if (!req) throw new Error('Request not found.');

    await requestRepository.updateStatus(id, status, remarks, user.id);

    await notificationRepository.create({
      department_id: req.department_id,
      title: `Requisition Status Updated: ${status}`,
      message: `Requisition ${req.request_number} status changed to '${status}' by ${user.username}.`,
      type: status === REQUEST_STATUS.APPROVED ? 'success' : status === REQUEST_STATUS.REJECTED ? 'danger' : 'info'
    });

    return await requestRepository.findById(id);
  }

  async getDashboardData(user) {
    const deptId = user.role === 'department' ? user.department_id : null;
    return await requestRepository.getDashboardMetrics(deptId);
  }
}

module.exports = new RequestService();
