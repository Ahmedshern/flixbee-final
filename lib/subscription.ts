import { doc, updateDoc, getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function handleSubscriptionExpiration(userId: string, embyUserId: string) {
  try {
    // Update Firestore subscription status
    await updateDoc(doc(db, "users", userId), {
      subscriptionStatus: "expired",
      subscriptionEnd: null,
      plan: null,
    });

    // Disable Emby user access
    await updateEmbyUserPolicy(embyUserId, false);

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
    // Calculate subscription end date
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + duration);

    // Update Emby user policy
    await updateEmbyUserPolicy(embyUserId, true);

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
    await updateEmbyUserPolicy(embyUserId, false);

    return true;
  } catch (error) {
    console.error("Error deactivating subscription:", error);
    throw error;
  }
}

export const updateEmbyUserPolicy = async (userId: string, enableAccess: boolean) => {
  try {
    const response = await fetch('/api/emby/enable-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embyUserId: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update Emby user policy: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error updating Emby user policy:", error);
    throw error;
  }
};

export async function syncEmbyWithFirestore() {
  try {
    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const embyUserId = userData.embyUserId;
      
      if (!embyUserId) continue;

      // Check Emby user status
      const embyStatus = await checkEmbyUserStatus(embyUserId);
      const firestoreStatus = userData.subscriptionStatus;

      // Sync if there's a mismatch
      if (
        (embyStatus && firestoreStatus !== "active") ||
        (!embyStatus && firestoreStatus === "active")
      ) {
        await updateDoc(doc(db, "users", userDoc.id), {
          subscriptionStatus: embyStatus ? "active" : "expired",
          subscriptionEnd: embyStatus ? userData.subscriptionEnd : null,
          plan: embyStatus ? userData.plan : null,
        });
      }
    }

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

