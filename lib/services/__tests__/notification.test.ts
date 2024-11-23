import { NotificationService, NotificationTypes } from '../notification';
import { EmailService } from '../email';
import { adminDb } from '@/lib/firebase-admin';

// Mock dependencies
jest.mock('../email');
jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => ({
          data: () => ({
            email: 'test@example.com',
            name: 'Test User'
          }),
          exists: true
        }))
      })),
      add: jest.fn(() => Promise.resolve())
    }))
  }
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send notification successfully', async () => {
    const userId = 'test-user-id';
    const type = NotificationTypes.SUBSCRIPTION_ACTIVATED;
    const data = {
      duration: 1,
      plan: 'basic',
      amount: 10
    };

    await NotificationService.sendNotification(userId, type, data);

    // Verify email was sent
    expect(EmailService.send).toHaveBeenCalled();

    // Verify notification was logged
    expect(adminDb.collection).toHaveBeenCalledWith('notifications');
  });

  it('should throw error when user not found', async () => {
    const userId = 'non-existent-user';
    jest.spyOn(adminDb.collection('users').doc(userId), 'get')
      .mockResolvedValueOnce({
        data: () => null,
        exists: false
      } as any);

    await expect(
      NotificationService.sendNotification(userId, NotificationTypes.SUBSCRIPTION_ACTIVATED, {})
    ).rejects.toThrow('User email not found');
  });
}); 