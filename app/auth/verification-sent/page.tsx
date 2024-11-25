"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

export default function VerificationSentPage() {
  const [resending, setResending] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email address found. Please try registering again.",
      });
      return;
    }
    
    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            The verification link will expire in 24 hours. If you don&apos;t see the email, please check your spam folder.
          </p>
          <div className="flex flex-col space-y-2 w-full">
            <Button
              variant="secondary"
              onClick={handleResendVerification}
              disabled={resending || !email}
              className="w-full"
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 