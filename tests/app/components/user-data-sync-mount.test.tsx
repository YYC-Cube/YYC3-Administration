/**
 * @file user-data-sync-mount.test.tsx
 * @description UserDataSync 挂载件测试(85×4 门禁冲刺)
 *   双模分流:自托管 API 模式(auth 状态启停 settings + task-board 域同步)
 *   与 Supabase 适配模式(onAuthStateChange 挂/卸)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,components,data-sync,gate85
 */

import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const modeState = vi.hoisted(() => ({
  apiMode: true,
  supabaseConfigured: false,
  supabase: null as unknown,
}))

vi.mock('@/services/api-client', () => ({
  get isApiConfigured() {
    return modeState.apiMode
  },
  apiFetch: vi.fn(),
}))

vi.mock('@/services/self-data-sync', () => ({
  startSelfSync: vi.fn(),
  stopSelfSync: vi.fn(),
}))

vi.mock('@/services/user-data-sync', () => ({
  startSync: vi.fn(),
  stopSync: vi.fn(),
}))

const docSyncHandles = vi.hoisted(() => ({
  last: null as null | { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> },
}))

vi.mock('@/services/doc-sync', () => ({
  createDocSync: vi.fn(() => {
    const handle = { start: vi.fn(), stop: vi.fn() }
    docSyncHandles.last = handle
    return handle
  }),
}))

let authHandler: ((event: string, session: unknown) => void) | null = null
let unsubAuth: ReturnType<typeof vi.fn>

vi.mock('@/lib/supabase-client', () => ({
  get isSupabaseConfigured() {
    return modeState.supabaseConfigured
  },
  get supabase() {
    return modeState.supabase
  },
}))

import { UserDataSync } from '@/app/components/user-data-sync'
import { useTaskStore } from '@/features/toolkit/pages/task-board-store'
import { createDocSync } from '@/services/doc-sync'
import { startSelfSync, stopSelfSync } from '@/services/self-data-sync'
import { startSync, stopSync } from '@/services/user-data-sync'
import { useAuthStore } from '@/stores/useAuthStore'

const authedUser = {
  id: 'u_42',
  username: 'tester',
  email: 't@t.co',
  role: 'admin' as const,
  displayName: 'T',
  createdAt: Date.now(),
}

function setAuth(status: 'authenticated' | 'unauthenticated', withUser = true) {
  useAuthStore.setState({
    status,
    user: status === 'authenticated' && withUser ? authedUser : null,
    token: status === 'authenticated' ? 'tok' : null,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  docSyncHandles.last = null
  authHandler = null
  unsubAuth = vi.fn()
  setAuth('unauthenticated')
})

afterEach(() => {
  cleanup()
  modeState.apiMode = true
  modeState.supabaseConfigured = false
  modeState.supabase = null
})

describe('UserDataSync — 自托管 API 模式', () => {
  it('已认证挂载:启动 self-sync 与 task-board 域同步', () => {
    setAuth('authenticated')
    render(<UserDataSync />)
    expect(startSelfSync).toHaveBeenCalled()
    expect(createDocSync).toHaveBeenCalledWith(
      'task-board',
      expect.objectContaining({ pick: expect.any(Function), subscribe: expect.any(Function), apply: expect.any(Function) }),
    )
    expect(docSyncHandles.last?.start).toHaveBeenCalledWith('u_42')
  })

  it('未认证挂载:零启动', () => {
    setAuth('unauthenticated')
    render(<UserDataSync />)
    expect(startSelfSync).not.toHaveBeenCalled()
    expect(docSyncHandles.last?.start).not.toHaveBeenCalled()
  })

  it('认证态含 user=null 的异常组合:视作未认证(prev 清空)', () => {
    setAuth('authenticated', false)
    render(<UserDataSync />)
    expect(startSelfSync).not.toHaveBeenCalled()
  })

  it('认证状态翻转:订阅触发停同步;卸载再清理', () => {
    setAuth('authenticated')
    const { unmount } = render(<UserDataSync />)
    expect(startSelfSync).toHaveBeenCalledTimes(1)

    // 登出 → store 订阅回调 → stop
    setAuth('unauthenticated')
    expect(stopSelfSync).toHaveBeenCalledTimes(1)
    expect(docSyncHandles.last?.stop).toHaveBeenCalledTimes(1)

    // 再次登录 → 重启
    setAuth('authenticated')
    expect(startSelfSync).toHaveBeenCalledTimes(2)
    expect(docSyncHandles.last?.start).toHaveBeenCalledTimes(2)

    // 同用户重复 check(prev 命中)不重复启动
    useAuthStore.setState({ status: 'authenticated', user: { ...authedUser } })
    expect(startSelfSync).toHaveBeenCalledTimes(2)

    unmount()
    expect(stopSelfSync).toHaveBeenCalledTimes(2)
    expect(docSyncHandles.last?.stop).toHaveBeenCalledTimes(2)
  })

  it('task-board 域 pick/apply 语义:tasks/reminders 整文档交换', () => {
    setAuth('authenticated')
    render(<UserDataSync />)
    const opts = (createDocSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
      pick: () => unknown
      apply: (doc: Record<string, unknown>) => void
      subscribe: (fn: () => void) => () => void
    }
    // 空 doc → 归零并置 _hydrated
    opts.apply({})
    expect(opts.pick()).toEqual({ tasks: [], reminders: [] })
    // 远端文档覆盖
    opts.apply({ tasks: [{ id: 't1' }], reminders: [{ id: 'r1' }] })
    expect(opts.pick()).toEqual({ tasks: [{ id: 't1' }], reminders: [{ id: 'r1' }] })
    // subscribe 直连 store 订阅
    const fn = vi.fn()
    const unsub = opts.subscribe(fn)
    useTaskStore.setState({ tasks: [{ id: 't2' }] })
    expect(fn).toHaveBeenCalled()
    unsub()
    useTaskStore.setState({ tasks: [] })
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('UserDataSync — Supabase 适配模式(未启用 API 模式)', () => {
  function installSupabase() {
    modeState.apiMode = false
    modeState.supabaseConfigured = true
    modeState.supabase = {
      auth: {
        onAuthStateChange: vi.fn((handler: (event: string, session: unknown) => void) => {
          authHandler = handler
          return { data: { subscription: { unsubscribe: unsubAuth } } }
        }),
      },
    }
  }

  it('SIGNED_IN 携 session → startSync(userId)', () => {
    installSupabase()
    render(<UserDataSync />)
    expect(authHandler).toBeTruthy()
    authHandler!('SIGNED_IN', { user: { id: 'u_sb' } })
    expect(startSync).toHaveBeenCalledWith('u_sb')
  })

  it('SIGNED_IN 无 session → 不启动', () => {
    installSupabase()
    render(<UserDataSync />)
    authHandler!('SIGNED_IN', null)
    expect(startSync).not.toHaveBeenCalled()
  })

  it('SIGNED_OUT → stopSync', () => {
    installSupabase()
    render(<UserDataSync />)
    authHandler!('SIGNED_OUT', null)
    expect(stopSync).toHaveBeenCalled()
  })

  it('其他事件类型忽略', () => {
    installSupabase()
    render(<UserDataSync />)
    authHandler!('TOKEN_REFRESHED', null)
    expect(startSync).not.toHaveBeenCalled()
    expect(stopSync).not.toHaveBeenCalled()
  })

  it('卸载:解订阅 + stopSync', () => {
    installSupabase()
    const { unmount } = render(<UserDataSync />)
    unmount()
    expect(unsubAuth).toHaveBeenCalled()
    expect(stopSync).toHaveBeenCalled()
  })

  it('Supabase 未配置且非 API 模式:完全无副作用', () => {
    modeState.apiMode = false
    modeState.supabaseConfigured = false
    render(<UserDataSync />)
    expect(startSync).not.toHaveBeenCalled()
    expect(stopSync).not.toHaveBeenCalled()
  })
})
