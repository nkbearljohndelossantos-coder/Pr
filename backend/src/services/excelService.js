const ExcelJS = require('exceljs');
const requestRepository = require('../repositories/requestRepository');

class ExcelService {
  async exportRequestsExcel(res) {
    const requests = await requestRepository.findAll({ limit: 1000, offset: 0 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Requisitions');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Request Number', key: 'request_number', width: 22 },
      { header: 'Department', key: 'department_name', width: 28 },
      { header: 'Prepared By', key: 'prepared_by', width: 22 },
      { header: 'Required Date', key: 'required_date', width: 15 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Est. Cost ($)', key: 'total_estimated_cost', width: 20 },
      { header: 'Purpose', key: 'purpose', width: 35 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };

    requests.forEach((req) => {
      worksheet.addRow({
        id: req.id,
        request_number: req.request_number,
        department_name: `${req.department_name} (${req.department_code})`,
        prepared_by: req.prepared_by,
        required_date: new Date(req.required_date).toLocaleDateString(),
        priority: req.priority,
        status: req.status,
        total_estimated_cost: Number(req.total_estimated_cost).toFixed(2),
        purpose: req.purpose
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Requisitions_Report.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  }

  async exportRequestsCsv(res) {
    const requests = await requestRepository.findAll({ limit: 1000, offset: 0 });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Requisitions_Report.csv"');

    let csvContent = 'Request Number,Department,Prepared By,Required Date,Priority,Status,Total Cost,Purpose\n';
    requests.forEach((req) => {
      const safePurpose = `"${(req.purpose || '').replace(/"/g, '""')}"`;
      csvContent += `${req.request_number},"${req.department_name}",${req.prepared_by},${req.required_date},${req.priority},${req.status},${req.total_estimated_cost},${safePurpose}\n`;
    });

    res.send(csvContent);
  }
}

module.exports = new ExcelService();
