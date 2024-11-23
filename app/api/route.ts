import { rateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get IP address as identifier for rate limiting
    const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const rateLimitResult = await rateLimit.check(ip, { limit: 5, window: '1m' });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    // Continue with the request
    // ... existing code ...
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 