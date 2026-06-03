/**
 * @file advanced-stores.ts
 * @description YYC³ Advanced Features — Combined Zustand stores for all 4 modules.
 *   Follows Unit Autonomy principle: each module has its own independent store.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,stores,zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  AlertRule,
  AnalysisResult,
  AnalysisScope,
  AnalysisSummary,
  AnomalyEvent,
  ChainStep,
  ExecutionTrace,
  HealthSnapshot,
  MCPTool,
  MetricName,
  MetricSeries,
  PipelineDefinition,
  PipelineRun,
  ToolChain,
} from './advanced-types'

// ==========================================
// AF-01: Code Analyzer Store
// ==========================================

interface CodeAnalyzerState {
  results: AnalysisResult[]
  summary: AnalysisSummary | null
  isAnalyzing: boolean
  selectedResult: string | null
  appliedFixes: string[]
  history: AnalysisSummary[]
  scope: AnalysisScope
}

interface CodeAnalyzerActions {
  setResults: (results: AnalysisResult[]) => void
  setSummary: (summary: AnalysisSummary) => void
  setIsAnalyzing: (v: boolean) => void
  selectResult: (id: string | null) => void
  applyFix: (fixId: string) => void
  dismissResult: (id: string) => void
  setScope: (scope: AnalysisScope) => void
  clearResults: () => void
  addHistory: (summary: AnalysisSummary) => void
}

export const useCodeAnalyzerStore = create<CodeAnalyzerState & CodeAnalyzerActions>()(
  persist(
    (set) => ({
      results: [],
      summary: null,
      isAnalyzing: false,
      selectedResult: null,
      appliedFixes: [],
      history: [],
      scope: 'file' as AnalysisScope,

      setResults: (results) => set({ results }),
      setSummary: (summary) => set({ summary }),
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),
      selectResult: (id) => set({ selectedResult: id }),
      applyFix: (fixId) =>
        set((s) => ({
          appliedFixes: [...new Set([...s.appliedFixes, fixId])],
        })),
      dismissResult: (id) =>
        set((s) => ({
          results: s.results.filter((r) => r.id !== id),
        })),
      setScope: (scope) => set({ scope }),
      clearResults: () => set({ results: [], summary: null }),
      addHistory: (summary) =>
        set((s) => ({
          history: [summary, ...s.history].slice(0, 50),
        })),
    }),
    {
      name: 'yyc3_code_analyzer',
      partialize: (state) => ({
        history: state.history,
        appliedFixes: state.appliedFixes,
        scope: state.scope,
      }),
    },
  ),
)

// ==========================================
// AF-02: Automation Pipeline Store
// ==========================================

interface PipelineState {
  pipelines: PipelineDefinition[]
  runs: PipelineRun[]
  activeRunId: string | null
  isExecuting: boolean
}

interface PipelineActions {
  addPipeline: (pipeline: PipelineDefinition) => void
  updatePipeline: (id: string, updates: Partial<PipelineDefinition>) => void
  removePipeline: (id: string) => void
  addRun: (run: PipelineRun) => void
  completeRun: (runId: string, status: PipelineRun['status']) => void
  setActiveRun: (id: string | null) => void
  setIsExecuting: (v: boolean) => void
  addLogEntry: (runId: string, entry: PipelineRun['logs'][0]) => void
  togglePipeline: (id: string) => void
  reorderStages: (pipelineId: string, stages: PipelineDefinition['stages']) => void
}

export const usePipelineStore = create<PipelineState & PipelineActions>()(
  persist(
    (set) => ({
      pipelines: [],
      runs: [],
      activeRunId: null,
      isExecuting: false,

      addPipeline: (pipeline) => set((s) => ({ pipelines: [...s.pipelines, pipeline] })),
      updatePipeline: (id, updates) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removePipeline: (id) =>
        set((s) => ({
          pipelines: s.pipelines.filter((p) => p.id !== id),
        })),
      addRun: (run) => set((s) => ({ runs: [run, ...s.runs].slice(0, 100) })),
      completeRun: (runId, status) =>
        set((s) => ({
          runs: s.runs.map((run) =>
            run.id === runId
              ? { ...run, status, finishedAt: Date.now(), duration: Date.now() - run.startedAt }
              : run,
          ),
          isExecuting: false,
          activeRunId: null,
        })),
      setActiveRun: (id) => set({ activeRunId: id }),
      setIsExecuting: (v) => set({ isExecuting: v }),
      addLogEntry: (runId, entry) =>
        set((s) => ({
          runs: s.runs.map((run) =>
            run.id === runId ? { ...run, logs: [...run.logs, entry] } : run,
          ),
        })),
      togglePipeline: (id) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
        })),
      reorderStages: (pipelineId, stages) =>
        set((s) => ({
          pipelines: s.pipelines.map((p) => (p.id === pipelineId ? { ...p, stages } : p)),
        })),
    }),
    {
      name: 'yyc3_pipelines',
      partialize: (state) => ({
        pipelines: state.pipelines,
        runs: state.runs.slice(0, 50),
      }),
    },
  ),
)

// ==========================================
// AF-03: Performance Monitor Store
// ==========================================

interface MonitorState {
  series: Partial<Record<MetricName, MetricSeries>>
  anomalies: AnomalyEvent[]
  alertRules: AlertRule[]
  health: HealthSnapshot | null
  isCollecting: boolean
  selectedMetric: MetricName | null
  timeRange: number
}

interface MonitorActions {
  updateMetric: (series: MetricSeries) => void
  appendPoint: (metric: MetricName, point: { timestamp: number; value: number }) => void
  addAnomaly: (anomaly: AnomalyEvent) => void
  resolveAnomaly: (id: string) => void
  acknowledgeAnomaly: (id: string) => void
  addAlertRule: (rule: AlertRule) => void
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void
  removeAlertRule: (id: string) => void
  setHealth: (health: HealthSnapshot) => void
  setIsCollecting: (v: boolean) => void
  setSelectedMetric: (metric: MetricName | null) => void
  setTimeRange: (range: number) => void
  clearMetric: (metric: MetricName) => void
}

export const useMonitorStore = create<MonitorState & MonitorActions>()(
  persist(
    (set) => ({
      series: {},
      anomalies: [],
      alertRules: [],
      health: null,
      isCollecting: true,
      selectedMetric: null,
      timeRange: 300_000,

      updateMetric: (series) => set((s) => ({ series: { ...s.series, [series.metric]: series } })),
      appendPoint: (metric, point) =>
        set((s) => {
          const existing = s.series[metric]
          if (!existing) return s
          const maxPoints = Math.ceil(s.timeRange / 1000) + 10
          const points = [...existing.points, point].slice(-maxPoints)
          const values = points.map((p) => p.value)
          return {
            series: {
              ...s.series,
              [metric]: {
                ...existing,
                points,
                current: point.value,
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((a, b) => a + b, 0) / values.length,
              },
            },
          }
        }),
      addAnomaly: (anomaly) =>
        set((s) => ({
          anomalies: [anomaly, ...s.anomalies].slice(0, 200),
        })),
      resolveAnomaly: (id) =>
        set((s) => ({
          anomalies: s.anomalies.map((a) =>
            a.id === id ? { ...a, resolvedAt: Date.now(), autoResolved: true } : a,
          ),
        })),
      acknowledgeAnomaly: (id) =>
        set((s) => ({
          anomalies: s.anomalies.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
        })),
      addAlertRule: (rule) => set((s) => ({ alertRules: [...s.alertRules, rule] })),
      updateAlertRule: (id, updates) =>
        set((s) => ({
          alertRules: s.alertRules.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      removeAlertRule: (id) =>
        set((s) => ({ alertRules: s.alertRules.filter((r) => r.id !== id) })),
      setHealth: (health) => set({ health }),
      setIsCollecting: (v) => set({ isCollecting: v }),
      setSelectedMetric: (metric) => set({ selectedMetric: metric }),
      setTimeRange: (range) => set({ timeRange: range }),
      clearMetric: (metric) =>
        set((s) => {
          const { [metric]: _unused, ...rest } = s.series
          return { series: rest }
        }),
    }),
    {
      name: 'yyc3_monitor',
      partialize: (state) => ({
        alertRules: state.alertRules,
        anomalies: state.anomalies.slice(0, 50),
      }),
    },
  ),
)

// ==========================================
// AF-04: MCP Orchestrator Store
// ==========================================

interface OrchestratorState {
  tools: MCPTool[]
  chains: ToolChain[]
  traces: ExecutionTrace[]
  activeTraceId: string | null
  isExecuting: boolean
  selectedChainId: string | null
}

interface OrchestratorActions {
  registerTool: (tool: MCPTool) => void
  updateTool: (id: string, updates: Partial<MCPTool>) => void
  removeTool: (id: string) => void
  toggleTool: (id: string) => void
  addChain: (chain: ToolChain) => void
  updateChain: (id: string, updates: Partial<ToolChain>) => void
  removeChain: (id: string) => void
  addTrace: (trace: ExecutionTrace) => void
  updateTraceStep: (
    traceId: string,
    stepId: string,
    updates: Partial<ExecutionTrace['steps'][0]>,
  ) => void
  completeTrace: (traceId: string, status: ExecutionTrace['status']) => void
  setActiveTrace: (id: string | null) => void
  setIsExecuting: (v: boolean) => void
  setSelectedChain: (id: string | null) => void
  reorderChainSteps: (chainId: string, steps: ChainStep[]) => void
}

export const useOrchestratorStore = create<OrchestratorState & OrchestratorActions>()(
  persist(
    (set) => ({
      tools: [],
      chains: [],
      traces: [],
      activeTraceId: null,
      isExecuting: false,
      selectedChainId: null,

      registerTool: (tool) =>
        set((s) => {
          const exists = s.tools.find((t) => t.id === tool.id)
          return {
            tools: exists ? s.tools.map((t) => (t.id === tool.id ? tool : t)) : [...s.tools, tool],
          }
        }),
      updateTool: (id, updates) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      removeTool: (id) =>
        set((s) => ({
          tools: s.tools.filter((t) => t.id !== id),
        })),
      toggleTool: (id) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)),
        })),
      addChain: (chain) => set((s) => ({ chains: [...s.chains, chain] })),
      updateChain: (id, updates) =>
        set((s) => ({
          chains: s.chains.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      removeChain: (id) =>
        set((s) => ({
          chains: s.chains.filter((c) => c.id !== id),
        })),
      addTrace: (trace) => set((s) => ({ traces: [trace, ...s.traces].slice(0, 200) })),
      updateTraceStep: (traceId, stepId, updates) =>
        set((s) => ({
          traces: s.traces.map((t) =>
            t.id === traceId
              ? {
                  ...t,
                  steps: t.steps.map((st) => (st.stepId === stepId ? { ...st, ...updates } : st)),
                }
              : t,
          ),
        })),
      completeTrace: (traceId, status) =>
        set((s) => ({
          traces: s.traces.map((t) =>
            t.id === traceId
              ? {
                  ...t,
                  status,
                  finishedAt: Date.now(),
                  totalDuration: Date.now() - t.startedAt,
                }
              : t,
          ),
          isExecuting: false,
        })),
      setActiveTrace: (id) => set({ activeTraceId: id }),
      setIsExecuting: (v) => set({ isExecuting: v }),
      setSelectedChain: (id) => set({ selectedChainId: id }),
      reorderChainSteps: (chainId, steps) =>
        set((s) => ({
          chains: s.chains.map((c) => (c.id === chainId ? { ...c, steps } : c)),
        })),
    }),
    {
      name: 'yyc3_mcp_orchestrator',
      partialize: (state) => ({
        tools: state.tools,
        chains: state.chains,
        traces: state.traces.slice(0, 20),
      }),
    },
  ),
)
