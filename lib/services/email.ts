import { Resend } from 'resend';
import { EmailTemplate } from '../types/notification';
import { logger } from '@/lib/logger';
import { emailTemplates } from '../templates/email';
import { NotificationType } from '../types/notification';

export class EmailService {
  private static resend = new Resend(process.env.RESEND_API_KEY);
  private static readonly FROM_EMAIL = 'BuzzPlay <noreply@buzzplaymv.com>';
  private static readonly MAX_RETRIES = 3;

  static async send(to: string, template: EmailTemplate) {
    try {
      const response = await this.resend.emails.send({
        from: this.FROM_EMAIL,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        tags: [{ name: 'category', value: 'notification' }]
      });

      logger.info('Email sent successfully', { to, messageId: response.data?.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to send email', { to, error });
      throw error;
    }
  }

  static getSubscriptionTemplate(type: NotificationType, data: any): EmailTemplate {
    return emailTemplates[type](data).email;
  }
} 