/* eslint-disable react-refresh/only-export-components */
import { Command } from 'cmdk'
import {
  ArrowRight,
  BarChart3,
  Code,
  GitBranch,
  History,
  LayoutDashboard,
  MessageCircle,
  Phone,
  Search,
  Settings,
  Target,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { type PageId, useApp } from './app-context'
import { useI18n } from './i18n-context'

// ==========================================
// YYC³ 命令面板 — Ctrl+K Command Palette
// Cyberpunk-themed global command interface
// ==========================================

interface CommandItem {
  id: string
  label: string
  sublabel?: string
  icon: (props: { className?: string; style?: CSSProperties }) => ReactNode
  color: string
  action: () => void
  category: 'navigation' | 'customer' | 'action' | 'tool' | 'recent'
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

/**
 * Global command palette overlay (Ctrl+K / Cmd+K).
 * Provides fuzzy search across navigation, customer actions,
 * quick operations, and AI tools. Renders as a centered modal with `cmdk`.
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { setActivePage, addActivity } = useApp()
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const navigate = useCallback(
    (page: PageId) => {
      setActivePage(page)
      addActivity({
        action: t('cmd.quickNav'),
        target: page,
        type: 'system',
        color: '#8b5cf6',
      })
      onClose()
    },
    [setActivePage, addActivity, onClose, t],
  )

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: t('nav.dashboard'),
      sublabel: t('cmd.navDashSub'),
      icon: LayoutDashboard,
      color: '#00f0ff',
      action: () => navigate('dashboard'),
      category: 'navigation',
      keywords: ['home', 'main', 'overview'],
    },
    {
      id: 'nav-chat',
      label: t('nav.chat'),
      sublabel: t('cmd.navChatSub'),
      icon: MessageCircle,
      color: '#a855f7',
      action: () => navigate('chat'),
      category: 'navigation',
      keywords: ['ai', 'assistant', 'talk'],
    },
    {
      id: 'nav-clm',
      label: t('nav.clm'),
      sublabel: t('cmd.navClmSub'),
      icon: Users,
      color: '#8b5cf6',
      action: () => navigate('clm'),
      category: 'navigation',
      keywords: ['customer', 'crm'],
    },
    {
      id: 'nav-aicall',
      label: t('nav.aicall'),
      sublabel: t('cmd.navAicallSub'),
      icon: Phone,
      color: '#ef4444',
      action: () => navigate('aicall'),
      category: 'navigation',
      keywords: ['call', 'ai', 'phone'],
    },
    {
      id: 'nav-tools',
      label: t('nav.tools'),
      sublabel: t('cmd.navToolsSub'),
      icon: Wrench,
      color: '#f59e0b',
      action: () => navigate('tools'),
      category: 'navigation',
      keywords: ['utility', 'settings'],
    },
    {
      id: 'nav-workflow',
      label: t('nav.workflow'),
      sublabel: t('cmd.navWorkflowSub'),
      icon: GitBranch,
      color: '#10b981',
      action: () => navigate('workflow'),
      category: 'navigation',
      keywords: ['automation', 'flow'],
    },
    {
      id: 'nav-insights',
      label: t('nav.insights'),
      sublabel: t('cmd.navInsightsSub'),
      icon: BarChart3,
      color: '#22d3ee',
      action: () => navigate('marketingAnalytics'),
      category: 'navigation',
      keywords: ['analytics', 'reports'],
    },
    {
      id: 'nav-quickActions',
      label: t('nav.quickActions'),
      sublabel: t('cmd.navQuickSub'),
      icon: Zap,
      color: '#facc15',
      action: () => navigate('quickActions'),
      category: 'navigation',
    },
    {
      id: 'nav-taskBoard',
      label: t('nav.taskBoard'),
      sublabel: t('cmd.navTaskSub'),
      icon: Target,
      color: '#f472b6',
      action: () => navigate('taskBoard'),
      category: 'navigation',
    },
    {
      id: 'nav-devWorkspace',
      label: t('nav.devWorkspace'),
      sublabel: t('cmd.navDevSub'),
      icon: Code,
      color: '#38bdf8',
      action: () => navigate('devWorkspace'),
      category: 'navigation',
      keywords: ['dev', 'code', 'terminal'],
    },
    {
      id: 'nav-logs',
      label: t('nav.logs'),
      sublabel: t('cmd.navLogsSub'),
      icon: History,
      color: '#64748b',
      action: () => navigate('logs'),
      category: 'navigation',
      keywords: ['history', 'audit'],
    },
    {
      id: 'nav-settings',
      label: t('nav.settings'),
      icon: Settings,
      color: '#94a3b8',
      action: () => navigate('settings'),
      category: 'navigation',
      keywords: ['preferences', 'config'],
    },
  ]

  return open ? (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden border"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(10,10,30,0.95)',
          borderColor: 'rgba(139,92,246,0.2)',
          boxShadow: '0 0 40px rgba(139,92,246,0.15)',
        }}
      >
        <Command label="Command Palette" shouldFilter={true}>
          <div
            className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ borderColor: 'rgba(139,92,246,0.1)' }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'rgba(139,92,246,0.6)' }} />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="搜索命令 / Search commands..."
              className="w-full bg-transparent border-none outline-none text-sm placeholder-white/20"
              style={{ color: '#e2e8f0' }}
            />
          </div>
          <Command.List className="max-h-[50vh] overflow-y-auto p-2">
            {commands
              .filter((cmd) => {
                if (!search) return true
                const q = search.toLowerCase()
                return (
                  cmd.label.toLowerCase().includes(q) ||
                  cmd.sublabel?.toLowerCase().includes(q) ||
                  cmd.keywords?.some((k) => k.toLowerCase().includes(q))
                )
              })
              .map((cmd) => (
                <Command.Item
                  key={cmd.id}
                  value={cmd.id}
                  onSelect={() => cmd.action()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm group transition-all"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139,92,246,0.08)'
                    e.currentTarget.style.color = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94a3b8'
                  }}
                >
                  <cmd.icon className="w-4 h-4 shrink-0" style={{ color: cmd.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{cmd.label}</div>
                    {cmd.sublabel && (
                      <div className="text-[10px] opacity-40 truncate">{cmd.sublabel}</div>
                    )}
                  </div>
                  <ArrowRight
                    className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity"
                    style={{ color: cmd.color }}
                  />
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </div>
    </div>
  ) : null
}

/**
 * Hook controlling command palette open/close state.
 * Returns `{ open, setOpen, onClose }` for parent components to wire up.
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  const onClose = useCallback(() => setOpen(false), [])

  // Ctrl+K / Cmd+K toggle
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return { open, setOpen, onClose }
}
