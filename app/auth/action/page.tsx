"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EmbyService } from "@/lib/services/emby";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");
  const email = searchParams.get("email");

  useEffect(() => {
    console.log('Mode:', mode);
    console.log('OOB Code:', oobCode);
    console.log('Full URL:', window.location.href);
  }, [mode, oobCode]);

  useEffect(() => {
    const verifyResetCode = async () => {
      if (oobCode && mode === "resetPassword") {
        try {
          const email = await verifyPasswordResetCode(auth, oobCode);
          console.log('Reset code verified successfully for:', email);
        } catch (error: any) {
          console.error('Reset code verification failed:', error);
          toast({
            variant: "destructive",
            title: "Invalid Reset Link",
            description: `Verification failed: ${error.message}`,
          });
        }
      }
    };
    
    verifyResetCode();
  }, [oobCode, mode, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || !email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid reset link. Please request a new one.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }
    
    setLoading(true);
    try {
      // Verify the code first
      let verifiedEmail;
      try {
        verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
        console.log('Verified email:', verifiedEmail);
      } catch (verifyError: any) {
        console.error('Verification error:', verifyError);
        toast({
          variant: "destructive",
          title: "Invalid or Expired Link",
          description: `Link verification failed: ${verifyError.message}`,
        });
        setTimeout(() => {
          window.location.href = "/forgot-password";
        }, 2000);
        return;
      }

      // Get user's Emby ID from Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("User not found");
      }

      const userData = querySnapshot.docs[0].data();
      
      if (!userData.embyUserId) {
        throw new Error("User not properly configured");
      }

      // If verification passed, proceed with password reset
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      // Then update Emby password
      try {
        await EmbyService.updatePassword(userData.embyUserId, newPassword);
      } catch (embyError) {
        console.error("Failed to sync Emby password:", embyError);
        toast({
          variant: "destructive",
          title: "Partial Success", 
          description: "Password reset successful, but failed to sync with media server. Please contact support.",
        });
      }

      toast({
        title: "Success",
        description: "Your password has been successfully reset. Please log in with your new password.",
      });
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Password update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode !== "resetPassword") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-500">Invalid Action</CardTitle>
          <CardDescription className="text-center">
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/reset-password">
            <Button>Request New Reset Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <Film className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HandleResetPassword() {
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
            <CardDescription className="text-center">
              Please wait while we verify your reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
} 