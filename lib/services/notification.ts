import { EmailService } from './email';
import { adminDb } from '../firebase-admin';
import { logger } from '../logger';

export const NotificationTypes = {
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
} as const;

export type NotificationType = (typeof NotificationTypes)[keyof typeof NotificationTypes];

export class NotificationService {
  static async sendExpirationReminders() {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const expiringUsers = await adminDb
      .collection('users')
      .where('subscriptionStatus', '==', 'active')
      .where('subscriptionEnd', '<=', threeDaysFromNow)
      .where('subscriptionEnd', '>', now)
      .get();

    for (const doc of expiringUsers.docs) {
      const userData = doc.data();
      const subscriptionEnd = userData.subscriptionEnd.toDate();
      const daysLeft = Math.ceil(
        (subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      await this.sendSubscriptionNotification(doc.id, NotificationTypes.SUBSCRIPTION_EXPIRED, {
        ...userData,
        daysLeft
      });
    }
  }

  static async sendSubscriptionNotification(
    userId: string,
    type: NotificationType,
    data: any
  ) {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData?.email) {
        throw new Error('User email not found');
      }

      await EmailService.send(userData.email, EmailService.getSubscriptionTemplate(type as any, data));
      
      logger.info('Notification sent successfully', { userId, type });
    } catch (error) {
      logger.error('Failed to send notification', { userId, type, error });
      throw error;
    }
  }

  public static async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>
  ) {
    // Implementation here
  }
} 