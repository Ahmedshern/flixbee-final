"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { updateEmbyUserPolicy } from "@/lib/subscription";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !receipt) return;

    setLoading(true);
    try {
      // Get user's Emby ID from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      if (!userData?.embyUserId) {
        throw new Error("Emby user ID not found");
      }

      // Upload receipt
      const receiptRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${receipt.name}`);
      await uploadBytes(receiptRef, receipt);

      // Update subscription status and activate Emby account
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

      // Update Firestore subscription status
      await updateDoc(doc(db, "users", user.uid), {
        subscriptionStatus: "active",
        subscriptionEnd: subscriptionEnd.toISOString(),
        plan: plan,
        lastPayment: new Date().toISOString(),
      });

      // Enable Emby user access
      await updateEmbyUserPolicy(userData.embyUserId, true);

      toast({
        title: "Subscription activated!",
        description: "Your account has been activated and you can now start streaming.",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
          <CardDescription>
            Please transfer the payment and upload your receipt to activate your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Bank Transfer Details</h3>
              <div className="rounded-md bg-secondary p-4">
                <p>Bank: Bank of Maldives</p>
                <p>Account Name: BuzzPlay Entertainment</p>
                <p>Account Number: 7730000123456</p>
                <p>Reference: {user?.uid?.slice(0, 8)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Upload Payment Receipt</Label>
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !receipt}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Payment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}