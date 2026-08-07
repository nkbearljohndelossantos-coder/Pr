const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const env = require('../config/env');

class PdfService {
  async generateRequestPdf(reqData, printedBy = 'System User') {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Generate QR Code Buffer
        const qrContent = `ERP-REQ|${reqData.request_number}|DEPT:${reqData.department_code}|STATUS:${reqData.status}`;
        const qrDataUrl = await QRCode.toDataURL(qrContent);

        // Header Band
        doc.fillColor('#1E293B').rect(40, 40, 515, 60).fill();
        doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text(env.COMPANY_NAME.toUpperCase(), 55, 55);
        doc.fontSize(10).font('Helvetica').text('ENTERPRISE DEPARTMENT REQUEST REQUISITION', 55, 75);
        doc.fontSize(9).text(`DOC NO: ${reqData.request_number}  |  REV: 0${reqData.revision_number || 1}`, 360, 65, { align: 'right' });

        // Request Information Metadata
        doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('REQUISITION METADATA', 40, 115);
        doc.moveTo(40, 128).lineTo(555, 128).strokeColor('#CBD5E1').stroke();

        doc.font('Helvetica-Bold').fontSize(9);
        doc.text('Request Number:', 40, 138);
        doc.text('Date Requested:', 40, 153);
        doc.text('Required Date:', 40, 168);
        doc.text('Department:', 40, 183);

        doc.font('Helvetica');
        doc.text(reqData.request_number, 140, 138);
        doc.text(new Date(reqData.created_at).toLocaleDateString(), 140, 153);
        doc.text(reqData.required_date || 'N/A', 140, 168);
        doc.text(`${reqData.department_name} (${reqData.department_code})`, 140, 183);

        doc.font('Helvetica-Bold');
        doc.text('Prepared By:', 300, 138);
        doc.text('Position:', 300, 153);
        doc.text('Priority:', 300, 168);
        doc.text('Status:', 300, 183);

        doc.font('Helvetica');
        doc.text(reqData.prepared_by, 380, 138);
        doc.text(reqData.position || 'N/A', 380, 153);
        doc.text(reqData.priority, 380, 168);
        doc.text(reqData.status.toUpperCase(), 380, 183);

        // Purpose & Justification
        doc.font('Helvetica-Bold').text('Purpose of Request:', 40, 205);
        doc.font('Helvetica').text(reqData.purpose || 'N/A', 140, 205, { width: 400 });

        doc.font('Helvetica-Bold').text('Business Justification:', 40, 230);
        doc.font('Helvetica').text(reqData.business_justification || 'N/A', 140, 230, { width: 400 });

        // Items Table Header
        let y = 265;
        doc.font('Helvetica-Bold').fontSize(10).text('REQUEST ITEMS LIST', 40, y);
        y += 15;

        doc.fillColor('#2563EB').rect(40, y, 515, 20).fill();
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
        doc.text('#', 45, y + 5);
        doc.text('Description', 70, y + 5);
        doc.text('Qty', 330, y + 5, { width: 40, align: 'right' });
        doc.text('Unit', 385, y + 5);
        doc.text('Est. Cost', 430, y + 5, { width: 55, align: 'right' });
        doc.text('Total', 495, y + 5, { width: 55, align: 'right' });

        y += 20;
        doc.fillColor('#000000').font('Helvetica').fontSize(8);

        let totalAmount = 0;
        if (reqData.items && reqData.items.length > 0) {
          reqData.items.forEach((item, index) => {
            const rowQty = Number(item.quantity) || 0;
            const rowCost = Number(item.estimated_cost) || 0;
            const rowTotal = Number(item.total_cost) || (rowQty * rowCost);
            totalAmount += rowTotal;

            if (index % 2 === 1) {
              doc.fillColor('#F8FAFC').rect(40, y, 515, 18).fill();
              doc.fillColor('#000000');
            }

            doc.text(String(index + 1), 45, y + 4);
            doc.text(item.item_description || '', 70, y + 4, { width: 250 });
            doc.text(rowQty.toFixed(2), 330, y + 4, { width: 40, align: 'right' });
            doc.text(item.unit || 'PCS', 385, y + 4);
            doc.text(`$${rowCost.toFixed(2)}`, 430, y + 4, { width: 55, align: 'right' });
            doc.text(`$${rowTotal.toFixed(2)}`, 495, y + 4, { width: 55, align: 'right' });
            y += 18;
          });
        } else {
          doc.text('No items specified.', 45, y + 5);
          y += 20;
        }

        // Table Summary Total
        doc.moveTo(40, y).lineTo(555, y).strokeColor('#2563EB').stroke();
        y += 5;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('GRAND TOTAL ESTIMATED COST:', 280, y, { align: 'right', width: 200 });
        doc.text(`$${totalAmount.toFixed(2)}`, 490, y, { align: 'right', width: 60 });

        // Signatures Block
        y += 65;
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('PREPARED BY:', 40, y);
        doc.text('DEPARTMENT HEAD:', 220, y);
        doc.text('EXECUTIVE APPROVAL:', 400, y);

        doc.moveTo(40, y + 35).lineTo(170, y + 35).stroke();
        doc.moveTo(220, y + 35).lineTo(350, y + 35).stroke();
        doc.moveTo(400, y + 35).lineTo(530, y + 35).stroke();

        doc.font('Helvetica').fontSize(8);
        doc.text(reqData.prepared_by, 40, y + 40);
        doc.text('Dept. Manager', 220, y + 40);
        doc.text('Executive Administrator', 400, y + 40);

        // QR Code Verification Box
        const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        doc.image(qrImageBuffer, 465, 710, { width: 75 });

        // Footer
        doc.fontSize(7).fillColor('#64748B');
        doc.text(`Generated by Enterprise ERP System | Printed By: ${printedBy} | Date: ${new Date().toLocaleString()}`, 40, 780);
        doc.text('Page 1 of 1', 500, 780);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new PdfService();
