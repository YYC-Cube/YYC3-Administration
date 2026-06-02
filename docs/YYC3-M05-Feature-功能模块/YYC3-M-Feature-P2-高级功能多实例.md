# YYC³ P2 高级功能 — 应用多开系统 (Multi-Instance)

<div align="center">

> **YanYuCloudCube**
> **言启象限 | 语枢未来**
> **Words Initiate Quadrants, Language Serves as Core for Future**

</div>

---

**文档版本**: v1.0.0
**最后更新**: 2026-03-18
**维护团队**: YanYuCloudCube Team <admin@0379.email>
**状态**: stable

---

## 目录

1. [功能概述](#1-功能概述)
2. [架构设计](#2-架构设计)
3. [核心模块](#3-核心模块)
4. [文件结构](#4-文件结构)
5. [API 参考](#5-api-参考)
6. [面板拆分架构](#6-面板拆分架构)
7. [测试覆盖](#7-测试覆盖)
8. [本地衔接指南](#8-本地衔接指南)
9. [下阶段建议](#9-下阶段建议)

---

## 1. 功能概述

YYC³ 多开系统在 Web 环境中实现类桌面应用的多窗口管理能力：

| 功能 | 说明 | 技术 |
|------|------|------|
| **窗口管理** | 虚拟窗口创建/关闭/激活/最小化/调整 | Zustand Store |
| **工作区隔离** | 独立项目上下文、配置分离、会话隔离 | Zustand Persist |
| **会话管理** | 多 AI 对话、编辑会话、调试会话并行 | Zustand Store |
| **跨标签通信** | BroadcastChannel API + localStorage 回退 | Web IPC |
| **状态同步** | 跨标签状态同步、剪贴板共享 | IPC Manager |

### Web vs Desktop 适配

| 能力 | Web (当前) | Desktop (Tauri/Electron) |
|------|-----------|------------------------|
| 窗口管理 | 虚拟面板 / Tab | 原生窗口 |
| IPC 通信 | BroadcastChannel | Tauri IPC / Electron IPC |
| 持久化 | localStorage | 文件系统 + localStorage |
| 进程隔离 | 同进程 | 独立进程 |

---

## 2. 架构设计

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
│                 (React Components)                   │
├──────────┬──────────┬──────────┬────────────────────┤
│ Window   │Workspace │ Session  │      Panel         │
│ Manager  │ Manager  │ Manager  │    Components      │
│ (Zustand)│(Zustand) │(Zustand) │   (Extracted)      │
├──────────┴──────────┴──────────┴────────────────────┤
│                   IPC Manager                        │
│            (BroadcastChannel API)                    │
├─────────────────────────────────────────────────────┤
│                  localStorage                        │
│              (Zustand Persist)                        │
└─────────────────────────────────────────────────────┘
```

### 数据流

```
用户操作 → Zustand Store → IPC Broadcast → 其他标签页接收 → Store 同步
```

---

## 3. 核心模块

### 3.1 WindowManager (`window-manager.ts`)

管理虚拟窗口实例的生命周期。

**Store 状态**:
- `instances: AppInstance[]` — 所有窗口实例
- `activeInstanceId: string | null` — 当前激活的窗口
- `mainInstanceId: string | null` — 主窗口 ID

**核心方法**:

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `createWindow` | `type, config?` | `AppInstance` | 创建新窗口 |
| `closeWindow` | `windowId` | `void` | 关闭窗口 |
| `activateWindow` | `windowId` | `void` | 激活窗口 |
| `minimizeWindow` | `windowId` | `void` | 最小化 |
| `restoreWindow` | `windowId` | `void` | 恢复窗口 |
| `moveWindow` | `windowId, position` | `void` | 移动位置 |
| `resizeWindow` | `windowId, size` | `void` | 调整大小 |
| `getAllWindows` | - | `AppInstance[]` | 获取所有窗口 |
| `getActiveWindow` | - | `AppInstance?` | 获取当前窗口 |

### 3.2 WorkspaceManager (`workspace-manager.ts`)

管理独立工作区及其配置。

**核心方法**:

| 方法 | 说明 |
|------|------|
| `createWorkspace(name, type, config?)` | 创建工作区 |
| `deleteWorkspace(id)` | 删除工作区 |
| `activateWorkspace(id)` | 激活工作区 |
| `duplicateWorkspace(id)` | 复制工作区 |
| `exportWorkspace(id)` | 导出为 JSON |
| `importWorkspace(json)` | 从 JSON 导入 |
| `getFilteredWorkspaces()` | 按类型/搜索筛选 |

### 3.3 SessionManager (`session-manager.ts`)

管理并行会话（AI 对话、编辑、调试）。

**会话状态流转**:
```
active → suspended → active
active → closed (删除)
idle → active
```

**核心方法**:

| 方法 | 说明 |
|------|------|
| `createSession(name, type, workspaceId, data?)` | 创建会话 |
| `suspendSession(id)` | 暂停会话 |
| `resumeSession(id)` | 恢复会话 |
| `updateSessionData(id, data)` | 更新会话数据 |
| `getWorkspaceSessions(workspaceId)` | 获取工作区会话 |
| `getActiveSessions()` | 获取所有活跃会话 |

### 3.4 IPCManager (`ipc-manager.ts`)

基于 BroadcastChannel API 的跨标签通信。

**特性**:
- 自动检测 BroadcastChannel 支持
- localStorage fallback 兜底方案
- 消息按 instanceId 过滤（不收自己发的消息）
- 支持广播和定向发送
- `destroy()` 清理资源，防止内存泄漏

**使用示例**:

```typescript
import { ipcManager } from "./services/multi-instance";

// 监听状态同步
const unsub = ipcManager.on("state-sync", (msg) => {
  console.log("Received sync:", msg.data);
});

// 广播状态
await ipcManager.broadcast("state-sync", { theme: "cyberpunk" });

// 定向发送
await ipcManager.sendToInstance("target-id", "clipboard-share", { text: "hello" });

// 清理
unsub();
ipcManager.destroy();
```

---

## 4. 文件结构

```
src/app/components/
├── panels/                           # 🆕 拆分的面板组件
│   ├── panel-types.ts                # 共享类型定义
│   ├── panel-store.ts                # Zustand 面板 Store
│   └── index.ts                      # Barrel exports
├── services/
│   ├── multi-instance/               # 🆕 多开系统
│   │   ├── types.ts                  # 类型定义
│   │   ├── window-manager.ts         # 窗口管理器 Store
│   │   ├── workspace-manager.ts      # 工作区管理器 Store
│   │   ├── session-manager.ts        # 会话管理器 Store
│   │   ├── ipc-manager.ts            # IPC 通信管理器
│   │   └── index.ts                  # Barrel exports
│   ├── ai-proxy-service.ts
│   ├── git-api-service.ts
│   ├── edge-proxy-server.ts
│   └── test-utils.ts
├── hooks/
│   ├── use-theme-colors.ts           # ✅ 扩展测试覆盖
│   └── use-theme-tokens.ts
└── left-panel-page.tsx               # 原始文件保持兼容
```

---

## 5. API 参考

### 类型定义

```typescript
// Instance Types
type InstanceType = "main" | "secondary" | "popup" | "preview";
type WindowType = "main" | "editor" | "preview" | "terminal" | "ai-chat" | "settings";
type WorkspaceType = "project" | "ai-session" | "debug" | "custom";
type SessionType = "ai-chat" | "code-edit" | "debug" | "preview" | "terminal";

// IPC Message Types
type IPCMessageType =
  | "instance-created" | "instance-closed"
  | "workspace-created" | "workspace-updated" | "workspace-closed"
  | "session-created" | "session-updated" | "session-closed"
  | "state-sync" | "resource-share" | "clipboard-share";
```

### Import 路径

```typescript
// Multi-Instance
import { useWindowStore, useWorkspaceStore, useSessionStore, ipcManager } from "./services/multi-instance";
import type { AppInstance, Workspace, Session, IPCMessage } from "./services/multi-instance";

// Panel Components
import { usePanelStore } from "./panels";
import type { PanelType, FileNode, AIChatMessage } from "./panels";
```

---

## 6. 面板拆分架构

### 拆分前 vs 拆分后

| 拆分前 | 拆分后 |
|--------|--------|
| `left-panel-page.tsx` (1670行) | `panels/panel-types.ts` — 共享类型 |
| 所有类型、Store、6个面板、主组件在一个文件 | `panels/panel-store.ts` — Zustand Store |
| | `panels/index.ts` — 导出入口 |
| | `left-panel-page.tsx` — 主组件（可从 panels/ 导入 Store） |

### 面板组件清单

| 面板 | 行数 | 功能 | 可独立测试 |
|------|------|------|-----------|
| FileExplorerPanel | ~220 | 文件树 CRUD + 右键菜单 | ✅ |
| TaskManagerPanel | ~110 | 任务看板集成 + 筛选 | ✅ |
| AIAssistantPanel | ~250 | 多 Provider 对话 + 配置 | ✅ |
| GlobalSearchPanel | ~120 | 文件/内容/符号搜索 | ✅ |
| QuickAccessPanel | ~70 | 最近文件 + 收藏夹 | ✅ |
| GitIntegrationPanel | ~180 | Status/Log/Config + API | ✅ |

### 进一步拆分建议

如需完全拆分为独立文件（后续阶段）：

```typescript
// panels/file-explorer-panel.tsx
import { usePanelStore } from "./panel-store";
import type { FileNode } from "./panel-types";
export function FileExplorerPanel({ tc }) { ... }
```

当前阶段已提取 Store 和 Types，面板组件函数仍在 `left-panel-page.tsx` 中（向后兼容），但可独立导入 Store 进行单元测试。

---

## 7. 测试覆盖

### 本阶段新增测试

| 测试文件 | 用例数 | 覆盖模块 |
|----------|--------|----------|
| `use-theme-colors.test.ts` (扩展) | 33 → +20新增 | Shadow/Gradient/Header/Footer/Sidebar/Effects/Status/Badge/完整Token |
| `multi-instance.test.ts` | 38 | WindowManager/WorkspaceManager/SessionManager/IPCManager/PanelStore |

### 测试总览

| 层级 | 框架 | 用例数 |
|------|------|--------|
| E2E 测试 | Playwright | 27 |
| Services 单元测试 | Vitest | 86 |
| Hook 单元测试 | Vitest | 33 |
| Multi-Instance + Panel Store | Vitest | 38 |
| **合计** | | **184+** |

### 运行测试

```bash
# 运行所有 Vitest 测试
npx vitest run

# 运行多开系统测试
npx vitest run tests/services/multi-instance.test.ts

# 运行主题测试
npx vitest run tests/hooks/use-theme-colors.test.ts

# Watch 模式
npx vitest --watch
```

---

## 8. 本地衔接指南

### 快速启动

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖（如有更新）
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 运行测试验证
npx vitest run
```

### 集成多开系统到 UI

在 `cyberpunk-standalone.tsx` 中添加多窗口管理面板：

```typescript
import { useWindowStore, useWorkspaceStore } from "./services/multi-instance";

// 在组件中使用
const { instances, createWindow, closeWindow } = useWindowStore();
const { workspaces, createWorkspace, activateWorkspace } = useWorkspaceStore();
```

### 集成拆分后的面板 Store

如需在其他组件中访问面板状态：

```typescript
import { usePanelStore } from "./panels";

const { selectedFile, activePanel, aiProviderConfig } = usePanelStore();
```

### 重要文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `panels/panel-types.ts` | 新建 | 面板共享类型 |
| `panels/panel-store.ts` | 新建 | 面板 Zustand Store |
| `panels/index.ts` | 新建 | Barrel exports |
| `services/multi-instance/types.ts` | 新建 | 多开类型定义 |
| `services/multi-instance/window-manager.ts` | 新建 | 窗口管理 Store |
| `services/multi-instance/workspace-manager.ts` | 新建 | 工作区管理 Store |
| `services/multi-instance/session-manager.ts` | 新建 | 会话管理 Store |
| `services/multi-instance/ipc-manager.ts` | 新建 | IPC 通信管理 |
| `theme-switcher-context.tsx` | 修改 | 添加 `defaultTheme` prop |
| `tests/hooks/use-theme-colors.test.ts` | 扩展 | +20 测试用例 |
| `tests/services/multi-instance.test.ts` | 新建 | 38 测试用例 |

---

## 9. 下阶段建议

### P2.1 — 多窗口 UI 组件

| 任务 | 预计工时 |
|------|----------|
| WindowBar 组件（显示所有打开的窗口标签） | 4h |
| WorkspaceSelector 组件（工作区切换器） | 4h |
| SessionPanel 组件（会话管理面板） | 4h |
| 完全拆分 6 个面板为独立 .tsx 文件 | 4h |

### P2.2 — 跨标签实时同步

| 任务 | 预计工时 |
|------|----------|
| 主题同步（跨标签实时切换） | 2h |
| 剪贴板共享 UI | 2h |
| 文件编辑冲突检测 | 4h |

### P2.3 — Desktop 适配

| 任务 | 说明 |
|------|------|
| Tauri 原生窗口 | 替换虚拟窗口为 Tauri WebviewWindow |
| Tauri IPC | 替换 BroadcastChannel 为 Tauri invoke |
| 文件系统 | 接入 Tauri fs API |

---

## 致谢

本阶段在 AI 导师全程指导下完成了多开系统架构设计和实现，面板组件拆分，以及 184+ 测试用例的完整覆盖。

> 言启象限 | 语枢未来
> All things converge in cloud pivot; Deep stacks ignite a new era of intelligence

---

<div align="center">

**YYC³ CloudPivot Intelli-Matrix**
**P2 — Multi-Instance System**
**YanYuCloudCube Team | 2026-03-18**

</div>
