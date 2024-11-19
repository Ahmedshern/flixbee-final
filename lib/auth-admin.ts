import { adminDb } from './firebase-admin';

export async function verifyAdminSession(sessionToken: string): Promise<boolean> {
  try {
    const sessionDoc = await adminDb.collection('admin_sessions').doc(sessionToken).get();
    
    if (!sessionDoc.exists) {
      return false;
    }

    const sessionData = sessionDoc.data();
    const expiryTime = sessionData?.expiresAt.toDate();
    
    // Check if session is expired
    if (!expiryTime || expiryTime < new Date()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return false;
  }
} 