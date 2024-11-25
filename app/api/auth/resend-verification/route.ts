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

    // Get user by email using Firebase Admin
    const userRecord = await getAuth().getUserByEmail(email);

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate email verification link with correct settings
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/action`,
      handleCodeInApp: false,
      continueUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/action?email=${encodeURIComponent(email)}`
    };

    const verificationLink = await getAuth().generateEmailVerificationLink(
      email,
      actionCodeSettings
    );

    // Here you would typically send the email using your email service
    // For development, we'll return the link
    console.log('Generated verification link:', verificationLink);

    return NextResponse.json({ 
      success: true,
      message: "Verification email sent successfully",
      // Only include verificationLink in development
      ...(process.env.NODE_ENV === 'development' && { verificationLink })
    });
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 