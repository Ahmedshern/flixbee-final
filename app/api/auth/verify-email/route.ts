import { NextResponse } from 'next/server';
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user from Firebase Auth
    const userRecord = await getAuth().getUser(userId);

    // Update Firestore
    await adminDb.collection('users').doc(userId).update({
      emailVerified: userRecord.emailVerified,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error syncing verification state:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync verification state' },
      { status: 500 }
    );
  }
} 