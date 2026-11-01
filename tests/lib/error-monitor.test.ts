/**
 * @file error-monitor.test.ts
 * @description YYC³ Error Monitoring — Unit Tests
 *   Covers: DSN 未配置惰性跳过 / 配置后正确初始化 / init 失败不抛出。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-02
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const sentryInit = vi.hoisted(() => vi.fn())

vi.mock('@sentry/browser', () => ({
  init: sentryInit,
}))

import { initErrorReporting } from '@/lib/error-monitor'

// ==========================================
// initErrorReporting
// ==========================================

describe('Error Monitor — initErrorReporting', () => {
  beforeEach(() => {
    vi.resetModules()
    sentryInit.mockClear()
    vi.unstubAllEnvs()
  })

  it('should stay inert when VITE_SENTRY_DSN is not configured', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '')
    const mod = await import('@/lib/error-monitor')
    await mod.initErrorReporting()
    expect(sentryInit).not.toHaveBeenCalled()
  })

  it('should init Sentry with release and environment when DSN is set', async () => {
    const fakeDsn = 'https://examplePublicKey@o0.ingest.sentry.io/0'
    vi.stubEnv('VITE_SENTRY_DSN', fakeDsn)
    const mod = await import('@/lib/error-monitor')
    await mod.initErrorReporting()
    expect(sentryInit).toHaveBeenCalledTimes(1)
    expect(sentryInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: fakeDsn,
        environment: expect.any(String),
      }),
    )
  })

  it('should swallow init errors so monitoring never breaks the app', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://examplePublicKey@o0.ingest.sentry.io/0')
    sentryInit.mockImplementationOnce(() => {
      throw new Error('boom')
    })
    const mod = await import('@/lib/error-monitor')
    await expect(mod.initErrorReporting()).resolves.toBeUndefined()
  })
})
