import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Code,
  Copy,
  Cpu,
  Database,
  FileSearch,
  Gauge,
  HardDrive,
  Loader2,
  Lock,
  Network,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useApp } from './app-context'
import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ AI 工具矩阵 — Interactive Tool Page
// Phase 2A: 工具实际化 · 模拟执行 · 实时反馈
// ==========================================

/** Execution status of an AI tool task. */
type ToolStatus = 'idle' | 'running' | 'success' | 'error'

/** A single log entry from an AI tool execution. */
interface ToolLogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

/** Configuration for each AI tool with simulation data. */
interface ToolConfig {
  id: string
  nameKey: string
  descKey: string
  icon: typeof Cpu
  color: string
  detailIcon: typeof Code
  metrics: { label: string; value: string; change: string; positive: boolean }[]
  capabilities: string[]
  simulationLogs: string[]
  resultSummary: string
}

const toolConfigs: ToolConfig[] = [
  {
    id: 'code-gen',
    nameKey: 'tools.codeGen',
    descKey: 'tools.codeGenDesc',
    icon: Cpu,
    color: '#00f0ff',
    detailIcon: Code,
    metrics: [
      { label: 'tools.metrics.efficiency', value: '3.2s', change: '-0.8s', positive: true },
      { label: 'tools.metrics.codeQuality', value: '96.4%', change: '+2.1%', positive: true },
      { label: 'tools.metrics.coverage', value: '89%', change: '+5%', positive: true },
      { label: 'tools.metrics.bugRate', value: '0.3%', change: '-0.2%', positive: true },
    ],
    capabilities: [
      'tools.cap.codeGen',
      'tools.cap.apiGen',
      'tools.cap.unitTest',
      'tools.cap.refactor',
      'tools.cap.docs',
    ],
    simulationLogs: [
      'tools.simLog.codeGen.0',
      'tools.simLog.codeGen.1',
      'tools.simLog.codeGen.2',
      'tools.simLog.codeGen.3',
      'tools.simLog.codeGen.4',
      'tools.simLog.codeGen.5',
      'tools.simLog.codeGen.6',
      'tools.simLog.codeGen.7',
      'tools.simLog.codeGen.8',
      'tools.simLog.codeGen.9',
    ],
    resultSummary: 'tools.result.codeGen',
  },
  {
    id: 'data-flow',
    nameKey: 'tools.dataFlow',
    descKey: 'tools.dataFlowDesc',
    icon: Activity,
    color: '#00d4ff',
    detailIcon: Network,
    metrics: [
      { label: 'tools.metrics.throughput', value: '12.8K/s', change: '+2.1K', positive: true },
      { label: 'tools.metrics.latency', value: '3.2ms', change: '-1.8ms', positive: true },
      { label: 'tools.metrics.errorRate', value: '0.01%', change: '-0.02%', positive: true },
      { label: 'tools.metrics.pipelines', value: '8 active', change: '+2', positive: true },
    ],
    capabilities: [
      'tools.cap.dataMonitor',
      'tools.cap.anomaly',
      'tools.cap.trafficPredict',
      'tools.cap.pipeline',
      'tools.cap.autoScale',
    ],
    simulationLogs: [
      'tools.simLog.dataFlow.0',
      'tools.simLog.dataFlow.1',
      'tools.simLog.dataFlow.2',
      'tools.simLog.dataFlow.3',
      'tools.simLog.dataFlow.4',
      'tools.simLog.dataFlow.5',
      'tools.simLog.dataFlow.6',
      'tools.simLog.dataFlow.7',
      'tools.simLog.dataFlow.8',
      'tools.simLog.dataFlow.9',
    ],
    resultSummary: 'tools.result.dataFlow',
  },
  {
    id: 'security',
    nameKey: 'tools.security',
    descKey: 'tools.securityDesc',
    icon: Shield,
    color: '#00ffcc',
    detailIcon: Lock,
    metrics: [
      { label: 'tools.metrics.securityScore', value: 'A+', change: '+1级', positive: true },
      { label: 'tools.metrics.vulnerabilities', value: '0', change: '-3', positive: true },
      { label: 'tools.metrics.protectionRate', value: '99.97%', change: '+0.02%', positive: true },
      { label: 'tools.metrics.scanCount', value: '1,247', change: '+89', positive: true },
    ],
    capabilities: [
      'tools.cap.vulnScan',
      'tools.cap.depAudit',
      'tools.cap.apiSecurity',
      'tools.cap.sensitiveData',
      'tools.cap.compliance',
    ],
    simulationLogs: [
      'tools.simLog.security.0',
      'tools.simLog.security.1',
      'tools.simLog.security.2',
      'tools.simLog.security.3',
      'tools.simLog.security.4',
      'tools.simLog.security.5',
      'tools.simLog.security.6',
      'tools.simLog.security.7',
      'tools.simLog.security.8',
      'tools.simLog.security.9',
    ],
    resultSummary: 'tools.result.security',
  },
  {
    id: 'knowledge',
    nameKey: 'tools.knowledge',
    descKey: 'tools.knowledgeDesc',
    icon: Brain,
    color: '#00ffc8',
    detailIcon: FileSearch,
    metrics: [
      { label: 'tools.metrics.knowledgeNodes', value: '24.6K', change: '+1.2K', positive: true },
      { label: 'tools.metrics.relevance', value: '94.8%', change: '+3.1%', positive: true },
      { label: 'tools.metrics.querySpeed', value: '8ms', change: '-4ms', positive: true },
      { label: 'tools.metrics.updateFreq', value: '实时', change: '实时', positive: true },
    ],
    capabilities: [
      'tools.cap.knowledgeGraph',
      'tools.cap.semanticSearch',
      'tools.cap.entityRelation',
      'tools.cap.reasoning',
      'tools.cap.qa',
    ],
    simulationLogs: [
      'tools.simLog.knowledge.0',
      'tools.simLog.knowledge.1',
      'tools.simLog.knowledge.2',
      'tools.simLog.knowledge.3',
      'tools.simLog.knowledge.4',
      'tools.simLog.knowledge.5',
      'tools.simLog.knowledge.6',
      'tools.simLog.knowledge.7',
      'tools.simLog.knowledge.8',
      'tools.simLog.knowledge.9',
    ],
    resultSummary: 'tools.result.knowledge',
  },
  {
    id: 'perf',
    nameKey: 'tools.perf',
    descKey: 'tools.perfDesc',
    icon: Zap,
    color: '#008b9d',
    detailIcon: Gauge,
    metrics: [
      { label: 'tools.metrics.fps', value: '60', change: '+0', positive: true },
      { label: 'tools.metrics.loadTime', value: '1.2s', change: '-0.4s', positive: true },
      { label: 'tools.metrics.memory', value: '128MB', change: '-32MB', positive: true },
      { label: 'tools.metrics.optimizations', value: '7', change: '+3', positive: true },
    ],
    capabilities: [
      'tools.cap.bottleneck',
      'tools.cap.memoryLeak',
      'tools.cap.renderOptimize',
      'tools.cap.bundleAnalysis',
      'tools.cap.cacheStrategy',
    ],
    simulationLogs: [
      'tools.simLog.perf.0',
      'tools.simLog.perf.1',
      'tools.simLog.perf.2',
      'tools.simLog.perf.3',
      'tools.simLog.perf.4',
      'tools.simLog.perf.5',
      'tools.simLog.perf.6',
      'tools.simLog.perf.7',
      'tools.simLog.perf.8',
      'tools.simLog.perf.9',
    ],
    resultSummary: 'tools.result.perf',
  },
  {
    id: 'warehouse',
    nameKey: 'tools.warehouse',
    descKey: 'tools.warehouseDesc',
    icon: Database,
    color: '#00f0ff',
    detailIcon: HardDrive,
    metrics: [
      { label: 'tools.metrics.storage', value: '2.4TB', change: '+128GB', positive: true },
      { label: 'tools.metrics.queryPerf', value: '45ms', change: '-12ms', positive: true },
      { label: 'tools.metrics.availability', value: '99.99%', change: '+0.01%', positive: true },
      { label: 'tools.metrics.dataNodes', value: '16', change: '+4', positive: true },
    ],
    capabilities: [
      'tools.cap.dataWarehouse',
      'tools.cap.dataPartition',
      'tools.cap.queryEngine',
      'tools.cap.dataBackup',
      'tools.cap.dataCompress',
    ],
    simulationLogs: [
      'tools.simLog.warehouse.0',
      'tools.simLog.warehouse.1',
      'tools.simLog.warehouse.2',
      'tools.simLog.warehouse.3',
      'tools.simLog.warehouse.4',
      'tools.simLog.warehouse.5',
      'tools.simLog.warehouse.6',
      'tools.simLog.warehouse.7',
      'tools.simLog.warehouse.8',
      'tools.simLog.warehouse.9',
    ],
    resultSummary: 'tools.result.warehouse',
  },
]

/**
 * Enhanced AI Tools page with interactive tool panels.
 * Each tool can be "launched" to run a simulated execution with
 * real-time log streaming, metrics dashboard, and result summary.
 */
export function AIToolsPage() {
  const { t } = useI18n()
  const { addNotification, addActivity } = useApp()
  const tc = useThemeColors()
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [toolStates, setToolStates] = useState<Record<string, ToolStatus>>({})
  const [toolLogs, setToolLogs] = useState<Record<string, ToolLogEntry[]>>({})
  const [copiedResult, setCopiedResult] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  const activeTool = toolConfigs.find((tc) => tc.id === selectedTool)

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [toolLogs])

  const runTool = useCallback(
    (toolId: string) => {
      const config = toolConfigs.find((tc) => tc.id === toolId)
      if (!config) return

      setToolStates((prev) => ({ ...prev, [toolId]: 'running' }))
      setToolLogs((prev) => ({ ...prev, [toolId]: [] }))

      // Simulate log streaming
      config.simulationLogs.forEach((msg, i) => {
        setTimeout(
          () => {
            const entry: ToolLogEntry = {
              timestamp: new Date().toISOString().slice(11, 23),
              message: t(msg),
              type: i === config.simulationLogs.length - 1 ? 'success' : 'info',
            }
            setToolLogs((prev) => ({
              ...prev,
              [toolId]: [...(prev[toolId] || []), entry],
            }))

            // Final log → mark success
            if (i === config.simulationLogs.length - 1) {
              setTimeout(() => {
                setToolStates((prev) => ({ ...prev, [toolId]: 'success' }))
                addNotification({
                  title: t('tools.execDone', { name: t(config.nameKey) }),
                  message: t(config.resultSummary).slice(0, 60) + '…',
                  type: 'success',
                  color: config.color,
                })
                addActivity({
                  action: t('tools.aiToolExec'),
                  target: t('tools.execSuccess', { name: t(config.nameKey) }),
                  type: 'ai',
                  color: config.color,
                })
              }, 300)
            }
          },
          (i + 1) * 600,
        )
      })
    },
    [t, addNotification, addActivity],
  )

  const resetTool = useCallback((toolId: string) => {
    setToolStates((prev) => ({ ...prev, [toolId]: 'idle' }))
    setToolLogs((prev) => ({ ...prev, [toolId]: [] }))
  }, [])

  // Grid view
  if (!activeTool) {
    return (
      <div
        className="h-full overflow-y-auto p-6"
        style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="tracking-wider flex items-center gap-3"
              style={{ color: tc.success, textShadow: `0 0 15px ${tc.alpha(tc.success, 0.5)}` }}
            >
              <Sparkles className="w-6 h-6" />
              {t('tools.title')}
            </h1>
            <p className="text-xs text-white/25 mt-1 tracking-wider">
              AI Tool Matrix — Phase 2A Interactive Tools
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5"
              style={{
                background: tc.alpha(tc.success, 0.06),
                border: `1px solid ${tc.alpha(tc.success, 0.15)}`,
                color: tc.success,
              }}
            >
              <CheckCircle2 className="w-3 h-3" />
              {t('tools.toolsReady', { n: toolConfigs.length })}
            </div>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: t('tools.totalTools'),
              value: '6',
              icon: Cpu,
              color: '#00f0ff',
              sub: t('tools.allOnline'),
            },
            {
              label: t('tools.todayExec'),
              value: '47',
              icon: Play,
              color: '#00ffc8',
              sub: t('tools.vsYesterday'),
            },
            {
              label: t('tools.successRate'),
              value: '99.4%',
              icon: CheckCircle2,
              color: '#00ffcc',
              sub: t('tools.near7Days'),
            },
            {
              label: t('tools.avgTime'),
              value: '4.8s',
              icon: Zap,
              color: '#00d4ff',
              sub: t('tools.optimized'),
            },
          ].map((m, i) => {
            const Icon = m.icon
            return (
              <NeonCard key={i} color={m.color}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">
                      {t(m.label)}
                    </p>
                    <p
                      className="text-xl"
                      style={{ color: m.color, textShadow: `0 0 10px ${m.color}50` }}
                    >
                      {m.value}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: `${m.color}80` }} />
                  </div>
                </div>
                <p className="text-[10px] mt-2 text-white/20">{m.sub}</p>
              </NeonCard>
            )
          })}
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {toolConfigs.map((tool, _i) => {
            const Icon = tool.icon
            const status = toolStates[tool.id] || 'idle'
            return (
              <NeonCard key={tool.id} color={tool.color}>
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: `${tool.color}15`,
                      border: `1px solid ${tool.color}30`,
                      boxShadow: `0 0 10px ${tool.color}20`,
                      animation:
                        status === 'running' ? 'neon-pulse 1.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tool.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-white/90 mb-0.5"
                      style={{ textShadow: `0 0 8px ${tool.color}40` }}
                    >
                      {t(tool.nameKey)}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed">{t(tool.descKey)}</p>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tool.capabilities.slice(0, 3).map((cap, j) => (
                    <span
                      key={j}
                      className="text-[9px] px-2 py-0.5 rounded-full"
                      style={{
                        background: `${tool.color}08`,
                        color: `${tool.color}90`,
                        border: `1px solid ${tool.color}20`,
                      }}
                    >
                      {t(cap)}
                    </span>
                  ))}
                  {tool.capabilities.length > 3 && (
                    <span className="text-[9px] text-white/20">
                      +{tool.capabilities.length - 3}
                    </span>
                  )}
                </div>

                {/* Status Badge + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          status === 'running'
                            ? tool.color
                            : status === 'success'
                              ? '#00ffc8'
                              : 'rgba(255,255,255,0.15)',
                        boxShadow:
                          status === 'running'
                            ? `0 0 6px ${tool.color}`
                            : status === 'success'
                              ? '0 0 6px #00ffc8'
                              : 'none',
                        animation:
                          status === 'running' ? 'neon-pulse 1s ease-in-out infinite' : 'none',
                      }}
                    />
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          status === 'running'
                            ? tool.color
                            : status === 'success'
                              ? '#00ffc8'
                              : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {status === 'running'
                        ? t('tools.status.running')
                        : status === 'success'
                          ? t('tools.status.completed')
                          : t('tools.status.idle')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTool(tool.id)}
                      className="px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300 flex items-center gap-1"
                      style={{
                        background: `${tool.color}08`,
                        border: `1px solid ${tool.color}25`,
                        color: tool.color,
                      }}
                    >
                      {t('tools.detail')} <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTool(tool.id)
                        runTool(tool.id)
                      }}
                      disabled={status === 'running'}
                      className="px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300 flex items-center gap-1 disabled:opacity-40"
                      style={{
                        background: `linear-gradient(135deg, ${tool.color}20, rgba(0,212,255,0.15))`,
                        border: `1px solid ${tool.color}40`,
                        color: tool.color,
                        boxShadow: `0 0 8px ${tool.color}15`,
                      }}
                    >
                      <Play className="w-3 h-3" /> {t('tools.launch')}
                    </button>
                  </div>
                </div>
              </NeonCard>
            )
          })}
        </div>
      </div>
    )
  }

  // Detail view
  const ToolIcon = activeTool.icon
  const DetailIcon = activeTool.detailIcon
  const status = toolStates[activeTool.id] || 'idle'
  const logs = toolLogs[activeTool.id] || []

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedTool(null)}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ChevronRight className="w-4 h-4 text-white/30 rotate-180" />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${activeTool.color}15`,
              border: `1px solid ${activeTool.color}30`,
              boxShadow: `0 0 12px ${activeTool.color}20`,
            }}
          >
            <ToolIcon className="w-5 h-5" style={{ color: activeTool.color }} />
          </div>
          <div>
            <h2
              className="tracking-wider flex items-center gap-2"
              style={{ color: activeTool.color, textShadow: `0 0 15px ${activeTool.color}50` }}
            >
              {t(activeTool.nameKey)}
            </h2>
            <p className="text-xs text-white/25 mt-0.5">{t(activeTool.descKey)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'success' && (
            <button
              onClick={() => resetTool(activeTool.id)}
              className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <RotateCcw className="w-3 h-3" /> {t('tools.reset')}
            </button>
          )}
          <button
            onClick={() =>
              status === 'idle' || status === 'success' ? runTool(activeTool.id) : undefined
            }
            disabled={status === 'running'}
            className="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all duration-300 disabled:opacity-40"
            style={{
              background: `linear-gradient(135deg, ${activeTool.color}20, rgba(0,212,255,0.15))`,
              border: `1px solid ${activeTool.color}50`,
              color: activeTool.color,
              boxShadow: `0 0 12px ${activeTool.color}20`,
            }}
          >
            {status === 'running' ? (
              <>
                <Loader2
                  className="w-3.5 h-3.5"
                  style={{ animation: 'icon-spin 1s linear infinite' }}
                />{' '}
                {t('tools.status.running')}
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> {t('tools.launch')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {activeTool.metrics.map((m, i) => (
          <NeonCard key={i} color={activeTool.color}>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{t(m.label)}</p>
            <p
              className="text-xl"
              style={{ color: activeTool.color, textShadow: `0 0 10px ${activeTool.color}50` }}
            >
              {m.value}
            </p>
            <p
              className="text-[10px] mt-2 flex items-center gap-1"
              style={{ color: m.positive ? '#00ffc8' : '#005f73' }}
            >
              {m.positive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {m.change}
            </p>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Execution Log */}
        <div className="xl:col-span-2">
          <NeonCard color={activeTool.color} hoverable={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                {t('tools.execLogSub')}
              </h3>
              {status === 'running' && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: activeTool.color,
                      animation: 'neon-pulse 1s ease-in-out infinite',
                    }}
                  />
                  <span className="text-[10px]" style={{ color: activeTool.color }}>
                    LIVE
                  </span>
                </div>
              )}
            </div>

            <div
              className="rounded-xl p-4 overflow-y-auto"
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: `1px solid ${activeTool.color}15`,
                minHeight: 280,
                maxHeight: 400,
                scrollbarWidth: 'none',
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {logs.length === 0 && status === 'idle' ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <DetailIcon
                    className="w-10 h-10 mb-3"
                    style={{ color: `${activeTool.color}30` }}
                  />
                  <p className="text-sm text-white/20 mb-1">{t('tools.clickToStart')}</p>
                  <p className="text-[10px] text-white/10">{t('tools.aiWillAnalyze')}</p>
                </div>
              ) : (
                <>
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 mb-1.5"
                      style={{ animation: `spring-in 0.2s var(--spring-easing) both` }}
                    >
                      <span className="text-[9px] text-white/15 shrink-0 w-20">
                        {log.timestamp}
                      </span>
                      <span
                        className="text-[9px] shrink-0"
                        style={{
                          color:
                            log.type === 'success'
                              ? '#00ffc8'
                              : log.type === 'warning'
                                ? '#00d4ff'
                                : log.type === 'error'
                                  ? '#005f73'
                                  : `${activeTool.color}80`,
                        }}
                      >
                        {log.type === 'success'
                          ? '✓'
                          : log.type === 'warning'
                            ? '⚠'
                            : log.type === 'error'
                              ? '✗'
                              : '▸'}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{
                          color: log.type === 'success' ? '#00ffc8' : 'rgba(255,255,255,0.55)',
                        }}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {status === 'running' && (
                    <div
                      className="flex items-center gap-2 mt-2"
                      style={{ animation: 'neon-pulse 1.5s ease-in-out infinite' }}
                    >
                      <span className="text-[9px] text-white/15 w-20">&nbsp;</span>
                      <Loader2
                        className="w-3 h-3"
                        style={{
                          color: activeTool.color,
                          animation: 'icon-spin 1s linear infinite',
                        }}
                      />
                      <span className="text-[10px]" style={{ color: `${activeTool.color}60` }}>
                        {t('tools.processing')}
                      </span>
                    </div>
                  )}
                  <div ref={logEndRef} />
                </>
              )}
            </div>

            {/* Result Summary */}
            {status === 'success' && (
              <div
                className="mt-4 rounded-xl p-4 border"
                style={{
                  background: 'rgba(0,255,200,0.03)',
                  borderColor: 'rgba(0,255,200,0.15)',
                  animation: 'spring-in 0.4s var(--spring-easing) both',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className="w-4 h-4 text-[#00ffc8]"
                      style={{ filter: 'drop-shadow(0 0 4px #00ffc8)' }}
                    />
                    <span className="text-xs text-[#00ffc8]">{t('tools.execCompleteSub')}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(t(activeTool.resultSummary))
                      setCopiedResult(true)
                      setTimeout(() => setCopiedResult(false), 2000)
                    }}
                    className="text-[9px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                    style={{
                      background: 'rgba(0,255,200,0.06)',
                      border: '1px solid rgba(0,255,200,0.15)',
                      color: '#00ffc8',
                    }}
                  >
                    {copiedResult ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                    {copiedResult ? t('tools.copied') : t('tools.copy')}
                  </button>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t(activeTool.resultSummary)}
                </p>
              </div>
            )}
          </NeonCard>
        </div>

        {/* Right Panel: Capabilities + Info */}
        <div className="space-y-5">
          <NeonCard color={activeTool.color} hoverable={false}>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
              {t('tools.capabilitiesSub')}
            </h3>
            <div className="space-y-2">
              {activeTool.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300"
                  style={{
                    background: `${activeTool.color}05`,
                    border: `1px solid ${activeTool.color}10`,
                    animation: `spring-in 0.3s var(--spring-easing) ${i * 0.05}s both`,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: activeTool.color,
                      boxShadow: `0 0 4px ${activeTool.color}`,
                    }}
                  />
                  <span className="text-xs text-white/50">{t(cap)}</span>
                </div>
              ))}
            </div>
          </NeonCard>

          <NeonCard color={activeTool.color} hoverable={false}>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
              {t('tools.execStatusSub')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">{t('tools.runStatus')}</span>
                <span
                  className="text-[10px] flex items-center gap-1.5"
                  style={{
                    color:
                      status === 'running'
                        ? activeTool.color
                        : status === 'success'
                          ? '#00ffc8'
                          : 'rgba(255,255,255,0.3)',
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        status === 'running'
                          ? activeTool.color
                          : status === 'success'
                            ? '#00ffc8'
                            : 'rgba(255,255,255,0.15)',
                      animation:
                        status === 'running' ? 'neon-pulse 1s ease-in-out infinite' : 'none',
                    }}
                  />
                  {status === 'running'
                    ? t('tools.status.runningState')
                    : status === 'success'
                      ? t('tools.status.completedState')
                      : t('tools.status.idleState')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">{t('tools.logCount')}</span>
                <span className="text-[10px]" style={{ color: activeTool.color }}>
                  {logs.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">{t('tools.aiModel')}</span>
                <span className="text-[10px] text-white/40">YYC³-Ultra v4.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">{t('tools.execEngine')}</span>
                <span className="text-[10px] text-white/40">五维闭环 v1.8</span>
              </div>
              {status === 'running' && (
                <div className="mt-2">
                  <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (logs.length / activeTool.simulationLogs.length) * 100)}%`,
                        background: `linear-gradient(90deg, ${activeTool.color}, #00ffc8)`,
                        boxShadow: `0 0 6px ${activeTool.color}50`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-white/15 mt-1 text-right">
                    {logs.length}/{activeTool.simulationLogs.length}
                  </p>
                </div>
              )}
            </div>
          </NeonCard>
        </div>
      </div>
    </div>
  )
}
