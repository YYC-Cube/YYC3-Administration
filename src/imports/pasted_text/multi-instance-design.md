Your Role & Expertise

You are an experienced desktop application architect who specializes in:
- **Multi-Instance Management**: Multiple application instances, window management, process isolation
- **Workspace Management**: Independent workspaces, project isolation, context separation
- **Session Management**: Concurrent sessions, session persistence, session synchronization
- **Resource Management**: Memory optimization, CPU load balancing, resource sharing
- **IPC Communication**: Inter-process communication, message passing, event coordination
- **State Synchronization**: Cross-instance sync, state replication, conflict resolution
- **Best Practices**: Performance optimization, user experience, error handling

### Code Standards

**IMPORTANT**: Please ensure all generated code files follow the team requirements specified in: `guidelines/YYC3-Code-header.md`

All code files must include proper file headers with:
- @file: File name/path
- @description: Clear description of file purpose
- @author: YanYuCloudCube Team <admin@0379.email>
- @version: Semantic version (v1.0.0)
- @created: Creation date (YYYY-MM-DD)
- @updated: Last update date (YYYY-MM-DD)
- @status: File status (draft/dev/test/stable/deprecated)
- @license: License type
- @copyright: Copyright notice
- @tags: Relevant tags for categorization

---

## 📋 文档信息

| 字段 | 内容 |
|------|------|
| @file | P2-高级功能/YYC3-P2-高级功能-应用多开.md |
| @description | 应用多开功能设计和实现，支持多窗口、多工作区、多会话并行管理 |
| @author | YanYuCloudCube Team <admin@0379.email> |
| @version | v1.0.0 |
| @created | 2026-03-17 |
| @updated | 2026-03-17 |
| @status | stable |
| @license | MIT |
| @copyright | Copyright (c) 2026 YanYuCloudCube Team |
| @tags P2,multi-instance,workspace,window-management |

---

## 🎯 功能目标

实现智能应用多开系统，包括：
- ✅ 多窗口管理（独立窗口、窗口分组）
- ✅ 多工作区（项目隔离、上下文分离）
- ✅ 多会话并行（AI对话、编辑会话）
- ✅ 资源共享（剪贴板、文件、状态）
- ✅ 会话同步（跨实例状态同步）
- ✅ 性能优化（内存管理、负载均衡）

---

## 🏗️ 架构设计

### 1. 功能架构

```
MultiInstance/
├── WindowManager          # 窗口管理器
├── WorkspaceManager       # 工作区管理器
├── SessionManager        # 会话管理器
├── IPCManager           # 进程间通信管理器
├── ResourceManager       # 资源管理器
└── SyncManager          # 同步管理器
```

### 2. 数据流

```
User Action (用户操作)
    ↓ WindowManager
Window Instance (窗口实例)
    ↓ IPC
Main Process (主进程)
    ↓ Resource Sharing
Other Instances (其他实例)
```

---

## 💾 核心类型定义

### 多开类型

```typescript
// src/types/multi-instance.ts

/**
 * 实例类型
 */
export type InstanceType = 'main' | 'secondary' | 'popup' | 'preview';

/**
 * 窗口类型
 */
export type WindowType = 'main' | 'editor' | 'preview' | 'terminal' | 'ai-chat' | 'settings';

/**
 * 工作区类型
 */
export type WorkspaceType = 'project' | 'ai-session' | 'debug' | 'custom';

/**
 * 会话类型
 */
export type SessionType = 'ai-chat' | 'code-edit' | 'debug' | 'preview' | 'terminal';

/**
 * 应用实例接口
 */
export interface AppInstance {
  /** 实例 ID */
  id: string;
  /** 实例类型 */
  type: InstanceType;
  /** 窗口 ID */
  windowId: string;
  /** 窗口类型 */
  windowType: WindowType;
  /** 实例标题 */
  title: string;
  /** 创建时间 */
  createdAt: number;
  /** 最后活动时间 */
  lastActiveAt: number;
  /** 是否为主实例 */
  isMain: boolean;
  /** 是否可见 */
  isVisible: boolean;
  /** 是否最小化 */
  isMinimized: boolean;
  /** 窗口位置 */
  position: { x: number; y: number };
  /** 窗口大小 */
  size: { width: number; height: number };
  /** 关联的工作区 ID */
  workspaceId?: string;
  /** 关联的会话 ID 列表 */
  sessionIds: string[];
  /** 实例状态 */
  state: Record<string, any>;
}

/**
 * 工作区接口
 */
export interface Workspace {
  /** 工作区 ID */
  id: string;
  /** 工作区名称 */
  name: string;
  /** 工作区类型 */
  type: WorkspaceType;
  /** 工作区图标 */
  icon?: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 项目路径 */
  projectPath?: string;
  /** 工作区配置 */
  config: WorkspaceConfig;
  /** 关联的会话列表 */
  sessions: Session[];
  /** 关联的窗口 ID 列表 */
  windowIds: string[];
  /** 是否激活 */
  isActive: boolean;
}

/**
 * 工作区配置
 */
export interface WorkspaceConfig {
  /** 编辑器配置 */
  editor?: EditorConfig;
  /** AI 配置 */
  ai?: AIConfig;
  /** 面板布局 */
  panelLayout?: PanelLayout;
  /** 主题配置 */
  theme?: ThemeConfig;
  /** 快捷键配置 */
  shortcuts?: ShortcutConfig;
}

/**
 * 会话接口
 */
export interface Session {
  /** 会话 ID */
  id: string;
  /** 会话类型 */
  type: SessionType;
  /** 会话名称 */
  name: string;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 会话状态 */
  status: 'active' | 'idle' | 'suspended' | 'closed';
  /** 会话数据 */
  data: SessionData;
  /** 关联的工作区 ID */
  workspaceId: string;
  /** 关联的窗口 ID */
  windowId: string;
}

/**
 * 会话数据
 */
export interface SessionData {
  /** AI 对话消息 */
  aiMessages?: Array<{ role: string; content: string }>;
  /** 编辑的文件列表 */
  editedFiles?: Array<{ path: string; content: string }>;
  /** 终端历史 */
  terminalHistory?: Array<{ command: string; output: string }>;
  /** 调试状态 */
  debugState?: any;
  /** 预览 URL */
  previewUrl?: string;
}

/**
 * IPC 消息类型
 */
export type IPCMessageType =
  | 'instance-created'
  | 'instance-closed'
  | 'workspace-created'
  | 'workspace-updated'
  | 'workspace-closed'
  | 'session-created'
  | 'session-updated'
  | 'session-closed'
  | 'state-sync'
  | 'resource-share'
  | 'clipboard-share';

/**
 * IPC 消息接口
 */
export interface IPCMessage {
  /** 消息 ID */
  id: string;
  /** 消息类型 */
  type: IPCMessageType;
  /** 发送者实例 ID */
  senderId: string;
  /** 接收者实例 ID（可选） */
  receiverId?: string;
  /** 消息数据 */
  data: any;
  /** 时间戳 */
  timestamp: number;
}
```

---

## 🪟 窗口管理器

### 窗口管理服务

```typescript
// src/services/multi-instance/WindowManager.ts
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppInstance, WindowType, InstanceType } from '@/types/multi-instance';

interface WindowState {
  /** 所有实例 */
  instances: AppInstance[];
  /** 当前激活的实例 ID */
  activeInstanceId: string | null;
  /** 主实例 ID */
  mainInstanceId: string | null;
}

interface WindowActions {
  /** 创建新窗口 */
  createWindow: (type: WindowType, config?: WindowConfig) => Promise<AppInstance>;
  /** 关闭窗口 */
  closeWindow: (windowId: string) => Promise<void>;
  /** 激活窗口 */
  activateWindow: (windowId: string) => Promise<void>;
  /** 最小化窗口 */
  minimizeWindow: (windowId: string) => Promise<void>;
  /** 最大化窗口 */
  maximizeWindow: (windowId: string) => Promise<void>;
  /** 恢复窗口 */
  restoreWindow: (windowId: string) => Promise<void>;
  /** 移动窗口 */
  moveWindow: (windowId: string, position: { x: number; y: number }) => Promise<void>;
  /** 调整窗口大小 */
  resizeWindow: (windowId: string, size: { width: number; height: number }) => Promise<void>;
  /** 聚焦窗口 */
  focusWindow: (windowId: string) => Promise<void>;
  /** 获取窗口信息 */
  getWindowInfo: (windowId: string) => Promise<AppInstance | null>;
  /** 获取所有窗口 */
  getAllWindows: () => AppInstance[];
  /** 更新窗口状态 */
  updateWindowState: (windowId: string, updates: Partial<AppInstance>) => void;
}

interface WindowConfig {
  /** 窗口标题 */
  title?: string;
  /** 窗口大小 */
  size?: { width: number; height: number };
  /** 窗口位置 */
  position?: { x: number; y: number };
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 是否可移动 */
  movable?: boolean;
  /** 是否始终置顶 */
  alwaysOnTop?: boolean;
  /** 是否全屏 */
  fullscreen?: boolean;
  /** 是否显示装饰 */
  decorations?: boolean;
  /** 透明度 */
  transparent?: boolean;
  /** 关联的工作区 ID */
  workspaceId?: string;
}

export const useWindowStore = create<WindowState & WindowActions>()(
  persist(
    (set, get) => ({
      instances: [],
      activeInstanceId: null,
      mainInstanceId: null,

      createWindow: async (type, config = {}) => {
        const instanceId = crypto.randomUUID();
        const windowId = `window-${instanceId}`;

        // 调用 Tauri 创建窗口
        await invoke('create_window', {
          windowId,
          windowType: type,
          config: {
            title: config.title || `YYC³ - ${type}`,
            width: config.size?.width || 1200,
            height: config.size?.height || 800,
            x: config.position?.x,
            y: config.position?.y,
            resizable: config.resizable !== false,
            movable: config.movable !== false,
            alwaysOnTop: config.alwaysOnTop || false,
            fullscreen: config.fullscreen || false,
            decorations: config.decorations !== false,
            transparent: config.transparent || false,
          },
        });

        const instance: AppInstance = {
          id: instanceId,
          type: get().instances.length === 0 ? 'main' : 'secondary',
          windowId,
          windowType: type,
          title: config.title || `YYC³ - ${type}`,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          isMain: get().instances.length === 0,
          isVisible: true,
          isMinimized: false,
          position: config.position || { x: 100 + get().instances.length * 50, y: 100 + get().instances.length * 50 },
          size: config.size || { width: 1200, height: 800 },
          workspaceId: config.workspaceId,
          sessionIds: [],
          state: {},
        };

        set((state) => ({
          instances: [...state.instances, instance],
          mainInstanceId: state.mainInstanceId || instance.id,
        }));

        // 通知其他实例
        await get().notifyInstanceCreated(instance);

        return instance;
      },

      closeWindow: async (windowId) => {
        await invoke('close_window', { windowId });

        set((state) => {
          const instance = state.instances.find((i) => i.windowId === windowId);
          if (instance) {
            get().notifyInstanceClosed(instance);
          }
          return {
            instances: state.instances.filter((i) => i.windowId !== windowId),
            activeInstanceId: state.activeInstanceId === windowId ? null : state.activeInstanceId,
          };
        });
      },

      activateWindow: async (windowId) => {
        await invoke('activate_window', { windowId });

        set((state) => ({
          activeInstanceId: windowId,
          instances: state.instances.map((i) =>
            i.windowId === windowId
              ? { ...i, lastActiveAt: Date.now() }
              : i
          ),
        }));
      },

      minimizeWindow: async (windowId) => {
        await invoke('minimize_window', { windowId });

        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, isMinimized: true } : i
          ),
        }));
      },

      maximizeWindow: async (windowId) => {
        await invoke('maximize_window', { windowId });
      },

      restoreWindow: async (windowId) => {
        await invoke('restore_window', { windowId });

        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, isMinimized: false } : i
          ),
        }));
      },

      moveWindow: async (windowId, position) => {
        await invoke('move_window', { windowId, x: position.x, y: position.y });

        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, position } : i
          ),
        }));
      },

      resizeWindow: async (windowId, size) => {
        await invoke('resize_window', { windowId, width: size.width, height: size.height });

        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, size } : i
          ),
        }));
      },

      focusWindow: async (windowId) => {
        await invoke('focus_window', { windowId });

        set((state) => ({
          activeInstanceId: windowId,
          instances: state.instances.map((i) =>
            i.windowId === windowId
              ? { ...i, lastActiveAt: Date.now() }
              : i
          ),
        }));
      },

      getWindowInfo: async (windowId) => {
        const info = await invoke('get_window_info', { windowId });
        return info as AppInstance;
      },

      getAllWindows: () => {
        return get().instances;
      },

      updateWindowState: (windowId, updates) => {
        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, ...updates } : i
          ),
        }));
      },

      notifyInstanceCreated: async (instance: AppInstance) => {
        // 通过 IPC 通知其他实例
        await invoke('broadcast_message', {
          type: 'instance-created',
          data: instance,
        });
      },

      notifyInstanceClosed: async (instance: AppInstance) => {
        await invoke('broadcast_message', {
          type: 'instance-closed',
          data: instance,
        });
      },
    }),
    {
      name: 'window-storage',
      partialize: (state) => ({
        instances: state.instances,
      }),
    }
  )
);
```

---

## 📁 工作区管理器

### 工作区管理服务

```typescript
// src/services/multi-instance/WorkspaceManager.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workspace, WorkspaceType, WorkspaceConfig } from '@/types/multi-instance';

interface WorkspaceState {
  /** 所有工作区 */
  workspaces: Workspace[];
  /** 当前激活的工作区 ID */
  activeWorkspaceId: string | null;
  /** 工作区筛选 */
  filter: {
    type?: WorkspaceType;
    search?: string;
  };
}

interface WorkspaceActions {
  /** 创建工作区 */
  createWorkspace: (name: string, type: WorkspaceType, config?: WorkspaceConfig) => Workspace;
  /** 更新工作区 */
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  /** 删除工作区 */
  deleteWorkspace: (workspaceId: string) => void;
  /** 激活工作区 */
  activateWorkspace: (workspaceId: string) => void;
  /** 复制工作区 */
  duplicateWorkspace: (workspaceId: string) => Workspace;
  /** 导出工作区 */
  exportWorkspace: (workspaceId: string) => Promise<string>;
  /** 导入工作区 */
  importWorkspace: (data: string) => Workspace;
  /** 更新筛选 */
  updateFilter: (filter: Partial<WorkspaceState['filter']>) => void;
  /** 添加会话到工作区 */
  addSessionToWorkspace: (workspaceId: string, sessionId: string) => void;
  /** 从工作区移除会话 */
  removeSessionFromWorkspace: (workspaceId: string, sessionId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      filter: {},

      createWorkspace: (name, type, config = {}) => {
        const workspace: Workspace = {
          id: crypto.randomUUID(),
          name,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          config,
          sessions: [],
          windowIds: [],
          isActive: false,
        };

        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        }));

        return workspace;
      },

      updateWorkspace: (workspaceId, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? { ...w, ...updates, updatedAt: Date.now() }
              : w
          ),
        }));
      },

      deleteWorkspace: (workspaceId) => {
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
          activeWorkspaceId:
            state.activeWorkspaceId === workspaceId ? null : state.activeWorkspaceId,
        }));
      },

      activateWorkspace: (workspaceId) => {
        set((state) => ({
          activeWorkspaceId: workspaceId,
          workspaces: state.workspaces.map((w) => ({
            ...w,
            isActive: w.id === workspaceId,
          })),
        }));
      },

      duplicateWorkspace: (workspaceId) => {
        const { workspaces } = get();
        const original = workspaces.find((w) => w.id === workspaceId);

        if (!original) {
          throw new Error('Workspace not found');
        }

        const duplicated: Workspace = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          sessions: [],
          windowIds: [],
          isActive: false,
        };

        set((state) => ({
          workspaces: [...state.workspaces, duplicated],
        }));

        return duplicated;
      },

      exportWorkspace: async (workspaceId) => {
        const { workspaces } = get();
        const workspace = workspaces.find((w) => w.id === workspaceId);

        if (!workspace) {
          throw new Error('Workspace not found');
        }

        return JSON.stringify(workspace, null, 2);
      },

      importWorkspace: (data) => {
        const workspace = JSON.parse(data);
        workspace.id = crypto.randomUUID();
        workspace.createdAt = Date.now();
        workspace.updatedAt = Date.now();
        workspace.isActive = false;

        set((state) => ({
          workspaces: [...state.workspaces, workspace],
        }));

        return workspace;
      },

      updateFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      addSessionToWorkspace: (workspaceId, sessionId) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  sessions: [...w.sessions, { id: sessionId } as any],
                  updatedAt: Date.now(),
                }
              : w
          ),
        }));
      },

      removeSessionFromWorkspace: (workspaceId, sessionId) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  sessions: w.sessions.filter((s) => s.id !== sessionId),
                  updatedAt: Date.now(),
                }
              : w
          ),
        }));
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        workspaces: state.workspaces,
      }),
    }
  )
);
```

---

## 💬 会话管理器

### 会话管理服务

```typescript
// src/services/multi-instance/SessionManager.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, SessionType, SessionData } from '@/types/multi-instance';

interface SessionState {
  /** 所有会话 */
  sessions: Session[];
  /** 当前激活的会话 ID */
  activeSessionId: string | null;
  /** 会话筛选 */
  filter: {
    type?: SessionType;
    workspaceId?: string;
    status?: Session['status'];
  };
}

interface SessionActions {
  /** 创建会话 */
  createSession: (name: string, type: SessionType, workspaceId: string, data?: SessionData) => Session;
  /** 更新会话 */
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  /** 删除会话 */
  deleteSession: (sessionId: string) => void;
  /** 激活会话 */
  activateSession: (sessionId: string) => void;
  /** 暂停会话 */
  suspendSession: (sessionId: string) => void;
  /** 恢复会话 */
  resumeSession: (sessionId: string) => void;
  /** 更新会话数据 */
  updateSessionData: (sessionId: string, data: Partial<SessionData>) => void;
  /** 更新筛选 */
  updateFilter: (filter: Partial<SessionState['filter']>) => void;
  /** 获取工作区的会话 */
  getWorkspaceSessions: (workspaceId: string) => Session[];
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      filter: {},

      createSession: (name, type, workspaceId, data = {}) => {
        const session: Session = {
          id: crypto.randomUUID(),
          name,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'active',
          data,
          workspaceId,
          windowId: '',
        };

        set((state) => ({
          sessions: [...state.sessions, session],
        }));

        return session;
      },

      updateSession: (sessionId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, ...updates, updatedAt: Date.now() }
              : s
          ),
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId:
            state.activeSessionId === sessionId ? null : state.activeSessionId,
        }));
      },

      activateSession: (sessionId) => {
        set((state) => ({
          activeSessionId: sessionId,
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'active' as const } : s
          ),
        }));
      },

      suspendSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'suspended' as const } : s
          ),
        }));
      },

      resumeSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'active' as const } : s
          ),
        }));
      },

      updateSessionData: (sessionId, data) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, data: { ...s.data, ...data }, updatedAt: Date.now() }
              : s
          ),
        }));
      },

      updateFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      getWorkspaceSessions: (workspaceId) => {
        return get().sessions.filter((s) => s.workspaceId === workspaceId);
      },
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    }
  )
);
```

---

## 🔄 IPC 通信管理器

### IPC 通信服务

```typescript
// src/services/multi-instance/IPCManager.ts
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import type { IPCMessage, IPCMessageType } from '@/types/multi-instance';

/**
 * IPC 通信管理器类
 */
export class IPCManager {
  private messageHandlers: Map<IPCMessageType, Set<(message: IPCMessage) => void>> = new Map();
  private instanceId: string;

  constructor() {
    this.instanceId = crypto.randomUUID();
    this.initializeListeners();
  }

  /**
   * 初始化监听器
   */
  private async initializeListeners(): Promise<void> {
    // 监听来自其他实例的消息
    await listen<IPCMessage>('ipc-message', (event) => {
      const message = event.payload;
      this.handleMessage(message);
    });

    // 监听实例创建事件
    await listen<AppInstance>('instance-created', (event) => {
      console.log('New instance created:', event.payload);
    });

    // 监听实例关闭事件
    await listen<AppInstance>('instance-closed', (event) => {
      console.log('Instance closed:', event.payload);
    });
  }

  /**
   * 处理消息
   */
  private handleMessage(message: IPCMessage): void {
    const handlers = this.messageHandlers.get(message.type);

    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
  }

  /**
   * 注册消息处理器
   */
  on(messageType: IPCMessageType, handler: (message: IPCMessage) => void): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }

    this.messageHandlers.get(messageType)!.add(handler);

    // 返回取消订阅函数
    return () => {
      this.messageHandlers.get(messageType)?.delete(handler);
    };
  }

  /**
   * 发送消息到所有实例
   */
  async broadcast(type: IPCMessageType, data: any): Promise<void> {
    const message: IPCMessage = {
      id: crypto.randomUUID(),
      type,
      senderId: this.instanceId,
      data,
      timestamp: Date.now(),
    };

    await invoke('broadcast_message', { message });
  }

  /**
   * 发送消息到指定实例
   */
  async sendToInstance(
    instanceId: string,
    type: IPCMessageType,
    data: any
  ): Promise<void> {
    const message: IPCMessage = {
      id: crypto.randomUUID(),
      type,
      senderId: this.instanceId,
      receiverId: instanceId,
      data,
      timestamp: Date.now(),
    };

    await invoke('send_to_instance', { message });
  }

  /**
   * 获取当前实例 ID
   */
  getInstanceId(): string {
    return this.instanceId;
  }
}

export const ipcManager = new IPCManager();
```

---

## ✅ 验收标准

### 功能完整性

- ✅ 多窗口管理完善
- ✅ 工作区隔离有效
- ✅ 会话管理灵活
- ✅ IPC 通信可靠
- ✅ 资源共享安全

### 用户体验

- ✅ 窗口切换流畅
- ✅ 工作区切换快速
- ✅ 会话恢复准确
- ✅ 性能优化良好

### 代码质量

- ✅ 代码结构清晰
- ✅ 类型定义完整
- ✅ 注释文档完整
- ✅ 代码可维护性好

---

## 🔄 版本历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-17 | 初始版本，建立应用多开功能 | YanYuCloudCube Team |

---

## 📞 联系方式

- **维护团队**: YanYuCloudCube Team
- **联系邮箱**: admin@0379.email

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
