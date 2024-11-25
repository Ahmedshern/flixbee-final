"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { applyActionCode, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ActionPage() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    async function handleAction() {
      try {
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');
        const email = searchParams.get('email');

        if (!mode || !oobCode) {
          setError("Invalid action link");
          setVerifying(false);
          return;
        }

        if (mode === 'verifyEmail') {
          console.log('Starting verification process...');
          await applyActionCode(auth, oobCode);
          
          // Try to sign in the user to get their UID
          if (email) {
            try {
              const userCred = await signInWithEmailAndPassword(auth, email, '');
              const user = userCred.user;
              
              // Update Firestore
              await updateDoc(doc(db, "users", user.uid), {
                emailVerified: true,
                updatedAt: new Date().toISOString()
              });

              // Sign out after updating
              await auth.signOut();
            } catch (error) {
              console.warn('Could not auto-update Firestore:', error);
              // Continue with verification success even if Firestore update fails
            }
          }
          
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified. You can now log in.",
          });
          
          // Redirect to login with verified flag
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 2000);
        } else {
          setError("Unsupported action type");
        }
      } catch (error: any) {
        console.error("Action handling error:", error);
        setError(
          error.code === 'auth/invalid-action-code'
            ? "This link has expired or already been used."
            : "Failed to process request. Please try again."
        );
      } finally {
        setVerifying(false);
      }
    }

    handleAction();
  }, [searchParams, router, toast]);

  if (verifying) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Processing your request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Action Failed</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/login">
              <Button>Return to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verified!</CardTitle>
          <CardDescription className="text-center">
            Your email has been successfully verified. Redirecting to login...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}