/**
 * @file advanced-features-page.tsx
 * @description YYC³ Advanced Features Dashboard — Unified entry point for all 4 advanced modules.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,page,dashboard
 */

import {
  BarChart3,
  Brain,
  Cable,
  ChevronRight,
  Cpu,
  Gauge,
  GitBranch,
  Layers,
  Play,
  RefreshCw,
  Shield,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { useThemeColors } from '../../hooks/use-theme-colors'
import { NeonCard } from '../../neon-card'
import { PageTransition } from '../../page-transition'
import { useCodeAnalyzer } from '../hooks/use-code-analyzer'
import { useMCPOrchestrator } from '../hooks/use-mcp-orchestrator'
import { useMonitor } from '../hooks/use-monitor'
import { usePipeline } from '../hooks/use-pipeline'

import type { ThemeColors } from '../../hooks/use-theme-colors'
import type {
  AnalysisResult,
  AnalysisSummary,
  AnomalyEvent,
  CodeFix,
  ExecutionTrace,
  HealthSnapshot,
  LogEntry,
  MCPTool,
  MetricName,
  MetricSeries,
  PipelineDefinition,
  PipelineRun,
  StageRun,
  StepTrace,
  ToolChain,
} from '../advanced-types'

// ==========================================
// Tab Definitions
// ==========================================

interface TabDef {
  id: string
  label: string
  icon: typeof Brain
  color: string
}

const tabs: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: Layers, color: '#00f0ff' },
  { id: 'code-analyzer', label: 'Code Analyzer', icon: Brain, color: '#8b5cf6' },
  { id: 'pipeline', label: 'Pipelines', icon: GitBranch, color: '#00ff88' },
  { id: 'monitor', label: 'Monitor', icon: Gauge, color: '#ffaa00' },
  { id: 'orchestrator', label: 'MCP Orchestrator', icon: Cable, color: '#ff6b9d' },
]

// ==========================================
// Advanced Features Page
// ==========================================

export function AdvancedFeaturesPage() {
  const colors = useThemeColors()
  const [activeTab, setActiveTab] = useState('overview')

  const analyzer = useCodeAnalyzer()
  const pipeline = usePipeline()
  const monitor = useMonitor()
  const orchestrator = useMCPOrchestrator()

  return (
    <PageTransition pageKey="advanced-features">
      <div className="flex h-full flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="glitch-text text-2xl font-bold tracking-wider"
              data-text="ADVANCED FEATURES"
              style={{ color: colors.primary }}
            >
              ADVANCED FEATURES
            </h1>
            <p className="mt-1 text-xs opacity-60" style={{ color: colors.mutedForeground }}>
              AI-Powered Intelligence · Automation · Monitoring · Orchestration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge label="Monitor" active={monitor.isCollecting} color="#ffaa00" />
            <StatusBadge
              label="Alerts"
              active={monitor.criticalAnomalies.length > 0}
              color="#ff4444"
              count={monitor.criticalAnomalies.length}
            />
            <StatusBadge label="Pipeline" active={pipeline.isExecuting} color="#00ff88" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex gap-1 overflow-x-auto rounded-lg p-1"
          style={{ background: colors.card }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200"
              style={{
                color: activeTab === tab.id ? tab.color : colors.mutedForeground,
                background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
                borderBottom:
                  activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              }}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'overview' && (
                <OverviewDashboard
                  analyzer={analyzer}
                  pipeline={pipeline}
                  monitor={monitor}
                  orchestrator={orchestrator}
                  onNavigate={setActiveTab}
                  colors={colors}
                />
              )}
              {activeTab === 'code-analyzer' && (
                <CodeAnalyzerPanel analyzer={analyzer} colors={colors} />
              )}
              {activeTab === 'pipeline' && <PipelinePanel pipeline={pipeline} colors={colors} />}
              {activeTab === 'monitor' && <MonitorPanel monitor={monitor} colors={colors} />}
              {activeTab === 'orchestrator' && (
                <OrchestratorPanel orchestrator={orchestrator} colors={colors} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}

// ==========================================
// Prop Type Definitions
// ==========================================

interface AnalyzerProps {
  results: AnalysisResult[]
  summary: AnalysisSummary | null
  isAnalyzing: boolean
  qualityScore: number
  qualityColor: string
  runDemoAnalysis: () => void
  clearResults: () => void
  handleApplyFix: (fix: CodeFix) => CodeFix | undefined
  handleDismiss: (id: string) => void
  appliedFixes: string[]
}

interface PipelineProps {
  pipelines: PipelineDefinition[]
  runs: PipelineRun[]
  isExecuting: boolean
  activeRun: PipelineRun | null
  addDemoPipeline: () => PipelineDefinition
  executePipeline: (p: PipelineDefinition) => Promise<PipelineRun>
}

interface MetricListItem {
  name: MetricName
  label: string
  unit: string
  min: number
  max: number
  warningThreshold: number
  criticalThreshold: number
  aggregation: MetricSeries['aggregation']
  currentData: MetricSeries | null
}

interface MonitorProps {
  series: Partial<Record<MetricName, { current: number }>>
  anomalies: AnomalyEvent[]
  health: HealthSnapshot | null
  isCollecting: boolean
  selectedMetric: MetricName | null
  metricsList: MetricListItem[]
  unacknowledgedAnomalies: AnomalyEvent[]
  setSelectedMetric: (metric: MetricName | null) => void
  acknowledgeAnomaly: (id: string) => void
  criticalAnomalies: AnomalyEvent[]
}

interface OrchestratorProps {
  tools: MCPTool[]
  chains: ToolChain[]
  traces: ExecutionTrace[]
  isExecuting: boolean
  enabledTools: MCPTool[]
  selectedChain: ToolChain | null
  activeTrace: ExecutionTrace | null
  recentTraces: ExecutionTrace[]
  addDemoChain: () => ToolChain
  executeChain: (chain: ToolChain, input?: Record<string, unknown>) => Promise<ExecutionTrace>
  setSelectedChain: (id: string | null) => void
  setActiveTrace: (id: string) => void
}

interface OverviewDashboardProps {
  analyzer: AnalyzerProps
  pipeline: PipelineProps
  monitor: MonitorProps
  orchestrator: OrchestratorProps
  onNavigate: (tab: string) => void
  colors: ThemeColors
}

// ==========================================
// Sub-components
// ==========================================

function StatusBadge({
  label,
  active,
  color,
  count,
}: {
  label: string
  active: boolean
  color: string
  count?: number
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
      style={{ background: `${color}15`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: active ? color : `${color}40`,
          boxShadow: active ? `0 0 6px ${color}` : 'none',
        }}
      />
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-0.5 rounded-sm px-1 text-[9px]" style={{ background: `${color}30` }}>
          {count}
        </span>
      )}
    </div>
  )
}

// ==========================================
// Overview Dashboard
// ==========================================

function OverviewDashboard({
  analyzer,
  pipeline,
  monitor,
  orchestrator,
  onNavigate,
  colors,
}: OverviewDashboardProps) {
  const cards = [
    {
      id: 'code-analyzer',
      icon: Brain,
      color: '#8b5cf6',
      title: 'AI Code Analyzer',
      desc: `${analyzer.results.length} issues · Score: ${analyzer.qualityScore}`,
      metrics: [
        {
          label: 'Issues',
          value: analyzer.results.length.toString(),
          c:
            analyzer.results.filter((r: AnalysisResult) => r.severity === 'error').length > 0
              ? '#ff4444'
              : '#00ff88',
        },
        { label: 'Score', value: `${analyzer.qualityScore}/100`, c: analyzer.qualityColor },
      ],
    },
    {
      id: 'pipeline',
      icon: GitBranch,
      color: '#00ff88',
      title: 'Pipelines',
      desc: `${pipeline.pipelines.length} pipelines · ${pipeline.runs.length} runs`,
      metrics: [
        { label: 'Pipelines', value: pipeline.pipelines.length.toString(), c: '#00ff88' },
        {
          label: 'Status',
          value: pipeline.isExecuting ? 'Running' : 'Idle',
          c: pipeline.isExecuting ? '#ffaa00' : '#00ff88',
        },
      ],
    },
    {
      id: 'monitor',
      icon: Gauge,
      color: '#ffaa00',
      title: 'Monitor',
      desc: `${Object.keys(monitor.series).length} metrics`,
      metrics: [
        {
          label: 'Health',
          value: monitor.health ? `${monitor.health.overall}%` : 'N/A',
          c: monitor.health?.overall && monitor.health.overall > 80 ? '#00ff88' : '#ffaa00',
        },
        {
          label: 'Anomalies',
          value: monitor.unacknowledgedAnomalies.length.toString(),
          c: monitor.unacknowledgedAnomalies.length > 0 ? '#ff4444' : '#00ff88',
        },
      ],
    },
    {
      id: 'orchestrator',
      icon: Cable,
      color: '#ff6b9d',
      title: 'MCP Orchestrator',
      desc: `${orchestrator.tools.length} tools · ${orchestrator.chains.length} chains`,
      metrics: [
        { label: 'Tools', value: orchestrator.enabledTools.length.toString(), c: '#ff6b9d' },
        { label: 'Traces', value: orchestrator.traces.length.toString(), c: '#00f0ff' },
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <NeonCard
          key={card.id}
          color={card.color}
          className="cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div onClick={() => onNavigate(card.id)}>
            <div className="mb-3 flex items-center gap-2">
              <card.icon size={18} style={{ color: card.color }} />
              <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
                {card.title}
              </h3>
              <ChevronRight
                size={14}
                className="ml-auto opacity-40"
                style={{ color: card.color }}
              />
            </div>
            <p className="mb-3 text-xs opacity-60" style={{ color: colors.mutedForeground }}>
              {card.desc}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {card.metrics.map((m: { label: string; value: string; c: string }) => (
                <div
                  key={m.label}
                  className="rounded-md p-2 text-center"
                  style={{ background: `${m.c}10` }}
                >
                  <div className="text-lg font-bold" style={{ color: m.c }}>
                    {m.value}
                  </div>
                  <div className="text-[9px] opacity-50">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </NeonCard>
      ))}

      {/* System health card */}
      {monitor.health && (
        <NeonCard
          color={monitor.health.overall > 80 ? '#00ff88' : '#ffaa00'}
          className="md:col-span-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: colors.foreground }}>
              System Health
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: monitor.health.overall > 80 ? '#00ff88' : '#ffaa00' }}
            >
              {monitor.health.overall}%
            </span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-3">
            <MiniHealthBar
              label="CPU"
              value={monitor.health.cpu.usage}
              status={monitor.health.cpu.status}
            />
            <MiniHealthBar
              label="Memory"
              value={monitor.health.memory.usage}
              status={monitor.health.memory.status}
            />
            <MiniHealthBar
              label="API Lat"
              value={Math.min(100, (monitor.health.api.latency / 2000) * 100)}
              status={monitor.health.api.status}
            />
            <MiniHealthBar
              label="Overall"
              value={monitor.health.overall}
              status={
                monitor.health.overall > 80
                  ? 'healthy'
                  : monitor.health.overall > 60
                    ? 'warning'
                    : 'critical'
              }
            />
          </div>
        </NeonCard>
      )}
    </div>
  )
}

function MiniHealthBar({ label, value, status }: { label: string; value: number; status: string }) {
  const c = status === 'healthy' ? '#00ff88' : status === 'warning' ? '#ffaa00' : '#ff4444'
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px]" style={{ color: c }}>
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: `${c}20` }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, value)}%`, background: c, boxShadow: `0 0 6px ${c}` }}
        />
      </div>
    </div>
  )
}

// ==========================================
// Code Analyzer Panel
// ==========================================

function CodeAnalyzerPanel({ analyzer, colors }: { analyzer: AnalyzerProps; colors: ThemeColors }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <NeonCard color="#8b5cf6" className="lg:col-span-1">
        <div className="mb-3 flex items-center gap-2">
          <Brain size={16} style={{ color: '#8b5cf6' }} />
          <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
            Controls
          </h3>
        </div>
        <button
          onClick={analyzer.runDemoAnalysis}
          disabled={analyzer.isAnalyzing}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
          style={{ background: '#8b5cf625', color: '#8b5cf6', border: '1px solid #8b5cf640' }}
        >
          {analyzer.isAnalyzing ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {analyzer.isAnalyzing ? 'Analyzing...' : 'Run Demo Analysis'}
        </button>
        {analyzer.summary && (
          <div className="mt-3 space-y-2 rounded-md p-3" style={{ background: colors.card }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] opacity-50">Quality</span>
              <span className="text-sm font-bold" style={{ color: analyzer.qualityColor }}>
                {analyzer.qualityScore}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] opacity-50">Issues</span>
              <span className="text-sm font-bold" style={{ color: colors.foreground }}>
                {analyzer.summary.totalIssues}
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: `${analyzer.qualityColor}20` }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${analyzer.qualityScore}%`, background: analyzer.qualityColor }}
              />
            </div>
          </div>
        )}
      </NeonCard>

      <NeonCard color="#8b5cf6" className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: '#8b5cf6' }} />
            <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
              Results
            </h3>
          </div>
          {analyzer.results.length > 0 && (
            <button
              onClick={analyzer.clearResults}
              className="text-[10px] opacity-40 hover:opacity-100"
            >
              Clear
            </button>
          )}
        </div>
        {analyzer.results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Brain size={32} />
            <p className="mt-2 text-xs">Run an analysis to see results</p>
          </div>
        ) : (
          <div className="space-y-1">
            {analyzer.results.map((result: AnalysisResult) => (
              <div
                key={result.id}
                className="group flex items-start gap-2 rounded-md p-2 transition-all hover:bg-white/5"
                style={{
                  borderLeft: `3px solid ${result.severity === 'error' ? '#ff4444' : result.severity === 'warning' ? '#ffaa00' : '#00f0ff'}`,
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1 text-[9px] font-medium"
                      style={{
                        background: `${result.severity === 'error' ? '#ff4444' : result.severity === 'warning' ? '#ffaa00' : '#00f0ff'}20`,
                        color:
                          result.severity === 'error'
                            ? '#ff4444'
                            : result.severity === 'warning'
                              ? '#ffaa00'
                              : '#00f0ff',
                      }}
                    >
                      {result.ruleId}
                    </span>
                    <span className="text-xs font-medium" style={{ color: colors.foreground }}>
                      {result.message}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] opacity-50">
                    {result.file}:{result.line} · {result.category}
                  </div>
                  <div className="mt-1 text-[10px]" style={{ color: '#8b5cf6', opacity: 0.8 }}>
                    {result.suggestion}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {result.fix?.isSafe && (
                    <button
                      onClick={() => analyzer.handleApplyFix(result.fix!)}
                      disabled={analyzer.appliedFixes.includes(result.fix.id)}
                      className="rounded px-2 py-1 text-[9px] font-medium transition-all disabled:opacity-30"
                      style={{
                        background: analyzer.appliedFixes.includes(result.fix.id)
                          ? '#00ff8820'
                          : '#00ff8815',
                        color: '#00ff88',
                      }}
                    >
                      {analyzer.appliedFixes.includes(result.fix.id) ? '✓ Fixed' : 'Fix'}
                    </button>
                  )}
                  <button
                    onClick={() => analyzer.handleDismiss(result.id)}
                    className="rounded px-2 py-1 text-[9px] opacity-30 transition-all hover:opacity-80"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeonCard>
    </div>
  )
}

// ==========================================
// Pipeline Panel
// ==========================================

function PipelinePanel({ pipeline, colors }: { pipeline: PipelineProps; colors: ThemeColors }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <NeonCard color="#00ff88" className="lg:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={16} style={{ color: '#00ff88' }} />
            <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
              Pipelines
            </h3>
          </div>
          <button
            onClick={pipeline.addDemoPipeline}
            className="rounded px-2 py-1 text-[10px] font-medium"
            style={{ background: '#00ff8820', color: '#00ff88' }}
          >
            + Demo
          </button>
        </div>
        {pipeline.pipelines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 opacity-40">
            <GitBranch size={28} />
            <p className="mt-2 text-xs">No pipelines configured</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pipeline.pipelines.map((p: PipelineDefinition) => (
              <div
                key={p.id}
                className="cursor-pointer rounded-md p-2 transition-all hover:bg-white/5"
                style={{ borderLeft: `3px solid ${p.isActive ? '#00ff88' : '#555'}` }}
                onClick={() => pipeline.executePipeline(p)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: colors.foreground }}>
                    {p.name}
                  </span>
                  <span className="text-[9px] opacity-40">{p.stages.length} stages</span>
                </div>
                <p className="mt-0.5 text-[10px] opacity-50 line-clamp-1">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </NeonCard>

      <NeonCard color="#00ff88" className="lg:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={16} style={{ color: '#00ff88' }} />
          <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
            {pipeline.activeRun ? `Run: ${pipeline.activeRun.pipelineName}` : 'Execution View'}
          </h3>
          {pipeline.isExecuting && (
            <RefreshCw size={14} className="animate-spin" style={{ color: '#00ff88' }} />
          )}
        </div>
        {!pipeline.activeRun ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Play size={32} />
            <p className="mt-2 text-xs">Click a pipeline to execute</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-1">
              {pipeline.activeRun.stages.map((stage: StageRun) => (
                <div key={stage.stageId} className="flex-1">
                  <div
                    className="mb-1 h-1.5 rounded-full transition-all"
                    style={{
                      background:
                        stage.status === 'success'
                          ? '#00ff88'
                          : stage.status === 'running'
                            ? '#ffaa00'
                            : stage.status === 'failed'
                              ? '#ff4444'
                              : '#333',
                      boxShadow: stage.status === 'running' ? '0 0 6px #ffaa00' : 'none',
                    }}
                  />
                  <div className="text-[9px] opacity-50">{stage.name}</div>
                </div>
              ))}
            </div>
            <div
              className="mt-3 max-h-48 overflow-y-auto rounded-md p-2 font-mono text-[10px]"
              style={{ background: colors.card }}
            >
              {pipeline.activeRun.logs.length === 0 ? (
                <span className="opacity-30">Waiting...</span>
              ) : (
                pipeline.activeRun.logs.slice(-30).map((log: LogEntry) => (
                  <div
                    key={log.id}
                    className="flex gap-2"
                    style={{
                      color:
                        log.level === 'error'
                          ? '#ff4444'
                          : log.level === 'warn'
                            ? '#ffaa00'
                            : colors.mutedForeground,
                    }}
                  >
                    <span className="shrink-0 opacity-30">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span>[{log.stage}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </NeonCard>
    </div>
  )
}

// ==========================================
// Monitor Panel
// ==========================================

function MonitorPanel({ monitor, colors }: { monitor: MonitorProps; colors: ThemeColors }) {
  const [showAnomalies, setShowAnomalies] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <NeonCard color="#ffaa00" className="lg:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} style={{ color: '#ffaa00' }} />
            <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
              Metrics
            </h3>
          </div>
          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className="relative rounded px-2 py-1 text-[10px] font-medium"
            style={{
              background: showAnomalies ? '#ff444420' : '#ffaa0020',
              color: showAnomalies ? '#ff4444' : '#ffaa00',
            }}
          >
            Anomalies
            {monitor.unacknowledgedAnomalies.length > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1 text-[8px] text-white">
                {monitor.unacknowledgedAnomalies.length}
              </span>
            )}
          </button>
        </div>
        {showAnomalies ? (
          <div className="space-y-1">
            {monitor.anomalies.slice(0, 20).map((anomaly: AnomalyEvent) => (
              <div
                key={anomaly.id}
                className="rounded-md p-2 text-[10px]"
                style={{
                  background: anomaly.severity === 'critical' ? '#ff444410' : '#ffaa0010',
                  borderLeft: `3px solid ${anomaly.severity === 'critical' ? '#ff4444' : '#ffaa00'}`,
                  opacity: anomaly.resolvedAt ? 0.4 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-medium"
                    style={{ color: anomaly.severity === 'critical' ? '#ff4444' : '#ffaa00' }}
                  >
                    {anomaly.metric}
                  </span>
                  <span className="opacity-40">
                    {new Date(anomaly.detectedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-0.5 opacity-60">{anomaly.message}</p>
                {!anomaly.acknowledged && (
                  <button
                    onClick={() => monitor.acknowledgeAnomaly(anomaly.id)}
                    className="mt-1 rounded px-2 py-0.5 text-[9px]"
                    style={{ background: '#ffaa0020', color: '#ffaa00' }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
            {monitor.anomalies.length === 0 && (
              <p className="py-4 text-center text-[10px] opacity-30">No anomalies</p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {monitor.metricsList.map((metric: MetricListItem) => (
              <div
                key={metric.name}
                className="cursor-pointer rounded-md p-2 transition-all hover:bg-white/5"
                style={{
                  borderLeft: `3px solid ${metric.currentData ? (metric.currentData.current > metric.criticalThreshold ? '#ff4444' : metric.currentData.current > metric.warningThreshold ? '#ffaa00' : '#00ff88') : '#555'}`,
                }}
                onClick={() =>
                  monitor.setSelectedMetric(
                    metric.name === monitor.selectedMetric ? null : metric.name,
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: colors.foreground }}>
                    {metric.label}
                  </span>
                  <span
                    className="text-[10px] font-bold"
                    style={{
                      color: metric.currentData
                        ? metric.currentData.current > metric.criticalThreshold
                          ? '#ff4444'
                          : metric.currentData.current > metric.warningThreshold
                            ? '#ffaa00'
                            : '#00ff88'
                        : colors.mutedForeground,
                    }}
                  >
                    {metric.currentData
                      ? `${Math.round(metric.currentData.current)}${metric.unit}`
                      : 'N/A'}
                  </span>
                </div>
                {metric.currentData && (
                  <div className="mt-1 h-1.5 rounded-full" style={{ background: '#333' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (metric.currentData.current / metric.max) * 100)}%`,
                        background:
                          metric.currentData.current > metric.criticalThreshold
                            ? '#ff4444'
                            : metric.currentData.current > metric.warningThreshold
                              ? '#ffaa00'
                              : '#00ff88',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </NeonCard>

      <NeonCard color="#ffaa00" className="lg:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background:
                monitor.health?.overall && monitor.health.overall > 80 ? '#00ff88' : '#ffaa00',
              boxShadow: `0 0 8px ${monitor.health?.overall && monitor.health.overall > 80 ? '#00ff88' : '#ffaa00'}`,
            }}
          />
          <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
            {monitor.selectedMetric
              ? (monitor.metricsList.find((m: MetricListItem) => m.name === monitor.selectedMetric)
                  ?.label ?? 'Detail')
              : 'Overview'}
          </h3>
        </div>
        {monitor.selectedMetric ? (
          (() => {
            const metric = monitor.metricsList.find(
              (m: MetricListItem) => m.name === monitor.selectedMetric,
            )
            const data = metric?.currentData
            if (!data) return <p className="text-xs opacity-40">No data</p>
            return (
              <div className="space-y-3">
                <div
                  className="flex h-24 items-end gap-[2px] rounded-md p-2"
                  style={{ background: colors.card }}
                >
                  {data.points.slice(-50).map((pt, i: number) => {
                    const h = ((pt.value - metric.min) / (metric.max - metric.min)) * 100
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all"
                        style={{
                          height: `${Math.max(3, h)}%`,
                          background:
                            pt.value > (metric.criticalThreshold as number)
                              ? '#ff444480'
                              : pt.value > (metric.warningThreshold as number)
                                ? '#ffaa0080'
                                : '#00f0ff60',
                        }}
                      />
                    )
                  })}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <StatBox
                    label="Current"
                    value={`${Math.round(data.current)}${metric.unit}`}
                    color="#00f0ff"
                  />
                  <StatBox
                    label="Average"
                    value={`${Math.round(data.avg)}${metric.unit}`}
                    color="#8b5cf6"
                  />
                  <StatBox
                    label="Min"
                    value={`${Math.round(data.min)}${metric.unit}`}
                    color="#00ff88"
                  />
                  <StatBox
                    label="Max"
                    value={`${Math.round(data.max)}${metric.unit}`}
                    color="#ff6b9d"
                  />
                </div>
              </div>
            )
          })()
        ) : monitor.health ? (
          (() => {
            const h = monitor.health
            return (
              <div className="grid grid-cols-4 gap-3">
                {(['cpu', 'memory', 'api', 'overall'] as const).map((key) => {
                  const label =
                    key === 'api' ? 'API Lat' : key.charAt(0).toUpperCase() + key.slice(1)
                  let value: number, status: string
                  if (key === 'overall') {
                    value = h.overall
                    status = value > 80 ? 'healthy' : value > 60 ? 'warning' : 'critical'
                  } else if (key === 'api') {
                    value = Math.min(100, (h.api.latency / 2000) * 100)
                    status = h.api.status
                  } else {
                    value = h[key].usage
                    status = h[key].status
                  }
                  const c =
                    status === 'healthy' ? '#00ff88' : status === 'warning' ? '#ffaa00' : '#ff4444'
                  return (
                    <div
                      key={key}
                      className="rounded-md p-3 text-center"
                      style={{ background: `${c}10` }}
                    >
                      <div className="text-2xl font-bold" style={{ color: c }}>
                        {Math.round(value)}
                        {key === 'api' ? 'ms' : '%'}
                      </div>
                      <div className="mt-1 text-[10px] opacity-50">{label}</div>
                      <div className="mt-1 text-[9px]" style={{ color: c }}>
                        {status.toUpperCase()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()
        ) : (
          <p className="py-8 text-center text-xs opacity-40">Collecting data...</p>
        )}
      </NeonCard>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-md p-2 text-center" style={{ background: `${color}10` }}>
      <div className="text-xs font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-[9px] opacity-40">{label}</div>
    </div>
  )
}

// ==========================================
// MCP Orchestrator Panel
// ==========================================

function OrchestratorPanel({
  orchestrator,
  colors,
}: {
  orchestrator: OrchestratorProps
  colors: ThemeColors
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <NeonCard color="#ff6b9d" className="lg:col-span-1">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} style={{ color: '#ff6b9d' }} />
            <h3 className="text-sm font-semibold" style={{ color: colors.foreground }}>
              Tools &amp; Chains
            </h3>
          </div>
          <button
            onClick={orchestrator.addDemoChain}
            className="rounded px-2 py-1 text-[10px] font-medium"
            style={{ background: '#ff6b9d20', color: '#ff6b9d' }}
          >
            + Demo Chain
          </button>
        </div>
        <div className="mb-3">
          <h4 className="mb-1 text-[10px] font-medium opacity-40">
            Tools ({orchestrator.tools.length})
          </h4>
          <div className="space-y-1">
            {orchestrator.tools.map((tool: MCPTool) => (
              <div key={tool.id} className="flex items-center gap-2 rounded-md p-1.5 text-[10px]">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: tool.enabled ? '#00ff88' : '#555',
                    boxShadow: tool.enabled ? '0 0 4px #00ff88' : 'none',
                  }}
                />
                <span style={{ color: colors.foreground }}>{tool.name}</span>
                <span className="ml-auto opacity-30">{tool.estimatedCost}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-1 text-[10px] font-medium opacity-40">
            Chains ({orchestrator.chains.length})
          </h4>
          <div className="space-y-1">
            {orchestrator.chains.map((chain: ToolChain) => (
              <div
                key={chain.id}
                className="cursor-pointer rounded-md p-2 transition-all hover:bg-white/5"
                style={{ borderLeft: `3px solid ${chain.isActive ? '#ff6b9d' : '#555'}` }}
                onClick={() => orchestrator.setSelectedChain(chain.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: colors.foreground }}>
                    {chain.name}
                  </span>
                  <span className="text-[9px] opacity-30">{chain.steps.length} steps</span>
                </div>
                <p className="mt-0.5 text-[9px] opacity-40 line-clamp-1">{chain.description}</p>
              </div>
            ))}
          </div>
        </div>
        {orchestrator.selectedChain && (
          <button
            onClick={() =>
              orchestrator.selectedChain && orchestrator.executeChain(orchestrator.selectedChain)
            }
            disabled={orchestrator.isExecuting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all disabled:opacity-50"
            style={{ background: '#ff6b9d25', color: '#ff6b9d', border: '1px solid #ff6b9d40' }}
          >
            {orchestrator.isExecuting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {orchestrator.isExecuting
              ? 'Executing...'
              : `Execute: ${orchestrator.selectedChain.name}`}
          </button>
        )}
      </NeonCard>

      <NeonCard color="#ff6b9d" className="lg:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: colors.foreground }}>
            Execution Trace
          </span>
          {orchestrator.isExecuting && (
            <RefreshCw size={14} className="animate-spin" style={{ color: '#ff6b9d' }} />
          )}
        </div>
        {orchestrator.activeTrace ? (
          <div className="space-y-2">
            {orchestrator.activeTrace.steps.map((step: StepTrace, i: number) => (
              <div key={step.stepId} className="rounded-md p-3" style={{ background: colors.card }}>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold"
                    style={{
                      background:
                        step.status === 'success'
                          ? '#00ff8820'
                          : step.status === 'failed'
                            ? '#ff444420'
                            : step.status === 'running'
                              ? '#ffaa0020'
                              : '#333',
                      color:
                        step.status === 'success'
                          ? '#00ff88'
                          : step.status === 'failed'
                            ? '#ff4444'
                            : step.status === 'running'
                              ? '#ffaa00'
                              : '#666',
                    }}
                  >
                    {step.status === 'success'
                      ? '✓'
                      : step.status === 'failed'
                        ? '✗'
                        : step.status === 'running'
                          ? '◉'
                          : `${i + 1}`}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: colors.foreground }}>
                        {step.toolName}
                      </span>
                      <span className="text-[9px] opacity-30">{step.duration}ms</span>
                    </div>
                    {step.error && (
                      <p className="mt-0.5 text-[9px]" style={{ color: '#ff4444' }}>
                        {step.error}
                      </p>
                    )}
                  </div>
                </div>
                {step.logs.length > 0 && (
                  <div
                    className="mt-2 rounded p-1.5 font-mono text-[9px]"
                    style={{ background: step.status === 'failed' ? '#ff444410' : '#00ff8810' }}
                  >
                    {step.logs.map((log: string, j: number) => (
                      <div key={j} className="opacity-60">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Cable size={32} />
            <p className="mt-2 text-xs">Select a chain and execute</p>
          </div>
        )}
        {orchestrator.recentTraces.length > 0 && !orchestrator.activeTrace && (
          <div className="mt-3">
            <h4 className="mb-2 text-[10px] font-medium opacity-40">Recent Traces</h4>
            <div className="space-y-1">
              {orchestrator.recentTraces.map((trace: ExecutionTrace) => (
                <div
                  key={trace.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-[10px] transition-all hover:bg-white/5"
                  onClick={() => orchestrator.setActiveTrace(trace.id)}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      background:
                        trace.status === 'success'
                          ? '#00ff88'
                          : trace.status === 'failed'
                            ? '#ff4444'
                            : '#666',
                    }}
                  />
                  <span style={{ color: colors.foreground }}>{trace.chainName}</span>
                  <span className="ml-auto opacity-30">{trace.totalDuration}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </NeonCard>
    </div>
  )
}
