import {
  ArrowLeft,
  BarChart3,
  GitBranch,
  GripVertical,
  Layers,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  Minus,
  Phone,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'

// F-07: 懒加载 ChatInterface——它携带 react-markdown/highlight.js(vendor-markdown),
// 静态导入会把整个 markdown 栈拖进首屏 index chunk
const LazyChatInterface = lazy(() =>
  import('@/features/conversation/pages/chat-interface').then((m) => ({
    default: m.ChatInterface,
  })),
)

type WidgetTab = 'chat' | 'clm' | 'aicall' | 'tools' | 'workflow' | 'insights'

// Tab labels hold i18n keys; resolved via t() at render site
const tabs = [
  { id: 'chat' as WidgetTab, label: 'cwk.tabChat', icon: MessageCircle, color: '#00f0ff' },
  { id: 'clm' as WidgetTab, label: 'cwk.tabClm', icon: Users, color: '#00d4ff' },
  { id: 'aicall' as WidgetTab, label: 'cwk.tabAicall', icon: Phone, color: '#00ffcc' },
  { id: 'tools' as WidgetTab, label: 'cwk.tabTools', icon: Wrench, color: '#00ffc8' },
  { id: 'workflow' as WidgetTab, label: 'cwk.tabWorkflow', icon: GitBranch, color: '#00d4ff' },
  { id: 'insights' as WidgetTab, label: 'cwk.tabInsights', icon: BarChart3, color: '#00f0ff' },
]

/**
 * Compact floating widget mode for the AI assistant.
 * Renders a draggable, resizable panel with tabs for chat, tools, and status.
 * Supports minimize, maximize, and mode switching to standalone layout.
 *
 * @param onSwitchMode - Callback to switch to standalone (full-screen) mode.
 */
export function CyberpunkWidget({ onSwitchMode }: { onSwitchMode: () => void }) {
  const { t } = useI18n()
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [activeTab, setActiveTab] = useState<WidgetTab>('chat')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: 420, h: 620 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 })
  const resizeRef = useRef({ startX: 0, startY: 0, startW: 0, startH: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)

  // Initialize position — intentionally runs only once on mount
  useEffect(() => {
    setPosition({
      x: window.innerWidth - size.w - 24,
      y: window.innerHeight - size.h - 24,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Drag handlers
  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (maximized) return
      setIsDragging(true)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
      }
    },
    [position, maximized],
  )

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.w, dragRef.current.startPosX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - size.h, dragRef.current.startPosY + dy)),
      })
    }
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, size])

  // Resize handlers
  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (maximized) return
      setIsResizing(true)
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: size.w,
        startH: size.h,
      }
    },
    [size, maximized],
  )

  useEffect(() => {
    if (!isResizing) return
    const onMove = (e: MouseEvent) => {
      const dw = e.clientX - resizeRef.current.startX
      const dh = e.clientY - resizeRef.current.startY
      setSize({
        w: Math.max(320, Math.min(800, resizeRef.current.startW + dw)),
        h: Math.max(400, Math.min(900, resizeRef.current.startH + dh)),
      })
    }
    const onUp = () => setIsResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isResizing])

  const toggleMaximize = () => {
    if (maximized) {
      setMaximized(false)
    } else {
      setMaximized(true)
    }
  }

  // Minimized FAB
  if (minimized) {
    return (
      <div className="fixed z-[10000]" style={{ bottom: 24, right: 24 }}>
        <button
          onClick={() => setMinimized(false)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 group"
          style={{
            background: 'linear-gradient(135deg, #00f0ff, #00d4ff)',
            boxShadow: '0 0 20px rgba(0,240,255,0.5), 0 0 40px rgba(0,212,255,0.3)',
            animation: 'neon-pulse 2s ease-in-out infinite',
          }}
        >
          <Layers className="w-6 h-6 text-white group-hover:animate-spin" />
        </button>
        {/* Ripple ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '2px solid rgba(0,240,255,0.3)',
            animation: 'neon-pulse 2s ease-in-out infinite',
          }}
        />
      </div>
    )
  }

  return (
    <>
      {/* Backdrop host simulation */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-white/10 text-4xl tracking-widest mb-2">{t('cwk.hostApp')}</h1>
            <p className="text-white/5 text-sm">HOST APPLICATION</p>
          </div>
        </div>
      </div>

      {/* Widget */}
      <div
        ref={widgetRef}
        className="fixed z-[10000] flex flex-col"
        role="dialog"
        aria-label={t('cwk.aiAssistant')}
        style={{
          width: maximized ? '100vw' : size.w,
          height: maximized ? '100vh' : size.h,
          left: maximized ? 0 : position.x,
          top: maximized ? 0 : position.y,
          borderRadius: maximized ? 0 : 20,
          background: 'rgba(10,10,10,0.78)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: maximized ? 'none' : '2px solid rgba(0,240,255,0.35)',
          boxShadow: maximized
            ? 'none'
            : '0 20px 60px rgba(0,0,0,0.6), 0 0 25px rgba(0,240,255,0.4), 0 0 50px rgba(0,240,255,0.15), inset 0 0 30px rgba(0,240,255,0.04)',
          transition:
            isDragging || isResizing ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          animation: 'spring-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
          willChange: 'transform, opacity',
        }}
      >
        {/* Multi-layer glass overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: maximized ? 0 : 20,
            background:
              'linear-gradient(135deg, rgba(0,240,255,0.07) 0%, transparent 50%), linear-gradient(225deg, rgba(0,212,255,0.07) 0%, transparent 50%)',
          }}
        />
        {/* Circuit grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: maximized ? 0 : 20,
            backgroundImage:
              'linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: maximized ? 0 : 20,
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
            animation: 'scanline-move 12s linear infinite',
          }}
        />
        {/* Shimmer sweep */}
        <div
          className="absolute top-0 w-1/2 h-full pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
            animation: 'shimmer-move 4s ease-in-out infinite',
          }}
        />

        {/* ==== HEADER ==== */}
        <div
          className="relative z-20 flex items-center justify-between px-4 py-3 shrink-0 select-none"
          style={{
            cursor: maximized ? 'default' : 'grab',
            borderBottom: '1px solid rgba(0,240,255,0.15)',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: maximized ? '0' : '20px 20px 0 0',
          }}
          onMouseDown={onDragStart}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #00d4ff)',
                boxShadow: '0 0 10px rgba(0,240,255,0.5)',
                animation: 'float-rotate 4s ease-in-out infinite',
              }}
            >
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span
                className="text-sm text-white/90 tracking-wider"
                style={{ textShadow: '0 0 8px rgba(0,240,255,0.5)' }}
              >
                YYC³{' '}
                <span
                  className="text-[#00d4ff]"
                  style={{ textShadow: '0 0 6px rgba(0,212,255,0.5)' }}
                >
                  {t('cwk.brandName')}
                </span>
              </span>
              <span className="text-[8px] text-[#00f0ff]/40 block -mt-0.5 tracking-widest">
                YANYU INTELLIGENT AI
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onSwitchMode}
              className="p-1.5 rounded-lg transition-all duration-300 hover:bg-white/10 group"
              title={t('cwk.switchToStandalone')}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white/30 group-hover:text-[#00d4ff]" />
            </button>
            <button
              onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg transition-all duration-300 hover:bg-white/10 group"
              aria-label={t('cwk.minimize')}
            >
              <Minus className="w-3.5 h-3.5 text-white/30 group-hover:text-[#00ffcc]" />
            </button>
            <button
              onClick={toggleMaximize}
              className="p-1.5 rounded-lg transition-all duration-300 hover:bg-white/10 group"
              aria-label={maximized ? t('cwk.restore') : t('cwk.maximize')}
            >
              {maximized ? (
                <Minimize2 className="w-3.5 h-3.5 text-white/30 group-hover:text-[#00ffc8]" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-white/30 group-hover:text-[#00ffc8]" />
              )}
            </button>
            <button
              onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg transition-all duration-300 hover:bg-[#005f7320] group"
              aria-label={t('cwk.close')}
            >
              <X className="w-3.5 h-3.5 text-white/30 group-hover:text-[#005f73]" />
            </button>
          </div>
        </div>

        {/* ==== TABS ==== */}
        <div
          className="relative z-20 flex items-center gap-1 px-3 py-2 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,240,255,0.08)', background: 'rgba(0,0,0,0.15)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-300"
                style={{
                  background: active ? `${tab.color}15` : 'transparent',
                  color: active ? tab.color : 'rgba(255,255,255,0.35)',
                  border: active ? `1px solid ${tab.color}30` : '1px solid transparent',
                  boxShadow: active ? `0 0 8px ${tab.color}20` : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(tab.label)}</span>
              </button>
            )
          })}
        </div>

        {/* ==== CONTENT ==== */}
        <div className="relative z-20 flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              }
            >
              <LazyChatInterface compact />
            </Suspense>
          )}
          {activeTab === 'clm' && <WidgetCLM />}
          {activeTab === 'aicall' && <WidgetAICall />}
          {activeTab === 'tools' && <WidgetTools />}
          {activeTab === 'workflow' && <WidgetWorkflow />}
          {activeTab === 'insights' && <WidgetInsights />}
        </div>

        {/* ==== QUICK ACTIONS ==== */}
        <div
          className="relative z-20 flex items-center justify-around px-4 py-2 shrink-0"
          style={{
            borderTop: '1px solid rgba(0,240,255,0.1)',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: maximized ? '0' : '0 0 20px 20px',
          }}
        >
          {[
            { label: t('cwk.qaNewChat'), icon: MessageCircle, color: '#00f0ff' },
            {
              label: t('cwk.qaHistory'),
              icon: () => <span className="text-[10px]">📜</span>,
              color: '#00d4ff',
            },
            {
              label: t('cwk.qaSettings'),
              icon: () => <span className="text-[10px]">⚙️</span>,
              color: '#00ffcc',
            },
          ].map((action, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-300 hover:bg-white/5 group"
            >
              {typeof action.icon === 'function'
                ? React.createElement(action.icon)
                : React.createElement(action.icon, {
                    className:
                      'w-3.5 h-3.5 text-white/25 group-hover:text-[#00f0ff] transition-colors',
                  })}
              <span className="text-[9px] text-white/20 group-hover:text-white/50 transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Resize handle */}
        {!maximized && (
          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-30 flex items-center justify-center"
            onMouseDown={onResizeStart}
            style={{ borderRadius: '0 0 20px 0' }}
          >
            <GripVertical className="w-3 h-3 text-white/10 rotate-[-45deg]" />
          </div>
        )}
      </div>
    </>
  )
}

/* Mini tool list for widget */
function WidgetTools() {
  const { t } = useI18n()
  const miniTools = [
    { name: t('cwk.toolCodeGen'), icon: '💻', color: '#00f0ff' },
    { name: t('cwk.toolDataFlow'), icon: '📊', color: '#00d4ff' },
    { name: t('cwk.toolSecurityShield'), icon: '🛡️', color: '#00ffcc' },
    { name: t('cwk.toolKnowledgeGraph'), icon: '🧠', color: '#00ffc8' },
    { name: t('cwk.toolPerfOptimizer'), icon: '⚡', color: '#005f73' },
  ]
  return (
    <div
      className="p-3 space-y-2 overflow-y-auto h-full"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.3s var(--spring-easing) both' }}
    >
      {miniTools.map((tool, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-3 rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'rgba(10,10,10,0.5)',
            borderColor: `${tool.color}20`,
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${tool.color}50`
            e.currentTarget.style.boxShadow = `0 0 12px ${tool.color}30`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${tool.color}20`
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span className="text-lg">{tool.icon}</span>
          <span className="text-sm text-white/60">{tool.name}</span>
          <span
            className="ml-auto text-[10px] px-2 py-0.5 rounded"
            style={{ background: `${tool.color}15`, color: tool.color }}
          >
            {t('cwk.launch')}
          </span>
        </div>
      ))}
    </div>
  )
}

function WidgetWorkflow() {
  const { t } = useI18n()
  const nodes = [
    { label: t('cwk.nodeAnalyze'), status: 'done', emoji: '📥' },
    { label: t('cwk.nodeRecognize'), status: 'done', emoji: '🧠' },
    { label: t('cwk.nodeExecute'), status: 'active', emoji: '⚡' },
    { label: t('cwk.nodeOptimize'), status: 'pending', emoji: '🔧' },
  ]
  return (
    <div
      className="p-4 h-full overflow-y-auto"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.3s var(--spring-easing) both' }}
    >
      <p className="text-[10px] text-white/30 tracking-wider mb-4 uppercase">
        {t('cwk.activePipeline')}
      </p>
      <div className="space-y-3">
        {nodes.map((node, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
            style={{
              background: node.status === 'active' ? 'rgba(0,240,255,0.08)' : 'rgba(10,10,10,0.4)',
              borderColor:
                node.status === 'active' ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.05)',
              boxShadow: node.status === 'active' ? '0 0 12px rgba(0,240,255,0.2)' : 'none',
              animation: node.status === 'active' ? 'border-glow 2s ease-in-out infinite' : 'none',
            }}
          >
            <span>{node.emoji}</span>
            <span
              className="text-sm"
              style={{
                color:
                  node.status === 'pending'
                    ? 'rgba(255,255,255,0.2)'
                    : node.status === 'active'
                      ? '#00f0ff'
                      : 'rgba(255,255,255,0.15)',
              }}
            >
              {node.label}
            </span>
            <span
              className="ml-auto text-[10px]"
              style={{
                color:
                  node.status === 'done'
                    ? '#00ffc8'
                    : node.status === 'active'
                      ? '#00f0ff'
                      : 'rgba(255,255,255,0.15)',
              }}
            >
              {node.status === 'done'
                ? t('cwk.statusDone')
                : node.status === 'active'
                  ? t('cwk.statusActive')
                  : t('cwk.statusPending')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WidgetInsights() {
  const { t } = useI18n()
  // `id` drives bar-width logic; label holds the translated text
  const metrics = [
    { id: 'response', label: t('cwk.metricResponse'), value: '12ms', color: '#00f0ff' },
    { id: 'success', label: t('cwk.metricSuccessRate'), value: '98.7%', color: '#00ffc8' },
    { id: 'load', label: t('cwk.metricLoad'), value: '42%', color: '#00d4ff' },
  ]
  return (
    <div
      className="p-4 h-full overflow-y-auto"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.3s var(--spring-easing) both' }}
    >
      <p className="text-[10px] text-white/30 tracking-wider mb-4 uppercase">
        {t('cwk.realtimeMetrics')}
      </p>
      <div className="space-y-3">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="px-4 py-3 rounded-xl border"
            style={{
              background: 'rgba(10,10,10,0.4)',
              borderColor: `${m.color}20`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/30">{m.label}</span>
              <span
                className="text-sm"
                style={{ color: m.color, textShadow: `0 0 8px ${m.color}60` }}
              >
                {m.value}
              </span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/5">
              <div
                className="h-full rounded-full"
                style={{
                  width: m.id === 'load' ? '42%' : m.id === 'success' ? '98.7%' : '88%',
                  background: `linear-gradient(90deg, ${m.color}, ${m.color}80)`,
                  boxShadow: `0 0 6px ${m.color}50`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WidgetCLM() {
  const { t } = useI18n()
  const customers = [
    { name: '张明远', stage: 'conversion', health: 92, color: '#00ffc8' },
    { name: '李思琪', stage: 'deal', health: 88, color: '#00ffc8' },
    { name: '王建华', stage: 'acquisition', health: 65, color: '#00ffcc' },
    { name: '陈雅文', stage: 'service', health: 95, color: '#00ffc8' },
    { name: '赵鹏飞', stage: 'loyalty', health: 98, color: '#00ffc8' },
  ]
  const stageColors: Record<string, string> = {
    acquisition: '#00f0ff',
    conversion: '#00d4ff',
    deal: '#00ffcc',
    service: '#00ffc8',
    loyalty: '#008b9d',
  }
  return (
    <div
      className="p-3 space-y-2 overflow-y-auto h-full"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.3s var(--spring-easing) both' }}
    >
      <p className="text-[10px] text-white/30 tracking-wider mb-3 uppercase">{t('cwk.clmTitle')}</p>
      {/* Mini funnel */}
      <div className="flex gap-1 mb-3">
        {['acquisition', 'conversion', 'deal', 'service', 'loyalty'].map((s) => (
          <div
            key={s}
            className="flex-1 text-center py-1.5 rounded-lg text-[9px]"
            style={{
              background: `${stageColors[s]}10`,
              color: stageColors[s],
              border: `1px solid ${stageColors[s]}20`,
            }}
          >
            {t(`cwk.stage.${s}`)}
          </div>
        ))}
      </div>
      {customers.map((c, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          style={{ background: 'rgba(10,10,10,0.4)', borderColor: 'rgba(255,255,255,0.04)' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,240,255,0.12))',
              border: '1px solid rgba(0,212,255,0.15)',
            }}
          >
            <span className="text-[10px] text-white/60">{c.name[0]}</span>
          </div>
          <span className="text-sm text-white/60 flex-1 truncate">{c.name}</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: `${stageColors[c.stage]}10`, color: stageColors[c.stage] }}
          >
            {t(`cwk.stage.${c.stage}`)}
          </span>
          <span className="text-[10px]" style={{ color: c.color }}>
            {c.health}
          </span>
        </div>
      ))}
    </div>
  )
}

function WidgetAICall() {
  const { t } = useI18n()
  // type/status hold i18n keys; `ai`/`active` keep the original style-gating semantics
  const calls = [
    {
      name: '张明远',
      type: 'cwk.callTypeOutbound',
      status: 'cwk.callStatusInCall',
      ai: true,
      active: true,
      color: '#00ffc8',
    },
    {
      name: '李思琪',
      type: 'cwk.callTypeFollowup',
      status: 'cwk.callStatusWaiting',
      ai: true,
      color: '#00ffcc',
    },
    {
      name: '王建华',
      type: 'cwk.callTypeTransfer',
      status: 'cwk.callStatusQueued',
      color: '#008b9d',
    },
    {
      name: '陈雅文',
      type: 'cwk.callTypeCallback',
      status: 'cwk.callStatusDone',
      ai: true,
      color: '#00f0ff',
    },
  ]
  return (
    <div
      className="p-3 space-y-2 overflow-y-auto h-full"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.3s var(--spring-easing) both' }}
    >
      <p className="text-[10px] text-white/30 tracking-wider mb-3 uppercase">
        {t('cwk.aiCallTitle')}
      </p>
      {/* Quick stats */}
      <div className="flex gap-2 mb-3">
        {[
          { l: t('cwk.statToday'), v: '247', c: '#00ffcc' },
          { l: t('cwk.statConnected'), v: '78%', c: '#00ffc8' },
          { l: t('cwk.statAiConversion'), v: '24%', c: '#00d4ff' },
        ].map((s, i) => (
          <div
            key={i}
            className="flex-1 text-center py-2 rounded-xl border"
            style={{ background: `${s.c}08`, borderColor: `${s.c}15` }}
          >
            <p className="text-sm" style={{ color: s.c, textShadow: `0 0 6px ${s.c}40` }}>
              {s.v}
            </p>
            <p className="text-[8px] text-white/20">{s.l}</p>
          </div>
        ))}
      </div>
      {calls.map((c, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer"
          style={{
            background: c.active ? 'rgba(0,255,200,0.05)' : 'rgba(10,10,10,0.4)',
            borderColor: c.active ? 'rgba(0,255,200,0.15)' : 'rgba(255,255,255,0.04)',
            animation: c.active ? 'border-glow 3s ease-in-out infinite' : 'none',
          }}
        >
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: c.color,
              boxShadow: c.active ? `0 0 6px ${c.color}` : 'none',
              animation: c.active ? 'neon-pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span className="text-sm text-white/60 flex-1">{c.name}</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{
              background: c.ai ? 'rgba(0,212,255,0.1)' : 'rgba(0,139,157,0.1)',
              color: c.ai ? '#00d4ff' : '#008b9d',
            }}
          >
            {t(c.type)}
          </span>
          <span className="text-[10px]" style={{ color: c.color }}>
            {t(c.status)}
          </span>
        </div>
      ))}
    </div>
  )
}
