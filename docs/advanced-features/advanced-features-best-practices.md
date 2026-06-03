# YYC³ Administration 高级功能最佳实践指南

**版本**: v1.0 | **日期**: 2026-06-04 | **适用**: 开发团队 / 架构师

---

## 一、架构设计原则

### 1.1 单元自治

每个高级功能模块应拥有完整独立的：
- **状态管理** — 专属 Zustand Store，不与其他模块共享状态
- **业务逻辑** — 专属 Service 类，封装所有领域逻辑
- **视图表现** — 专属 Panel 组件，独立渲染

**推荐**:
```typescript
// ✅ 每个模块独立 Store
const useModuleAStore = create<ModuleAState>()(...)
const useModuleBStore = create<ModuleBState>()(...)
```

**避免**:
```typescript
// ❌ 全局大 Store 包含所有模块状态
const useGlobalStore = create<GlobalState>()(...)
```

### 1.2 Provider 层级

视图组件通过 Props 接收 hooks 返回的数据和方法，而非直接调用 Store：

```typescript
// ✅ 正确方式
function MyPanel({ data, actions, colors }: Props) { ... }

// 在父级组装
const myModule = useMyModule()
return <MyPanel data={myModule.data} actions={myModule.actions} colors={colors} />
```

**避免**:
```typescript
// ❌ 面板组件内直接调用 Store
function MyPanel() {
  const data = useMyModuleStore(s => s.data) // 紧耦合
  ...
}
```

### 1.3 类型安全

- 所有接口使用明确的 TypeScript 类型定义，禁止使用 `any`
- 跨模块共享类型集中在 `advanced-types.ts`
- 使用 `as const` 确保字面量类型推断

---

## 二、代码分析引擎最佳实践

### 2.1 规则设计

- 每条规则应独立、可测试，遵循单一职责
- 规则 pattern 应精确匹配目标代码模式，避免误报
- 按严重级别分层：error（确定性问题）> warning（潜在问题）> info（建议）

```typescript
// ✅ 好的规则设计
{
  id: 'no-sql-injection',
  name: 'SQL Injection Prevention',
  category: 'security',
  severity: 'error',
  pattern: /\$\{.*?\}\s*in\s*(db\.|sql\()/i,  // 精确匹配
  message: 'Detected potential SQL injection',
  suggestion: 'Use parameterized queries instead of string interpolation',
}
```

### 2.2 性能优化

- 大量代码分析时使用 Web Worker 避免阻塞主线程
- 分析结果使用虚拟列表渲染（超过 50 条时）
- 对重复分析请求启用缓存

---

## 三、管道执行最佳实践

### 3.1 阶段编排

- 使用 `dependsOn` 明确阶段依赖关系，形成 DAG（有向无环图）
- 将独立阶段设置为并行执行以提升效率

```typescript
// ✅ 正确的依赖关系
stages: [
  { id: 'lint', name: 'Lint', type: 'lint', parallel: true },
  { id: 'test', name: 'Test', type: 'test', parallel: true },
  { id: 'build', name: 'Build', type: 'build', dependsOn: ['lint', 'test'] },
  { id: 'deploy', name: 'Deploy', type: 'deploy', dependsOn: ['build'] },
]
```

### 3.2 错误处理

- 设置合理的超时时间（默认 300 秒）
- 配置适当的重试次数（建议 2-3 次）
- 关键阶段（如 deploy）失败后应终止后续阶段执行

### 3.3 触发策略

- 开发环境使用 `manual` 触发
- 生产环境使用 `git_push` 自动触发
- 定时任务（如 nightly build）使用 `scheduled` + cron 表达式

---

## 四、性能监控最佳实践

### 4.1 指标采集

- 采集间隔建议：系统指标（5s）、API 指标（1s）、业务指标（10s）
- 使用防抖机制，避免高频采集导致 UI 卡顿
- 限制存储的数据点数量（建议最多 500 个数据点/指标）

### 4.2 异常检测

- 使用 3-sigma 方法检测统计异常（适用于正态分布数据）
- 关键指标（如 error_rate）应设置固定阈值告警
- 避免对短期抖动产生误报（建议持续异常超过 3 个采集周期再告警）

```typescript
// ✅ 合理的告警配置
{
  metric: 'error_rate',
  condition: '>',
  threshold: 0.05,
  duration: 30,     // 持续 30 秒
  cooldown: 300,    // 冷却 5 分钟
  channels: ['notification', 'sound'],
}
```

### 4.3 健康评分

- Overall 评分应综合所有指标权重计算
- 单个指标严重异常时，Overall 不应超过 60
- 建议权重：CPU 25%、Memory 25%、API Latency 30%、Error Rate 20%

---

## 五、MCP 编排最佳实践

### 5.1 工具设计

- 每个工具应具有明确的输入/输出 Schema
- 工具命名应体现其功能领域（如 `code-linter`、`security-scanner`）
- 标注工具的预估成本，帮助用户选择合适的执行策略

### 5.2 工具链编排

- 避免过长的串行链（建议不超过 5 步）
- 无依赖的步骤应配置为并行执行
- 使用 `outputMapping` 将上一步输出映射为下一步输入

```typescript
// ✅ 高效的工具链设计
steps: [
  { id: 'lint', toolId: 'linter', input: { code: '${input.code}' } },
  { id: 'scan', toolId: 'security', input: { code: '${input.code}' }, dependsOn: [] }, // 并行
  { id: 'report', toolId: 'reporter',
    input: {
      lintResults: '${output.lint}',
      securityResults: '${output.scan}'
    },
    dependsOn: ['lint', 'scan']
  }
]
```

### 5.3 错误恢复

- 非关键步骤失败时，可配置为跳过而非终止整个链
- 关键步骤失败时，应记录完整错误上下文以便调试
- 提供手动重试能力，允许用户从失败步骤恢复

---

## 六、状态管理最佳实践

### 6.1 Store 设计

- 每个 Store 使用 `persist` 中间件持久化关键数据
- 运行时状态（如 `isAnalyzing`、`isExecuting`）不做持久化
- 限制历史记录数量（建议最多保留 50 条运行记录）

### 6.2 性能优化

- 使用 Zustand 的选择器避免不必要的重渲染
- 大数据集使用 `shallow` 比较或自定义比较函数

```typescript
// ✅ 好的选择器使用
const anomalies = useMonitorStore(s => s.anomalies, shallow)
```

---

## 七、UI/UX 最佳实践

### 7.1 主题一致性

- 所有颜色使用 `ThemeColors` prop，不硬编码颜色值
- 状态颜色语义：绿色（正常/成功）、黄色（警告）、红色（错误/严重）
- 卡片使用 `NeonCard` 组件统一风格

### 7.2 响应式设计

- 使用 `lg:grid-cols-3` 实现三栏布局，移动端自动降级为单栏
- 大量数据使用虚拟滚动或分页加载
- 耗时操作显示加载状态（`isAnalyzing` / `isExecuting`）

### 7.3 可访问性

- 按钮和可交互元素应有清晰的 hover/disabled 状态
- 使用语义化颜色（不只是依赖颜色传递信息）
- 动画使用 `prefers-reduced-motion` 媒体查询

---

## 八、扩展性指南

### 8.1 新增分析规则

```typescript
// 在 code-analyzer-service.ts 的 analysisRules 数组中添加
{
  id: 'custom-rule',
  name: 'Custom Rule',
  category: 'codeSmell',
  severity: 'warning',
  pattern: /your-pattern/g,
  message: 'Description of the issue',
  suggestion: 'How to fix it',
}
```

### 8.2 新增指标

```typescript
// 1. advanced-types.ts 添加 MetricName
type MetricName = ... | 'custom_metric'

// 2. performance-monitor-service.ts 添加配置
const metricConfigs.push({
  name: 'custom_metric',
  label: 'Custom Metric',
  unit: '%',
  min: 0,
  max: 100,
  warningThreshold: 70,
  criticalThreshold: 90,
  aggregation: 'avg',
})
```

### 8.3 新增面板

```typescript
// 1. 创建 Hook useNewModule()
// 2. 创建面板组件 NewModulePanel
// 3. 在 AdvancedFeaturesPage 中添加标签页
// 4. 注册到全局导航
```

---

## 九、性能考量

| 场景 | 建议方案 |
|------|---------|
| 大量分析结果（>200条） | 虚拟列表 + 分组折叠 |
| 实时监控数据 | 防抖（300ms）+ 增量更新 |
| 管道执行日志 | 滚动容器 + 自动滚动到底部 |
| 工具链执行追踪 | 懒加载步骤详情 |
| 多次快速切换标签 | 使用 `AnimatePresence` 缓存状态 |