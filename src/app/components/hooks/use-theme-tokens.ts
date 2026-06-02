import { useMemo } from "react";

// ==========================================
// YYC³ 赛博朋克主题 Token Hook
// 为 ModelSettings 等模态组件提供一致的 Tailwind class token
// ==========================================

/**
 * Typed theme token interface providing consistent CSS class names
 * for overlay, text, accent, surface, and interactive styling.
 */
export interface ThemeTokens {
  // Overlay & Modal
  overlayBg: string;
  modalBg: string;
  modalBorder: string;
  modalShadow: string;
  // Text hierarchy
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  // Accent
  accent: string;
  accentBg: string;
  accentBorder: string;
  // Surfaces
  surfaceInset: string;
  sectionBorder: string;
  // Interactive
  hoverBg: string;
  activeBg: string;
  activeTabText: string;
  badgeBg: string;
}

/**
 * Hook returning memoized cyberpunk theme tokens as Tailwind class strings.
 * Used primarily by ModelSettings and other modal components.
 */
export function useThemeTokens(): ThemeTokens {
  return useMemo<ThemeTokens>(() => ({
    // Overlay & Modal — cyberpunk deep dark
    overlayBg: "bg-black/70",
    modalBg: "bg-[#0c0c0c]",
    modalBorder: "border-[#00f0ff]/15",
    modalShadow: "0 0 40px rgba(0,240,255,0.08), 0 0 80px rgba(0,212,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)",
    // Text
    textPrimary: "text-white/90",
    textSecondary: "text-white/60",
    textTertiary: "text-white/35",
    textMuted: "text-white/20",
    // Accent — cyan neon
    accent: "text-[#00f0ff]",
    accentBg: "bg-[#00f0ff]/10",
    accentBorder: "border-[#00f0ff]/20",
    // Surfaces
    surfaceInset: "bg-[#0a0a0a]",
    sectionBorder: "border-white/[0.06]",
    // Interactive
    hoverBg: "hover:bg-white/[0.04]",
    activeBg: "bg-[#00f0ff]/[0.06]",
    activeTabText: "text-[#00f0ff]",
    badgeBg: "bg-white/[0.04]",
  }), []);
}