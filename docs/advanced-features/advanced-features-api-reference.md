# YYC³ Administration 高级功能 API 参考

**版本**: v1.0 | **日期**: 2026-06-04 | **适用**: 前端开发 / 集成开发

---

## 一、类型定义

**文件**: `src/app/components/advanced/advanced-types.ts`

### 1.1 通用类型

```typescript
// 分析范围
type AnalysisScope = 'file' | 'project' | 'selection'
```

### 1.2 代码分析类型

```typescript
// 严重级别
type AnalysisSeverity = 'error' | 'warning' | 'info'

// 分析分类
type AnalysisCategory = 'security' | 'performance' | 'codeSmell' | 'typeSafety' | 'style'

// 分析结果
interface AnalysisResult {
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
  aiConfidence: number                  // 0-1 置信度
}

// 代码修复
interface CodeFix {
  id: string
  patch: string                         // unified diff 格式
  description: string
  isSafe: boolean                       // 是否可安全自动应用
  estimatedImpact: 'low' | 'medium' | 'high'
  applicable: boolean
}

// 分析摘要
interface AnalysisSummary {
  totalIssues: number
  bySeverity: Record<string, number>
  byCategory: Record<string, number>
  fixableCount: number
  safeFixCount: number
  score: number                         // 0-100 质量分数
  analyzedFiles: number
  duration: number                      // 分析耗时(ms)
  timestamp: number
  scope: AnalysisScope
}

// 分析规则
interface AnalysisRule {
  id: string
  name: string
  category: AnalysisCategory
  severity: AnalysisSeverity
  pattern: RegExp
  message: string
  suggestion: string
  fixExample?: string
}
```

### 1.3 管道类型

```typescript
// 阶段类型
type StageType = 'build' | 'test' | 'lint' | 'deploy' | 'custom'

// 阶段/管道状态
type StageStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'cancelled'

// 触发类型
type TriggerType = 'manual' | 'scheduled' | 'git_push' | 'webhook'

// 管道阶段定义
interface PipelineStage {
  id: string
  name: string
  type: StageType
  commands: string[]
  env?: Record<string, string>
  dependsOn?: string[]
  timeout: number
  retryCount: number
  parallel: boolean
}

// 触发配置
interface TriggerConfig {
  type: TriggerType
  cron?: string                         // 定时表达式
  branch?: string                       // Git 分支过滤
  webhookUrl?: string
}

// 管道定义
interface PipelineDefinition {
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

// 阶段运行实例
interface StageRun {
  stageId: string
  name: string
  type: StageType
  status: StageStatus
  startedAt?: number
  finishedAt?: number
  duration: number
  retryAttempt: number
  output: string
}

// 管道运行实例
interface PipelineRun {
  id: string
  pipelineId: string
  pipelineName: string
  status: StageStatus
  stages: StageRun[]
  startedAt: number
  finishedAt?: number
  duration: number
  triggeredBy: TriggerType
  triggeredVia: string
  commitSha?: string
  commitMessage?: string
  logs: LogEntry[]
}

// 日志条目
interface LogEntry {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error'
  stage: string
  message: string
}
```

### 1.4 监控类型

```typescript
// 指标名称
type MetricName =
  | 'cpu' | 'memory' | 'network' | 'disk'
  | 'api_latency' | 'api_throughput'
  | 'concurrent_users' | 'error_rate'

// 指标数据点
interface MetricPoint {
  timestamp: number
  value: number
}

// 指标时间序列
interface MetricSeries {
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

// 异常事件
interface AnomalyEvent {
  id: string
  metric: MetricName
  severity: 'critical' | 'warning' | 'info'
  value: number
  expected: number
  deviation: number
  deviationPercent: number
  detectedAt: number
  message: string
  autoResolved: boolean
  acknowledged: boolean
  resolvedAt?: number
}

// 告警规则
interface AlertRule {
  id: string
  metric: MetricName
  condition: '>' | '<' | '==' | 'change_percent'
  threshold: number
  duration: number
  enabled: boolean
  channels: ('notification' | 'sound' | 'email')[]
  cooldown: number
}

// 健康快照
interface HealthSnapshot {
  overall: number
  cpu: { usage: number; status: 'healthy' | 'warning' | 'critical' }
  memory: { usage: number; status: 'healthy' | 'warning' | 'critical' }
  api: { latency: number; status: 'healthy' | 'warning' | 'critical' }
  timestamp: number
}
```

### 1.5 MCP 编排类型

```typescript
// MCP 工具定义
interface MCPTool {
  id: string
  name: string
  description: string
  command: string
  args: string[]
  env: Record<string, unknown>
  enabled: boolean
  capabilities: string[]
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
  estimatedCost: 'low' | 'medium' | 'high'
  version: string
}

// 链步骤
interface ChainStep {
  id: string
  toolId: string
  toolName: string
  input: Record<string, unknown>
  outputMapping?: Record<string, string>
  dependsOn?: string[]
  timeout?: number
}

// 工具链
interface ToolChain {
  id: string
  name: string
  description: string
  steps: ChainStep[]
  isActive: boolean
  createdAt: number
  updatedAt: number
}

// 步骤追踪
interface StepTrace {
  stepId: string
  toolId: string
  toolName: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  input: Record<string, unknown>
  output: Record<string, unknown>
  startedAt?: number
  finishedAt?: number
  duration: number
  error?: string
  logs: string[]
}

// 执行追踪
interface ExecutionTrace {
  id: string
  chainId: string
  chainName: string
  status: 'running' | 'success' | 'failed' | 'cancelled'
  steps: StepTrace[]
  startedAt: number
  finishedAt?: number
  totalDuration: number
  triggeredBy: string
}
```

---

## 二、Zustand Store API

**文件**: `src/app/components/advanced/advanced-stores.ts`

### 2.1 `useCodeAnalyzerStore`

```typescript
// State
results: AnalysisResult[]
summary: AnalysisSummary | null
isAnalyzing: boolean
selectedResult: string | null
appliedFixes: string[]
scope: AnalysisScope

// Actions
setResults: (results: AnalysisResult[]) => void
setSummary: (summary: AnalysisSummary | null) => void
setIsAnalyzing: (v: boolean) => void
selectResult: (id: string | null) => void
applyFix: (id: string) => void
dismissResult: (id: string) => void
setScope: (scope: AnalysisScope) => void
clearResults: () => void
addHistory: (summary: AnalysisSummary) => void
```

### 2.2 `usePipelineStore`

```typescript
// State
pipelines: PipelineDefinition[]
runs: PipelineRun[]
activeRunId: string | null
isExecuting: boolean

// Actions
addPipeline: (pipeline: PipelineDefinition) => void
updatePipeline: (id: string, data: Partial<PipelineDefinition>) => void
deletePipeline: (id: string) => void
setActiveRun: (runId: string | null) => void
addRun: (run: PipelineRun) => void
updateRun: (runId: string, data: Partial<PipelineRun>) => void
setIsExecuting: (v: boolean) => void
```

### 2.3 `useMonitorStore`

```typescript
// State
series: Partial<Record<MetricName, MetricSeries>>
anomalies: AnomalyEvent[]
alertRules: AlertRule[]
health: HealthSnapshot | null
isCollecting: boolean
selectedMetric: MetricName | null
timeRange: number

// Actions
updateMetric: (series: MetricSeries) => void
setAnomalies: (anomalies: AnomalyEvent[]) => void
acknowledgeAnomaly: (id: string) => void
setHealth: (health: HealthSnapshot) => void
setSelectedMetric: (metric: MetricName | null) => void
setAlertRules: (rules: AlertRule[]) => void
setIsCollecting: (v: boolean) => void
setTimeRange: (range: number) => void
```

### 2.4 `useOrchestratorStore`

```typescript
// State
tools: MCPTool[]
chains: ToolChain[]
traces: ExecutionTrace[]
activeTraceId: string | null
isExecuting: boolean
selectedChainId: string | null

// Actions
registerTool: (tool: MCPTool) => void
unregisterTool: (id: string) => void
addChain: (chain: ToolChain) => void
updateChain: (id: string, data: Partial<ToolChain>) => void
deleteChain: (id: string) => void
addTrace: (trace: ExecutionTrace) => void
updateTrace: (traceId: string, data: Partial<ExecutionTrace>) => void
setActiveTraceId: (id: string | null) => void
setIsExecuting: (v: boolean) => void
selectChain: (id: string | null) => void
```

---

## 三、Service Engine API

### 3.1 `CodeAnalyzerEngine`

```typescript
constructor(customRules?: AnalysisRule[])

analyze(code: string, fileName: string, scope: AnalysisScope): AnalysisResult[]

generateSummary(
  results: AnalysisResult[],
  analyzedFiles: number,
  duration: number,
  scope: AnalysisScope
): AnalysisSummary
```

### 3.2 `PipelineExecutor`

```typescript
async execute(
  pipeline: PipelineDefinition,
  triggeredBy?: TriggerType,
  triggeredVia?: string,
  commitSha?: string,
  commitMessage?: string,
  onLog?: (entry: LogEntry) => void,
  onStageChange?: (stageRun: StageRun) => void,
): Promise<PipelineRun>

cancel(runId: string): boolean
```

### 3.3 `PerformanceMonitorEngine`

```typescript
generateMetricSeries(
  metricName: MetricName,
  timeRange: number,
  points: number
): MetricSeries

detectAnomalies(series: MetricSeries): AnomalyEvent[]

generateHealthSnapshot(
  series: Partial<Record<MetricName, MetricSeries>>
): HealthSnapshot
```

### 3.4 `MCPOrchestratorEngine`

```typescript
registerTool(tool: MCPTool): void

executeChain(
  chain: ToolChain,
  triggerContext: { triggeredBy: string; input?: Record<string, unknown> },
  onStepUpdate?: (step: StepTrace) => void,
  onLog?: (traceId: string, log: string) => void,
): Promise<ExecutionTrace>

cancelChain(traceId: string): boolean
```

---

## 四、React Hook API

### 4.1 `useCodeAnalyzer()`

```typescript
// 返回值
results: AnalysisResult[]
summary: AnalysisSummary | null
isAnalyzing: boolean
selectedResult: string | null
appliedFixes: string[]
scope: AnalysisScope
qualityScore: number
qualityColor: string
qualityLabel: string

// Methods
runAnalysis: (code: string, fileName: string, scope: AnalysisScope) => void
runDemoAnalysis: () => void
handleApplyFix: (fix: CodeFix) => CodeFix
handleDismiss: (id: string) => void
selectResult: (id: string | null) => void
clearResults: () => void
getResultsBySeverity: (severity: AnalysisSeverity) => AnalysisResult[]
getResultsByCategory: (category: AnalysisCategory) => AnalysisResult[]
```

### 4.2 `usePipeline()`

```typescript
// 返回值
pipelines: PipelineDefinition[]
runs: PipelineRun[]
activeRun: PipelineRun | null
isExecuting: boolean

// Methods
createPipeline: (data: Partial<PipelineDefinition>) => void
deletePipeline: (id: string) => void
executePipeline: (pipeline: PipelineDefinition) => void
cancelRun: (runId: string) => void
```

### 4.3 `useMonitor()`

```typescript
// 返回值
metricsList: MetricListItem[]
anomalies: AnomalyEvent[]
unacknowledgedAnomalies: AnomalyEvent[]
criticalAnomalies: AnomalyEvent[]
health: HealthSnapshot | null
isCollecting: boolean
selectedMetric: MetricName | null

// Methods
setSelectedMetric: (metric: MetricName | null) => void
acknowledgeAnomaly: (id: string) => void
```

### 4.4 `useMCPOrchestrator()`

```typescript
// 返回值
tools: MCPTool[]
chains: ToolChain[]
activeTrace: ExecutionTrace | null
recentTraces: ExecutionTrace[]
isExecuting: boolean
selectedChain: ToolChain | null

// Methods
selectChain: (id: string | null) => void
executeChain: (chain: ToolChain) => void
cancelExecution: () => void
setActiveTrace: (id: string) => void
```

---

## 五、UI 组件 Props

### 5.1 高级功能仪表盘

```typescript
// AdvancedFeaturesPage (主入口)
// 无外部 props，内部使用 hooks 管理状态

// OverviewDashboard
interface OverviewDashboardProps {
  analyzer: ReturnType<typeof useCodeAnalyzer>
  pipeline: ReturnType<typeof usePipeline>
  monitor: ReturnType<typeof useMonitor>
  orchestrator: ReturnType<typeof useMCPOrchestrator>
  onNavigate: (tab: string) => void
  colors: ThemeColors
}
```

### 5.2 面板组件

```typescript
// CodeAnalyzerPanel
interface CodeAnalyzerPanelProps {
  analyzer: ReturnType<typeof useCodeAnalyzer>
  colors: ThemeColors
}

// PipelinePanel
interface PipelinePanelProps {
  pipeline: ReturnType<typeof usePipeline>
  colors: ThemeColors
}

// MonitorPanel
interface MonitorPanelProps {
  monitor: ReturnType<typeof useMonitor>
  colors: ThemeColors
}

// OrchestratorPanel
interface OrchestratorPanelProps {
  orchestrator: ReturnType<typeof useMCPOrchestrator>
  colors: ThemeColors
}
```

---

## 六、数据持久化键值

| Store | localStorage Key | 生命周期 |
|-------|-----------------|---------|
| Code Analyzer | `yyc3_code_analyzer` | 持久 |
| Pipeline | `yyc3_pipelines` | 持久 |
| Monitor | `yyc3_monitor` | 持久 |
| Orchestrator | `yyc3_mcp_orchestrator` | 持久 |