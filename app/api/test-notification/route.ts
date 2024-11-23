import { NextResponse } from 'next/server';
import { NotificationService, NotificationTypes } from '@/lib/services/notification';
import type { NotificationType } from '@/lib/services/notification';

export async function POST(request: Request) {
  try {
    const { userId, type, data } = await request.json();

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = Object.values(NotificationTypes);
    if (!validTypes.includes(type as NotificationType)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    await NotificationService.sendNotification(userId, type as NotificationType, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 