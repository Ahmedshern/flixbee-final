import { NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { userId, embyUserId } = await request.json();
    
    if (!userId || !embyUserId) {
      return NextResponse.json(
        { error: 'Missing user IDs' },
        { status: 400 }
      );
    }

    // Delete from Firebase Auth
    try {
      await getAuth().deleteUser(userId);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // If user not found in Auth, continue with other deletions
      console.warn('User not found in Firebase Auth:', userId);
    }

    // Delete from Emby
    try {
      await EmbyService.deleteUser(embyUserId);
    } catch (error: any) {
      console.warn('Error deleting Emby user:', error);
      // Continue if Emby user doesn't exist
    }

    // Delete from Firestore
    await adminDb.collection('users').doc(userId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 