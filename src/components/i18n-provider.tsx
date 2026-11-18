"use client";

import * as React from "react";
import { translations, type Locale, type DictKey } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  tArray: (key: DictKey) => string[];
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "cp_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("ru");

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && (saved === "ru" || saved === "en")) {
        setLocaleState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync <html lang="...">
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = React.useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const t = React.useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => {
      const dict = translations[locale];
      let str = (dict[key] as string) ?? (translations.en[key] as string) ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [locale]
  );

  const tArray = React.useCallback(
    (key: DictKey) => {
      const dict = translations[locale];
      const arr = dict[key];
      if (Array.isArray(arr)) return arr as string[];
      const enArr = translations.en[key];
      return Array.isArray(enArr) ? (enArr as string[]) : [];
    },
    [locale]
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, t, tArray }),
    [locale, setLocale, t, tArray]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
