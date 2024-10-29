"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";

const AuthContext = createContext<ReturnType<typeof useAuth>>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);