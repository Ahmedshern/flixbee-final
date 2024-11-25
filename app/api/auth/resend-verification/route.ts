import { NextResponse } from 'next/server';
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-email`,
      handleCodeInApp: false,
    };

    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No user is currently signed in' },
        { status: 400 }
      );
    }

    await sendEmailVerification(currentUser, actionCodeSettings);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 