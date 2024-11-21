import { NextRequest, NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth-admin';

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
    // Verify admin session
    const cookieStore = cookies();
    const adminCookie = cookieStore.get('admin_session');
    
    if (!adminCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isAdmin = await verifyAdminSession(adminCookie.value);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json() as DeleteUserRequest;
    const { userId, embyUserId } = body;
    
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
      } else {
        console.warn('User not found in Firebase Auth:', userId);
      }
    }

    // Delete from Emby
    try {
      await EmbyService.deleteUser(embyUserId);
    } catch (error: any) {
      console.warn('Error deleting Emby user:', error);
    }

    // Delete from Firestore
    try {
      await adminDb.collection('users').doc(userId).delete();
    } catch (error: any) {
      console.error('Error deleting Firestore document:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in delete user route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
} 