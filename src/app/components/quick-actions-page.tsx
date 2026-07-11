/**
 * @file quick-actions-page.tsx
 * @description AI Quick Actions - Smart one-click operations for code, documents, text, and AI-powered workflows.
 *              Includes clipboard history, context-aware suggestions, and batch processing.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,AI,quick-actions,interaction
 */

import {
  AlertTriangle,
  AlignLeft,
  ArrowRightLeft,
  BookOpen,
  Braces,
  Brain,
  Check,
  ChevronRight,
  Clipboard,
  Clock,
  Code,
  Copy,
  Expand,
  Eye,
  FileCode,
  FileDown,
  FileText,
  Globe,
  Hash,
  Languages,
  ListTree,
  Loader2,
  MessageSquare,
  PenTool,
  Play,
  RefreshCw,
  Replace,
  Search,
  Sparkles,
  SpellCheck,
  Terminal,
  TestTube,
  Trash2,
  Type,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'

// ==========================================
// Types
// ==========================================

type ActionType =
  | 'copy'
  | 'copyMarkdown'
  | 'copyHTML'
  | 'replace'
  | 'refactor'
  | 'optimize'
  | 'format'
  | 'testGenerate'
  | 'docGenerate'
  | 'formatDoc'
  | 'convertDoc'
  | 'exportDoc'
  | 'summarizeDoc'
  | 'translate'
  | 'rewrite'
  | 'expand'
  | 'correct'
  | 'explain'
  | 'comment'
  | 'findIssues'

type ActionTarget = 'code' | 'text' | 'document' | 'ai'
type ActionStatus = 'idle' | 'processing' | 'success' | 'error'

interface QuickAction {
  id: string
  type: ActionType
  target: ActionTarget
  title: string
  description: string
  icon: typeof Copy
  color: string
  shortcut?: string
  requiresAI: boolean
  status: ActionStatus
}

interface ClipboardItem {
  id: string
  content: string
  type: 'text' | 'code' | 'html'
  language?: string
  copiedAt: number
  sourceFile?: string
  size: number
}

// ==========================================
// Action Definitions
// ==========================================

const CODE_ACTIONS: QuickAction[] = [
  {
    id: 'copy',
    type: 'copy',
    target: 'code',
    title: 'quickActions.copy',
    description: 'quickActions.copyDesc',
    icon: Copy,
    color: '#00f0ff',
    shortcut: 'Ctrl+C',
    requiresAI: false,
    status: 'idle',
  },
  {
    id: 'copyMd',
    type: 'copyMarkdown',
    target: 'code',
    title: 'quickActions.copyMd',
    description: 'quickActions.copyMdDesc',
    icon: Code,
    color: '#00d4ff',
    shortcut: 'Ctrl+Shift+M',
    requiresAI: false,
    status: 'idle',
  },
  {
    id: 'copyHtml',
    type: 'copyHTML',
    target: 'code',
    title: 'quickActions.copyHtml',
    description: 'quickActions.copyHtmlDesc',
    icon: Braces,
    color: '#00ffcc',
    shortcut: 'Ctrl+Shift+H',
    requiresAI: false,
    status: 'idle',
  },
  {
    id: 'replace',
    type: 'replace',
    target: 'code',
    title: 'quickActions.replace',
    description: 'quickActions.replaceDesc',
    icon: Replace,
    color: '#8b5cf6',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'refactor',
    type: 'refactor',
    target: 'code',
    title: 'quickActions.refactor',
    description: 'quickActions.refactorDesc',
    icon: RefreshCw,
    color: '#22c55e',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'optimize',
    type: 'optimize',
    target: 'code',
    title: 'quickActions.optimize',
    description: 'quickActions.optimizeDesc',
    icon: Zap,
    color: '#eab308',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'format',
    type: 'format',
    target: 'code',
    title: 'quickActions.format',
    description: 'quickActions.formatDesc',
    icon: AlignLeft,
    color: '#06b6d4',
    shortcut: 'Ctrl+Shift+F',
    requiresAI: false,
    status: 'idle',
  },
  {
    id: 'testGen',
    type: 'testGenerate',
    target: 'code',
    title: 'quickActions.testGen',
    description: 'quickActions.testGenDesc',
    icon: TestTube,
    color: '#f97316',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'docGen',
    type: 'docGenerate',
    target: 'code',
    title: 'quickActions.docGen',
    description: 'quickActions.docGenDesc',
    icon: BookOpen,
    color: '#ec4899',
    requiresAI: true,
    status: 'idle',
  },
]

const DOCUMENT_ACTIONS: QuickAction[] = [
  {
    id: 'formatDoc',
    type: 'formatDoc',
    target: 'document',
    title: 'quickActions.formatDoc',
    description: 'quickActions.formatDocDesc',
    icon: AlignLeft,
    color: '#8b5cf6',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'convertDoc',
    type: 'convertDoc',
    target: 'document',
    title: 'quickActions.convertDoc',
    description: 'quickActions.convertDocDesc',
    icon: ArrowRightLeft,
    color: '#3b82f6',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'exportDoc',
    type: 'exportDoc',
    target: 'document',
    title: 'quickActions.exportDoc',
    description: 'quickActions.exportDocDesc',
    icon: FileDown,
    color: '#22c55e',
    requiresAI: false,
    status: 'idle',
  },
  {
    id: 'summarizeDoc',
    type: 'summarizeDoc',
    target: 'document',
    title: 'quickActions.summarize',
    description: 'quickActions.summarizeDesc',
    icon: ListTree,
    color: '#f97316',
    requiresAI: true,
    status: 'idle',
  },
]

const TEXT_ACTIONS: QuickAction[] = [
  {
    id: 'translate',
    type: 'translate',
    target: 'text',
    title: 'quickActions.translate',
    description: 'quickActions.translateDesc',
    icon: Languages,
    color: '#14b8a6',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'rewrite',
    type: 'rewrite',
    target: 'text',
    title: 'quickActions.rewrite',
    description: 'quickActions.rewriteDesc',
    icon: PenTool,
    color: '#8b5cf6',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'expand',
    type: 'expand',
    target: 'text',
    title: 'quickActions.expand',
    description: 'quickActions.expandDesc',
    icon: Expand,
    color: '#3b82f6',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'correct',
    type: 'correct',
    target: 'text',
    title: 'quickActions.correct',
    description: 'quickActions.correctDesc',
    icon: SpellCheck,
    color: '#22c55e',
    requiresAI: true,
    status: 'idle',
  },
]

const AI_ACTIONS: QuickAction[] = [
  {
    id: 'explain',
    type: 'explain',
    target: 'ai',
    title: 'quickActions.explain',
    description: 'quickActions.explainDesc',
    icon: Eye,
    color: '#00f0ff',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'comment',
    type: 'comment',
    target: 'ai',
    title: 'quickActions.comments',
    description: 'quickActions.commentsDesc',
    icon: MessageSquare,
    color: '#22c55e',
    requiresAI: true,
    status: 'idle',
  },
  {
    id: 'findIssues',
    type: 'findIssues',
    target: 'ai',
    title: 'quickActions.findIssues',
    description: 'quickActions.findIssuesDesc',
    icon: AlertTriangle,
    color: '#ef4444',
    requiresAI: true,
    status: 'idle',
  },
]

type TabId = 'code' | 'document' | 'text' | 'ai' | 'clipboard' | 'context'

const TABS: { id: TabId; labelKey: string; icon: typeof Code; color: string }[] = [
  { id: 'code', labelKey: 'quickActions.code', icon: Terminal, color: '#00f0ff' },
  { id: 'document', labelKey: 'quickActions.document', icon: FileText, color: '#8b5cf6' },
  { id: 'text', labelKey: 'quickActions.text', icon: Type, color: '#14b8a6' },
  { id: 'ai', labelKey: 'quickActions.aiAssist', icon: Brain, color: '#f97316' },
  { id: 'clipboard', labelKey: 'quickActions.clipboard', icon: Clipboard, color: '#22c55e' },
  { id: 'context', labelKey: 'quickActions.context', icon: Sparkles, color: '#ec4899' },
]

// ==========================================
// Mock Data
// ==========================================

const SAMPLE_CODE = `import React, { useState, useEffect } from 'react';

interface UserProps {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'editor';
}

export function UserCard({ name, email, role }: UserProps) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsOnline(prev => !prev);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
      <span className={role}>{role}</span>
      {isOnline && <span className="online">Online</span>}
    </div>
  );
}`

const MOCK_CLIPBOARD: ClipboardItem[] = [
  {
    id: 'c1',
    content: 'const result = await fetchData(url);',
    type: 'code',
    language: 'typescript',
    copiedAt: Date.now() - 60000,
    sourceFile: 'api.ts',
    size: 38,
  },
  {
    id: 'c2',
    content:
      '# Quick Actions Documentation\n\nThis module provides intelligent one-click operations.',
    type: 'text',
    copiedAt: Date.now() - 300000,
    size: 82,
  },
  {
    id: 'c3',
    content: '<div class="container"><h1>Hello World</h1></div>',
    type: 'html',
    copiedAt: Date.now() - 600000,
    size: 49,
  },
  {
    id: 'c4',
    content: 'export interface QuickAction { id: string; type: ActionType; }',
    type: 'code',
    language: 'typescript',
    copiedAt: Date.now() - 1200000,
    sourceFile: 'types.ts',
    size: 61,
  },
  {
    id: 'c5',
    content: 'npm install @radix-ui/react-dialog motion lucide-react',
    type: 'text',
    copiedAt: Date.now() - 1800000,
    size: 53,
  },
]

const CONTEXT_SUGGESTIONS = [
  {
    id: 'cs1',
    actionKey: 'quickActions.suggestion1',
    reasonKey: 'quickActions.suggestion1Reason',
    confidence: 92,
    color: '#22c55e',
  },
  {
    id: 'cs2',
    actionKey: 'quickActions.suggestion2',
    reasonKey: 'quickActions.suggestion2Reason',
    confidence: 88,
    color: '#f97316',
  },
  {
    id: 'cs3',
    actionKey: 'quickActions.suggestion3',
    reasonKey: 'quickActions.suggestion3Reason',
    confidence: 85,
    color: '#8b5cf6',
  },
  {
    id: 'cs4',
    actionKey: 'quickActions.suggestion4',
    reasonKey: 'quickActions.suggestion4Reason',
    confidence: 78,
    color: '#06b6d4',
  },
  {
    id: 'cs5',
    actionKey: 'quickActions.suggestion5',
    reasonKey: 'quickActions.suggestion5Reason',
    confidence: 95,
    color: '#ef4444',
  },
]

// ==========================================
// Sub-components
// ==========================================

function ActionCard({
  action,
  tc,
  onExecute,
}: {
  action: QuickAction
  tc: ReturnType<typeof useThemeColors>
  onExecute: (action: QuickAction) => void
}) {
  const { t } = useI18n()
  const [status, setStatus] = useState<ActionStatus>('idle')
  const Icon = action.icon

  const handleClick = useCallback(() => {
    if (status === 'processing') return
    setStatus('processing')
    onExecute(action)
    const duration = action.requiresAI ? 1500 + Math.random() * 1000 : 300 + Math.random() * 400
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    }, duration)
  }, [action, onExecute, status])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={handleClick}
        disabled={status === 'processing'}
        className="w-full text-left rounded-2xl p-4 border transition-all duration-300 group relative overflow-hidden"
        style={{
          background: status === 'success' ? `${action.color}12` : tc.bgCard,
          borderColor:
            status === 'success'
              ? `${action.color}40`
              : status === 'processing'
                ? `${action.color}30`
                : tc.borderDefault,
          boxShadow:
            status === 'success'
              ? `0 0 20px ${action.color}20, inset 0 1px 0 rgba(255,255,255,0.08)`
              : `inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Shimmer overlay when processing */}
        {status === 'processing' && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(90deg, transparent, ${action.color}30, transparent)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}

        <div className="flex items-start gap-3 relative z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
            style={{
              background: `${action.color}15`,
              border: `1px solid ${action.color}30`,
              boxShadow: status !== 'idle' ? `0 0 12px ${action.color}30` : 'none',
            }}
          >
            {status === 'processing' ? (
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: action.color }} />
            ) : status === 'success' ? (
              <Check className="w-5 h-5" style={{ color: action.color }} />
            ) : (
              <Icon
                className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                style={{ color: action.color }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm" style={{ color: tc.textPrimary }}>
                {t(action.title)}
              </span>
              {action.requiresAI && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${action.color}15`,
                    color: action.color,
                    border: `1px solid ${action.color}25`,
                  }}
                >
                  AI
                </span>
              )}
            </div>
            <p className="text-[11px] truncate" style={{ color: tc.textMuted }}>
              {t(action.description)}
            </p>
            {action.shortcut && (
              <span
                className="inline-block text-[9px] mt-1 px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: tc.textMuted,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {action.shortcut}
              </span>
            )}
          </div>
          <ChevronRight
            className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity shrink-0 mt-1"
            style={{ color: tc.textMuted }}
          />
        </div>
      </button>
    </motion.div>
  )
}

function ClipboardPanel({
  tc,
  t,
}: {
  tc: ReturnType<typeof useThemeColors>
  t: ReturnType<typeof useI18n>['t']
}) {
  const [items, setItems] = useState(MOCK_CLIPBOARD)
  const [filter, setFilter] = useState<'all' | 'code' | 'text' | 'html'>('all')

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return t('quickActions.justNow')
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content).catch(() => {})
  }, [])

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const typeColors: Record<string, string> = { code: '#00f0ff', text: '#22c55e', html: '#f97316' }

  const filterLabels: Record<string, string> = {
    all: t('quickActions.clipboard.all'),
    code: t('quickActions.clipboard.code'),
    text: t('quickActions.clipboard.text'),
    html: t('quickActions.clipboard.html'),
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {(['all', 'code', 'text', 'html'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-200"
            style={{
              background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderColor: filter === f ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
              color: filter === f ? tc.textPrimary : tc.textMuted,
            }}
          >
            {filterLabels[f]}
            <span className="ml-1 opacity-50">
              ({f === 'all' ? items.length : items.filter((i) => i.type === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border p-3 group"
              style={{
                background: tc.bgCard,
                borderColor: tc.borderDefault,
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      background: `${typeColors[item.type]}15`,
                      color: typeColors[item.type],
                      border: `1px solid ${typeColors[item.type]}25`,
                    }}
                  >
                    {filterLabels[item.type]}
                  </span>
                  {item.language && (
                    <span className="text-[9px]" style={{ color: tc.textMuted }}>
                      {item.language}
                    </span>
                  )}
                  {item.sourceFile && (
                    <span className="text-[9px]" style={{ color: tc.textMuted }}>
                      {item.sourceFile}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px]" style={{ color: tc.textMuted }}>
                    <Clock className="w-3 h-3 inline mr-0.5" style={{ verticalAlign: 'middle' }} />
                    {formatTime(item.copiedAt)}
                  </span>
                  <span className="text-[9px]" style={{ color: tc.textMuted }}>
                    {item.size}B
                  </span>
                </div>
              </div>
              <pre
                className="text-[11px] p-2 rounded-lg overflow-x-auto max-h-20"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: tc.textSecondary,
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {item.content}
              </pre>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(item.content)}
                  className="text-[10px] px-2 py-1 rounded-md border transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', color: tc.textMuted }}
                >
                  <Copy className="w-3 h-3 inline mr-1" /> {t('quickActions.clipboard.copy')}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-[10px] px-2 py-1 rounded-md border transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#ef4444' }}
                >
                  <Trash2 className="w-3 h-3 inline mr-1" /> {t('quickActions.clipboard.remove')}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-8" style={{ color: tc.textMuted }}>
            <Clipboard className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t('quickActions.clipboard.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ContextPanel({
  tc,
  t,
}: {
  tc: ReturnType<typeof useThemeColors>
  t: ReturnType<typeof useI18n>['t']
}) {
  return (
    <div className="space-y-4">
      {/* Context-aware header */}
      <div
        className="rounded-xl border p-4"
        style={{
          background: `linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.05))`,
          borderColor: 'rgba(236,72,153,0.2)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" style={{ color: '#ec4899' }} />
          <span className="text-sm" style={{ color: tc.textPrimary }}>
            {t('quickActions.context.title')}
          </span>
        </div>
        <p className="text-[11px]" style={{ color: tc.textMuted }}>
          {t('quickActions.context.desc')}
        </p>
      </div>

      {/* Current context */}
      <div
        className="rounded-xl border p-4"
        style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
      >
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
          {t('quickActions.context.current')}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4" style={{ color: '#00f0ff' }} />
            <span className="text-[12px]" style={{ color: tc.textSecondary }}>
              {t('quickActions.context.file')}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff' }}
            >
              {t('quickActions.context.language')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" style={{ color: '#22c55e' }} />
            <span className="text-[12px]" style={{ color: tc.textSecondary }}>
              {t('quickActions.context.selected')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            <span className="text-[12px]" style={{ color: tc.textSecondary }}>
              {t('quickActions.context.project')}
            </span>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
          {t('quickActions.context.suggestions')}
        </p>
        <div className="space-y-2">
          {CONTEXT_SUGGESTIONS.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-xl border p-3 cursor-pointer group transition-all duration-300"
              style={{
                background: tc.bgCard,
                borderColor: tc.borderDefault,
              }}
              whileHover={{
                borderColor: `${s.color}40`,
                boxShadow: `0 0 15px ${s.color}15`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Play className="w-3 h-3" style={{ color: s.color }} />
                    <span className="text-[12px]" style={{ color: tc.textPrimary }}>
                      {t(s.actionKey)}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: tc.textMuted }}>
                    {t(s.reasonKey)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${s.color}15`,
                      color: s.color,
                      border: `1px solid ${s.color}25`,
                    }}
                  >
                    {s.confidence}%
                  </div>
                  <ChevronRight
                    className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: tc.textMuted }}
                  />
                </div>
              </div>
              {/* Confidence bar */}
              <div
                className="mt-2 h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.confidence}%` }}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
                  style={{ background: s.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CodePreviewPanel({
  tc,
  t,
}: {
  tc: ReturnType<typeof useThemeColors>
  t: ReturnType<typeof useI18n>['t']
}) {
  const [selectedLang] = useState('typescript')

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: tc.borderDefault, background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4" style={{ color: '#00f0ff' }} />
          <span className="text-[11px]" style={{ color: tc.textSecondary }}>
            {t('quickActions.context.file')}
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff' }}
          >
            {selectedLang}
          </span>
        </div>
        <span className="text-[9px]" style={{ color: tc.textMuted }}>
          {t('quickActions.codePreview.selected')}
        </span>
      </div>
      {/* Code */}
      <pre
        className="p-4 text-[11px] overflow-auto max-h-[320px]"
        style={{
          color: tc.textSecondary,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          lineHeight: 1.6,
        }}
      >
        {SAMPLE_CODE.split('\n').map((line, i) => (
          <div key={i} className="flex">
            <span
              className="w-8 text-right mr-4 select-none shrink-0"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              {i + 1}
            </span>
            <span>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  )
}

// ==========================================
// Stats Bar
// ==========================================

function StatsBar({
  tc,
  t,
}: {
  tc: ReturnType<typeof useThemeColors>
  t: ReturnType<typeof useI18n>['t']
}) {
  const stats = [
    { label: t('quickActions.stats.actionsToday'), value: '47', icon: Zap, color: '#00f0ff' },
    { label: t('quickActions.stats.aiCalls'), value: '23', icon: Brain, color: '#8b5cf6' },
    {
      label: t('quickActions.stats.clipboardItems'),
      value: '12',
      icon: Clipboard,
      color: '#22c55e',
    },
    { label: t('quickActions.stats.timeSaved'), value: '2.4h', icon: Clock, color: '#f97316' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border p-3 flex items-center gap-3"
            style={{
              background: tc.bgCard,
              borderColor: tc.borderDefault,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}
            >
              <Icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[18px]" style={{ color: tc.textPrimary }}>
                {s.value}
              </p>
              <p className="text-[10px]" style={{ color: tc.textMuted }}>
                {s.label}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ==========================================
// Main Component
// ==========================================

export function QuickActionsPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<TabId>('code')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLog, setActionLog] = useState<
    { id: string; title: string; status: string; time: number }[]
  >([])

  const handleExecute = useCallback((action: QuickAction) => {
    setActionLog((prev) => [
      { id: crypto.randomUUID(), title: action.title, status: 'success', time: Date.now() },
      ...prev.slice(0, 9),
    ])
  }, [])

  const getActions = (): QuickAction[] => {
    switch (activeTab) {
      case 'code':
        return CODE_ACTIONS
      case 'document':
        return DOCUMENT_ACTIONS
      case 'text':
        return TEXT_ACTIONS
      case 'ai':
        return AI_ACTIONS
      default:
        return []
    }
  }

  const actions = getActions()
  const filteredActions = searchQuery
    ? actions.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : actions

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-6" style={{ background: tc.bgBase }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(139,92,246,0.1))',
                  border: '1px solid rgba(0,240,255,0.25)',
                  boxShadow: '0 0 15px rgba(0,240,255,0.15)',
                }}
              >
                <Zap className="w-5 h-5" style={{ color: '#00f0ff' }} />
              </div>
              <div>
                <h1 className="text-xl" style={{ color: tc.textPrimary }}>
                  {t('quickActions.headerTitle')}
                </h1>
                <p className="text-[11px]" style={{ color: tc.textMuted }}>
                  {t('quickActions.headerSubtitle')}
                </p>
              </div>
            </div>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: tc.textMuted }}
            />
            <input
              type="text"
              placeholder={t('quickActions.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[12px] rounded-xl border outline-none transition-all duration-200"
              style={{
                background: tc.bgInput,
                borderColor: tc.borderDefault,
                color: tc.textPrimary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `${tc.primary}50`
                e.currentTarget.style.boxShadow = `0 0 0 3px ${tc.primary}15`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tc.borderDefault
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <StatsBar tc={tc} t={t} />

      {/* Tab Navigation */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl border overflow-x-auto"
        style={{
          background: tc.bgCard,
          borderColor: tc.borderDefault,
          backdropFilter: tc.backdropFilter,
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] whitespace-nowrap transition-all duration-200"
              style={{
                background: active ? `${tab.color}15` : 'transparent',
                color: active ? tab.color : tc.textMuted,
                border: active ? `1px solid ${tab.color}30` : '1px solid transparent',
                boxShadow: active ? `0 0 10px ${tab.color}15` : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(tab.labelKey)}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Actions Panel */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'clipboard' ? (
              <motion.div
                key="clipboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ClipboardPanel tc={tc} t={t} />
              </motion.div>
            ) : activeTab === 'context' ? (
              <motion.div
                key="context"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ContextPanel tc={tc} t={t} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredActions.map((action) => (
                    <ActionCard key={action.id} action={action} tc={tc} onExecute={handleExecute} />
                  ))}
                </div>
                {filteredActions.length === 0 && (
                  <div className="text-center py-12" style={{ color: tc.textMuted }}>
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t('quickActions.noResults')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Code Preview + Action Log */}
        <div className="space-y-4">
          {/* Code Preview */}
          <CodePreviewPanel tc={tc} t={t} />

          {/* Recent Action Log */}
          <div
            className="rounded-xl border p-4"
            style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: tc.textMuted }} />
                <span className="text-[11px]" style={{ color: tc.textSecondary }}>
                  {t('quickActions.actionLog.title')}
                </span>
              </div>
              <span className="text-[9px]" style={{ color: tc.textMuted }}>
                {actionLog.length} {t('quickActions.actionLog.items')}
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {actionLog.length === 0 ? (
                <p className="text-[11px] text-center py-4" style={{ color: tc.textMuted }}>
                  {t('quickActions.actionLog.empty')}
                </p>
              ) : (
                actionLog.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
                      <span className="text-[11px]" style={{ color: tc.textSecondary }}>
                        {t(log.title)}
                      </span>
                    </div>
                    <span className="text-[9px]" style={{ color: tc.textMuted }}>
                      {new Date(log.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div
            className="rounded-xl border p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(139,92,246,0.03))',
              borderColor: 'rgba(0,240,255,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: '#00f0ff' }} />
              <span className="text-[11px]" style={{ color: tc.textPrimary }}>
                {t('quickActions.proTips.title')}
              </span>
            </div>
            <ul className="space-y-1.5">
              {[
                t('quickActions.proTips.tip1'),
                t('quickActions.proTips.tip2'),
                t('quickActions.proTips.tip3'),
                t('quickActions.proTips.tip4'),
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#00f0ff' }} />
                  <span className="text-[10px]" style={{ color: tc.textMuted }}>
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
