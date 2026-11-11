/**
 * Unit Tests: api-client(P6)
 * 覆盖:isApiConfigured 门控、apiFetch 成功解析/错误信封抛出/非 JSON 兜底/
 *      credentials 语义。fetch 以 stub 全局替换,零网络。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchStub = vi.hoisted(() => vi.fn())

vi.stubGlobal('fetch', fetchStub)

import { ApiClientError, apiFetch, isApiConfigured } from '@/services/api-client'

describe('api-client — isApiConfigured 门控', () => {
  it('未设 VITE_API_MODE 时为 false(本地模式零破坏)', () => {
    expect(isApiConfigured).toBe(false)
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    fetchStub.mockReset()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('2xx → 解析 JSON 并携带 credentials', async () => {
    fetchStub.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const body = await apiFetch<{ ok: boolean }>('/data/settings')
    expect(body.ok).toBe(true)
    const [, init] = fetchStub.mock.calls[0]
    expect(init.credentials).toBe('include')
    expect(init.headers['content-type']).toBe('application/json')
  })

  it('非 2xx JSON 信封 → 抛 ApiClientError(status+body)', async () => {
    fetchStub.mockResolvedValue(
      new Response(JSON.stringify({ error: 'rate_limited', retryAfterSec: 30 }), {
        status: 429,
        headers: { 'content-type': 'application/json' },
      }),
    )
    try {
      await apiFetch('/auth/login', { method: 'POST' })
      expect.unreachable('应当抛出')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      expect((error as ApiClientError).status).toBe(429)
      expect((error as ApiClientError).body.error).toBe('rate_limited')
    }
  })

  it('非 JSON 错误体 → 兜底 internal_error 信封', async () => {
    fetchStub.mockResolvedValue(new Response('Internal Server Error', { status: 500 }))
    try {
      await apiFetch('/anything')
      expect.unreachable('应当抛出')
    } catch (error) {
      expect((error as ApiClientError).status).toBe(500)
      expect((error as ApiClientError).body.error).toBe('internal_error')
    }
  })

  it('VITE_API_MODE=true 时门控为 true(env stub 验证开关语义)', async () => {
    vi.stubEnv('VITE_API_MODE', 'true')
    vi.resetModules()
    const mod = await import('@/services/api-client')
    expect(mod.isApiConfigured).toBe(true)
  })
})
