/**
 * @file task-board-data.ts
 * @description 任务板数据层:类型定义、状态/优先级/类型元信息、看板列序、
 *   初始任务与提醒种子数据(P2-③ 巨石拆分,自 task-board-page.tsx 抽出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,data,toolkit
 */

import { Ban, CheckCircle2, Circle, Eye, Play } from 'lucide-react'

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'
export type TaskType = 'feature' | 'bug' | 'refactor' | 'test' | 'documentation' | 'other'
export type ReminderType = 'deadline' | 'dependency' | 'blocking' | 'progress' | 'custom'
export type ViewMode = 'kanban' | 'list' | 'stats'

export interface SubTask {
  id: string
  title: string
  isCompleted: boolean
  createdAt: number
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  createdAt: number
  updatedAt: number
  dueDate?: number
  estimatedHours?: number
  actualHours?: number
  relatedMessageId?: string
  relatedFiles?: string[]
  tags?: string[]
  subtasks?: SubTask[]
  dependencies?: string[]
  blocking?: string[]
  assigneeId?: string
  isArchived: boolean
  source: 'manual' | 'ai-inferred' | 'imported'
  confidence?: number
}

export interface Reminder {
  id: string
  taskId: string
  type: ReminderType
  message: string
  remindAt: number
  isTriggered: boolean
  isRead: boolean
  createdAt: number
}

export interface TaskInferenceResult {
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  confidence: number
  reasoning: string
  tags: string[]
  estimatedHours?: number
  relatedFiles?: string[]
}

// ==========================================
// Constants
// ==========================================

export const DND_ITEM_TYPE = 'TASK_CARD'

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; labelZh: string; icon: typeof Circle; color: string; bgColor: string }
> = {
  todo: {
    label: 'To Do',
    labelZh: 'tbd.status.todo',
    icon: Circle,
    color: '#6b7280',
    bgColor: 'rgba(107,114,128,0.12)',
  },
  'in-progress': {
    label: 'In Progress',
    labelZh: 'tbd.status.inProgress',
    icon: Play,
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.12)',
  },
  review: {
    label: 'Review',
    labelZh: 'tbd.status.review',
    icon: Eye,
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.12)',
  },
  done: {
    label: 'Done',
    labelZh: 'tbd.status.done',
    icon: CheckCircle2,
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.12)',
  },
  blocked: {
    label: 'Blocked',
    labelZh: 'tbd.status.blocked',
    icon: Ban,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.12)',
  },
}

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; labelZh: string; color: string; icon: string }
> = {
  critical: { label: 'Critical', labelZh: 'tbd.priority.critical', color: '#ef4444', icon: '!!' },
  high: { label: 'High', labelZh: 'tbd.priority.high', color: '#f97316', icon: '!' },
  medium: { label: 'Medium', labelZh: 'tbd.priority.medium', color: '#eab308', icon: '-' },
  low: { label: 'Low', labelZh: 'tbd.priority.low', color: '#22c55e', icon: '~' },
}

export const TYPE_CONFIG: Record<TaskType, { label: string; labelZh: string; color: string }> = {
  feature: { label: 'Feature', labelZh: 'tbd.type.feature', color: '#3b82f6' },
  bug: { label: 'Bug', labelZh: 'tbd.type.bug', color: '#ef4444' },
  refactor: { label: 'Refactor', labelZh: 'tbd.type.refactor', color: '#8b5cf6' },
  test: { label: 'Test', labelZh: 'tbd.type.test', color: '#f97316' },
  documentation: { label: 'Docs', labelZh: 'tbd.type.docs', color: '#06b6d4' },
  other: { label: 'Other', labelZh: 'tbd.type.other', color: '#6b7280' },
}

export const KANBAN_COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done', 'blocked']

// ==========================================
// Zustand Store with Persist
// ==========================================

export const INITIAL_TASKS: Task[] = (() => {
  const now = Date.now()
  return [
    {
      id: 't1',
      title: 'tbd.task.t1.title',
      description: 'tbd.task.t1.desc',
      status: 'in-progress' as TaskStatus,
      priority: 'critical' as TaskPriority,
      type: 'feature' as TaskType,
      createdAt: now - 86400000 * 3,
      updatedAt: now - 3600000,
      dueDate: now + 86400000 * 2,
      estimatedHours: 16,
      actualHours: 8,
      relatedFiles: ['src/auth/provider.ts', 'src/middleware/jwt.ts'],
      tags: ['auth', 'security', 'P0'],
      subtasks: [
        {
          id: 'st1',
          title: 'tbd.task.t1.sub1',
          isCompleted: true,
          createdAt: now - 86400000 * 3,
        },
        {
          id: 'st2',
          title: 'tbd.task.t1.sub2',
          isCompleted: true,
          createdAt: now - 86400000 * 3,
        },
        { id: 'st3', title: 'tbd.task.t1.sub3', isCompleted: false, createdAt: now - 86400000 * 2 },
        { id: 'st4', title: 'tbd.task.t1.sub4', isCompleted: false, createdAt: now - 86400000 * 2 },
      ],
      dependencies: [],
      blocking: ['t5'],
      isArchived: false,
      source: 'manual' as const,
    },
    {
      id: 't2',
      title: 'tbd.task.t2.title',
      description: 'tbd.task.t2.desc',
      status: 'todo' as TaskStatus,
      priority: 'high' as TaskPriority,
      type: 'bug' as TaskType,
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000,
      dueDate: now + 86400000,
      estimatedHours: 4,
      relatedFiles: ['src/components/dashboard-page.tsx'],
      tags: ['bug', 'UI', 'charts'],
      isArchived: false,
      source: 'ai-inferred' as const,
      confidence: 0.92,
    },
    {
      id: 't3',
      title: 'tbd.task.t3.title',
      description: 'tbd.task.t3.desc',
      status: 'review' as TaskStatus,
      priority: 'medium' as TaskPriority,
      type: 'refactor' as TaskType,
      createdAt: now - 86400000 * 5,
      updatedAt: now - 7200000,
      estimatedHours: 8,
      actualHours: 6,
      relatedFiles: ['src/ai/cache.ts', 'src/ai/provider.ts'],
      tags: ['performance', 'AI', 'cache'],
      subtasks: [
        { id: 'st5', title: 'tbd.task.t3.sub1', isCompleted: true, createdAt: now - 86400000 * 5 },
        {
          id: 'st6',
          title: 'tbd.task.t3.sub2',
          isCompleted: true,
          createdAt: now - 86400000 * 4,
        },
        { id: 'st7', title: 'tbd.task.t3.sub3', isCompleted: false, createdAt: now - 86400000 * 3 },
      ],
      isArchived: false,
      source: 'manual' as const,
    },
    {
      id: 't4',
      title: 'tbd.task.t4.title',
      description: 'tbd.task.t4.desc',
      status: 'todo' as TaskStatus,
      priority: 'medium' as TaskPriority,
      type: 'test' as TaskType,
      createdAt: now - 86400000,
      updatedAt: now - 86400000,
      estimatedHours: 12,
      relatedFiles: ['src/api/**/*.test.ts'],
      tags: ['test', 'quality', 'API'],
      isArchived: false,
      source: 'manual' as const,
    },
    {
      id: 't5',
      title: 'tbd.task.t5.title',
      description: 'tbd.task.t5.desc',
      status: 'blocked' as TaskStatus,
      priority: 'low' as TaskPriority,
      type: 'feature' as TaskType,
      createdAt: now - 86400000 * 4,
      updatedAt: now - 86400000 * 2,
      estimatedHours: 6,
      relatedFiles: ['src/locales/ja.ts', 'src/locales/ko.ts'],
      tags: ['i18n', 'localization'],
      dependencies: ['t1'],
      isArchived: false,
      source: 'ai-inferred' as const,
      confidence: 0.85,
    },
    {
      id: 't6',
      title: 'tbd.task.t6.title',
      description: 'tbd.task.t6.desc',
      status: 'done' as TaskStatus,
      priority: 'medium' as TaskPriority,
      type: 'refactor' as TaskType,
      createdAt: now - 86400000 * 7,
      updatedAt: now - 86400000,
      estimatedHours: 4,
      actualHours: 3,
      relatedFiles: ['src/styles/theme.css'],
      tags: ['infra', 'CSS', 'migration'],
      isArchived: false,
      source: 'manual' as const,
    },
    {
      id: 't7',
      title: 'tbd.task.t7.title',
      description: 'tbd.task.t7.desc',
      status: 'todo' as TaskStatus,
      priority: 'high' as TaskPriority,
      type: 'feature' as TaskType,
      createdAt: now - 86400000,
      updatedAt: now - 3600000 * 4,
      dueDate: now + 86400000 * 3,
      estimatedHours: 10,
      relatedFiles: ['src/components/smart-form-system.tsx'],
      tags: ['DnD', 'forms', 'UX'],
      isArchived: false,
      source: 'manual' as const,
    },
    {
      id: 't8',
      title: 'tbd.task.t8.title',
      description: 'tbd.task.t8.desc',
      status: 'todo' as TaskStatus,
      priority: 'low' as TaskPriority,
      type: 'documentation' as TaskType,
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2,
      estimatedHours: 8,
      tags: ['docs', 'storybook', 'components'],
      isArchived: false,
      source: 'ai-inferred' as const,
      confidence: 0.78,
    },
    {
      id: 't9',
      title: 'tbd.task.t9.title',
      description: 'tbd.task.t9.desc',
      status: 'in-progress' as TaskStatus,
      priority: 'high' as TaskPriority,
      type: 'bug' as TaskType,
      createdAt: now - 86400000,
      updatedAt: now - 1800000,
      dueDate: now + 86400000,
      estimatedHours: 3,
      actualHours: 1.5,
      relatedFiles: ['src/components/cyberpunk-standalone.tsx'],
      tags: ['mobile', 'bug', 'iOS'],
      isArchived: false,
      source: 'manual' as const,
    },
    {
      id: 't10',
      title: 'tbd.task.t10.title',
      description: 'tbd.task.t10.desc',
      status: 'done' as TaskStatus,
      priority: 'medium' as TaskPriority,
      type: 'feature' as TaskType,
      createdAt: now - 86400000 * 10,
      updatedAt: now - 86400000 * 3,
      estimatedHours: 5,
      actualHours: 4,
      tags: ['monitoring', 'infra', 'Sentry'],
      isArchived: false,
      source: 'manual' as const,
    },
  ]
})()

export const INITIAL_REMINDERS: Reminder[] = (() => {
  const now = Date.now()
  return [
    {
      id: 'r1',
      taskId: 't1',
      type: 'deadline' as ReminderType,
      message: 'tbd.reminder.r1',
      remindAt: now + 3600000,
      isTriggered: false,
      isRead: false,
      createdAt: now - 3600000,
    },
    {
      id: 'r2',
      taskId: 't2',
      type: 'deadline' as ReminderType,
      message: 'tbd.reminder.r2',
      remindAt: now + 3600000 * 2,
      isTriggered: false,
      isRead: false,
      createdAt: now - 7200000,
    },
    {
      id: 'r3',
      taskId: 't5',
      type: 'blocking' as ReminderType,
      message: 'tbd.reminder.r3',
      remindAt: now,
      isTriggered: true,
      isRead: false,
      createdAt: now - 86400000,
    },
    {
      id: 'r4',
      taskId: 't3',
      type: 'progress' as ReminderType,
      message: 'tbd.reminder.r4',
      remindAt: now,
      isTriggered: true,
      isRead: true,
      createdAt: now - 14400000,
    },
  ]
})()

// --- Zustand Task Store ---
