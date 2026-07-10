/**
 * @file multi-end/breakpoints.ts
 * @description YYC³ 多端响应式断点系统 — 规范文档 v2.0.0 对齐
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @status stable
 * @tags multi-end,breakpoints,responsive,mobile
 */

import { useEffect, useState } from 'react'

// ==========================================
// 响应式断点定义（对齐规范文档第 4.3 节）
// ==========================================

/** 各断点最小宽度（px） */
export const BREAKPOINTS = {
  xs: 0, // xs: < 480（隐式下限为 0）
  sm: 480, // sm: >= 480
  md: 768, // md: >= 768
  lg: 1024, // lg: >= 1024
  xl: 1280, // xl: >= 1280
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/** 断点对应的 CSS media query 字符串 */
export const BREAKPOINT_QUERIES: Record<Breakpoint, string> = {
  xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
}

/** 向上匹配（>= 该断点） */
export const BREAKPOINT_UP: Record<Breakpoint, string> = {
  xs: `(min-width: 0px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
}

/** 向下匹配（<= 该断点） */
export const BREAKPOINT_DOWN: Record<Breakpoint, string> = {
  xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  md: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  lg: `(max-width: ${BREAKPOINTS.xl - 1}px)`,
  xl: `(max-width: ${BREAKPOINTS.xl - 1}px)`,
}

/**
 * 根据当前视口宽度返回对应的断点
 * 监听 window resize 事件，实时更新
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint())

  useEffect(() => {
    const handler = () => setBp(getBreakpoint())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return bp
}

function getBreakpoint(): Breakpoint {
  const w = window.innerWidth
  if (w >= BREAKPOINTS.xl) return 'xl'
  if (w >= BREAKPOINTS.lg) return 'lg'
  if (w >= BREAKPOINTS.md) return 'md'
  if (w >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

/**
 * 判断当前是否为移动端（< 768px）
 * 兼容原有 useIsMobile 语义
 */
export function useIsMobile(): boolean {
  const bp = useBreakpoint()
  return bp === 'xs' || bp === 'sm'
}

/**
 * 判断当前是否为平板端（768-1023px）
 */
export function useIsTablet(): boolean {
  return useBreakpoint() === 'md'
}

/**
 * 判断当前是否为桌面端（>= 1024px）
 */
export function useIsDesktop(): boolean {
  const bp = useBreakpoint()
  return bp === 'lg' || bp === 'xl'
}

/**
 * 判断当前是否为触控设备（移动端 + 平板）
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}
