import { NextResponse } from "next/server";
import { adminDb } from '@/lib/firebase-admin';
import { NotificationService } from '@/lib/services/notification';
import { EmbyService } from '@/lib/services/emby';
import { handleSubscriptionExpiration } from '@/lib/subscription';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';

const BATCH_SIZE = 100;

async function processExpiredSubscription(
  userId: string, 
  userData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    await handleSubscriptionExpiration(userId, userData.embyUserId);
    await EmbyService.updateUserPolicy(userData.embyUserId, false);
    await NotificationService.sendSubscriptionNotification(
      userId,
      'subscription_expired',
      {
        duration: userData.duration,
        plan: userData.plan,
        name: userData.name,
        email: userData.email
      }
    );

    logger.info('Subscription expired and processed', {
      userId,
      plan: userData.plan,
      duration: userData.duration
    });

    metrics.increment('subscription.expired', 1, {
      plan: userData.plan,
      duration: String(userData.duration)
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to process expired subscription', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    metrics.increment('subscription.expired.error', 1, {
      plan: userData.plan,
      duration: String(userData.duration)
    });

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Processing failed' 
    };
  }
}

export async function GET() {
  try {
    const startTime = Date.now();
    const now = new Date().toISOString();
    
    const expiredSubscriptions = await adminDb
      .collection('users')
      .where('subscriptionStatus', '==', 'active')
      .where('subscriptionEnd', '<', now)
      .limit(BATCH_SIZE)
      .get();

    if (expiredSubscriptions.empty) {
      logger.info('No expired subscriptions found');
      return NextResponse.json({ 
        success: true, 
        message: 'No expired subscriptions found' 
      });
    }

    const results = await Promise.allSettled(
      expiredSubscriptions.docs.map(async (doc) => {
        const userData = doc.data();
        return processExpiredSubscription(doc.id, userData);
      })
    );

    const summary = results.reduce((acc, result) => {
      if (result.status === 'fulfilled') {
        acc[result.value.success ? 'succeeded' : 'failed']++;
        if (!result.value.success) {
          acc.errors.push(result.value.error || 'Unknown error');
        }
      } else {
        acc.failed++;
        acc.errors.push(result.reason?.message || 'Promise rejection');
      }
      return acc;
    }, { succeeded: 0, failed: 0, errors: [] as string[] });

    // Track execution time
    const executionTime = Date.now() - startTime;
    metrics.histogram('subscription.check.duration', executionTime);

    // Track success/failure metrics
    metrics.gauge('subscription.check.total', expiredSubscriptions.size);
    metrics.gauge('subscription.check.succeeded', summary.succeeded);
    metrics.gauge('subscription.check.failed', summary.failed);

    logger.info('Subscription check completed', {
      total: expiredSubscriptions.size,
      ...summary,
      executionTime
    });

    return NextResponse.json({
      success: true,
      summary: {
        total: expiredSubscriptions.size,
        ...summary,
        executionTime
      }
    });

  } catch (error) {
    logger.error('Failed to check subscriptions', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    metrics.increment('subscription.check.error', 1);

    return NextResponse.json(
      { 
        error: 'Failed to process expired subscriptions',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}