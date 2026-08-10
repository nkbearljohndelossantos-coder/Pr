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
        doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text((env.COMPANY_NAME || 'NKB MANUFACTURING CORPORATION').toUpperCase(), 55, 55);
        doc.fontSize(10).font('Helvetica').text('PURCHASE REQUISITION SLIP', 55, 75);
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
        const allItems = reqData.items || [];
        const physicalItems = allItems.filter(i => i.item_type !== 'subscription');
        const subscriptionItems = allItems.filter(i => i.item_type === 'subscription');

        let totalAmount = 0;

        if (physicalItems.length > 0) {
          doc.font('Helvetica-Bold').fontSize(10).text('REQUEST ITEMS BREAKDOWN', 40, y);
          y += 15;

          doc.fillColor('#2563EB').rect(40, y, 515, 20).fill();
          doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
          doc.text('#', 45, y + 5);
          doc.text('Item Description', 70, y + 5);
          doc.text('Qty', 330, y + 5, { width: 40, align: 'right' });
          doc.text('Unit', 385, y + 5);
          doc.text('Est. Cost (PHP)', 425, y + 5, { width: 65, align: 'right' });
          doc.text('Total (PHP)', 495, y + 5, { width: 55, align: 'right' });

          y += 20;
          doc.fillColor('#000000').font('Helvetica').fontSize(8);

          physicalItems.forEach((item, index) => {
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
            doc.text(`PHP ${rowCost.toFixed(2)}`, 425, y + 4, { width: 65, align: 'right' });
            doc.text(`PHP ${rowTotal.toFixed(2)}`, 495, y + 4, { width: 55, align: 'right' });
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
          doc.text('Cycle', 310, y + 5);
          doc.text('Seats', 370, y + 5, { width: 35, align: 'right' });
          doc.text('Rate (PHP)', 415, y + 5, { width: 65, align: 'right' });
          doc.text('Total (PHP)', 485, y + 5, { width: 65, align: 'right' });

          y += 20;
          doc.fillColor('#000000').font('Helvetica').fontSize(8);

          subscriptionItems.forEach((sub, index) => {
            const rowQty = Number(sub.quantity) || 0;
            const rowCost = Number(sub.estimated_cost) || 0;
            const rowTotal = Number(sub.total_cost) || (rowQty * rowCost);
            totalAmount += rowTotal;

            if (index % 2 === 1) {
              doc.fillColor('#EEF2FF').rect(40, y, 515, 18).fill();
              doc.fillColor('#000000');
            }

            doc.text(String(index + 1), 45, y + 4);
            doc.text(sub.item_description || '', 70, y + 4, { width: 235 });
            doc.text(sub.unit || 'MONTHLY', 310, y + 4, { width: 55 });
            doc.text(rowQty.toFixed(0), 370, y + 4, { width: 35, align: 'right' });
            doc.text(`PHP ${rowCost.toFixed(2)}`, 415, y + 4, { width: 65, align: 'right' });
            doc.text(`PHP ${rowTotal.toFixed(2)}`, 485, y + 4, { width: 65, align: 'right' });
            y += 18;
          });
          y += 10;
        }

        // Table Summary Total
        doc.moveTo(40, y).lineTo(555, y).strokeColor('#2563EB').stroke();
        y += 8;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('COMBINED GRAND TOTAL ESTIMATED COST:', 200, y, { align: 'right', width: 270 });
        doc.text(`PHP ${totalAmount.toFixed(2)}`, 475, y, { align: 'right', width: 75 });

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
