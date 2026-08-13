const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.customApproverEmail = null;
    this.customSmtpFrom = null;
    this.currentPass = null;
    this.initTransporter();
  }

  async initTransporter() {
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
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false }
        });
        logger.info(`SMTP Mail Transporter Initialized for Host: ${smtpHost}:${smtpPort}`);
      } catch (err) {
        logger.warn('SMTP Mail Transporter failed to initialize:', err.message);
      }
    }

    setTimeout(() => {
      this.loadSavedSettings().catch(() => {});
    }, 1000);
  }

  async loadSavedSettings() {
    try {
      const settingsService = require('./settingsService');
      const rawSettings = await settingsService.getRawSettings();
      if (rawSettings) {
        this.updateConfig(rawSettings);
      }
    } catch (err) {
      logger.warn('Could not load saved SMTP settings from DB:', err.message);
    }
  }

  updateConfig(settings = {}) {
    if (settings.approver_email) this.customApproverEmail = settings.approver_email;
    if (settings.smtp_from) this.customSmtpFrom = settings.smtp_from;

    const host = settings.smtp_host || process.env.SMTP_HOST || env.SMTP_HOST;
    const port = Number(settings.smtp_port || process.env.SMTP_PORT || env.SMTP_PORT || 587);
    const user = settings.smtp_user || process.env.SMTP_USER || env.SMTP_USER;

    if (settings.smtp_pass && settings.smtp_pass !== '********') {
      this.currentPass = settings.smtp_pass;
    }
    const pass = this.currentPass || process.env.SMTP_PASS || env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });
        logger.info(`SMTP Mail Transporter Updated for Host: ${host}:${port} (User: ${user})`);
      } catch (err) {
        logger.warn('Failed to update SMTP transporter:', err.message);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
      logger.info('SMTP Mail Credentials missing. Notifications will run in simulated mode.');
    }
  }

  async sendTestEmail(targetEmail) {
    await this.loadSavedSettings();

    const toEmail = targetEmail || this.customApproverEmail || process.env.APPROVER_EMAIL || env.APPROVER_EMAIL || 'boss@company.com';
    const subject = '🧪 [TEST] NKB ERP Purchase Requisition Email Notification Test';

    if (!this.transporter) {
      return {
        success: false,
        simulated: true,
        recipient: toEmail,
        error: 'SMTP credentials (Host, User, Password) are missing or incomplete in System Settings.'
      };
    }

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

    try {
      const fromEmail = this.customSmtpFrom || process.env.SMTP_FROM || env.SMTP_FROM || `"NKB ERP System" <${process.env.SMTP_USER || 'notifications@nkbmanufacturing.com'}>`;
      const info = await this.transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject,
        html: htmlContent
      });

      logger.info(`Test Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        recipient: toEmail
      };
    } catch (err) {
      logger.error(`SMTP Test Email Error to ${toEmail}: ${err.message}`);
      let userFriendlyError = err.message;
      if (err.message.includes('535') || err.message.includes('Username and Password not accepted') || err.message.includes('Invalid login')) {
        userFriendlyError = 'Gmail Authentication Failed (535 Error). Please verify your 16-character Gmail App Password.';
      } else if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
        userFriendlyError = `Connection timeout to mail server. Please verify SMTP Host and Port (587 or 465).`;
      }

      return {
        success: false,
        error: userFriendlyError,
        rawError: err.message,
        recipient: toEmail
      };
    }
  }

  /**
   * Send Executive Approval Notification Email when a new request is submitted
   */
  async sendApprovalNotification(requestData) {
    await this.loadSavedSettings();

    const approverEmail = this.customApproverEmail || process.env.APPROVER_EMAIL || env.APPROVER_EMAIL || 'boss@company.com';
    const siteUrl = process.env.SITE_URL || 'https://pr.nkbmanufacturing.com';
    
    const approveUrl = `${siteUrl}/requests/${requestData.id}?action=approve`;
    const declineUrl = `${siteUrl}/requests/${requestData.id}?action=decline`;

    const formattedCost = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(requestData.total_estimated_cost || 0);

    const positionTitle = requestData.position || requestData.purpose || 'Specialist Role';
    const deptName = requestData.department_name || 'Department';
    const preparedBy = requestData.prepared_by || 'Department Staff';
    const position = requestData.position || 'Staff Specialist';
    const requiredDate = requestData.required_date || 'ASAP';
    const location = 'Main Factory / Corporate Headquarters';
    const reportsTo = 'Department Manager / Executive Approver';
    const justification = requestData.business_justification || requestData.purpose || 'Necessary to support our ongoing projects and maintain operational productivity.';
    const reqNumber = requestData.request_number;

    const itemsListHtml = (requestData.items || []).map((item, idx) => `
      <li style="margin-bottom: 8px; font-size: 13px; color: #1e293b;">
        <strong>${idx + 1}. ${item.item_description}</strong> — Qty: ${item.quantity} ${item.unit || ''} (₱${Number(item.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})
        ${item.remarks ? `<br><span style="font-size: 12px; color: #64748b;">Remarks: ${item.remarks}</span>` : ''}
      </li>
    `).join('');

    const subject = `Requisition Approval Request for ${positionTitle} (${reqNumber})`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
          .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #38bdf8; }
          .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
          .content { padding: 28px; color: #334155; line-height: 1.6; font-size: 14px; }
          .badge { display: inline-block; background: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 11px; font-weight: bold; padding: 4px 12px; margin-bottom: 18px; border-radius: 20px; text-transform: uppercase; }
          .overview-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .overview-table { width: 100%; border-collapse: collapse; }
          .overview-table td { padding: 6px 8px; font-size: 13px; }
          .overview-table td.label { font-weight: 600; color: #64748b; width: 30%; }
          .overview-table td.val { font-weight: 700; color: #0f172a; }
          .action-buttons { text-align: center; margin: 32px 0 24px 0; padding: 20px 0; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; }
          .btn-approve { background-color: #16a34a; color: #ffffff !important; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 12px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.25); }
          .btn-decline { background-color: #dc2626; color: #ffffff !important; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25); }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>NKB Manufacturing</h1>
            <p>Enterprise Purchase Requisition System</p>
          </div>

          <div class="content">
            <div class="badge">🔔 Action Required • Pending Executive Approval</div>

            <p style="margin-top: 0;">Hi Executive Approver,</p>

            <p>
              I hope this message finds you well. I am writing to request approval for a new requisition for the <strong>${positionTitle}</strong> role / request within our <strong>${deptName}</strong>.
            </p>

            <div class="overview-box">
              <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px;">Role & Requisition Overview:</h4>
              <table class="overview-table">
                <tr>
                  <td class="label">Requisition No:</td>
                  <td class="val" style="color: #2563eb;">${reqNumber}</td>
                </tr>
                <tr>
                  <td class="label">Position:</td>
                  <td class="val">${positionTitle}</td>
                </tr>
                <tr>
                  <td class="label">Department:</td>
                  <td class="val">${deptName}</td>
                </tr>
                <tr>
                  <td class="label">Location:</td>
                  <td class="val">${location}</td>
                </tr>
                <tr>
                  <td class="label">Reports to:</td>
                  <td class="val">${reportsTo}</td>
                </tr>
                <tr>
                  <td class="label">Total Amount:</td>
                  <td class="val" style="color: #059669; font-size: 15px;">${formattedCost}</td>
                </tr>
              </table>
            </div>

            <h4 style="margin: 20px 0 8px 0; font-size: 14px; color: #0f172a;">Justification:</h4>
            <p style="margin-top: 0; color: #475569;">
              The <strong>${positionTitle}</strong> requisition is necessary to support our ongoing projects and initiatives. This role / request will include:
            </p>
            <ul style="padding-left: 20px; margin: 10px 0;">
              ${itemsListHtml || '<li style="font-size: 13px;">Requisition fulfillment</li>'}
            </ul>

            <h4 style="margin: 20px 0 8px 0; font-size: 14px; color: #0f172a;">Impact:</h4>
            <p style="margin-top: 0; color: #475569;">
              Filling this role / request will help us:
            </p>
            <ul style="padding-left: 20px; margin: 10px 0; font-size: 13px; color: #334155;">
              <li>${justification}</li>
              <li>Maintain high department productivity and meet project deadlines.</li>
              <li>Support operational growth and team capacity across projects.</li>
            </ul>

            <h4 style="margin: 20px 0 8px 0; font-size: 14px; color: #0f172a;">Urgency:</h4>
            <p style="margin-top: 0; color: #475569;">
              Given our current timeline and workload, we aim to have this position / request filled by <strong>${requiredDate}</strong>. This aligns with our hiring and procurement plan to meet project deadlines and maintain team productivity.
            </p>

            <p style="margin-top: 24px;">
              I am happy to discuss this further if you have any questions or need additional details.
            </p>

            <p style="margin-bottom: 24px;">Thank you for considering this request.</p>

            <!-- INTERACTIVE APPROVE OR DECLINE BUTTONS -->
            <div class="action-buttons">
              <a href="${approveUrl}" class="btn-approve" target="_blank">
                ✅ Approve Requisition
              </a>
              <a href="${declineUrl}" class="btn-decline" target="_blank">
                ❌ Decline Requisition
              </a>
            </div>

            <p style="margin-top: 24px; font-size: 13px;">
              Best regards,<br><br>
              <strong>${preparedBy}</strong><br>
              <span style="color: #64748b;">${position}</span><br>
              <span style="color: #64748b; font-size: 12px;">${deptName}</span>
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
      logger.info(`[SIMULATED EMAIL CONTENT] Direct Approve Link: ${approveUrl} | Direct Decline Link: ${declineUrl}`);
      return { success: true, simulated: true };
    }
  }
}

module.exports = new EmailService();
