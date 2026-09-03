/**
 * Unit Tests: user-data-sync 适配层(P3 数据面一期)
 * 覆盖:未配置零影响、纯函数合并/序列化语义、同步生命周期门控
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { Settings } from '@/types/settings'

import {
  isSyncActive,
  mergeSettings,
  payloadToSettings,
  settingsToPayload,
  stopSync,
} from '@/services/user-data-sync'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

const baseSettings = (): Settings => useSettingsStore.getState().settings

describe('user-data-sync — 未配置零影响(env 门控)', () => {
  it('isSyncActive 在未配置 Supabase 时恒为 false', () => {
    // 测试环境无 VITE_SUPABASE_*,认证状态即便人为置真也不得激活
    useAuthStore.setState({
      status: 'authenticated',
      user: {
        id: 'u1',
        username: 't',
        email: 't@t.co',
        role: 'admin',
        displayName: 'T',
        createdAt: Date.now(),
      },
      token: 'tok',
    })
    expect(isSyncActive()).toBe(false)
  })
})

describe('user-data-sync — 纯函数语义', () => {
  it('mergeSettings:远端键覆盖本地,本地独有键保留', () => {
    const local = { ...baseSettings() }
    const remote = { general: { ...local.general, editorFontSize: 99 } }
    const merged = mergeSettings(local, remote)
    expect(merged.general.editorFontSize).toBe(99)
    // 本地独有键仍在
    expect(merged.agents).toBeDefined()
  })

  it('settingsToPayload/payloadToSettings 往返一致', () => {
    const s = baseSettings()
    const payload = settingsToPayload(s)
    const restored = payloadToSettings(payload.data)
    expect(restored).toEqual(s)
  })

  it('payloadToSettings:非对象输入返回 null(损坏容错)', () => {
    expect(payloadToSettings(null)).toBeNull()
    expect(payloadToSettings('x')).toBeNull()
    expect(payloadToSettings(42)).toBeNull()
  })
})

describe('user-data-sync — 生命周期', () => {
  beforeEach(() => stopSync())
  afterEach(() => stopSync())

  it('stopSync 幂等(重复调用不抛错)', () => {
    stopSync()
    stopSync()
    expect(true).toBe(true)
  })
})
