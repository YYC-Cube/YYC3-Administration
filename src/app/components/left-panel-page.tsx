/**
 * @file left-panel-page.tsx
 * @description YYC³ Developer Workspace v5.0 — Complete IDE-style workspace redesign
 *   with Glassmorphism 2.0, Liquid Design backgrounds, enhanced activity bar,
 *   AI-powered status bar, breadcrumb navigation, minimap indicator, and
 *   comprehensive keyboard shortcuts. Integrates all panel modules with
 *   smooth animations and YYC³ brand identity.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v5.0.0
 * @created 2026-03-17
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,P2,frontend,left-panel,sidebar,ide,workspace,glassmorphism,liquid-design
 */

import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  Cpu,
  Files,
  FolderOpen,
  GitBranch,
  Keyboard,
  ListTodo,
  PanelLeft,
  PanelLeftClose,
  Search,
  Settings,
  Shield,
  Sparkles,
  Star,
  Terminal,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Resizable } from 're-resizable'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useSettingsStore } from '../../stores/useSettingsStore'

import { CodeEditor } from './code-editor'
import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import {
  AIAssistantPanel,
  EditorQuickActions,
  FileExplorerPanel,
  getFileIcon,
  GitIntegrationPanel,
  GlobalSearchPanel,
  MOCK_GIT_STATUS,
  QuickAccessPanel,
  TaskManagerPanel,
  usePanelStore,
  WindowBar,
  WorkspaceSelector,
  WorkspaceSettingsPanel,
} from './panels'

import type { PanelType } from './panels'

// ==========================================
// Constants & Configuration
// ==========================================

const PANEL_TABS: {
  type: PanelType
  icon: typeof Files
  label: string
  labelZh: string
  color: string
  shortcut?: string
}[] = [
  {
    type: 'file-explorer',
    icon: Files,
    label: 'Explorer',
    labelZh: '文件浏览器',
    color: '#3b82f6',
    shortcut: 'Ctrl+E',
  },
  { type: 'task-manager', icon: ListTodo, label: 'Tasks', labelZh: '任务看板', color: '#22c55e' },
  { type: 'ai-assistant', icon: Bot, label: 'AI Assistant', labelZh: 'AI 助手', color: '#a78bfa' },
  {
    type: 'global-search',
    icon: Search,
    label: 'Search',
    labelZh: '全局搜索',
    color: '#f97316',
    shortcut: 'Ctrl+P',
  },
  {
    type: 'quick-access',
    icon: Star,
    label: 'Quick Access',
    labelZh: '快速访问',
    color: '#eab308',
  },
  { type: 'git-integration', icon: GitBranch, label: 'Git', labelZh: 'Git 集成', color: '#ec4899' },
  {
    type: 'settings',
    icon: Settings,
    label: 'Settings',
    labelZh: '工作区设置',
    color: '#06b6d4',
    shortcut: 'Ctrl+,',
  },
]

const WELCOME_SHORTCUTS = [
  { key: 'Ctrl+B', label: '切换面板', icon: PanelLeft },
  { key: 'Ctrl+P', label: '快速搜索', icon: Search },
  { key: 'Ctrl+E', label: '文件浏览器', icon: Files },
  { key: 'Ctrl+,', label: '设置', icon: Settings },
  { key: 'Ctrl+N', label: '新建文件', icon: Code },
  { key: 'Ctrl+`', label: '终端', icon: Terminal },
]

// ==========================================
// Liquid Background Glow Component
// ==========================================

function LiquidGlowOverlay() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: -200,
          left: -150,
          background: 'radial-gradient(circle, rgba(0,255,135,0.04), transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          bottom: -150,
          right: -100,
          background: 'radial-gradient(circle, rgba(6,182,212,0.035), transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          top: '40%',
          left: '30%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.025), transparent 70%)',
          filter: 'blur(50px)',
          animation: 'float 25s ease-in-out infinite',
          animationDelay: '-8s',
        }}
      />
    </div>
  )
}

// ==========================================
// Activity Bar Tooltip
// ==========================================

function ActivityBarTooltip({
  label,
  shortcut,
  visible,
  x,
  y,
}: {
  label: string
  shortcut?: string
  visible: boolean
  x: number
  y: number
}) {
  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="fixed z-[100] px-2.5 py-1.5 rounded-lg pointer-events-none"
      style={{
        left: x + 8,
        top: y,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <span className="text-[11px] text-white">{label}</span>
      {shortcut && (
        <span
          className="text-[9px] ml-2 px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
        >
          {shortcut}
        </span>
      )}
    </motion.div>
  )
}

// ==========================================
// Performance Stats (Status Bar)
// ==========================================

function usePerformanceStats() {
  const [stats, setStats] = useState({ fps: 60, memory: 0, uptime: 0 })
  useEffect(() => {
    const start = Date.now()
    let frameCount = 0
    let lastTime = performance.now()
    let rafId: number
    const loop = () => {
      frameCount++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        setStats({
          fps: Math.round((frameCount * 1000) / (now - lastTime)),
          memory: (performance as any).memory?.usedJSHeapSize
            ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
            : 0,
          uptime: Math.floor((Date.now() - start) / 60000),
        })
        frameCount = 0
        lastTime = now
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])
  return stats
}

// ==========================================
// Breadcrumb
// ==========================================

function FileBreadcrumb({
  filePath,
  tc,
}: {
  filePath: string
  tc: ReturnType<typeof useThemeColors>
}) {
  const segments = filePath.split('/').filter(Boolean)
  return (
    <div
      className="flex items-center gap-0.5 text-[9px] px-2 overflow-x-auto"
      style={{ color: tc.textMuted }}
    >
      <FolderOpen className="w-3 h-3 shrink-0" />
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-0.5 shrink-0">
          {i > 0 && <ChevronRight className="w-2.5 h-2.5 opacity-40" />}
          <span
            className={i === segments.length - 1 ? '' : 'hover:underline cursor-pointer'}
            style={{ color: i === segments.length - 1 ? tc.textPrimary : tc.textMuted }}
          >
            {seg}
          </span>
        </span>
      ))}
    </div>
  )
}

// ==========================================
// Main Component
// ==========================================

export function LeftPanelPage() {
  const tc = useThemeColors()
  const { t, locale } = useI18n()
  const { settings } = useSettingsStore()
  const {
    activePanel,
    setActivePanel,
    panelCollapsed,
    toggleCollapsed,
    selectedFile,
    panelWidth,
    setPanelWidth,
  } = usePanelStore()
  const editorContentGetter = useRef<(() => string) | null>(null)
  const editorInsertRef = useRef<((text: string) => void) | null>(null)
  const perfStats = usePerformanceStats()

  // Tooltip state for activity bar
  const [tooltip, setTooltip] = useState<{
    label: string
    shortcut?: string
    x: number
    y: number
  } | null>(null)

  // Current time for status bar
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b') {
          e.preventDefault()
          toggleCollapsed()
        }
        if (e.key === 'p') {
          e.preventDefault()
          setActivePanel('global-search')
        }
        if (e.key === 'e') {
          e.preventDefault()
          setActivePanel('file-explorer')
        }
        if (e.key === ',') {
          e.preventDefault()
          setActivePanel('settings')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleCollapsed, setActivePanel])

  const renderPanel = useCallback(() => {
    switch (activePanel) {
      case 'file-explorer':
        return <FileExplorerPanel tc={tc} />
      case 'task-manager':
        return <TaskManagerPanel tc={tc} />
      case 'ai-assistant':
        return (
          <AIAssistantPanel
            tc={tc}
            selectedFile={selectedFile}
            editorContentGetter={editorContentGetter}
            editorInsertRef={editorInsertRef}
          />
        )
      case 'global-search':
        return <GlobalSearchPanel tc={tc} />
      case 'quick-access':
        return <QuickAccessPanel tc={tc} />
      case 'git-integration':
        return <GitIntegrationPanel tc={tc} />
      case 'settings':
        return <WorkspaceSettingsPanel tc={tc} />
    }
  }, [activePanel, tc, selectedFile])

  // Editor content with file-specific templates
  const getEditorContent = useCallback((filePath: string) => {
    const fileName = filePath.split('/').pop() ?? ''
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

    const templates: Record<string, string> = {
      'package.json': `{\n  "name": "yyc3-cloudpivot",\n  "version": "1.8.5",\n  "private": true,\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "test": "vitest run",\n    "lint": "eslint . --ext ts,tsx"\n  },\n  "dependencies": {\n    "react": "^18.3.0",\n    "zustand": "^4.5.0",\n    "motion": "^11.0.0"\n  }\n}`,
      'tsconfig.json': `{\n  "compilerOptions": {\n    "target": "ES2022",\n    "lib": ["ES2022", "DOM", "DOM.Iterable"],\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "strict": true,\n    "jsx": "react-jsx",\n    "esModuleInterop": true,\n    "outDir": "./dist"\n  },\n  "include": ["src"]\n}`,
    }

    if (templates[fileName]) return templates[fileName]

    if (ext === 'css') {
      return `/**\n * @file ${fileName}\n * @description YYC³ Stylesheet\n */\n\n:root {\n  --color-primary: #00ff87;\n  --color-secondary: #00d4ff;\n  --color-background: #0a0f0a;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 1rem;\n}\n`
    }

    if (ext === 'md') {
      return `# ${fileName.replace('.md', '')}\n\n> YYC³ CloudPivot Intelli-Matrix\n> 言启象限 | 语枢未来\n\n## Overview\n\nThis document describes the architecture and implementation details.\n\n## Getting Started\n\n\`\`\`bash\npnpm install\npnpm dev\n\`\`\`\n`
    }

    return `/**\n * @file ${fileName}\n * @description YYC³ Component\n * @author YanYuCloudCube Team <admin@0379.email>\n * @version v1.0.0\n */\n\nimport { useState, useCallback } from "react";\nimport { useThemeColors } from "./hooks/use-theme-colors";\nimport { motion } from "motion/react";\n\n/** Main component props */\ninterface ComponentProps {\n  title?: string;\n  className?: string;\n}\n\n/**\n * Main component implementation\n * @param props - Component props\n * @returns React element\n */\nexport function Component({ title = "YYC³", className }: ComponentProps) {\n  const tc = useThemeColors();\n  const [count, setCount] = useState(0);\n\n  const handleClick = useCallback(() => {\n    setCount((prev) => prev + 1);\n    console.log("YYC³ CloudPivot Intelli-Matrix");\n  }, []);\n\n  return (\n    <motion.div\n      initial={{ opacity: 0, y: 20 }}\n      animate={{ opacity: 1, y: 0 }}\n      className={className}\n      style={{ background: tc.bgBase, color: tc.textPrimary }}\n    >\n      <h1>{title}</h1>\n      <p>Count: {count}</p>\n      <button onClick={handleClick}>\n        Increment\n      </button>\n    </motion.div>\n  );\n}\n`
  }, [])

  const activeTabConfig = PANEL_TABS.find((t) => t.type === activePanel)

  return (
    <div
      className="h-full overflow-hidden flex flex-col relative"
      style={{ background: tc.bgBase }}
    >
      {/* Liquid Glass Background Glows */}
      <LiquidGlowOverlay />

      {/* Multi-Instance Window Bar */}
      <div className="relative" style={{ zIndex: 2 }}>
        <WindowBar tc={tc} />
      </div>

      {/* ===== Top Header Bar ===== */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="flex items-center justify-between px-4 py-2.5 border-b relative"
        style={{
          borderColor: tc.borderDefault,
          background: tc.isCyberpunk ? 'rgba(10,10,30,0.6)' : 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px) saturate(180%)',
          zIndex: 2,
        }}
      >
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,135,0.12), rgba(6,182,212,0.08))',
              border: '1px solid rgba(0,255,135,0.2)',
              boxShadow: '0 0 20px rgba(0,255,135,0.08), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,135,0.15)' }}
            transition={{ duration: 0.2 }}
          >
            <Code className="w-4.5 h-4.5" style={{ color: '#00ff87' }} />
            {/* Shimmer effect */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s infinite',
              }}
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px]" style={{ color: tc.textPrimary, fontWeight: 600 }}>
                {t('nav.devWorkspace')}
              </h1>
              <span
                className="text-[8px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(0,255,135,0.08)',
                  color: '#00ff87',
                  border: '1px solid rgba(0,255,135,0.15)',
                }}
              >
                v5.0
              </span>
            </div>
            <p className="text-[9px] flex items-center gap-1.5" style={{ color: tc.textMuted }}>
              <span>言传千行代码 | 语枢万物智能</span>
              <span style={{ color: tc.borderDefault }}>·</span>
              <span className="flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" style={{ color: '#22c55e' }} />
                FEFS 架构
              </span>
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <WorkspaceSelector tc={tc} />

          {/* AI Status Indicator */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.12)',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#a78bfa', boxShadow: '0 0 6px rgba(139,92,246,0.5)' }}
            />
            <span className="text-[8px]" style={{ color: '#a78bfa' }}>
              AI 就绪
            </span>
          </div>

          {/* Zustand badge */}
          <span
            className="text-[8px] px-2 py-1 rounded-lg flex items-center gap-1"
            style={{
              background: 'rgba(34,197,94,0.06)',
              color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.12)',
            }}
          >
            <CheckCircle2 className="w-3 h-3" /> 持久化
          </span>

          {/* Toggle panel */}
          <button
            onClick={toggleCollapsed}
            className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all hover:bg-white/5"
            style={{ borderColor: tc.borderDefault }}
          >
            {panelCollapsed ? (
              <PanelLeft className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
            )}
          </button>
        </div>
      </motion.div>

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 flex overflow-hidden relative" style={{ zIndex: 1 }}>
        {/* ===== Activity Bar (Icon Strip) ===== */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="w-[52px] flex flex-col items-center py-2 gap-0.5 border-r shrink-0"
          style={{
            background: tc.isCyberpunk ? 'rgba(10,10,30,0.5)' : 'rgba(255,255,255,0.02)',
            borderColor: tc.borderDefault,
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Panel tabs */}
          {PANEL_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activePanel === tab.type
            return (
              <motion.button
                key={tab.type}
                onClick={() => {
                  if (isActive && !panelCollapsed) toggleCollapsed()
                  else {
                    setActivePanel(tab.type)
                    if (panelCollapsed) toggleCollapsed()
                  }
                }}
                className="w-10 h-10 flex flex-col items-center justify-center rounded-lg transition-all relative group"
                style={{
                  background: isActive ? `${tab.color}15` : 'transparent',
                  color: isActive ? tab.color : tc.textMuted,
                }}
                whileHover={{
                  background: isActive ? `${tab.color}20` : 'rgba(255,255,255,0.04)',
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({
                    label: locale === 'zh' ? tab.labelZh : tab.label,
                    shortcut: tab.shortcut,
                    x: rect.right,
                    y: rect.top + rect.height / 2 - 14,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                    style={{
                      background: tab.color,
                      boxShadow: `0 0 8px ${tab.color}60`,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-[7px] mt-0.5 leading-none">
                  {locale === 'zh' ? tab.labelZh.slice(0, 2) : tab.label.slice(0, 4)}
                </span>
              </motion.button>
            )
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom icons */}
          <div className="flex flex-col items-center gap-0.5 pb-1">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-white/5"
              style={{ color: tc.textMuted }}
              title="性能监控"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-white/5"
              style={{ color: tc.textMuted }}
              title="键盘快捷键"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Activity Bar Tooltip */}
        <AnimatePresence>
          {tooltip && (
            <ActivityBarTooltip
              label={tooltip.label}
              shortcut={tooltip.shortcut}
              visible={true}
              x={tooltip.x}
              y={tooltip.y}
            />
          )}
        </AnimatePresence>

        {/* ===== Panel Content (Resizable) ===== */}
        <AnimatePresence mode="wait">
          {!panelCollapsed && (
            <motion.div
              key="panel-wrapper"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: panelWidth }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="shrink-0 flex flex-col overflow-hidden"
            >
              <Resizable
                size={{ width: panelWidth, height: '100%' }}
                minWidth={220}
                maxWidth={600}
                enable={{
                  right: true,
                  left: false,
                  top: false,
                  bottom: false,
                  topRight: false,
                  bottomRight: false,
                  bottomLeft: false,
                  topLeft: false,
                }}
                onResizeStop={(_e, _dir, _ref, d) => setPanelWidth(panelWidth + d.width)}
                handleStyles={{
                  right: { width: '4px', right: '-2px', cursor: 'col-resize', zIndex: 10 },
                }}
                handleClasses={{
                  right: 'hover:bg-[#00ff8733] active:bg-[#00ff8755] transition-colors',
                }}
                className="border-r flex flex-col h-full overflow-hidden"
                style={
                  {
                    background: tc.isCyberpunk ? 'rgba(10,10,30,0.4)' : 'rgba(255,255,255,0.02)',
                    borderColor: tc.borderDefault,
                    backdropFilter: 'blur(12px)',
                  } as React.CSSProperties
                }
              >
                {/* Panel header with active tab name */}
                {activeTabConfig && (
                  <div
                    className="flex items-center justify-between px-3 py-1.5 border-b"
                    style={{ borderColor: tc.borderSubtle }}
                  >
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const Icon = activeTabConfig.icon
                        return (
                          <Icon className="w-3.5 h-3.5" style={{ color: activeTabConfig.color }} />
                        )
                      })()}
                      <span
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: activeTabConfig.color, fontWeight: 600 }}
                      >
                        {locale === 'zh' ? activeTabConfig.labelZh : activeTabConfig.label}
                      </span>
                    </div>
                    <button
                      onClick={toggleCollapsed}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
                    >
                      <X className="w-3 h-3" style={{ color: tc.textMuted }} />
                    </button>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePanel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col overflow-hidden h-full"
                  >
                    {renderPanel()}
                  </motion.div>
                </AnimatePresence>
              </Resizable>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Editor Area ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Tab Bar */}
          <div
            className="flex items-center h-9 border-b px-1 gap-0.5 overflow-x-auto"
            style={{
              background: tc.isCyberpunk ? 'rgba(10,10,30,0.4)' : 'rgba(255,255,255,0.02)',
              borderColor: tc.borderSubtle,
              backdropFilter: 'blur(8px)',
            }}
          >
            {selectedFile ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg border border-b-0 text-[10px]"
                style={{
                  background: tc.bgElevated,
                  borderColor: tc.borderDefault,
                  color: tc.textPrimary,
                  boxShadow: '0 -1px 4px rgba(0,0,0,0.05)',
                }}
              >
                {(() => {
                  const fi = getFileIcon(selectedFile.split('/').pop() ?? '')
                  const FI = fi.icon
                  return <FI className="w-3.5 h-3.5" style={{ color: fi.color }} />
                })()}
                <span style={{ fontWeight: 500 }}>{selectedFile.split('/').pop()}</span>
                <button
                  className="ml-2 w-4 h-4 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                  onClick={() => usePanelStore.getState().selectFile(null)}
                >
                  <X className="w-3 h-3" style={{ color: tc.textMuted }} />
                </button>
              </motion.div>
            ) : (
              <span className="text-[10px] px-2" style={{ color: tc.textMuted }}>
                未打开文件
              </span>
            )}
          </div>

          {/* Breadcrumb */}
          {selectedFile && (
            <div
              className="h-6 border-b flex items-center"
              style={{ borderColor: tc.borderSubtle, background: 'rgba(0,0,0,0.1)' }}
            >
              <FileBreadcrumb filePath={selectedFile} tc={tc} />
            </div>
          )}

          {/* Quick Actions toolbar */}
          {selectedFile && (
            <EditorQuickActions
              tc={tc}
              filePath={selectedFile}
              editorContentGetter={editorContentGetter}
              editorInsertRef={editorInsertRef}
            />
          )}

          {/* Editor or Welcome Screen */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden"
            style={{ background: tc.bgBase }}
          >
            {selectedFile ? (
              <div className="w-full h-full p-2 overflow-hidden">
                <CodeEditor
                  filePath={selectedFile}
                  initialContent={getEditorContent(selectedFile)}
                  onSave={(content) => {
                    console.log('[YYC³ Editor] Saved:', selectedFile, content.length, 'chars')
                  }}
                  onChange={() => {}}
                  onEditorReady={(getter) => {
                    editorContentGetter.current = getter
                  }}
                  onInsertReady={(inserter) => {
                    editorInsertRef.current = inserter
                  }}
                />
              </div>
            ) : (
              /* ===== Enhanced Welcome Screen ===== */
              <motion.div
                className="text-center max-w-lg mx-auto px-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
              >
                {/* Logo */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: 'rgba(0,255,135,0.06)',
                    border: '1px solid rgba(0,255,135,0.12)',
                    boxShadow:
                      '0 0 40px rgba(0,255,135,0.06), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Code className="w-9 h-9" style={{ color: '#00ff87', opacity: 0.7 }} />
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s infinite',
                    }}
                  />
                </motion.div>

                {/* Title */}
                <h2 className="text-[18px] mb-1" style={{ color: tc.textPrimary, fontWeight: 600 }}>
                  YYC³ 开发者工作区
                </h2>
                <p className="text-[11px] mb-1" style={{ color: tc.textSecondary }}>
                  CloudPivot Intelli-Matrix · IDE 风格集成开发环境
                </p>
                <p className="text-[9px] mb-6" style={{ color: tc.textMuted }}>
                  从文件浏览器选择文件以开始编辑，或使用以下快捷键导航
                </p>

                {/* Feature tags */}
                <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                  {[
                    { label: 'Monaco 编辑器', color: '#3b82f6' },
                    { label: 'AI 流式响应', color: '#a78bfa' },
                    { label: 'Token 统计', color: '#eab308' },
                    { label: '文件 CRUD', color: '#22c55e' },
                    { label: 'Git 集成', color: '#ec4899' },
                    { label: '多开系统', color: '#f97316' },
                  ].map((feat) => (
                    <span
                      key={feat.label}
                      className="text-[8px] px-2 py-1 rounded-lg"
                      style={{
                        background: `${feat.color}08`,
                        color: feat.color,
                        border: `1px solid ${feat.color}18`,
                      }}
                    >
                      {feat.label}
                    </span>
                  ))}
                </div>

                {/* Keyboard shortcuts grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {WELCOME_SHORTCUTS.map((sc) => {
                    const Icon = sc.icon
                    return (
                      <motion.div
                        key={sc.key}
                        className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl cursor-pointer"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                        whileHover={{
                          background: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(0,255,135,0.15)',
                          y: -2,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className="w-4 h-4" style={{ color: tc.textMuted }} />
                        <kbd
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: tc.textSecondary,
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          {sc.key}
                        </kbd>
                        <span className="text-[8px]" style={{ color: tc.textMuted }}>
                          {sc.label}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Brand slogan */}
                <div
                  className="flex items-center justify-center gap-2 text-[9px]"
                  style={{ color: tc.textMuted }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: '#00ff87', opacity: 0.5 }} />
                  <span>
                    言启象限 | 语枢未来 — Words Initiate Quadrants, Language Serves as Core for
                    Future
                  </span>
                  <Sparkles className="w-3 h-3" style={{ color: '#00ff87', opacity: 0.5 }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* ===== Enhanced Status Bar ===== */}
          <div
            className="h-7 flex items-center justify-between px-3 border-t text-[9px]"
            style={{
              background: tc.isCyberpunk ? 'rgba(10,10,30,0.6)' : 'rgba(255,255,255,0.03)',
              borderColor: tc.borderSubtle,
              color: tc.textMuted,
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Left status items */}
            <div className="flex items-center gap-3">
              {/* Git branch */}
              <span className="flex items-center gap-1 cursor-pointer hover:text-white/60 transition-colors">
                <GitBranch className="w-3 h-3" style={{ color: '#a78bfa' }} />
                {MOCK_GIT_STATUS.branch}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#eab308' }} />
                {MOCK_GIT_STATUS.modified} 已修改
              </span>
              {/* Sync status */}
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" style={{ color: '#22c55e' }} />
                已同步
              </span>
            </div>

            {/* Center: AI status */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" style={{ color: '#a78bfa' }} />
                AI 流式就绪
              </span>
              <span style={{ color: tc.borderDefault }}>·</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" style={{ color: '#eab308' }} />
                Token 统计
              </span>
            </div>

            {/* Right status items */}
            <div className="flex items-center gap-3">
              {selectedFile && (
                <>
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}
                  >
                    {selectedFile.split('.').pop()?.toUpperCase()}
                  </span>
                  <span>UTF-8</span>
                </>
              )}
              <span>字体: {settings.general.editorFontSize}px</span>
              <span>缩进: 2</span>
              {/* Performance */}
              <span className="flex items-center gap-1">
                <Activity
                  className="w-3 h-3"
                  style={{ color: perfStats.fps >= 55 ? '#22c55e' : '#eab308' }}
                />
                {perfStats.fps}fps
              </span>
              {perfStats.memory > 0 && (
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" style={{ color: '#06b6d4' }} />
                  {perfStats.memory}MB
                </span>
              )}
              {/* Time */}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
