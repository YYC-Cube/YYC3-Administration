# YYC³ 言语智能 — MVP 功能拓展规划报告

> **文档版本**: v1.0.0
> **编制日期**: 2026-03-14
> **编制角色**: 产品经理 + 技术架构师
> **产品版本**: v1.8.5 → v2.0.0 目标

---

## 一、现有 MVP 能力矩阵分析

### 1.1 已完成模块清单

| # | 模块 | PageId | 完成度 | 功能深度 | 备注 |
|---|------|--------|--------|----------|------|
| 1 | 数据驾驶舱 | `dashboard` | 95% | 深 | Live KPI、7日趋势、客户分布、呼叫热力、AI矩阵、快捷导航 |
| 2 | AI 聊天 | `chat` | 85% | 深 | 多服务商LLM集成(OpenAI/Ollama/Custom)、会话管理、流式响应 |
| 3 | 客户生命周期 | `clm` | 80% | 中 | 5阶段漏斗、客户卡片、实时看板、阶段筛选 |
| 4 | AI 智能呼叫 | `aicall` | 75% | 中 | 呼叫队列、AI实时分析(情感/意图/策略)、效率环、呼叫流程管道 |
| 5 | 客户关怀中心 | `customerCare` | 90% | 深 | 客户列表、状态管理、AI评分、来源筛选、统计卡片 |
| 6 | 号码库 | `contacts` | 90% | 深 | 8大子标签页(总览/信息/分析/协同/价值/服务/知识/监控) |
| 7 | 智能表单 | `forms` | 85% | 深 | 模板选择、动态字段、AI辅助、实时校验、提交历史、模板构建器 |
| 8 | AI 工具 | `tools` | 30% | 浅 | 仅展示卡片，无实际功能入口 |
| 9 | 工作流 | `workflow` | 25% | 浅 | 5节点流程可视化，无编辑/创建能力 |
| 10 | 操作日志 | `logs` | 80% | 中 | 实时日志流、类型筛选、自动滚动、搜索 |
| 11 | 数据洞察 | `insights` | 35% | 浅 | 4个指标卡片 + 基础趋势图 |
| 12 | 设置 | `settings` | 85% | 深 | 主题配置(7项)、语言切换、引导重置、系统信息 |

### 1.2 基础设施能力

| 能力 | 状态 | 覆盖率 |
|------|------|--------|
| 双模式 (standalone + widget) | ✅ 完成 | 100% |
| 双主题 (cyberpunk + liquidGlass) | ✅ 完成 | 100% |
| i18n 中英双语 | ✅ 完成 | ~150 keys |
| AI 模型管理 (多服务商) | ✅ 完成 | OpenAI/Ollama/Custom |
| 实时数据模拟 | ✅ 完成 | 通知+活动流 |
| 数据导出 (CSV/JSON) | ✅ 完成 | 3个数据集 |
| 命令面板 (Ctrl+K) | ✅ 完成 | 导航+操作+工具 |
| 通知系统 | ✅ 完成 | 实时推送+抽屉 |
| 引导教程 | ✅ 完成 | 多步骤引导 |
| PWA 支持 | ✅ 完成 | 安装提示 |
| 全局键盘快捷键 | ✅ 完成 | Ctrl+K/N/E/./  |
| TypeScript 类型系统 | ✅ 完成 | 90+ 接口定义 |
| 响应式布局 | ✅ 完成 | 移动端侧边栏抽屉 |
| 共享联系人状态 | ✅ 完成 | ContactsContext |
| localStorage 持久化 | ✅ 完成 | 7个 storage key |

### 1.3 核心短板识别

| 短板 | 严重度 | 影响范围 | 分析 |
|------|--------|----------|------|
| **AI 工具页仅有展示** | 高 | 用户价值感知 | 6个工具卡片无实际交互，用户点击无反馈 |
| **工作流无编辑能力** | 高 | 核心差异化 | 仅5节点静态展示，无法创建/编辑/执行工作流 |
| **数据洞察过于简单** | 中 | 决策支持 | 仅4指标+1趋势，缺乏多维分析、对比、下钻 |
| **无用户认证体系** | 中 | 安全/个性化 | 所有数据本地存储，无多用户/权限概念 |
| **个人中心三项为空** | 中 | 完整度感知 | 历史记录/收藏夹/个人资料 sidebar按钮无功能 |
| **无批量操作能力** | 低 | 效率 | 客户/联系人无批量选择、批量操作 |
| **Chat 无多轮上下文** | 低 | AI体验 | 每次对话独立，无上下文记忆 |

---

## 二、功能拓展方案设计

### Phase 2A: 核心功能补全 (高优先级)

> **目标**: 填补 MVP 明显的功能空洞，让每个导航入口都有实质性内容
> **预估工期**: 3-4 周
> **新增 i18n keys**: ~120

#### 2A-1: AI 工具矩阵 — 实际功能化

**当前状态**: 6个工具卡片(代码生成/数据流/安全/知识图谱/性能/数据仓库)仅展示

**拓展方案**:

```
tools 页面重构:
├── AI 文本助手 (Text Assistant)
│   ├── 营销文案生成 (接入已有 LLM)
│   ├── 客户邮件模板
│   ├── 话术优化建议
│   └── 多语言翻译
├── 数据分析器 (Data Analyzer)
│   ├── 上传 CSV/Excel 分析
│   ├── 自动生成可视化图表
│   └── AI 洞察摘要
├── 客户画像生成器 (Profile Generator)
│   ├── 输入客户基本信息
│   ├── AI 生成360度画像
│   └── 输出风险评估+推荐策略
├── 话术模拟器 (Script Simulator)
│   ├── 选择场景(获客/转化/挽回...)
│   ├── AI 角色扮演对话
│   └── 评分+改进建议
├── 竞品分析器 (Competitor Analyzer)
│   ├── 输入竞品信息
│   ├── SWOT 自动分析
│   └── 差异化策略建议
└── 报告生成器 (Report Generator)
    ├── 选择数据范围+模板
    ├── AI 自动生成运营报告
    └── 导出 PDF/Markdown
```

**技术实现**:
- 复用 `AIModelContext` 的 LLM 调用能力
- 新建 `ai-tools-page.tsx` 替代现有工具卡片
- 每个工具为独立子组件，通过 tabs/cards 切换
- 工具输入/输出统一使用 `NeonCard` 容器
- 新增 i18n keys: `tools.textAssist.*`, `tools.analyzer.*` 等 (~30 keys)

**用户场景**:
```
场景1: 销售经理需要给客户写跟进邮件
→ 打开 AI 工具 → 文本助手 → 选择"跟进邮件"模板
→ 输入客户名称+上次沟通要点 → AI 生成邮件
→ 一键复制 / 微调后发送

场景2: 运营总监准备周报
→ 打开 AI 工具 → 报告生成器 → 选择"周运营报告"
→ 自动拉取本周KPI数据 → AI 生成分析报告
→ 导出 Markdown 或 PDF
```

#### 2A-2: 工作流引擎 — 可视化编辑器

**当前状态**: 5个静态节点(输入分析→意图识别→任务执行→结果优化→学习反馈)

**拓展方案**:

```
workflow 页面重构:
├── 工作流列表视图
│   ├── 预置工作流模板 (5-8个)
│   ├── 自定义工作流列表
│   ├── 状态标签 (active/draft/archived)
│   └── 搜索 + 筛选
├── 可视化编辑器 (Flow Editor)
│   ├── 节点拖拽 (react-dnd)
│   ├── 连线绘制 (SVG path)
│   ├── 节点类型:
│   │   ├── 触发器 (定时/事件/手动)
│   │   ├── 条件判断 (IF/ELSE)
│   │   ├── AI 动作 (LLM调用/分析)
│   │   ├── 通知动作 (邮件/短信/系统通知)
│   │   ├── 数据操作 (读/写/更新联系人)
│   │   └── 延时等待
│   ├── 节点配置面板 (右侧抽屉)
│   └── 实时预览 + 模拟执行
├── 执行历史
│   ├── 执行记录列表
│   ├── 每次执行的节点路径高亮
│   └── 耗时 + 结果统计
└── 模板市场
    ├── 新客户欢迎流程
    ├── 客户流失预警流程
    ├── 批量呼叫后自动跟进
    ├── 定期健康度检查
    └── VIP 客户专属服务流程
```

**技术实现**:
- 使用已安装的 `react-dnd` + `react-dnd-html5-backend`
- 新建 `workflow-editor.tsx` (可视化编辑器核心)
- 新建 `workflow-node-types.ts` (节点类型定义)
- 工作流数据模型存储于 localStorage (`yyc3_workflows`)
- SVG 连线使用 cubic bezier 路径
- 新增 i18n keys: `workflow.editor.*`, `workflow.node.*` (~35 keys)

**数据模型**:
```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'ai_action' | 'notification' | 'data_op' | 'delay';
  position: { x: number; y: number };
  config: Record<string, unknown>;
  label: string;
  color: string;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}
```

#### 2A-3: 数据洞察增强 — 多维分析中心

**当前状态**: 4个指标卡片(响应时间/成功率/满意度/负载) + 1个趋势图

**拓展方案**:

```
insights 页面重构:
├── KPI 仪表盘 (增强版)
│   ├── 8-12 个核心指标卡片 (可配置显隐)
│   ├── 实时 vs 历史对比
│   ├── 指标趋势 sparkline
│   └── 异常指标高亮预警
├── 多维分析视图
│   ├── 客户转化漏斗分析 (Funnel Chart)
│   ├── 呼叫效率热力图 (时段×星期 Heatmap)
│   ├── AI 任务成功率雷达图
│   ├── 客户价值分布散点图
│   └── 来源渠道 ROI 对比
├── 时间维度切换
│   ├── 今日 / 本周 / 本月 / 自定义
│   ├── 同比 / 环比分析
│   └── 趋势预测线 (AI)
├── 自定义报表
│   ├── 拖拽式图表布局
│   ├── 指标自由组合
│   └── 保存为模板
└── AI 智能摘要
    ├── 自动生成运营洞察
    ├── 异常检测与归因
    └── 建议行动项
```

**技术实现**:
- 充分利用已安装的 `recharts` (AreaChart/PieChart/BarChart/RadarChart/RadialBar 等)
- 新建 `insights-page.tsx` 替代现有简单展示
- 数据源复用 `app-context.tsx` 中的 mock 数据 + 扩展
- 新增 i18n keys: `insights.funnel.*`, `insights.heatmap.*` (~25 keys)

#### 2A-4: 个人中心三联 — 历史/收藏/资料

**当前状态**: sidebar `sidebarPersonal` 3个按钮无实际功能

**拓展方案**:

```
个人中心:
├── 历史记录 (History)
│   ├── 浏览历史 (页面访问记录)
│   ├── 操作历史 (关键操作时间线)
│   ├── 搜索历史
│   └── 清空 / 按时间筛选
├── 收藏夹 (Favorites)
│   ├── 收藏的客户联系人
│   ├── 收藏的工作流模板
│   ├── 收藏的表单模板
│   └── 分组管理 + 快速访问
└── 个人资料 (Profile)
    ├── 头像 + 用户名 + 邮箱
    ├── 角色信息 (管理员/销售/运营)
    ├── 偏好设置 (默认页面/语言/时区)
    ├── 快捷键自定义
    └── 数据统计 (使用天数/操作次数/客户数)
```

**技术实现**:
- 新增 PageId: `history` | `favorites` | `profile` 到 `app-context.tsx`
- 或使用 Modal/Drawer 模式避免修改路由
- 推荐: **Drawer 右侧滑出面板** (与 NotificationDrawer 同模式)
- 历史记录使用 localStorage 追踪，限制最近 100 条
- 收藏夹复用 `SharedContact.starred` + 扩展
- 新增 i18n keys: ~20 keys

---

### Phase 2B: 用户体验增强 (中优先级)

> **目标**: 提升交互品质和效率，增强专业感
> **预估工期**: 2-3 周
> **新增 i18n keys**: ~60

#### 2B-1: 批量操作系统

**范围**: 客户关怀中心 + 号码库 + CLM

```
批量操作:
├── 全选 / 反选 / 按条件选
├── 批量修改状态/阶段
├── 批量添加标签
├── 批量导出选中项
├── 批量删除 (二次确认)
└── 操作进度反馈 (toast)
```

**技术实现**:
- 新增 `useBatchSelection` hook
- 使用 `Set<string>` 存储选中 ID
- 操作确认使用已有的 Radix AlertDialog
- 状态反馈使用已安装的 `sonner` toast

#### 2B-2: AI Chat 增强

```
Chat 增强:
├── 多轮上下文记忆
│   ├── 自动携带最近 N 轮对话
│   ├── 可配置上下文窗口大小
│   └── 上下文 token 计数显示
├── 会话管理
│   ├── 新建 / 重命名 / 删除会话
│   ├── 会话列表侧边栏
│   ├── 会话搜索
│   └── 导出会话记录
├── 富文本渲染
│   ├── Markdown 渲染 (代码高亮)
│   ├── 表格渲染
│   └── 图片/图表嵌入
├── Prompt 模板库
│   ├── 预置营销场景 prompt
│   ├── 自定义 prompt 保存
│   └── 一键填入
└── 语音输入 (可选)
    ├── Web Speech API
    ├── 实时转文字
    └── 自动发送
```

**技术实现**:
- 修改 `chat-interface.tsx`，增加 `messages` 历史传递给 LLM
- 新建 `chat-sessions-context.tsx` 管理多会话
- Markdown 渲染考虑轻量方案 (自行实现基础 MD parser，避免引入重依赖)
- 新增 i18n keys: `chat.context.*`, `chat.session.*` (~20 keys)

#### 2B-3: 高级搜索与全局筛选

```
搜索增强:
├── 命令面板增强
│   ├── 模糊搜索客户 (名称/公司/手机)
│   ├── 搜索表单模板
│   ├── 搜索工作流
│   └── 最近搜索记忆
├── 全局筛选器
│   ├── 日期范围选择
│   ├── 状态/阶段多选
│   ├── 标签筛选
│   └── AI评分范围
└── 搜索结果预览
    ├── 悬停卡片预览
    └── 快捷操作入口
```

**技术实现**:
- 扩展 `command-palette.tsx` 的搜索逻辑
- 从 `ContactsContext` 读取联系人数据做模糊匹配
- 使用已有的 `cmdk` 组件
- 新增 i18n keys: ~10 keys

#### 2B-4: 拖拽排序与布局自定义

```
自定义布局:
├── Dashboard 卡片拖拽排序 (react-dnd)
├── 导航栏顺序自定义
├── 侧边栏模块显隐
└── 布局保存到 localStorage
```

**技术实现**:
- 使用已安装的 `react-dnd`
- Dashboard 卡片包裹 DraggableCard HOC
- 排序状态存储: `yyc3_layout_config`

---

### Phase 2C: 智能化深化 (中优先级)

> **目标**: 利用已有 AI 能力扩展智能场景
> **预估工期**: 2-3 周
> **新增 i18n keys**: ~40

#### 2C-1: AI 智能助手面板 (Copilot)

```
AI Copilot 浮窗:
├── 页面感知
│   ├── 检测当前页面上下文
│   ├── 主动推送相关建议
│   └── "你可能需要..." 提示
├── 快捷操作
│   ├── "帮我分析这个客户"
│   ├── "生成跟进话术"
│   ├── "预测转化概率"
│   └── "总结今日运营"
├── 智能提醒
│   ├── 客户跟进到期提醒
│   ├── KPI 异常即时通知
│   └── 工作流执行结果
└── 位置: 右下角浮动按钮
```

**技术实现**:
- 新建 `ai-copilot.tsx` 浮窗组件
- 使用 `useApp().activePage` 感知当前页面
- 调用 `AIModelContext` 进行 LLM 推理
- motion 动画实现展开/收起

#### 2C-2: 客户智能评分系统增强

```
AI 评分增强:
├── 多维度评分模型
│   ├── 互动频率评分
│   ├── 价值潜力评分
│   ├── 流失风险评分
│   ├── 转化可能性评分
│   └── 综合 AI Score
├── 评分趋势可视化
│   ├── 历史评分折线图
│   ├── 评分变动原因标注
│   └── 预测走势
└── 基于评分的自动化
    ├── 评分阈值告警
    ├── 自动分配优先级
    └── 自动触发关怀工作流
```

#### 2C-3: 智能日报/周报自动生成

```
自动报告:
├── 数据自动采集
│   ├── 今日/本周 KPI 汇总
│   ├── 客户变动摘要
│   ├── 呼叫效果统计
│   └── AI 任务完成情况
├── AI 生成分析
│   ├── 关键数据解读
│   ├── 同比/环比分析
│   ├── 异常数据标注
│   └── 改进建议
└── 导出与分享
    ├── 导出为 Markdown
    ├── 导出为 PDF (打印友好)
    └── 复制到剪贴板
```

---

### Phase 2D: 集成与扩展 (低优先级)

> **目标**: 为未来的后端集成和多平台支持打下基础
> **预估工期**: 3-4 周 (可与 2A/2B 并行)

#### 2D-1: Supabase 后端集成 (可选)

```
后端集成:
├── 用户认证
│   ├── 邮箱+密码注册/登录
│   ├── OAuth (Google/GitHub)
│   ├── 会话管理
│   └── 角色权限 (admin/manager/agent)
├── 数据持久化
│   ├── 联系人数据云同步
│   ├── 工作流定义云存储
│   ├── 表单提交数据
│   ├── 聊天会话历史
│   └── 用户偏好设置
├── 实时协作
│   ├── Supabase Realtime 替代模拟数据
│   ├── 多用户在线状态
│   └── 数据变更实时推送
└── API 层
    ├── RESTful API 封装
    ├── Row Level Security
    └── Edge Functions (AI 调用代理)
```

**迁移策略**:
- 所有 localStorage 操作已封装为 `load/save` 函数，迁移成本低
- `ContactsContext` 可直接切换数据源为 Supabase table
- `AIModelContext` 的 API key 可迁移至 Supabase Secrets

#### 2D-2: 插件系统架构 (远期)

```
插件系统:
├── 插件注册接口
│   ├── registerTool(config)
│   ├── registerPage(config)
│   └── registerWidget(config)
├── 插件生命周期
│   ├── onInstall → onActivate → onDeactivate → onUninstall
│   └── 沙箱隔离
├── 内置插件
│   ├── 微信集成
│   ├── 企业微信集成
│   ├── 钉钉集成
│   └── 飞书集成
└── 开发者工具
    ├── 插件脚手架
    ├── 调试面板
    └── API 文档
```

#### 2D-3: 多语言扩展

```
i18n 扩展:
├── 新增语言: 日语 (ja)
├── 新增语言: 韩语 (ko)
├── 动态加载语言包 (lazy import)
└── 社区贡献翻译机制
```

---

## 三、优先级矩阵与实施路线图

### 3.1 优先级评估 (ICE 评分法)

| 功能 | Impact (1-10) | Confidence (1-10) | Ease (1-10) | ICE Score | 优先级 |
|------|---------|------------|------|-----------|--------|
| AI 工具矩阵实际化 | 9 | 8 | 7 | 504 | P0 |
| 个人中心三联补全 | 7 | 9 | 8 | 504 | P0 |
| 数据洞察增强 | 8 | 8 | 7 | 448 | P0 |
| 工作流编辑器 | 9 | 7 | 5 | 315 | P1 |
| 批量操作系统 | 7 | 9 | 7 | 441 | P1 |
| AI Chat 增强 | 8 | 8 | 6 | 384 | P1 |
| AI Copilot | 8 | 7 | 6 | 336 | P1 |
| 高级搜索增强 | 6 | 8 | 8 | 384 | P2 |
| 拖拽排序布局 | 5 | 8 | 7 | 280 | P2 |
| 智能评分增强 | 7 | 7 | 5 | 245 | P2 |
| 智能日报/周报 | 7 | 7 | 6 | 294 | P2 |
| Supabase 集成 | 8 | 6 | 4 | 192 | P3 |
| 插件系统 | 6 | 5 | 3 | 90 | P4 |
| 多语言扩展 | 4 | 8 | 7 | 224 | P4 |

### 3.2 实施路线图

```
v2.0 — "功能补全"  (Week 1-4)
┣━━ [P0] AI 工具矩阵实际化
┣━━ [P0] 个人中心三联 (Drawer 模式)
┣━━ [P0] 数据洞察增强 (Recharts 全组件利用)
┗━━ [P1] 批量操作系统

v2.1 — "智能深化"  (Week 5-8)
┣━━ [P1] 工作流可视化编辑器
┣━━ [P1] AI Chat 多轮上下文 + 会话管理
┣━━ [P1] AI Copilot 浮窗
┗━━ [P2] 高级搜索增强

v2.2 — "体验打磨"  (Week 9-12)
┣━━ [P2] 拖拽排序布局
┣━━ [P2] 智能评分增强
┣━━ [P2] 智能日报/周报
┗━━ 全量 i18n 补充 (~240 new keys)

v3.0 — "平台化"  (Week 13+)
┣━━ [P3] Supabase 后端集成
┣━━ [P4] 插件系统架构
┗━━ [P4] 多语言扩展
```

---

## 四、技术实现路径

### 4.1 文件结构规划 (v2.0)

```
src/app/components/
├── ai-tools-page.tsx          ← NEW: AI 工具矩阵主页
├── ai-tools/                  ← NEW: 工具子组件目录
│   ├── text-assistant.tsx
│   ├── data-analyzer.tsx
│   ├── profile-generator.tsx
│   ├── script-simulator.tsx
│   ├── competitor-analyzer.tsx
│   └── report-generator.tsx
├── insights-page.tsx          ← NEW: 替代现有简单展示
├── personal-drawer.tsx        ← NEW: 个人中心抽屉
├── batch-operations.tsx       ← NEW: 批量操作 UI
├── hooks/
│   ├── use-theme-tokens.ts    (已有)
│   ├── use-batch-selection.ts ← NEW
│   ├── use-history-tracker.ts ← NEW
│   └── use-favorites.ts      ← NEW
├── workflow-editor.tsx        ← NEW (v2.1)
├── workflow-node-types.ts     ← NEW (v2.1)
├── ai-copilot.tsx            ← NEW (v2.1)
└── chat-sessions-context.tsx  ← NEW (v2.1)
```

### 4.2 Context 扩展规划

```typescript
// app-context.tsx 扩展
export type PageId =
  | "dashboard" | "chat" | "clm" | "aicall"
  | "tools" | "workflow" | "insights" | "settings"
  | "logs" | "forms" | "contacts" | "customerCare";
  // 注意: history/favorites/profile 使用 Drawer 模式，不新增 PageId

// 新增 Context
// chat-sessions-context.tsx — 管理多个聊天会话
// workflow-context.tsx — 工作流定义和执行状���
```

### 4.3 数据模型扩展

```typescript
// 新增 localStorage Keys
const STORAGE_KEYS = {
  // 已有
  app_state: "yyc3_app_state",
  theme: "yyc3_theme",
  onboarding: "yyc3_onboarding_done",
  contacts: "yyc3_contacts",
  contacts_deleted: "yyc3_contacts_deleted",
  ai_models: "yyc3_ai_models",
  active_model: "yyc3_active_model_id",
  form_submissions: "yyc3_form_submissions",
  custom_templates: "yyc3_custom_templates",
  locale: "yyc3_locale",
  ui_theme: "yyc3_ui_theme",
  app_version: "yyc_app_version",

  // v2.0 新增
  chat_sessions: "yyc3_chat_sessions",     // 聊天会话列表
  workflows: "yyc3_workflows",             // 工作流定义
  browse_history: "yyc3_browse_history",   // 浏览历史
  favorites: "yyc3_favorites",             // 收藏夹
  layout_config: "yyc3_layout_config",     // 布局配置
  search_history: "yyc3_search_history",   // 搜索历史
  report_templates: "yyc3_report_templates", // 报告模板
};
```

### 4.4 i18n Key 规划

```
Phase 2A 新增 (~120 keys):
  tools.textAssist.*       (15 keys)
  tools.analyzer.*         (15 keys)
  tools.profileGen.*       (10 keys)
  tools.scriptSim.*        (10 keys)
  tools.competitor.*       (10 keys)
  tools.reportGen.*        (10 keys)
  insights.funnel.*        (10 keys)
  insights.heatmap.*       (10 keys)
  insights.report.*        (10 keys)
  personal.history.*       (8 keys)
  personal.favorites.*     (7 keys)
  personal.profile.*       (5 keys)

Phase 2B 新增 (~60 keys):
  batch.*                  (15 keys)
  chat.context.*           (10 keys)
  chat.session.*           (10 keys)
  chat.prompt.*            (10 keys)
  search.*                 (10 keys)
  layout.*                 (5 keys)

Phase 2C 新增 (~40 keys):
  copilot.*                (15 keys)
  scoring.*                (10 keys)
  report.auto.*            (15 keys)
```

---

## 五、风险评估与应对

| 风险 | 概率 | 影响 | 应对措施 |
|------|------|------|----------|
| 工作流编辑器复杂度超预期 | 中 | 高 | 第一版仅支持线性流程，分支逻辑留 v2.2 |
| AI 工具依赖 LLM 服务可用性 | 中 | 中 | 所有工具提供"离线模式" mock 响应 |
| localStorage 容量限制 (5-10MB) | 低 | 高 | 实现 LRU 淘汰策略，老数据自动清理 |
| i18n key 膨胀导致加载变慢 | 低 | 低 | 保持 lazy import，按页面分包 |
| 双主题适配工作量翻倍 | 中 | 中 | 新组件统一使用 CSS 变量，主题切换自动生效 |
| 移动端适配遗漏 | 中 | 中 | 每个新组件必须包含 < 768px 响应式断点 |

---

## 六、质量保障计划

### 6.1 编码标准 (延续审计标准)

- ✅ 零 TypeScript 编译错误
- ✅ 无 `any` 类型 (仅允许��范围 `as` 断言)
- ✅ JSDoc 覆盖率 > 90% (所有 export 函数/接口)
- ✅ 无硬编码中文 (全部通过 `t()` 函数)
- ✅ 颜色使用迁移后的青色调色板
- ✅ 组件使用 `memo` 优化 (纯展示组件)
- ✅ 所有交互元素包含 `aria-label`

### 6.2 测试策略

- 每个新增组件包含 mock 数据完整演示
- 双主题手动验证 (cyberpunk + liquidGlass)
- 双语言验证 (zh + en)
- 移动端断点验证 (375px / 768px / 1024px)
- 键盘导航验证 (Tab / Enter / Escape)
- 无障碍验证 (ARIA 标签 + 对比度)

### 6.3 验收 Checklist

```
每个功能模块上线前:
□ TypeScript 编译零错误
□ 所有 export 有 JSDoc
□ i18n zh + en keys 完整
□ 双主题视觉一致
□ 移动端布局正常
□ 键盘可访问
□ localStorage 读写正常
□ 错误边界覆盖
□ 性能无明显退化
```

---

## 七、资源需求总结

| 阶段 | 工期 | 新增文件 | 新增 i18n Keys | 新增 TS 接口 | 关键依赖 |
|------|------|----------|---------------|-------------|----------|
| v2.0 (P0) | 3-4 周 | ~10 | ~120 | ~15 | recharts, react-dnd |
| v2.1 (P1) | 3-4 周 | ~6 | ~60 | ~12 | react-dnd, motion |
| v2.2 (P2) | 2-3 周 | ~4 | ~40 | ~8 | recharts |
| v3.0 (P3+) | 4+ 周 | ~8 | ~30 | ~20 | Supabase SDK |
| **总计** | **12-15 周** | **~28** | **~250** | **~55** | — |

---

> **结论**: MVP 已具备坚实的基础架构和核心模块。Phase 2A 聚焦于**填补功能空洞** (AI工具/工作流/洞察/个人中心)，可在 4 周内显著提升产品完整度和用户价值感知。Phase 2B/2C 则在此基础上**深化智能化体验**，形成差异化竞争力。建议**立即启动 Phase 2A**，同时将 Phase 2B-1 (批量操作) 提前并行实施，因其影响面广且实现成本低。

---

*YYC³ 言语智能 — Words Initiate Quadrants, Language Serves as Core for Future*
