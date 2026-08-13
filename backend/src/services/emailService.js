const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.customApproverEmail = null;
    this.customSmtpFrom = null;
    this.initTransporter();
  }

  initTransporter() {
    const smtpHost = process.env.SMTP_HOST || env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER || env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS || env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        logger.info(`SMTP Mail Transporter Initialized for Host: ${smtpHost}:${smtpPort}`);
      } catch (err) {
        logger.warn('SMTP Mail Transporter failed to initialize:', err.message);
      }
    } else {
      logger.info('SMTP Mail Credentials not configured. Notification emails will be logged locally.');
    }
  }

  updateConfig(settings = {}) {
    if (settings.approver_email) this.customApproverEmail = settings.approver_email;
    if (settings.smtp_from) this.customSmtpFrom = settings.smtp_from;

    const host = settings.smtp_host || process.env.SMTP_HOST || env.SMTP_HOST;
    const port = Number(settings.smtp_port || process.env.SMTP_PORT || env.SMTP_PORT || 587);
    const user = settings.smtp_user || process.env.SMTP_USER || env.SMTP_USER;
    const pass = settings.smtp_pass || process.env.SMTP_PASS || env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });
        logger.info(`SMTP Mail Transporter Updated for Host: ${host}:${port}`);
      } catch (err) {
        logger.warn('Failed to update SMTP transporter:', err.message);
      }
    }
  }

  async sendTestEmail(targetEmail) {
    const toEmail = targetEmail || this.customApproverEmail || process.env.APPROVER_EMAIL || env.APPROVER_EMAIL || 'boss@company.com';
    const subject = '🧪 [TEST] NKB ERP Purchase Requisition Email Notification Test';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1; max-width: 550px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 16px; border-radius: 8px; text-align: center; color: white; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">✅ System Test Email Successful!</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">NKB Manufacturing Purchase Requisition System</p>
        </div>
        <p style="font-size: 14px; color: #334155;">This is a test notification email sent directly from the <strong>System Admin Email Settings</strong> page.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; font-size: 13px;">Target Approver Email:</td>
            <td style="padding: 10px; font-weight: bold; color: #0f172a; font-size: 13px;">${toEmail}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; font-size: 13px;">System Date & Time:</td>
            <td style="padding: 10px; font-weight: bold; color: #0f172a; font-size: 13px;">${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</td>
          </tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          Your email notification system is properly configured and ready to send executive approval alerts.
        </p>
      </div>
    `;

    if (this.transporter) {
      try {
        const fromEmail = this.customSmtpFrom || process.env.SMTP_FROM || env.SMTP_FROM || `"NKB ERP System" <${process.env.SMTP_USER || 'notifications@nkbmanufacturing.com'}>`;
        const info = await this.transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject,
          html: htmlContent
        });
        return { success: true, messageId: info.messageId, recipient: toEmail };
      } catch (err) {
        return { success: false, error: err.message, recipient: toEmail };
      }
    } else {
      logger.info(`[SIMULATED TEST EMAIL] To: ${toEmail} | Subject: ${subject}`);
      return { success: true, simulated: true, recipient: toEmail, message: 'SMTP credentials not provided. Email simulated successfully.' };
    }
  }

  /**
   * Send Executive Approval Notification Email when a new request is submitted
   */
  async sendApprovalNotification(requestData) {
    const approverEmail = this.customApproverEmail || process.env.APPROVER_EMAIL || env.APPROVER_EMAIL || 'boss@company.com';
    const siteUrl = process.env.SITE_URL || 'https://pr.nkbmanufacturing.com';
    const requestUrl = `${siteUrl}/requests/${requestData.id}`;

    const formattedCost = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(requestData.total_estimated_cost || 0);

    const itemsRowsHtml = (requestData.items || []).map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 13px; color: #1e293b;">${idx + 1}. ${item.item_description}</td>
        <td style="padding: 10px; font-size: 13px; color: #475569; text-align: center;">${item.quantity} ${item.unit || ''}</td>
        <td style="padding: 10px; font-size: 13px; color: #1e293b; text-align: right; font-weight: bold;">₱${Number(item.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const subject = `[ACTION REQUIRED] Purchase Requisition #${requestData.request_number} Needs Your Approval (${formattedCost})`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #38bdf8; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
          .content { padding: 24px; color: #334155; }
          .alert-badge { display: inline-block; background: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 11px; font-weight: bold; padding: 4px 10px; margin-bottom: 16px; border-radius: 20px; }
          .details-table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
          .details-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
          .details-table td.label { font-weight: 600; color: #64748b; width: 35%; }
          .details-table td.value { font-weight: 700; color: #0f172a; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .items-table th { background: #f1f5f9; padding: 8px 10px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: left; }
          .btn-container { text-align: center; margin: 28px 0 16px 0; }
          .btn { background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>NKB Manufacturing</h1>
            <p>Enterprise Purchase Requisition & Approval System</p>
          </div>
          
          <div class="content">
            <div class="alert-badge">🔔 ACTION REQUIRED • APPROVAL PENDING</div>
            
            <h2 style="margin: 0 0 8px 0; font-size: 16px; color: #0f172a;">New Requisition Submitted for Approval</h2>
            <p style="font-size: 13px; line-height: 1.5; color: #475569; margin-top: 0;">
              A new purchase requisition request has been created and requires your review and approval. You can review the details below and approve or reject it directly from the link below:
            </p>

            <table class="details-table">
              <tr>
                <td class="label">Request Number:</td>
                <td class="value">${requestData.request_number}</td>
              </tr>
              <tr>
                <td class="label">Department:</td>
                <td class="value">${requestData.department_name || 'Department'}</td>
              </tr>
              <tr>
                <td class="label">Prepared By:</td>
                <td class="value">${requestData.prepared_by || 'Staff'} (${requestData.position || 'Specialist'})</td>
              </tr>
              <tr>
                <td class="label">Required Date:</td>
                <td class="value">${requestData.required_date || 'N/A'}</td>
              </tr>
              <tr>
                <td class="label">Priority:</td>
                <td class="value" style="color: ${requestData.priority === 'Urgent' ? '#dc2626' : '#2563eb'};">${requestData.priority || 'Normal'}</td>
              </tr>
              <tr>
                <td class="label">Purpose:</td>
                <td class="value" style="font-weight: normal; color: #334155;">${requestData.purpose || 'N/A'}</td>
              </tr>
              <tr>
                <td class="label">Total Amount:</td>
                <td class="value" style="font-size: 16px; color: #059669;">${formattedCost}</td>
              </tr>
            </table>

            <h3 style="font-size: 13px; text-transform: uppercase; color: #475569; margin: 20px 0 8px 0;">Item & Subscription Summary</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Total (₱)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <div class="btn-container">
              <a href="${requestUrl}" class="btn" target="_blank">View & Approve Request #${requestData.request_number}</a>
            </div>

            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 16px;">
              You received this notification because you are designated as the Executive Approver for Purchase Requisitions.
            </p>
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} NKB Manufacturing. Enterprise Purchase Requisition System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    if (this.transporter) {
      try {
        const fromEmail = this.customSmtpFrom || process.env.SMTP_FROM || env.SMTP_FROM || `"NKB ERP System" <${process.env.SMTP_USER || 'notifications@nkbmanufacturing.com'}>`;
        const mailOptions = {
          from: fromEmail,
          to: approverEmail,
          subject,
          html: htmlContent
        };
        const info = await this.transporter.sendMail(mailOptions);
        logger.info(`Approval Notification Email sent to ${approverEmail} for Request ${requestData.request_number}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        logger.error(`Failed to send email to ${approverEmail}: ${err.message}`);
        return { success: false, error: err.message };
      }
    } else {
      logger.info(`[SIMULATED EMAIL NOTIFICATION] To: ${approverEmail} | Subject: ${subject}`);
      logger.info(`[SIMULATED EMAIL CONTENT] Direct Approval Link: ${requestUrl}`);
      return { success: true, simulated: true };
    }
  }
}

module.exports = new EmailService();
