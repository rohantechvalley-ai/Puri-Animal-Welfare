/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { configService } from './ConfigService';

export interface OutgoingEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  templateName: 'verification' | 'password_reset' | 'welcome' | 'report_status' | 'volunteer' | 'contact_form';
  status: 'pending' | 'sent' | 'failed';
  provider: 'resend' | 'mock';
  errorMessage?: string;
  sentAt?: string;
}

class EmailService {
  private getStorageQueue(): OutgoingEmail[] {
    const queue = localStorage.getItem('puri_outgoing_emails');
    return queue ? JSON.parse(queue) : [];
  }

  private saveStorageQueue(queue: OutgoingEmail[]) {
    localStorage.setItem('puri_outgoing_emails', JSON.stringify(queue));
    // Dispatch a storage event so other panels can react in real-time
    window.dispatchEvent(new Event('puri_emails_updated'));
  }

  public getEmails(): OutgoingEmail[] {
    return this.getStorageQueue();
  }

  public clearQueue() {
    this.saveStorageQueue([]);
  }

  /**
   * Generates a beautifully styled and branded HTML template.
   */
  public generateTemplate(
    templateName: OutgoingEmail['templateName'],
    data: any
  ): { subject: string; html: string } {
    const brandColor = '#10b981'; // brand emerald
    const brandTeal = '#0d9488'; // brand teal
    const textDark = '#0f172a';
    const bgLight = '#f8fafc';
    
    const baseHeader = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background-color: ${bgLight}; color: ${textDark}; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, ${brandTeal}, ${brandColor}); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
          .header p { margin: 4px 0 0; font-size: 14px; opacity: 0.9; }
          .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
          .btn { display: inline-block; padding: 12px 24px; background-color: ${brandColor}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; margin: 20px 0; }
          .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .footer a { color: ${brandTeal}; text-decoration: none; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
          .badge-emerald { background-color: #ecfdf5; color: #059669; }
          .details-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
    `;

    const baseFooter = `
          <div class="footer">
            <p><strong>Puri Animal & Nature Support</strong></p>
            <p>Swargadwar Beach Road, Puri, Odisha, 752001, India</p>
            <p>This is an automated operational notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    switch (templateName) {
      case 'verification':
        return {
          subject: '🔑 Verify your Puri Animal & Nature Support account',
          html: `
            ${baseHeader}
            <div class="header">
              <h1>Verify Your Account</h1>
              <p>Puri Animal & Nature Support</p>
            </div>
            <div class="content">
              <p>Hello <strong>${data.name || 'Friend'}</strong>,</p>
              <p>Thank you for signing up to support our stray animals and beach cleanups in Puri. Please use the following security verification code to complete your registration:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; background-color: #f1f5f9; padding: 12px 24px; border-radius: 12px; border: 1px solid #cbd5e1; color: ${brandTeal};">
                  ${data.code || '849203'}
                </span>
              </div>
              <p>This code will expire in 15 minutes. If you did not request this code, please ignore this email or reach out to our team.</p>
              <p>Best regards,<br><strong>Puri Volunteer Team</strong></p>
            </div>
            ${baseFooter}
          `
        };

      case 'password_reset':
        return {
          subject: '🔒 Reset your password - Puri Animal & Nature Support',
          html: `
            ${baseHeader}
            <div class="header">
              <h1>Password Reset Request</h1>
              <p>Puri Animal & Nature Support</p>
            </div>
            <div class="content">
              <p>Hello <strong>${data.name || 'Friend'}</strong>,</p>
              <p>We received a request to reset your password for your account on the Puri Animal & Nature Support platform.</p>
              <p>Click the button below to establish a new password secure credentials:</p>
              <div style="text-align: center;">
                <a href="${data.resetUrl || '#'}" class="btn">Reset My Password</a>
              </div>
              <p>If you did not request this change, your credentials remain secure, and you can safely disregard this message.</p>
              <p>Best regards,<br><strong>Puri Welfare Security Team</strong></p>
            </div>
            ${baseFooter}
          `
        };

      case 'welcome':
        return {
          subject: '🌸 Welcome to Puri Animal & Nature Support!',
          html: `
            ${baseHeader}
            <div class="header">
              <h1>Welcome to the Family!</h1>
              <p>Together we protect stray animals & beaches</p>
            </div>
            <div class="content">
              <p>Hello <strong>${data.name || 'Volunteer'}</strong>,</p>
              <p>We are absolutely thrilled to welcome you to <strong>Puri Animal & Nature Support</strong>! Your account has been successfully created, and you are now part of our growing citizen responder community.</p>
              <p>Here is how you can make a real difference today:</p>
              <ul>
                <li><strong>Report Incidents</strong>: If you see an injured street dog, sick cow, or beach litter, submit an alert in 1 minute.</li>
                <li><strong>Join Cleanups</strong>: Check the platform calendar for weekly beach plastic sweeps.</li>
                <li><strong>Discussion Forums</strong>: Coordinate feeding zones, ask medical questions, and connect with kind neighbors.</li>
              </ul>
              <div style="text-align: center;">
                <a href="${data.appUrl || '#'}" class="btn">Explore the Platform</a>
              </div>
              <p>Thank you for choosing to lend a hand. Together, we can build a compassionate, plastic-free environment for Puri.</p>
              <p>Warmest wishes,<br><strong>Puri Citizen Initiative</strong></p>
            </div>
            ${baseFooter}
          `
        };

      case 'report_status':
        return {
          subject: `🚨 Report Status Update: ${data.reportTitle || 'Animal Alert'}`,
          html: `
            ${baseHeader}
            <div class="header">
              <h1>Emergency Status Dispatch</h1>
              <p>Real-time updates on your submitted alert</p>
            </div>
            <div class="content">
              <p>Hello <strong>${data.name || 'Reporter'}</strong>,</p>
              <p>Our volunteer network has updated the operational status of your reported incident:</p>
              
              <div class="details-card">
                <p style="margin: 0 0 8px;"><strong>Incident:</strong> ${data.reportTitle || 'Street Cow Leg Injury'}</p>
                <p style="margin: 0 0 8px;"><strong>Location:</strong> ${data.location || 'Near Jagannath Temple, Puri'}</p>
                <p style="margin: 0 0 8px;">
                  <strong>New Status:</strong> 
                  <span class="badge badge-emerald">${data.status || 'IN TREATMENT'}</span>
                </p>
                <p style="margin: 0;"><strong>Coordinator Notes:</strong> ${data.notes || 'A mobile treatment van has been dispatched to perform wound suturing and checkups.'}</p>
              </div>

              <p>We will keep you informed of any further developments as our field team coordinates with local veterinarians.</p>
              <p>Thank you for staying vigilant and helping us save Puri's street animals.</p>
              <p>Sincerely,<br><strong>Field Operations Control</strong></p>
            </div>
            ${baseFooter}
          `
        };

      case 'volunteer':
        return {
          subject: '💪 Volunteer Work Opportunity: Join our Sunday Beach Sweep',
          html: `
            ${baseHeader}
            <div class="header">
              <h1>Volunteer Operations Call</h1>
              <p>Community Action Alert</p>
            </div>
            <div class="content">
              <p>Hello <strong>${data.name || 'Friend'}</strong>,</p>
              <p>A new community operation is scheduled! We are gathering our volunteer team for our weekly beach dunes sweep:</p>
              
              <div class="details-card">
                <p style="margin: 0 0 8px;"><strong>Event:</strong> Sunday Morning Beach Sweep</p>
                <p style="margin: 0 0 8px;"><strong>Date & Time:</strong> Sunday, 06:00 AM IST</p>
                <p style="margin: 0 0 8px;"><strong>Meet-up Point:</strong> Swargadwar Beach Entrance, Puri</p>
                <p style="margin: 0;"><strong>Supplies Provided:</strong> Safety gloves, collection bins, and water bottles will be provided.</p>
              </div>

              <p>Your hands-on participation helps keep Puri's coastline beautiful and prevents plastic waste from harming local street cows and stray dogs.</p>
              <div style="text-align: center;">
                <a href="${data.rsvpUrl || '#'}" class="btn">RSVP & Sign Up</a>
              </div>
              <p>Hope to see you there!</p>
              <p>Best regards,<br><strong>Puri Volunteer Wing</strong></p>
            </div>
            ${baseFooter}
          `
        };

      case 'contact_form':
        return {
          subject: '📬 New Inquiry: Contact Form Submitted',
          html: `
            ${baseHeader}
            <div class="header">
              <h1>Citizen Inquiry</h1>
              <p>New message from contact portal</p>
            </div>
            <div class="content">
              <p>Hello <strong>Administrator</strong>,</p>
              <p>A citizen has submitted a new inquiry via the Puri Animal & Nature Support contact form:</p>
              
              <div class="details-card">
                <p style="margin: 0 0 8px;"><strong>Name:</strong> ${data.senderName || 'Anonymous'}</p>
                <p style="margin: 0 0 8px;"><strong>Email:</strong> ${data.senderEmail || 'N/A'}</p>
                <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${data.subjectLine || 'General'}</p>
                <p style="margin: 0;"><strong>Message:</strong><br>${data.messageBody || 'No text content provided.'}</p>
              </div>

              <p>Please review and reply directly within 24-48 business hours.</p>
              <p>System Mailer,<br><strong>Puri Admin Engine</strong></p>
            </div>
            ${baseFooter}
          `
        };
    }
  }

  /**
   * Enqueues or sends an email based on pluggable configurations.
   */
  public async sendEmail(
    to: string,
    templateName: OutgoingEmail['templateName'],
    data: any
  ): Promise<OutgoingEmail> {
    const config = configService.getConfig();
    const { subject, html } = this.generateTemplate(templateName, data);

    const emailRecord: OutgoingEmail = {
      id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      html,
      templateName,
      status: 'pending',
      provider: config.emailProvider,
      sentAt: new Date().toISOString()
    };

    try {
      if (config.emailProvider === 'resend' && config.resendApiKey) {
        // Send via Resend REST API
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Puri Animal & Nature Support <noreply@puriwelfare.org>',
            to: [to],
            subject: subject,
            html: html
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Resend error: ${errText}`);
        }

        emailRecord.status = 'sent';
      } else {
        // Mock Provider (Development Queue mode)
        console.log(`[Email Mock Service] Email stored in local dev queue.`, {
          to,
          subject,
          templateName
        });
        emailRecord.status = 'pending'; // Leave pending so Admin can view/trigger mock send
      }
    } catch (err: any) {
      console.error('[Email Service Failure] Pluggable email routing crashed', err);
      emailRecord.status = 'failed';
      emailRecord.errorMessage = err.message || 'Unknown network error';
    }

    // Append to queue regardless of status so it can be managed/inspected
    const queue = this.getStorageQueue();
    const updatedQueue = [emailRecord, ...queue];
    this.saveStorageQueue(updatedQueue);

    return emailRecord;
  }

  /**
   * Triggers a manual resend simulation from the admin panel for local queue testing
   */
  public simulateSend(id: string): boolean {
    const queue = this.getStorageQueue();
    const index = queue.findIndex(e => e.id === id);
    if (index !== -1) {
      queue[index].status = 'sent';
      queue[index].sentAt = new Date().toISOString();
      delete queue[index].errorMessage;
      this.saveStorageQueue(queue);
      return true;
    }
    return false;
  }
}

export const emailService = new EmailService();
