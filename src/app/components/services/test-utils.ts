/**
 * @file test-utils.ts
 * @description YYC³ Test Utilities — Shared test helpers, mock factories,
 *   and render wrappers for Vitest + Testing Library + Playwright testing.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,utils,mock
 */

// ==========================================
// Mock Data Factories
// ==========================================

import type { AIProviderConfig, ChatMessage, ProxyResponse } from './ai-proxy-service'
import type { GitBranchInfo, GitCommitInfo, GitConfig } from './git-api-service'

/** Create a mock AI provider config */
export function createMockAIConfig(overrides?: Partial<AIProviderConfig>): AIProviderConfig {
  return {
    provider: 'mock',
    apiKey: '',
    model: 'mock-v1',
    temperature: 0.7,
    maxTokens: 4096,
    ...overrides,
  }
}

/** Create a mock chat message */
export function createMockMessage(overrides?: Partial<ChatMessage>): ChatMessage {
  return {
    role: 'user',
    content: 'Hello, YYC³ AI Assistant!',
    ...overrides,
  }
}

/** Create a mock proxy response */
export function createMockProxyResponse(overrides?: Partial<ProxyResponse>): ProxyResponse {
  return {
    content: 'This is a mock AI response from YYC³ AI Assistant.',
    model: 'mock-v1',
    provider: 'mock',
    cached: false,
    latencyMs: 450,
    ...overrides,
  }
}

/** Create a mock Git config */
export function createMockGitConfig(overrides?: Partial<GitConfig>): GitConfig {
  return {
    token: 'ghp_mock_token_123456',
    owner: 'YanYuCloudCube',
    repo: 'yyc3-cloudpivot',
    branch: 'feature/left-panel-v2',
    ...overrides,
  }
}

/** Create a mock commit */
export function createMockCommit(overrides?: Partial<GitCommitInfo>): GitCommitInfo {
  return {
    sha: 'a1b2c3d',
    message: 'feat: implement left-panel-page v2.0',
    author: { name: 'YYC3 Dev', email: 'admin@0379.email', date: new Date().toISOString() },
    filesChanged: 3,
    url: 'https://github.com/YanYuCloudCube/yyc3/commit/a1b2c3d',
    ...overrides,
  }
}

/** Create a mock branch */
export function createMockBranch(overrides?: Partial<GitBranchInfo>): GitBranchInfo {
  return {
    name: 'feature/test-branch',
    sha: 'abc1234',
    protected: false,
    current: false,
    ...overrides,
  }
}

/** Create a mock file tree node */
export function createMockFileTree() {
  return [
    {
      id: 'root-1',
      name: 'src',
      type: 'folder' as const,
      expanded: true,
      children: [
        {
          id: 'file-1',
          name: 'App.tsx',
          type: 'file' as const,
          children: [],
        },
        {
          id: 'file-2',
          name: 'index.ts',
          type: 'file' as const,
          children: [],
        },
        {
          id: 'folder-1',
          name: 'components',
          type: 'folder' as const,
          expanded: false,
          children: [
            {
              id: 'file-3',
              name: 'Button.tsx',
              type: 'file' as const,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 'file-4',
      name: 'package.json',
      type: 'file' as const,
      children: [],
    },
  ]
}

// ==========================================
// Test Assertions Helpers
// ==========================================

/** Assert that a value is defined and return it */
export function assertDefined<T>(value: T | undefined | null, label = 'value'): T {
  if (value === undefined || value === null) {
    throw new Error(`Expected ${label} to be defined, but got ${value}`)
  }
  return value
}

/** Wait for a condition to become true (polling) */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100,
): Promise<void> {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error(`waitForCondition timed out after ${timeout}ms`)
    }
    await new Promise((r) => setTimeout(r, interval))
  }
}

/** Create a delay promise */
export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ==========================================
// Mock Service Helpers
// ==========================================

/** Create a mock AI Proxy Service that resolves immediately */
export function createMockAIProxyService() {
  return {
    chat: async (_config: AIProviderConfig, _messages: ChatMessage[]) => {
      await delay(50)
      return createMockProxyResponse()
    },
    getStats: () => ({
      totalRequests: 10,
      avgLatency: 450,
      cacheHitRate: 0.3,
      byProvider: { mock: 7, openai: 3 },
    }),
    clearCache: () => {},
  }
}

/** Create a mock Git API Service */
export function createMockGitAPIService() {
  const commits = [
    createMockCommit(),
    createMockCommit({ sha: 'e4f5g6h', message: 'fix: resolve viewport issue' }),
  ]
  const branches = [
    createMockBranch({ name: 'main', protected: true }),
    createMockBranch({ name: 'dev', current: true }),
  ]

  return {
    configure: (_config: GitConfig) => {},
    get isConfigured() {
      return true
    },
    listCommits: async () => ({ success: true as const, data: commits }),
    createCommit: async (_path: string, _content: string, message: string) => ({
      success: true as const,
      data: createMockCommit({ message }),
    }),
    listBranches: async () => ({ success: true as const, data: branches }),
    createBranch: async (name: string) => ({
      success: true as const,
      data: createMockBranch({ name }),
    }),
    getFileContent: async (path: string) => ({
      success: true as const,
      data: { path, content: '// Mock content', sha: 'mock-sha', size: 14, encoding: 'utf-8' },
    }),
    listPullRequests: async () => ({
      success: true as const,
      data: [
        {
          number: 42,
          title: 'feat: test PR',
          state: 'open' as const,
          author: 'YYC3',
          createdAt: new Date().toISOString(),
          url: '#',
        },
      ],
    }),
  }
}
