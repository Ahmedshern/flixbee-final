"use client";

import { useAuthContext } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function DashboardHeader() {
  const { user } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          {user?.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}