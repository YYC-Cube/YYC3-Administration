/**
 * @file services/self-data-sync.ts
 * @description YYC³ Administration —— 自托管后端 settings 云同步(P6/M1-1)
 *   镜像 user-data-sync(Supabase 版)生命周期:登录水合(GET /api/data/settings)
 *   + 本地变更防抖上行(PUT)。启用条件 VITE_API_MODE=true;API 模式优先于
 *   Supabase 适配层(二者互斥,由挂载件分流)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags p6,data,sync,self-hosted
 */

import { apiFetch, isApiConfigured } from './api-client'

import type { Settings } from '@/types/settings'
import type { SettingsDocument } from '@server/contract/settings'

import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

const PUSH_DEBOUNCE_MS = 1500

let unsubStore: (() => void) | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null
let hydrating = false

/** 合并策略与 Supabase 版一致:远端整文档优先,本地新增键保留 */
export function mergeSettings(local: Settings, remote: Partial<Settings>): Settings {
  return { ...local, ...remote }
}

export function isSelfSyncActive(): boolean {
  return (
    isApiConfigured &&
    useAuthStore.getState().status === 'authenticated' &&
    !!useAuthStore.getState().user
  )
}

/** 登录后水合:云端文档 → 本地 store(空文档时本地即初始真相) */
export async function hydrateSettings(): Promise<boolean> {
  const doc = await apiFetch<SettingsDocument>('/data/settings')
  if (!doc.updatedAt) return false
  if (!doc.data || typeof doc.data !== 'object') return false
  hydrating = true
  try {
    const local = useSettingsStore.getState().settings
    useSettingsStore.setState({ settings: mergeSettings(local, doc.data as Partial<Settings>) })
    return true
  } finally {
    hydrating = false
  }
}

function schedulePush(): void {
  if (hydrating) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void apiFetch<SettingsDocument>('/data/settings', {
      method: 'PUT',
      body: JSON.stringify({ data: useSettingsStore.getState().settings }),
    }).catch((error) => {
      console.warn('[self-data-sync] 上行失败(下次变更重试):', error)
    })
  }, PUSH_DEBOUNCE_MS)
}

/** 登录成功后启动(水合 + 订阅);失败静默回本地(下次登录重试) */
export async function startSelfSync(): Promise<void> {
  if (!isSelfSyncActive() || unsubStore) return
  try {
    await hydrateSettings()
  } catch (error) {
    console.warn('[self-data-sync] 水合失败,保留本地设置:', error)
    return
  }
  unsubStore = useSettingsStore.subscribe(() => {
    schedulePush()
  })
}

export function stopSelfSync(): void {
  unsubStore?.()
  unsubStore = null
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = null
}
