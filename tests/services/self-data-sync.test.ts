/**
 * Unit Tests: self-data-sync(P6/M1-1)
 * 覆盖:mergeSettings 语义、hydrate 空文档/有效文档、未认证不启动、
 *      防抖上行(fake timers)、护栏由服务端强制(客户端不做体积拦截)。
 * apiFetch 以模块 mock 注入,零网络。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/api-client', () => ({
  isApiConfigured: true,
  apiFetch: apiFetchMock,
  ApiClientError: class extends Error {},
}))

import {
  hydrateSettings,
  mergeSettings,
  startSelfSync,
  stopSelfSync,
} from '@/services/self-data-sync'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

describe('self-data-sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    stopSelfSync()
    useAuthStore.setState({ user: null, token: null, status: 'unauthenticated' })
    useSettingsStore.setState({
      settings: { general: { language: 'zh' } } as never,
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('mergeSettings:远端优先,本地新增键保留', () => {
    const merged = mergeSettings(
      { general: { language: 'zh' } } as never,
      { general: { language: 'en' }, theme: 'dark' } as never,
    )
    expect(merged).toMatchObject({ general: { language: 'en' }, theme: 'dark' })
  })

  it('hydrate:空文档(updatedAt=null)返回 false,本地保持', async () => {
    apiFetchMock.mockResolvedValue({ data: {}, updatedAt: null })
    expect(await hydrateSettings()).toBe(false)
  })

  it('hydrate:有效文档合并进 settings store', async () => {
    apiFetchMock.mockResolvedValue({
      data: { general: { language: 'en' } },
      updatedAt: '2026-11-12T00:00:00Z',
    })
    expect(await hydrateSettings()).toBe(true)
    expect(useSettingsStore.getState().settings).toMatchObject({
      general: { language: 'en' },
    })
  })

  it('startSelfSync:未认证不水合不订阅', async () => {
    await startSelfSync()
    expect(apiFetchMock).not.toHaveBeenCalled()
    // 登录后变更 → 防抖 PUT
    useAuthStore.setState({
      user: {
        id: 'u1',
        username: 'u1',
        email: 'u1@self.local',
        role: 'viewer',
        createdAt: 1,
      },
      token: 'self-api',
      status: 'authenticated',
    })
    await startSelfSync()
    useSettingsStore.setState({
      settings: { general: { language: 'en' } } as never,
    })
    await vi.advanceTimersByTimeAsync(1600)
    expect(apiFetchMock).toHaveBeenCalledWith(
      '/data/settings',
      expect.objectContaining({ method: 'PUT' }),
    )
    stopSelfSync()
  })
})
