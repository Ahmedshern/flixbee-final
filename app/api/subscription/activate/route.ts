import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { EmbyService } from '@/lib/services/emby';
import { plans } from '@/lib/config/plans';

export async function POST(request: Request) {
  try {
    const { userId, embyUserId, plan, duration, amount } = await request.json();
    
    // Get current user subscription
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const currentPlan = userData?.plan;
    const isUpgrade = currentPlan && userData?.subscriptionStatus === 'active';

    if (!userId || !embyUserId || !plan || !duration || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize plan name to match plans configuration
    const normalizedPlanName = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
    const selectedPlan = plans.find(p => p.name === normalizedPlanName);
    
    if (!selectedPlan) {
      throw new Error(`Invalid plan selected: ${plan}`);
    }

    // Calculate subscription end date
    const subscriptionEnd = new Date();
    if (isUpgrade && userData.subscriptionEnd) {
      // If upgrading, add duration to existing end date
      subscriptionEnd.setTime(new Date(userData.subscriptionEnd).getTime());
    }
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + duration);

    // Set bitrate based on plan type
    let maxStreamingBitrate;
    if (selectedPlan.name.toLowerCase() === 'mobile') {
      maxStreamingBitrate = 480000000; // 480p
    } else {
      maxStreamingBitrate = 1080000000; // 1080p
    }

    // Enable Emby user access with plan-specific settings
    await EmbyService.updateUserPolicy(
      embyUserId, 
      true, 
      selectedPlan.deviceLimit,
      maxStreamingBitrate
    );

    // Update user document in Firestore
    await adminDb.collection('users').doc(userId).update({
      plan: normalizedPlanName,
      subscriptionStatus: 'active',
      subscriptionEnd: subscriptionEnd.toISOString(),
      duration: duration,
      lastPayment: {
        amount: amount,
        date: new Date().toISOString(),
        plan: normalizedPlanName
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in subscription activation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to activate subscription' },
      { status: 500 }
    );
  }
} 