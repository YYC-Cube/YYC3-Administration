/**
 * @file global-search-panel.tsx
 * @description YYC³ Developer Workspace — Global Search panel with file tree search,
 *   content/symbol/command modes, search history, and real file tree integration.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,global-search
 */

import { File, Hash, History, Loader2, Search, X, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getFileIcon, MOCK_FILE_TREE, MOCK_SEARCH_RESULTS } from './panel-helpers'
import { usePanelStore } from './panel-store'

import type { FileNode, SearchResult } from './panel-types'
import type { ThemeColors } from '../hooks/use-theme-colors'

// Flatten file tree for searching
function flattenTree(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children) result.push(...flattenTree(node.children))
  }
  return result
}

export function GlobalSearchPanel({ tc }: { tc: ThemeColors }) {
  const { searchHistory, addSearchHistory, fileTree, selectFile, addRecentFile, setActivePanel } =
    usePanelStore()
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState<'files' | 'content' | 'symbols' | 'commands'>(
    'files',
  )
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  // Use real file tree if available
  const activeTree = fileTree.length > 0 ? fileTree : MOCK_FILE_TREE
  const flatFiles = useMemo(() => flattenTree(activeTree), [activeTree])

  const handleSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        return
      }
      setSearching(true)
      addSearchHistory(q.trim())

      await new Promise((r) => setTimeout(r, 200 + Math.random() * 200))

      const lowerQ = q.toLowerCase()

      if (searchType === 'files') {
        // Search real file tree
        const fileResults: SearchResult[] = flatFiles
          .filter(
            (f) => f.name.toLowerCase().includes(lowerQ) || f.path.toLowerCase().includes(lowerQ),
          )
          .slice(0, 20)
          .map((f) => ({
            id: f.id,
            type: 'file' as const,
            title: f.name,
            description:
              f.type === 'directory'
                ? 'Directory'
                : `${f.language ?? f.name.split('.').pop()} file`,
            filePath: f.path,
            score: f.name.toLowerCase().startsWith(lowerQ) ? 0.95 : 0.7 + Math.random() * 0.2,
          }))

        setResults(
          fileResults.length > 0
            ? fileResults
            : (MOCK_SEARCH_RESULTS.files?.slice(0, 3).map((r) => ({ ...r, score: 0.4 })) ?? []),
        )
      } else {
        // Use mock data for content/symbols/commands
        const pool = MOCK_SEARCH_RESULTS[searchType] ?? []
        const filtered = pool.filter(
          (r) =>
            r.title.toLowerCase().includes(lowerQ) ||
            r.description?.toLowerCase().includes(lowerQ) ||
            r.filePath.toLowerCase().includes(lowerQ),
        )
        setResults(
          filtered.length > 0
            ? filtered
            : pool.slice(0, 3).map((r) => ({ ...r, score: 0.5 + Math.random() * 0.3 })),
        )
      }
      setSearching(false)
    },
    [searchType, addSearchHistory, flatFiles],
  )

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  const handleOpenResult = useCallback(
    (result: SearchResult) => {
      if (result.type === 'file') {
        const node = flatFiles.find((f) => f.path === result.filePath || f.id === result.id)
        if (node && node.type === 'file') {
          selectFile(node.path)
          addRecentFile({
            id: node.id,
            name: node.name,
            path: node.path,
            type: 'recent',
            lastAccessed: Date.now(),
            language: node.language,
          })
        } else if (node && node.type === 'directory') {
          setActivePanel('file-explorer')
        }
      }
    },
    [flatFiles, selectFile, addRecentFile, setActivePanel],
  )

  const typeIcons: Record<string, { icon: typeof File; color: string }> = {
    file: { icon: File, color: '#3b82f6' },
    content: { icon: Search, color: '#22c55e' },
    symbol: { icon: Hash, color: '#f97316' },
    command: { icon: Zap, color: '#a78bfa' },
  }

  const tabs = [
    {
      key: 'files' as const,
      label: '文件',
      count: searchType === 'files' && results.length > 0 ? results.length : undefined,
    },
    { key: 'content' as const, label: '内容' },
    { key: 'symbols' as const, label: '符号' },
    { key: 'commands' as const, label: '命令' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b" style={{ borderColor: tc.borderSubtle }}>
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: tc.textMuted }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文件、内容、符号..."
            className="w-full pl-8 pr-7 py-1.5 text-[11px] rounded-lg border outline-none transition-all"
            style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = `${tc.primary}50`
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = tc.borderDefault
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-3 h-3" style={{ color: tc.textMuted }} />
            </button>
          )}
        </div>
        <div className="flex gap-0.5 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchType(tab.key)}
              className="text-[9px] px-2 py-1 rounded-md transition-all flex items-center gap-1"
              style={{
                background: searchType === tab.key ? `${tc.primary}12` : 'transparent',
                color: searchType === tab.key ? tc.primary : tc.textMuted,
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className="text-[7px] px-1 rounded-full"
                  style={{ background: `${tc.primary}15` }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searching && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: tc.primary }} />
          </div>
        )}
        {!searching &&
          results.length > 0 &&
          results.map((r) => {
            const isFileResult = r.type === 'file'
            const fileIcon = isFileResult
              ? getFileIcon(r.title)
              : (typeIcons[r.type] ?? typeIcons.file)
            const ResultIcon = isFileResult ? fileIcon.icon : (typeIcons[r.type]?.icon ?? File)
            const iconColor = isFileResult
              ? fileIcon.color
              : (typeIcons[r.type]?.color ?? '#6b7280')
            return (
              <div
                key={r.id}
                onClick={() => handleOpenResult(r)}
                className="px-3 py-2 border-b cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: tc.borderSubtle }}
              >
                <div className="flex items-start gap-2">
                  <ResultIcon
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    style={{ color: iconColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] truncate" style={{ color: tc.textPrimary }}>
                        {r.title}
                      </p>
                      <span className="text-[8px] shrink-0 ml-1" style={{ color: tc.textMuted }}>
                        {Math.round(r.score * 100)}%
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-[9px] truncate" style={{ color: tc.textMuted }}>
                        {r.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8px] truncate" style={{ color: tc.textMuted }}>
                        {r.filePath}
                      </span>
                      {r.line && (
                        <span className="text-[8px] shrink-0" style={{ color: tc.textMuted }}>
                          :{r.line}
                        </span>
                      )}
                    </div>
                    {r.match && (
                      <p
                        className="text-[9px] mt-1 px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'rgba(255,255,255,0.03)', color: tc.textSecondary }}
                      >
                        {r.match}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        {!searching && !query && searchHistory.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: tc.textMuted }}>
              最近搜索
            </p>
            {searchHistory.map((h, i) => (
              <button
                key={i}
                onClick={() => setQuery(h)}
                className="w-full text-left flex items-center gap-2 px-2 py-1 rounded-md transition-colors hover:bg-white/5"
              >
                <History className="w-3 h-3" style={{ color: tc.textMuted }} />
                <span className="text-[10px]" style={{ color: tc.textSecondary }}>
                  {h}
                </span>
              </button>
            ))}
          </div>
        )}
        {!searching && !query && searchHistory.length === 0 && (
          <div className="px-3 py-4 space-y-2">
            <p className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
              快捷操作
            </p>
            {[
              { label: '浏览所有文件', action: () => setActivePanel('file-explorer') },
              { label: '搜索组件', action: () => setQuery('component') },
              { label: '查找 Hooks', action: () => setQuery('use') },
              { label: '搜索 Store', action: () => setQuery('store') },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left text-[10px] px-2 py-1.5 rounded-md transition-colors hover:bg-white/5 flex items-center gap-2"
                style={{ color: tc.textSecondary }}
              >
                <Search className="w-3 h-3" style={{ color: tc.textMuted }} />
                {item.label}
              </button>
            ))}
          </div>
        )}
        {!searching && query && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Search className="w-6 h-6 mb-1" style={{ color: tc.textMuted }} />
            <span className="text-[10px]" style={{ color: tc.textMuted }}>
              未找到结果
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
