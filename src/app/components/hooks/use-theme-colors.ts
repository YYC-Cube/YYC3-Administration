/**
 * YYC3 Centralized Theme Colors Hook
 * Provides all theme-specific colors, styles, and utility functions
 * for seamless switching between Cyberpunk and Liquid Glass themes.
 */

import { useMemo } from 'react'

import { type ThemeMode, useThemeSwitcher } from '../theme-switcher-context'

/** Complete set of semantic color tokens for a theme. */
export interface ThemeColors {
  /** Current theme mode identifier */
  mode: ThemeMode
  /** Whether the current theme is cyberpunk */
  isCyberpunk: boolean
  /** Whether the current theme is liquid glass */
  isLiquidGlass: boolean

  // === Primary palette ===
  primary: string
  primaryRgb: string
  primaryGlow: string
  secondary: string
  secondaryRgb: string
  accent: string
  accentRgb: string
  success: string
  highlight: string
  muted: string
  danger: string
  warning: string

  // === Background system ===
  bgBase: string
  bgCard: string
  bgCardHover: string
  bgElevated: string
  bgOverlay: string
  bgInput: string
  bgInputFocus: string

  // === Text system ===
  textPrimary: string
  textSecondary: string
  textMuted: string
  textAccent: string
  textInverse: string

  // === Border system ===
  borderDefault: string
  borderHover: string
  borderActive: string
  borderSubtle: string
  borderGlow: string

  // === Shadow system ===
  shadowSm: string
  shadowMd: string
  shadowLg: string
  shadowGlow: string
  shadowCardHover: string

  // === Header/Footer specific ===
  headerBg: string
  headerBorder: string
  headerGlow: string
  footerBg: string
  footerBorder: string

  // === Sidebar specific ===
  sidebarBg: string
  sidebarBorder: string
  sidebarBorderExpanded: string

  // === Gradients ===
  gradientPrimary: string
  gradientCard: string
  gradientButton: string
  gradientButtonHover: string

  // === Navigation ===
  navActiveBg: (color: string) => string
  navActiveGlow: (color: string) => string
  navActiveBorder: (color: string) => string
  navInactiveText: string
  navBadgeShadow: (color: string) => string

  // === Status colors (common) ===
  statusOnline: string
  statusOnlineGlow: string

  // === Effects ===
  blur: string
  backdropFilter: string
  springEasing: string
  transitionAll: string
  hoverTransform: string
  cardHoverTransform: string

  // === Utility helpers ===
  /** Generate alpha color: `alpha('#00f0ff', 0.2)` */
  alpha: (color: string, opacity: number) => string
  /** Generate neon glow box-shadow */
  neonGlow: (color: string, intensity?: number) => string
  /** Get color for a nav item with active state */
  navItemStyle: (
    color: string,
    active: boolean,
  ) => {
    background: string
    color: string
    boxShadow: string
    border: string
  }

  // === Legacy compatibility aliases ===
  card: string
  border: string
  foreground: string
  input: string
  mutedForeground: string
  destructive: string
}

/** Cyberpunk theme palette - monochromatic cyan neon on dark */
const cyberpunkColors: Omit<
  ThemeColors,
  | 'mode'
  | 'isCyberpunk'
  | 'isLiquidGlass'
  | 'alpha'
  | 'neonGlow'
  | 'navItemStyle'
  | 'navActiveBg'
  | 'navActiveGlow'
  | 'navActiveBorder'
  | 'navBadgeShadow'
> = {
  primary: '#00f0ff',
  primaryRgb: '0,240,255',
  primaryGlow: 'rgba(0,240,255,0.4)',
  secondary: '#00d4ff',
  secondaryRgb: '0,212,255',
  accent: '#00ffcc',
  accentRgb: '0,255,204',
  success: '#00ffc8',
  highlight: '#41ffdd',
  muted: '#008b9d',
  danger: '#ff0040',
  warning: '#ff9900',

  bgBase: '#0a0a0a',
  bgCard: 'rgba(10,10,10,0.75)',
  bgCardHover: 'rgba(10,10,10,0.85)',
  bgElevated: 'rgba(10,10,10,0.92)',
  bgOverlay: 'rgba(0,0,0,0.7)',
  bgInput: 'rgba(10,10,10,0.6)',
  bgInputFocus: 'rgba(0,240,255,0.08)',

  textPrimary: 'rgba(255,255,255,0.9)',
  textSecondary: 'rgba(255,255,255,0.5)',
  textMuted: 'rgba(255,255,255,0.25)',
  textAccent: '#00f0ff',
  textInverse: '#0a0a0a',

  borderDefault: 'rgba(0,240,255,0.15)',
  borderHover: 'rgba(0,240,255,0.4)',
  borderActive: 'rgba(0,240,255,0.6)',
  borderSubtle: 'rgba(0,240,255,0.08)',
  borderGlow: '#00f0ff',

  shadowSm: '0 0 5px rgba(0,240,255,0.15)',
  shadowMd: '0 0 10px rgba(0,240,255,0.2)',
  shadowLg: '0 0 20px rgba(0,240,255,0.3)',
  shadowGlow: '0 0 15px rgba(0,240,255,0.4), 0 0 30px rgba(0,240,255,0.15)',
  shadowCardHover:
    '0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.2), inset 0 0 20px rgba(0,240,255,0.1)',

  headerBg: 'rgba(10,10,10,0.92)',
  headerBorder: '#00f0ff',
  headerGlow: '0 0 15px rgba(0,240,255,0.4), 0 0 30px rgba(0,240,255,0.15)',
  footerBg: 'rgba(10,10,10,0.92)',
  footerBorder: '#00f0ff',

  sidebarBg: 'rgba(10,10,10,0.88)',
  sidebarBorder: 'rgba(0,240,255,0.08)',
  sidebarBorderExpanded: 'rgba(0,240,255,0.25)',

  gradientPrimary: 'linear-gradient(135deg, #00f0ff, #00d4ff)',
  gradientCard: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.1))',
  gradientButton: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.15))',
  gradientButtonHover: 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(0,212,255,0.25))',

  navInactiveText: 'rgba(255,255,255,0.35)',
  statusOnline: '#00ffc8',
  statusOnlineGlow: '0 0 6px #00ffc8',

  blur: '20px',
  backdropFilter: 'blur(20px)',
  springEasing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  transitionAll: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  hoverTransform: 'translateY(-2px)',
  cardHoverTransform: 'translateY(-8px) scale(1.02)',

  card: 'rgba(10,10,10,0.75)',
  border: 'rgba(0,240,255,0.15)',
  foreground: 'rgba(255,255,255,0.9)',
  input: 'rgba(10,10,10,0.6)',
  mutedForeground: 'rgba(255,255,255,0.5)',
  destructive: '#ff0040',
}

/** Liquid Glass theme palette - glassmorphism with green-cyan gradients */
const liquidGlassColors: Omit<
  ThemeColors,
  | 'mode'
  | 'isCyberpunk'
  | 'isLiquidGlass'
  | 'alpha'
  | 'neonGlow'
  | 'navItemStyle'
  | 'navActiveBg'
  | 'navActiveGlow'
  | 'navActiveBorder'
  | 'navBadgeShadow'
> = {
  primary: '#00ff87',
  primaryRgb: '0,255,135',
  primaryGlow: 'rgba(0,255,135,0.3)',
  secondary: '#00d4ff',
  secondaryRgb: '0,212,255',
  accent: '#00ffaa',
  accentRgb: '0,255,170',
  success: '#00ffc8',
  highlight: '#22d3ee',
  muted: '#06b6d4',
  danger: '#ef4444',
  warning: '#f59e0b',

  bgBase: '#0a0f0a',
  bgCard: 'rgba(255,255,255,0.08)',
  bgCardHover: 'rgba(255,255,255,0.12)',
  bgElevated: 'rgba(255,255,255,0.06)',
  bgOverlay: 'rgba(0,0,0,0.6)',
  bgInput: 'rgba(255,255,255,0.05)',
  bgInputFocus: 'rgba(0,255,135,0.08)',

  textPrimary: 'rgba(255,255,255,0.95)',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.3)',
  textAccent: '#00ff87',
  textInverse: '#0a0f0a',

  borderDefault: 'rgba(255,255,255,0.1)',
  borderHover: 'rgba(255,255,255,0.2)',
  borderActive: 'rgba(0,255,135,0.5)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  borderGlow: 'rgba(0,255,135,0.3)',

  shadowSm: '0 2px 8px rgba(0,0,0,0.1)',
  shadowMd: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
  shadowLg: '0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
  shadowGlow: '0 0 20px rgba(0,255,135,0.2), 0 8px 32px rgba(0,0,0,0.1)',
  shadowCardHover:
    '0 20px 40px rgba(0,0,0,0.15), 0 0 40px rgba(0,255,135,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',

  headerBg: 'rgba(10,15,10,0.85)',
  headerBorder: 'rgba(0,255,135,0.2)',
  headerGlow: '0 4px 30px rgba(0,255,135,0.1), 0 1px 0 rgba(255,255,255,0.05) inset',
  footerBg: 'rgba(10,15,10,0.85)',
  footerBorder: 'rgba(0,255,135,0.15)',

  sidebarBg: 'rgba(10,15,10,0.75)',
  sidebarBorder: 'rgba(255,255,255,0.05)',
  sidebarBorderExpanded: 'rgba(0,255,135,0.15)',

  gradientPrimary: 'linear-gradient(135deg, #00ff87, #06b6d4)',
  gradientCard: 'linear-gradient(135deg, rgba(0,255,135,0.15), rgba(0,212,255,0.1))',
  gradientButton: 'linear-gradient(135deg, rgba(0,255,135,0.8), rgba(6,182,212,0.8))',
  gradientButtonHover: 'linear-gradient(135deg, rgba(0,255,135,0.9), rgba(6,182,212,0.9))',

  navInactiveText: 'rgba(255,255,255,0.4)',
  statusOnline: '#00ff87',
  statusOnlineGlow: '0 0 8px rgba(0,255,135,0.5)',

  blur: '20px',
  backdropFilter: 'blur(20px) saturate(180%)',
  springEasing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  transitionAll: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  hoverTransform: 'translateY(-2px)',
  cardHoverTransform: 'translateY(-8px) scale(1.02)',

  card: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.1)',
  foreground: 'rgba(255,255,255,0.95)',
  input: 'rgba(255,255,255,0.05)',
  mutedForeground: 'rgba(255,255,255,0.6)',
  destructive: '#ef4444',
}

/**
 * Hook providing the complete theme color palette based on the active theme.
 * Returns all colors, gradients, shadows, and utility functions needed
 * for theme-aware component rendering.
 *
 * @returns ThemeColors object with the full dual-theme color system.
 */
export function useThemeColors(): ThemeColors {
  const { theme } = useThemeSwitcher()

  return useMemo(() => {
    const isCyberpunk = theme === 'cyberpunk'
    const base = isCyberpunk ? cyberpunkColors : liquidGlassColors

    const alpha = (color: string, opacity: number): string => {
      // Handle hex colors
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${opacity})`
      }
      return color
    }

    const neonGlow = (color: string, intensity: number = 1): string => {
      if (isCyberpunk) {
        return `0 0 ${10 * intensity}px ${alpha(color, 0.4 * intensity)}, 0 0 ${20 * intensity}px ${alpha(color, 0.2 * intensity)}`
      }
      return `0 0 ${15 * intensity}px ${alpha(color, 0.2 * intensity)}, 0 4px 12px rgba(0,0,0,0.1)`
    }

    const navActiveBg = (color: string) => (isCyberpunk ? `${color}15` : alpha(color, 0.1))
    const navActiveGlow = (color: string) =>
      isCyberpunk
        ? `0 0 12px ${color}30, inset 0 0 8px ${color}0d`
        : `0 0 15px ${alpha(color, 0.15)}`
    const navActiveBorder = (color: string) =>
      isCyberpunk ? `1px solid ${color}40` : `1px solid ${alpha(color, 0.25)}`
    const navBadgeShadow = (color: string) =>
      isCyberpunk ? `0 0 8px ${color}, 0 0 16px ${color}80` : `0 0 10px ${alpha(color, 0.4)}`

    const navItemStyle = (color: string, active: boolean) => ({
      background: active ? navActiveBg(color) : 'transparent',
      color: active ? color : base.navInactiveText,
      boxShadow: active ? navActiveGlow(color) : 'none',
      border: active ? navActiveBorder(color) : '1px solid transparent',
    })

    return {
      mode: theme,
      isCyberpunk,
      isLiquidGlass: !isCyberpunk,
      ...base,
      alpha,
      neonGlow,
      navItemStyle,
      navActiveBg,
      navActiveGlow,
      navActiveBorder,
      navBadgeShadow,
    }
  }, [theme])
}

/**
 * Map of cyberpunk nav-item colors to their liquid glass equivalents.
 * Used to remap per-item colors when switching themes.
 */
export const LIQUID_GLASS_NAV_COLORS: Record<string, string> = {
  '#00f0ff': '#00ff87',
  '#00d4ff': '#06b6d4',
  '#00ffcc': '#22d3ee',
  '#00ffc8': '#00ffaa',
  '#41ffdd': '#34d399',
  '#008b9d': '#0891b2',
}

/**
 * Get the theme-appropriate color for a nav item.
 * In cyberpunk mode returns the original color; in liquid glass
 * mode returns the mapped equivalent from Guidelines palette.
 */
export function getThemeNavColor(originalColor: string, isCyberpunk: boolean): string {
  if (isCyberpunk) return originalColor
  return LIQUID_GLASS_NAV_COLORS[originalColor] || originalColor
}
