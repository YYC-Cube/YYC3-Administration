/**
 * @file server/auth/middleware.ts
 * @description YYC³ Administration 自托管后端 —— 认证/角色/CSRF 中间件(P3)
 *   - requireAuth:Cookie → verifySession → 挂载载荷;失败统一 401;
 *   - requireRole:角色白名单(越权 → 403,不区分"无权限/未登录"细节);
 *   - csrfOriginGuard:写方法强制 Origin 与 Host 同源(httpOnly+SameSite=Strict
 *     之外的纵深);Origin 缺失/不匹配/不可解析 → 403。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,auth,middleware
 */

import { getCookie } from 'hono/cookie'

import { SESSION_COOKIE, type SessionPayload, verifySession } from './token'

import type { Context, Next } from 'hono'

export type AuthedContext = Context<{ Variables: { session: SessionPayload } }>

export async function requireAuth(c: AuthedContext, next: Next) {
  const token = getCookie(c, SESSION_COOKIE)
  const payload = token ? await verifySession(token) : null
  if (!payload) {
    return c.json({ error: 'unauthorized', message: '会话缺失或无效' }, 401)
  }
  c.set('session', payload)
  await next()
}

export function requireRole(...roles: SessionPayload['role'][]) {
  return async (c: AuthedContext, next: Next) => {
    const session = c.get('session')
    if (!session || !roles.includes(session.role)) {
      return c.json({ error: 'forbidden', message: '角色权限不足' }, 403)
    }
    await next()
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function csrfOriginGuard(c: Context, next: Next) {
  if (MUTATING.has(c.req.method)) {
    const origin = c.req.header('origin')
    // host 优先取头;app.request 等测试构造可能缺 Host 头 → 回退请求 URL 自身
    const host = c.req.header('host') ?? (c.req.url ? new URL(c.req.url).host : undefined)
    let ok = false
    if (origin && host) {
      try {
        ok = new URL(origin).host === host
      } catch {
        ok = false
      }
    }
    if (!ok) {
      return c.json({ error: 'csrf_rejected', message: 'Origin 校验失败' }, 403)
    }
  }
  await next()
}
