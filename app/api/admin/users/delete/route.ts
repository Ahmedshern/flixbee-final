import { NextRequest, NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Define the expected request body type
interface DeleteUserRequest {
  userId: string;
  embyUserId: string;
}

// Add runtime configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const adminLoggedIn = (await cookieStore).get('adminLoggedIn')?.value;
    
    if (!adminLoggedIn || adminLoggedIn !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
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
        console.error('Error deleting Firebase user:', error);
      }
    }

    // Delete from Emby
    try {
      await EmbyService.deleteUser(embyUserId);
    } catch (error) {
      console.warn('Error deleting Emby user:', error);
    }

    // Delete from Firestore
    await adminDb.collection('users').doc(userId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in delete user route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
} 