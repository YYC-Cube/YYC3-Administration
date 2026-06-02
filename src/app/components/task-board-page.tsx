/**
 * @file task-board-page.tsx
 * @description AI Task Board v2.0 - Intelligent Kanban board with Zustand persistent storage,
 *              react-dnd cross-column drag-and-drop, AI Provider task inference simulation,
 *              smart reminders, quick actions, batch processing, and dependency management.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,AI,task-board,interaction,zustand,dnd,inference
 */

import {
  AlertTriangle, Archive, Ban, BarChart3, BellRing,
  Brain, Calendar, Check, CheckCircle2, ChevronRight,
  Circle, ClipboardList, Code, Copy,
  Edit3, Eye, FileCode,
  Filter, GripVertical, Layers,
  LayoutGrid, List, Loader2,
  MessageSquare, MoreHorizontal,
  Play, Plus, RefreshCw,
  Search, SortAsc, SortDesc, Sparkles,
  Target,
  Timer, Trash2, X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useThemeColors } from "./hooks/use-theme-colors";
import { useI18n } from "./i18n-context";

// ==========================================
// Types
// ==========================================

type TaskStatus = "todo" | "in-progress" | "review" | "done" | "blocked";
type TaskPriority = "critical" | "high" | "medium" | "low";
type TaskType = "feature" | "bug" | "refactor" | "test" | "documentation" | "other";
type ReminderType = "deadline" | "dependency" | "blocking" | "progress" | "custom";
type ViewMode = "kanban" | "list" | "stats";

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  estimatedHours?: number;
  actualHours?: number;
  relatedMessageId?: string;
  relatedFiles?: string[];
  tags?: string[];
  subtasks?: SubTask[];
  dependencies?: string[];
  blocking?: string[];
  assigneeId?: string;
  isArchived: boolean;
  source: "manual" | "ai-inferred" | "imported";
  confidence?: number;
}

interface Reminder {
  id: string;
  taskId: string;
  type: ReminderType;
  message: string;
  remindAt: number;
  isTriggered: boolean;
  isRead: boolean;
  createdAt: number;
}

interface TaskInferenceResult {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  confidence: number;
  reasoning: string;
  tags: string[];
  estimatedHours?: number;
  relatedFiles?: string[];
}

// ==========================================
// Constants
// ==========================================

const DND_ITEM_TYPE = "TASK_CARD";

const STATUS_CONFIG: Record<TaskStatus, { label: string; labelZh: string; icon: typeof Circle; color: string; bgColor: string }> = {
  "todo": { label: "To Do", labelZh: "待办", icon: Circle, color: "#6b7280", bgColor: "rgba(107,114,128,0.12)" },
  "in-progress": { label: "In Progress", labelZh: "进行中", icon: Play, color: "#3b82f6", bgColor: "rgba(59,130,246,0.12)" },
  "review": { label: "Review", labelZh: "审核中", icon: Eye, color: "#8b5cf6", bgColor: "rgba(139,92,246,0.12)" },
  "done": { label: "Done", labelZh: "已完成", icon: CheckCircle2, color: "#22c55e", bgColor: "rgba(34,197,94,0.12)" },
  "blocked": { label: "Blocked", labelZh: "已阻塞", icon: Ban, color: "#ef4444", bgColor: "rgba(239,68,68,0.12)" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; labelZh: string; color: string; icon: string }> = {
  critical: { label: "Critical", labelZh: "紧急", color: "#ef4444", icon: "!!" },
  high: { label: "High", labelZh: "高", color: "#f97316", icon: "!" },
  medium: { label: "Medium", labelZh: "中", color: "#eab308", icon: "-" },
  low: { label: "Low", labelZh: "低", color: "#22c55e", icon: "~" },
};

const TYPE_CONFIG: Record<TaskType, { label: string; labelZh: string; color: string }> = {
  feature: { label: "Feature", labelZh: "功能", color: "#3b82f6" },
  bug: { label: "Bug", labelZh: "缺陷", color: "#ef4444" },
  refactor: { label: "Refactor", labelZh: "重构", color: "#8b5cf6" },
  test: { label: "Test", labelZh: "测试", color: "#f97316" },
  documentation: { label: "Docs", labelZh: "文档", color: "#06b6d4" },
  other: { label: "Other", labelZh: "其他", color: "#6b7280" },
};

const KANBAN_COLUMNS: TaskStatus[] = ["todo", "in-progress", "review", "done", "blocked"];

// ==========================================
// Zustand Store with Persist
// ==========================================

const INITIAL_TASKS: Task[] = (() => {
  const now = Date.now();
  return [
    {
      id: "t1", title: "实现用户认证模块", description: "集成 OAuth2.0 + JWT，支持多种登录方式（邮箱、手机号、微信扫码）",
      status: "in-progress" as TaskStatus, priority: "critical" as TaskPriority, type: "feature" as TaskType,
      createdAt: now - 86400000 * 3, updatedAt: now - 3600000,
      dueDate: now + 86400000 * 2, estimatedHours: 16, actualHours: 8,
      relatedFiles: ["src/auth/provider.ts", "src/middleware/jwt.ts"],
      tags: ["auth", "security", "P0"],
      subtasks: [
        { id: "st1", title: "JWT Token 签发/验证", isCompleted: true, createdAt: now - 86400000 * 3 },
        { id: "st2", title: "OAuth2.0 Provider 集成", isCompleted: true, createdAt: now - 86400000 * 3 },
        { id: "st3", title: "微信扫码登录适配", isCompleted: false, createdAt: now - 86400000 * 2 },
        { id: "st4", title: "Token 刷新机制", isCompleted: false, createdAt: now - 86400000 * 2 },
      ],
      dependencies: [], blocking: ["t5"], isArchived: false, source: "manual" as const,
    },
    {
      id: "t2", title: "修复数据看板图表渲染异常", description: "Recharts 在窗口 resize 时偶现空白，需添加 ResponsiveContainer 和防抖处理",
      status: "todo" as TaskStatus, priority: "high" as TaskPriority, type: "bug" as TaskType,
      createdAt: now - 86400000 * 2, updatedAt: now - 86400000,
      dueDate: now + 86400000, estimatedHours: 4,
      relatedFiles: ["src/components/dashboard-page.tsx"],
      tags: ["bug", "UI", "charts"], isArchived: false, source: "ai-inferred" as const, confidence: 0.92,
    },
    {
      id: "t3", title: "优化 AI 模型调用缓存策略", description: "引入 LRU 缓存减少重复 API 调用，预估节省 40% token 消耗",
      status: "review" as TaskStatus, priority: "medium" as TaskPriority, type: "refactor" as TaskType,
      createdAt: now - 86400000 * 5, updatedAt: now - 7200000,
      estimatedHours: 8, actualHours: 6,
      relatedFiles: ["src/ai/cache.ts", "src/ai/provider.ts"],
      tags: ["performance", "AI", "cache"],
      subtasks: [
        { id: "st5", title: "设计 LRU 缓存模块", isCompleted: true, createdAt: now - 86400000 * 5 },
        { id: "st6", title: "集成到 Provider Manager", isCompleted: true, createdAt: now - 86400000 * 4 },
        { id: "st7", title: "编写性能测试", isCompleted: false, createdAt: now - 86400000 * 3 },
      ],
      isArchived: false, source: "manual" as const,
    },
    {
      id: "t4", title: "编写 API 接口测试用例", description: "为核心 RESTful 接口编写 Jest 单元测试，覆盖率目标 ≥85%",
      status: "todo" as TaskStatus, priority: "medium" as TaskPriority, type: "test" as TaskType,
      createdAt: now - 86400000, updatedAt: now - 86400000,
      estimatedHours: 12, relatedFiles: ["src/api/**/*.test.ts"],
      tags: ["test", "quality", "API"], isArchived: false, source: "manual" as const,
    },
    {
      id: "t5", title: "完善 i18n 多语言支持", description: "补全日语、韩语语言包；修复动态插值变量在 RTL 布局下的显示问题",
      status: "blocked" as TaskStatus, priority: "low" as TaskPriority, type: "feature" as TaskType,
      createdAt: now - 86400000 * 4, updatedAt: now - 86400000 * 2,
      estimatedHours: 6, relatedFiles: ["src/locales/ja.ts", "src/locales/ko.ts"],
      tags: ["i18n", "localization"], dependencies: ["t1"],
      isArchived: false, source: "ai-inferred" as const, confidence: 0.85,
    },
    {
      id: "t6", title: "升级 Tailwind CSS v4 配置", description: "迁移至 v4 新语法，移除已废弃的 @apply 用法，启用原生 CSS 变量主题",
      status: "done" as TaskStatus, priority: "medium" as TaskPriority, type: "refactor" as TaskType,
      createdAt: now - 86400000 * 7, updatedAt: now - 86400000,
      estimatedHours: 4, actualHours: 3, relatedFiles: ["src/styles/theme.css"],
      tags: ["infra", "CSS", "migration"], isArchived: false, source: "manual" as const,
    },
    {
      id: "t7", title: "实现智能表单拖拽排序", description: "使用 react-dnd 实现表单字段拖拽重排，支持嵌套分组",
      status: "todo" as TaskStatus, priority: "high" as TaskPriority, type: "feature" as TaskType,
      createdAt: now - 86400000, updatedAt: now - 3600000 * 4,
      dueDate: now + 86400000 * 3, estimatedHours: 10,
      relatedFiles: ["src/components/smart-form-system.tsx"],
      tags: ["DnD", "forms", "UX"], isArchived: false, source: "manual" as const,
    },
    {
      id: "t8", title: "编写组件库 Storybook 文档", description: "为所有液态玻璃/赛博朋克组件编写交互式 Storybook stories",
      status: "todo" as TaskStatus, priority: "low" as TaskPriority, type: "documentation" as TaskType,
      createdAt: now - 86400000 * 2, updatedAt: now - 86400000 * 2,
      estimatedHours: 8, tags: ["docs", "storybook", "components"],
      isArchived: false, source: "ai-inferred" as const, confidence: 0.78,
    },
    {
      id: "t9", title: "修复移动端侧边栏遮挡问题", description: "sidebar overlay 在 iOS Safari 下未正确触发 pointer-events",
      status: "in-progress" as TaskStatus, priority: "high" as TaskPriority, type: "bug" as TaskType,
      createdAt: now - 86400000, updatedAt: now - 1800000,
      dueDate: now + 86400000, estimatedHours: 3, actualHours: 1.5,
      relatedFiles: ["src/components/cyberpunk-standalone.tsx"],
      tags: ["mobile", "bug", "iOS"], isArchived: false, source: "manual" as const,
    },
    {
      id: "t10", title: "集成 Sentry 错误监控", description: "接入 Sentry SDK，配置 sourcemap 上传和告警规则",
      status: "done" as TaskStatus, priority: "medium" as TaskPriority, type: "feature" as TaskType,
      createdAt: now - 86400000 * 10, updatedAt: now - 86400000 * 3,
      estimatedHours: 5, actualHours: 4, tags: ["monitoring", "infra", "Sentry"],
      isArchived: false, source: "manual" as const,
    },
  ];
})();

const INITIAL_REMINDERS: Reminder[] = (() => {
  const now = Date.now();
  return [
    { id: "r1", taskId: "t1", type: "deadline" as ReminderType, message: "用户认证模块将在 2 天后到期", remindAt: now + 3600000, isTriggered: false, isRead: false, createdAt: now - 3600000 },
    { id: "r2", taskId: "t2", type: "deadline" as ReminderType, message: "图表渲染修复明天截止", remindAt: now + 3600000 * 2, isTriggered: false, isRead: false, createdAt: now - 7200000 },
    { id: "r3", taskId: "t5", type: "blocking" as ReminderType, message: "i18n 任务被认证模块阻塞", remindAt: now, isTriggered: true, isRead: false, createdAt: now - 86400000 },
    { id: "r4", taskId: "t3", type: "progress" as ReminderType, message: "AI 缓存优化进度已达 75%", remindAt: now, isTriggered: true, isRead: true, createdAt: now - 14400000 },
  ];
})();

// --- Zustand Task Store ---

interface TaskStoreState {
  tasks: Task[];
  reminders: Reminder[];
  _hydrated: boolean;
}

interface TaskStoreActions {
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "isArchived"> & { source?: Task["source"] }) => string;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  archiveTask: (taskId: string) => void;
  duplicateTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  reorderInColumn: (taskId: string, targetId: string, position: "before" | "after") => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  batchUpdateStatus: (taskIds: string[], status: TaskStatus) => void;
  batchDelete: (taskIds: string[]) => void;
  addReminder: (reminder: Omit<Reminder, "id" | "createdAt" | "isTriggered" | "isRead">) => void;
  dismissReminder: (reminderId: string) => void;
  seedIfEmpty: () => void;
}

const useTaskStore = create<TaskStoreState & TaskStoreActions>()(
  persist(
    (set, get) => ({
      tasks: [],
      reminders: [],
      _hydrated: false,

      addTask: (taskData) => {
        const id = crypto.randomUUID();
        const newTask: Task = {
          ...taskData,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isArchived: false,
          source: taskData.source ?? "manual",
        };
        set((s) => ({ tasks: [...s.tasks, newTask] }));
        return id;
      },

      updateTask: (taskId, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t),
        }));
      },

      deleteTask: (taskId) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== taskId),
          reminders: s.reminders.filter((r) => r.taskId !== taskId),
        }));
      },

      archiveTask: (taskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? { ...t, isArchived: true, updatedAt: Date.now() } : t),
        }));
      },

      duplicateTask: (taskId) => {
        const src = get().tasks.find((t) => t.id === taskId);
        if (!src) return;
        const dup: Task = {
          ...src,
          id: crypto.randomUUID(),
          title: `${src.title} (Copy)`,
          status: "todo",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isArchived: false,
          source: "manual",
          subtasks: src.subtasks?.map((st) => ({ ...st, id: crypto.randomUUID(), isCompleted: false })),
        };
        set((s) => ({ tasks: [...s.tasks, dup] }));
      },

      moveTask: (taskId, newStatus) => {
        const task = get().tasks.find((t) => t.id === taskId);
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus, updatedAt: Date.now() } : t),
        }));
        // Dispatch browser notification via custom event
        if (task) {
          window.dispatchEvent(new CustomEvent("yyc3-task-moved", {
            detail: { taskId, taskTitle: task.title, from: task.status, to: newStatus },
          }));
        }
      },

      reorderInColumn: (taskId, targetId, position) => {
        set((s) => {
          const tasks = [...s.tasks];
          const srcIdx = tasks.findIndex((t) => t.id === taskId);
          const tgtIdx = tasks.findIndex((t) => t.id === targetId);
          if (srcIdx === -1 || tgtIdx === -1 || srcIdx === tgtIdx) return s;
          const [moved] = tasks.splice(srcIdx, 1);
          const insertIdx = tasks.findIndex((t) => t.id === targetId);
          tasks.splice(position === "before" ? insertIdx : insertIdx + 1, 0, moved);
          return { tasks };
        });
      },

      addSubtask: (taskId, title) => {
        const st: SubTask = { id: crypto.randomUUID(), title, isCompleted: false, createdAt: Date.now() };
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === taskId ? { ...t, subtasks: [...(t.subtasks ?? []), st], updatedAt: Date.now() } : t),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              subtasks: t.subtasks?.map((st) => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return { ...t, subtasks: t.subtasks?.filter((st) => st.id !== subtaskId), updatedAt: Date.now() };
          }),
        }));
      },

      batchUpdateStatus: (taskIds, status) => {
        set((s) => ({
          tasks: s.tasks.map((t) => taskIds.includes(t.id) ? { ...t, status, updatedAt: Date.now() } : t),
        }));
      },

      batchDelete: (taskIds) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => !taskIds.includes(t.id)),
          reminders: s.reminders.filter((r) => !taskIds.includes(r.taskId)),
        }));
      },

      addReminder: (data) => {
        const r: Reminder = { ...data, id: crypto.randomUUID(), createdAt: Date.now(), isTriggered: false, isRead: false };
        set((s) => ({ reminders: [...s.reminders, r] }));
      },

      dismissReminder: (reminderId) => {
        set((s) => ({
          reminders: s.reminders.map((r) => r.id === reminderId ? { ...r, isRead: true } : r),
        }));
      },

      seedIfEmpty: () => {
        const { tasks, reminders } = get();
        if (tasks.length === 0) {
          set({ tasks: INITIAL_TASKS, reminders: INITIAL_REMINDERS, _hydrated: true });
        } else {
          set({ _hydrated: true });
        }
      },
    }),
    {
      name: "yyc3-task-board-storage",
      partialize: (state) => ({
        tasks: state.tasks,
        reminders: state.reminders,
      }),
      onRehydrateStorage: () => (state) => {
        state?.seedIfEmpty();
      },
    }
  )
);

// ==========================================
// AI Task Inference Engine (Simulated)
// ==========================================

const CONVERSATION_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: "实现 WebSocket 实时通知推送",
    description: "当前系统依赖轮询获取通知，延迟较高。需要接入 WebSocket 实现毫秒级推送，支持断线重连和消息队列。",
    type: "feature", priority: "high", confidence: 0.93,
    reasoning: "对话中多次提及\"实时通知\"和\"推送延迟\"问题，推断为高优先级功能需求",
    tags: ["websocket", "realtime", "notification"], estimatedHours: 12,
    relatedFiles: ["src/services/notification.ts", "src/hooks/useWebSocket.ts"],
  },
  {
    title: "添加 API 请求速率限制中间��",
    description: "检测到多处未设防的 API 端点，需要实现 Token Bucket 限流算法，防止恶意请求导致服务降级。",
    type: "feature", priority: "high", confidence: 0.91,
    reasoning: "对话分析发现安全性讨论，提到\"API滥用\"和\"限流\"关键词",
    tags: ["security", "API", "middleware"], estimatedHours: 6,
    relatedFiles: ["src/middleware/rateLimit.ts"],
  },
  {
    title: "修复用户会话并发冲突",
    description: "同一用户多端登录时出现数据覆盖问题，需实现乐观锁或版本控制机制。",
    type: "bug", priority: "critical", confidence: 0.88,
    reasoning: "对话中明确描述了\"多端登录冲突\"的 bug 现象",
    tags: ["bug", "session", "concurrency"], estimatedHours: 8,
  },
];

const CODE_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: "重构 TODO: 移除硬编码的 API 端点",
    description: "代码扫描发现 15 处硬编码 URL，应迁移至环境变量配置，提升部署灵活性。",
    type: "refactor", priority: "medium", confidence: 0.95,
    reasoning: "代码中发现大量 // TODO: move to env config 注释",
    tags: ["refactor", "config", "env"], estimatedHours: 3,
    relatedFiles: ["src/api/endpoints.ts", "src/config/env.ts"],
  },
  {
    title: "修复 FIXME: 内存泄漏 - useEffect 清理",
    description: "多个组件中 useEffect 缺少清理函数，长时间运行后 EventListener 和 Timer 未释放。",
    type: "bug", priority: "high", confidence: 0.97,
    reasoning: "代码扫描发现 8 处 // FIXME: memory leak 注释",
    tags: ["bug", "memory", "useEffect"], estimatedHours: 4,
    relatedFiles: ["src/hooks/useInterval.ts", "src/components/dashboard-page.tsx"],
  },
  {
    title: "补全 TypeScript 严格模式类型定义",
    description: "tsconfig 启用 strict 后发现 23 处 implicit any，需要逐一添加类型注解。",
    type: "refactor", priority: "low", confidence: 0.94,
    reasoning: "代码分析检测到大量 @ts-ignore 和 any 类型使用",
    tags: ["typescript", "strict", "types"], estimatedHours: 5,
  },
  {
    title: "添加单元测试: 数据转换工具函数",
    description: "src/utils/transform.ts 包含 12 个工具函数但零测试覆盖，需编写 Jest 测试用例。",
    type: "test", priority: "medium", confidence: 0.89,
    reasoning: "代码覆盖率分析显示该模块测试覆盖率为 0%",
    tags: ["test", "jest", "utils"], estimatedHours: 4,
    relatedFiles: ["src/utils/transform.ts", "src/utils/__tests__/transform.test.ts"],
  },
];

const DESCRIPTION_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: "实现暗色/亮色主题切换过渡动画",
    description: "当前主题切换是瞬时的，用户体验生硬。添加 300ms 渐变过渡，包括背景色、文字颜色和边框的平滑变化。",
    type: "feature", priority: "low", confidence: 0.86,
    reasoning: "用户描述中提到\"主题切换太突兀\"",
    tags: ["UX", "theme", "animation"], estimatedHours: 3,
  },
  {
    title: "优化首屏加载性能 - 代码分割",
    description: "分析描述推断需要对路由级组件实施 React.lazy 动态导入，配合 Suspense 骨架屏降低 FCP。",
    type: "refactor", priority: "high", confidence: 0.92,
    reasoning: "描述中重点强调\"加载太慢\"和\"首屏白屏\"问题",
    tags: ["performance", "lazy", "code-splitting"], estimatedHours: 8,
    relatedFiles: ["src/app/App.tsx", "src/app/routes.ts"],
  },
];

/** Simulated AI inference engine */
class AIInferenceSimulator {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async inferFromConversation(text: string): Promise<TaskInferenceResult[]> {
    await this.delay(1500 + Math.random() * 1500);
    const count = 1 + Math.floor(Math.random() * 2);
    const results: TaskInferenceResult[] = [];
    const pool = [...CONVERSATION_INFERENCE_POOL];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      results.push({ ...pool[idx], confidence: 0.8 + Math.random() * 0.18 });
      pool.splice(idx, 1);
    }
    return results;
  }

  async inferFromCode(code: string): Promise<TaskInferenceResult[]> {
    await this.delay(2000 + Math.random() * 1000);
    const count = 2 + Math.floor(Math.random() * 2);
    const results: TaskInferenceResult[] = [];
    const pool = [...CODE_INFERENCE_POOL];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      results.push({ ...pool[idx], confidence: 0.85 + Math.random() * 0.14 });
      pool.splice(idx, 1);
    }
    return results;
  }

  async inferFromDescription(desc: string): Promise<TaskInferenceResult[]> {
    await this.delay(1000 + Math.random() * 1000);
    const pool = [...DESCRIPTION_INFERENCE_POOL];
    const count = 1 + Math.floor(Math.random() * pool.length);
    const results: TaskInferenceResult[] = [];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      results.push({ ...pool[idx], confidence: 0.82 + Math.random() * 0.16 });
      pool.splice(idx, 1);
    }
    return results;
  }
}

const aiInference = new AIInferenceSimulator();

// ==========================================
// Drag & Drop Task Card
// ==========================================

function DraggableTaskCard({
  task, tc, isSelected, onSelect, onEdit, onDelete, onArchive, onDuplicate,
}: {
  task: Task;
  tc: ReturnType<typeof useThemeColors>;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const moveTask = useTaskStore((s) => s.moveTask);
  const reorderInColumn = useTaskStore((s) => s.reorderInColumn);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_ITEM_TYPE,
    item: () => ({ id: task.id, status: task.status }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  // Intra-column reorder drop target
  const [{ isOverReorder }, reorderDrop] = useDrop({
    accept: DND_ITEM_TYPE,
    canDrop: (item: { id: string; status: TaskStatus }) => item.id !== task.id && item.status === task.status,
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.id !== task.id && item.status === task.status) {
        reorderInColumn(item.id, task.id, "before");
      }
    },
    collect: (monitor) => ({
      isOverReorder: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  });

  const pCfg = PRIORITY_CONFIG[task.priority];
  const tCfg = TYPE_CONFIG[task.type];
  const completedSubs = task.subtasks?.filter((s) => s.isCompleted).length ?? 0;
  const totalSubs = task.subtasks?.length ?? 0;
  const subProgress = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0;
  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== "done";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  return (
    <div
      ref={(node) => { preview(reorderDrop(node)); }}
      className="rounded-xl border p-3 cursor-grab group relative transition-all"
      style={{
        background: isSelected ? `${pCfg.color}08` : tc.bgCard,
        borderColor: isOverReorder ? tc.primary : isSelected ? `${pCfg.color}40` : tc.borderDefault,
        boxShadow: isOverReorder ? `0 -2px 0 0 ${tc.primary}` : isSelected ? `0 0 12px ${pCfg.color}15` : "inset 0 1px 0 rgba(255,255,255,0.05)",
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? "rotate(3deg)" : "none",
      }}
      onClick={() => onSelect(task.id)}
    >
      {/* Drag handle */}
      <div ref={drag} className="absolute top-2 left-1 cursor-grab opacity-0 group-hover:opacity-40 transition-opacity">
        <GripVertical className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
      </div>

      {/* Priority bar */}
      <div className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full" style={{ background: pCfg.color, opacity: 0.6 }} />

      {/* Header: type + priority + menu */}
      <div className="flex items-center justify-between mb-2 mt-1 pl-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${tCfg.color}15`, color: tCfg.color, border: `1px solid ${tCfg.color}25` }}>
            {tCfg.label}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${pCfg.color}15`, color: pCfg.color, border: `1px solid ${pCfg.color}25` }}>
            {pCfg.icon} {pCfg.label}
          </span>
          {task.source === "ai-inferred" && (
            <span className="text-[8px] px-1 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
              AI {task.confidence ? `${Math.round(task.confidence * 100)}%` : ""}
            </span>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-7 z-50 w-40 rounded-xl border py-1 overflow-hidden"
                style={{ background: tc.bgElevated, borderColor: tc.borderDefault, boxShadow: tc.shadowLg }}
              >
                {[
                  { label: "Edit", icon: Edit3, color: tc.textSecondary, action: () => { onEdit(task); setShowMenu(false); } },
                  { label: "Duplicate", icon: Copy, color: tc.textSecondary, action: () => { onDuplicate(task.id); setShowMenu(false); } },
                  { label: "Archive", icon: Archive, color: "#f97316", action: () => { onArchive(task.id); setShowMenu(false); } },
                  { label: "Delete", icon: Trash2, color: "#ef4444", action: () => { onDelete(task.id); setShowMenu(false); } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => { e.stopPropagation(); item.action(); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors hover:bg-white/5"
                    style={{ color: item.color }}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t my-1" style={{ borderColor: tc.borderSubtle }} />
                <div className="px-3 py-1">
                  <p className="text-[9px] mb-1" style={{ color: tc.textMuted }}>Move to:</p>
                  <div className="flex flex-wrap gap-1">
                    {KANBAN_COLUMNS.filter((s) => s !== task.status).map((s) => (
                      <button
                        key={s}
                        onClick={(e) => { e.stopPropagation(); moveTask(task.id, s); setShowMenu(false); }}
                        className="text-[9px] px-1.5 py-0.5 rounded border transition-colors hover:bg-white/5"
                        style={{ color: STATUS_CONFIG[s].color, borderColor: `${STATUS_CONFIG[s].color}30` }}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <h4 className="text-[13px] mb-1 line-clamp-2 pl-3" style={{ color: tc.textPrimary }}>{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-[10px] mb-2 line-clamp-2 pl-3" style={{ color: tc.textMuted }}>{task.description}</p>
      )}

      {/* Subtask progress */}
      {totalSubs > 0 && (
        <div className="mb-2 pl-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px]" style={{ color: tc.textMuted }}>{completedSubs}/{totalSubs} subtasks</span>
            <span className="text-[9px]" style={{ color: subProgress === 100 ? "#22c55e" : tc.textMuted }}>{Math.round(subProgress)}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${subProgress}%`, background: subProgress === 100 ? "#22c55e" : pCfg.color }} />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 pl-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: tc.textMuted, border: "1px solid rgba(255,255,255,0.06)" }}>
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && <span className="text-[8px] px-1 py-0.5" style={{ color: tc.textMuted }}>+{task.tags.length - 3}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pl-3">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: isOverdue ? "#ef4444" : tc.textMuted }}>
              <Calendar className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: tc.textMuted }}>
              <Timer className="w-3 h-3" />{task.actualHours ? `${task.actualHours}/${task.estimatedHours}h` : `${task.estimatedHours}h`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {task.relatedFiles && task.relatedFiles.length > 0 && (
            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: tc.textMuted }}>
              <FileCode className="w-3 h-3" />{task.relatedFiles.length}
            </span>
          )}
          {(task.dependencies?.length ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: "#f97316" }}>
              <Layers className="w-3 h-3" />{task.dependencies!.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Droppable Kanban Column
// ==========================================

function DroppableKanbanColumn({
  status, tasks, tc, selectedIds, onSelect, onEdit, onDelete, onArchive, onDuplicate,
}: {
  status: TaskStatus;
  tasks: Task[];
  tc: ReturnType<typeof useThemeColors>;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const moveTask = useTaskStore((s) => s.moveTask);
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        moveTask(item.id, status);
      }
    },
    canDrop: (item: { id: string; status: TaskStatus }) => item.status !== status,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}>
            <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
          </div>
          <span className="text-[12px]" style={{ color: tc.textPrimary }}>{cfg.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${cfg.color}12`, color: cfg.color }}>{tasks.length}</span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={drop}
        className="flex-1 space-y-2 p-2 rounded-xl border min-h-[120px] overflow-y-auto transition-all duration-200"
        style={{
          background: isActive ? `${cfg.color}18` : cfg.bgColor,
          borderColor: isActive ? `${cfg.color}50` : `${cfg.color}15`,
          boxShadow: isActive ? `inset 0 0 20px ${cfg.color}15, 0 0 15px ${cfg.color}10` : "none",
          transform: isActive ? "scale(1.01)" : "scale(1)",
        }}
      >
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            tc={tc}
            isSelected={selectedIds.has(task.id)}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Icon className="w-6 h-6 mb-1" style={{ color: cfg.color }} />
            <span className="text-[10px]" style={{ color: tc.textMuted }}>
              {isActive ? "Drop here" : "No tasks"}
            </span>
          </div>
        )}
        {/* Drop indicator when dragging over */}
        {isActive && tasks.length > 0 && (
          <div className="rounded-lg border-2 border-dashed py-3 text-center transition-all" style={{ borderColor: `${cfg.color}50` }}>
            <span className="text-[10px]" style={{ color: cfg.color }}>Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Task Modal (Create / Edit)
// ==========================================

function TaskModal({
  tc, task, onSave, onClose,
}: {
  tc: ReturnType<typeof useThemeColors>;
  task: Task | null;
  onSave: (data: Partial<Task>) => void;
  onClose: () => void;
}) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [type, setType] = useState<TaskType>(task?.type ?? "feature");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo");
  const [tagsInput, setTagsInput] = useState(task?.tags?.join(", ") ?? "");
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours?.toString() ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");

  const handleSubmit = () => {
    if (!title.trim()) return;
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    onSave({
      ...(task ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      priority, type, status,
      tags: tags.length > 0 ? tags : undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    });
  };

  const inputStyle = { background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary };
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = `${tc.primary}50`;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${tc.primary}15`;
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = tc.borderDefault;
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="relative w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ background: tc.bgElevated, borderColor: tc.borderDefault, boxShadow: tc.shadowLg }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: tc.borderSubtle }}>
          <div className="flex items-center gap-2">
            {isEdit ? <Edit3 className="w-4 h-4" style={{ color: tc.primary }} /> : <Plus className="w-4 h-4" style={{ color: tc.primary }} />}
            <span className="text-sm" style={{ color: tc.textPrimary }}>{isEdit ? "Edit Task" : "Create Task"}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10">
            <X className="w-4 h-4" style={{ color: tc.textMuted }} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title..." className="w-full px-3 py-2 text-[13px] rounded-xl border outline-none transition-all" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." rows={3} className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none transition-all resize-none" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Priority</label>
              <div className="flex flex-col gap-1">
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                  <button key={p} onClick={() => setPriority(p)} className="text-[10px] px-2 py-1 rounded-lg border text-left transition-all"
                    style={{ background: priority === p ? `${PRIORITY_CONFIG[p].color}15` : "transparent", borderColor: priority === p ? `${PRIORITY_CONFIG[p].color}40` : tc.borderSubtle, color: priority === p ? PRIORITY_CONFIG[p].color : tc.textMuted }}>
                    {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Type</label>
              <div className="flex flex-col gap-1">
                {(Object.keys(TYPE_CONFIG) as TaskType[]).map((tp) => (
                  <button key={tp} onClick={() => setType(tp)} className="text-[10px] px-2 py-1 rounded-lg border text-left transition-all"
                    style={{ background: type === tp ? `${TYPE_CONFIG[tp].color}15` : "transparent", borderColor: type === tp ? `${TYPE_CONFIG[tp].color}40` : tc.borderSubtle, color: type === tp ? TYPE_CONFIG[tp].color : tc.textMuted }}>
                    {TYPE_CONFIG[tp].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Status</label>
              <div className="flex flex-col gap-1">
                {KANBAN_COLUMNS.map((s) => {
                  const SIcon = STATUS_CONFIG[s].icon;
                  return (
                    <button key={s} onClick={() => setStatus(s)} className="text-[10px] px-2 py-1 rounded-lg border text-left transition-all flex items-center gap-1"
                      style={{ background: status === s ? `${STATUS_CONFIG[s].color}15` : "transparent", borderColor: status === s ? `${STATUS_CONFIG[s].color}40` : tc.borderSubtle, color: status === s ? STATUS_CONFIG[s].color : tc.textMuted }}>
                      <SIcon className="w-3 h-3" />{STATUS_CONFIG[s].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Est. Hours</label>
              <input type="number" min="0" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} placeholder="0" className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none" style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: tc.textMuted }}>Tags (comma separated)</label>
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="auth, security, P0" className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none" style={inputStyle} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: tc.borderSubtle }}>
          <button onClick={onClose} className="px-4 py-2 text-[12px] rounded-xl border transition-all hover:bg-white/5" style={{ borderColor: tc.borderDefault, color: tc.textMuted }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()} className="px-4 py-2 text-[12px] rounded-xl border transition-all"
            style={{ background: title.trim() ? tc.gradientButton : "rgba(255,255,255,0.05)", borderColor: title.trim() ? `${tc.primary}40` : tc.borderDefault, color: title.trim() ? "#fff" : tc.textMuted, opacity: title.trim() ? 1 : 0.5 }}>
            {isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// AI Inference Panel (with multiple modes)
// ==========================================

function AIInferencePanel({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const addTask = useTaskStore((s) => s.addTask);
  const [mode, setMode] = useState<"conversation" | "code" | "description">("conversation");
  const [input, setInput] = useState("");
  const [inferring, setInferring] = useState(false);
  const [results, setResults] = useState<TaskInferenceResult[]>([]);

  const placeholders: Record<string, string> = {
    conversation: "Paste AI conversation text here... e.g. \"We need to add rate limiting to the API and fix the WebSocket reconnection bug\"",
    code: "Paste code with TODO/FIXME comments... e.g.\n// TODO: implement retry logic\n// FIXME: memory leak in useEffect",
    description: "Describe the work to be done... e.g. \"Optimize the first load performance, implement code splitting with React.lazy\"",
  };

  const handleInfer = async () => {
    if (!input.trim() && results.length === 0) return;
    setInferring(true);
    setResults([]);
    try {
      let res: TaskInferenceResult[];
      if (mode === "conversation") res = await aiInference.inferFromConversation(input);
      else if (mode === "code") res = await aiInference.inferFromCode(input);
      else res = await aiInference.inferFromDescription(input);
      setResults(res);
    } catch {
      // ignore
    }
    setInferring(false);
  };

  const handleAccept = (r: TaskInferenceResult) => {
    addTask({
      title: r.title,
      description: r.description,
      status: "todo",
      priority: r.priority,
      type: r.type,
      tags: r.tags,
      estimatedHours: r.estimatedHours,
      relatedFiles: r.relatedFiles,
      source: "ai-inferred",
      confidence: r.confidence,
    });
    setResults((prev) => prev.filter((x) => x !== r));
  };

  const modeConfig = [
    { id: "conversation" as const, label: "Conversation", icon: MessageSquare, color: "#3b82f6" },
    { id: "code" as const, label: "Code Scan", icon: Code, color: "#22c55e" },
    { id: "description" as const, label: "Description", icon: Edit3, color: "#f97316" },
  ];

  return (
    <div className="rounded-xl border p-4 space-y-3" style={{ background: tc.bgCard, borderColor: tc.borderDefault }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: "#a78bfa" }} />
          <span className="text-[12px]" style={{ color: tc.textPrimary }}>AI Task Inference</span>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-1">
        {modeConfig.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setResults([]); }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all"
            style={{
              background: mode === m.id ? `${m.color}12` : "transparent",
              borderColor: mode === m.id ? `${m.color}30` : tc.borderSubtle,
              color: mode === m.id ? m.color : tc.textMuted,
            }}>
            <m.icon className="w-3 h-3" />{m.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <textarea
        value={input} onChange={(e) => setInput(e.target.value)}
        placeholder={placeholders[mode]}
        rows={3}
        className="w-full px-3 py-2 text-[11px] rounded-xl border outline-none resize-none transition-all"
        style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#a78bfa50"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(167,139,250,0.1)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = tc.borderDefault; e.currentTarget.style.boxShadow = "none"; }}
      />

      <button onClick={handleInfer} disabled={inferring || !input.trim()}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] px-3 py-2 rounded-xl border transition-all"
        style={{
          background: inferring ? "transparent" : "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))",
          borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa",
          opacity: !input.trim() && !inferring ? 0.5 : 1,
        }}>
        {inferring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {inferring ? "AI Analyzing..." : `Infer Tasks from ${modeConfig.find((m) => m.id === mode)?.label}`}
      </button>

      {/* Results */}
      <AnimatePresence>
        {results.map((r, idx) => (
          <motion.div key={idx}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-xl border p-3"
            style={{ background: `${TYPE_CONFIG[r.type].color}06`, borderColor: `${TYPE_CONFIG[r.type].color}20` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <Sparkles className="w-3 h-3 shrink-0" style={{ color: PRIORITY_CONFIG[r.priority].color }} />
                  <span className="text-[12px] truncate" style={{ color: tc.textPrimary }}>{r.title}</span>
                </div>
                <p className="text-[10px] mb-1.5 line-clamp-2" style={{ color: tc.textMuted }}>{r.description}</p>
                <p className="text-[9px] italic mb-2" style={{ color: tc.textMuted }}>Reasoning: {r.reasoning}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${TYPE_CONFIG[r.type].color}15`, color: TYPE_CONFIG[r.type].color }}>{TYPE_CONFIG[r.type].label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${PRIORITY_CONFIG[r.priority].color}15`, color: PRIORITY_CONFIG[r.priority].color }}>{PRIORITY_CONFIG[r.priority].label}</span>
                  {r.estimatedHours && <span className="text-[9px]" style={{ color: tc.textMuted }}>{r.estimatedHours}h</span>}
                  <span className="text-[9px]" style={{ color: tc.textMuted }}>Confidence: {Math.round(r.confidence * 100)}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => handleAccept(r)} className="text-[9px] px-2 py-1 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(34,197,94,0.3)", color: "#22c55e" }}>
                  <Check className="w-3 h-3 inline mr-0.5" />Accept
                </button>
                <button onClick={() => setResults((prev) => prev.filter((_, i) => i !== idx))} className="text-[9px] px-2 py-1 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                  <X className="w-3 h-3 inline mr-0.5" />Dismiss
                </button>
              </div>
            </div>
            <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${r.confidence * 100}%` }}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }} style={{ background: PRIORITY_CONFIG[r.priority].color }} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// Reminders Panel
// ==========================================

function RemindersPanel({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const reminders = useTaskStore((s) => s.reminders);
  const tasks = useTaskStore((s) => s.tasks);
  const dismissReminder = useTaskStore((s) => s.dismissReminder);

  const unread = reminders.filter((r) => !r.isRead);
  const typeColors: Record<ReminderType, string> = { deadline: "#ef4444", dependency: "#f97316", blocking: "#eab308", progress: "#22c55e", custom: "#8b5cf6" };

  if (unread.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 space-y-2"
      style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.04))", borderColor: "rgba(239,68,68,0.2)" }}>
      <div className="flex items-center gap-2 mb-1">
        <BellRing className="w-4 h-4" style={{ color: "#ef4444" }} />
        <span className="text-[12px]" style={{ color: tc.textPrimary }}>Reminders ({unread.length})</span>
      </div>
      {unread.slice(0, 3).map((r) => {
        const task = tasks.find((t) => t.id === r.taskId);
        return (
          <div key={r.id} className="flex items-start justify-between gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(0,0,0,0.2)" }}>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: typeColors[r.type] }} />
              <div>
                <p className="text-[11px]" style={{ color: tc.textSecondary }}>{r.message}</p>
                {task && <p className="text-[9px] mt-0.5" style={{ color: tc.textMuted }}>{task.title}</p>}
              </div>
            </div>
            <button onClick={() => dismissReminder(r.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-3 h-3" style={{ color: tc.textMuted }} />
            </button>
          </div>
        );
      })}
    </motion.div>
  );
}

// ==========================================
// Stats View
// ==========================================

function TaskStats({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const tasks = useTaskStore((s) => s.tasks);
  const active = tasks.filter((t) => !t.isArchived);
  const total = active.length;
  const overdue = active.filter((t) => t.dueDate && t.dueDate < Date.now() && t.status !== "done").length;
  const aiInferred = active.filter((t) => t.source === "ai-inferred").length;
  const totalEstHours = active.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);

  const byStatus = KANBAN_COLUMNS.map((s) => ({ status: s, count: active.filter((t) => t.status === s).length, ...STATUS_CONFIG[s] }));
  const stats = [
    { label: "Total Tasks", value: total.toString(), icon: ClipboardList, color: tc.primary },
    { label: "Overdue", value: overdue.toString(), icon: AlertTriangle, color: "#ef4444" },
    { label: "AI Inferred", value: aiInferred.toString(), icon: Brain, color: "#a78bfa" },
    { label: "Est. Hours", value: `${totalEstHours}h`, icon: Timer, color: "#f97316" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border p-3 flex items-center gap-3" style={{ background: tc.bgCard, borderColor: tc.borderDefault }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[18px]" style={{ color: tc.textPrimary }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: tc.textMuted }}>{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-xl border p-4" style={{ background: tc.bgCard, borderColor: tc.borderDefault }}>
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>Status Distribution</p>
        <div className="space-y-2">
          {byStatus.map((s) => {
            const pct = total > 0 ? (s.count / total) * 100 : 0;
            return (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-[11px] w-20 shrink-0" style={{ color: s.color }}>{s.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} style={{ background: s.color }} />
                </div>
                <span className="text-[10px] w-8 text-right" style={{ color: tc.textMuted }}>{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border p-4" style={{ background: tc.bgCard, borderColor: tc.borderDefault }}>
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>Priority Breakdown</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
            const count = active.filter((t) => t.priority === p).length;
            const cfg = PRIORITY_CONFIG[p];
            return (
              <div key={p} className="text-center rounded-xl border p-2" style={{ background: `${cfg.color}08`, borderColor: `${cfg.color}20` }}>
                <p className="text-[16px]" style={{ color: cfg.color }}>{count}</p>
                <p className="text-[9px]" style={{ color: tc.textMuted }}>{cfg.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// List View
// ==========================================

function ListView({
  tasks, tc, selectedIds, onSelect, onEdit, onDelete,
}: {
  tasks: Task[];
  tc: ReturnType<typeof useThemeColors>;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: tc.bgCard, borderColor: tc.borderDefault }}>
      <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b text-[10px] uppercase tracking-wider" style={{ borderColor: tc.borderSubtle, color: tc.textMuted }}>
        <span className="col-span-1"></span>
        <span className="col-span-4">Title</span>
        <span className="col-span-1">Status</span>
        <span className="col-span-1">Priority</span>
        <span className="col-span-1">Type</span>
        <span className="col-span-1">Due</span>
        <span className="col-span-1">Est.</span>
        <span className="col-span-1">Source</span>
        <span className="col-span-1"></span>
      </div>
      {tasks.map((task, idx) => {
        const sCfg = STATUS_CONFIG[task.status];
        const pCfg = PRIORITY_CONFIG[task.priority];
        const tCfg = TYPE_CONFIG[task.type];
        const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== "done";
        const SIcon = sCfg.icon;
        return (
          <div key={task.id}
            className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b items-center cursor-pointer transition-colors hover:bg-white/[0.02] group"
            style={{ borderColor: tc.borderSubtle, background: selectedIds.has(task.id) ? `${pCfg.color}06` : "transparent" }}
            onClick={() => onSelect(task.id)}>
            <div className="col-span-1 flex items-center">
              <input type="checkbox" checked={selectedIds.has(task.id)} onChange={() => onSelect(task.id)} className="w-3.5 h-3.5 rounded border" style={{ accentColor: tc.primary }} onClick={(e) => e.stopPropagation()} />
            </div>
            <div className="col-span-4">
              <p className="text-[12px] truncate" style={{ color: tc.textPrimary }}>{task.title}</p>
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1 mt-0.5">
                  {task.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[8px] px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: tc.textMuted }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-1"><span className="flex items-center gap-1 text-[10px]" style={{ color: sCfg.color }}><SIcon className="w-3 h-3" />{sCfg.label}</span></div>
            <div className="col-span-1"><span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${pCfg.color}15`, color: pCfg.color }}>{pCfg.icon} {pCfg.label}</span></div>
            <div className="col-span-1"><span className="text-[10px]" style={{ color: tCfg.color }}>{tCfg.label}</span></div>
            <div className="col-span-1"><span className="text-[10px]" style={{ color: isOverdue ? "#ef4444" : tc.textMuted }}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) : "-"}</span></div>
            <div className="col-span-1"><span className="text-[10px]" style={{ color: tc.textMuted }}>{task.estimatedHours ? `${task.estimatedHours}h` : "-"}</span></div>
            <div className="col-span-1">
              {task.source === "ai-inferred" ? <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>AI</span> : <span className="text-[8px]" style={{ color: tc.textMuted }}>Manual</span>}
            </div>
            <div className="col-span-1 flex items-center justify-end gap-1">
              <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"><Edit3 className="w-3 h-3" style={{ color: tc.textMuted }} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"><Trash2 className="w-3 h-3" style={{ color: "#ef4444" }} /></button>
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && (
        <div className="text-center py-12" style={{ color: tc.textMuted }}>
          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No tasks match your filters</p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Main Page Component
// ==========================================

export function TaskBoardPage() {
  const tc = useThemeColors();
  const { t } = useI18n();

  // Zustand store selectors
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const archiveTask = useTaskStore((s) => s.archiveTask);
  const duplicateTask = useTaskStore((s) => s.duplicateTask);
  const batchUpdateStatus = useTaskStore((s) => s.batchUpdateStatus);
  const batchDelete = useTaskStore((s) => s.batchDelete);
  const seedIfEmpty = useTaskStore((s) => s.seedIfEmpty);

  // Seed on mount if empty
  useEffect(() => { seedIfEmpty(); }, [seedIfEmpty]);

  // Browser Notification API — listen for task move events via window.dispatchEvent
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const STATUS_LABELS: Record<string, string> = {
      todo: "To Do", "in-progress": "In Progress", review: "Review", done: "Done", blocked: "Blocked",
    };
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { taskTitle: string; from: string; to: string };
      if (!detail) return;
      const body = `"${detail.taskTitle}" → ${STATUS_LABELS[detail.to] ?? detail.to}`;
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("YYC³ Task Board", { body, icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📋</text></svg>" });
      }
    };
    window.addEventListener("yyc3-task-moved", handler);
    return () => window.removeEventListener("yyc3-task-moved", handler);
  }, []);

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | undefined>();
  const [filterPriority, setFilterPriority] = useState<TaskPriority | undefined>();
  const [filterType, setFilterType] = useState<TaskType | undefined>();
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "dueDate" | "createdAt">("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalTask, setModalTask] = useState<Task | null | "new">(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSave = useCallback((data: Partial<Task>) => {
    if (data.id) {
      updateTask(data.id, data);
    } else {
      addTask({
        title: data.title ?? "",
        description: data.description,
        status: data.status ?? "todo",
        priority: data.priority ?? "medium",
        type: data.type ?? "feature",
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        tags: data.tags,
        source: "manual" as const,
      });
    }
    setModalTask(null);
  }, [addTask, updateTask]);

  const handleBatchDelete = useCallback(() => {
    batchDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds, batchDelete]);

  const handleBatchStatus = useCallback((status: TaskStatus) => {
    batchUpdateStatus(Array.from(selectedIds), status);
    setSelectedIds(new Set());
  }, [selectedIds, batchUpdateStatus]);

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => showArchived ? true : !t.isArchived);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some((tag) => tag.toLowerCase().includes(q)));
    }
    if (filterStatus) result = result.filter((t) => t.status === filterStatus);
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority);
    if (filterType) result = result.filter((t) => t.type === filterType);

    const priorityOrder: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "priority") cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      else if (sortBy === "dueDate") cmp = (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity);
      else cmp = a.createdAt - b.createdAt;
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority, filterType, showArchived, sortBy, sortOrder]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { "todo": [], "in-progress": [], "review": [], "done": [], "blocked": [] };
    for (const t of filteredTasks) if (map[t.status]) map[t.status].push(t);
    return map;
  }, [filteredTasks]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-5" style={{ background: tc.bgBase }}>
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(34,197,94,0.1))", border: "1px solid rgba(0,240,255,0.25)", boxShadow: "0 0 15px rgba(0,240,255,0.15)" }}>
                <Target className="w-5 h-5" style={{ color: "#00f0ff" }} />
              </div>
              <div>
                <h1 className="text-xl" style={{ color: tc.textPrimary }}>{t("nav.taskBoard")}</h1>
                <p className="text-[11px]" style={{ color: tc.textMuted }}>{t("taskBoard.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Persistence indicator */}
              <span className="text-[9px] px-2 py-1 rounded-full flex items-center gap-1" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                <CheckCircle2 className="w-3 h-3" /> Auto-saved
              </span>
              {/* View toggle */}
              <div className="flex items-center gap-0.5 rounded-lg border p-0.5" style={{ borderColor: tc.borderDefault, background: tc.bgCard }}>
                {([
                  { mode: "kanban" as ViewMode, icon: LayoutGrid, label: "Kanban" },
                  { mode: "list" as ViewMode, icon: List, label: "List" },
                  { mode: "stats" as ViewMode, icon: BarChart3, label: "Stats" },
                ]).map((v) => (
                  <button key={v.mode} onClick={() => setViewMode(v.mode)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-md transition-all"
                    style={{
                      background: viewMode === v.mode ? `${tc.primary}15` : "transparent",
                      color: viewMode === v.mode ? tc.primary : tc.textMuted,
                      border: viewMode === v.mode ? `1px solid ${tc.primary}30` : "1px solid transparent",
                    }}>
                    <v.icon className="w-3.5 h-3.5" />{v.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setModalTask("new")} className="flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-xl border transition-all"
                style={{ background: tc.gradientButton, borderColor: `${tc.primary}40`, color: "#fff", boxShadow: `0 0 12px ${tc.primary}20` }}>
                <Plus className="w-3.5 h-3.5" />New Task
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reminders */}
        <RemindersPanel tc={tc} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tc.textMuted }} />
            <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[12px] rounded-xl border outline-none transition-all"
              style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}
              onFocus={(e) => { e.currentTarget.style.borderColor = `${tc.primary}50`; e.currentTarget.style.boxShadow = `0 0 0 3px ${tc.primary}15`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = tc.borderDefault; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg border transition-all"
              style={{ background: showFilters ? `${tc.primary}10` : "transparent", borderColor: showFilters ? `${tc.primary}30` : tc.borderDefault, color: showFilters ? tc.primary : tc.textMuted }}>
              <Filter className="w-3.5 h-3.5" />Filters
            </button>
            <button onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")} className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: tc.borderDefault, color: tc.textMuted }}>
              {sortOrder === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
              {sortBy === "priority" ? "Priority" : sortBy === "dueDate" ? "Due Date" : "Created"}
            </button>
            {(["priority", "dueDate", "createdAt"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)} className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                style={{ background: sortBy === s ? `${tc.primary}10` : "transparent", borderColor: sortBy === s ? `${tc.primary}30` : tc.borderSubtle, color: sortBy === s ? tc.primary : tc.textMuted }}>
                {s === "priority" ? "Priority" : s === "dueDate" ? "Due" : "Created"}
              </button>
            ))}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l" style={{ borderColor: tc.borderSubtle }}>
                <span className="text-[10px] mr-1" style={{ color: tc.textMuted }}>{selectedIds.size} selected</span>
                {KANBAN_COLUMNS.map((s) => (
                  <button key={s} onClick={() => handleBatchStatus(s)} className="text-[8px] px-1.5 py-0.5 rounded border transition-all hover:bg-white/5"
                    style={{ borderColor: `${STATUS_CONFIG[s].color}30`, color: STATUS_CONFIG[s].color }} title={`Move to ${STATUS_CONFIG[s].label}`}>
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
                <button onClick={handleBatchDelete} className="text-[9px] px-1.5 py-0.5 rounded border transition-all hover:bg-white/5"
                  style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                  <Trash2 className="w-3 h-3 inline" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-2 p-3 rounded-xl border" style={{ background: tc.bgCard, borderColor: tc.borderDefault }}>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] mr-1" style={{ color: tc.textMuted }}>Status:</span>
                  <button onClick={() => setFilterStatus(undefined)} className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                    style={{ background: !filterStatus ? `${tc.primary}10` : "transparent", borderColor: !filterStatus ? `${tc.primary}30` : tc.borderSubtle, color: !filterStatus ? tc.primary : tc.textMuted }}>All</button>
                  {KANBAN_COLUMNS.map((s) => (
                    <button key={s} onClick={() => setFilterStatus(filterStatus === s ? undefined : s)} className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                      style={{ background: filterStatus === s ? `${STATUS_CONFIG[s].color}15` : "transparent", borderColor: filterStatus === s ? `${STATUS_CONFIG[s].color}30` : tc.borderSubtle, color: filterStatus === s ? STATUS_CONFIG[s].color : tc.textMuted }}>
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] mr-1" style={{ color: tc.textMuted }}>Priority:</span>
                  <button onClick={() => setFilterPriority(undefined)} className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                    style={{ background: !filterPriority ? `${tc.primary}10` : "transparent", borderColor: !filterPriority ? `${tc.primary}30` : tc.borderSubtle, color: !filterPriority ? tc.primary : tc.textMuted }}>All</button>
                  {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                    <button key={p} onClick={() => setFilterPriority(filterPriority === p ? undefined : p)} className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                      style={{ background: filterPriority === p ? `${PRIORITY_CONFIG[p].color}15` : "transparent", borderColor: filterPriority === p ? `${PRIORITY_CONFIG[p].color}30` : tc.borderSubtle, color: filterPriority === p ? PRIORITY_CONFIG[p].color : tc.textMuted }}>
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] mr-1" style={{ color: tc.textMuted }}>Type:</span>
                  <button onClick={() => setFilterType(undefined)} className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                    style={{ background: !filterType ? `${tc.primary}10` : "transparent", borderColor: !filterType ? `${tc.primary}30` : tc.borderSubtle, color: !filterType ? tc.primary : tc.textMuted }}>All</button>
                  {(Object.keys(TYPE_CONFIG) as TaskType[]).map((tp) => (
                    <button key={tp} onClick={() => setFilterType(filterType === tp ? undefined : tp)} className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                      style={{ background: filterType === tp ? `${TYPE_CONFIG[tp].color}15` : "transparent", borderColor: filterType === tp ? `${TYPE_CONFIG[tp].color}30` : tc.borderSubtle, color: filterType === tp ? TYPE_CONFIG[tp].color : tc.textMuted }}>
                      {TYPE_CONFIG[tp].label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowArchived(!showArchived)} className="text-[9px] px-2 py-1 rounded-lg border transition-all flex items-center gap-1"
                  style={{ background: showArchived ? "rgba(249,115,22,0.1)" : "transparent", borderColor: showArchived ? "rgba(249,115,22,0.3)" : tc.borderSubtle, color: showArchived ? "#f97316" : tc.textMuted }}>
                  <Archive className="w-3 h-3" />{showArchived ? "Showing Archived" : "Show Archived"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <div className="xl:col-span-3">
            {viewMode === "kanban" && (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((status) => (
                  <DroppableKanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    tc={tc}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onEdit={(t) => setModalTask(t)}
                    onDelete={deleteTask}
                    onArchive={archiveTask}
                    onDuplicate={duplicateTask}
                  />
                ))}
              </div>
            )}
            {viewMode === "list" && (
              <ListView tasks={filteredTasks} tc={tc} selectedIds={selectedIds} onSelect={handleSelect} onEdit={(t) => setModalTask(t)} onDelete={deleteTask} />
            )}
            {viewMode === "stats" && <TaskStats tc={tc} />}
          </div>

          {/* Right: AI Inference Panel */}
          <div className="space-y-4">
            <AIInferencePanel tc={tc} />
            <div className="rounded-xl border p-4"
              style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.05), rgba(139,92,246,0.03))", borderColor: "rgba(0,240,255,0.15)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" style={{ color: "#00f0ff" }} />
                <span className="text-[11px]" style={{ color: tc.textPrimary }}>Task Board Tips</span>
              </div>
              <ul className="space-y-1.5">
                {[
                  "Drag cards between columns to change status",
                  "Tasks are auto-saved to localStorage (Zustand)",
                  "AI Inference supports 3 modes: Conversation, Code, Description",
                  "Click cards to multi-select for batch operations",
                  "Overdue tasks are highlighted in red",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#00f0ff" }} />
                    <span className="text-[10px]" style={{ color: tc.textMuted }}>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Task Modal */}
        <AnimatePresence>
          {modalTask !== null && (
            <TaskModal tc={tc} task={modalTask === "new" ? null : modalTask} onSave={handleSave} onClose={() => setModalTask(null)} />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}
