const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const parseNum = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const num = parseFloat(String(val).replace(/,/g, '').trim());
  return isNaN(num) ? 0 : num;
};

const fmtCurr = (val) => {
  const num = parseNum(val);
  return 'PHP ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtQty = (val) => {
  const num = parseNum(val);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

class PdfService {
  async generateRequisitionPdf(request) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const buffers = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header Section
        doc.rect(40, 40, 515, 60).fill('#1E293B');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16);
        doc.text('NKB MANUFACTURING CORPORATION', 55, 52);
        doc.fontSize(10).font('Helvetica').fillColor('#94A3B8');
        doc.text('PURCHASE REQUISITION SLIP', 55, 74);

        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(12);
        doc.text(request.request_number || 'REQ-0000', 400, 52, { align: 'right', width: 140 });
        doc.fontSize(9).font('Helvetica').fillColor('#38BDF8');
        doc.text(`Status: ${request.status}`, 400, 74, { align: 'right', width: 140 });

        let y = 115;

        // General Info Grid
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9);
        doc.text('REQUISITION METADATA', 40, y);
        doc.moveTo(40, y + 12).lineTo(555, y + 12).strokeColor('#CBD5E1').stroke();
        y += 20;

        doc.font('Helvetica-Bold').fontSize(8);
        doc.text('DEPARTMENT:', 40, y);
        doc.font('Helvetica').text(request.department_name || 'N/A', 115, y);

        doc.font('Helvetica-Bold').text('DATE REQUESTED:', 330, y);
        doc.font('Helvetica').text(new Date(request.created_at).toLocaleDateString(), 420, y);

        y += 15;
        doc.font('Helvetica-Bold').text('PREPARED BY:', 40, y);
        doc.font('Helvetica').text(request.prepared_by || 'N/A', 115, y);

        doc.font('Helvetica-Bold').text('REQUIRED DATE:', 330, y);
        doc.font('Helvetica').text(request.required_date || 'N/A', 420, y);

        y += 15;
        doc.font('Helvetica-Bold').text('POSITION:', 40, y);
        doc.font('Helvetica').text(request.position || 'N/A', 115, y);

        doc.font('Helvetica-Bold').text('PRIORITY:', 330, y);
        doc.font('Helvetica').text(request.priority || 'Normal', 420, y);

        y += 25;
        doc.font('Helvetica-Bold').text('PURPOSE OF REQUEST:', 40, y);
        y += 12;
        doc.font('Helvetica').fontSize(8);
        doc.rect(40, y, 515, 30).fill('#F8FAFC').stroke('#E2E8F0');
        doc.fillColor('#1E293B').text(request.purpose || 'N/A', 48, y + 6, { width: 500 });

        y += 40;

        // Items vs Subscriptions Breakdown
        const allItems = request.items || [];
        const physicalItems = allItems.filter(i => i.item_type !== 'subscription');
        const subscriptionItems = allItems.filter(i => i.item_type === 'subscription');
        let totalAmount = 0;

        if (physicalItems.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#1E293B').text('REQUEST ITEMS BREAKDOWN', 40, y);
          doc.fillColor('#000000');
          y += 15;

          doc.fillColor('#F1F5F9').rect(40, y, 515, 20).fill();
          doc.fillColor('#334155').font('Helvetica-Bold').fontSize(9);
          doc.text('#', 45, y + 5);
          doc.text('Item Description', 70, y + 5);
          doc.text('Qty', 320, y + 5, { width: 45, align: 'right' });
          doc.text('Unit', 375, y + 5);
          doc.text('Est. Cost (PHP)', 420, y + 5, { width: 65, align: 'right' });
          doc.text('Total (PHP)', 490, y + 5, { width: 60, align: 'right' });

          y += 20;
          doc.fillColor('#000000').font('Helvetica').fontSize(8);

          physicalItems.forEach((item, index) => {
            const rowQty = parseNum(item.quantity) || 1;
            const rowCost = parseNum(item.estimated_cost);
            const rowTotal = parseNum(item.total_cost) || (rowQty * rowCost);
            totalAmount += rowTotal;

            if (index % 2 === 1) {
              doc.fillColor('#F8FAFC').rect(40, y, 515, 18).fill();
              doc.fillColor('#000000');
            }

            doc.text(String(index + 1), 45, y + 4);
            doc.text(item.item_description || '', 70, y + 4, { width: 245 });
            doc.text(fmtQty(rowQty), 320, y + 4, { width: 45, align: 'right' });
            doc.text(item.unit || 'PCS', 375, y + 4);
            doc.text(fmtCurr(rowCost), 420, y + 4, { width: 65, align: 'right' });
            doc.text(fmtCurr(rowTotal), 490, y + 4, { width: 60, align: 'right' });
            y += 18;
          });
          y += 10;
        }

        if (subscriptionItems.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#4338CA').text('SUBSCRIPTIONS BREAKDOWN', 40, y);
          doc.fillColor('#000000');
          y += 15;

          doc.fillColor('#4338CA').rect(40, y, 515, 20).fill();
          doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
          doc.text('#', 45, y + 5);
          doc.text('Subscription / Service Name', 70, y + 5);
          doc.text('Cycle', 300, y + 5);
          doc.text('Seats', 360, y + 5, { width: 35, align: 'right' });
          doc.text('Rate (PHP)', 405, y + 5, { width: 70, align: 'right' });
          doc.text('Total (PHP)', 480, y + 5, { width: 70, align: 'right' });

          y += 20;
          doc.fillColor('#000000').font('Helvetica').fontSize(8);

          subscriptionItems.forEach((sub, index) => {
            const rowQty = parseNum(sub.quantity) || 1;
            const rowCost = parseNum(sub.estimated_cost);
            const rowTotal = parseNum(sub.total_cost) || (rowQty * rowCost);
            totalAmount += rowTotal;

            if (index % 2 === 1) {
              doc.fillColor('#EEF2FF').rect(40, y, 515, 18).fill();
              doc.fillColor('#000000');
            }

            doc.text(String(index + 1), 45, y + 4);
            doc.text(sub.item_description || '', 70, y + 4, { width: 225 });
            doc.text(sub.unit || 'MONTHLY', 300, y + 4, { width: 55 });
            doc.text(rowQty.toFixed(0), 360, y + 4, { width: 35, align: 'right' });
            doc.text(fmtCurr(rowCost), 405, y + 4, { width: 70, align: 'right' });
            doc.text(fmtCurr(rowTotal), 480, y + 4, { width: 70, align: 'right' });
            y += 18;
          });
          y += 10;
        }

        // Table Summary Total
        doc.moveTo(40, y).lineTo(555, y).strokeColor('#2563EB').stroke();
        y += 8;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('COMBINED GRAND TOTAL ESTIMATED COST:', 180, y, { align: 'right', width: 270 });
        doc.text(fmtCurr(totalAmount), 455, y, { align: 'right', width: 95 });

        // Signatures Block
        y += 65;
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('PREPARED BY:', 40, y);
        doc.text('REVIEWED BY:', 220, y);
        doc.text('APPROVED BY:', 400, y);

        y += 25;
        doc.moveTo(40, y).lineTo(170, y).stroke();
        doc.moveTo(220, y).lineTo(350, y).stroke();
        doc.moveTo(400, y).lineTo(530, y).stroke();

        y += 5;
        doc.font('Helvetica').fontSize(8);
        doc.text(request.prepared_by || 'Department User', 40, y);
        doc.text('Department Head / Supervisor', 220, y);
        doc.text('Executive / Managing Director', 400, y);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new PdfService();
