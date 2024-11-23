"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { plans } from "@/lib/config/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

function CheckoutPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);

  const planName = searchParams.get("plan");
  const duration = parseInt(searchParams.get("duration") || "1");

  const selectedPlan = plans.find(
    (p) => p.name.toLowerCase() === planName?.toLowerCase()
  );

  // Calculate price based on duration and special offers
  const basePrice = selectedPlan?.price || 0;
  const specialPrice = selectedPlan?.specialOffers?.[duration as keyof typeof selectedPlan.specialOffers];
  const pricePerMonth = specialPrice || basePrice;
  const totalPrice = pricePerMonth * duration;

  useEffect(() => {
    if (user) {
      // Fetch current subscription details
      const fetchCurrentPlan = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.subscriptionStatus === "active") {
          setCurrentPlan({
            name: userData.plan,
            endDate: userData.subscriptionEnd,
            duration: userData.duration
          });
        }
      };
      fetchCurrentPlan();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !receipt || !planName || !duration) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required information. Please check all fields.",
      });
      return;
    }

    // Validate plan upgrade
    if (currentPlan) {
      const currentPlanConfig = plans.find(p => p.name === currentPlan.name);
      const newPlanConfig = plans.find(p => p.name === planName);
      
      if (currentPlanConfig && newPlanConfig && currentPlanConfig.price >= newPlanConfig.price) {
        toast({
          variant: "destructive",
          title: "Invalid Plan Change",
          description: "You can only upgrade to a higher-tier plan. Please select a different plan.",
        });
        return;
      }
    }

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
      const normalizedPlanName = planName.charAt(0).toUpperCase() + 
        planName.slice(1).toLowerCase();

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
          amount: totalPrice,
          isUpgrade: !!currentPlan
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to activate subscription');
      }

      toast({
        title: currentPlan ? "Plan Upgraded!" : "Subscription Activated!",
        description: currentPlan 
          ? `Your subscription has been upgraded to the ${duration}-month ${normalizedPlanName} plan.`
          : `Your ${duration}-month ${normalizedPlanName} subscription has been activated.`,
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
    <div className="container max-w-xl py-8 px-4 md:py-12">
      <Button variant="ghost" asChild className="mb-6 gap-2">
        <Link href="/pricing">
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>
      </Button>

      <Card className="backdrop-blur-sm bg-black/40 border-zinc-800">
        <CardHeader>
          <CardTitle>
            {currentPlan ? "Upgrade Subscription" : "Complete Your Subscription"}
          </CardTitle>
          <CardDescription>
            {currentPlan 
              ? `Upgrading from ${currentPlan.name} to ${selectedPlan?.name} plan`
              : `Activating ${selectedPlan?.name} plan for ${duration} month${duration > 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current Plan Info (if upgrading) */}
          {currentPlan && (
            <div className="mb-6 p-4 rounded-lg bg-secondary/50">
              <h3 className="font-medium mb-2">Current Subscription</h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan.name} plan active until{" "}
                {new Date(currentPlan.endDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Payment Details */}
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plan Price</span>
                  <span>MVR {pricePerMonth}/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span>{duration} months</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Amount</span>
                  <span>MVR {totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Upload Receipt */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receipt">Upload Payment Receipt</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !receipt}
              >
                {loading ? (
                  "Processing..."
                ) : currentPlan ? (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Confirm Upgrade
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Activate Subscription
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return <CheckoutPageContent />;
}