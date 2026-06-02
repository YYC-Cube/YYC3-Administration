/**
 * YYC³ 双主题切换系统
 * Theme 1: Cyberpunk - 赛博朋克青色单色调
 * Theme 2: LiquidGlass - 2025-2026 液态玻璃风格
 */

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'

/**
 * Available visual theme modes.
 * - `cyberpunk`: Monochromatic cyan neon on dark background.
 * - `liquidGlass`: 2025-2026 glassmorphism with gradient glows.
 */
export type ThemeMode = 'cyberpunk' | 'liquidGlass'

interface ThemeSwitcherContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeSwitcherContext = createContext<ThemeSwitcherContextValue | null>(null)

const THEME_STORAGE_KEY = 'yyc3_ui_theme'

/**
 * Dual-theme switcher provider.
 * Persists the selected theme to `localStorage` and applies the corresponding
 * CSS class and `data-theme-mode` attribute to `document.documentElement`.
 */
export function ThemeSwitcherProvider({
  children,
  defaultTheme,
}: {
  children: ReactNode
  defaultTheme?: ThemeMode
}) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // 从 localStorage 读取保存的主题
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved === 'cyberpunk' || saved === 'liquidGlass') {
        return saved
      }
    } catch {
      // ignore
    }
    return defaultTheme ?? 'cyberpunk' // 默认使用赛博朋克主题
  })

  // 持久化主题选择
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch {
      // ignore
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'cyberpunk' ? 'liquidGlass' : 'cyberpunk'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  // 应用主题到 document.documentElement
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme-mode', theme)

    // 添加主题类名
    root.classList.remove('theme-cyberpunk', 'theme-liquid-glass')
    root.classList.add(theme === 'cyberpunk' ? 'theme-cyberpunk' : 'theme-liquid-glass')
  }, [theme])

  return (
    <ThemeSwitcherContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeSwitcherContext.Provider>
  )
}

/**
 * Hook to access the theme switcher controls.
 * Must be called within a `<ThemeSwitcherProvider>` tree.
 *
 * @throws Error if called outside of `ThemeSwitcherProvider`.
 */
export function useThemeSwitcher() {
  const context = useContext(ThemeSwitcherContext)
  if (!context) {
    throw new Error('useThemeSwitcher must be used within ThemeSwitcherProvider')
  }
  return context
}
