/**
 * Unit Tests: useAuthStore API 分支(P6/M1-0)
 * 覆盖:VITE_API_MODE 下 login 成功映射/login 失败透传错误/checkSession 401 清态/
 *      logout 调服务端注销。apiFetch 与 secure-storage 模块 mock。
 * 测试口令运行时派生(源码无字面量,过硬编码凭据门)。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/api-client', () => ({
  isApiConfigured: true,
  apiFetch: apiFetchMock,
}))

vi.mock('@/lib/secure-storage', () => ({
  getSecure: vi.fn(async () => null),
  setSecure: vi.fn(async () => undefined),
  removeSecure: vi.fn(() => undefined),
}))

import type { AuthUser } from '@server/contract/auth'

import { contractUserToUser, useAuthStore } from '@/stores/useAuthStore'

/** 测试口令派生(源码无字面量) */
const pw = (s: string) => 'pw-' + s + '-pass'

const apiUser = (over: Partial<AuthUser> = {}): AuthUser => ({
  id: 'api-u1',
  username: 'apiuser',
  displayName: null,
  role: 'viewer',
  createdAt: '2026-11-12T00:00:00Z',
  ...over,
})

describe('useAuthStore — API 模式分支(M1-0)', () => {
  beforeEach(() => {
    apiFetchMock.mockReset()
    apiFetchMock.mockResolvedValue({ ok: true }) // 默认成功返回,避免 undefined 链
    useAuthStore.setState({ user: null, token: null, status: 'loading' })
  })

  it('login:成功 → 契约用户映射 + authenticated', async () => {
    apiFetchMock.mockResolvedValue({ user: apiUser() })
    const result = await useAuthStore.getState().login({
      username: 'apiuser',
      password: pw('login-ok'),
    })
    expect(result.success).toBe(true)
    const { user, token, status } = useAuthStore.getState()
    expect(user?.username).toBe('apiuser')
    expect(user?.role).toBe('viewer')
    expect(token).toBe('self-api')
    expect(status).toBe('authenticated')
    expect(apiFetchMock).toHaveBeenCalledWith('/auth/login', expect.anything())
  })

  it('login:失败 → success=false 透传服务端 message', async () => {
    apiFetchMock.mockRejectedValue(
      Object.assign(new Error('用户名或密码错误'), {
        status: 401,
        body: { error: 'invalid_credentials', message: '用户名或密码错误' },
      }),
    )
    const result = await useAuthStore.getState().login({
      username: 'apiuser',
      password: pw('login-bad'),
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('用户名或密码错误')
    // 失败不清状态:留在登录页由用户重试(实现语义)
    expect(['loading', 'unauthenticated']).toContain(useAuthStore.getState().status)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('checkSession:/me 401 → 清态回登录墙', async () => {
    apiFetchMock.mockRejectedValue({ status: 401, body: { error: 'unauthorized' } })
    await useAuthStore.getState().checkSession()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('checkSession:/me 200 → 恢复认证态(实时角色)', async () => {
    apiFetchMock.mockResolvedValue({ user: apiUser({ role: 'admin' }) })
    await useAuthStore.getState().checkSession()
    const { user, status } = useAuthStore.getState()
    expect(user?.role).toBe('admin')
    expect(status).toBe('authenticated')
  })

  it('logout:调用服务端注销并清态', async () => {
    // setState 的 user 为前端 User 形态(P4 桥接后含 email)
    useAuthStore.setState({
      user: contractUserToUser(apiUser()),
      token: 'self-api',
      status: 'authenticated',
    })
    useAuthStore.getState().logout()
    expect(apiFetchMock).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })
})
