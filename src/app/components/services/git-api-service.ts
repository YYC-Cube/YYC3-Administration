/**
 * @file git-api-service.ts
 * @description YYC³ Git API Service — GitHub REST API integration layer for
 *   commit, push, pull, branch management, and repository operations.
 *   Supports both real GitHub API (with PAT token) and local mock simulation.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,frontend,git,github,api,service
 */

// ==========================================
// Types
// ==========================================

export interface GitConfig {
  token: string // GitHub Personal Access Token
  owner: string // Repository owner
  repo: string // Repository name
  branch: string // Current branch
  baseUrl?: string // API base URL (default: https://api.github.com)
}

export interface GitCommitInfo {
  sha: string
  message: string
  author: { name: string; email: string; date: string }
  filesChanged: number
  url: string
}

export interface GitBranchInfo {
  name: string
  sha: string
  protected: boolean
  current: boolean
}

export interface GitFileContent {
  path: string
  content: string // Base64 decoded content
  sha: string // Blob SHA (needed for updates)
  size: number
  encoding: string
}

export interface GitRepoStatus {
  branch: string
  ahead: number
  behind: number
  staged: { path: string; status: string }[]
  modified: { path: string; status: string }[]
  untracked: { path: string }[]
  conflicts: { path: string }[]
}

export interface GitPullRequestInfo {
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  author: string
  createdAt: string
  url: string
}

export type GitOperationResult<T> = { success: true; data: T } | { success: false; error: string }

// ==========================================
// Mock Data
// ==========================================

const MOCK_COMMITS: GitCommitInfo[] = [
  {
    sha: 'a1b2c3d',
    message: 'feat: implement left-panel-page v2.0 with AI Provider + CRUD + Resizable',
    author: {
      name: 'YYC3 Dev',
      email: 'admin@0379.email',
      date: new Date(Date.now() - 600000).toISOString(),
    },
    filesChanged: 5,
    url: '#',
  },
  {
    sha: 'e4f5g6h',
    message: 'feat: task-board v2 with Zustand + DnD + AI inference engine',
    author: {
      name: 'YYC3 Dev',
      email: 'admin@0379.email',
      date: new Date(Date.now() - 3600000).toISOString(),
    },
    filesChanged: 3,
    url: '#',
  },
  {
    sha: 'i7j8k9l',
    message: 'fix: resolve sidebar overlay on iOS Safari viewport',
    author: {
      name: 'YYC3 Dev',
      email: 'admin@0379.email',
      date: new Date(Date.now() - 7200000).toISOString(),
    },
    filesChanged: 2,
    url: '#',
  },
  {
    sha: 'm0n1o2p',
    message: 'refactor: upgrade Tailwind CSS v4 configuration and tokens',
    author: {
      name: 'YYC3 Dev',
      email: 'admin@0379.email',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    filesChanged: 8,
    url: '#',
  },
  {
    sha: 'q3r4s5t',
    message: 'feat: add command palette with fuzzy search + i18n',
    author: {
      name: 'YYC3 Dev',
      email: 'admin@0379.email',
      date: new Date(Date.now() - 172800000).toISOString(),
    },
    filesChanged: 4,
    url: '#',
  },
]

const MOCK_BRANCHES: GitBranchInfo[] = [
  { name: 'main', sha: 'abc123', protected: true, current: false },
  { name: 'feature/left-panel-v2', sha: 'def456', protected: false, current: true },
  { name: 'feature/ai-provider', sha: 'ghi789', protected: false, current: false },
  { name: 'hotfix/safari-fix', sha: 'jkl012', protected: false, current: false },
]

// ==========================================
// Git API Service
// ==========================================

class GitAPIService {
  private config: GitConfig | null = null

  /** Configure the Git service with token and repo info */
  configure(config: GitConfig): void {
    this.config = { ...config, baseUrl: config.baseUrl || 'https://api.github.com' }
  }

  /** Check if the service is configured with a real token */
  get isConfigured(): boolean {
    return !!this.config?.token && this.config.token !== 'YOUR_GITHUB_TOKEN_HERE'
  }

  /** Get current configuration (token masked) */
  get safeConfig(): (Omit<GitConfig, 'token'> & { hasToken: boolean }) | null {
    if (!this.config) return null
    const { token, ...rest } = this.config
    return { ...rest, hasToken: !!token }
  }

  // ------------------------------------------
  // Commits
  // ------------------------------------------

  /** List recent commits */
  async listCommits(perPage: number = 20): Promise<GitOperationResult<GitCommitInfo[]>> {
    if (!this.isConfigured) {
      return { success: true, data: MOCK_COMMITS }
    }

    try {
      const res = await this.fetch(
        `/repos/${this.config!.owner}/${this.config!.repo}/commits?sha=${this.config!.branch}&per_page=${perPage}`,
      )
      const data = await res.json()
      return {
        success: true,
        data: data.map((c: any) => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message,
          author: {
            name: c.commit.author.name,
            email: c.commit.author.email,
            date: c.commit.author.date,
          },
          filesChanged: c.stats?.total ?? 0,
          url: c.html_url,
        })),
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /** Create a commit (update/create a file) */
  async createCommit(
    path: string,
    content: string,
    message: string,
    sha?: string,
  ): Promise<GitOperationResult<GitCommitInfo>> {
    if (!this.isConfigured) {
      const mockCommit: GitCommitInfo = {
        sha: Math.random().toString(36).substring(2, 9),
        message,
        author: { name: 'YYC3 Dev', email: 'admin@0379.email', date: new Date().toISOString() },
        filesChanged: 1,
        url: '#',
      }
      MOCK_COMMITS.unshift(mockCommit)
      return { success: true, data: mockCommit }
    }

    try {
      const body: any = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: this.config!.branch,
      }
      if (sha) body.sha = sha

      const res = await this.fetch(
        `/repos/${this.config!.owner}/${this.config!.repo}/contents/${path}`,
        {
          method: 'PUT',
          body: JSON.stringify(body),
        },
      )
      const data = await res.json()
      return {
        success: true,
        data: {
          sha: data.commit.sha.substring(0, 7),
          message: data.commit.message,
          author: {
            name: data.commit.author.name,
            email: data.commit.author.email,
            date: data.commit.author.date,
          },
          filesChanged: 1,
          url: data.commit.html_url,
        },
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // ------------------------------------------
  // Branches
  // ------------------------------------------

  /** List branches */
  async listBranches(): Promise<GitOperationResult<GitBranchInfo[]>> {
    if (!this.isConfigured) {
      return { success: true, data: MOCK_BRANCHES }
    }

    try {
      const res = await this.fetch(`/repos/${this.config!.owner}/${this.config!.repo}/branches`)
      const data = await res.json()
      return {
        success: true,
        data: data.map((b: any) => ({
          name: b.name,
          sha: b.commit.sha.substring(0, 7),
          protected: b.protected,
          current: b.name === this.config!.branch,
        })),
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /** Create a new branch */
  async createBranch(name: string, fromSha: string): Promise<GitOperationResult<GitBranchInfo>> {
    if (!this.isConfigured) {
      const branch: GitBranchInfo = { name, sha: fromSha, protected: false, current: false }
      MOCK_BRANCHES.push(branch)
      return { success: true, data: branch }
    }

    try {
      const res = await this.fetch(`/repos/${this.config!.owner}/${this.config!.repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${name}`, sha: fromSha }),
      })
      const data = await res.json()
      return {
        success: true,
        data: { name, sha: data.object.sha.substring(0, 7), protected: false, current: false },
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // ------------------------------------------
  // File Content
  // ------------------------------------------

  /** Get file content from repo */
  async getFileContent(path: string): Promise<GitOperationResult<GitFileContent>> {
    if (!this.isConfigured) {
      return {
        success: true,
        data: {
          path,
          content: `// Mock file content for: ${path}\n// This is a simulated response.\n\nexport function placeholder() {\n  return 'YYC³ CloudPivot';\n}\n`,
          sha: 'mock-sha-' + Math.random().toString(36).substring(2, 8),
          size: 128,
          encoding: 'utf-8',
        },
      }
    }

    try {
      const res = await this.fetch(
        `/repos/${this.config!.owner}/${this.config!.repo}/contents/${path}?ref=${this.config!.branch}`,
      )
      const data = await res.json()
      const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))
      return {
        success: true,
        data: { path: data.path, content, sha: data.sha, size: data.size, encoding: data.encoding },
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /** Delete a file from repo */
  async deleteFile(
    path: string,
    message: string,
    sha: string,
  ): Promise<GitOperationResult<{ deleted: boolean }>> {
    if (!this.isConfigured) {
      return { success: true, data: { deleted: true } }
    }

    try {
      await this.fetch(`/repos/${this.config!.owner}/${this.config!.repo}/contents/${path}`, {
        method: 'DELETE',
        body: JSON.stringify({ message, sha, branch: this.config!.branch }),
      })
      return { success: true, data: { deleted: true } }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // ------------------------------------------
  // Pull Requests
  // ------------------------------------------

  /** List pull requests */
  async listPullRequests(
    state: 'open' | 'closed' | 'all' = 'open',
  ): Promise<GitOperationResult<GitPullRequestInfo[]>> {
    if (!this.isConfigured) {
      return {
        success: true,
        data: [
          {
            number: 42,
            title: 'feat: left-panel v2.0 with AI Provider',
            state: 'open',
            author: 'YYC3 Dev',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            url: '#',
          },
          {
            number: 41,
            title: 'feat: task-board Zustand + DnD upgrade',
            state: 'merged' as any,
            author: 'YYC3 Dev',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            url: '#',
          },
        ],
      }
    }

    try {
      const res = await this.fetch(
        `/repos/${this.config!.owner}/${this.config!.repo}/pulls?state=${state}`,
      )
      const data = await res.json()
      return {
        success: true,
        data: data.map((pr: any) => ({
          number: pr.number,
          title: pr.title,
          state: pr.merged_at ? 'merged' : pr.state,
          author: pr.user.login,
          createdAt: pr.created_at,
          url: pr.html_url,
        })),
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  // ------------------------------------------
  // Utility
  // ------------------------------------------

  /** Fetch wrapper with auth headers */
  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.config!.baseUrl}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${this.config!.token}`,
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) ?? {}),
      },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`GitHub API ${res.status}: ${body.substring(0, 200)}`)
    }
    return res
  }
}

/** Singleton Git API Service */
export const gitAPIService = new GitAPIService()
