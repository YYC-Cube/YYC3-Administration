/**
 * @file components/user-data-sync.tsx
 * @description 数据面同步挂载件(P6 双模分流):VITE_API_MODE=true →
 *   自托管同步(self-data-sync,生命周期跟随 useAuthStore 认证状态);
 *   否则 → Supabase 适配层(存量路径不变);二者均未配置 → 无副作用。
 *   置于 AuthProvider 内、AppProvider 之后。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags p3,p6,data,sync,mount
 */

import { useEffect } from 'react'

import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import { isApiConfigured } from '@/services/api-client'
import { startSelfSync, stopSelfSync } from '@/services/self-data-sync'
import { startSync, stopSync } from '@/services/user-data-sync'
import { useAuthStore } from '@/stores/useAuthStore'

export function UserDataSync() {
  useEffect(() => {
    // ── 自托管模式:跟随认证状态启停 ─────────────────────────────
    if (isApiConfigured) {
      let prev: string | null = null
      const check = () => {
        const { status, user } = useAuthStore.getState()
        const key = status === 'authenticated' && user ? user.id : null
        if (key && key !== prev) {
          prev = key
          void startSelfSync()
        } else if (!key && prev) {
          prev = null
          stopSelfSync()
        }
      }
      check()
      const unsub = useAuthStore.subscribe(check)
      return () => {
        unsub()
        stopSelfSync()
      }
    }

    if (!isSupabaseConfigured || !supabase) return

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        void startSync(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        stopSync()
      }
    })
    return () => {
      data.subscription.unsubscribe()
      stopSync()
    }
  }, [])

  return null
}
