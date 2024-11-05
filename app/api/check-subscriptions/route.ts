import { NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleSubscriptionExpiration } from "@/lib/subscription";
import { sendExpirationNotification } from "@/lib/services/notification";

export async function GET() {
  try {
    const now = new Date().toISOString();
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("subscriptionStatus", "==", "active"),
      where("subscriptionEnd", "<", now)
    );

    const querySnapshot = await getDocs(q);
    
    const updates = querySnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      if (userData.embyUserId) {
        await handleSubscriptionExpiration(doc.id, userData.embyUserId);
        await sendExpirationNotification(userData.email, userData.duration);
      }
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error checking subscriptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}