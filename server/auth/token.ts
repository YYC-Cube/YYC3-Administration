/**
 * @file server/auth/token.ts
 * @description YYC³ Administration 自托管后端 —— 会话令牌(P3/M1-0)
 *   JWT HS256(hono/jwt),载荷 { sub, role };密钥仅经 JWT_SECRET 环境变量
 *   注入(🔒 勿入库/勿入日志);令牌经 httpOnly Cookie 下发(见 routes),
 *   SameSite=Strict + CSRF Origin 校验共同缓解 CSRF(见 P3-AUTH.md)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,auth,jwt
 */

import { sign, verify } from 'hono/jwt'

export const SESSION_COOKIE = 'yyc3_session'
export const SESSION_TTL_SEC = 7 * 24 * 60 * 60

export interface SessionPayload {
  sub: string
  role: 'viewer' | 'agent' | 'manager' | 'admin'
  exp: number
  iat: number
}

function secret(): string {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) {
    throw new Error('[auth] JWT_SECRET 未配置或长度不足 32 —— 拒绝签发会话')
  }
  return s
}

export async function signSession(
  userId: string,
  role: SessionPayload['role'],
  ttlSec: number = SESSION_TTL_SEC,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  return sign({ sub: userId, role, iat: now, exp: now + ttlSec }, secret(), 'HS256')
}

/** 无效/过期/密钥不符一律返回 null,不抛出(路由层统一 401) */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const payload = (await verify(token, secret(), 'HS256')) as unknown as SessionPayload
    if (!payload.sub || !payload.role) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
