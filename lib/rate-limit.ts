import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

export class RateLimit {
  private static requests = new Map<string, number[]>();
  
  static async check(request: NextRequest, limit: number, window: number): Promise<boolean> {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    // Get existing requests for this IP
    const requests = this.requests.get(ip) || [];
    
    // Filter out old requests
    const recentRequests = requests.filter(time => time > now - window);
    
    // Check if limit is exceeded
    if (recentRequests.length >= limit) {
      return false;
    }
    
    // Add new request
    recentRequests.push(now);
    this.requests.set(ip, recentRequests);
    
    return true;
  }
} 