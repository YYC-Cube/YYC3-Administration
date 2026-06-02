/**
 * @file git-integration-panel.tsx
 * @description YYC³ Developer Workspace — Git Integration panel with status view,
 *   commit log, GitHub API configuration, push/pull actions, and real API integration.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,git-integration
 */

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  File,
  GitBranch,
  GitCommit,
  Loader2,
  Plus,
  Upload,
} from 'lucide-react'
import { useCallback, useState } from 'react'

import { gitAPIService } from '../services/git-api-service'

import { MOCK_GIT_LOG, MOCK_GIT_STATUS, timeAgo } from './panel-helpers'

import type { ThemeColors } from '../hooks/use-theme-colors'

export function GitIntegrationPanel({ tc }: { tc: ThemeColors }) {
  const [activeTab, setActiveTab] = useState<'status' | 'log' | 'config'>('status')
  const [gitToken, setGitToken] = useState('')
  const [gitOwner, setGitOwner] = useState('YanYuCloudCube')
  const [gitRepo, setGitRepo] = useState('yyc3-cloudpivot')
  const [apiCommits, setApiCommits] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const gitStatus = MOCK_GIT_STATUS
  const gitLog = MOCK_GIT_LOG

  const handleConnectGit = useCallback(async () => {
    if (!gitToken) return
    gitAPIService.configure({
      token: gitToken,
      owner: gitOwner,
      repo: gitRepo,
      branch: gitStatus.branch,
    })
    setLoading(true)
    const result = await gitAPIService.listCommits(10)
    if (result.success) setApiCommits(result.data)
    setLoading(false)
  }, [gitToken, gitOwner, gitRepo, gitStatus.branch])

  const handlePush = useCallback(async () => {
    if (!gitAPIService.isConfigured) return
    const result = await gitAPIService.createCommit(
      'src/app/components/left-panel-page.tsx',
      '// Updated by YYC³ IDE\n',
      'chore: push from YYC³ Developer Workspace',
    )
    if (result.success) {
      const commits = await gitAPIService.listCommits(10)
      if (commits.success) setApiCommits(commits.data)
    }
  }, [])

  const handlePull = useCallback(async () => {
    setLoading(true)
    if (gitAPIService.isConfigured) {
      const result = await gitAPIService.listCommits(10)
      if (result.success) setApiCommits(result.data)
    }
    setLoading(false)
  }, [])

  const displayLog =
    apiCommits ??
    gitLog.map((c) => ({
      sha: c.hash,
      message: c.message,
      author: { name: c.author, date: new Date(c.date).toISOString() },
      filesChanged: c.files,
    }))

  const statusItems = [
    { label: '已修改', count: gitStatus.modified, color: '#eab308', icon: Edit3 },
    { label: '已暂存', count: gitStatus.staged, color: '#22c55e', icon: Plus },
    { label: '未跟踪', count: gitStatus.untracked, color: '#6b7280', icon: File },
    { label: '冲突', count: gitStatus.conflicts, color: '#ef4444', icon: AlertTriangle },
  ]

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        <span className="text-[11px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
          Git
        </span>
        <div className="flex items-center gap-1">
          {(['status', 'log', 'config'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-[9px] px-2 py-0.5 rounded transition-all"
              style={{
                background: activeTab === tab ? `${tc.primary}12` : 'transparent',
                color: activeTab === tab ? tc.primary : tc.textMuted,
              }}
            >
              {tab === 'config' ? '⚙️' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div
        className="px-3 py-2 border-b flex items-center gap-2"
        style={{ borderColor: tc.borderSubtle }}
      >
        <GitBranch className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
        <span className="text-[11px]" style={{ color: tc.textPrimary }}>
          {gitStatus.branch}
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          {gitStatus.ahead > 0 && (
            <span
              className="text-[8px] px-1 py-0.5 rounded"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
            >
              +{gitStatus.ahead}
            </span>
          )}
          {gitStatus.behind > 0 && (
            <span
              className="text-[8px] px-1 py-0.5 rounded"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              -{gitStatus.behind}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'status' && (
          <div className="py-2 space-y-2">
            {statusItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2 px-3 py-1">
                  <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  <span className="text-[11px] flex-1" style={{ color: tc.textSecondary }}>
                    {item.label}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={{
                      background: item.count > 0 ? `${item.color}12` : 'transparent',
                      color: item.count > 0 ? item.color : tc.textMuted,
                    }}
                  >
                    {item.count}
                  </span>
                </div>
              )
            })}

            <div
              className="px-3 pt-2 space-y-1.5 border-t"
              style={{ borderColor: tc.borderSubtle }}
            >
              <p
                className="text-[9px] uppercase tracking-wider mb-1"
                style={{ color: tc.textMuted }}
              >
                操作
              </p>
              {[
                { label: '全部暂存', icon: Plus, color: '#22c55e', action: () => {} },
                { label: '提交', icon: GitCommit, color: '#3b82f6', action: () => {} },
                { label: '推送', icon: Upload, color: '#f97316', action: handlePush },
                { label: '拉取', icon: Download, color: '#a78bfa', action: handlePull },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: tc.borderSubtle, color: action.color }}
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                  {action.label === '推送' && gitAPIService.isConfigured && (
                    <span className="text-[7px] ml-auto opacity-50">API</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="py-1">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: tc.primary }} />
              </div>
            )}
            {!loading &&
              displayLog.map((commit: any) => (
                <div
                  key={commit.sha}
                  className="px-3 py-2 border-b transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: tc.borderSubtle }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <GitCommit className="w-3 h-3 shrink-0" style={{ color: '#a78bfa' }} />
                    <span className="text-[8px] font-mono" style={{ color: '#a78bfa' }}>
                      {typeof commit.sha === 'string' ? commit.sha.substring(0, 7) : commit.sha}
                    </span>
                    <span className="text-[8px] ml-auto" style={{ color: tc.textMuted }}>
                      {commit.author?.date ? timeAgo(new Date(commit.author.date).getTime()) : ''}
                    </span>
                  </div>
                  <p className="text-[10px] ml-5" style={{ color: tc.textPrimary }}>
                    {commit.message}
                  </p>
                  <div className="flex items-center gap-2 ml-5 mt-0.5">
                    <span className="text-[8px]" style={{ color: tc.textMuted }}>
                      {commit.author?.name ?? ''}
                    </span>
                    <span className="text-[8px]" style={{ color: tc.textMuted }}>
                      {commit.filesChanged ?? 0} 文件
                    </span>
                  </div>
                </div>
              ))}
            {apiCommits && (
              <p className="text-[8px] text-center py-1" style={{ color: '#22c55e' }}>
                通过 GitHub API
              </p>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="px-3 py-2 space-y-2">
            <p className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
              GitHub API 配置
            </p>
            <div>
              <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                个人访问令牌
              </label>
              <input
                type="password"
                value={gitToken}
                onChange={(e) => setGitToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full text-[10px] px-2 py-1.5 rounded-lg border outline-none font-mono"
                style={{
                  background: tc.bgInput,
                  borderColor: tc.borderDefault,
                  color: tc.textPrimary,
                }}
              />
              <p className="text-[7px] mt-0.5" style={{ color: tc.textMuted }}>
                所需权限范围：repo, read:org
              </p>
            </div>
            <div>
              <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                所有者 / 仓库
              </label>
              <div className="flex gap-1">
                <input
                  value={gitOwner}
                  onChange={(e) => setGitOwner(e.target.value)}
                  placeholder="owner"
                  className="flex-1 text-[10px] px-2 py-1.5 rounded-lg border outline-none"
                  style={{
                    background: tc.bgInput,
                    borderColor: tc.borderDefault,
                    color: tc.textPrimary,
                  }}
                />
                <span className="text-[11px] self-center" style={{ color: tc.textMuted }}>
                  /
                </span>
                <input
                  value={gitRepo}
                  onChange={(e) => setGitRepo(e.target.value)}
                  placeholder="repo"
                  className="flex-1 text-[10px] px-2 py-1.5 rounded-lg border outline-none"
                  style={{
                    background: tc.bgInput,
                    borderColor: tc.borderDefault,
                    color: tc.textPrimary,
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleConnectGit}
              disabled={!gitToken || loading}
              className="w-full text-[10px] py-1.5 rounded-lg border transition-all hover:bg-white/5 flex items-center justify-center gap-1.5"
              style={{
                borderColor: `${tc.primary}30`,
                color: tc.primary,
                opacity: !gitToken ? 0.4 : 1,
              }}
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <GitBranch className="w-3 h-3" />
              )}
              {gitAPIService.isConfigured ? '重新连接' : '连接 GitHub'}
            </button>
            {gitAPIService.isConfigured && (
              <p className="text-[8px] flex items-center gap-1" style={{ color: '#22c55e' }}>
                <CheckCircle2 className="w-3 h-3" /> 已连接 · {gitOwner}/{gitRepo}
              </p>
            )}
            <div className="pt-2 border-t" style={{ borderColor: tc.borderSubtle }}>
              <p className="text-[8px]" style={{ color: tc.textMuted }}>
                生产环境中，请使用服务端代理保护您的令牌。在 ai-proxy-service.ts 中配置
                PROXY_BASE_URL 实现安全 API 路由。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
