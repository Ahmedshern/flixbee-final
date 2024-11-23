"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth-provider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, CreditCard, Copy } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { SubscriptionStatus } from "@/components/subscription-status";
import { EmberBackground } from "@/components/EmberBackground";
import { AnimatedButton } from "@/components/ui/animated-button";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface UserData {
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  plan?: string;
  duration?: number;
  embyUserId?: string;
  email?: string;
  deviceLimit?: number;
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
              <CardTitle className="text-lg md:text-xl">Getting Started with BuzzPlay</CardTitle>
              <CardDescription>Welcome to BuzzPlay! Follow these quick steps to set up your streaming experience:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Setup Steps */}
              <div className="space-y-4">
                <ol className="space-y-6">
                  <li className="space-y-2">
                    <h3 className="font-medium">1. Install Emby</h3>
                    <p className="text-sm text-muted-foreground">
                      Download the Emby app from the App Store or Play Store.
                    </p>
                    <div className="mt-2">
                      
                    </div>
                  </li>
                  <li className="space-y-2">
                    <h3 className="font-medium">2. Welcome Screen</h3>
                    <p className="text-sm text-muted-foreground">
                      Open the app and click Next on the &quot;Welcome to Emby&quot; screen.
                    </p>
                    <div className="mt-2">
                      <Image
                        src="/images/emby-welcome.png"
                        alt="Emby Welcome Screen"
                        width={300}
                        height={600}
                        className="rounded-lg border border-zinc-800 mx-auto"
                        priority
                      />
                    </div>
                  </li>
                  <li className="space-y-2">
                    <h3 className="font-medium">3. Sign-In Screen</h3>
                    <p className="text-sm text-muted-foreground">
                      On the Emby Connect sign-in screen, select Skip (Emby Connect sign-in is not required).
                    </p>
                    <div className="mt-2">
                      <Image
                        src="/images/emby-signin.png"
                        alt="Emby Sign-in Screen"
                        width={300}
                        height={600}
                        className="rounded-lg border border-zinc-800 mx-auto"
                        priority
                      />
                    </div>
                  </li>
                  <li className="space-y-2">
                    <h3 className="font-medium">4. Add Server Details</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter the following server information:
                    </p>
                    <div className="bg-black/40 p-3 rounded-lg space-y-2">
                      <p className="text-sm flex items-center justify-between">
                        <span>
                          <span className="font-medium">Host:</span>{" "}
                          <span className="text-muted-foreground">https://www.buzzplaymv.com</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText("https://www.buzzplaymv.com");
                            toast({
                              description: "Host URL copied to clipboard",
                              duration: 2000,
                            });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </p>
                      <p className="text-sm flex items-center justify-between">
                        <span>
                          <span className="font-medium">Port:</span>{" "}
                          <span className="text-muted-foreground">123</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText("123");
                            toast({
                              description: "Port number copied to clipboard",
                              duration: 2000,
                            });
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </p>
                    </div>
                    <div className="mt-4">
                      <Image
                        src="/images/emby-connect.png"
                        alt="Emby Connect Screen"
                        width={300}
                        height={600}
                        className="rounded-lg border border-zinc-800 mx-auto"
                        priority
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Then, click Connect.
                    </p>
                  </li>
                </ol>
              </div>

              {/* Success Message */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-emerald-400 font-medium mb-2">You&apos;re all set!</p>
                <p className="text-sm text-muted-foreground">
                  Enjoy seamless streaming until your subscription ends. With your BuzzPlay subscription, 
                  you also get access to Emby Premiere, giving you a premium streaming experience.
                </p>
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