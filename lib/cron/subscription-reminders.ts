import { NotificationService } from '@/lib/services/notification';

export async function checkExpiringSubscriptions() {
  try {
    await NotificationService.sendExpirationReminders();
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
  }
} 