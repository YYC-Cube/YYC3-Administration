/**
 * @file server/auth/routes.ts
 * @description YYC³ Administration 自托管后端 —— 认证路由(P3/M1-0;P4 契约化)
 *   POST /auth/register(限流 3/h/ip,成功即建会话)
 *   POST /auth/login   (限流 5/min/ip:username,失败统一 401 防枚举)
 *   POST /auth/logout  (清 Cookie)
 *   GET  /auth/me      (requireAuth + DB 实时角色)
 * 请求校验/响应/错误信封全部消费 server/contract(P4 单一真源):
 *   CredentialsSchema/RegisterRequestSchema 校验请求;publicUser 产出契约
 *   AuthUser(ISO 时间);错误体 satisfies ApiError(编译期覆盖错误码表)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,p4,auth,routes,contract
 */

import { type AuthUser, CredentialsSchema, RegisterRequestSchema } from '@server/contract/auth'
import { type ApiError, toApiIssues } from '@server/contract/errors'
import { createUser, findUserById, findUserByUsername } from '@server/db/repositories'
import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'

import { type AuthedContext, requireAuth } from './middleware'
import { hashPassword, verifyPassword } from './password'
import { loginLimiter, registerLimiter } from './rate-limit'
import { SESSION_COOKIE, SESSION_TTL_SEC, type SessionPayload, signSession } from './token'

function clientIp(c: { req: { header: (k: string) => string | undefined } }): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
}

/** DB 行 → 契约 AuthUser(wire 形态:ISO 时间;永不含私有列) */
function publicUser(u: {
  id: string
  username: string
  displayName: string | null
  role: string
  createdAt: Date
}): AuthUser {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    role: u.role as AuthUser['role'],
    createdAt: u.createdAt.toISOString(),
  }
}

async function establishSession(c: AuthedContext, userId: string, role: SessionPayload['role']) {
  const token = await signSession(userId, role)
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  })
}

export const authRoutes = new Hono<{ Variables: { session: SessionPayload } }>()

authRoutes.post('/register', async (c) => {
  const limit = registerLimiter.check('reg:' + clientIp(c))
  if (!limit.allowed) {
    return c.json(
      {
        error: 'rate_limited',
        message: '注册过于频繁',
        retryAfterSec: limit.retryAfterSec,
      } satisfies ApiError,
      429,
    )
  }
  const parsed = RegisterRequestSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
      422,
    )
  }
  const existing = await findUserByUsername(parsed.data.username)
  if (existing[0]) {
    return c.json({ error: 'conflict', message: '用户名已被占用' } satisfies ApiError, 409)
  }
  const passwordHash = await hashPassword(parsed.data.password)
  const row = await createUser({
    username: parsed.data.username,
    passwordHash,
    displayName: parsed.data.displayName,
  })
  await establishSession(c, row.id, 'viewer')
  return c.json({ user: publicUser(row) }, 201)
})

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = CredentialsSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(
      { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
      422,
    )
  }
  const limit = loginLimiter.check('login:' + clientIp(c) + ':' + parsed.data.username)
  if (!limit.allowed) {
    return c.json(
      {
        error: 'rate_limited',
        message: '尝试过于频繁',
        retryAfterSec: limit.retryAfterSec,
      } satisfies ApiError,
      429,
    )
  }
  const rows = await findUserByUsername(parsed.data.username)
  const user = rows[0]
  const ok = user ? await verifyPassword(user.passwordHash, parsed.data.password) : false
  if (!user || !ok) {
    return c.json(
      { error: 'invalid_credentials', message: '用户名或密码错误' } satisfies ApiError,
      401,
    )
  }
  await establishSession(c, user.id, user.role as SessionPayload['role'])
  return c.json({ user: publicUser(user) })
})

authRoutes.post('/logout', async (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.json({ ok: true })
})

authRoutes.get('/me', requireAuth, async (c) => {
  const session = c.get('session')
  const user = await findUserById(session.sub)
  if (!user) {
    // 会话有效但用户已删除:清除失效 Cookie
    deleteCookie(c, SESSION_COOKIE, { path: '/' })
    return c.json({ error: 'unauthorized', message: '用户不存在' } satisfies ApiError, 401)
  }
  return c.json({ user: publicUser(user) })
})
