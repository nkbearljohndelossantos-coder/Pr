const ExcelJS = require('exceljs');

class ExcelService {
  async generateRequestsExcel(requests) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Department Requests');

    // Define Columns
    worksheet.columns = [
      { header: 'Request Number', key: 'request_number', width: 22 },
      { header: 'Department', key: 'department_name', width: 25 },
      { header: 'Prepared By', key: 'prepared_by', width: 20 },
      { header: 'Required Date', key: 'required_date', width: 15 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Est. Cost ($)', key: 'total_estimated_cost', width: 18 },
      { header: 'Purpose', key: 'purpose', width: 35 },
      { header: 'Created Date', key: 'created_at', width: 20 }
    ];

    // Styling Header Row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' }
    };

    // Add Rows
    requests.forEach((req) => {
      worksheet.addRow({
        request_number: req.request_number,
        department_name: `${req.department_name} (${req.department_code})`,
        prepared_by: req.prepared_by,
        required_date: req.required_date,
        priority: req.priority,
        status: req.status,
        total_estimated_cost: Number(req.total_estimated_cost || 0).toFixed(2),
        purpose: req.purpose,
        created_at: new Date(req.created_at).toLocaleString()
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateRequestsCsv(requests) {
    let csv = 'Request Number,Department,Prepared By,Required Date,Priority,Status,Total Cost,Purpose,Date Created\n';
    requests.forEach((req) => {
      const safePurpose = `"${(req.purpose || '').replace(/"/g, '""')}"`;
      csv += `${req.request_number},${req.department_name},${req.prepared_by},${req.required_date},${req.priority},${req.status},${req.total_estimated_cost},${safePurpose},${new Date(req.created_at).toISOString()}\n`;
    });
    return Buffer.from(csv, 'utf-8');
  }
}

module.exports = new ExcelService();
