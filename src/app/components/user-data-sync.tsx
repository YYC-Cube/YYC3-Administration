/**
 * @file components/user-data-sync.tsx
 * @description P3 数据面一期挂载件:监听 Supabase 认证状态,
 *   登录→startSync(水合+订阅),登出→stopSync。
 *   未配置 Supabase 时返回 null,零订阅零副作用。
 *   置于 AuthProvider 内、AppProvider 之后(需同时访问两者状态)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags p3,data,sync,mount
 */

import { useEffect } from 'react'

import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import { startSync, stopSync } from '@/services/user-data-sync'

export function UserDataSync() {
  useEffect(() => {
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
