"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ActionPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  useEffect(() => {
    async function verifyCode() {
      console.log('Starting verification process...');
      
      if (!oobCode || mode !== "resetPassword") {
        console.error('Invalid parameters:', { oobCode: !!oobCode, mode });
        setVerificationError("Invalid reset link");
        setVerifying(false);
        return;
      }

      try {
        // Log verification attempt
        console.log('Attempting verification with:', {
          mode,
          oobCodePresent: !!oobCode,
          oobCodeLength: oobCode?.length
        });

        // Verify the reset code
        const email = await verifyPasswordResetCode(auth, oobCode);
        
        if (!email) {
          throw new Error('No email returned from verification');
        }

        console.log('Verification successful for email:', email);
        setVerifiedEmail(email);
        setVerificationError(null);
      } catch (error: any) {
        console.error('Verification failed:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        setVerificationError(error.message || "This reset link is invalid or has expired");
        setVerifiedEmail(null);
      } finally {
        setVerifying(false);
      }
    }

    verifyCode();
  }, [oobCode, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oobCode || !verifiedEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid reset link. Please request a new one.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting password reset for:', verifiedEmail);
      
      // Reset Firebase password
      await confirmPasswordReset(auth, oobCode, password);
      console.log('Firebase password reset successful');
      
      // Reset Emby password
      console.log('Attempting to reset Emby password...');
      const response = await fetch('/api/emby/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verifiedEmail,
          password: password,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Emby password reset failed:', data);
        throw new Error(data.error || 'Failed to reset Emby password');
      }
      
      console.log('Password reset successful for both Firebase and Emby');
      toast({
        title: "Success",
        description: "Your password has been reset successfully. Please log in with your new password.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationError || !verifiedEmail) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Invalid Reset Link</CardTitle>
            <CardDescription className="text-center">
              {verificationError || "Unable to verify reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/reset-password">
              <Button>Request New Reset Link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - show password reset form
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password for {verifiedEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}