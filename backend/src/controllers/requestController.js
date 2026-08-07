const requestService = require('../services/requestService');
const pdfService = require('../services/pdfService');
const notificationService = require('../services/notificationService');
const requestRepository = require('../repositories/requestRepository');
const { successResponse, errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

class RequestController {
  async create(req, res, next) {
    try {
      const { prepared_by, required_date, purpose } = req.body;
      if (!prepared_by || !required_date || !purpose) {
        return errorResponse(res, 'Prepared By, Required Date, and Purpose are required fields.', ['ValidationFailed'], HTTP_STATUS.BAD_REQUEST);
      }

      const request = await requestService.createRequest(req.user, req.body, req.files || []);

      // Trigger notification
      await notificationService.notify({
        departmentId: request.department_id,
        title: 'New Request Created',
        message: `Request ${request.request_number} created by ${request.prepared_by}.`,
        type: 'info'
      });

      return successResponse(res, 'Request created successfully', request, HTTP_STATUS.CREATED);
    } catch (err) {
      return errorResponse(res, err.message, ['RequestCreationError'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async list(req, res, next) {
    try {
      const filters = {
        department_id: req.query.department_id,
        status: req.query.status,
        priority: req.query.priority,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0
      };

      const result = await requestService.listRequests(req.user, filters);
      return successResponse(res, 'Requests fetched successfully', result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const request = await requestService.getRequestById(req.params.id, req.user);
      return successResponse(res, 'Request details retrieved', request);
    } catch (err) {
      return errorResponse(res, err.message, ['RequestNotFound'], HTTP_STATUS.NOT_FOUND);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, remarks } = req.body;
      if (!status) {
        return errorResponse(res, 'Status is required.', ['ValidationFailed'], HTTP_STATUS.BAD_REQUEST);
      }

      const updated = await requestService.updateRequestStatus(req.params.id, req.user, status, remarks);

      // Trigger notification
      await notificationService.notify({
        departmentId: updated.department_id,
        title: `Request ${status}`,
        message: `Request ${updated.request_number} status updated to '${status}'.`,
        type: status === 'Approved' ? 'success' : (status === 'Rejected' ? 'error' : 'info')
      });

      return successResponse(res, `Request status updated to ${status}`, updated);
    } catch (err) {
      return errorResponse(res, err.message, ['StatusUpdateError'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async printPdf(req, res, next) {
    try {
      const request = await requestService.getRequestById(req.params.id, req.user);
      const pdfBuffer = await pdfService.generateRequestPdf(request, req.user.full_name || req.user.username);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${request.request_number}.pdf"`);
      return res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const deptId = req.user.role === 'department' ? req.user.department_id : null;
      const metrics = await requestRepository.getDashboardMetrics(deptId);
      return successResponse(res, 'Dashboard metrics retrieved', metrics);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RequestController();
