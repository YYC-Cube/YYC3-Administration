/**
 * @file auth-context.supabase.test.tsx
 * @description AuthProvider / AuthPage 单元测试 — Supabase 已配置模式
 *   通过 vi.mock 替换 @/lib/supabase-client,覆盖真实后端会话分支。
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider, unifiedLogout } from '@/app/components/auth-context'
import { I18nProvider } from '@/app/components/i18n-context'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'
import { useAuthStore } from '@/stores/useAuthStore'

type AuthCallback = (event: string, session: unknown) => void

const h = vi.hoisted(() => {
  const callbacks: ((event: string, session: unknown) => void)[] = []
  return {
    callbacks,
    unsubscribe: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }
})

vi.mock('@/lib/supabase-client', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: h.getSession,
      onAuthStateChange: h.onAuthStateChange,
      signInWithPassword: h.signInWithPassword,
      signUp: h.signUp,
      signOut: h.signOut,
    },
  },
}))

function wrap(node: ReactNode) {
  return render(
    <ThemeSwitcherProvider defaultTheme="cyberpunk">
      <I18nProvider>{node}</I18nProvider>
    </ThemeSwitcherProvider>,
  )
}

function renderAuth(children: ReactNode = null) {
  return wrap(<AuthProvider>{children}</AuthProvider>)
}

function getForm(container: HTMLElement): HTMLFormElement {
  const form = container.querySelector('form')
  if (!form) throw new Error('form not found')
  return form as HTMLFormElement
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.setState({ user: null, token: null, status: 'unauthenticated' })

  h.callbacks.length = 0
  h.unsubscribe.mockClear()
  h.getSession.mockReset()
  h.getSession.mockResolvedValue({ data: { session: null } })
  h.onAuthStateChange.mockReset()
  h.onAuthStateChange.mockImplementation((cb: AuthCallback) => {
    h.callbacks.push(cb)
    return { data: { subscription: { unsubscribe: h.unsubscribe } } }
  })
  h.signInWithPassword.mockReset()
  h.signUp.mockReset()
  h.signOut.mockReset()
})

/* ---------------------- AuthProvider: Supabase 会话分支 ---------------------- */

describe('AuthProvider — Supabase 会话', () => {
  it('UTC-AC-SB-001 存在会话时映射为已认证用户', async () => {
    h.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'u1',
            email: 'alice@corp.io',
            user_metadata: { username: 'alice', display_name: 'Alice' },
            app_metadata: { role: 'manager' },
          },
          access_token: 'tok',
        },
      },
    })

    await act(async () => {
      renderAuth()
    })

    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.username).toBe('alice')
    expect(useAuthStore.getState().user?.displayName).toBe('Alice')
    expect(useAuthStore.getState().user?.role).toBe('manager')
    expect(useAuthStore.getState().token).toBe('tok')
  })

  it('UTC-AC-SB-002 无会话时回落未认证', async () => {
    renderAuth()
    await waitFor(() => expect(useAuthStore.getState().status).toBe('unauthenticated'))
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('UTC-AC-SB-003 onAuthStateChange 事件驱动状态切换', () => {
    renderAuth()

    const cb = h.callbacks[0]
    expect(cb).toBeTypeOf('function')

    act(() => {
      cb('SIGNED_IN', {
        user: { id: 'u9', email: 'z@z.z', user_metadata: {}, app_metadata: { role: 'viewer' } },
        access_token: 't9',
      })
    })
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().token).toBe('t9')

    act(() => {
      cb('SIGNED_OUT', null)
    })
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('UTC-AC-SB-004 卸载组件时退订', () => {
    const { unmount } = renderAuth()
    unmount()
    expect(h.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('UTC-AC-SB-005 mapSupabaseUser 缺失 metadata 时回退取值', async () => {
    h.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'u2', email: 'bob@x.io', user_metadata: null, app_metadata: null },
          access_token: 'tok2',
        },
      },
    })

    await act(async () => {
      renderAuth()
    })

    const user = useAuthStore.getState().user
    expect(user?.username).toBe('bob')
    expect(user?.displayName).toBe('bob@x.io')
    expect(user?.role).toBe('viewer')
  })

  it('UTC-AC-SB-006 mapSupabaseUser 缺失 email 时使用占位值', async () => {
    h.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'u3', email: null, user_metadata: {}, app_metadata: { role: 'admin' } },
          access_token: 'tok3',
        },
      },
    })

    await act(async () => {
      renderAuth()
    })

    const user = useAuthStore.getState().user
    expect(user?.username).toBe('user')
    expect(user?.displayName).toBe('User')
    expect(user?.role).toBe('admin')
  })
})

/* ---------------------- AuthPage: Supabase 登录 / 注册 ---------------------- */

describe('AuthPage — Supabase 认证流程', () => {
  it('UTC-AC-SB-007 登录失败时显示 Supabase 返回错误', async () => {
    h.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })
    const { container } = renderAuth()

    fireEvent.change(screen.getByPlaceholderText('admin 或 admin@yyc3.local'), {
      target: { value: 'alice' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } })
    fireEvent.submit(getForm(container))

    await waitFor(() => expect(screen.getByText('Invalid login credentials')).toBeInTheDocument())
    expect(h.signInWithPassword).toHaveBeenCalledWith({
      email: 'alice@users.yyc3',
      password: 'secret',
    })
  })

  it('UTC-AC-SB-008 登录成功不显示错误', async () => {
    h.signInWithPassword.mockResolvedValue({ error: null })
    const { container } = renderAuth()

    fireEvent.change(screen.getByPlaceholderText('admin 或 admin@yyc3.local'), {
      target: { value: 'alice' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } })
    fireEvent.submit(getForm(container))

    await waitFor(() => expect(h.signInWithPassword).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Invalid login credentials')).toBeNull()
  })

  it('UTC-AC-SB-009 注册调用 supabase.auth.signUp', async () => {
    h.signUp.mockResolvedValue({ error: null })
    const { container } = renderAuth()

    fireEvent.click(screen.getByRole('button', { name: '注册新账户' }))
    fireEvent.change(screen.getByPlaceholderText('您的显示名称'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'alice' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'alice@corp.io' },
    })
    fireEvent.change(screen.getByPlaceholderText('至少 6 位'), { target: { value: 'secret1' } })
    fireEvent.submit(getForm(container))

    await waitFor(() => expect(h.signUp).toHaveBeenCalledTimes(1))
    expect(h.signUp).toHaveBeenCalledWith({
      email: 'alice@corp.io',
      password: 'secret1',
      options: { data: { username: 'alice', display_name: 'Alice' } },
    })
  })
})

/* ---------------------- unifiedLogout: Supabase 分支 ---------------------- */

describe('unifiedLogout — Supabase 模式', () => {
  it('UTC-AC-SB-010 同时销毁 Supabase 会话并清理本地状态', async () => {
    h.signOut.mockResolvedValue({ error: null })
    useAuthStore.setState({
      status: 'authenticated',
      token: 'tok',
      user: {
        id: 'u1',
        username: 'alice',
        email: 'alice@corp.io',
        role: 'admin',
        displayName: 'Alice',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      },
    })

    await unifiedLogout()

    expect(h.signOut).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
  })
})
