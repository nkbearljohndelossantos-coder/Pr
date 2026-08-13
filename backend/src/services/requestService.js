const requestRepository = require('../repositories/requestRepository');
const departmentRepository = require('../repositories/departmentRepository');
const { generateRequestNumber } = require('../utils/requestNumberGenerator');

const parseNum = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const num = parseFloat(String(val).replace(/,/g, '').trim());
  return isNaN(num) ? 0 : num;
};

class RequestService {
  async createRequest(user, data, files) {
    const deptId = data.department_id || user.department_id;
    const dept = await departmentRepository.findById(deptId);
    if (!dept) throw new Error('Invalid department specified.');

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

    const requestId = await requestRepository.createRequest({
      request_number: requestNumber,
      department_id: dept.id,
      prepared_by: data.prepared_by || user.full_name || user.username,
      position: data.position || '',
      required_date: data.required_date || new Date().toISOString().split('T')[0],
      purpose: data.purpose,
      business_justification: data.business_justification || '',
      priority: data.priority || 'Normal',
      status: data.status === 'Submitted' ? 'Submitted' : 'Draft',
      total_estimated_cost: totalEstimatedCost,
      created_by: user.id
    });

    // Save request items
    for (const item of itemsToInsert) {
      await requestRepository.addRequestItem({ request_id: requestId, ...item });
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

    return await requestRepository.findById(requestId);
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
