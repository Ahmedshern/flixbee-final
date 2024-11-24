"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { plans } from "@/lib/config/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Check, Copy } from "lucide-react";
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

      // Upload receipt to Storage
      const timestamp = new Date().toISOString();
      const receiptRef = ref(storage, `receipts/${user.uid}/${timestamp}_${receipt.name}`);
      await uploadBytes(receiptRef, receipt);
      const receiptUrl = await getDownloadURL(receiptRef);

      // Add receipt to Firestore subcollection
      const receiptData = {
        url: receiptUrl,
        date: timestamp,
        uploadDate: timestamp,
        amount: `MVR ${totalPrice}`,
        planName: selectedPlan?.name,
        status: 'pending',
      };

      const receiptsCollectionRef = collection(db, 'users', user.uid, 'receipts');
      await addDoc(receiptsCollectionRef, receiptData);

      // Normalize plan name for consistency
      const normalizedPlanName = selectedPlan?.name.toLowerCase();

      // Call the subscription API
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
      console.error('Subscription error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process subscription. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format price with MVR
  const formatPrice = (price: number) => `MVR ${price.toLocaleString()}`;

  const copyToClipboard = async (text: string, accountHolder: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `Account number for ${accountHolder} has been copied.`,
        duration: 2000,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try copying manually.",
      });
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

      <div className="space-y-6">
        {/* Plan Summary Card */}
        <Card className="backdrop-blur-sm bg-black/40 border-zinc-800">
          <CardHeader>
            <CardTitle>Plan Summary</CardTitle>
            <CardDescription>
              Review your selected plan details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">{selectedPlan?.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {duration} month{duration > 1 ? 's' : ''} subscription
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium text-lg">
                    {formatPrice(pricePerMonth)}
                  </div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 pt-2 border-t">
                {selectedPlan?.features.map((feature) => (
                  <div key={feature} className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Price</span>
                  <span>{formatPrice(basePrice)}</span>
                </div>
                {specialPrice && specialPrice !== basePrice && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Special Offer Discount</span>
                    <span>-{formatPrice(basePrice - specialPrice)}/mo</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{duration} months</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Amount</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Current Plan Info (if upgrading) */}
            {currentPlan && (
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                <h3 className="font-medium mb-2">Current Plan</h3>
                <p className="text-sm text-muted-foreground">
                  {currentPlan.name} plan active until{" "}
                  {new Date(currentPlan.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-yellow-500 mt-2">
                  Your new plan will extend from your current end date
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Upload Card */}
        <Card className="backdrop-blur-sm bg-black/40 border-zinc-800">
          <CardHeader>
            <CardTitle>
              {currentPlan ? "Upgrade Subscription" : "Complete Your Subscription"}
            </CardTitle>
            <CardDescription>
              Upload your payment receipt to activate your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Account Details Box */}
            <div className="mb-6 rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Bank Account Details</h3>
              <div className="space-y-2">
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={() => copyToClipboard("7730000696003", "BML")}
                    className="text-sm flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <div>
                      <span className="font-medium">BML:</span> 7730000696003
                      
                    </div>
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                  
                  
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="receipt">Upload Payment Receipt</Label>
                <div className="mt-2">
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Please upload your payment receipt to verify your subscription
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Upload className="h-4 w-4 animate-spin mr-2" />}
                {currentPlan ? "Upgrade Plan" : "Activate Subscription"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
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