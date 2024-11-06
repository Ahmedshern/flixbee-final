"use client";

import { useAuthContext } from "@/components/auth-provider";

export function DashboardHeader() {
  const { user } = useAuthContext();

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          {user?.email && (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}