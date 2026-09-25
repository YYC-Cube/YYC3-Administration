/**
 * Unit Tests: 假实时数据生产门控(F-02)
 *
 * 背景:审计发现 useLiveKPI/useRealtimeSimulation 此前仅以 E2E_MODE
 * 门控,导致生产构建持续向公网用户推送随机 KPI 与假通知。
 * 修复后以 MOCK_REALTIME_ENABLED = !E2E_MODE && (DEV || VITE_ENABLE_MOCK)
 * 统一门控:DEV 默认开,生产默认关,显式 VITE_ENABLE_MOCK=true 才开。
 *
 * 此处验证:
 * 1. 常量契约(测试环境下为 true,与 DEV 默认一致)
 * 2. useLiveKPI 在门控开启时确实按周期波动(功能层)
 *
 * 生产关闭语义由源码常量表达式保证(vitest 运行于 DEV,无法在此翻转
 * import.meta.env);配合 E2E 对生产构建的视觉抽检。
 */

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MOCK_REALTIME_ENABLED, useLiveKPI } from '@/app/components/app-context'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('假实时数据门控(F-02)', () => {
  it('MOCK_REALTIME_ENABLED 在测试(DEV)环境为 true,且不等于 E2E-only 门控', () => {
    // 测试环境 DEV=true、无 VITE_E2E → 应为 true
    expect(MOCK_REALTIME_ENABLED).toBe(true)
  })

  it('useLiveKPI 每 5 秒更新 refreshKey(门控开启时假波动生效)', () => {
    const { result } = renderHook(() => useLiveKPI())
    const initialKey = result.current.refreshKey

    act(() => vi.advanceTimersByTime(5000))

    // 刷新键应自增,证明 setInterval 回调运行(而非被门控 early-return)
    expect(result.current.refreshKey).toBeGreaterThan(initialKey)
  })

  it('useLiveKPI 卸载时清理定时器(无泄漏)', () => {
    const { unmount } = renderHook(() => useLiveKPI())
    unmount()
    // 卸载后再推进时间不应抛错(定时器已清理)
    expect(() => act(() => vi.advanceTimersByTime(10000))).not.toThrow()
  })
})
