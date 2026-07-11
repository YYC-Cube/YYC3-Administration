/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { enMessages } from '../locales/en'
import { zhMessages } from '../locales/zh'

import type { Locale as CoreLocale, TranslationMap } from '@/lib/i18n/types'
import type { ReactNode } from 'react'

import { I18nEngine } from '@/lib/i18n/engine'
import { MissingKeyReporter } from '@/lib/i18n/plugins/index'

// Backward-compatible locale type (zh | en)
export type Locale = 'zh' | 'en'

const LANG_STORAGE_KEY = 'yyc3_locale'

const UI_TO_CORE: Record<Locale, CoreLocale> = {
  zh: 'zh-CN',
  en: 'en',
}

export interface LocaleMessages {
  [key: string]: string
}

/**
 * Convert flat message dictionary to nested TranslationMap
 * so i18n-core engine can resolve keys via dot-path traversal.
 */
function flatToNested(flat: Record<string, string>): TranslationMap {
  const result: TranslationMap = {}
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current: TranslationMap = result
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part] as TranslationMap
    }
    current[parts[parts.length - 1]] = value
  }
  return result
}

// Singleton engine instance — created once for the app lifetime
const engine = new I18nEngine({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  cache: { enabled: true, maxSize: 2000, ttl: 10 * 60 * 1000 },
  debug: false,
})

// Register missing-key reporter plugin (dev insight)
const missingKeyReporter = new MissingKeyReporter()
engine.plugins.register(missingKeyReporter.createPlugin())

// Register existing flat translations into the engine
engine.registerTranslation('en', flatToNested(enMessages))
engine.registerTranslation('zh-CN', flatToNested(zhMessages))

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isZh: boolean
  isEn: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

function loadLocale(): Locale {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'en' || saved === 'zh') return saved
  } catch {
    /* ignore */
  }
  const nav = navigator.language || 'zh'
  return nav.startsWith('en') ? 'en' : 'zh'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>(loadLocale)

  // Sync locale to i18n-core engine
  useEffect(() => {
    const coreLocale = UI_TO_CORE[locale]
    engine.setLocale(coreLocale).catch(() => {
      /* lazy-load failure silently falls back */
    })
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    setLocaleRaw(l)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, locale)
    } catch {
      /* ignore */
    }
  }, [locale])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // The engine handles: LRU cache → plugin pipeline → ICU → interpolation
      const str = engine.t(key, params as Record<string, string> | undefined)

      // Fallback: if engine returns the key unchanged, try flat dict directly
      if (str === key) {
        const messages = locale === 'en' ? enMessages : zhMessages
        const fallback = messages[key] ?? zhMessages[key] ?? key
        if (params) {
          return Object.entries(params).reduce(
            (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
            fallback,
          )
        }
        return fallback
      }
      return str
    },
    [locale],
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, isZh: locale === 'zh', isEn: locale === 'en' }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

// Export engine for advanced usage (e.g., programmatic locale change, stats)
export { engine as i18nEngine }
