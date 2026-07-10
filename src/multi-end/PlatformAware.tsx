/**
 * @file multi-end/PlatformAware.tsx
 * @description YYC³ 平台感知组件 — 根据运行平台条件渲染内容
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @status stable
 * @tags multi-end,platform-aware,conditional-render
 */

import { type ReactNode, useEffect, useState } from 'react'

import { type Breakpoint, useBreakpoint, useIsMobile } from './breakpoints'
import { detectPlatform, type Platform } from './platform'

// ==========================================
// PlatformAware — 按平台类型裁剪
// ==========================================

interface PlatformAwareProps {
  /** 允许渲染的平台列表 */
  platforms: Platform[]
  /** 其他平台显示的内容（默认隐藏） */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * 根据当前运行平台条件渲染组件
 *
 * @example
 * ```tsx
 * <PlatformAware platforms={['desktop', 'pwa']}>
 *   <RechartsMonitoringPanel />
 * </PlatformAware>
 * ```
 */
export function PlatformAware({ platforms, fallback = null, children }: PlatformAwareProps) {
  const [platform, setPlatform] = useState<Platform>('web')

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  if (!platforms.includes(platform)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ==========================================
// MobileOnly / DesktopOnly — 按设备类型裁剪
// ==========================================

interface DeviceAwareProps {
  fallback?: ReactNode
  children: ReactNode
}

/**
 * 仅在移动端（< 768px）渲染
 */
export function MobileOnly({ fallback = null, children }: DeviceAwareProps) {
  const isMobile = useIsMobile()
  return isMobile ? <>{children}</> : <>{fallback}</>
}

/**
 * 仅在桌面端（>= 1024px）渲染
 */
export function DesktopOnly({ fallback = null, children }: DeviceAwareProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isDesktop ? <>{children}</> : <>{fallback}</>
}

// ==========================================
// BreakpointAware — 按断点裁剪
// ==========================================

interface BreakpointAwareProps {
  /** 允许显示的断点列表 */
  breakpoints: Breakpoint[]
  fallback?: ReactNode
  children: ReactNode
}

/**
 * 根据当前断点条件渲染组件
 *
 * @example
 * ```tsx
 * <BreakpointAware breakpoints={['xs', 'sm']}>
 *   <MobileBottomNav />
 * </BreakpointAware>
 * ```
 */
export function BreakpointAware({ breakpoints, fallback = null, children }: BreakpointAwareProps) {
  const bp = useBreakpoint()

  if (!breakpoints.includes(bp)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}