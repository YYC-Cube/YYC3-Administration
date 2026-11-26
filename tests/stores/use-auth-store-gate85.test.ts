/**
 * @file use-auth-store-gate85.test.ts
 * @description useAuthStore 补测(85×4 门禁冲刺)
 *   覆盖:会话过期/损坏 JSON 自愈、用户库损坏自愈、本地注册全部分支
 *   (重名/重邮箱/弱密码/首用户 admin)、API 模式注册/登出/checkSession、
 *   updateProfile(无用户/无 token/正常)、hasPermission/hasRole 空用户早退。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P1,testing,stores,auth,gate85
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiState = vi.hoisted(() => ({ configured: false, apiFetch: vi.fn() }))

vi.mock('@/services/api-client', () => ({
  get isApiConfigured() {
    return apiState.configured
  },
  get apiFetch() {
    return apiState.apiFetch
  },
}))

import { getSecure, removeSecure, setSecure } from '@/lib/secure-storage'
import { useAuthStore } from '@/stores/useAuthStore'

const SESSION_KEY = 'auth_session'
const USERS_KEY = 'auth_users'

function resetStore() {
  useAuthStore.setState({
    user: null,
    token: null,
    status: 'unauthenticated',
    login: useAuthStore.getState().login,
    register: useAuthStore.getState().register,
    logout: useAuthStore.getState().logout,
    checkSession: useAuthStore.getState().checkSession,
    updateProfile: useAuthStore.getState().updateProfile,
    hasPermission: useAuthStore.getState().hasPermission,
    hasRole: useAuthStore.getState().hasRole,
  })
}

beforeEach(async () => {
  apiState.configured = false
  apiState.apiFetch = vi.fn()
  localStorage.clear()
  sessionStorage.clear()
  resetStore()
})

describe('useAuthStore — 会话自愈(本地模式)', () => {
  it('过期会话:checkSession 丢弃会话进入未认证', async () => {
    await setSecure(SESSION_KEY, JSON.stringify({
      user: { id: 'u1', username: 'old', email: 'o@x.co', role: 'viewer', displayName: 'O', createdAt: 1 },
      token: 't-old',
      expiresAt: Date.now() - 1000,
    }))
    await useAuthStore.getState().checkSession()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
    // 会话已被清除
    expect(await getSecure(SESSION_KEY)).toBeNull()
  })

  it('有效会话:恢复认证态', async () => {
    await setSecure(SESSION_KEY, JSON.stringify({
      user: { id: 'u2', username: 'cur', email: 'c@x.co', role: 'admin', displayName: 'C', createdAt: 1 },
      token: 't-ok',
      expiresAt: Date.now() + 100000,
    }))
    await useAuthStore.getState().checkSession()
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.username).toBe('cur')
  })

  it('损坏会话 JSON:静默回落未认证', async () => {
    await setSecure(SESSION_KEY, 'not-json{{{')
    await useAuthStore.getState().checkSession()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('空存储:checkSession → 未认证(else 分支)', async () => {
    await removeSecure(SESSION_KEY)
    await useAuthStore.getState().checkSession()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })
})

describe('useAuthStore — 本地注册分支', () => {
  it('重名用户拒绝', async () => {
    const first = await useAuthStore.getState().register({
      username: 'dup',
      email: 'a@x.co',
      password: 'longenough1',
    })
    expect(first.success).toBe(true)
    useAuthStore.setState({ user: null, token: null, status: 'unauthenticated' })

    const second = await useAuthStore.getState().register({
      username: 'dup',
      email: 'other@x.co',
      password: 'longenough1',
    })
    expect(second.success).toBe(false)
    expect(second.error).toContain('用户名已存在')
  })

  it('邮箱重复拒绝', async () => {
    await useAuthStore.getState().register({
      username: 'u1',
      email: 'same@x.co',
      password: 'longenough1',
    })
    useAuthStore.setState({ user: null, token: null, status: 'unauthenticated' })
    const r = await useAuthStore.getState().register({
      username: 'u2',
      email: 'same@x.co',
      password: 'longenough1',
    })
    expect(r.success).toBe(false)
    expect(r.error).toContain('邮箱已被注册')
  })

  it('弱密码(<6 位)拒绝', async () => {
    const r = await useAuthStore.getState().register({
      username: 'weak',
      email: 'w@x.co',
      password: '123',
    })
    expect(r.success).toBe(false)
    expect(r.error).toContain('密码至少 6 位')
  })

  it('用户库损坏 JSON:自愈为空库后注册成功', async () => {
    await setSecure(USERS_KEY, 'broken-json[')
    const r = await useAuthStore.getState().register({
      username: 'heal',
      email: 'h@x.co',
      password: 'longenough1',
    })
    expect(r.success).toBe(true)
    // 损坏库视为空 → 首个用户即 admin
    expect(useAuthStore.getState().user?.role).toBe('admin')
  })

  it('第二个注册用户为 viewer,displayName 缺省取用户名', async () => {
    await useAuthStore.getState().register({
      username: 'first',
      email: 'f@x.co',
      password: 'longenough1',
    })
    useAuthStore.setState({ user: null, token: null, status: 'unauthenticated' })
    await useAuthStore.getState().register({
      username: 'second',
      email: 's@x.co',
      password: 'longenough1',
    })
    expect(useAuthStore.getState().user?.role).toBe('viewer')
    expect(useAuthStore.getState().user?.displayName).toBe('second')
  })

  it('displayName 显式传入生效', async () => {
    await useAuthStore.getState().register({
      username: 'named',
      email: 'n@x.co',
      password: 'longenough1',
      displayName: '自定义名',
    })
    expect(useAuthStore.getState().user?.displayName).toBe('自定义名')
  })
})

describe('useAuthStore — API 模式分支', () => {
  it('register 走 API:成功即认证', async () => {
    apiState.configured = true
    apiState.apiFetch.mockResolvedValueOnce({
      user: { id: 'srv_1', username: 'apiuser', displayName: 'API', role: 'member', createdAt: 1, email: 'a@x.co' },
    })
    const r = await useAuthStore.getState().register({
      username: 'apiuser',
      email: 'a@x.co',
      password: 'whatever',
    })
    expect(r.success).toBe(true)
    expect(apiState.apiFetch).toHaveBeenCalledWith('/auth/register', expect.anything())
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.username).toBe('apiuser')
  })

  it('register API 失败:返回 error 不抛出', async () => {
    apiState.configured = true
    apiState.apiFetch.mockRejectedValueOnce(new Error('username taken'))
    const r = await useAuthStore.getState().register({
      username: 'apiuser',
      email: 'a@x.co',
      password: 'whatever',
    })
    expect(r.success).toBe(false)
    expect(r.error).toBe('username taken')
  })

  it('register API 非 Error 异常:回落默认文案', async () => {
    apiState.configured = true
    apiState.apiFetch.mockRejectedValueOnce('boom')
    const r = await useAuthStore.getState().register({
      username: 'apiuser',
      email: 'a@x.co',
      password: 'whatever',
    })
    expect(r.success).toBe(false)
    expect(r.error).toBe('注册失败')
  })

  it('logout 走 API:清除本地态', async () => {
    apiState.configured = true
    apiState.apiFetch.mockResolvedValueOnce({})
    useAuthStore.setState({
      user: { id: 'x', username: 'x', email: 'x@x', role: 'admin', displayName: 'X', createdAt: 1 },
      token: 't',
      status: 'authenticated',
    })
    useAuthStore.getState().logout()
    await vi.waitFor(() => {
      expect(apiState.apiFetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
    })
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('checkSession 走 API:成功恢复会话', async () => {
    apiState.configured = true
    apiState.apiFetch.mockResolvedValueOnce({
      user: { id: 'srv_2', username: 'me', displayName: 'Me', role: 'admin', createdAt: 1, email: 'm@x.co' },
    })
    await useAuthStore.getState().checkSession()
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.username).toBe('me')
    expect(useAuthStore.getState().token).toBe('self-api')
  })

  it('checkSession API 失败:置为未认证', async () => {
    apiState.configured = true
    apiState.apiFetch.mockRejectedValueOnce(new Error('401'))
    await useAuthStore.getState().checkSession()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })
})

describe('useAuthStore — updateProfile 与权限', () => {
  it('无用户时 updateProfile 早退', async () => {
    await useAuthStore.getState().updateProfile({ displayName: 'ghost' })
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('有用户:合并部分更新并持久化会话', async () => {
    await useAuthStore.getState().register({
      username: 'prof',
      email: 'p@x.co',
      password: 'longenough1',
    })
    await useAuthStore.getState().updateProfile({ displayName: '新名字' })
    expect(useAuthStore.getState().user?.displayName).toBe('新名字')
    expect(useAuthStore.getState().user?.username).toBe('prof')
  })

  it('token 为 null 时跳过会话持久化', async () => {
    await useAuthStore.getState().register({
      username: 'notok',
      email: 'nt@x.co',
      password: 'longenough1',
    })
    useAuthStore.setState({ token: null })
    const before = await getSecure(SESSION_KEY)
    await useAuthStore.getState().updateProfile({ displayName: 'x2' })
    expect(await getSecure(SESSION_KEY)).toBe(before)
    expect(useAuthStore.getState().user?.displayName).toBe('x2')
  })

  it('hasPermission/hasRole:无用户恒 false,有用户按角色判定', async () => {
    expect(useAuthStore.getState().hasPermission('settings:edit')).toBe(false)
    expect(useAuthStore.getState().hasRole('admin')).toBe(false)

    await useAuthStore.getState().register({
      username: 'adminer',
      email: 'ad@x.co',
      password: 'longenough1',
    })
    // 首个用户为 admin
    expect(useAuthStore.getState().hasRole('admin')).toBe(true)
    expect(useAuthStore.getState().hasRole('viewer')).toBe(false)
    expect(typeof useAuthStore.getState().hasPermission('settings:edit')).toBe('boolean')
  })
})
