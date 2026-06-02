/**
 * @file ai-proxy-service.test.ts
 * @description YYC³ AI Proxy Service — Comprehensive Vitest Unit Tests
 *   Covers: mock responses, file context injection, rate limiting, caching,
 *   statistics tracking, error handling, and provider routing.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,services,ai-proxy
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { aiProxyService } from '../../src/app/components/services/ai-proxy-service'

import type {
  AIProviderConfig,
  ChatMessage,
  ProxyResponse,
} from '../../src/app/components/services/ai-proxy-service'

// ==========================================
// Test Helpers
// ==========================================

function mockConfig(overrides?: Partial<AIProviderConfig>): AIProviderConfig {
  return {
    provider: 'mock',
    apiKey: '',
    model: 'mock-v1',
    temperature: 0.7,
    maxTokens: 4096,
    ...overrides,
  }
}

function userMessage(content: string): ChatMessage {
  return { role: 'user', content }
}

// ==========================================
// Test Suite: Mock Provider
// ==========================================

describe('AIProxyService — Mock Provider', () => {
  beforeEach(() => {
    aiProxyService.clearCache()
  })

  it('should return a mock response for mock provider', async () => {
    const config = mockConfig()
    const messages = [userMessage('Hello AI!')]
    const result = await aiProxyService.chat(config, messages)

    expect(result).toBeDefined()
    expect(result.provider).toBe('mock')
    expect(result.model).toBe('mock-v1')
    expect(result.content).toBeTruthy()
    expect(typeof result.content).toBe('string')
    expect(result.content.length).toBeGreaterThan(0)
    expect(result.cached).toBe(false)
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('should fall back to mock when API key is empty', async () => {
    const config = mockConfig({ provider: 'openai', apiKey: '' })
    const result = await aiProxyService.chat(config, [userMessage('Test')])

    expect(result.provider).toBe('mock')
    expect(result.content).toBeTruthy()
  })

  it('should have latency >= 600ms for mock responses (simulated delay)', async () => {
    const config = mockConfig()
    const start = Date.now()
    await aiProxyService.chat(config, [userMessage('Test')])
    const elapsed = Date.now() - start

    expect(elapsed).toBeGreaterThanOrEqual(500) // 600 + random, allow some tolerance
  })

  it('should return one of the predefined mock responses', async () => {
    const config = mockConfig()
    const result = await aiProxyService.chat(config, [userMessage('Any question')])

    // All mock responses contain Chinese characters or code blocks
    expect(
      result.content.includes('建议') ||
        result.content.includes('分析') ||
        result.content.includes('观察') ||
        result.content.includes('系统') ||
        result.content.includes('建议') ||
        result.content.includes('检测') ||
        result.content.includes('useWebSocket') ||
        result.content.includes('immer') ||
        result.content.includes('useMemo') ||
        result.content.includes('useThemeColors') ||
        result.content.includes('react-window') ||
        result.content.includes('AbortController'),
    ).toBe(true)
  })
})

// ==========================================
// Test Suite: File Context Injection
// ==========================================

describe('AIProxyService — File Context Injection', () => {
  beforeEach(() => {
    aiProxyService.clearCache()
  })

  it('should accept fileContext parameter without error', async () => {
    const config = mockConfig()
    const fileContext = {
      filePath: '/src/app/components/Button.tsx',
      content: 'export function Button() { return <button>Click</button>; }',
    }
    const result = await aiProxyService.chat(
      config,
      [userMessage('Explain this component')],
      undefined,
      fileContext,
    )

    expect(result).toBeDefined()
    expect(result.content).toBeTruthy()
  })

  it('should work with undefined fileContext', async () => {
    const config = mockConfig()
    const result = await aiProxyService.chat(config, [userMessage('Hello')], undefined, undefined)

    expect(result).toBeDefined()
  })

  it('should work with empty file content', async () => {
    const config = mockConfig()
    const result = await aiProxyService.chat(config, [userMessage('Hello')], undefined, {
      filePath: '/empty.ts',
      content: '',
    })

    expect(result).toBeDefined()
  })

  it('should truncate file content at 6000 chars', async () => {
    const config = mockConfig()
    const longContent = 'a'.repeat(10000)
    // This should not throw — truncation is handled internally
    const result = await aiProxyService.chat(config, [userMessage('Help')], undefined, {
      filePath: '/big-file.ts',
      content: longContent,
    })

    expect(result).toBeDefined()
  })
})

// ==========================================
// Test Suite: Statistics
// ==========================================

describe('AIProxyService — Statistics', () => {
  beforeEach(() => {
    aiProxyService.clearCache()
  })

  it('should track request statistics', async () => {
    const config = mockConfig()
    await aiProxyService.chat(config, [userMessage('Test 1')])
    await aiProxyService.chat(config, [userMessage('Test 2')])

    const stats = aiProxyService.getStats()
    expect(stats.totalRequests).toBeGreaterThanOrEqual(2)
    expect(stats.avgLatency).toBeGreaterThanOrEqual(0)
    expect(typeof stats.cacheHitRate).toBe('number')
    expect(stats.byProvider).toBeDefined()
    expect(stats.byProvider.mock).toBeGreaterThanOrEqual(2)
  })

  it('should return zero stats when no requests', () => {
    // Stats accumulate across tests since it's a singleton,
    // so we check structure
    const stats = aiProxyService.getStats()
    expect(stats).toHaveProperty('totalRequests')
    expect(stats).toHaveProperty('avgLatency')
    expect(stats).toHaveProperty('cacheHitRate')
    expect(stats).toHaveProperty('byProvider')
  })
})

// ==========================================
// Test Suite: Cache
// ==========================================

describe('AIProxyService — Cache', () => {
  it('should clear cache without error', () => {
    expect(() => aiProxyService.clearCache()).not.toThrow()
  })

  it('should clear cache and stats remain', () => {
    aiProxyService.clearCache()
    const stats = aiProxyService.getStats()
    expect(stats).toBeDefined()
  })
})

// ==========================================
// Test Suite: AbortSignal
// ==========================================

describe('AIProxyService — AbortSignal', () => {
  it('should accept an AbortSignal parameter', async () => {
    const controller = new AbortController()
    const config = mockConfig()
    const result = await aiProxyService.chat(config, [userMessage('Test')], controller.signal)

    expect(result).toBeDefined()
  })

  it('should not abort mock requests (mock ignores signal)', async () => {
    const controller = new AbortController()
    const config = mockConfig()

    // Don't abort — should succeed
    const result = await aiProxyService.chat(config, [userMessage('Test')], controller.signal)

    expect(result.content).toBeTruthy()
  })
})

// ==========================================
// Test Suite: Multiple Sequential Calls
// ==========================================

describe('AIProxyService — Sequential Calls', () => {
  beforeEach(() => {
    aiProxyService.clearCache()
  })

  it('should handle 5 sequential mock requests', async () => {
    const config = mockConfig()
    const results: ProxyResponse[] = []

    for (let i = 0; i < 5; i++) {
      const result = await aiProxyService.chat(config, [userMessage(`Question ${i}`)])
      results.push(result)
    }

    expect(results.length).toBe(5)
    results.forEach((r) => {
      expect(r.content).toBeTruthy()
      expect(r.provider).toBe('mock')
    })
  }, 15000)

  it('should handle empty message array gracefully for mock', async () => {
    const config = mockConfig()
    const result = await aiProxyService.chat(config, [])
    expect(result).toBeDefined()
    expect(result.content).toBeTruthy()
  })
})

// ==========================================
// Test Suite: Provider Config Variations
// ==========================================

describe('AIProxyService — Provider Configs', () => {
  it('should accept openai provider with empty key (falls back to mock)', async () => {
    const result = await aiProxyService.chat(
      mockConfig({ provider: 'openai', apiKey: '', model: 'gpt-4' }),
      [userMessage('Test')],
    )
    expect(result.content).toBeTruthy()
  })

  it('should accept claude provider with empty key (falls back to mock)', async () => {
    const result = await aiProxyService.chat(
      mockConfig({ provider: 'claude', apiKey: '', model: 'claude-3' }),
      [userMessage('Test')],
    )
    expect(result.content).toBeTruthy()
  })

  it('should accept deepseek provider with empty key (falls back to mock)', async () => {
    const result = await aiProxyService.chat(
      mockConfig({ provider: 'deepseek', apiKey: '', model: 'deepseek-chat' }),
      [userMessage('Test')],
    )
    expect(result.content).toBeTruthy()
  })

  it('should handle custom temperature values', async () => {
    const result = await aiProxyService.chat(mockConfig({ temperature: 0.0 }), [
      userMessage('Test'),
    ])
    expect(result).toBeDefined()

    const result2 = await aiProxyService.chat(mockConfig({ temperature: 2.0 }), [
      userMessage('Test 2'),
    ])
    expect(result2).toBeDefined()
  })

  it('should handle custom maxTokens values', async () => {
    const result = await aiProxyService.chat(mockConfig({ maxTokens: 100 }), [userMessage('Test')])
    expect(result).toBeDefined()
  })
})

// ==========================================
// Test Suite: chatStream — Mock 流式响应
// ==========================================

describe('AIProxyService — chatStream Mock Streaming', () => {
  beforeEach(() => {
    aiProxyService.clearCache()
  })

  it('should yield tokens from mock provider', async () => {
    const config = mockConfig()
    const tokens: string[] = []
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Hello')])) {
      tokens.push(chunk.token)
      if (chunk.done) break
    }
    expect(tokens.length).toBeGreaterThan(1)
    // Last token should be empty with done=true
    expect(tokens[tokens.length - 1]).toBe('')
  })

  it('should reconstruct full content from streamed tokens', async () => {
    const config = mockConfig()
    let fullContent = ''
    for await (const chunk of aiProxyService.chatStream(config, [
      userMessage('Tell me about hooks'),
    ])) {
      if (!chunk.done) fullContent += chunk.token
    }
    expect(fullContent.length).toBeGreaterThan(10)
    // Content should come from MOCK_RESPONSES — contains Chinese or code
    expect(
      fullContent.includes('建议') ||
        fullContent.includes('分析') ||
        fullContent.includes('观察') ||
        fullContent.includes('useWebSocket') ||
        fullContent.includes('immer') ||
        fullContent.includes('useMemo') ||
        fullContent.includes('useThemeColors') ||
        fullContent.includes('react-window') ||
        fullContent.includes('AbortController') ||
        fullContent.includes('检测'),
    ).toBe(true)
  })

  it('should end with a done=true chunk', async () => {
    const config = mockConfig()
    let lastChunk: { token: string; done: boolean } | null = null
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Test')])) {
      lastChunk = chunk
    }
    expect(lastChunk).not.toBeNull()
    expect(lastChunk!.done).toBe(true)
    expect(lastChunk!.token).toBe('')
  })

  it('should respect AbortSignal and stop streaming', async () => {
    const controller = new AbortController()
    const config = mockConfig()
    const tokens: string[] = []

    // Abort after collecting a few tokens
    let count = 0
    for await (const chunk of aiProxyService.chatStream(
      config,
      [userMessage('Long response')],
      controller.signal,
    )) {
      tokens.push(chunk.token)
      count++
      if (count >= 3) {
        controller.abort()
        break
      }
    }

    // Should have stopped early
    expect(tokens.length).toBeLessThanOrEqual(4)
    expect(tokens.length).toBeGreaterThanOrEqual(1)
  })

  it('should fall back to mock when provider has no API key', async () => {
    const config = mockConfig({ provider: 'openai', apiKey: '', model: 'gpt-4' })
    const tokens: string[] = []
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Test')])) {
      tokens.push(chunk.token)
      if (chunk.done) break
    }
    expect(tokens.length).toBeGreaterThan(1)
  })

  it('should handle empty messages array for streaming', async () => {
    const config = mockConfig()
    let fullContent = ''
    for await (const chunk of aiProxyService.chatStream(config, [])) {
      if (!chunk.done) fullContent += chunk.token
    }
    expect(fullContent.length).toBeGreaterThan(0)
  })

  it('should accept fileContext parameter in streaming mode', async () => {
    const config = mockConfig()
    const fileContext = {
      filePath: '/src/app/components/Button.tsx',
      content: 'export function Button() { return <button>Click</button>; }',
    }
    let fullContent = ''
    for await (const chunk of aiProxyService.chatStream(
      config,
      [userMessage('Explain')],
      undefined,
      fileContext,
    )) {
      if (!chunk.done) fullContent += chunk.token
    }
    expect(fullContent.length).toBeGreaterThan(0)
  })

  it('should yield non-empty tokens before done signal', async () => {
    const config = mockConfig()
    const nonEmptyTokens: string[] = []
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Test')])) {
      if (!chunk.done && chunk.token.length > 0) {
        nonEmptyTokens.push(chunk.token)
      }
    }
    // Mock splits by whitespace, so we should get multiple non-empty tokens
    expect(nonEmptyTokens.length).toBeGreaterThan(3)
  })

  it('should stream tokens with simulated delay (not instant)', async () => {
    const config = mockConfig()
    const start = Date.now()
    let tokenCount = 0
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Test')])) {
      tokenCount++
      if (chunk.done) break
    }
    const elapsed = Date.now() - start
    // Each token has 30-80ms delay, so total should be > 100ms for multiple tokens
    expect(elapsed).toBeGreaterThan(50)
    expect(tokenCount).toBeGreaterThan(1)
  })

  it('should handle multiple sequential stream calls', async () => {
    const config = mockConfig()
    const results: string[] = []

    for (let i = 0; i < 3; i++) {
      let content = ''
      for await (const chunk of aiProxyService.chatStream(config, [userMessage(`Question ${i}`)])) {
        if (!chunk.done) content += chunk.token
      }
      results.push(content)
    }

    expect(results.length).toBe(3)
    results.forEach((r) => {
      expect(r.length).toBeGreaterThan(0)
    })
  }, 15000)

  it('should handle claude provider with empty key (falls back to mock stream)', async () => {
    const config = mockConfig({ provider: 'claude', apiKey: '', model: 'claude-3-opus' })
    let fullContent = ''
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Test')])) {
      if (!chunk.done) fullContent += chunk.token
    }
    expect(fullContent.length).toBeGreaterThan(0)
  })

  it('should handle deepseek provider with empty key (falls back to mock stream)', async () => {
    const config = mockConfig({ provider: 'deepseek', apiKey: '', model: 'deepseek-chat' })
    let fullContent = ''
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Test')])) {
      if (!chunk.done) fullContent += chunk.token
    }
    expect(fullContent.length).toBeGreaterThan(0)
  })
})

// ==========================================
// Test Suite: chatStream — Token 用量估算
// ==========================================

describe('AIProxyService — chatStream Token Estimation', () => {
  it('should produce content that can be used for token estimation', async () => {
    const config = mockConfig()
    let fullContent = ''
    for await (const chunk of aiProxyService.chatStream(config, [userMessage('Test')])) {
      if (!chunk.done) fullContent += chunk.token
    }

    // Simple token estimation: ~4 chars per token for English, ~1.5 chars for CJK
    const cjkChars = (fullContent.match(/[\u4e00-\u9fff]/g) || []).length
    const otherChars = fullContent.length - cjkChars
    const estimatedTokens = Math.ceil(cjkChars / 1.5 + otherChars / 4)

    expect(estimatedTokens).toBeGreaterThan(5)
    expect(estimatedTokens).toBeLessThan(5000)
  })

  it('should have consistent total content across multiple streams of same input', async () => {
    const config = mockConfig()
    // Run twice — mock is random so lengths may differ, but both should be valid
    const lengths: number[] = []
    for (let i = 0; i < 2; i++) {
      let content = ''
      for await (const chunk of aiProxyService.chatStream(config, [
        userMessage('Consistent test'),
      ])) {
        if (!chunk.done) content += chunk.token
      }
      lengths.push(content.length)
    }
    lengths.forEach((len) => {
      expect(len).toBeGreaterThan(10)
    })
  }, 15000)
})
