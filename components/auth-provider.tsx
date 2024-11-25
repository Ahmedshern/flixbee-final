"use client";

import { createContext, useContext, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext<ReturnType<typeof useAuth>>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuth();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && !user.emailVerified) {
        // If user is not verified and trying to access protected routes
        const protectedPaths = ['/dashboard', '/settings', '/profile'];
        if (protectedPaths.some(path => window.location.pathname.startsWith(path))) {
          await auth.signOut();
          window.location.href = '/auth/verification-sent';
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);