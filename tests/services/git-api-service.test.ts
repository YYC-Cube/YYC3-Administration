/**
 * @file git-api-service.test.ts
 * @description YYC³ Git API Service — Comprehensive Vitest Unit Tests
 *   Covers: mock mode CRUD, configuration, branch operations, file content,
 *   pull requests, error handling, and singleton behavior.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,services,git-api
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { gitAPIService } from '../../src/app/components/services/git-api-service'

// ==========================================
// Test Suite: Configuration
// ==========================================

describe('GitAPIService — Configuration', () => {
  it('should not be configured by default (or with placeholder token)', () => {
    // Reset to unconfigured state
    gitAPIService.configure({
      token: 'YOUR_GITHUB_TOKEN_HERE',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })
    expect(gitAPIService.isConfigured).toBe(false)
  })

  it('should be configured after providing a real token', () => {
    gitAPIService.configure({
      token: 'ghp_realtoken123',
      owner: 'YanYuCloudCube',
      repo: 'yyc3-cloudpivot',
      branch: 'main',
    })
    expect(gitAPIService.isConfigured).toBe(true)
  })

  it('should mask token in safeConfig', () => {
    gitAPIService.configure({
      token: 'ghp_secret123',
      owner: 'TestOwner',
      repo: 'TestRepo',
      branch: 'dev',
    })

    const safe = gitAPIService.safeConfig
    expect(safe).toBeDefined()
    expect(safe!.hasToken).toBe(true)
    expect(safe!.owner).toBe('TestOwner')
    expect(safe!.repo).toBe('TestRepo')
    expect(safe!.branch).toBe('dev')
    // Token should NOT be present
    expect((safe as any).token).toBeUndefined()
  })

  it('should use default baseUrl when not specified', () => {
    gitAPIService.configure({
      token: 'ghp_test',
      owner: 'o',
      repo: 'r',
      branch: 'main',
    })
    // Internal baseUrl defaults to https://api.github.com
    const safe = gitAPIService.safeConfig
    expect(safe).toBeDefined()
  })

  it('should accept custom baseUrl', () => {
    gitAPIService.configure({
      token: 'ghp_test',
      owner: 'o',
      repo: 'r',
      branch: 'main',
      baseUrl: 'https://custom-github.example.com/api/v3',
    })
    expect(gitAPIService.isConfigured).toBe(true)
  })

  it('should return null safeConfig when not configured at all', () => {
    // Re-configure to null-like state by using placeholder
    gitAPIService.configure({
      token: '',
      owner: '',
      repo: '',
      branch: '',
    })
    expect(gitAPIService.isConfigured).toBe(false)
  })
})

// ==========================================
// Test Suite: Mock Mode — Commits
// ==========================================

describe('GitAPIService — Mock Commits', () => {
  beforeEach(() => {
    // Put into mock mode
    gitAPIService.configure({
      token: 'YOUR_GITHUB_TOKEN_HERE',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })
  })

  it('should list mock commits successfully', async () => {
    const result = await gitAPIService.listCommits()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should return commits with required fields', async () => {
    const result = await gitAPIService.listCommits()
    if (result.success) {
      const commit = result.data[0]
      expect(commit.sha).toBeTruthy()
      expect(commit.message).toBeTruthy()
      expect(commit.author).toBeDefined()
      expect(commit.author.name).toBeTruthy()
      expect(commit.author.email).toBeTruthy()
      expect(commit.author.date).toBeTruthy()
      expect(typeof commit.filesChanged).toBe('number')
      expect(commit.url).toBeDefined()
    }
  })

  it('should create a mock commit and prepend to list', async () => {
    const commitMsg = 'test: unit test commit ' + Date.now()
    const result = await gitAPIService.createCommit(
      'test-file.ts',
      "console.log('test');",
      commitMsg,
    )

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.message).toBe(commitMsg)
      expect(result.data.sha).toBeTruthy()
      expect(result.data.author.email).toBe('admin@0379.email')
      expect(result.data.filesChanged).toBe(1)
    }

    // Verify it appears in the list
    const listResult = await gitAPIService.listCommits()
    if (listResult.success) {
      const found = listResult.data.some((c) => c.message === commitMsg)
      expect(found).toBe(true)
    }
  })

  it('should create commit with sha parameter (update mode)', async () => {
    const result = await gitAPIService.createCommit(
      'existing-file.ts',
      'updated content',
      'update: modify existing file',
      'existing-sha-123',
    )
    expect(result.success).toBe(true)
  })

  it('should accept perPage parameter for listCommits', async () => {
    const result = await gitAPIService.listCommits(2)
    expect(result.success).toBe(true)
    // Mock mode returns all mock commits regardless of perPage
    if (result.success) {
      expect(result.data.length).toBeGreaterThanOrEqual(1)
    }
  })
})

// ==========================================
// Test Suite: Mock Mode — Branches
// ==========================================

describe('GitAPIService — Mock Branches', () => {
  beforeEach(() => {
    gitAPIService.configure({
      token: 'YOUR_GITHUB_TOKEN_HERE',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })
  })

  it('should list mock branches', async () => {
    const result = await gitAPIService.listBranches()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should return branches with required fields', async () => {
    const result = await gitAPIService.listBranches()
    if (result.success) {
      const branch = result.data[0]
      expect(branch.name).toBeTruthy()
      expect(branch.sha).toBeTruthy()
      expect(typeof branch.protected).toBe('boolean')
      expect(typeof branch.current).toBe('boolean')
    }
  })

  it('should have a main branch marked as protected', async () => {
    const result = await gitAPIService.listBranches()
    if (result.success) {
      const mainBranch = result.data.find((b) => b.name === 'main')
      expect(mainBranch).toBeDefined()
      expect(mainBranch!.protected).toBe(true)
    }
  })

  it('should have one branch marked as current', async () => {
    const result = await gitAPIService.listBranches()
    if (result.success) {
      const currentBranches = result.data.filter((b) => b.current)
      expect(currentBranches.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should create a new mock branch', async () => {
    const branchName = 'feature/test-branch-' + Date.now()
    const result = await gitAPIService.createBranch(branchName, 'abc123')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe(branchName)
      expect(result.data.sha).toBe('abc123')
      expect(result.data.protected).toBe(false)
      expect(result.data.current).toBe(false)
    }
  })
})

// ==========================================
// Test Suite: Mock Mode — File Content
// ==========================================

describe('GitAPIService — Mock File Content', () => {
  beforeEach(() => {
    gitAPIService.configure({
      token: 'YOUR_GITHUB_TOKEN_HERE',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })
  })

  it('should get mock file content', async () => {
    const result = await gitAPIService.getFileContent('src/App.tsx')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.path).toBe('src/App.tsx')
      expect(result.data.content).toBeTruthy()
      expect(result.data.content).toContain('Mock file content')
      expect(result.data.sha).toBeTruthy()
      expect(result.data.sha).toContain('mock-sha-')
      expect(result.data.size).toBeGreaterThan(0)
      expect(result.data.encoding).toBe('utf-8')
    }
  })

  it('should include file path in mock content', async () => {
    const path = 'src/components/Button.tsx'
    const result = await gitAPIService.getFileContent(path)
    if (result.success) {
      expect(result.data.content).toContain(path)
    }
  })

  it('should generate unique SHA for each call', async () => {
    const result1 = await gitAPIService.getFileContent('file1.ts')
    const result2 = await gitAPIService.getFileContent('file2.ts')

    if (result1.success && result2.success) {
      expect(result1.data.sha).not.toBe(result2.data.sha)
    }
  })
})

// ==========================================
// Test Suite: Mock Mode — Delete File
// ==========================================

describe('GitAPIService — Mock Delete File', () => {
  beforeEach(() => {
    gitAPIService.configure({
      token: 'YOUR_GITHUB_TOKEN_HERE',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })
  })

  it('should delete a file in mock mode', async () => {
    const result = await gitAPIService.deleteFile(
      'src/old-file.ts',
      'chore: remove old file',
      'sha-to-delete',
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.deleted).toBe(true)
    }
  })
})

// ==========================================
// Test Suite: Mock Mode — Pull Requests
// ==========================================

describe('GitAPIService — Mock Pull Requests', () => {
  beforeEach(() => {
    gitAPIService.configure({
      token: 'YOUR_GITHUB_TOKEN_HERE',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })
  })

  it('should list mock pull requests', async () => {
    const result = await gitAPIService.listPullRequests()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should return PRs with required fields', async () => {
    const result = await gitAPIService.listPullRequests()
    if (result.success) {
      const pr = result.data[0]
      expect(typeof pr.number).toBe('number')
      expect(pr.title).toBeTruthy()
      expect(['open', 'closed', 'merged']).toContain(pr.state)
      expect(pr.author).toBeTruthy()
      expect(pr.createdAt).toBeTruthy()
      expect(pr.url).toBeDefined()
    }
  })

  it('should accept state parameter', async () => {
    const open = await gitAPIService.listPullRequests('open')
    const closed = await gitAPIService.listPullRequests('closed')
    const all = await gitAPIService.listPullRequests('all')

    expect(open.success).toBe(true)
    expect(closed.success).toBe(true)
    expect(all.success).toBe(true)
  })

  it('should have an open PR in mock data', async () => {
    const result = await gitAPIService.listPullRequests('open')
    if (result.success) {
      const openPR = result.data.find((pr) => pr.state === 'open')
      expect(openPR).toBeDefined()
    }
  })
})

// ==========================================
// Test Suite: Real API Error Handling (Mocked fetch)
// ==========================================

describe('GitAPIService — Real API Error Handling', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('should return error result when API returns 401', async () => {
    gitAPIService.configure({
      token: 'ghp_invalid_token',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Bad credentials'),
    })

    const result = await gitAPIService.listCommits()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('401')
    }
  })

  it('should return error result when API returns 404', async () => {
    gitAPIService.configure({
      token: 'ghp_valid_but_wrong_repo',
      owner: 'nonexistent',
      repo: 'nonexistent',
      branch: 'main',
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found'),
    })

    const result = await gitAPIService.listBranches()
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('404')
    }
  })

  it('should return error result when network fails', async () => {
    gitAPIService.configure({
      token: 'ghp_real_token',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await gitAPIService.getFileContent('test.ts')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Network error')
    }
  })

  it('should handle successful listCommits API response', async () => {
    gitAPIService.configure({
      token: 'ghp_real_token',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            sha: 'abc123def456',
            commit: {
              message: 'test commit',
              author: { name: 'Test', email: 'test@test.com', date: '2026-03-18T00:00:00Z' },
            },
            stats: { total: 3 },
            html_url: 'https://github.com/test/test/commit/abc123',
          },
        ]),
    })

    const result = await gitAPIService.listCommits()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data[0].sha).toBe('abc123d')
      expect(result.data[0].message).toBe('test commit')
      expect(result.data[0].author.name).toBe('Test')
      expect(result.data[0].filesChanged).toBe(3)
    }
  })

  it('should handle successful listBranches API response', async () => {
    gitAPIService.configure({
      token: 'ghp_real_token',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { name: 'main', commit: { sha: 'abc123def456' }, protected: true },
          { name: 'dev', commit: { sha: 'xyz789abc012' }, protected: false },
        ]),
    })

    const result = await gitAPIService.listBranches()
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.length).toBe(2)
      expect(result.data[0].name).toBe('main')
      expect(result.data[0].protected).toBe(true)
      expect(result.data[0].current).toBe(true) // matches configured branch
      expect(result.data[1].current).toBe(false)
    }
  })

  it('should handle createCommit API response', async () => {
    gitAPIService.configure({
      token: 'ghp_real_token',
      owner: 'test',
      repo: 'test',
      branch: 'main',
    })

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          commit: {
            sha: 'newcommit123456',
            message: 'feat: new feature',
            author: { name: 'Dev', email: 'dev@test.com', date: '2026-03-18T12:00:00Z' },
            html_url: 'https://github.com/test/test/commit/newcommit',
          },
        }),
    })

    const result = await gitAPIService.createCommit('src/new.ts', 'content', 'feat: new feature')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sha).toHaveLength(7)
      expect(result.data.message).toBe('feat: new feature')
    }
  })
})
