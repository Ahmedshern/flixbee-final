import { NextResponse } from 'next/server';
import { EmbyService } from '@/lib/services/emby';
import { adminDb } from '@/lib/firebase-admin';
import { plans } from '@/lib/config/plans';
import { NotificationService } from '@/lib/services/notification';

export async function POST(request: Request) {
  try {
    const { userId, embyUserId, plan, duration, amount } = await request.json();
    
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
      console.error('Plan not found:', { 
        receivedPlan: plan, 
        normalizedPlan: normalizedPlanName, 
        availablePlans: plans.map(p => p.name) 
      });
      throw new Error(`Invalid plan selected: ${plan}`);
    }

    // Calculate subscription end date
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + duration);

    // Enable Emby user access with plan-specific device limit
    await EmbyService.updateUserPolicy(embyUserId, true, selectedPlan.deviceLimit);

    // Create transaction record
    await adminDb.collection("transactions").add({
      userId,
      plan: normalizedPlanName,
      duration,
      amount,
      date: new Date().toISOString(),
      status: "completed"
    });

    // Update user subscription
    await adminDb.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      subscriptionEnd: subscriptionEnd.toISOString(),
      plan: normalizedPlanName, // Use normalized plan name
      duration: duration,
      deviceLimit: selectedPlan.deviceLimit, // Store device limit
      updatedAt: new Date().toISOString()
    });

    // After successful activation
    await NotificationService.sendSubscriptionNotification(
      userId,
      'subscription_activated',
      {
        duration,
        plan,
        amount
      }
    );

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