import { NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';
import { adminDb } from '@/lib/firebase-admin';
import { plans } from '@/lib/config/plans';
import { NotificationService } from '@/lib/services/notification';

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

    // Enable Emby user access with plan-specific device limit
    await EmbyService.updateUserPolicy(embyUserId, true, selectedPlan.deviceLimit);

    // Create transaction record
    await adminDb.collection("transactions").add({
      userId,
      plan: normalizedPlanName,
      duration,
      amount,
      type: isUpgrade ? 'upgrade' : 'new',
      previousPlan: currentPlan || null,
      date: new Date().toISOString(),
      status: "completed"
    });

    // Update user subscription
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      subscriptionEnd: subscriptionEnd.toISOString(),
      plan: normalizedPlanName,
      duration: duration,
      updatedAt: new Date().toISOString()
    });

    // Send notification
    await NotificationService.sendNotification(userId, 'subscription_activated', {
      duration,
      plan: normalizedPlanName,
      amount,
      isUpgrade
    });

    return NextResponse.json({ 
      success: true,
      subscriptionEnd: subscriptionEnd.toISOString()
    });
  } catch (error: any) {
    console.error('Error activating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to activate subscription' },
      { status: 500 }
    );
  }
} 