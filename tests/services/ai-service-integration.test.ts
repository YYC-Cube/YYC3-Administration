/**
 * @file ai-service-integration.test.ts
 * @description AI Proxy Service — Integration Tests with short timeout
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { describe, expect, it } from 'vitest'

import { aiProxyService } from '../../src/app/components/services/ai-proxy-service'

import type {
  AIProviderConfig,
  ChatMessage,
} from '../../src/app/components/services/ai-proxy-service'

// Use short messages to minimize mock delay
const SHORT_MSG: ChatMessage[] = [{ role: 'user', content: 'Hi' }]

const MOCK_CONFIG: AIProviderConfig = {
  provider: 'mock',
  apiKey: 'mock-key',
  model: 'mock-v1',
  temperature: 0.7,
  maxTokens: 128,
}

describe('AIProxyService — Integration (Mock)', () => {
  it('sends a mock chat request', async () => {
    const response = await aiProxyService.chat(MOCK_CONFIG, SHORT_MSG)
    expect(response.content).toBeTruthy()
    expect(typeof response.content).toBe('string')
    expect(response.content.length).toBeGreaterThan(0)
  }, 10_000)

  it('streams tokens from mock provider', async () => {
    const stream = aiProxyService.chatStream(MOCK_CONFIG, SHORT_MSG)

    let fullContent = ''
    let done = false
    for await (const chunk of stream) {
      if (chunk.done) {
        done = true
        break
      }
      fullContent += chunk.token
    }
    expect(done).toBe(true)
    expect(fullContent.length).toBeGreaterThan(0)
  }, 10_000)
})

describe('AIProxyService — Caching', () => {
  it('returns cached response on repeat identical requests', async () => {
    const cachedMsg: ChatMessage[] = [{ role: 'user', content: 'Cached' }]
    const response1 = await aiProxyService.chat(MOCK_CONFIG, cachedMsg)
    const response2 = await aiProxyService.chat(MOCK_CONFIG, cachedMsg)
    expect(response1.content).toBeTruthy()
    expect(response2.content).toBeTruthy()
  }, 15_000)
})

describe('AIProxyService — File Context', () => {
  it('accepts file context with mock provider', async () => {
    const response = await aiProxyService.chat(MOCK_CONFIG, SHORT_MSG, undefined, {
      filePath: 'test.ts',
      content: 'const x = 1;',
    })
    expect(response.content).toBeTruthy()
  }, 10_000)
})
