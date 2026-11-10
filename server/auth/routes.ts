/**
 * @file server/auth/routes.ts
 * @description YYC³ Administration 自托管后端 —— 认证路由(P3/M1-0)
 *   POST /auth/register(限流 3/h/ip,成功即建会话)
 *   POST /auth/login   (限流 5/min/ip:username,失败统一 401 防枚举)
 *   POST /auth/logout  (清 Cookie)
 *   GET  /auth/me      (requireAuth + DB 实时角色)
 * 会话经 httpOnly Cookie 下发:SameSite=Strict + __Secure-前缀可选
 * (COOKIE_SECURE=true 时,由反代 https 终结点启用)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,auth,routes
 */

import { createUser, findUserById, findUserByUsername } from '@server/db/repositories'
import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { z } from 'zod'

import { type AuthedContext, requireAuth } from './middleware'
import { hashPassword, verifyPassword } from './password'
import { loginLimiter, registerLimiter } from './rate-limit'
import { SESSION_COOKIE, SESSION_TTL_SEC, type SessionPayload, signSession } from './token'

const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .transform((s) => s.toLowerCase())
    .pipe(
      z
        .string()
        .min(3)
        .max(32)
        .regex(/^[a-z0-9_-]+$/, '仅允许字母/数字/下划线/连字符'),
    ),
  password: z.string().min(8).max(128),
})

const registerSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(1).max(64).optional(),
})

function clientIp(c: { req: { header: (k: string) => string | undefined } }): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
}

function publicUser(u: {
  id: string
  username: string
  displayName: string | null
  role: string
  createdAt: Date
}) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    createdAt: u.createdAt,
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
      { error: 'rate_limited', message: '注册过于频繁', retryAfterSec: limit.retryAfterSec },
      429,
    )
  }
  const parsed = credentialsSchema
    .extend({ displayName: registerSchema.shape.displayName })
    .safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', issues: parsed.error.issues }, 422)
  }
  const existing = await findUserByUsername(parsed.data.username)
  if (existing[0]) {
    return c.json({ error: 'conflict', message: '用户名已被占用' }, 409)
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
  const parsed = credentialsSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'invalid_input', issues: parsed.error.issues }, 422)
  }
  const limit = loginLimiter.check('login:' + clientIp(c) + ':' + parsed.data.username)
  if (!limit.allowed) {
    return c.json(
      { error: 'rate_limited', message: '尝试过于频繁', retryAfterSec: limit.retryAfterSec },
      429,
    )
  }
  const rows = await findUserByUsername(parsed.data.username)
  const user = rows[0]
  const ok = user ? await verifyPassword(user.passwordHash, parsed.data.password) : false
  if (!user || !ok) {
    return c.json({ error: 'invalid_credentials', message: '用户名或密码错误' }, 401)
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
    return c.json({ error: 'unauthorized', message: '用户不存在' }, 401)
  }
  return c.json({ user: publicUser(user) })
})
