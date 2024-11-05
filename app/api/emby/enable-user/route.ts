import { NextResponse } from 'next/server';
import { updateEmbyUserPolicy } from '@/lib/emby';

export async function POST(request: Request) {
  try {
    const { embyUserId } = await request.json();

    if (!embyUserId) {
      return NextResponse.json(
        { error: 'No Emby user ID provided' },
        { status: 400 }
      );
    }

    // Enable Emby user access
    await updateEmbyUserPolicy(embyUserId, true);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enabling Emby user:', error as Error);
    return NextResponse.json(
      { error: 'Failed to enable Emby user', details: (error as Error).message },
      { status: 500 }
    );
  }
} 