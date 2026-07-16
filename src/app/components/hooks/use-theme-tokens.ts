/**
 * @file use-theme-tokens.ts
 * @description YYC³ Theme Tokens Hook
 *   Provides consistent Tailwind class tokens for modal components across both
 *   Cyberpunk and LiquidGlass themes.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2025-07-11
 * @tags theme, tokens, cyberpunk, liquid-glass
 */

import { useMemo } from 'react'

import { useThemeSwitcher } from '../theme-switcher-context'

/**
 * Typed theme token interface providing consistent CSS class names
 * for overlay, text, accent, surface, and interactive styling.
 */
export interface ThemeTokens {
  // Overlay & Modal
  overlayBg: string
  modalBg: string
  modalBorder: string
  modalShadow: string
  // Text hierarchy
  textPrimary: string
  textSecondary: string
  textTertiary: string
  textMuted: string
  // Accent
  accent: string
  accentBg: string
  accentBorder: string
  // Surfaces
  surfaceInset: string
  sectionBorder: string
  // Interactive
  hoverBg: string
  activeBg: string
  activeTabText: string
  badgeBg: string
  // Theme info
  isCyberpunk: boolean
  isLiquidGlass: boolean
}

/**
 * Hook returning memoized theme tokens as Tailwind class strings.
 * Automatically switches between Cyberpunk and LiquidGlass themes.
 * Used primarily by ModelSettings and other modal components.
 *
 * @returns ThemeTokens object with theme-appropriate class names
 */
export function useThemeTokens(): ThemeTokens {
  const { theme } = useThemeSwitcher()
  const isCyberpunk = theme === 'cyberpunk'

  return useMemo<ThemeTokens>(() => {
    if (isCyberpunk) {
      return {
        overlayBg: 'bg-black/70',
        modalBg: 'bg-[#0c0c0c]',
        modalBorder: 'border-[#00f0ff]/15',
        modalShadow:
          '0 0 40px rgba(0,240,255,0.08), 0 0 80px rgba(0,212,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)',
        textPrimary: 'text-white/90',
        textSecondary: 'text-white/60',
        textTertiary: 'text-white/35',
        textMuted: 'text-white/20',
        accent: 'text-[#00f0ff]',
        accentBg: 'bg-[#00f0ff]/10',
        accentBorder: 'border-[#00f0ff]/20',
        surfaceInset: 'bg-[#0a0a0a]',
        sectionBorder: 'border-white/[0.06]',
        hoverBg: 'hover:bg-white/[0.04]',
        activeBg: 'bg-[#00f0ff]/[0.06]',
        activeTabText: 'text-[#00f0ff]',
        badgeBg: 'bg-white/[0.04]',
        isCyberpunk: true,
        isLiquidGlass: false,
      }
    }

    return {
      overlayBg: 'bg-black/60',
      modalBg: 'bg-white/[0.08]',
      modalBorder: 'border-white/[0.1]',
      modalShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
      textPrimary: 'text-white/95',
      textSecondary: 'text-white/60',
      textTertiary: 'text-white/40',
      textMuted: 'text-white/25',
      accent: 'text-[#00ff87]',
      accentBg: 'bg-[#00ff87]/10',
      accentBorder: 'border-[#00ff87]/20',
      surfaceInset: 'bg-white/[0.04]',
      sectionBorder: 'border-white/[0.05]',
      hoverBg: 'hover:bg-white/[0.06]',
      activeBg: 'bg-[#00ff87]/[0.08]',
      activeTabText: 'text-[#00ff87]',
      badgeBg: 'bg-white/[0.06]',
      isCyberpunk: false,
      isLiquidGlass: true,
    }
  }, [isCyberpunk])
}
