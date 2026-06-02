import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

// ==========================================
// YYC³ 国际化系统 — i18n Context
// Phase 6: 中英双语切换 + localStorage 持久化
// ==========================================

/** Supported locale codes for the i18n system. */
export type Locale = "zh" | "en";

const LANG_STORAGE_KEY = "yyc3_locale";

/**
 * Flat string dictionary used by each locale file.
 * Keys are dot-separated paths (e.g. `"nav.dashboard"`), values are translated strings.
 */
export interface LocaleMessages {
  [key: string]: string;
}

// ---- Load locale lazily ----
import { enMessages } from "../locales/en";
import { zhMessages } from "../locales/zh";

const localeMap: Record<Locale, LocaleMessages> = {
  zh: zhMessages,
  en: enMessages,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isZh: boolean;
  isEn: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

function loadLocale(): Locale {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "zh") return saved;
  } catch { /* ignore */ }
  // Auto-detect from browser
  const nav = navigator.language || "zh";
  return nav.startsWith("en") ? "en" : "zh";
}

/**
 * Provides i18n context to the component tree.
 * Reads the saved locale from `localStorage`, falls back to browser language detection.
 * Exposes `t()` translation function with parameter interpolation support.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>(loadLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleRaw(l);
    try { localStorage.setItem(LANG_STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  // Persist changes
  useEffect(() => {
    try { localStorage.setItem(LANG_STORAGE_KEY, locale); } catch { /* ignore */ }
  }, [locale]);

  /**
   * Translation function.
   * Supports parameter interpolation: t("greeting", { name: "YYC³" })
   * where the locale string is "Hello, {name}!"
   */
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const messages = localeMap[locale];
    let str = messages[key] ?? localeMap.zh[key] ?? key; // fallback: zh → key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return str;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isZh: locale === "zh", isEn: locale === "en" }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access the i18n translation system.
 * Must be called within an `<I18nProvider>` tree.
 *
 * @throws Error if called outside of `I18nProvider`.
 * @returns Object containing `locale`, `setLocale`, `t()`, `isZh`, and `isEn`.
 */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}