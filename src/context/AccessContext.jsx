"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import { sessionToAccess } from "@/lib/session-user";

const AccessContext = createContext(null);

export function AccessProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      window.location.replace("/login");
    }
  }, [isPending, session]);

  const value = useMemo(
    () => ({
      persona: sessionToAccess(session?.user),
      isPending,
    }),
    [session, isPending]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess must be used within AccessProvider");
  }
  return context;
}
