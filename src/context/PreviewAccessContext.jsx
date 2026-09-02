"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getPersona, PERSONA_STORAGE_KEY, PERSONAS } from "@/lib/personas";

const PreviewAccessContext = createContext(null);

export function PreviewAccessProvider({ children }) {
  const [personaId, setPersonaId] = useState("ngo_admin_hope");

  useEffect(() => {
    const stored = window.localStorage.getItem(PERSONA_STORAGE_KEY);
    if (stored && PERSONAS.some((persona) => persona.id === stored)) {
      setPersonaId(stored);
    }
  }, []);

  const value = useMemo(() => {
    const persona = getPersona(personaId);
    return {
      persona,
      personas: PERSONAS,
      setPersonaId: (id) => {
        setPersonaId(id);
        window.localStorage.setItem(PERSONA_STORAGE_KEY, id);
      },
    };
  }, [personaId]);

  return <PreviewAccessContext.Provider value={value}>{children}</PreviewAccessContext.Provider>;
}

export function usePreviewAccess() {
  const context = useContext(PreviewAccessContext);
  if (!context) {
    throw new Error("usePreviewAccess must be used within PreviewAccessProvider");
  }
  return context;
}
