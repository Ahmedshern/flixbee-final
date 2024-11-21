import { NextResponse } from 'next/server';
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const actionCodeSettings = {
      url: 'https://buzzplaymv.com/auth/action',
      handleCodeInApp: true
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send reset email' },
      { status: 500 }
    );
  }
} 