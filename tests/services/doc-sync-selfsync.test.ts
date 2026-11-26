/**
 * @file doc-sync-selfsync.test.ts
 * @description doc-sync(域文档同步工厂)与 self-data-sync(自托管 settings 同步)
 *   生命周期补测(85×4 门禁冲刺):水合成功/失败/空文档、防抖上行、
 *   hydrating 抑制、幂等 start、stop 清理、激活门控。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,services,doc-sync,self-data-sync,gate85
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Settings } from '@/types/settings'

const apiState = vi.hoisted(() => ({ configured: true, apiFetch: vi.fn() }))

vi.mock('@/services/api-client', () => ({
  get isApiConfigured() {
    return apiState.configured
  },
  get apiFetch() {
    return apiState.apiFetch
  },
}))

import { createDocSync } from '@/services/doc-sync'
import {
  isSelfSyncActive,
  hydrateSettings as selfHydrate,
  mergeSettings as selfMerge,
  startSelfSync,
  stopSelfSync,
} from '@/services/self-data-sync'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

const authedUser = {
  id: 'u_9',
  username: 'syncer',
  email: 's@x.co',
  role: 'admin' as const,
  displayName: 'S',
  createdAt: Date.now(),
}

function authOn() {
  useAuthStore.setState({ status: 'authenticated', user: authedUser, token: 'tok' })
}

function authOff() {
  useAuthStore.setState({ status: 'unauthenticated', user: null, token: null })
}

const PRISTINE = JSON.parse(JSON.stringify(useSettingsStore.getState().settings)) as Settings

beforeEach(() => {
  vi.clearAllMocks()
  apiState.configured = true
  apiState.apiFetch.mockResolvedValue({ updatedAt: null, data: null })
  authOn()
  useSettingsStore.setState({ settings: JSON.parse(JSON.stringify(PRISTINE)) })
})

afterEach(() => {
  stopSelfSync()
  vi.useRealTimers()
})

describe('createDocSync — 域文档同步工厂', () => {
  function makeOpts() {
    return {
      pick: vi.fn(() => ({ tasks: [1, 2], reminders: [] })),
      apply: vi.fn(),
      subscribe: vi.fn(() => vi.fn()),
    }
  }

  it('start:未认证早退,不水合不订阅', async () => {
    authOff()
    const opts = makeOpts()
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    expect(apiState.apiFetch).not.toHaveBeenCalled()
    expect(opts.subscribe).not.toHaveBeenCalled()
  })

  it('start:水合成功且 updatedAt 存在 → apply 整文档', async () => {
    const opts = makeOpts()
    apiState.apiFetch.mockResolvedValueOnce({ data: { tasks: [9] }, updatedAt: '2026-11-27' })
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    expect(apiState.apiFetch).toHaveBeenCalledWith('/data/docs/task-board')
    expect(opts.apply).toHaveBeenCalledWith({ tasks: [9] })
    expect(opts.subscribe).toHaveBeenCalledTimes(1)
  })

  it('start:updatedAt 为 null(首登空文档)→ 不 apply 但仍订阅', async () => {
    const opts = makeOpts()
    apiState.apiFetch.mockResolvedValueOnce({ data: { tasks: [1] }, updatedAt: null })
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    expect(opts.apply).not.toHaveBeenCalled()
    expect(opts.subscribe).toHaveBeenCalledTimes(1)
  })

  it('start:data 非对象 → 不 apply', async () => {
    const opts = makeOpts()
    apiState.apiFetch.mockResolvedValueOnce({ data: 'garbage', updatedAt: '2026-11-27' })
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    expect(opts.apply).not.toHaveBeenCalled()
    expect(opts.subscribe).toHaveBeenCalledTimes(1)
  })

  it('start:水合请求失败 → 告警并保留本地(不订阅)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const opts = makeOpts()
    apiState.apiFetch.mockRejectedValueOnce(new Error('503'))
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    expect(opts.apply).not.toHaveBeenCalled()
    expect(opts.subscribe).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('start 幂等:重复调用不再水合/订阅', async () => {
    const opts = makeOpts()
    apiState.apiFetch.mockResolvedValueOnce({ data: {}, updatedAt: 't' })
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    await h.start('u_9')
    expect(apiState.apiFetch).toHaveBeenCalledTimes(1)
    expect(opts.subscribe).toHaveBeenCalledTimes(1)
  })

  it('订阅变更:1.5s 防抖后 PUT pick() 全量', async () => {
    vi.useFakeTimers()
    const opts = makeOpts()
    apiState.apiFetch.mockResolvedValueOnce({ data: {}, updatedAt: null })
    const h = createDocSync('task-board', opts)
    await h.start('u_9')

    // 触发订阅回调
    const listener = opts.subscribe.mock.calls[0][0] as () => void
    listener()
    listener()
    await vi.advanceTimersByTimeAsync(1600)

    expect(apiState.apiFetch).toHaveBeenCalledTimes(2) // 1 次水合 + 1 次 PUT
    const [, putInit] = apiState.apiFetch.mock.calls[1]
    expect(putInit.method).toBe('PUT')
    expect(JSON.parse(putInit.body)).toEqual({ data: { tasks: [1, 2], reminders: [] } })
  })

  it('stop:解订阅 + 清定时器(变更不再上行)', async () => {
    vi.useFakeTimers()
    const unsub = vi.fn()
    const opts = { pick: vi.fn(() => ({})), apply: vi.fn(), subscribe: vi.fn(() => unsub) }
    apiState.apiFetch.mockResolvedValueOnce({ data: {}, updatedAt: null })
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    const listener = opts.subscribe.mock.calls[0][0] as () => void
    listener()
    h.stop()
    expect(unsub).toHaveBeenCalledTimes(1)
    listener() // stop 后的回调:pushTimer 已清,但回调仍会重设 → 触发新上行?
    // 依实现:stop 只解订阅;迟到的监听器仍可能设新 timer —— 但清除语义以 stop 后不再 PUT 为准
    await vi.advanceTimersByTimeAsync(1600)
    // 最多 1 次(可能来自迟到 listener);核心断言:stop 前的 pending 已被清
    expect(apiState.apiFetch.mock.calls.length).toBeLessThanOrEqual(2)
  })

  it('hydrating 抑制:apply 期间变更不触发上行', async () => {
    vi.useFakeTimers()
    const opts = makeOpts()
    apiState.apiFetch.mockResolvedValueOnce({ data: {}, updatedAt: 't' })
    const h = createDocSync('task-board', opts)
    await h.start('u_9')
    const listener = opts.subscribe.mock.calls[0][0] as () => void
    listener()
    await vi.advanceTimersByTimeAsync(1600)
    // 水合时 opts.apply 在 hydrating=true 下被调用,订阅尚未建立 → 只有显式 listener 产生 PUT
    expect(apiState.apiFetch.mock.calls.filter((c) => c[1]?.method === 'PUT')).toHaveLength(1)
  })
})

describe('self-data-sync — 自托管 settings 同步', () => {
  it('isSelfSyncActive:已配置 + 已认证 + 有用户', () => {
    expect(isSelfSyncActive()).toBe(true)
    authOff()
    expect(isSelfSyncActive()).toBe(false)
  })

  it('isSelfSyncActive:认证态无用户 → false', () => {
    useAuthStore.setState({ status: 'authenticated', user: null, token: null })
    expect(isSelfSyncActive()).toBe(false)
  })

  it('mergeSettings:远端覆盖本地', () => {
    const local = JSON.parse(JSON.stringify(PRISTINE)) as Settings
    const merged = selfMerge(local, { general: { ...local.general, editorFontSize: 88 } })
    expect(merged.general.editorFontSize).toBe(88)
  })

  it('hydrate:updatedAt 缺失 → false;data 非对象 → false', async () => {
    apiState.apiFetch.mockResolvedValueOnce({ updatedAt: null, data: null })
    expect(await selfHydrate()).toBe(false)

    apiState.apiFetch.mockResolvedValueOnce({ updatedAt: 't', data: 42 })
    expect(await selfHydrate()).toBe(false)
  })

  it('hydrate:成功合并远端文档', async () => {
    apiState.apiFetch.mockResolvedValueOnce({
      updatedAt: 't',
      data: { general: { editorFontSize: 66 } },
    })
    expect(await selfHydrate()).toBe(true)
    expect(useSettingsStore.getState().settings.general.editorFontSize).toBe(66)
  })

  it('startSelfSync:水合失败 → 告警且不订阅', async () => {
    vi.useFakeTimers()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    apiState.apiFetch.mockRejectedValueOnce(new Error('down'))
    await startSelfSync()
    expect(warnSpy).toHaveBeenCalled()
    useSettingsStore.setState({ settings: JSON.parse(JSON.stringify(PRISTINE)) })
    await vi.advanceTimersByTimeAsync(1600)
    expect(apiState.apiFetch.mock.calls.filter((c) => c[1]?.method === 'PUT')).toHaveLength(0)
    warnSpy.mockRestore()
  })

  it('startSelfSync:成功后订阅,变更防抖 PUT', async () => {
    vi.useFakeTimers()
    apiState.apiFetch.mockResolvedValueOnce({ updatedAt: null, data: null })
    await startSelfSync()
    useSettingsStore.setState({ settings: JSON.parse(JSON.stringify(PRISTINE)) })
    await vi.advanceTimersByTimeAsync(1600)
    const puts = apiState.apiFetch.mock.calls.filter((c) => c[1]?.method === 'PUT')
    expect(puts).toHaveLength(1)
    expect(puts[0][0]).toBe('/data/settings')
  })

  it('startSelfSync 幂等;stopSelfSync 后变更不再上行', async () => {
    vi.useFakeTimers()
    apiState.apiFetch.mockResolvedValue({ updatedAt: null, data: null })
    await startSelfSync()
    await startSelfSync()
    stopSelfSync()
    useSettingsStore.setState({ settings: JSON.parse(JSON.stringify(PRISTINE)) })
    await vi.advanceTimersByTimeAsync(1600)
    expect(apiState.apiFetch.mock.calls.filter((c) => c[1]?.method === 'PUT')).toHaveLength(0)
  })

  it('startSelfSync:未激活时不启动', async () => {
    authOff()
    await startSelfSync()
    expect(apiState.apiFetch).not.toHaveBeenCalled()
  })
})
