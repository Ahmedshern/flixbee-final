"use client";

import React, { Suspense, useMemo } from "react";
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
import { activateSubscription } from "@/lib/subscription";
import { plans } from "@/lib/config/plans";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get("plan");
  const duration = parseInt(searchParams.get("duration") || "1");
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  // Calculate total price
  const totalPrice = useMemo(() => {
    const selectedPlan = plans.find(p => p.name.toLowerCase() === planName);
    if (!selectedPlan) return 0;

    const pricePerMonth = duration > 1 
      ? selectedPlan.specialOffers[duration as keyof typeof selectedPlan.specialOffers] 
      : selectedPlan.price;

    return pricePerMonth * duration;
  }, [planName, duration]);

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

      // Normalize plan name to match configuration
      const normalizedPlanName = (planName ?? 'basic').charAt(0).toUpperCase() + 
        (planName ?? 'basic').slice(1).toLowerCase();

      // Activate subscription through API
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          embyUserId: userData.embyUserId,
          plan: normalizedPlanName,
          duration: duration,
          amount: totalPrice
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to activate subscription');
      }

      toast({
        title: "Subscription activated!",
        description: `Your ${duration}-month ${normalizedPlanName} subscription has been activated.`,
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error processing subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process subscription. Please try again.",
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
          {/* Order Summary */}
          <div className="mb-6 space-y-2 p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="font-medium capitalize">{planName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="font-medium">{duration} {duration === 1 ? 'month' : 'months'}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center">
              <span className="font-medium">Total Amount</span>
              <span className="text-lg font-bold text-emerald-400">MVR {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Bank Transfer Details</h3>
              <div className="rounded-md bg-cyan/60 p-4">
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

            <Button 
              type="submit" 
              className="w-full bg-cyan hover:bg-cyan/70" 
              disabled={loading || !receipt}
            >
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}