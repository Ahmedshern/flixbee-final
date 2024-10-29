"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface SubscriptionStatusProps {
  userData: {
    subscriptionStatus: string;
    subscriptionEnd: string | null;
    plan?: string;
  } | null;
}

export function SubscriptionStatus({ userData }: SubscriptionStatusProps) {
  if (!userData) return null;

  const isActive = userData.subscriptionStatus === "active";
  const subscriptionEnd = userData.subscriptionEnd 
    ? new Date(userData.subscriptionEnd).toLocaleDateString()
    : null;

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
                Your {userData.plan} subscription is active until {subscriptionEnd}
              </AlertDescription>
            </Alert>
            <Button variant="outline" asChild>
              <Link href="/dashboard/billing">Manage Subscription</Link>
            </Button>
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