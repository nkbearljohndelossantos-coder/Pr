const excelService = require('../services/excelService');

class ReportController {
  async exportExcel(req, res, next) {
    try {
      await excelService.exportRequestsExcel(res);
    } catch (err) {
      next(err);
    }
  }

  async exportCsv(req, res, next) {
    try {
      await excelService.exportRequestsCsv(res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
