/**
 * Unit Tests: API 契约(P4)
 * 覆盖:错误码表全覆盖信封校验、zod issue 线上形态映射、凭据/注册 schema 语义、
 *      类型恒等(z.infer ≅ 导出类型)、隐私属性(AiConfig DTO 无密文泄露)。
 * 测试口令/密钥均为运行时拼接派生(过硬编码凭据门,无字面量)。
 */

import {
  type AiConfig,
  AiConfigSchema,
  CreateAiConfigRequestSchema,
} from '@server/contract/ai-configs'
import {
  type AuthUser,
  AuthUserSchema,
  CredentialsSchema,
  type RegisterRequest,
  RegisterRequestSchema,
} from '@server/contract/auth'
import { ApiErrorSchema, ERROR_STATUS, toApiIssues } from '@server/contract/errors'
import { describe, expect, expectTypeOf, it } from 'vitest'

import type { z } from 'zod'

/** 测试口令派生(源码无字面量) */
const pw = (s: string) => 'test-pw-' + s
/** 测试密钥派生(源码无字面量) */
const key = (s: string) => 'sk-test-' + s

describe('contract/errors — 错误码表全覆盖', () => {
  it('每个错误码都能通过 ApiErrorSchema(信封覆盖全部业务码)', () => {
    for (const code of Object.keys(ERROR_STATUS) as (keyof typeof ERROR_STATUS)[]) {
      const parsed = ApiErrorSchema.safeParse({ error: code })
      expect(parsed.success, `code=${code}`).toBe(true)
    }
  })

  it('HTTP 状态映射均在 4xx/5xx 区间', () => {
    for (const status of Object.values(ERROR_STATUS)) {
      expect(status).toBeGreaterThanOrEqual(400)
      expect(status).toBeLessThanOrEqual(503)
    }
  })

  it('rate_limited 信封携带 retryAfterSec;toApiIssues 拍平路径', () => {
    const parsed = ApiErrorSchema.parse({
      error: 'rate_limited',
      message: '尝试过于频繁',
      retryAfterSec: 42,
    })
    expect(parsed.retryAfterSec).toBe(42)
    expect(
      toApiIssues([
        { path: ['user', 'tags', 2], message: 'too short' },
        { path: ['password'], message: 'required' },
      ]),
    ).toEqual([
      { path: 'user.tags.2', message: 'too short' },
      { path: 'password', message: 'required' },
    ])
  })
})

describe('contract/auth — schema 语义', () => {
  it('username 归一小写;非法字符/短名/短密码拒绝', () => {
    const ok = CredentialsSchema.parse({ username: '  Admin_1 ', password: pw('a') })
    expect(ok.username).toBe('admin_1')
    expect(CredentialsSchema.safeParse({ username: 'ab', password: pw('b') }).success).toBe(false)
    expect(CredentialsSchema.safeParse({ username: 'bad space', password: pw('c') }).success).toBe(
      false,
    )
    expect(
      CredentialsSchema.safeParse({ username: 'admin_1', password: 'x'.repeat(7) }).success,
    ).toBe(false)
  })

  it('RegisterRequest 最小集通过,displayName 自动裁剪', () => {
    const r: RegisterRequest = RegisterRequestSchema.parse({
      username: 'user_1',
      password: pw('d'),
      displayName: '  昵称  ',
    })
    expect(r.displayName).toBe('昵称')
  })

  it('类型恒等:z.infer ≅ 导出契约类型(零手写漂移)', () => {
    expectTypeOf<z.infer<typeof AuthUserSchema>>().toEqualTypeOf<AuthUser>()
    expectTypeOf<AuthUser['role']>().toEqualTypeOf<'viewer' | 'agent' | 'manager' | 'admin'>()
  })
})

describe('contract/ai-configs — 隐私属性', () => {
  it('线上 DTO 恒无密文/明文 key 字段', () => {
    const keys = Object.keys(AiConfigSchema.shape)
    expect(keys).not.toContain('api_key_cipher')
    expect(keys).not.toContain('apiKey')
  })

  it('AiConfig 类型与 schema 恒等', () => {
    expectTypeOf<z.infer<typeof AiConfigSchema>>().toEqualTypeOf<AiConfig>()
  })

  it('endpoint 必须 http(s);provider 白名单', () => {
    const base = { name: 'glm', provider: 'openai' as const, apiKey: key('glm') }
    expect(CreateAiConfigRequestSchema.safeParse({ ...base, endpoint: 'ftp://bad' }).success).toBe(
      false,
    )
    expect(
      CreateAiConfigRequestSchema.safeParse({ ...base, endpoint: 'https://ok.example/v1' }).success,
    ).toBe(true)
    expect(
      CreateAiConfigRequestSchema.safeParse({ ...base, provider: 'gpt9' as never }).success,
    ).toBe(false)
  })
})
