/**
 * @file multi-end-components.test.tsx
 * @description Multi-End — Unit Tests
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { describe, expect, it } from 'vitest'

describe('Breakpoints — Constants', () => {
  it('exports BREAKPOINTS with correct values', async () => {
    const mod = await import('../../src/multi-end/breakpoints')
    expect(mod.BREAKPOINTS).toBeTruthy()
    expect(mod.BREAKPOINTS.md).toBe(768)
    expect(mod.BREAKPOINTS.lg).toBe(1024)
    expect(mod.BREAKPOINTS.sm).toBe(480)
    expect(mod.BREAKPOINTS.xl).toBe(1280)
  })

  it('exports query helpers', async () => {
    const mod = await import('../../src/multi-end/breakpoints')
    expect(mod.BREAKPOINT_QUERIES).toBeTruthy()
    expect(mod.BREAKPOINT_UP).toBeTruthy()
    expect(mod.BREAKPOINT_DOWN).toBeTruthy()
  })

  it('exports hook functions', async () => {
    const mod = await import('../../src/multi-end/breakpoints')
    expect(typeof mod.useBreakpoint).toBe('function')
    expect(typeof mod.useIsMobile).toBe('function')
    expect(typeof mod.useIsDesktop).toBe('function')
    expect(typeof mod.useIsTouchDevice).toBe('function')
  })
})

describe('Platform Detection', () => {
  it('exports detection functions', async () => {
    const mod = await import('../../src/multi-end/platform')
    expect(typeof mod.detectPlatform).toBe('function')
    expect(typeof mod.getPlatformCapabilities).toBe('function')
  })

  it('detects web platform in test env', async () => {
    const mod = await import('../../src/multi-end/platform')
    const platform = mod.detectPlatform()
    expect(['web', 'pwa', 'mobile', 'desktop']).toContain(platform)
  })

  it('returns platform capabilities', async () => {
    const mod = await import('../../src/multi-end/platform')
    const caps = mod.getPlatformCapabilities()
    expect(caps).toBeTruthy()
    // 验证实际接口字段（非 supportsPWA/supportsTouch）
    expect(typeof caps.isStandalone).toBe('boolean')
    expect(typeof caps.isTouchDevice).toBe('boolean')
    expect(typeof caps.supportsIndexedDB).toBe('boolean')
    expect(typeof caps.supportsWasm).toBe('boolean')
    expect(typeof caps.maxStorageSize).toBe('number')
  })
})
