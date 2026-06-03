/**
 * @file advanced-types.ts
 * @description YYC³ Advanced Features — Shared type definitions for all 4 advanced modules.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,types,code-analysis,pipeline,monitor,mcp-orchestrator
 */

// ==========================================
// AF-01: AI Code Analyzer Types
// ==========================================

export type AnalysisSeverity = 'error' | 'warning' | 'info'
export type AnalysisCategory = 'security' | 'performance' | 'codeSmell' | 'typeSafety' | 'style'
export type AnalysisScope = 'file' | 'selection' | 'project' | 'gitDiff'

export interface AnalysisResult {
  id: string
  file: string
  line: number
  column: number
  severity: AnalysisSeverity
  category: AnalysisCategory
  ruleId: string
  message: string
  suggestion: string
  codeSnippet?: string
  fix?: CodeFix
  aiConfidence: number
}

export interface CodeFix {
  id: string
  patch: string
  description: string
  isSafe: boolean
  estimatedImpact: 'low' | 'medium' | 'high'
  applicable: boolean
}

export interface AnalysisSummary {
  totalIssues: number
  bySeverity: Record<AnalysisSeverity, number>
  byCategory: Record<AnalysisCategory, number>
  fixableCount: number
  safeFixCount: number
  score: number
  analyzedFiles: number
  duration: number
  timestamp: number
  scope: AnalysisScope
}

// ==========================================
// AF-02: Automation Pipeline Types
// ==========================================

export type StageType = 'build' | 'test' | 'lint' | 'deploy' | 'custom'
export type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled'
export type TriggerType = 'manual' | 'scheduled' | 'git_push' | 'webhook'
export type PipelineStatus = 'idle' | 'running' | 'success' | 'failed' | 'cancelled'

export interface PipelineDefinition {
  id: string
  name: string
  description: string
  stages: PipelineStage[]
  triggers: TriggerConfig[]
  env: Record<string, string>
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface PipelineStage {
  id: string
  name: string
  type: StageType
  commands: string[]
  env?: Record<string, string>
  dependsOn: string[]
  timeout: number
  retryCount: number
  retryDelay: number
  parallel: boolean
}

export interface TriggerConfig {
  id: string
  type: TriggerType
  enabled: boolean
  config: {
    cron?: string
    branch?: string
    webhookUrl?: string
  }
}

export interface PipelineRun {
  id: string
  pipelineId: string
  pipelineName: string
  status: PipelineStatus
  stages: StageRun[]
  startedAt: number
  finishedAt?: number
  triggeredBy: TriggerType
  triggeredVia: string
  commitSha?: string
  commitMessage?: string
  duration: number
  logs: LogEntry[]
}

export interface StageRun {
  stageId: string
  name: string
  type: StageType
  status: StageStatus
  startedAt?: number
  finishedAt?: number
  duration: number
  retryAttempt: number
  output: string
  error?: string
}

export interface LogEntry {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  stage: string
  message: string
}

// ==========================================
// AF-03: Performance Monitor Types
// ==========================================

export type MetricName =
  | 'cpu'
  | 'memory'
  | 'network'
  | 'disk'
  | 'api_latency'
  | 'api_throughput'
  | 'concurrent_users'
  | 'error_rate'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertCondition = '>' | '<' | '==' | 'change_percent'

export interface MetricPoint {
  timestamp: number
  value: number
}

export interface MetricSeries {
  metric: MetricName
  label: string
  unit: string
  points: MetricPoint[]
  aggregation: 'avg' | 'sum' | 'max' | 'min' | 'p95' | 'p99'
  current: number
  min: number
  max: number
  avg: number
}

export interface AnomalyEvent {
  id: string
  metric: MetricName
  severity: AlertSeverity
  value: number
  expected: number
  deviation: number
  deviationPercent: number
  detectedAt: number
  resolvedAt?: number
  message: string
  autoResolved: boolean
  acknowledged: boolean
}

export interface AlertRule {
  id: string
  name: string
  metric: MetricName
  condition: AlertCondition
  threshold: number
  duration: number
  enabled: boolean
  cooldown: number
  channels: ('notification' | 'sound' | 'email')[]
  createdAt: number
}

export interface HealthSnapshot {
  overall: number
  cpu: { usage: number; status: 'healthy' | 'warning' | 'critical' }
  memory: { usage: number; status: 'healthy' | 'warning' | 'critical' }
  api: { latency: number; throughput: number; status: 'healthy' | 'warning' | 'critical' }
  uptime: number
  activeAnomalies: number
  lastUpdated: number
}

// ==========================================
// AF-04: MCP Smart Orchestrator Types
// ==========================================

export interface MCPTool {
  id: string
  name: string
  description: string
  command: string
  args: string[]
  env: Record<string, string>
  enabled: boolean
  capabilities: string[]
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
  estimatedCost: 'low' | 'medium' | 'high'
  version: string
}

export interface ToolChain {
  id: string
  name: string
  description: string
  steps: ChainStep[]
  trigger: TriggerConfig
  isActive: boolean
  createdAt: number
  runCount: number
  avgDuration: number
}

export interface ChainStep {
  id: string
  toolId: string
  toolName: string
  input: Record<string, unknown>
  outputMapping: Record<string, string>
  timeout: number
  retryOnFailure: boolean
  description: string
}

export interface ExecutionTrace {
  id: string
  chainId: string
  chainName: string
  status: 'running' | 'success' | 'failed' | 'cancelled'
  steps: StepTrace[]
  startedAt: number
  finishedAt?: number
  totalDuration: number
  triggeredBy: string
  error?: string
}

export interface StepTrace {
  stepId: string
  toolId: string
  toolName: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled'
  input: Record<string, unknown>
  output: Record<string, unknown>
  duration: number
  error?: string
  logs: string[]
  startedAt?: number
}

// ==========================================
// Shared utility types
// ==========================================

export type PanelMode = 'design' | 'view' | 'history'

export interface FilterOptions {
  search: string
  status?: string
  severity?: string
  category?: string
  sortBy: 'date' | 'severity' | 'name'
  sortOrder: 'asc' | 'desc'
}
