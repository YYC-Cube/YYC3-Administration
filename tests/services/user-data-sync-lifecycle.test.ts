/**
 * @file user-data-sync-lifecycle.test.ts
 * @description user-data-sync 服务生命周期补测(85×4 门禁冲刺)
 *   mock Supabase 链路,覆盖:hydrate 成功/失败/空文档/损坏文档、
 *   startSync 门控与订阅、防抖上行(1.5s)、256KB 体积护栏、stopSync。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,services,data-sync,supabase,gate85
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Settings } from '@/types/settings'

const upsertMock = vi.hoisted(() => vi.fn())
const maybeSingleResult = vi.hoisted(() => ({ current: { data: null as unknown, error: null as { message: string } | null } }))

vi.mock('@/lib/supabase-client', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => maybeSingleResult.current),
        })),
      })),
      upsert: upsertMock,
    })),
    upsert: upsertMock,
  },
}))

import {
  hydrateSettings,
  isSyncActive,
  payloadToSettings,
  startSync,
  stopSync,
} from '@/services/user-data-sync'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

const authedUser = {
  id: 'u_1',
  username: 't',
  email: 't@t.co',
  role: 'admin' as const,
  displayName: 'T',
  createdAt: Date.now(),
}

function authOn() {
  useAuthStore.setState({ status: 'authenticated', user: authedUser, token: 'tok' })
}

function authOff() {
  useAuthStore.setState({ status: 'unauthenticated', user: null, token: null })
}

// 模块加载时留存 pristine 快照,防止膨胀用例污染后续用例的分母
const PRISTINE_SETTINGS = JSON.parse(JSON.stringify(useSettingsStore.getState().settings)) as Settings

const baseSettings = (): Settings => JSON.parse(JSON.stringify(PRISTINE_SETTINGS))

beforeEach(() => {
  vi.clearAllMocks()
  upsertMock.mockResolvedValue({ error: null })
  stopSync()
  authOn()
  maybeSingleResult.current = { data: null, error: null }
  useSettingsStore.setState({ settings: baseSettings() })
})

afterEach(() => {
  stopSync()
  vi.useRealTimers()
})

describe('isSyncActive — 配置就绪时的门控', () => {
  it('已配置 + 已认证 + 有用户 → true', () => {
    expect(isSyncActive()).toBe(true)
  })

  it('未认证 → false', () => {
    authOff()
    expect(isSyncActive()).toBe(false)
  })

  it('认证态但无用户 → false', () => {
    useAuthStore.setState({ status: 'authenticated', user: null, token: null })
    expect(isSyncActive()).toBe(false)
  })
})

describe('hydrateSettings — 远端水合', () => {
  it('远端文档存在:合并覆盖本地并返回 true', async () => {
    const local = baseSettings()
    maybeSingleResult.current = {
      data: { data: { general: { ...local.general, editorFontSize: 42 } } },
      error: null,
    }
    const result = await hydrateSettings('u_1')
    expect(result).toBe(true)
    expect(useSettingsStore.getState().settings.general.editorFontSize).toBe(42)
  })

  it('查询出错:保留本地并返回 false', async () => {
    maybeSingleResult.current = { data: null, error: { message: 'rls denied' } }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await hydrateSettings('u_1')
    expect(result).toBe(false)
    expect(useSettingsStore.getState().settings).toEqual(baseSettings())
    warnSpy.mockRestore()
  })

  it('空文档(首次登录):返回 false,本地即真相', async () => {
    maybeSingleResult.current = { data: null, error: null }
    const result = await hydrateSettings('u_1')
    expect(result).toBe(false)
  })

  it('损坏文档(payloadToSettings null):返回 false', async () => {
    maybeSingleResult.current = { data: { data: 'not-an-object' }, error: null }
    const result = await hydrateSettings('u_1')
    expect(result).toBe(false)
  })
})

describe('startSync — 订阅与防抖上行', () => {
  it('启动后本地变更经 1.5s 防抖上行(upsert 携 user_id 与 data)', async () => {
    vi.useFakeTimers()
    await startSync('u_1')

    const settings = baseSettings()
    useSettingsStore.setState({ settings })

    await vi.advanceTimersByTimeAsync(1600)

    expect(upsertMock).toHaveBeenCalledTimes(1)
    const arg = upsertMock.mock.calls[0][0] as { user_id: string; data: Record<string, unknown> }
    expect(arg.user_id).toBe('u_1')
    expect(arg.data).toBeDefined()
  })

  it('频繁变更只触发一次上行(防抖合并)', async () => {
    vi.useFakeTimers()
    await startSync('u_1')
    const settings = baseSettings()
    useSettingsStore.setState({ settings })
    useSettingsStore.setState({ settings })
    useSettingsStore.setState({ settings })
    await vi.advanceTimersByTimeAsync(1600)
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it('超 256KB 文档跳过上行(体积护栏)', async () => {
    vi.useFakeTimers()
    await startSync('u_1')
    const bloated = baseSettings()
    ;(bloated as unknown as Record<string, unknown>).general = {
      ...(bloated.general ?? {}),
      junk: 'x'.repeat(300 * 1024),
    }
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    useSettingsStore.setState({ settings: bloated })
    await vi.advanceTimersByTimeAsync(1600)
    expect(upsertMock).not.toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('上行失败仅告警不抛出', async () => {
    vi.useFakeTimers()
    // 注:服务侧 void 化 IIFE 假设 upsert 不 reject(supabase-js 语义返回 {error});
    // 以 error 返回值模拟失败,避免制造 unhandled rejection
    upsertMock.mockResolvedValueOnce({ error: { message: 'network down' } })
    await startSync('u_1')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    useSettingsStore.setState({ settings: baseSettings() })
    await vi.advanceTimersByTimeAsync(1600)
    warnSpy.mockRestore()
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it('重复 startSync 幂等(已订阅则跳过)', async () => {
    vi.useFakeTimers()
    await startSync('u_1')
    await startSync('u_1')
    useSettingsStore.setState({ settings: baseSettings() })
    await vi.advanceTimersByTimeAsync(1600)
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })

  it('stopSync 后变更不再上行', async () => {
    vi.useFakeTimers()
    await startSync('u_1')
    stopSync()
    useSettingsStore.setState({ settings: baseSettings() })
    await vi.advanceTimersByTimeAsync(1600)
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('水合期间(hydrating)变更不触发上行', async () => {
    vi.useFakeTimers()
    // 文档在途 → startSync 内部 hydrate 先合并(订阅随后才建立)
    maybeSingleResult.current = { data: { data: { general: {} } }, error: null }
    await startSync('u_1')
    useSettingsStore.setState({ settings: baseSettings() })
    await vi.advanceTimersByTimeAsync(1600)
    // 水合引发的 setState 发生在订阅建立前,不应上行;显式变更应上行一次
    expect(upsertMock).toHaveBeenCalledTimes(1)
  })
})

describe('payloadToSettings — 防御语义', () => {
  it('null/原始类型返回 null', () => {
    expect(payloadToSettings(null)).toBeNull()
    expect(payloadToSettings(42)).toBeNull()
    expect(payloadToSettings('x')).toBeNull()
  })

  it('对象原样透传', () => {
    const doc = { general: { editorFontSize: 15 } }
    expect(payloadToSettings(doc)).toEqual(doc)
  })
})
