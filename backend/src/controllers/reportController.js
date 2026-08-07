const requestRepository = require('../repositories/requestRepository');
const excelService = require('../services/excelService');
const pdfService = require('../services/pdfService');
const { successResponse } = require('../utils/response');

class ReportController {
  async exportExcel(req, res, next) {
    try {
      const filters = {
        department_id: req.query.department_id,
        status: req.query.status,
        priority: req.query.priority,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: 1000,
        offset: 0
      };

      if (req.user.role === 'department') {
        filters.department_id = req.user.department_id;
      }

      const requests = await requestRepository.findAll(filters);
      const buffer = await excelService.generateRequestsExcel(requests);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="ERP_Requests_Report_${Date.now()}.xlsx"`);
      return res.send(buffer);
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const filters = {
        department_id: req.query.department_id,
        status: req.query.status,
        priority: req.query.priority,
        limit: 1000,
        offset: 0
      };

      if (req.user.role === 'department') {
        filters.department_id = req.user.department_id;
      }

      const requests = await requestRepository.findAll(filters);
      const buffer = await excelService.generateRequestsCsv(requests);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ERP_Requests_Report_${Date.now()}.csv"`);
      return res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
