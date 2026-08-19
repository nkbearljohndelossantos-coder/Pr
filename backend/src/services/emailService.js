const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
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

    this.currentHost = host;
    this.currentPort = port;
    this.currentAuthUser = user;

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

  getLogoPath() {
    const candidates = [
      path.join(__dirname, '../public/nkb-logo.png'),
      path.join(process.cwd(), 'nkb-logo.png'),
      path.join(process.cwd(), 'public/nkb-logo.png'),
      path.join(process.cwd(), 'backend/public/nkb-logo.png'),
      path.join(__dirname, '../../public/nkb-logo.png')
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  getFromAddress() {
    const authUser = this.currentAuthUser || process.env.SMTP_USER || env.SMTP_USER;
    let fromEmail = this.customSmtpFrom;
    if (!fromEmail || (authUser && !fromEmail.includes(authUser))) {
      fromEmail = `"NKB Manufacturing Requisition System" <${authUser || 'notifications@nkbmanufacturing.com'}>`;
    }
    return fromEmail;
  }

  parseRecipients(raw) {
    if (!raw) return ['boss@company.com'];
    if (Array.isArray(raw)) {
      return raw.map(e => String(e).trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }
    const items = String(raw).split(/[\s,;]+/).map(e => e.trim()).filter(Boolean);
    const valid = items.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    return valid.length > 0 ? valid : [String(raw).trim()];
  }

  async sendWithFallback(mailOptions) {
    if (!this.transporter) {
      throw new Error('SMTP credentials (Host, User, Password) are not configured. Please fill in the SMTP form fields and save settings.');
    }

    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (primaryErr) {
      const host = this.currentHost || process.env.SMTP_HOST || env.SMTP_HOST;
      const user = this.currentAuthUser || process.env.SMTP_USER || env.SMTP_USER;
      const pass = this.currentPass || process.env.SMTP_PASS || env.SMTP_PASS;
      const primaryPort = this.currentPort || 587;
      const altPort = primaryPort === 465 ? 587 : 465;

      if (host && user && pass && (primaryErr.code === 'ETIMEDOUT' || primaryErr.code === 'ECONNREFUSED' || (primaryErr.message && primaryErr.message.toLowerCase().includes('timeout')))) {
        try {
          const fallbackTransporter = nodemailer.createTransport({
            host,
            port: altPort,
            secure: altPort === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
          });
          const info = await fallbackTransporter.sendMail(mailOptions);
          this.transporter = fallbackTransporter;
          this.currentPort = altPort;
          return info;
        } catch (altErr) {
          throw primaryErr;
        }
      }
      throw primaryErr;
    }
  }

  async sendTestEmail(targetEmail) {
    await this.loadSavedSettings();

    const rawTarget = targetEmail || this.customApproverEmail || process.env.APPROVER_EMAIL || env.APPROVER_EMAIL || 'boss@company.com';
    const toRecipients = this.parseRecipients(rawTarget);
    const siteUrl = process.env.SITE_URL || 'https://pr.nkbmanufacturing.com';
    const subject = '🧪 [TEST] NKB ERP Purchase Requisition Email Notification Test';

    if (!this.transporter) {
      return {
        success: false,
        simulated: true,
        recipient: toRecipients.join(', '),
        error: 'SMTP credentials (Host, User, Password) are not configured. Please fill in the SMTP form fields and save settings.'
      };
    }

    const logoPath = this.getLogoPath();
    const testMailAttachments = [];
    if (logoPath) {
      testMailAttachments.push({
        filename: 'nkb-logo.png',
        path: logoPath,
        cid: 'nkblogo'
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1; max-width: 580px; margin: 0 auto;">
        <div style="background: #0f172a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; border-bottom: 3px solid #d97706;">
          <img src="${logoPath ? 'cid:nkblogo' : `${siteUrl}/nkb-logo.png`}" alt="NKB Manufacturing Corp." style="max-width: 250px; width: 100%; height: auto; display: block; margin: 0 auto 8px auto;" />
          <p style="margin: 0; font-size: 11px; font-weight: bold; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px;">System Test Email Notification</p>
        </div>
        <p style="font-size: 14px; color: #334155;">This is a test notification email sent directly from the <strong>System Admin Email Settings</strong> page.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; font-size: 13px;">Target Approver Email:</td>
            <td style="padding: 10px; font-weight: bold; color: #0f172a; font-size: 13px;">${toRecipients.join(', ')}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; font-size: 13px;">System Date & Time:</td>
            <td style="padding: 10px; font-weight: bold; color: #0f172a; font-size: 13px;">${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</td>
          </tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
          Your email notification system is properly configured and ready to send executive approval alerts with NKB logo branding.
        </p>
      </div>
    `;

    try {
      const fromEmail = this.getFromAddress();
      const info = await this.sendWithFallback({
        from: fromEmail,
        to: toRecipients,
        subject,
        html: htmlContent,
        attachments: testMailAttachments
      });

      logger.info(`Test Email sent successfully to ${toRecipients.join(', ')}. Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        recipient: toRecipients.join(', ')
      };
    } catch (err) {
      logger.error(`SMTP Test Email Error to ${toRecipients.join(', ')}: ${err.message}`);
      let userFriendlyError = err.message;
      if (err.message.includes('535') || err.message.includes('Username and Password not accepted') || err.message.includes('Invalid login') || err.message.includes('5.7.8')) {
        userFriendlyError = 'Authentication Failed (535 Error): Email or Password is not accepted by the mail server. Please double-check your email password.';
      } else if (err.message.includes('ETIMEDOUT') || err.message.includes('ECONNREFUSED')) {
        userFriendlyError = `Connection timeout to mail server. Please verify SMTP Host and Port (587 or 465).`;
      }

      return {
        success: false,
        error: userFriendlyError,
        rawError: err.message,
        recipient: toRecipients.join(', ')
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
    const viewUrl = `${siteUrl}/requests/${requestData.id}`;

    const formattedCost = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(requestData.total_estimated_cost || 0);

    const positionTitle = requestData.position || 'Department Specialist';
    const departmentName = requestData.department_name || 'Department';
    const preparedBy = requestData.prepared_by || 'Staff Member';
    const location = requestData.location || 'NKB Main Plant / Site';
    const managerName = requestData.manager_name || 'Department Head';
    const purpose = requestData.purpose || 'For Operational Use & Department Requirements';
    const businessJustification = requestData.business_justification || requestData.purpose || 'Required for ongoing projects and operational productivity.';
    const requiredDate = requestData.required_date || new Date().toISOString().split('T')[0];

    // Build physical file attachments for Nodemailer
    const mailAttachments = [];

    // 1. Embed NKB Logo via CID in approval email header
    const logoPath = this.getLogoPath();
    if (logoPath) {
      mailAttachments.push({
        filename: 'nkb-logo.png',
        path: logoPath,
        cid: 'nkblogo'
      });
    }

    // 2. Physical File Attachments (uploaded quotations, pdfs, images)
    if (requestData.attachments && Array.isArray(requestData.attachments)) {
      for (const att of requestData.attachments) {
        let targetPath = att.file_path || att.path;
        if (!targetPath || !fs.existsSync(targetPath)) {
          const candidate = path.join(env.UPLOAD_DIR, att.filename || att.original_name);
          if (fs.existsSync(candidate)) {
            targetPath = candidate;
          }
        }

        if (targetPath && fs.existsSync(targetPath)) {
          mailAttachments.push({
            filename: att.original_name || att.filename || path.basename(targetPath),
            path: targetPath
          });
        }
      }
    }

    const physicalItems = (requestData.items || []).filter(i => i.item_type !== 'subscription');
    const subscriptionItems = (requestData.items || []).filter(i => i.item_type === 'subscription');

    const physItemsRowsHtml = physicalItems.map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 13px; color: #1e293b;">${idx + 1}. ${item.item_description}</td>
        <td style="padding: 10px; font-size: 13px; color: #475569; text-align: center;">${item.quantity} ${item.unit || 'PCS'}</td>
        <td style="padding: 10px; font-size: 13px; color: #1e293b; text-align: right; font-weight: bold;">₱${Number(item.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const subItemsRowsHtml = subscriptionItems.map((item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 13px; color: #1e293b;">${idx + 1}. <strong>${item.item_description}</strong></td>
        <td style="padding: 10px; font-size: 13px; color: #4f46e5; font-weight: bold; text-align: center;">${item.unit || 'MONTHLY'}</td>
        <td style="padding: 10px; font-size: 13px; color: #475569; text-align: center;">${item.quantity} Seats / Qty</td>
        <td style="padding: 10px; font-size: 13px; color: #1e293b; text-align: right; font-weight: bold;">₱${Number(item.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const userUploadedCount = mailAttachments.filter(a => a.cid !== 'nkblogo').length;
    const attachmentsListHtml = userUploadedCount > 0
      ? `
        <div class="section-title">Attached Files & Supporting Documents (${userUploadedCount}):</div>
        <ul style="margin: 8px 0; padding-left: 20px; font-size: 13px; color: #1e293b; background: #f8fafc; padding: 12px 12px 12px 28px; border-radius: 6px; border: 1px solid #e2e8f0;">
          ${mailAttachments.filter(a => a.cid !== 'nkblogo').map(a => `
            <li style="margin-bottom: 4px;">
              📎 <strong>${a.filename}</strong> <span style="color: #64748b; font-size: 11px;">(Attached to this email)</span>
            </li>
          `).join('')}
        </ul>
      `
      : '';

    const subject = `Requisition Approval Request for ${positionTitle} - #${requestData.request_number}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #334155; }
          .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
          .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; border-bottom: 4px solid #d97706; }
          .header img { max-width: 280px; width: 100%; height: auto; display: block; margin: 0 auto; }
          .header p { margin: 8px 0 0 0; font-size: 11px; font-weight: bold; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; }
          .content { padding: 28px; line-height: 1.6; font-size: 14px; color: #334155; }
          .section-title { font-weight: 700; font-size: 14px; color: #0f172a; margin-top: 20px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
          .overview-table { width: 100%; border-collapse: collapse; margin: 12px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
          .overview-table td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
          .overview-table td.label { font-weight: 600; color: #64748b; width: 30%; }
          .overview-table td.value { font-weight: 700; color: #0f172a; }
          .items-table { width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #e2e8f0; }
          .items-table th { background: #f1f5f9; padding: 8px 10px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; text-align: left; }
          .btn-container { text-align: center; margin: 28px 0 16px 0; padding-top: 20px; border-top: 2px dashed #cbd5e1; }
          .btn-approve { background-color: #059669; color: #ffffff !important; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 8px rgba(5,150,105,0.25); margin: 6px; }
          .btn-decline { background-color: #dc2626; color: #ffffff !important; padding: 14px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 8px rgba(220,38,38,0.25); margin: 6px; }
          .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <img src="${logoPath ? 'cid:nkblogo' : `${siteUrl}/nkb-logo.png`}" alt="NKB Manufacturing Corp." />
            <p>Enterprise Requisition System</p>
          </div>
          
          <div class="content">
            <p style="margin-top: 0;">Hi Executive Approver,</p>

            <p>
              I hope this message finds you well. I am writing to request approval for a new requisition for the <strong>${positionTitle}</strong> role within our <strong>${departmentName}</strong>.
            </p>

            <div class="section-title">Role Overview:</div>
            <table class="overview-table">
              <tr>
                <td class="label">Position:</td>
                <td class="value">${positionTitle}</td>
              </tr>
              <tr>
                <td class="label">Department:</td>
                <td class="value">${departmentName}</td>
              </tr>
              <tr>
                <td class="label">Location:</td>
                <td class="value">${location}</td>
              </tr>
              <tr>
                <td class="label">Reports to:</td>
                <td class="value">${managerName}</td>
              </tr>
              <tr>
                <td class="label">Total Amount:</td>
                <td class="value" style="color: #059669; font-size: 15px;">${formattedCost}</td>
              </tr>
            </table>

            <div class="section-title">Business Justification:</div>
            <p style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 8px 0; font-size: 13px;">
              ${businessJustification}
            </p>

            <div class="section-title">Purpose of Request:</div>
            <p style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #0f172a; margin: 8px 0; font-size: 13px;">
              ${purpose}
            </p>

            ${physicalItems.length > 0 ? `
              <div class="section-title">Physical Requisition Items Breakdown (${physicalItems.length}):</div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style="text-align: center;">Qty & Unit</th>
                    <th style="text-align: right;">Total Amount (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  ${physItemsRowsHtml}
                </tbody>
              </table>
            ` : ''}

            ${subscriptionItems.length > 0 ? `
              <div class="section-title" style="color: #4f46e5; border-bottom-color: #c7d2fe;">
                🛡️ Subscriptions & Cloud Services Breakdown (${subscriptionItems.length}):
              </div>
              <table class="items-table">
                <thead>
                  <tr style="background: #e0e7ff; color: #3730a3;">
                    <th>Subscription / Service Name</th>
                    <th style="text-align: center;">Billing Cycle</th>
                    <th style="text-align: center;">Seats / Qty</th>
                    <th style="text-align: right;">Total Amount (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  ${subItemsRowsHtml}
                </tbody>
              </table>
            ` : ''}

            ${attachmentsListHtml}

            <p style="margin-top: 20px;">
              <strong>Urgency:</strong> Given our current timeline and workload, we aim to have this position filled by <strong>${requiredDate}</strong>. This aligns with our hiring plan to meet project deadlines and maintain team productivity.
            </p>

            <p>
              I am happy to discuss this further if you have any questions or need additional details.
            </p>

            <p>
              Thank you for considering this request.
            </p>

            <p style="margin-top: 24px; margin-bottom: 0;">
              Best regards,<br/>
              <strong style="color: #0f172a; font-size: 15px;">${preparedBy}</strong><br/>
              <span style="color: #64748b; font-size: 13px;">${positionTitle}</span>
            </p>

            <!-- INTERACTIVE APPROVE & DECLINE BUTTONS SECTION -->
            <div class="btn-container">
              <p style="font-size: 12px; font-weight: bold; color: #475569; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                ⚡ CLICK AN ACTION BELOW TO RESPOND DIRECTLY:
              </p>
              
              <a href="${approveUrl}" class="btn-approve" target="_blank">
                ✅ APPROVE REQUISITION
              </a>

              <a href="${declineUrl}" class="btn-decline" target="_blank">
                ❌ DECLINE REQUISITION
              </a>

              <div style="margin-top: 14px;">
                <a href="${viewUrl}" style="font-size: 12px; color: #2563eb; font-weight: 600; text-decoration: underline;" target="_blank">
                  View Full Requisition Details & Attachments
                </a>
              </div>
            </div>
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} NKB Manufacturing Corp. Enterprise Purchase Requisition System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const toRecipients = this.parseRecipients(approverEmail);

    if (this.transporter) {
      try {
        const fromEmail = this.getFromAddress();
        const mailOptions = {
          from: fromEmail,
          to: toRecipients,
          subject,
          html: htmlContent,
          attachments: mailAttachments
        };
        const info = await this.sendWithFallback(mailOptions);
        logger.info(`Approval Notification Email sent to ${toRecipients.join(', ')} with logo branding and ${userUploadedCount} physical file attachment(s) for Request ${requestData.request_number}. Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId, attachmentCount: userUploadedCount };
      } catch (err) {
        logger.error(`Failed to send email to ${toRecipients.join(', ')}: ${err.message}`);
        return { success: false, error: err.message };
      }
    } else {
      logger.info(`[SIMULATED EMAIL NOTIFICATION] To: ${toRecipients.join(', ')} | Subject: ${subject} | Attachments: ${userUploadedCount} file(s)`);
      logger.info(`[SIMULATED EMAIL CONTENT] Direct Approve Link: ${approveUrl} | Direct Decline Link: ${declineUrl}`);
      return { success: true, simulated: true, attachmentCount: userUploadedCount };
    }
  }
}

module.exports = new EmailService();
