const requestService = require('../services/requestService');
const pdfService = require('../services/pdfService');
const { successResponse, errorResponse } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpCodes');

class RequestController {
  async create(req, res, next) {
    try {
      const files = req.files || [];
      const newRequest = await requestService.createRequest(req.user, req.body, files);
      return successResponse(res, 'Requisition created successfully.', newRequest, HTTP_STATUS.CREATED);
    } catch (err) {
      return errorResponse(res, err.message, ['CreateFailed'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async list(req, res, next) {
    try {
      const { page = 1, limit = 50, status, priority, search, startDate, endDate } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const result = await requestService.listRequests(req.user, {
        limit: Number(limit),
        offset,
        status,
        priority,
        search,
        startDate,
        endDate
      });
      return successResponse(res, 'Requisitions retrieved successfully.', result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const requestData = await requestService.getRequestById(id);
      return successResponse(res, 'Requisition details retrieved.', requestData);
    } catch (err) {
      return errorResponse(res, err.message, ['NotFound'], HTTP_STATUS.NOT_FOUND);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      if (!status) {
        return errorResponse(res, 'Target status is required.', ['ValidationError'], HTTP_STATUS.BAD_REQUEST);
      }
      const updated = await requestService.updateStatus(req.user, id, { status, remarks });
      return successResponse(res, `Requisition status updated to '${status}'.`, updated);
    } catch (err) {
      return errorResponse(res, err.message, ['UpdateFailed'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async generatePdf(req, res, next) {
    try {
      const { id } = req.params;
      const requestData = await requestService.getRequestById(id);
      await pdfService.generateRequestPdf(requestData, res);
    } catch (err) {
      return errorResponse(res, err.message, ['PdfFailed'], HTTP_STATUS.BAD_REQUEST);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const metrics = await requestService.getDashboardData(req.user);
      return successResponse(res, 'Dashboard metrics retrieved.', metrics);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RequestController();
