/**
 * Unit Tests: 自托管后端认证(P3/M1-0)
 * 覆盖:argon2id 哈希往返、JWT 签发/校验/过期、滑动窗口限流、
 *      认证路由(register/login/logout/me)、CSRF Origin 守卫、
 *      角色门越权矩阵(viewer 访问 admin 资源必败)。
 * DB 层全部 mock(文件级 vi.mock),CI 无数据库可跑;活库矩阵演练在 P7。
 */

process.env.JWT_SECRET = 'unit-test-secret-0123456789abcdef0123456789abcdef'

import { createApp } from '@server/app'
import { hashPassword, verifyPassword } from '@server/auth/password'
import { createRateLimiter } from '@server/auth/rate-limit'
import { SESSION_TTL_SEC, signSession, verifySession } from '@server/auth/token'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const repoMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  findUserByUsername: vi.fn(),
  findUserById: vi.fn(),
}))

vi.mock('@server/db/repositories', () => repoMocks)
vi.mock('@server/db/client', () => ({
  db: {},
  pool: { end: vi.fn(), totalCount: 0, idleCount: 0 },
}))

import type { Hono } from 'hono'

// ==========================================
// password(argon2id)
// ==========================================

describe('password — argon2id', () => {
  it('hash 后 verify 通过;错密码不通过', async () => {
    const h = await hashPassword('correct-horse-42')
    expect(h.startsWith('$argon2')).toBe(true)
    expect(await verifyPassword(h, 'correct-horse-42')).toBe(true)
    expect(await verifyPassword(h, 'wrong-password')).toBe(false)
  })

  it('损坏的哈希串 verify 返回 false 而非抛出', async () => {
    expect(await verifyPassword('not-a-hash', 'anything')).toBe(false)
  })
})

// ==========================================
// token(JWT HS256)
// ==========================================

describe('token — signSession/verifySession', () => {
  it('签发-校验往返携带 sub/role', async () => {
    const t = await signSession('u-123', 'viewer')
    const p = await verifySession(t)
    expect(p?.sub).toBe('u-123')
    expect(p?.role).toBe('viewer')
    expect((p?.exp ?? 0) - (p?.iat ?? 0)).toBe(SESSION_TTL_SEC)
  })

  it('篡改的令牌返回 null', async () => {
    const t = await signSession('u-123', 'viewer')
    expect(await verifySession(t.slice(0, -2) + 'xx')).toBeNull()
  })

  it('过期令牌返回 null(ttl=-1)', async () => {
    const t = await signSession('u-123', 'viewer', -1)
    expect(await verifySession(t)).toBeNull()
  })
})

// ==========================================
// rate-limit(滑动窗口)
// ==========================================

describe('rate-limit — 滑动窗口', () => {
  it('max=2:前两次放行,第三次拒绝并给 retryAfter', () => {
    const t = 1_000_000
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2, now: () => t })
    expect(limiter.check('k').allowed).toBe(true)
    expect(limiter.check('k').allowed).toBe(true)
    const third = limiter.check('k')
    expect(third.allowed).toBe(false)
    expect(third.retryAfterSec).toBeGreaterThan(0)
  })

  it('窗口滑出后恢复放行', () => {
    let t = 2_000_000
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1, now: () => t })
    expect(limiter.check('k').allowed).toBe(true)
    expect(limiter.check('k').allowed).toBe(false)
    t += 61_000
    expect(limiter.check('k').allowed).toBe(true)
  })
})

// ==========================================
// 路由(register/login/logout/me + CSRF + 角色门)
// ==========================================

const viewer = {
  id: '11111111-1111-4111-8111-111111111111',
  username: 'viewer1',
  displayName: null,
  role: 'viewer',
  passwordHash: '$argon2id$fake-viewer',
  createdAt: new Date('2026-01-01'),
}
const admin = {
  id: '22222222-2222-4222-8222-222222222222',
  username: 'admin1',
  displayName: 'Boss',
  role: 'admin',
  passwordHash: '$argon2id$fake-admin',
  createdAt: new Date('2026-01-01'),
}

describe('auth routes', () => {
  let app: Hono<{ Variables: { session: { sub: string; role: 'viewer' | 'admin' } } }>
  const ORIGIN = { origin: 'http://localhost', 'content-type': 'application/json' }

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp() as never
  })

  it('register:201 建号即建会话(secure cookie 属性)', async () => {
    repoMocks.findUserByUsername.mockResolvedValue([])
    repoMocks.createUser.mockResolvedValue({ ...viewer, username: 'newuser', role: 'viewer' })
    const res = await app.request('http://localhost/auth/register', {
      method: 'POST',
      headers: ORIGIN,
      body: JSON.stringify({ username: 'newuser', password: 'passw0rd-long' }),
    })
    expect(res.status).toBe(201)
    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toContain('yyc3_session=')
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('SameSite=Strict')
  })

  it('register:重复用户名 → 409', async () => {
    repoMocks.findUserByUsername.mockResolvedValue([viewer])
    const res = await app.request('http://localhost/auth/register', {
      method: 'POST',
      headers: ORIGIN,
      body: JSON.stringify({ username: 'viewer1', password: 'passw0rd-long' }),
    })
    expect(res.status).toBe(409)
  })

  it('login:成功 200 + Cookie;失败统一 401(防枚举)', async () => {
    repoMocks.findUserByUsername.mockResolvedValue([admin])
    const ok = await app.request('http://localhost/auth/login', {
      method: 'POST',
      headers: ORIGIN,
      body: JSON.stringify({ username: 'admin1', password: 'whatever-8+' }),
    })
    // 密码校验走真实 argon2:mock 的假哈希必失败 → 先验证假哈希场景为 401
    expect(ok.status).toBe(401)

    // 真实哈希场景:预生成真 argon2id 哈希
    repoMocks.findUserByUsername.mockImplementation(async (u: string) =>
      u === 'admin1' ? [{ ...admin, passwordHash: await hashPassword('s3cure-pass-99') }] : [],
    )
    const ok2 = await app.request('http://localhost/auth/login', {
      method: 'POST',
      headers: ORIGIN,
      body: JSON.stringify({ username: 'admin1', password: 's3cure-pass-99' }),
    })
    expect(ok2.status).toBe(200)
    expect((await ok2.json()).user.username).toBe('admin1')
  })

  it('CSRF:写请求缺 Origin/跨源 → 403(路由逻辑未被触达)', async () => {
    const noOrigin = await app.request('http://localhost/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin1', password: 's3cure-pass-99' }),
    })
    expect(noOrigin.status).toBe(403)
    const cross = await app.request('http://localhost/auth/login', {
      method: 'POST',
      headers: { ...ORIGIN, origin: 'http://evil.example' },
      body: JSON.stringify({ username: 'admin1', password: 's3cure-pass-99' }),
    })
    expect(cross.status).toBe(403)
    expect(repoMocks.findUserByUsername).not.toHaveBeenCalled()
  })

  it('me:无 Cookie 401;有效 Cookie 200 返回实时角色', async () => {
    const anon = await app.request('http://localhost/auth/me')
    expect(anon.status).toBe(401)

    const token = await signSession(admin.id, 'admin')
    repoMocks.findUserById.mockResolvedValue(admin)
    const res = await app.request('http://localhost/auth/me', {
      headers: { cookie: `yyc3_session=${token}` },
    })
    expect(res.status).toBe(200)
    expect((await res.json()).user.role).toBe('admin')
  })

  it('越权矩阵:viewer 访问 admin 资源 → 403;admin → 200', async () => {
    const viewerToken = await signSession(viewer.id, 'viewer')
    const forbidden = await app.request('http://localhost/admin/ping', {
      headers: { cookie: `yyc3_session=${viewerToken}` },
    })
    expect(forbidden.status).toBe(403)

    const adminToken = await signSession(admin.id, 'admin')
    const allowed = await app.request('http://localhost/admin/ping', {
      headers: { cookie: `yyc3_session=${adminToken}` },
    })
    expect(allowed.status).toBe(200)
    expect(await allowed.json()).toEqual({ pong: true })
  })

  it('logout:200 并清除 Cookie', async () => {
    const res = await app.request('http://localhost/auth/logout', {
      method: 'POST',
      headers: { origin: 'http://localhost' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie') ?? '').toContain('yyc3_session=;')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
})
