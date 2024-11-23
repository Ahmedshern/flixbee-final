import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

interface RateLimitConfig {
  limit: number;
  window: string; // e.g., '1m', '1h'
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

class RateLimit {
  private parseWindow(window: string): number {
    const value = parseInt(window);
    const unit = window.slice(-1);
    const multiplier = unit === 'm' ? 60 : unit === 'h' ? 3600 : 1;
    return value * multiplier;
  }

  async check(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const windowSeconds = this.parseWindow(config.window);
    const rateLimitRef = adminDb.collection('rateLimits').doc(identifier);

    try {
      // Use transaction to ensure atomic operations
      const result = await adminDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(rateLimitRef);
        const data = doc.data();

        // Check if we have existing rate limit data
        if (doc.exists && data) {
          // If the window has expired, reset the count
          if (data.reset <= now) {
            transaction.set(rateLimitRef, {
              count: 1,
              reset: now + windowSeconds
            });
            return {
              success: true,
              remaining: config.limit - 1,
              reset: now + windowSeconds
            };
          }

          // If we're still within the window, increment the count
          const newCount = data.count + 1;
          if (newCount > config.limit) {
            return {
              success: false,
              remaining: 0,
              reset: data.reset
            };
          }

          transaction.update(rateLimitRef, {
            count: newCount
          });

          return {
            success: true,
            remaining: config.limit - newCount,
            reset: data.reset
          };
        }

        // If no existing rate limit, create a new one
        transaction.set(rateLimitRef, {
          count: 1,
          reset: now + windowSeconds
        });

        return {
          success: true,
          remaining: config.limit - 1,
          reset: now + windowSeconds
        };
      });

      return result;
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open if Firestore transaction fails
      return {
        success: true,
        remaining: 1,
        reset: now + windowSeconds
      };
    }
  }

  // Cleanup old rate limit documents
  async cleanup() {
    const now = Math.floor(Date.now() / 1000);
    const batch = adminDb.batch();
    const snapshot = await adminDb
      .collection('rateLimits')
      .where('reset', '<=', now)
      .get();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

export const rateLimit = new RateLimit(); 