---
@file: YYC3-P1-AI-任务看板交互.md
@description: AI聊天中任务看板交互功能设计和实现，包含任务管理、提醒、推理描述、快捷操作等
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-17
@updated: 2026-03-17
@status: stable
@tags: P1,AI,task-board,interaction
---

# YYC³ P1-AI - 任务看板交互

## 🤖 AI 角色定义

You are a senior AI interaction specialist and task management expert with deep expertise in AI-driven task tracking, intelligent task inference, and developer productivity enhancement.

### Your Role & Expertise

You are an experienced AI interaction specialist who specializes in:
- **Task Management**: Kanban boards, task tracking, task prioritization
- **AI Task Inference**: Automatic task extraction, task context understanding, task dependencies
- **Smart Reminders**: Intelligent notifications, context-aware reminders, deadline management
- **Developer Experience**: IDE integration, real-time task updates, task automation
- **Task Automation**: Auto-assignment, auto-prioritization, auto-escalation
- **Collaboration**: Task sharing, team coordination, progress tracking
- **Best Practices**: Task organization, workflow optimization, productivity enhancement

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
| @file | P1-核心功能/YYC3-P1-AI-任务看板交互.md |
| @description | AI聊天中任务看板交互功能设计和实现，包含任务管理、提醒、推理描述、快捷操作等 |
| @author | YanYuCloudCube Team <admin@0379.email> |
| @version | v1.0.0 |
| @created | 2026-03-17 |
| @updated | 2026-03-17 |
| @status | stable |
| @license | MIT |
| @copyright | Copyright (c) 2026 YanYuCloudCube Team |
| @tags P1,AI,task-board,interaction |

---

## 🎯 功能目标

实现智能任务看板交互系统，包括：
- ✅ 智能任务提取和推理
- ✅ 任务状态管理和跟踪
- ✅ 智能提醒和通知
- ✅ 快捷操作和批量处理
- ✅ 任务依赖和优先级管理
- ✅ 与AI对话深度集成

---

## 🏗️ 架构设计

### 1. 功能架构

```
TaskBoard/
├── TaskInference           # 任务推理引擎
├── TaskManager            # 任务管理器
├── TaskReminder           # 提醒系统
├── TaskActions            # 快捷操作
├── TaskDependencies       # 依赖管理
└── TaskIntegration        # AI集成
```

### 2. 数据流

```
AI Conversation (AI对话)
    ↓ Task Inference
Task Extraction (任务提取)
    ↓ Task Creation
TaskBoard (任务看板)
    ↓ Task Updates
Task Manager (任务管理器)
    ↓ Notifications
User (用户)
```

---

## 💾 核心类型定义

### 任务类型

```typescript
// src/types/task.ts

/**
 * 任务状态
 */
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';

/**
 * 任务优先级
 */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * 任务类型
 */
export type TaskType = 'feature' | 'bug' | 'refactor' | 'test' | 'documentation' | 'other';

/**
 * 提醒类型
 */
export type ReminderType = 'deadline' | 'dependency' | 'blocking' | 'progress' | 'custom';

/**
 * 任务接口
 */
export interface Task {
  /** 任务 ID */
  id: string;
  /** 任务标题 */
  title: string;
  /** 任务描述 */
  description?: string;
  /** 任务状态 */
  status: TaskStatus;
  /** 任务优先级 */
  priority: TaskPriority;
  /** 任务类型 */
  type: TaskType;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 截止时间 */
  dueDate?: number;
  /** 预估时间（小时） */
  estimatedHours?: number;
  /** 实际时间（小时） */
  actualHours?: number;
  /** 关联的AI消息ID */
  relatedMessageId?: string;
  /** 关联的代码文件 */
  relatedFiles?: string[];
  /** 任务标签 */
  tags?: string[];
  /** 子任务列表 */
  subtasks?: SubTask[];
  /** 依赖的任务ID列表 */
  dependencies?: string[];
  /** 阻塞的任务ID列表 */
  blocking?: string[];
  /** 分配的用户ID */
  assigneeId?: string;
  /** 是否已归档 */
  isArchived: boolean;
  /** 任务来源 */
  source: 'manual' | 'ai-inferred' | 'imported';
  /** AI推理置信度 */
  confidence?: number;
}

/**
 * 子任务接口
 */
export interface SubTask {
  /** 子任务 ID */
  id: string;
  /** 子任务标题 */
  title: string;
  /** 是否已完成 */
  isCompleted: boolean;
  /** 创建时间 */
  createdAt: number;
}

/**
 * 提醒接口
 */
export interface Reminder {
  /** 提醒 ID */
  id: string;
  /** 关联的任务ID */
  taskId: string;
  /** 提醒类型 */
  type: ReminderType;
  /** 提醒消息 */
  message: string;
  /** 提醒时间 */
  remindAt: number;
  /** 是否已触发 */
  isTriggered: boolean;
  /** 是否已读取 */
  isRead: boolean;
  /** 创建时间 */
  createdAt: number;
}

/**
 * 任务推理结果
 */
export interface TaskInference {
  /** 推理出的任务 */
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'source'>;
  /** 置信度 */
  confidence: number;
  /** 推理依据 */
  reasoning: string;
  /** 相关上下文 */
  context: string;
}
```

---

## 🧠 任务推理引擎

### 智能任务提取

```typescript
// src/ai/task/TaskInferenceEngine.ts
import { aiProviderManager } from '../AIProviderManager';
import type { TaskInference } from '@/types/task';

/**
 * 任务推理引擎类
 */
export class TaskInferenceEngine {
  /**
   * 从AI对话中提取任务
   */
  async inferTasksFromConversation(
    messages: Array<{ role: string; content: string }>
  ): Promise<TaskInference[]> {
    const prompt = this.buildInferencePrompt(messages);

    const config = {
      provider: await aiProviderManager.selectProvider(),
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(config);
    return this.parseTasksResponse(response.content);
  }

  /**
   * 从代码注释中提取任务
   */
  async inferTasksFromCode(code: string, language: string): Promise<TaskInference[]> {
    const prompt = this.buildCodeInferencePrompt(code, language);

    const config = {
      provider: await aiProviderManager.selectProvider(),
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 4096,
      stream: false,
    };

    const response = await aiProviderManager.request(config);
    return this.parseTasksResponse(response.content);
  }

  /**
   * 从用户描述中提取任务
   */
  async inferTasksFromDescription(description: string): Promise<TaskInference[]> {
    const prompt = this.buildDescriptionInferencePrompt(description);

    const config = {
      provider: await aiProviderManager.selectProvider(),
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(config);
    return this.parseTasksResponse(response.content);
  }

  /**
   * 推理任务依赖关系
   */
  async inferTaskDependencies(tasks: Task[]): Promise<Map<string, string[]>> {
    const prompt = this.buildDependencyInferencePrompt(tasks);

    const config = {
      provider: await aiProviderManager.selectProvider(),
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager. Analyze task dependencies.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(config);
    return this.parseDependenciesResponse(response.content);
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(): string {
    return `You are an expert project manager and task analyst. Extract tasks from conversations and code with high accuracy.

Task Types:
- feature: New features or enhancements
- bug: Bug fixes or error corrections
- refactor: Code refactoring or optimization
- test: Testing or quality assurance
- documentation: Documentation or comments
- other: Other types of tasks

Task Priorities:
- critical: Must be done immediately
- high: Should be done soon
- medium: Normal priority
- low: Can be done later

Task Status:
- todo: Not started
- in-progress: Currently working on
- review: Under review
- done: Completed
- blocked: Waiting for something

Extract tasks with:
1. Clear and concise titles
2. Detailed descriptions
3. Appropriate type and priority
4. Estimated time if possible
5. Related files or components
6. Confidence score (0-1)
7. Reasoning for the inference

Format your response as JSON array.`;
  }

  /**
   * 构建对话推理提示词
   */
  private buildInferencePrompt(messages: Array<{ role: string; content: string }>): string {
    const conversationText = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    return `Analyze the following conversation and extract all tasks mentioned:

${conversationText}

Extract tasks that:
1. Are explicitly mentioned as tasks, to-dos, or action items
2. Represent work that needs to be done
3. Have clear deliverables or outcomes
4. Are actionable and specific

For each task, provide:
- title: Brief task title
- description: Detailed description
- type: Task type
- priority: Task priority
- estimatedHours: Estimated time in hours
- relatedFiles: Related files or components (if mentioned)
- confidence: Confidence score (0-1)
- reasoning: Why this is a task
- context: Relevant context from the conversation`;
  }

  /**
   * 构建代码推理提示词
   */
  private buildCodeInferencePrompt(code: string, language: string): string {
    return `Analyze the following ${language} code and extract tasks from comments and TODOs:

\`\`\`${language}
${code}
\`\`\`

Extract tasks from:
1. TODO comments
2. FIXME comments
3. BUG comments
4. HACK comments
5. Other task-related comments

For each task, provide:
- title: Brief task title
- description: Detailed description
- type: Task type
- priority: Task priority
- estimatedHours: Estimated time in hours
- relatedFiles: File path or component name
- confidence: Confidence score (0-1)
- reasoning: Why this is a task
- context: Code context around the task`;
  }

  /**
   * 构建描述推理提示词
   */
  private buildDescriptionInferencePrompt(description: string): string {
    return `Analyze the following description and extract tasks:

${description}

Break down the description into:
1. Individual tasks
2. Subtasks if applicable
3. Dependencies between tasks
4. Appropriate priorities
5. Estimated time for each task

For each task, provide:
- title: Brief task title
- description: Detailed description
- type: Task type
- priority: Task priority
- estimatedHours: Estimated time in hours
- confidence: Confidence score (0-1)
- reasoning: Why this is a task
- context: Relevant context`;
  }

  /**
   * 构建依赖推理提示词
   */
  private buildDependencyInferencePrompt(tasks: Task[]): string {
    const tasksText = tasks
      .map((task, index) => `${index + 1}. ${task.title}: ${task.description || ''}`)
      .join('\n');

    return `Analyze the following tasks and identify dependencies:

${tasksText}

Identify:
1. Which tasks depend on others (must complete before starting)
2. Which tasks block others (must complete before others can start)
3. Critical path tasks
4. Parallelizable tasks

Format your response as a JSON object mapping task IDs to arrays of dependency task IDs.`;
  }

  /**
   * 解析任务响应
   */
  private parseTasksResponse(content: string): TaskInference[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tasks = JSON.parse(jsonMatch[0]);
        return tasks.map((task: any) => ({
          task: {
            title: task.title,
            description: task.description,
            status: 'todo',
            priority: task.priority || 'medium',
            type: task.type || 'other',
            estimatedHours: task.estimatedHours,
            relatedFiles: task.relatedFiles,
            tags: task.tags,
            subtasks: task.subtasks,
          },
          confidence: task.confidence || 0.8,
          reasoning: task.reasoning || '',
          context: task.context || '',
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to parse tasks response:', error);
      return [];
    }
  }

  /**
   * 解析依赖响应
   */
  private parseDependenciesResponse(content: string): Map<string, string[]> {
    try {
      const dependencies = JSON.parse(content);
      const dependencyMap = new Map<string, string[]>();

      for (const [taskId, deps] of Object.entries(dependencies)) {
        dependencyMap.set(taskId, deps as string[]);
      }

      return dependencyMap;
    } catch (error) {
      console.error('Failed to parse dependencies response:', error);
      return new Map();
    }
  }
}

export const taskInferenceEngine = new TaskInferenceEngine();
```

---

## 📋 任务管理器

### 任务管理服务

```typescript
// src/services/task/TaskManager.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, SubTask, Reminder } from '@/types/task';

interface TaskState {
  /** 任务列表 */
  tasks: Task[];
  /** 提醒列表 */
  reminders: Reminder[];
  /** 筛选状态 */
  filter: {
    status?: Task['status'];
    priority?: Task['priority'];
    type?: Task['type'];
    assigneeId?: string;
    tags?: string[];
  };
  /** 排序方式 */
  sortBy: 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  /** 排序方向 */
  sortOrder: 'asc' | 'desc';
}

interface TaskActions {
  /** 添加任务 */
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'source'>) => void;
  /** 更新任务 */
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  /** 删除任务 */
  deleteTask: (taskId: string) => void;
  /** 归档任务 */
  archiveTask: (taskId: string) => void;
  /** 添加子任务 */
  addSubtask: (taskId: string, subtask: Omit<SubTask, 'id' | 'createdAt'>) => void;
  /** 更新子任务 */
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  /** 删除子任务 */
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  /** 添加提醒 */
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'isTriggered' | 'isRead'>) => void;
  /** 标记提醒已读 */
  markReminderRead: (reminderId: string) => void;
  /** 删除提醒 */
  deleteReminder: (reminderId: string) => void;
  /** 更新筛选 */
  updateFilter: (filter: Partial<TaskState['filter']>) => void;
  /** 更新排序 */
  updateSort: (sortBy: TaskState['sortBy'], sortOrder: TaskState['sortOrder']) => void;
  /** 批量更新任务状态 */
  batchUpdateStatus: (taskIds: string[], status: Task['status']) => void;
  /** 批量删除任务 */
  batchDeleteTasks: (taskIds: string[]) => void;
}

export const useTaskStore = create<TaskState & TaskActions>()(
  persist(
    (set, get) => ({
      tasks: [],
      reminders: [],
      filter: {},
      sortBy: 'priority',
      sortOrder: 'asc',

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isArchived: false,
          source: 'manual',
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates, updatedAt: Date.now() } : task
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
          reminders: state.reminders.filter((reminder) => reminder.taskId !== taskId),
        }));
      },

      archiveTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, isArchived: true } : task
          ),
        }));
      },

      addSubtask: (taskId, subtask) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              const newSubtask: SubTask = {
                ...subtask,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
              };
              return {
                ...task,
                subtasks: [...(task.subtasks || []), newSubtask],
              };
            }
            return task;
          }),
        }));
      },

      updateSubtask: (taskId, subtaskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks?.map((subtask) =>
                  subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                ),
              };
            }
            return task;
          }),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks?.filter((subtask) => subtask.id !== subtaskId),
              };
            }
            return task;
          }),
        }));
      },

      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          isTriggered: false,
          isRead: false,
        };
        set((state) => ({
          reminders: [...state.reminders, newReminder],
        }));
      },

      markReminderRead: (reminderId) => {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === reminderId ? { ...reminder, isRead: true } : reminder
          ),
        }));
      },

      deleteReminder: (reminderId) => {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== reminderId),
        }));
      },

      updateFilter: (filter) => {
        set((state) => ({
          filter: { ...state.filter, ...filter },
        }));
      },

      updateSort: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
      },

      batchUpdateStatus: (taskIds, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            taskIds.includes(task.id) ? { ...task, status, updatedAt: Date.now() } : task
          ),
        }));
      },

      batchDeleteTasks: (taskIds) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !taskIds.includes(task.id)),
          reminders: state.reminders.filter(
            (reminder) => !taskIds.includes(reminder.taskId)
          ),
        }));
      },
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        reminders: state.reminders,
      }),
    }
  )
);
```

---

## 🔔 提醒系统

### 智能提醒服务

```typescript
// src/services/task/ReminderService.ts
import { useTaskStore } from '@/stores/useTaskStore';
import type { Reminder, Task } from '@/types/task';

/**
 * 提醒服务类
 */
export class ReminderService {
  private reminderTimers: Map<string, NodeJS.Timeout> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * 启动提醒系统
   */
  start(): void {
    // 每分钟检查一次提醒
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000);

    // 初始检查
    this.checkReminders();
  }

  /**
   * 停止提醒系统
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // 清除所有定时器
    for (const timer of this.reminderTimers.values()) {
      clearTimeout(timer);
    }
    this.reminderTimers.clear();
  }

  /**
   * 检查提醒
   */
  private checkReminders(): void {
    const { reminders, tasks, markReminderRead } = useTaskStore.getState();
    const now = Date.now();

    for (const reminder of reminders) {
      if (reminder.isTriggered || reminder.isRead) {
        continue;
      }

      if (reminder.remindAt <= now) {
        this.triggerReminder(reminder);
        markReminderRead(reminder.id);
      }
    }
  }

  /**
   * 触发提醒
   */
  private triggerReminder(reminder: Reminder): void {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === reminder.taskId);

    if (!task) {
      return;
    }

    // 发送通知
    this.sendNotification(reminder, task);

    // 播放提示音
    this.playSound(reminder.type);

    // 标记为已触发
    useTaskStore.getState().updateTask(reminder.taskId, {
      // 可以添加提醒标记
    });
  }

  /**
   * 发送通知
   */
  private sendNotification(reminder: Reminder, task: Task): void {
    const event = new CustomEvent('task-reminder', {
      detail: {
        reminder,
        task,
      },
    });
    window.dispatchEvent(event);

    // 使用浏览器通知 API
    if (Notification.permission === 'granted') {
      new Notification(task.title, {
        body: reminder.message,
        icon: '/icons/task-reminder.png',
        tag: reminder.id,
      });
    }
  }

  /**
   * 播放提示音
   */
  private playSound(type: Reminder['type']): void {
    const sounds: Record<Reminder['type'], string> = {
      deadline: '/sounds/deadline.mp3',
      dependency: '/sounds/dependency.mp3',
      blocking: '/sounds/blocking.mp3',
      progress: '/sounds/progress.mp3',
      custom: '/sounds/custom.mp3',
    };

    const audio = new Audio(sounds[type]);
    audio.volume = 0.5;
    audio.play().catch(console.error);
  }

  /**
   * 创建截止日期提醒
   */
  createDeadlineReminder(taskId: string, dueDate: number): void {
    const reminderTime = dueDate - 24 * 60 * 60 * 1000; // 提前24小时提醒

    const reminder: Omit<Reminder, 'id' | 'createdAt' | 'isTriggered' | 'isRead'> = {
      taskId,
      type: 'deadline',
      message: `任务即将在24小时后到期`,
      remindAt: reminderTime,
    };

    useTaskStore.getState().addReminder(reminder);

    // 设置定时器
    const timer = setTimeout(() => {
      this.triggerReminder({ ...reminder, id: '', createdAt: 0, isTriggered: false, isRead: false });
    }, reminderTime - Date.now());

    this.reminderTimers.set(reminder.taskId + '-deadline', timer);
  }

  /**
   * 创建依赖提醒
   */
  createDependencyReminder(taskId: string, dependencyTaskId: string): void {
    const { tasks } = useTaskStore.getState();
    const dependencyTask = tasks.find((t) => t.id === dependencyTaskId);

    if (!dependencyTask || dependencyTask.status === 'done') {
      return;
    }

    const reminder: Omit<Reminder, 'id' | 'createdAt' | 'isTriggered' | 'isRead'> = {
      taskId,
      type: 'dependency',
      message: `依赖任务 "${dependencyTask.title}" 已完成`,
      remindAt: Date.now(), // 立即提醒
    };

    useTaskStore.getState().addReminder(reminder);
  }

  /**
   * 创建阻塞提醒
   */
  createBlockingReminder(taskId: string, blockingTaskId: string): void {
    const { tasks } = useTaskStore.getState();
    const blockingTask = tasks.find((t) => t.id === blockingTaskId);

    if (!blockingTask || blockingTask.status !== 'blocked') {
      return;
    }

    const reminder: Omit<Reminder, 'id' | 'createdAt' | 'isTriggered' | 'isRead'> = {
      taskId,
      type: 'blocking',
      message: `任务被 "${blockingTask.title}" 阻塞`,
      remindAt: Date.now(),
    };

    useTaskStore.getState().addReminder(reminder);
  }

  /**
   * 创建进度提醒
   */
  createProgressReminder(taskId: string, progress: number): void {
    const reminder: Omit<Reminder, 'id' | 'createdAt' | 'isTriggered' | 'isRead'> = {
      taskId,
      type: 'progress',
      message: `任务进度已达到 ${progress}%`,
      remindAt: Date.now(),
    };

    useTaskStore.getState().addReminder(reminder);
  }
}

export const reminderService = new ReminderService();
```

---

## ⚡ 快捷操作

### 任务快捷操作服务

```typescript
// src/services/task/TaskActions.ts
import { useTaskStore } from '@/stores/useTaskStore';
import { clipboard } from '@tauri-apps/api/clipboard';
import type { Task } from '@/types/task';

/**
 * 任务快捷操作类
 */
export class TaskActions {
  /**
   * 复制任务
   */
  async copyTask(taskId: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const taskText = this.formatTaskForCopy(task);
    await clipboard.writeText(taskText);
  }

  /**
   * 格式化任务用于复制
   */
  private formatTaskForCopy(task: Task): string {
    let text = `# ${task.title}\n\n`;

    if (task.description) {
      text += `## 描述\n${task.description}\n\n`;
    }

    text += `## 状态\n${task.status}\n\n`;
    text += `## 优先级\n${task.priority}\n\n`;
    text += `## 类型\n${task.type}\n\n`;

    if (task.dueDate) {
      text += `## 截止日期\n${new Date(task.dueDate).toLocaleString('zh-CN')}\n\n`;
    }

    if (task.estimatedHours) {
      text += `## 预估时间\n${task.estimatedHours} 小时\n\n`;
    }

    if (task.tags && task.tags.length > 0) {
      text += `## 标签\n${task.tags.join(', ')}\n\n`;
    }

    if (task.subtasks && task.subtasks.length > 0) {
      text += `## 子任务\n`;
      task.subtasks.forEach((subtask, index) => {
        text += `${index + 1}. ${subtask.isCompleted ? '✓' : '○'} ${subtask.title}\n`;
      });
      text += '\n';
    }

    return text;
  }

  /**
   * 复制任务标题
   */
  async copyTaskTitle(taskId: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    await clipboard.writeText(task.title);
  }

  /**
   * 复制任务描述
   */
  async copyTaskDescription(taskId: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    await clipboard.writeText(task.description || '');
  }

  /**
   * 复制任务为Markdown
   */
  async copyTaskAsMarkdown(taskId: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const markdown = this.formatTaskAsMarkdown(task);
    await clipboard.writeText(markdown);
  }

  /**
   * 格式化任务为Markdown
   */
  private formatTaskAsMarkdown(task: Task): string {
    let markdown = `- [${task.status === 'done' ? 'x' : ' '}] ${task.title}\n`;

    if (task.description) {
      markdown += `  - ${task.description}\n`;
    }

    if (task.dueDate) {
      markdown += `  - 📅 ${new Date(task.dueDate).toLocaleDateString('zh-CN')}\n`;
    }

    if (task.priority) {
      const priorityEmoji: Record<Task['priority'], string> = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      };
      markdown += `  - ${priorityEmoji[task.priority]} ${task.priority}\n`;
    }

    return markdown;
  }

  /**
   * 复制任务为代码注释
   */
  async copyTaskAsCodeComment(taskId: string, language: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const comment = this.formatTaskAsCodeComment(task, language);
    await clipboard.writeText(comment);
  }

  /**
   * 格式化任务为代码注释
   */
  private formatTaskAsCodeComment(task: Task, language: string): string {
    const commentStyles: Record<string, { start: string; end: string }> = {
      javascript: { start: '// TODO: ', end: '' },
      typescript: { start: '// TODO: ', end: '' },
      python: { start: '# TODO: ', end: '' },
      java: { start: '// TODO: ', end: '' },
      go: { start: '// TODO: ', end: '' },
      rust: { start: '// TODO: ', end: '' },
      c: { start: '// TODO: ', end: '' },
      cpp: { start: '// TODO: ', end: '' },
      html: { start: '<!-- TODO: ', end: ' -->' },
      css: { start: '/* TODO: ', end: ' */' },
    };

    const style = commentStyles[language] || commentStyles.javascript;

    let comment = `${style.start}${task.title}`;

    if (task.description) {
      comment += ` - ${task.description}`;
    }

    if (task.priority) {
      comment += ` [${task.priority}]`;
    }

    comment += style.end;

    return comment;
  }

  /**
   * 替换任务
   */
  async replaceTask(taskId: string, newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'source'>): Promise<void> {
    const { updateTask } = useTaskStore.getState();

    updateTask(taskId, {
      ...newTask,
      updatedAt: Date.now(),
    });
  }

  /**
   * 分割任务
   */
  async splitTask(taskId: string): Promise<void> {
    const { tasks, addTask, updateTask } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // 创建子任务
    if (task.subtasks && task.subtasks.length > 0) {
      for (const subtask of task.subtasks) {
        if (!subtask.isCompleted) {
          addTask({
            title: subtask.title,
            description: task.description,
            status: 'todo',
            priority: task.priority,
            type: task.type,
            estimatedHours: task.estimatedHours ? task.estimatedHours / task.subtasks.length : undefined,
            relatedFiles: task.relatedFiles,
            tags: task.tags,
          });
        }
      }
    }

    // 标记原任务为已完成
    updateTask(taskId, { status: 'done' });
  }

  /**
   * 合并任务
   */
  async mergeTasks(taskIds: string[]): Promise<void> {
    const { tasks, addTask, deleteTask } = useTaskStore.getState();
    const tasksToMerge = tasks.filter((t) => taskIds.includes(t.id));

    if (tasksToMerge.length < 2) {
      throw new Error('At least 2 tasks required to merge');
    }

    // 创建合并后的任务
    const mergedTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'source'> = {
      title: `合并任务: ${tasksToMerge.map((t) => t.title).join(', ')}`,
      description: tasksToMerge.map((t) => `- ${t.title}: ${t.description || ''}`).join('\n'),
      status: 'todo',
      priority: this.getHighestPriority(tasksToMerge.map((t) => t.priority)),
      type: tasksToMerge[0].type,
      estimatedHours: tasksToMerge.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      relatedFiles: [...new Set(tasksToMerge.flatMap((t) => t.relatedFiles || []))],
      tags: [...new Set(tasksToMerge.flatMap((t) => t.tags || []))],
    };

    addTask(mergedTask);

    // 删除原任务
    for (const taskId of taskIds) {
      deleteTask(taskId);
    }
  }

  /**
   * 获取最高优先级
   */
  private getHighestPriority(priorities: Task['priority'][]): Task['priority'] {
    const priorityOrder: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

    for (const priority of priorityOrder) {
      if (priorities.includes(priority)) {
        return priority;
      }
    }

    return 'medium';
  }

  /**
   * 复制任务
   */
  async duplicateTask(taskId: string): Promise<void> {
    const { tasks, addTask } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    addTask({
      title: `${task.title} (副本)`,
      description: task.description,
      status: 'todo',
      priority: task.priority,
      type: task.type,
      estimatedHours: task.estimatedHours,
      relatedFiles: task.relatedFiles,
      tags: task.tags,
      subtasks: task.subtasks?.map((subtask) => ({
        title: subtask.title,
        isCompleted: false,
      })),
    });
  }

  /**
   * 快速创建任务
   */
  async quickCreateTask(title: string, description?: string): Promise<void> {
    const { addTask } = useTaskStore.getState();

    addTask({
      title,
      description,
      status: 'todo',
      priority: 'medium',
      type: 'other',
    });
  }

  /**
   * 批量更新任务优先级
   */
  async batchUpdatePriority(taskIds: string[], priority: Task['priority']): Promise<void> {
    const { updateTask } = useTaskStore.getState();

    for (const taskId of taskIds) {
      updateTask(taskId, { priority });
    }
  }

  /**
   * 批量更新任务标签
   */
  async batchUpdateTags(taskIds: string[], tags: string[]): Promise<void> {
    const { updateTask } = useTaskStore.getState();

    for (const taskId of taskIds) {
      updateTask(taskId, { tags });
    }
  }

  /**
   * 批量归档任务
   */
  async batchArchiveTasks(taskIds: string[]): Promise<void> {
    const { archiveTask } = useTaskStore.getState();

    for (const taskId of taskIds) {
      archiveTask(taskId);
    }
  }
}

export const taskActions = new TaskActions();
```

---

## 🔄 AI集成

### AI对话集成

```typescript
// src/services/task/AITaskIntegration.ts
import { taskInferenceEngine } from './TaskInferenceEngine';
import { useTaskStore } from '@/stores/useTaskStore';
import { taskActions } from './TaskActions';

/**
 * AI任务集成服务类
 */
export class AITaskIntegration {
  /**
   * 从AI对话中自动提取任务
   */
  async extractTasksFromAIMessage(
    messages: Array<{ role: string; content: string }>
  ): Promise<void> {
    const inferences = await taskInferenceEngine.inferTasksFromConversation(messages);

    for (const inference of inferences) {
      // 只添加高置信度的任务
      if (inference.confidence >= 0.7) {
        useTaskStore.getState().addTask({
          ...inference.task,
          source: 'ai-inferred',
          confidence: inference.confidence,
        });
      }
    }
  }

  /**
   * 推理任务依赖关系
   */
  async inferDependencies(): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const dependencies = await taskInferenceEngine.inferTaskDependencies(tasks);

    for (const [taskId, depTaskIds] of dependencies.entries()) {
      useTaskStore.getState().updateTask(taskId, {
        dependencies: depTaskIds,
      });
    }
  }

  /**
   * AI辅助任务分解
   */
  async decomposeTask(taskId: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // 使用AI分解任务
    const prompt = `Decompose the following task into smaller, actionable subtasks:

Task: ${task.title}
Description: ${task.description || ''}

Break down into:
1. Individual subtasks
2. Logical order
3. Estimated time for each subtask
4. Dependencies between subtasks

Format as JSON array.`;

    const config = {
      provider: await aiProviderManager.selectProvider(),
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager. Break down tasks into manageable subtasks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      maxTokens: 2048,
      stream: false,
    };

    const response = await aiProviderManager.request(config);
    const subtasks = JSON.parse(response.content);

    // 添加子任务
    for (const subtask of subtasks) {
      useTaskStore.getState().addSubtask(taskId, {
        title: subtask.title,
        isCompleted: false,
      });
    }
  }

  /**
   * AI辅助任务优先级评估
   */
  async assessTaskPriority(taskId: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // 使用AI评估任务优先级
    const prompt = `Assess the priority of the following task:

Task: ${task.title}
Description: ${task.description || ''}
Type: ${task.type}
Due Date: ${task.dueDate ? new Date(task.dueDate).toISOString() : 'None'}

Consider:
1. Business impact
2. Deadline urgency
3. Dependencies
4. Resource requirements

Assign one of: critical, high, medium, low

Provide reasoning.`;

    const config = {
      provider: await aiProviderManager.selectProvider(),
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager. Assess task priorities accurately.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 512,
      stream: false,
    };

    const response = await aiProviderManager.request(config);
    const { priority, reasoning } = JSON.parse(response.content);

    useTaskStore.getState().updateTask(taskId, { priority });
  }

  /**
   * AI辅助任务时间估算
   */
  async estimateTaskTime(taskId: string): Promise<void> {
    const { tasks } = useTaskStore.getState();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // 使用AI估算任务时间
    const prompt = `Estimate the time required for the following task:

Task: ${task.title}
Description: ${task.description || ''}
Type: ${task.type}

Consider:
1. Complexity
2. Required skills
3. Dependencies
4. Potential risks

Provide estimate in hours with reasoning.`;

    const config = {
      provider: await aiProviderManager.selectProvider(),
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager. Estimate task times accurately.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 512,
      stream: false,
    };

    const response = await aiProviderManager.request(config);
    const { estimatedHours, reasoning } = JSON.parse(response.content);

    useTaskStore.getState().updateTask(taskId, { estimatedHours });
  }
}

export const aiTaskIntegration = new AITaskIntegration();
```

---

## ✅ 验收标准

### 功能完整性

- ✅ 任务推理准确
- ✅ 提醒系统完善
- ✅ 快捷操作便捷
- ✅ AI集成智能
- ✅ 批量操作高效

### 用户体验

- ✅ 操作响应及时
- ✅ 通知清晰准确
- ✅ 交互流畅自然
- ✅ 错误处理完善

### 代码质量

- ✅ 代码结构清晰
- ✅ 类型定义完整
- ✅ 注释文档完整
- ✅ 代码可维护性好

---

## 🔄 版本历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-17 | 初始版本，建立任务看板交互功能 | YanYuCloudCube Team |

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
