/**
 * Unit Tests: UserDataSync 挂载件(P3 数据面一期)
 *
 * A. 组件行为:
 *    - 未配置 Supabase 时零订阅、零副作用、渲染 null
 *    - SIGNED_IN → startSync(userId);SIGNED_OUT → stopSync
 *    - SIGNED_IN 但无 session.user 时不启动(防御)
 *    - 卸载 → 退订 + stopSync
 *
 * B. App 挂载回归守卫(F-01,2026-09-26 审计发现):
 *    历史缺陷——UserDataSync 已 import 但从未进入组件树,导致 Supabase
 *    激活后设置云同步静默失效。此处渲染整棵 App(重型叶子组件打桩),
 *    Supabase「已配置」时必须存在两个 auth 订阅者
 *    (AuthProvider + UserDataSync),且 SIGNED_IN 必须到达 startSync。
 */

import { act, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ReactNode } from 'react'

/* ------------------------------- 共享桩 ------------------------------- */

type AuthCallback = (event: string, session: unknown) => void

const h = vi.hoisted(() => {
  const callbacks: AuthCallback[] = []
  const unsubscribe = vi.fn()
  const onAuthStateChange = vi.fn((cb: AuthCallback) => {
    callbacks.push(cb)
    return { data: { subscription: { unsubscribe } } }
  })
  return {
    callbacks,
    /** 运行时可切:模拟 env 是否配置 VITE_SUPABASE_* */
    configured: true,
    unsubscribe,
    onAuthStateChange,
    getSession: vi.fn(
      async (): Promise<{ data: { session: unknown } }> => ({
        data: { session: null },
      }),
    ),
    startSync: vi.fn(async () => undefined),
    stopSync: vi.fn(),
  }
})

vi.mock('@/lib/supabase-client', () => ({
  get isSupabaseConfigured() {
    return h.configured
  },
  get supabase() {
    return h.configured
      ? { auth: { onAuthStateChange: h.onAuthStateChange, getSession: h.getSession } }
      : null
  },
}))

vi.mock('@/services/user-data-sync', () => ({
  startSync: h.startSync,
  stopSync: h.stopSync,
}))

/* --------------------- B. App 树重型叶子打桩(仅挂载守卫用) --------------------- */

vi.mock('@/app/components/cyberpunk-standalone', () => ({
  CyberpunkStandalone: () => <div data-testid="mock-standalone" />,
}))
vi.mock('@/app/components/cyberpunk-widget', () => ({
  CyberpunkWidget: () => null,
}))
vi.mock('@/app/components/liquid-glass-wrapper', () => ({
  LiquidGlassWrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('@/app/components/pwa-install', () => ({
  PWAInstallPrompt: () => null,
}))
vi.mock('@/features/customer/pages/contacts-context', () => ({
  ContactsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/ui')>()
  return { ...actual, Toaster: () => null }
})

import { UserDataSync } from '@/app/components/user-data-sync'

/* ------------------------------- 用例 ------------------------------- */

beforeEach(() => {
  h.configured = true
  h.callbacks.length = 0
  h.unsubscribe.mockClear()
  h.onAuthStateChange.mockClear()
  h.getSession.mockReset()
  h.getSession.mockResolvedValue({ data: { session: null } })
  h.startSync.mockClear()
  h.stopSync.mockClear()
})

describe('UserDataSync — 组件行为(认证事件→同步生命周期)', () => {
  it('未配置 Supabase:不建立订阅、不启动同步、渲染 null', () => {
    h.configured = false
    const { container } = render(<UserDataSync />)

    expect(h.onAuthStateChange).not.toHaveBeenCalled()
    expect(h.startSync).not.toHaveBeenCalled()
    expect(container).toBeEmptyDOMElement()
  })

  it('SIGNED_IN(带用户)→ startSync(userId);SIGNED_OUT → stopSync', () => {
    render(<UserDataSync />)
    expect(h.onAuthStateChange).toHaveBeenCalledTimes(1)

    h.callbacks[0]('SIGNED_IN', { user: { id: 'u-123' } })
    expect(h.startSync).toHaveBeenCalledWith('u-123')

    h.callbacks[0]('SIGNED_OUT', null)
    expect(h.stopSync).toHaveBeenCalled()
  })

  it('SIGNED_IN 但 session 无 user 时不启动同步(防御性分支)', () => {
    render(<UserDataSync />)
    h.callbacks[0]('SIGNED_IN', null)
    expect(h.startSync).not.toHaveBeenCalled()
  })

  it('卸载:退订 auth 订阅并 stopSync(幂等清理)', () => {
    const { unmount } = render(<UserDataSync />)
    expect(h.unsubscribe).not.toHaveBeenCalled()

    unmount()
    expect(h.unsubscribe).toHaveBeenCalledTimes(1)
    expect(h.stopSync).toHaveBeenCalledTimes(1)
  })
})

describe('UserDataSync — App 组件树挂载回归守卫(F-01)', () => {
  it('Supabase 已配置:App 渲染后存在两个 auth 订阅者,且 SIGNED_IN 到达 startSync', async () => {
    // getSession 返回有效会话 → AuthProvider 放行子树(否则停在登录页,
    // AppProvider/UserDataSync 永不挂载)
    h.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'tok',
          user: { id: 'u-app-1', email: 'a@b.cc', user_metadata: {}, app_metadata: {} },
        },
      },
    })

    const { default: App } = await import('@/app/App')
    const { unmount } = render(<App />)

    // AuthProvider 1 个 + UserDataSync 1 个;若挂载件再次遗失,只剩 1 个 → 用例失败
    await waitFor(() => expect(h.onAuthStateChange).toHaveBeenCalledTimes(2))

    // 两个订阅者都会收到事件;只有 UserDataSync 会调用 startSync
    await act(async () => {
      h.callbacks.forEach((cb) => cb('SIGNED_IN', { user: { id: 'u-app-1' } }))
      await Promise.resolve()
    })
    expect(h.startSync).toHaveBeenCalledWith('u-app-1')

    unmount()
    expect(h.stopSync).toHaveBeenCalled()
  })
})
