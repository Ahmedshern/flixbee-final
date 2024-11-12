import { doc, updateDoc, getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EmbyService } from '@/lib/services/emby';

export async function handleSubscriptionExpiration(userId: string, embyUserId: string) {
  try {
    // Update Firestore subscription status
    await updateDoc(doc(db, "users", userId), {
      subscriptionStatus: "expired",
      subscriptionEnd: null,
      plan: null,
    });

    // Disable Emby user access
    await EmbyService.updateUserPolicy(embyUserId, false);

    return true;
  } catch (error) {
    console.error("Error handling subscription expiration:", error);
    throw error;
  }
}

export async function activateSubscription(
  userId: string, 
  embyUserId: string, 
  plan: string,
  duration: number,
  amount: number
) {
  try {
    await EmbyService.updateUserPolicy(embyUserId, true);

    // Calculate subscription end date
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + duration);

    // Create transaction record
    await addDoc(collection(db, "transactions"), {
      userId: userId,
      plan: plan,
      duration: duration,
      amount: amount,
      date: new Date().toISOString(),
      status: "completed"
    });

    // Update user subscription in Firestore
    await updateDoc(doc(db, "users", userId), {
      subscriptionStatus: "active",
      subscriptionEnd: subscriptionEnd.toISOString(),
      plan: plan,
      duration: duration,
    });

    return true;
  } catch (error) {
    console.error("Error activating subscription:", error);
    throw error;
  }
}

export async function deactivateSubscription(userId: string, embyUserId: string) {
  try {
    // Update Firestore subscription status
    await updateDoc(doc(db, "users", userId), {
      subscriptionStatus: "inactive",
      subscriptionEnd: null,
      plan: null,
    });

    // Disable Emby user access
    await EmbyService.updateUserPolicy(embyUserId, false);


    return true;
  } catch (error) {
    console.error("Error deactivating subscription:", error);
    throw error;
  }
}



export async function syncEmbyWithFirestore() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    const updates = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      if (!userData.embyUserId) return;

      const embyStatus = await EmbyService.getUserStatus(userData.embyUserId);
      const firestoreStatus = userData.subscriptionStatus;

      if ((embyStatus && firestoreStatus !== "active") ||
          (!embyStatus && firestoreStatus === "active")) {
        await updateDoc(doc(db, "users", userDoc.id), {
          subscriptionStatus: embyStatus ? "active" : "expired",
          subscriptionEnd: embyStatus ? userData.subscriptionEnd : null,
          plan: embyStatus ? userData.plan : null,
        });
      }
    });

    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error("Error syncing Emby with Firestore:", error);
    throw error;
  }
}

// Helper function to check Emby user status
async function checkEmbyUserStatus(embyUserId: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.EMBY_SERVER_URL}/Users/${embyUserId}`, {
      headers: {
        'X-Emby-Token': process.env.EMBY_API_KEY as string,
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch Emby user');
    
    const userData = await response.json();
    return userData.Policy?.IsDisabled === false;
  } catch (error) {
    console.error("Error checking Emby user status:", error);
    throw error;
  }
}

