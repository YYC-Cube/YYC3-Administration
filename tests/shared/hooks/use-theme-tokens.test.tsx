/**
 * @file use-theme-tokens.test.tsx
 * @description useThemeTokens Hook 单元测试 — 双主题 Tailwind 令牌
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'
import { useThemeTokens } from '@/shared/hooks/use-theme-tokens'

// Mock wrapper for Context Provider
const createWrapper = (initialTheme: 'cyberpunk' | 'liquidGlass' = 'cyberpunk') => {
  return ({ children }: { children: ReactNode }) => (
    <ThemeSwitcherProvider defaultTheme={initialTheme}>{children}</ThemeSwitcherProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('useThemeTokens Hook', () => {
  describe('UTC-TT-001: Cyberpunk 主题令牌', () => {
    it('应该返回完整的赛博朋克类名令牌', () => {
      const { result } = renderHook(() => useThemeTokens(), {
        wrapper: createWrapper('cyberpunk'),
      })

      const tc = result.current

      expect(tc.isCyberpunk).toBe(true)
      expect(tc.isLiquidGlass).toBe(false)

      expect(tc.overlayBg).toBe('bg-black/70')
      expect(tc.modalBg).toBe('bg-[#0c0c0c]')
      expect(tc.modalBorder).toBe('border-[#00f0ff]/15')
      expect(tc.modalShadow).toContain('rgba(0,240,255,0.08)')

      expect(tc.textPrimary).toBe('text-white/90')
      expect(tc.textSecondary).toBe('text-white/60')
      expect(tc.textTertiary).toBe('text-white/35')
      expect(tc.textMuted).toBe('text-white/20')

      expect(tc.accent).toBe('text-[#00f0ff]')
      expect(tc.accentBg).toBe('bg-[#00f0ff]/10')
      expect(tc.accentBorder).toBe('border-[#00f0ff]/20')

      expect(tc.surfaceInset).toBe('bg-[#0a0a0a]')
      expect(tc.sectionBorder).toBe('border-white/[0.06]')

      expect(tc.hoverBg).toBe('hover:bg-white/[0.04]')
      expect(tc.activeBg).toBe('bg-[#00f0ff]/[0.06]')
      expect(tc.activeTabText).toBe('text-[#00f0ff]')
      expect(tc.badgeBg).toBe('bg-white/[0.04]')
    })
  })

  describe('UTC-TT-002: Liquid Glass 主题令牌', () => {
    it('应该返回完整的液态玻璃类名令牌', () => {
      const { result } = renderHook(() => useThemeTokens(), {
        wrapper: createWrapper('liquidGlass'),
      })

      const tc = result.current

      expect(tc.isCyberpunk).toBe(false)
      expect(tc.isLiquidGlass).toBe(true)

      expect(tc.overlayBg).toBe('bg-black/60')
      expect(tc.modalBg).toBe('bg-white/[0.08]')
      expect(tc.modalBorder).toBe('border-white/[0.1]')
      expect(tc.modalShadow).toContain('rgba(0,0,0,0.15)')

      expect(tc.textPrimary).toBe('text-white/95')
      expect(tc.textSecondary).toBe('text-white/60')
      expect(tc.textTertiary).toBe('text-white/40')
      expect(tc.textMuted).toBe('text-white/25')

      expect(tc.accent).toBe('text-[#00ff87]')
      expect(tc.accentBg).toBe('bg-[#00ff87]/10')
      expect(tc.accentBorder).toBe('border-[#00ff87]/20')

      expect(tc.surfaceInset).toBe('bg-white/[0.04]')
      expect(tc.sectionBorder).toBe('border-white/[0.05]')

      expect(tc.hoverBg).toBe('hover:bg-white/[0.06]')
      expect(tc.activeBg).toBe('bg-[#00ff87]/[0.08]')
      expect(tc.activeTabText).toBe('text-[#00ff87]')
      expect(tc.badgeBg).toBe('bg-white/[0.06]')
    })
  })

  describe('UTC-TT-003: 令牌完整性', () => {
    it('两种主题都应包含全部 18 个令牌键', () => {
      const keys = [
        'overlayBg',
        'modalBg',
        'modalBorder',
        'modalShadow',
        'textPrimary',
        'textSecondary',
        'textTertiary',
        'textMuted',
        'accent',
        'accentBg',
        'accentBorder',
        'surfaceInset',
        'sectionBorder',
        'hoverBg',
        'activeBg',
        'activeTabText',
        'badgeBg',
      ] as const

      const { result: cyber } = renderHook(() => useThemeTokens(), {
        wrapper: createWrapper('cyberpunk'),
      })
      const { result: glass } = renderHook(() => useThemeTokens(), {
        wrapper: createWrapper('liquidGlass'),
      })

      keys.forEach((key) => {
        expect(typeof cyber.current[key], `cyberpunk.${key}`).toBe('string')
        expect(typeof glass.current[key], `liquidGlass.${key}`).toBe('string')
      })
    })
  })

  describe('UTC-TT-004: useMemo 稳定性', () => {
    it('同主题重渲染应返回同一引用', () => {
      const { result, rerender } = renderHook(() => useThemeTokens(), {
        wrapper: createWrapper('cyberpunk'),
      })

      const first = result.current
      rerender()
      expect(result.current).toBe(first)
    })

    it('两种主题令牌互不相同', () => {
      const { result: cyber } = renderHook(() => useThemeTokens(), {
        wrapper: createWrapper('cyberpunk'),
      })
      const { result: glass } = renderHook(() => useThemeTokens(), {
        wrapper: createWrapper('liquidGlass'),
      })

      expect(cyber.current.accent).not.toBe(glass.current.accent)
      expect(cyber.current.overlayBg).not.toBe(glass.current.overlayBg)
    })
  })
})
