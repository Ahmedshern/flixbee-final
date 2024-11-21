import { EmbyService } from "@/lib/services/emby";
import { adminDb } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Received password reset request for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get user's Emby ID from Firestore
    const userSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      console.error('User not found in Firestore:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userSnapshot.docs[0].data();
    const embyUserId = userData.embyUserId;

    if (!embyUserId) {
      console.error('Emby ID not found for user:', email);
      return NextResponse.json(
        { error: 'Emby ID not found' },
        { status: 404 }
      );
    }

    // Update Emby password
    await EmbyService.updatePassword(embyUserId, password);
    console.log('Successfully reset Emby password for user:', email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resetting Emby password:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset Emby password' },
      { status: 500 }
    );
  }
} 