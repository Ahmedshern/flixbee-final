import { NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { userId, embyUserId, plan, duration, amount } = await request.json();
    
    if (!userId || !embyUserId || !plan || !duration || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate subscription end date
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + duration);

    // Enable Emby user access
    await EmbyService.updateUserPolicy(embyUserId, true);

    // Update Firestore document
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      subscriptionEnd: subscriptionEnd.toISOString(),
      plan: plan,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      subscriptionEnd: subscriptionEnd.toISOString()
    });
  } catch (error: any) {
    console.error('Error processing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process subscription' },
      { status: 500 }
    );
  }
} 