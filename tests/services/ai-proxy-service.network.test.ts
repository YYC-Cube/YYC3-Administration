/**
 * @file ai-proxy-service.network.test.ts
 * @description YYC³ AI Proxy Service — 网络路径单元测试(85×4 门禁冲刺)
 *   覆盖:代理通路(callViaProxy)、DEV 直连通路(callDirect)、生产阻断、
 *   响应缓存命中、限流等待、SSE 流式(openai/claude 双格式 + 容错)、
 *   统计空日志、请求签名。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P1,testing,services,ai-proxy,network,gate85
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AIProviderConfig, ChatMessage } from '@/services/ai-proxy-service'

const PROXY_URL = 'https://proxy.example.test/v1'

function mockConfig(overrides?: Partial<AIProviderConfig>): AIProviderConfig {
  return {
    provider: 'openai',
    apiKey: 'sk-test-key',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1024,
    ...overrides,
  }
}

function userMessage(content: string): ChatMessage {
  return { role: 'user', content }
}

/** JSON 响应桩 */
function jsonRes(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
    body: null,
  } as unknown as Response
}

/** SSE 流式响应桩(逐行入队,模拟 chunk 边界) */
function sseRes(lines: string[]): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) controller.enqueue(encoder.encode(line + '\n'))
      controller.close()
    },
  })
  return {
    ok: true,
    status: 200,
    text: async () => '',
    json: async () => ({}),
    body: stream,
  } as unknown as Response
}

/** 无 body 的 SSE 响应(res.body 为 null → streamUnavailable 分支) */
function noBodyRes(): Response {
  return { ok: true, status: 200, text: async () => '', json: async () => ({}), body: null } as unknown as Response
}

const fetchMock = vi.hoisted(() => vi.fn())

/** 恢复 import.meta.env(代理变量移除 + DEV 复位),规避 ASI 陷阱 */
function restoreEnv(): void {
  const env = import.meta.env as Record<string, unknown>
  delete env.VITE_AI_PROXY_URL
  env.DEV = true
}

/** 每组用例前:按 env 形态重建模块实例(PROXY_BASE_URL 在模块求值时捕获) */
async function freshModule(proxyUrl: string | undefined) {
  vi.resetModules()
  const env = import.meta.env as Record<string, unknown>
  if (proxyUrl === undefined) delete env.VITE_AI_PROXY_URL
  else env.VITE_AI_PROXY_URL = proxyUrl
  const mod = await import('@/services/ai-proxy-service')
  return mod
}

describe('AIProxyService — 代理通路(callViaProxy,VITE_AI_PROXY_URL 已配置)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    restoreEnv()
  })

  it('代理 happy path:POST 到 $PROXY/chat 且带 X-Request-Signature', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValueOnce(jsonRes({ content: '代理回答' }))

    const result = await aiProxyService.chat(mockConfig(), [userMessage('你好')])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${PROXY_URL}/chat`)
    expect(init.method).toBe('POST')
    expect(init.headers['X-Request-Signature']).toBeTruthy()
    expect(result.content).toBe('代理回答')
    expect(result.cached).toBe(false)
  })

  it('代理响应无 content 时回落 choices[0].message.content', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValueOnce(
      jsonRes({ choices: [{ message: { content: 'openai 形态响应' } }] }),
    )

    const result = await aiProxyService.chat(mockConfig(), [userMessage('hi')])
    expect(result.content).toBe('openai 形态响应')
  })

  it('代理响应两者皆缺时回落占位文案', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValueOnce(jsonRes({}))

    const result = await aiProxyService.chat(mockConfig(), [userMessage('hi')])
    expect(result.content).toBe('No response from proxy.')
  })

  it('代理 !ok:抛 Proxy Error(携带状态码与响应文本)', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValueOnce(jsonRes({ message: 'quota exceeded' }, false, 429))

    await expect(aiProxyService.chat(mockConfig(), [userMessage('hi')])).rejects.toThrow(
      /Proxy Error 429/,
    )
  })

  it('代理 !ok 且 res.text() 失败:回落 Unknown proxy error', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => {
        throw new Error('stream consumed')
      },
      json: async () => ({}),
      body: null,
    } as unknown as Response)

    await expect(aiProxyService.chat(mockConfig(), [userMessage('hi')])).rejects.toThrow(
      'Unknown proxy error',
    )
  })

  it('相同请求第二次命中缓存(cached=true,不再发 fetch)', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValue(jsonRes({ content: '缓存我' }))

    const first = await aiProxyService.chat(mockConfig(), [userMessage('same')])
    const second = await aiProxyService.chat(mockConfig(), [userMessage('same')])

    expect(first.cached).toBe(false)
    expect(second.cached).toBe(true)
    expect(second.content).toBe('缓存我')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    // 缓存命中计入统计
    const stats = aiProxyService.getStats()
    expect(stats.cacheHitRate).toBeGreaterThan(0)
  })

  it('clearCache 后同请求重新发起网络调用', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValue(jsonRes({ content: 'x' }))
    await aiProxyService.chat(mockConfig(), [userMessage('q')])
    aiProxyService.clearCache()
    await aiProxyService.chat(mockConfig(), [userMessage('q')])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('fileContext 注入代理请求(系统消息含文件块)', async () => {
    const { aiProxyService } = await freshModule(PROXY_URL)
    fetchMock.mockResolvedValueOnce(jsonRes({ content: 'ok' }))

    await aiProxyService.chat(mockConfig(), [userMessage('解释')], undefined, {
      filePath: '/src/a.ts',
      content: 'const a = 1',
    })

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    const sys = body.messages[0].content as string
    expect(sys).toContain('--- CURRENT OPEN FILE ---')
    expect(sys).toContain('/src/a.ts')
    expect(sys).toContain('const a = 1')
  })
})

describe('AIProxyService — DEV 直连通路(callDirect,无代理配置)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    restoreEnv()
  })

  it('openai 直连 happy path:Bearer 头 + choices 提取', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(
      jsonRes({ choices: [{ message: { content: '直连回答' } }] }),
    )

    const result = await aiProxyService.chat(mockConfig({ provider: 'openai' }), [
      userMessage('hi'),
    ])

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    expect(init.headers.Authorization).toBe('Bearer sk-test-key')
    expect(result.content).toBe('直连回答')
  })

  it('deepseek 直连走 deepseek 默认端点', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(jsonRes({ choices: [{ message: { content: 'ds' } }] }))

    const result = await aiProxyService.chat(
      mockConfig({ provider: 'deepseek', baseUrl: undefined }),
      [userMessage('hi')],
    )
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.deepseek.com/v1/chat/completions')
    expect(result.content).toBe('ds')
  })

  it('openai 直连自定义 baseUrl 生效', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(jsonRes({ choices: [{ message: { content: 'x' } }] }))

    await aiProxyService.chat(
      mockConfig({ provider: 'openai', baseUrl: 'https://relay.local/v1' }),
      [userMessage('hi')],
    )
    expect(fetchMock.mock.calls[0][0]).toBe('https://relay.local/v1/chat/completions')
  })

  it('openai 直连 choices 缺失回落 No response.', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(jsonRes({}))

    const result = await aiProxyService.chat(mockConfig({ provider: 'openai' }), [
      userMessage('hi'),
    ])
    expect(result.content).toBe('No response.')
  })

  it('openai 直连 !ok:抛错被捕获 → 返回 ⚠️ API Error 提示(不 reject)', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(jsonRes({ error: 'bad key' }, false, 401))

    const result = await aiProxyService.chat(mockConfig({ provider: 'openai' }), [
      userMessage('hi'),
    ])
    expect(result.content).toContain('⚠️ API Error')
    expect(result.content).toContain('401')
  })

  it('claude 直连 happy path:x-api-key 头 + content[0].text 提取', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(jsonRes({ content: [{ text: 'claude 回答' }] }))

    const result = await aiProxyService.chat(mockConfig({ provider: 'claude' }), [
      userMessage('hi'),
    ])

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers['x-api-key']).toBe('sk-test-key')
    expect(init.headers['anthropic-version']).toBe('2023-06-01')
    expect(result.content).toBe('claude 回答')
  })

  it('claude 直连 !ok:同样回落 ⚠️ API Error 提示', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, text: async () => '' } as unknown as Response)

    const result = await aiProxyService.chat(mockConfig({ provider: 'claude' }), [
      userMessage('hi'),
    ])
    expect(result.content).toContain('⚠️ API Error')
  })

  it('未知 provider 携 key 直连:回落首个 mock 键', async () => {
    const { aiProxyService } = await freshModule(undefined)
    const result = await aiProxyService.chat(
      mockConfig({ provider: 'mock', apiKey: 'sk-xyz', model: 'weird' }),
      [userMessage('hi')],
    )
    expect(result.content).toContain('aips.mock.')
  })

  it('网络异常(非 Abort):捕获并返回友好错误文案', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const result = await aiProxyService.chat(mockConfig({ provider: 'openai' }), [
      userMessage('hi'),
    ])
    expect(result.content).toContain('Failed to fetch')
  })

  it('非 Error 异常:回落 Connection failed 文案', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockRejectedValueOnce('boom-string')

    const result = await aiProxyService.chat(mockConfig({ provider: 'openai' }), [
      userMessage('hi'),
    ])
    expect(result.content).toContain('⚠️ API Error')
  })

  it('AbortError 原样上抛(不被吞成错误文案)', async () => {
    const { aiProxyService } = await freshModule(undefined)
    // 注:Node 的 DOMException 不继承 Error,与浏览器不同;服务侧判定
    // `err instanceof Error && err.name === 'AbortError'`,故用 Error+name 模拟
    const abortErr = new Error('The operation was aborted.')
    abortErr.name = 'AbortError'
    fetchMock.mockRejectedValueOnce(abortErr)

    await expect(
      aiProxyService.chat(mockConfig({ provider: 'openai' }), [userMessage('hi')]),
    ).rejects.toThrow(abortErr)
  })
})

describe('AIProxyService — 生产阻断(无代理 + 非 DEV)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    restoreEnv()
  })

  it('生产构建未配置代理:fail loudly,拒绝发送 key', async () => {
    const { aiProxyService } = await freshModule(undefined)
    ;(import.meta.env as Record<string, unknown>).DEV = false

    await expect(
      aiProxyService.chat(mockConfig(), [userMessage('hi')]),
    ).rejects.toThrow('AI 服务代理未配置')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('AIProxyService — 限流(token bucket 耗尽 → 等待后仍成功)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    restoreEnv()
  })

  it('连续 23 个带 key 请求耗尽桶:第 21+ 个等待但最终成功', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValue(jsonRes({ choices: [{ message: { content: 'r' } }] }))

    for (let i = 0; i < 23; i++) {
      const result = await aiProxyService.chat(
        mockConfig({ provider: 'openai' }),
        [userMessage(`burst-${i}`)], // 不同消息避免缓存命中
      )
      expect(result.content).toBe('r')
    }
    expect(fetchMock).toHaveBeenCalledTimes(23)
  }, 30000)
})

describe('AIProxyService — chatStream 网络流(openai/deepseek SSE)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    restoreEnv()
  })

  it('openai SSE happy path:跨 chunk buffer 拼接 + [DONE] + 空行 + 坏 JSON 跳过', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(
      sseRes([
        '', // 空行
        'data: {"choices":[{"delta":{"content":"Hel"}}]}',
        ': keep-alive 注释行',
        'data: [DONE]',
        'data: {"choices":[{"delta":{"content":"lo"}}]}', // [DONE] 后(实际服务端不会发,防御性)
        'data: {bad json',
      ]),
    )

    const tokens: string[] = []
    let lastDone = false
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')])) {
      if (chunk.token) tokens.push(chunk.token)
      if (chunk.done) lastDone = true
    }
    expect(tokens.join('')).toContain('Hel')
    expect(tokens.join('')).toContain('lo')
    expect(lastDone).toBe(true)
  })

  it('openai SSE 单 chunk 内多行解析', async () => {
    const { aiProxyService } = await freshModule(undefined)
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        // 多行挤在同一个 chunk
        c.enqueue(
          encoder.encode(
            'data: {"choices":[{"delta":{"content":"A"}}]}\ndata: {"choices":[{"delta":{"content":"B"}}]}\ndata: {"choices":[{"delta":{}}]}\n',
          ),
        )
        c.close()
      },
    })
    fetchMock.mockResolvedValueOnce({
      ok: true, status: 200, text: async () => '', json: async () => ({}), body: stream,
    } as unknown as Response)

    let out = ''
    let doneSeen = false
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')])) {
      out += chunk.token
      if (chunk.done) doneSeen = true
    }
    expect(out).toBe('AB')
    expect(doneSeen).toBe(true)
  })

  it('openai SSE 正常 JSON 中 delta.content 缺失 → 不产出 token', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(sseRes(['data: {"choices":[{}]}']))

    const tokens: string[] = []
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')])) {
      if (chunk.token) tokens.push(chunk.token)
    }
    expect(tokens).toHaveLength(0)
  })

  it('openai SSE res.body 为 null:yield streamUnavailable 并结束', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(noBodyRes())

    const chunks: { token: string; done: boolean }[] = []
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')])) {
      chunks.push(chunk)
    }
    expect(chunks).toHaveLength(1)
    expect(chunks[0].token).toContain('streamUnavailable')
    expect(chunks[0].done).toBe(true)
  })

  it('openai SSE !ok:yield streamError(t 注入)且含状态码', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(jsonRes({}, false, 403))

    const t = (k: string, p?: Record<string, string | number>) =>
      `${k}:${p?.message ?? ''}`
    let last = { token: '', done: false }
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')], undefined, undefined, t)) {
      last = chunk
    }
    expect(last.done).toBe(true)
    expect(last.token).toContain('streamError')
    expect(last.token).toContain('403')
  })

  it('claude SSE happy path:content_block_delta 提取', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(
      sseRes([
        'event: message_start',
        'data: {"type":"content_block_delta","delta":{"text":"你好"}}',
        'data: {"type":"content_block_stop"}',
      ]),
    )

    let out = ''
    for await (const chunk of aiProxyService.chatStream(
      mockConfig({ provider: 'claude' }),
      [userMessage('hi')],
    )) {
      if (!chunk.done) out += chunk.token
    }
    expect(out).toBe('你好')
  })

  it('claude SSE res.body 为 null:yield streamUnavailable', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(noBodyRes())

    let last = { token: '', done: false }
    for await (const chunk of aiProxyService.chatStream(
      mockConfig({ provider: 'claude' }),
      [userMessage('hi')],
    )) {
      last = chunk
    }
    expect(last.done).toBe(true)
    expect(last.token).toContain('streamUnavailable')
  })

  it('claude SSE !ok:无 t 时 yield 内嵌 message 的 streamError', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce({ ok: false, status: 529, text: async () => '' } as unknown as Response)

    let last = { token: '', done: false }
    for await (const chunk of aiProxyService.chatStream(
      mockConfig({ provider: 'claude' }),
      [userMessage('hi')],
    )) {
      last = chunk
    }
    expect(last.done).toBe(true)
    expect(last.token).toContain('streamError')
    expect(last.token).toContain('529')
  })

  it('流式网络异常:yield streamError 兜底(不 reject)', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockRejectedValueOnce(new TypeError('network down'))

    let last = { token: '', done: false }
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')])) {
      last = chunk
    }
    expect(last.done).toBe(true)
    expect(last.token).toContain('network down')
  })

  it('流式 AbortError:静默结束(无错误 token)', async () => {
    const { aiProxyService } = await freshModule(undefined)
    const abortErr = new Error('aborted')
    abortErr.name = 'AbortError'
    fetchMock.mockRejectedValueOnce(abortErr)

    const chunks: { token: string; done: boolean }[] = []
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')])) {
      chunks.push(chunk)
    }
    expect(chunks).toHaveLength(0)
  })

  it('流式非 Error 异常:无 t 时 yield connectionFailed 兜底', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockRejectedValueOnce(42)

    let last = { token: '', done: false }
    for await (const chunk of aiProxyService.chatStream(mockConfig(), [userMessage('hi')])) {
      last = chunk
    }
    expect(last.done).toBe(true)
    expect(last.token).toContain('streamError')
    expect(last.token).toContain('connectionFailed')
  })

  it('流式 fileContext 注入:请求 system 含文件块', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValueOnce(sseRes(['data: [DONE]']))

    for await (const chunk of aiProxyService.chatStream(
      mockConfig(),
      [userMessage('hi')],
      undefined,
      { filePath: '/b.ts', content: 'let b' },
    )) {
      void chunk
    }
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(body.messages[0].content).toContain('--- CURRENT OPEN FILE ---')
    expect(body.messages[0].content).toContain('let b')
  })

  it('mock provider 流式:预中止 signal 直接静默返回', async () => {
    const { aiProxyService } = await freshModule(undefined)
    const controller = new AbortController()
    controller.abort()

    const chunks: { token: string; done: boolean }[] = []
    for await (const chunk of aiProxyService.chatStream(
      mockConfig({ provider: 'mock', apiKey: '' }),
      [userMessage('hi')],
      controller.signal,
    )) {
      chunks.push(chunk)
    }
    expect(chunks).toHaveLength(0)
  })

  // 注:chatStream 末尾的 unsupportedProvider 兜底分支对类型化调用不可达
  // (mock 在入口短路;openai/claude/deepseek 均有端点映射)——属死代码,不补
})

describe('AIProxyService — 统计与签名', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    restoreEnv()
  })

  it('全新实例零请求时 getStats 返回零值结构', async () => {
    const { aiProxyService } = await freshModule(undefined)
    const stats = aiProxyService.getStats()
    expect(stats).toEqual({
      totalRequests: 0,
      avgLatency: 0,
      cacheHitRate: 0,
      byProvider: {},
    })
  })

  it('成功请求计入 byProvider 统计', async () => {
    const { aiProxyService } = await freshModule(undefined)
    fetchMock.mockResolvedValue(jsonRes({ content: 'ok' }))
    await aiProxyService.chat(mockConfig({ provider: 'claude' }), [userMessage('a')])
    const stats = aiProxyService.getStats()
    expect(stats.totalRequests).toBeGreaterThanOrEqual(1)
    expect(stats.byProvider.claude).toBeGreaterThanOrEqual(1)
  })
})
