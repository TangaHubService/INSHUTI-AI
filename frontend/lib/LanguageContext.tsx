"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Language } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/userApiClient";

const STORAGE_KEY = "inshuti_language";

const LanguageContext = createContext<{ language: Language; setLanguage: (lang: Language) => void } | null>(null);

function isLanguage(value: string | null | undefined): value is Language {
  return value === "EN" || value === "RW" || value === "FR" || value === "SW";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("EN");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) {
      setLanguageState(stored);
      return;
    }
    // No device-level choice yet — default to the logged-in account's
    // preferred language (set at registration) until they change it via
    // the switcher or Profile settings, either of which persists here.
    void getCurrentUser().then((user) => {
      if (user && isLanguage(user.preferredLanguage)) {
        setLanguageState(user.preferredLanguage);
      }
    });
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
