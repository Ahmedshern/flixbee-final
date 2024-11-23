"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { plans } from "@/lib/config/plans";

interface SubscriptionStatusProps {
  userData: {
    subscriptionStatus: string;
    subscriptionEnd: string | null;
    plan?: string;
    duration?: number;
  } | null;
}

export function SubscriptionStatus({ userData }: SubscriptionStatusProps) {
  if (!userData) return null;

  const isActive = userData.subscriptionStatus === "active";
  const subscriptionEnd = userData.subscriptionEnd 
    ? new Date(userData.subscriptionEnd).toLocaleDateString()
    : null;

  const currentPlan = plans.find(p => p.name === userData.plan);
  const canUpgrade = currentPlan && plans.some(p => 
    p.price > currentPlan.price && p.deviceLimit > currentPlan.deviceLimit
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>
          Current plan and subscription information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <>
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Active Subscription</AlertTitle>
              <AlertDescription>
                Your {userData.duration}-month {userData.plan} subscription is active until {subscriptionEnd}
              </AlertDescription>
            </Alert>
            {canUpgrade && (
              <Button className="w-full" asChild>
                <Link href="/pricing">
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Active Subscription</AlertTitle>
              <AlertDescription>
                Subscribe now to access premium content
              </AlertDescription>
            </Alert>
            <Button asChild>
              <Link href="/pricing">View Plans</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}