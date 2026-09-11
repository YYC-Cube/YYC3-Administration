/**
 * @file services/user-data-sync.ts
 * @description P3 数据面一期:用户设置云同步适配层(报告 11.3)
 *   业务无感:localStorage 读写经本层适配——Supabase 已配置且登录时,
 *   启动取远端覆盖本地(hydrate),此后本地变更防抖上行(upsert);
 *   未配置/未登录时完全不接管,零运行时影响。
 *   一期范围:useSettingsStore.settings;AI 模型密钥(加密存储)不迁移。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags p3,data,sync,supabase,rls
 */

import type { Settings } from '@/types/settings'

import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

// ==========================================
// 纯函数(可单测)
// ==========================================

/** 合并策略:远端整文档优先,本地新增键保留(远端为审核过的真相源) */
export function mergeSettings(local: Settings, remote: Partial<Settings>): Settings {
  return { ...local, ...remote }
}

/** 序列化为 user_settings.data(剔除运行时字段;体积护栏 256KB 对齐 DB 约束) */
export function settingsToPayload(settings: Settings): { data: Record<string, unknown> } {
  return { data: JSON.parse(JSON.stringify(settings)) as Record<string, unknown> }
}

/** 反序列化(远端 data → Settings;损坏时返回 null 由调用方保留本地) */
export function payloadToSettings(raw: unknown): Partial<Settings> | null {
  if (!raw || typeof raw !== 'object') return null
  try {
    return raw as Partial<Settings>
  } catch {
    return null
  }
}

// ==========================================
// 同步生命周期
// ==========================================

const PUSH_DEBOUNCE_MS = 1500
const SIZE_LIMIT_BYTES = 262144 // 与迁移 SQL settings_size_limit 对齐

let unsubStore: (() => void) | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null
let hydrating = false

/** 同步是否实际生效(需 env 配置且已认证) */
export function isSyncActive(): boolean {
  return (
    isSupabaseConfigured &&
    supabase !== null &&
    useAuthStore.getState().status === 'authenticated' &&
    !!useAuthStore.getState().user
  )
}

/** 登录后水合:远端设置 → 本地 store(成功后本地为远端镜像) */
export async function hydrateSettings(userId: string): Promise<boolean> {
  if (!supabase) return false
  const { data, error } = await supabase
    .from('user_settings')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[user-data-sync] hydrate 失败,保留本地设置:', error.message)
    return false
  }
  if (!data?.data) return false // 首次登录无云端文档,本地即为初始真相
  const remote = payloadToSettings(data.data)
  if (!remote) return false
  hydrating = true
  try {
    const local = useSettingsStore.getState().settings
    useSettingsStore.setState({ settings: mergeSettings(local, remote) })
    return true
  } finally {
    hydrating = false
  }
}

/** 防抖上行:本地 settings → 远端 upsert(RLS 属主约束) */
function schedulePush(userId: string): void {
  if (!supabase || hydrating) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void (async () => {
      const { data: payload } = settingsToPayload(useSettingsStore.getState().settings)
      const size = JSON.stringify(payload).length
      if (size >= SIZE_LIMIT_BYTES) {
        console.warn('[user-data-sync] 文档超 256KB,跳过上行(需拆分领域)')
        return
      }
      const { error } = await supabase!.from('user_settings').upsert({
        user_id: userId,
        data: payload,
      })
      if (error) console.warn('[user-data-sync] 上行失败(将在下次变更重试):', error.message)
    })()
  }, PUSH_DEBOUNCE_MS)
}

/** 登录成功后启动同步(水合 + 订阅本地变更) */
export async function startSync(userId: string): Promise<void> {
  if (!isSyncActive() || unsubStore) return
  await hydrateSettings(userId)
  unsubStore = useSettingsStore.subscribe((state) => {
    schedulePush(userId)
  })
}

/** 登出停止:解订阅并放弃未上行变更(下次登录以云端为准) */
export function stopSync(): void {
  unsubStore?.()
  unsubStore = null
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = null
}
