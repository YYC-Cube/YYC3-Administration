# YYC³ Administration 高级功能开发者文档

**版本**: v1.0 | **日期**: 2026-06-04 | **适用**: 开发人员

---

## 一、项目架构

### 1.1 目录结构

```
src/app/components/advanced/
├── advanced-types.ts              # 共享类型定义
├── advanced-stores.ts             # Zustand 状态存储
├── components/
│   └── advanced-features-page.tsx # 统一仪表盘页面（含所有面板组件）
├── hooks/
│   ├── use-code-analyzer.ts       # 代码分析 Hook
│   ├── use-pipeline.ts            # 管道管理 Hook
│   ├── use-monitor.ts             # 监控管理 Hook
│   └── use-mcp-orchestrator.ts    # MCP 编排 Hook
└── services/
    ├── code-analyzer-service.ts   # 代码分析引擎
    ├── pipeline-executor-service.ts   # 管道执行引擎
    ├── performance-monitor-service.ts # 性能监控引擎
    └── mcp-orchestrator-service.ts    # MCP 编排引擎
```

### 1.2 架构原则

每个高级功能模块遵循 **单元自治** 原则：
- **独立 Store**: 每个模块有自己的 Zustand store，状态隔离
- **独立 Service**: 每个模块有自己的 Service 层，封装业务逻辑
- **独立 Hook**: 每个模块有自己的 React Hook，连接 Store 和视图
- **共享类型**: 跨模块的共享类型集中在 `advanced-types.ts`

### 1.3 数据流

```
视图组件 (Panel)
    │
    ▼
React Hooks (useCodeAnalyzer / usePipeline / useMonitor / useMCPOrchestrator)
    │
    ├── 读取: Zustand Store (状态)
    └── 调用: Service Engine (业务逻辑)
            │
            └── 返回结果 → 更新 Store → 触发视图重渲染
```

---

## 二、核心模块详解

### 2.1 AI 代码分析引擎 (Code Analyzer)

#### Service 层

**文件**: `src/app/components/advanced/services/code-analyzer-service.ts`

**核心类**: `CodeAnalyzerEngine`

```typescript
class CodeAnalyzerEngine {
  constructor(customRules?: AnalysisRule[])
  
  // 分析代码并返回结果
  analyze(code: string, fileName: string, scope: AnalysisScope): AnalysisResult[]
  
  // 生成分析摘要
  generateSummary(
    results: AnalysisResult[],
    analyzedFiles: number,
    duration: number,
    scope: AnalysisScope
  ): AnalysisSummary
}
```

**扩展分析规则**:
```typescript
// 添加自定义规则
const customRules: AnalysisRule[] = [
  {
    id: 'custom-rule-001',
    name: '禁止使用 console.log',
    category: 'codeSmell',
    severity: 'warning',
    pattern: /console\.(log|debug|info)\(/,
    message: '避免在生产代码中使用 console 语句',
    suggestion: '使用专门的日志工具替代 console',
    fixExample: '替换为 logger.info()',
  },
]

const engine = new CodeAnalyzerEngine(customRules)
```

#### Store 层

**状态结构**:
```typescript
interface CodeAnalyzerState {
  results: AnalysisResult[]       // 分析结果列表
  summary: AnalysisSummary | null // 分析摘要
  isAnalyzing: boolean            // 是否正在分析
  selectedResult: string | null   // 选中的结果 ID
  appliedFixes: string[]          // 已应用的修复 ID 列表
  scope: AnalysisScope            // 分析范围
}
```

---

### 2.2 自动化管道 (Pipeline)

#### Service 层

**文件**: `src/app/components/advanced/services/pipeline-executor-service.ts`

**核心类**: `PipelineExecutor`

```typescript
class PipelineExecutor {
  // 执行管道
  async execute(
    pipeline: PipelineDefinition,
    triggeredBy?: TriggerType,
    triggeredVia?: string,
    commitSha?: string,
    commitMessage?: string,
    onLog?: (entry: LogEntry) => void,
    onStageChange?: (stageRun: StageRun) => void,
  ): Promise<PipelineRun>
  
  // 取消执行
  cancel(runId: string): boolean
}
```

**扩展阶段类型**:
```typescript
// 在 advanced-types.ts 中添加新类型
type StageType = 'build' | 'test' | 'lint' | 'deploy' | 'custom' | 'notify'

// 管道配置示例
const pipeline: PipelineDefinition = {
  id: 'build-deploy',
  name: 'Build & Deploy',
  stages: [
    { id: 'build', name: 'Build', type: 'build', commands: ['npm run build'] },
    { id: 'test', name: 'Test', type: 'test', commands: ['npm test'], dependsOn: ['build'] },
  ],
  triggers: [{ type: 'manual' }],
  isActive: true,
}
```

#### Store 层

```typescript
interface PipelineState {
  pipelines: PipelineDefinition[]  // 管道定义列表
  runs: PipelineRun[]              // 运行历史
  activeRunId: string | null       // 当前活动运行 ID
  isExecuting: boolean             // 是否正在执行
}
```

---

### 2.3 性能监控 (Monitor)

#### Service 层

**文件**: `src/app/components/advanced/services/performance-monitor-service.ts`

**核心类**: `PerformanceMonitorEngine`

```typescript
class PerformanceMonitorEngine {
  // 生成指标时间序列
  generateMetricSeries(
    metricName: MetricName,
    timeRange: number,
    points: number
  ): MetricSeries
  
  // 检测异常（3-sigma 方法）
  detectAnomalies(series: MetricSeries): AnomalyEvent[]
  
  // 生成健康快照
  generateHealthSnapshot(series: Partial<Record<MetricName, MetricSeries>>): HealthSnapshot
}
```

**添加自定义指标**:
```typescript
// 在 advanced-types.ts 中添加指标名称
type MetricName = 'cpu' | 'memory' | ... | 'custom_business_metric'

// 在 performance-monitor-service.ts 中添加配置
const metricConfig = {
  name: 'custom_business_metric',
  label: 'Custom Business Metric',
  unit: 'req/s',
  min: 0,
  max: 1000,
  warningThreshold: 700,
  criticalThreshold: 900,
  aggregation: 'avg',
}
```

#### Store 层

```typescript
interface MonitorState {
  series: Partial<Record<MetricName, MetricSeries>>  // 指标数据
  anomalies: AnomalyEvent[]     // 异常事件列表
  alertRules: AlertRule[]       // 告警规则
  isCollecting: boolean         // 是否正在采集
  selectedMetric: MetricName | null  // 选中的指标
}
```

---

### 2.4 MCP 编排器 (Orchestrator)

#### Service 层

**文件**: `src/app/components/advanced/services/mcp-orchestrator-service.ts`

**核心类**: `MCPOrchestratorEngine`

```typescript
class MCPOrchestratorEngine {
  // 注册工具
  registerTool(tool: MCPTool): void
  
  // 执行工具链
  async executeChain(
    chain: ToolChain,
    triggerContext: { triggeredBy: string; input?: Record<string, unknown> },
    onStepUpdate?: (step: StepTrace) => void,
    onLog?: (traceId: string, log: string) => void,
  ): Promise<ExecutionTrace>
  
  // 取消执行
  cancelChain(traceId: string): boolean
}
```

**创建工具链**:
```typescript
const chain: ToolChain = {
  id: 'code-review-chain',
  name: 'Code Review Pipeline',
  steps: [
    {
      id: 'step-1',
      toolId: 'linter',
      toolName: 'Linter',
      input: { code: '${input.code}' },
      outputMapping: { lintResults: 'results' },
    },
    {
      id: 'step-2',
      toolId: 'security-scanner',
      toolName: 'Security Scanner',
      input: { code: '${input.code}', lintResults: '${output.lintResults}' },
      dependsOn: ['step-1'],
    },
  ],
  isActive: true,
}
```

#### Store 层

```typescript
interface OrchestratorState {
  tools: MCPTool[]              // 工具注册列表
  chains: ToolChain[]           // 工具链列表
  traces: ExecutionTrace[]      // 执行追踪记录
  activeTraceId: string | null  // 当前活动追踪 ID
  isExecuting: boolean          // 是否正在执行
}
```

---

## 三、添加新功能模块

### 3.1 步骤指南

1. **定义类型**: 在 `advanced-types.ts` 中添加新模块的接口定义
2. **创建服务**: 在 `services/` 下创建 Service 类，封装业务逻辑
3. **创建存储**: 在 `advanced-stores.ts` 中添加 Zustand store
4. **创建 Hook**: 在 `hooks/` 下创建 React Hook，连接 Store 和 Service
5. **创建面板**: 在 `advanced-features-page.tsx` 中添加新的面板组件

### 3.2 模板

```typescript
// 1. types.ts
export interface MyModuleConfig { ... }
export interface MyModuleState { ... }

// 2. services/my-module-service.ts
export class MyModuleEngine {
  // 实现业务逻辑
}

// 3. stores.ts (新增 store 切片)
interface MyModuleState { ... }
interface MyModuleActions { ... }
export const useMyModuleStore = create<MyModuleState & MyModuleActions>()(
  persist(
    (set) => ({ ... }),
    { name: 'yyc3_my_module' }
  )
)

// 4. hooks/use-my-module.ts
export function useMyModule() {
  const store = useMyModuleStore()
  // 封装业务逻辑，返回给视图层
  return { ...store, myAction: () => { ... } }
}

// 5. 在 advanced-features-page.tsx 中添加新标签页
```

---

## 四、状态持久化

所有 Store 使用 `zustand/middleware` 的 `persist` 中间件，数据存储在 `localStorage` 中。

| Store | localStorage Key |
|-------|-----------------|
| Code Analyzer | `yyc3_code_analyzer` |
| Pipeline | `yyc3_pipelines` |
| Monitor | `yyc3_monitor` |
| Orchestrator | `yyc3_mcp_orchestrator` |

**注意事项**:
- 持久化数据不包含运行时状态（如 `isAnalyzing`、`isExecuting`）
- 大数组（如 `runs`、`traces`）建议设置最大长度，避免 localStorage 溢出

---

## 五、主题适配

所有 UI 组件通过 `colors: ThemeColors` prop 接收当前主题颜色，支持 Cyberpunk 和 Liquid Glass 双主题。

**颜色属性**:
```typescript
interface ThemeColors {
  primary: string       // 主色
  foreground: string    // 前景色
  mutedForeground: string // 柔和前景色
  card: string          // 卡片背景
  border: string        // 边框色
}
```

**使用示例**:
```tsx
<NeonCard color={colors.primary}>
  <h3 style={{ color: colors.foreground }}>Title</h3>
  <p style={{ color: colors.mutedForeground }}>Description</p>
</NeonCard>
```

---

## 六、测试指南

### 6.1 单元测试位置

测试文件应放在对应模块的 `__tests__` 目录下：
```
src/app/components/advanced/services/__tests__/
├── code-analyzer-service.test.ts
├── pipeline-executor-service.test.ts
├── performance-monitor-service.test.ts
└── mcp-orchestrator-service.test.ts
```

### 6.2 Service 测试示例

```typescript
import { CodeAnalyzerEngine } from '../code-analyzer-service'

describe('CodeAnalyzerEngine', () => {
  it('should detect console.log usage', () => {
    const engine = new CodeAnalyzerEngine()
    const code = 'console.log("test")'
    const results = engine.analyze(code, 'test.ts', 'file')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].ruleId).toBe('no-console')
  })
})
```

### 6.3 Hook 测试

使用 `renderHook` 测试自定义 Hooks，通过 Store 的初始状态模拟不同场景。

---

## 七、性能优化建议

1. **分析结果缓存**: 对相同代码的重复分析结果进行缓存
2. **虚拟列表**: 大量结果/日志使用虚拟滚动
3. **防抖采集**: 监控指标采集添加防抖，避免频繁更新
4. **按需加载**: 每个面板的组件使用动态导入 (`React.lazy`)
5. **持久化限制**: 设置 localStorage 数据大小上限