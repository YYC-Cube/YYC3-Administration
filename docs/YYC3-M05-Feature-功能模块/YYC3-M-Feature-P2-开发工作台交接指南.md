# YYC³ P2 开发工作台 — 本地衔接开发完整 README

<div align="center">

> **YanYuCloudCube**
> **言启象限 | 语枢未来**
> **Words Initiate Quadrants, Language Serves as Core for Future**
> **万象归元于云枢 | 深栈智启新纪元**

</div>

---

**文档版本**: v3.0.0
**最后更新**: 2026-03-18
**维护团队**: YanYuCloudCube Team <admin@0379.email>
**阶段**: P2.1 — Multi-Instance UI + Panel Modularization

---

## 目录

1. [本阶段交付清单](#1-本阶段交付清单)
2. [架构变更概要](#2-架构变更概要)
3. [模块化面板架构](#3-模块化面板架构)
4. [多开系统 UI 组件](#4-多开系统-ui-组件)
5. [文件变更清单](#5-文件变更清单)
6. [本地快速启动](#6-本地快速启动)
7. [测试验证指南](#7-测试验证指南)
8. [AI 服务架构](#8-ai-服务架构)
9. [下阶段开发建议](#9-下阶段开发建议)

---

## 1. 本阶段交付清单

| # | 交付物 | 状态 | 说明 |
|---|--------|------|------|
| 1 | 6 面板完全提取为独立 .tsx 文件 | ✅ | panels/ 目录下 6 个独立组件 |
| 2 | 面板共享模块 (types/store/helpers) | ✅ | panel-types.ts, panel-store.ts, panel-helpers.ts |
| 3 | left-panel-page.tsx v3.0 重构 | ✅ | 从 1670 行降至 ~180 行，纯编排层 |
| 4 | Multi-Instance WindowBar | ✅ | 窗口标签管理 + 创建/关闭/最小化 |
| 5 | Multi-Instance WorkspaceSelector | ✅ | 工作区选择器 + 创建/复制/删除 |
| 6 | 面板组件测试 (40+ 用例) | ✅ | helpers/store/mock-data 全覆盖 |
| 7 | 完整衔接文档 | ✅ | 本文档 |

---

## 2. 架构变更概要

### Before (v2.0)

```
left-panel-page.tsx (1670 行)
├── Types (40 行)
├── Zustand Store (80 行)
├── Mock Data (100 行)
├── Helpers (50 行)
├── FileExplorerPanel (220 行)
├── TaskManagerPanel (110 行)
├── AIAssistantPanel (250 行)
├── GlobalSearchPanel (120 行)
├── QuickAccessPanel (70 行)
├── GitIntegrationPanel (180 行)
└── LeftPanelPage (180 行)
```

### After (v3.0)

```
left-panel-page.tsx (~180 行) — 纯编排层
panels/
├── index.ts                    — Barrel exports
├── panel-types.ts              — 共享类型定义
├── panel-store.ts              — Zustand 持久化 Store
├── panel-helpers.ts            — 工具函数 + Mock 数据 + AI Provider 配置
├── file-explorer-panel.tsx     — 文件树 CRUD + 右键菜单
├── task-manager-panel.tsx      — 任务看板集成 + 状态筛选
├── ai-assistant-panel.tsx      — 多 Provider AI 对话 + 配置
├── global-search-panel.tsx     — 文件/内容/符号/命令搜索
├── quick-access-panel.tsx      — 最近文件 + 收藏夹
├── git-integration-panel.tsx   — Git 状态/日志/API 配置
├── window-bar.tsx              — 🆕 Multi-Instance 窗口标签栏
└── workspace-selector.tsx      — 🆕 Multi-Instance 工作区选择器
```

### 关键改进

| 维度 | Before | After |
|------|--------|-------|
| 文件大小 | 1 个 1670 行文件 | 12 个模块化文件 |
| 可测试性 | 困难 (紧耦合) | 每个面板可独立测试 |
| 代码复用 | Store/Types 内嵌 | 共享模块可跨组件导入 |
| 多开支持 | 无 | WindowBar + WorkspaceSelector |

---

## 3. 模块化面板架构

### 3.1 Panel Types (`panel-types.ts`)

所有面板共享的 TypeScript 类型定义：

```typescript
import type {
  PanelType,           // "file-explorer" | "task-manager" | ...
  AIProviderType,      // "mock" | "openai" | "claude" | "deepseek"
  AIProviderConfig,    // 完整 AI 配置
  FileNode,            // 文件树节点
  SearchResult,        // 搜索结果
  AIChatMessage,       // AI 聊天消息
  QuickAccessItem,     // 快捷访问项
  GitStatus,           // Git 状态
} from "./panels";
```

### 3.2 Panel Store (`panel-store.ts`)

Zustand 持久化 Store，localStorage key: `yyc3-left-panel-storage`

```typescript
import { usePanelStore } from "./panels";

// 在任何组件中使用
const { activePanel, selectedFile, aiProviderConfig } = usePanelStore();
```

**持久化字段**: activePanel, panelWidth, expandedFolders, recentFiles, favoriteFiles, aiMessages, searchHistory, aiProviderConfig

### 3.3 Panel Helpers (`panel-helpers.ts`)

共享工具函数和常量：

| 函数/常量 | 说明 |
|-----------|------|
| `getFileIcon(name)` | 根据文件扩展名返回图标和颜色 |
| `getGitStatusStyle(status)` | Git 状态样式 (M/A/D/R) |
| `formatFileSize(bytes)` | 文件大小格式化 |
| `timeAgo(timestamp)` | 相对时间格式化 |
| `AI_PROVIDER_MODELS` | OpenAI/Claude/DeepSeek/Mock 配置 |
| `MOCK_FILE_TREE` | 模拟文件树 |
| `MOCK_GIT_STATUS` | 模拟 Git 状态 |
| `MOCK_SEARCH_RESULTS` | 模拟搜索结果 |
| `AI_RESPONSES` | AI 模拟回复 |
| `AI_SUGGESTIONS_POOL` | AI 建议池 |

### 3.4 面板组件 Props

所有面板组件接收 `tc: ThemeColors` 作为主题令牌：

```typescript
import type { ThemeColors } from "../hooks/use-theme-colors";

// 所有面板都遵循这个 prop 签名
export function FileExplorerPanel({ tc }: { tc: ThemeColors }) { ... }
export function TaskManagerPanel({ tc }: { tc: ThemeColors }) { ... }
export function GlobalSearchPanel({ tc }: { tc: ThemeColors }) { ... }
export function QuickAccessPanel({ tc }: { tc: ThemeColors }) { ... }
export function GitIntegrationPanel({ tc }: { tc: ThemeColors }) { ... }

// AI 面板有额外的 props
export function AIAssistantPanel({
  tc,
  selectedFile,          // 当前选中的文件路径
  editorContentGetter,   // Ref 到 Monaco Editor 内容 getter
}: AIAssistantPanelProps) { ... }
```

---

## 4. 多开系统 UI 组件

### 4.1 WindowBar

显示在开发工作台顶部，管理虚拟窗口标签：

**功能**:
- 显示所有打开的窗口实例（带类型图标和颜色）
- 点击切换活跃窗口
- Hover 显示最小化/关闭按钮
- `+` 按钮弹出窗口类型菜单 (Main/Editor/Preview/Terminal/AI Chat/Settings)
- 右侧显示窗口计数

**数据源**: `useWindowStore` (Zustand，localStorage: `yyc3-window-storage`)

### 4.2 WorkspaceSelector

显示在开发工作台顶栏右侧，管理工作区切换：

**功能**:
- 下拉显示所有工作区（带类型图标）
- 点击切换活跃工作区
- Hover 显示复制/删除按钮
- "New Workspace" 弹出创建对话框
- 创建时可选类型: Project / AI Session / Debug / Custom

**数据源**: `useWorkspaceStore` (Zustand，localStorage: `yyc3-workspace-storage`)

### 4.3 集成方式

WindowBar 和 WorkspaceSelector 已自动集成到 `left-panel-page.tsx` v3.0：

```tsx
// left-panel-page.tsx 中的集成
<WindowBar tc={tc} />                    // 顶部窗口标签栏
<WorkspaceSelector tc={tc} />            // 顶栏右侧工作区选择器
```

---

## 5. 文件变更清单

### 新建文件 (12 个)

| 文件 | 行数 | 说明 |
|------|------|------|
| `panels/panel-types.ts` | ~85 | 共享类型定义 |
| `panels/panel-store.ts` | ~115 | Zustand Store |
| `panels/panel-helpers.ts` | ~195 | 工具函数 + Mock 数据 |
| `panels/file-explorer-panel.tsx` | ~195 | 文件浏览器面板 |
| `panels/task-manager-panel.tsx` | ~115 | 任务管理面板 |
| `panels/ai-assistant-panel.tsx` | ~205 | AI 助手面板 |
| `panels/global-search-panel.tsx` | ~125 | 全局搜索面板 |
| `panels/quick-access-panel.tsx` | ~85 | 快捷访问面板 |
| `panels/git-integration-panel.tsx` | ~175 | Git 集成面板 |
| `panels/window-bar.tsx` | ~135 | 窗口标签栏 |
| `panels/workspace-selector.tsx` | ~170 | 工作区选择器 |
| `panels/index.ts` | ~30 | Barrel exports |

### 修改文件

| 文件 | 变更 |
|------|------|
| `left-panel-page.tsx` | 完全重写，从 1670 行降至 ~180 行 |
| `panels/index.ts` | 更新 barrel exports |

### 新建测试文件

| 文件 | 用例数 |
|------|--------|
| `tests/components/panels/panel-components.test.ts` | 40 |

---

## 6. 本地快速启动

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
# → http://localhost:5173

# 4. 验证开发工作台
# 导航到 "开发工作台" 页面
# 检查：
#   ✅ 顶部 WindowBar 显示
#   ✅ WorkspaceSelector 下拉可用
#   ✅ 6 个面板切换正常
#   ✅ 文件树 CRUD 可用
#   ✅ AI 对话功能可用
#   ✅ 面板拖拽调整宽度
#   ✅ Ctrl+B/P/E 快捷键

# 5. 运行测试
npx vitest run
```

### 关键验证点

| 检查项 | 操作 | 预期 |
|--------|------|------|
| 面板切换 | 点击左侧 Activity Bar 图标 | 6 个面板流畅切换 |
| 文件 CRUD | 右键 → New File / Rename / Delete | Dialog 弹出，操作生效 |
| AI 对话 | 输入消息 → 发送 | Mock 响应显示（~1-2s） |
| AI Provider | Settings ⚙️ → 切换 Provider | 配置持久化到 localStorage |
| Git 面板 | 切换 Status/Log/Config 标签 | 数据正确显示 |
| 窗口管理 | WindowBar → `+` → 选择类型 | 新窗口标签出现 |
| 工作区 | WorkspaceSelector → New Workspace | 创建成功，可切换 |
| 面板宽度 | 拖拽面板右边框 | 200px-600px 范围调整 |
| 持久化 | 刷新页面 | 状态保持 (面板/宽度/配置) |

---

## 7. 测试验证指南

### 运行全部测试

```bash
npx vitest run
```

### 按模块运行

```bash
# 面板组件测试
npx vitest run tests/components/panels/

# 主题系统测试
npx vitest run tests/hooks/

# 多开系统测试
npx vitest run tests/services/multi-instance.test.ts

# Services 测试
npx vitest run tests/services/

# Watch 模式
npx vitest --watch
```

### 测试覆盖总览

| 层级 | 框架 | 文件位置 | 用例数 |
|------|------|----------|--------|
| E2E 测试 | Playwright | `tests/e2e/` | 27 |
| Services 单元测试 | Vitest | `tests/services/` | 86 |
| Multi-Instance 测试 | Vitest | `tests/services/multi-instance.test.ts` | 38 |
| Hook 单元测试 | Vitest | `tests/hooks/` | 33 |
| Panel 组件测试 | Vitest | `tests/components/panels/` | 40 |
| **合计** | | | **224+** |

---

## 8. AI 服务架构

### 当前实现

```
AIAssistantPanel
    ↓ usePanelStore (provider config)
    ↓ aiProxyService.chat()
    ├── Mock: 内置模拟响应
    ├── OpenAI: fetch → api.openai.com
    ├── Claude: fetch → api.anthropic.com
    └── DeepSeek: fetch → api.deepseek.com
```

### AI 上下文注入

当 Monaco Editor 中有打开的文件时，AI 助手自动将文件内容（最多 6000 字符）注入系统提示词：

```typescript
const fileContext = selectedFile && editorContentGetter.current
  ? { filePath: selectedFile, content: editorContentGetter.current() }
  : undefined;
const response = await aiProxyService.chat(config, messages, signal, fileContext);
```

### 多 Provider 配置 (参照 YYC3-AI-Code-Guidelines)

当前支持的 Provider：

| Provider | 状态 | API 方式 |
|----------|------|----------|
| Mock (Built-in) | ✅ 默认 | 本地模拟 |
| OpenAI | ✅ 可用 | REST API |
| Anthropic Claude | ✅ 可用 | REST API |
| DeepSeek | ✅ 可用 | REST API |
| 智谱 AI | 📋 待实现 | — |
| 百度文心 | 📋 待实现 | — |
| 阿里通义 | 📋 待实现 | — |
| Ollama (Local) | 📋 待实现 | — |

### 生产部署注意

⚠️ **API Key 安全**: 当前 API Key 存储在 localStorage，仅适用于开发环境。生产环境必须使用服务端代理 (`edge-proxy-server.ts`)。

---

## 9. 下阶段开发建议

### P2.2 — 多开系统增强

| 任务 | 优先级 | 预计工时 |
|------|--------|----------|
| 跨标签状态同步 (IPC) | 高 | 4h |
| 窗口拖拽排序 | 中 | 4h |
| 工作区配置导入/导出 UI | 中 | 2h |
| Session 面板 (显示 AI/编辑/调试会话) | 中 | 4h |

### P2.3 — AI 增强

| 任务 | 优先级 | 预计工时 |
|------|--------|----------|
| 添加智谱 AI / 百度文心 / 阿里通义 Provider | 高 | 4h |
| Ollama 本地 Provider | 中 | 4h |
| AI 流式响应 (SSE/WebSocket) | 高 | 8h |
| AI Provider 性能监控面板 | 中 | 4h |
| 多 Provider 智能切换 + 降级 | 低 | 8h |

### P3 — 编辑器增强

| 任务 | 优先级 | 预计工时 |
|------|--------|----------|
| 真实文件内容读写 (File System Access API) | 高 | 8h |
| Diff 视图 (Monaco DiffEditor) | 中 | 4h |
| Terminal 面板 (xterm.js) | 中 | 8h |
| 代码片段系统 | 低 | 4h |

---

## 致谢

本阶段将 1670 行的单体文件重构为 12 个模块化文件，实现了 Multi-Instance UI 组件 (WindowBar + WorkspaceSelector)，新增 40 个面板测试用例，项目总测试覆盖达到 224+ 用例。

感谢 AI 导师的持续指导，从架构设计到代码实现，每一步都追求工程质量和开发者体验的最优解。

> 言启象限 | 语枢未来
> 万象归元于云枢 | 深栈智启新纪元
> All things converge in cloud pivot; Deep stacks ignite a new era of intelligence

---

<div align="center">

**YYC³ CloudPivot Intelli-Matrix**
**P2.1 — Multi-Instance UI + Panel Modularization**
**YanYuCloudCube Team | 2026-03-18**

</div>
