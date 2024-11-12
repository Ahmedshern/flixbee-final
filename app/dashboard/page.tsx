"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth-provider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, CreditCard } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { SubscriptionStatus } from "@/components/subscription-status";
import { EmberBackground } from "@/components/EmberBackground";
import { AnimatedButton } from "@/components/ui/animated-button";

interface UserData {
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  plan?: string;
  duration?: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <EmberBackground />
      <DashboardHeader />
      <div className="container py-4 px-4 md:py-8 md:px-8">
        <div className="grid gap-4 md:gap-8">
          <SubscriptionStatus userData={userData} />

          {/* Instructions Card */}
          <Card className="bg-black/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Installation Instructions</CardTitle>
              <CardDescription>Follow these steps to start watching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Steps */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Step by Step Guide:</h3>
                <ol className="space-y-3 text-sm">
                  <li>1. Install Emby</li>
                  <li>2. Press &quot;Next&quot;</li>
                  <li>3. Press &quot;Skip&quot;</li>
                  <li>4. Add Host & Port</li>
                </ol>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Host:</span>{" "}
                    <span className="text-muted-foreground">https://www.buzzplay.pw</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Port:</span>{" "}
                    <span className="text-muted-foreground">443</span>
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="text-red-500 text-sm">
                <p>Read this before installing Emby on iOS</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  If you see a message asking to pay for Emby premiere on iOS and Apple TV app 
                  you will have to pay a one time unlock fee of 5 USD. We don&apos;t collect that. 
                  It&apos;s collected by Emby via Apple&apos;s Appstore or Google Playstore&apos;s in-app purchase.
                </p>
              </div>

              <div className="text-muted-foreground text-sm">
                You can always stream via Safari or any other browser via https://www.buzzplay.pw
              </div>

              {/* App Buttons */}
              <div className="space-y-3 pt-2">
                <AnimatedButton className="animated-btn w-full bg-green-500 hover:bg-green-600" asChild>
                  <Link href="https://apps.apple.com/app/emby/id992180193" target="_blank">
                    iOS
                  </Link>
                </AnimatedButton>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600" asChild>
                  <Link href="https://play.google.com/store/apps/details?id=tv.emby.embyatv" target="_blank">
                    Android
                  </Link>
                </Button>
                <Button className="w-full bg-lime-600 hover:bg-lime-700" asChild>
                  <Link href="https://www.buzzplay.pw" target="_blank">
                    Watch on web
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:gap-8 md:grid-cols-2">
            <Card className="bg-black/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <CreditCard className="h-5 w-5" />
                  Billing
                </CardTitle>
                <CardDescription className="text-sm">Manage your subscription and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/billing">View Billing History</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-sm">Update your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/settings">Manage Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}