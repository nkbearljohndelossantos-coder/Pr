const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const env = require('../config/env');

class PdfService {
  async generateRequestPdf(requestData, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${requestData.request_number}.pdf"`);

    doc.pipe(res);

    // Header Branding Box
    doc.rect(40, 40, 515, 50).fill('#0F172A');
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('ENTERPRISE GLOBAL INDUSTRIES INC.', 55, 52);
    doc.fontSize(9).font('Helvetica').fillColor('#94A3B8').text('PURCHASE REQUISITION & DISBURSEMENT CONTROL FORM', 55, 72);

    // Status Badge
    doc.rect(430, 48, 110, 32).fillAndStroke('#1E293B', '#3B82F6');
    doc.fillColor('#60A5FA').fontSize(11).font('Helvetica-Bold').text(requestData.status.toUpperCase(), 430, 58, { width: 110, align: 'center' });

    doc.moveDown(2);

    // Metadata Table Box
    const startY = 105;
    doc.rect(40, startY, 515, 75).fillAndStroke('#F8FAFC', '#CBD5E1');

    doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold');
    doc.text('Requisition No:', 50, startY + 10);
    doc.font('Helvetica').fillColor('#0F172A').text(requestData.request_number, 130, startY + 10);

    doc.font('Helvetica-Bold').fillColor('#475569').text('Department:', 50, startY + 28);
    doc.font('Helvetica').fillColor('#0F172A').text(`${requestData.department_name} (${requestData.department_code})`, 130, startY + 28);

    doc.font('Helvetica-Bold').fillColor('#475569').text('Prepared By:', 50, startY + 46);
    doc.font('Helvetica').fillColor('#0F172A').text(`${requestData.prepared_by} (${requestData.position || 'Staff'})`, 130, startY + 46);

    doc.font('Helvetica-Bold').fillColor('#475569').text('Date Submitted:', 320, startY + 10);
    doc.font('Helvetica').fillColor('#0F172A').text(new Date(requestData.created_at || Date.now()).toLocaleDateString(), 420, startY + 10);

    doc.font('Helvetica-Bold').fillColor('#475569').text('Required Date:', 320, startY + 28);
    doc.font('Helvetica').fillColor('#0F172A').text(new Date(requestData.required_date || Date.now()).toLocaleDateString(), 420, startY + 28);

    doc.font('Helvetica-Bold').fillColor('#475569').text('Priority Level:', 320, startY + 46);
    doc.font('Helvetica-Bold').fillColor(requestData.priority === 'Urgent' ? '#DC2626' : '#2563EB').text(requestData.priority, 420, startY + 46);

    // Purpose Box (Dynamic Height for Full Text Preservance)
    const purposeY = startY + 85;
    const purposeText = (requestData.purpose || '').trim() || 'N/A';
    const hasJustification = Boolean(requestData.business_justification && requestData.business_justification.trim());
    const justificationText = hasJustification ? `\n\nBUSINESS JUSTIFICATION:\n${requestData.business_justification.trim()}` : '';
    const fullPurposeContent = `${purposeText}${justificationText}`;
    
    const boxTitle = hasJustification 
      ? 'PURPOSE OF REQUISITION & BUSINESS JUSTIFICATION:' 
      : 'PURPOSE OF REQUISITION:';

    doc.fontSize(8).font('Helvetica');
    const textHeight = doc.heightOfString(fullPurposeContent, { width: 500 });
    const boxHeight = Math.max(textHeight + 24, 40);

    doc.rect(40, purposeY, 515, boxHeight).fillAndStroke('#FFFFFF', '#CBD5E1');
    doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text(boxTitle, 48, purposeY + 6);
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica').text(fullPurposeContent, 48, purposeY + 18, { width: 500 });

    // Items Table Header
    const tableTop = purposeY + boxHeight + 15;
    doc.rect(40, tableTop, 515, 22).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
      .text('ITEM DESCRIPTION', 50, tableTop + 6, { width: 220 })
      .text('QTY', 270, tableTop + 6, { width: 40, align: 'center' })
      .text('UNIT', 315, tableTop + 6, { width: 45, align: 'center' })
      .text('EST. COST (PHP)', 365, tableTop + 6, { width: 85, align: 'right' })
      .text('TOTAL COST (PHP)', 455, tableTop + 6, { width: 90, align: 'right' });

    let currentY = tableTop + 22;
    let grandTotal = 0;

    (requestData.items || []).forEach((item, index) => {
      const bg = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      doc.rect(40, currentY, 515, 20).fillAndStroke(bg, '#F1F5F9');

      const itemCost = Number(item.estimated_cost || 0);
      const total = Number(item.quantity || 0) * itemCost;
      grandTotal += total;

      doc.fillColor('#0F172A').fontSize(8).font('Helvetica')
        .text(item.item_description, 50, currentY + 5, { width: 220 })
        .text(String(item.quantity), 270, currentY + 5, { width: 40, align: 'center' })
        .text(item.unit || 'PCS', 315, currentY + 5, { width: 45, align: 'center' })
        .text(`PHP ${itemCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 365, currentY + 5, { width: 85, align: 'right' })
        .text(`PHP ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 455, currentY + 5, { width: 90, align: 'right' });

      currentY += 20;
    });

    // Grand Total Row
    doc.rect(40, currentY, 515, 24).fill('#E2E8F0');
    doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold')
      .text('GRAND TOTAL ESTIMATED COST (PHP):', 50, currentY + 7, { width: 400, align: 'right' })
      .text(`PHP ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 455, currentY + 7, { width: 90, align: 'right' });

    // Official Approval Signature Blocks
    const sigY = Math.max(currentY + 60, 680);
    doc.strokeColor('#CBD5E1').lineWidth(0.5);

    // Signature Column 1
    doc.lineCap('butt').moveTo(40, sigY).lineTo(150, sigY).stroke();
    doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text('Prepared By:', 40, sigY + 5);
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica').text(requestData.prepared_by, 40, sigY + 16);

    // Signature Column 2
    doc.moveTo(175, sigY).lineTo(285, sigY).stroke();
    doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text('Department Head Review:', 175, sigY + 5);
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica').text(`${requestData.department_code} Head`, 175, sigY + 16);

    // Signature Column 3
    doc.moveTo(310, sigY).lineTo(420, sigY).stroke();
    doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text('Executive Approval:', 310, sigY + 5);
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica').text('Executive Director', 310, sigY + 16);

    // Signature Column 4
    doc.moveTo(445, sigY).lineTo(555, sigY).stroke();
    doc.fillColor('#475569').fontSize(8).font('Helvetica-Bold').text('President / CEO Sign-off:', 445, sigY + 5);
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica').text('President & CEO', 445, sigY + 16);

    // QR Code Document Verification
    try {
      const qrDataUrl = await QRCode.toDataURL(`ERP-VERIFY:${requestData.request_number}:${grandTotal}`);
      doc.image(qrDataUrl, 40, Math.min(sigY + 30, 735), { width: 50 });
      doc.fontSize(7).fillColor('#64748B').font('Helvetica').text('Scan QR Code to verify document authenticity on Google Cloud Enterprise Ledger.', 98, Math.min(sigY + 50, 755));
    } catch (e) {
      // Fallback
    }

    doc.end();
  }
}

module.exports = new PdfService();
