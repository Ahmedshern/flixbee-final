import { NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';

export async function DELETE(request: Request) {
  try {
    const { embyUserId } = await request.json();
    
    if (!embyUserId) {
      return NextResponse.json(
        { error: 'No Emby user ID provided' },
        { status: 400 }
      );
    }

    await EmbyService.deleteUser(embyUserId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Emby user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 