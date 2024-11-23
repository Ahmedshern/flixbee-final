export type NotificationType = 
  | 'subscription_expired'
  | 'subscription_expiring_soon'
  | 'subscription_activated'
  | 'payment_received'
  | 'payment_failed';

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface NotificationTemplate {
  email: EmailTemplate;
  telegram?: string;
} 