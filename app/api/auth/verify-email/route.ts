import { NextResponse } from 'next/server';
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const userRecord = await getAuth().getUserByEmail(email);

    // Update Firestore
    const userQuery = await adminDb.collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      await adminDb.collection('users').doc(userDoc.id).update({
        emailVerified: true,
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error syncing verification state:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync verification state' },
      { status: 500 }
    );
  }
} 