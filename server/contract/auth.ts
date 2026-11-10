/**
 * @file server/contract/auth.ts
 * @description YYC³ Administration —— API 契约·认证域(P4/M1-0)
 *   服务端路由(server/auth/routes.ts)与前端(类型桥 src/types/auth.ts)
 *   同源消费;类型经 z.infer 派生,禁止手写漂移。
 *   线上时间统一 ISO-8601 字符串(JSON 序列化形态)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p4,contract,auth
 */

import { z } from 'zod'

export const RoleSchema = z.enum(['viewer', 'agent', 'manager', 'admin'])
export type Role = z.infer<typeof RoleSchema>

const usernameField = z
  .string()
  .trim()
  .transform((s) => s.toLowerCase())
  .pipe(
    z
      .string()
      .min(3)
      .max(32)
      .regex(/^[a-z0-9_-]+$/, '仅允许字母/数字/下划线/连字符'),
  )

/** 登录请求体(亦为注册的基础段) */
export const CredentialsSchema = z.object({
  username: usernameField,
  password: z.string().min(8).max(128),
})

export const RegisterRequestSchema = CredentialsSchema.extend({
  displayName: z.string().trim().min(1).max(64).optional(),
})

export type LoginRequest = z.infer<typeof CredentialsSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>

/** 服务端公开档案(wire 形态):永不含 password_hash/email 等私有列 */
export const AuthUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  role: RoleSchema,
  createdAt: z.string(),
})

export type AuthUser = z.infer<typeof AuthUserSchema>

/** login / register(201) / me 的统一成功信封 */
export const AuthResponseSchema = z.object({ user: AuthUserSchema })
export type AuthResponse = z.infer<typeof AuthResponseSchema>
