import { NextResponse } from 'next/server';
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a verification token
    const token = await getAuth().createCustomToken(email);
    
    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

    // Send verification email using Resend
    await resend.emails.send({
      from: 'BuzzPlay <noreply@buzzplaymv.com>',
      to: email,
      subject: 'Verify your BuzzPlay account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Verify your email address</h2>
          <p>Thanks for signing up for BuzzPlay! Please verify your email address by clicking the link below:</p>
          <a href="${verificationLink}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Verify Email
          </a>
          <p>If you didn't create an account with BuzzPlay, you can safely ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
} 