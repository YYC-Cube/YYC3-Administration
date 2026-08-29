/**
 * @file task-board-store.ts
 * @description 任务板状态层:Zustand 持久化 store(任务 CRUD、依赖、批量、
 *   过滤/排序/视图模式)(P2-③ 巨石拆分)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,store,zustand,toolkit
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { INITIAL_REMINDERS, INITIAL_TASKS } from './task-board-data'

import type { Reminder, SubTask, Task, TaskPriority, TaskStatus } from './task-board-data'

interface TaskStoreState {
  tasks: Task[]
  reminders: Reminder[]
  _hydrated: boolean
}

interface TaskStoreActions {
  addTask: (
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'> & { source?: Task['source'] },
  ) => string
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  archiveTask: (taskId: string) => void
  duplicateTask: (taskId: string) => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  reorderInColumn: (taskId: string, targetId: string, position: 'before' | 'after') => void
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  batchUpdateStatus: (taskIds: string[], status: TaskStatus) => void
  batchDelete: (taskIds: string[]) => void
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'isTriggered' | 'isRead'>) => void
  dismissReminder: (reminderId: string) => void
  seedIfEmpty: () => void
}

export const useTaskStore = create<TaskStoreState & TaskStoreActions>()(
  persist(
    (set, get) => ({
      tasks: [],
      reminders: [],
      _hydrated: false,

      addTask: (taskData) => {
        const id = crypto.randomUUID()
        const newTask: Task = {
          ...taskData,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isArchived: false,
          source: taskData.source ?? 'manual',
        }
        set((s) => ({ tasks: [...s.tasks, newTask] }))
        return id
      },

      updateTask: (taskId, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t,
          ),
        }))
      },

      deleteTask: (taskId) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== taskId),
          reminders: s.reminders.filter((r) => r.taskId !== taskId),
        }))
      },

      archiveTask: (taskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, isArchived: true, updatedAt: Date.now() } : t,
          ),
        }))
      },

      duplicateTask: (taskId) => {
        const src = get().tasks.find((t) => t.id === taskId)
        if (!src) return
        const dup: Task = {
          ...src,
          id: crypto.randomUUID(),
          title: `${src.title} (Copy)`,
          status: 'todo',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isArchived: false,
          source: 'manual',
          subtasks: src.subtasks?.map((st) => ({
            ...st,
            id: crypto.randomUUID(),
            isCompleted: false,
          })),
        }
        set((s) => ({ tasks: [...s.tasks, dup] }))
      },

      moveTask: (taskId, newStatus) => {
        const task = get().tasks.find((t) => t.id === taskId)
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus, updatedAt: Date.now() } : t,
          ),
        }))
        // Dispatch browser notification via custom event
        if (task) {
          window.dispatchEvent(
            new CustomEvent('yyc3-task-moved', {
              detail: { taskId, taskTitle: task.title, from: task.status, to: newStatus },
            }),
          )
        }
      },

      reorderInColumn: (taskId, targetId, position) => {
        set((s) => {
          const tasks = [...s.tasks]
          const srcIdx = tasks.findIndex((t) => t.id === taskId)
          const tgtIdx = tasks.findIndex((t) => t.id === targetId)
          if (srcIdx === -1 || tgtIdx === -1 || srcIdx === tgtIdx) return s
          const [moved] = tasks.splice(srcIdx, 1)
          const insertIdx = tasks.findIndex((t) => t.id === targetId)
          tasks.splice(position === 'before' ? insertIdx : insertIdx + 1, 0, moved)
          return { tasks }
        })
      },

      addSubtask: (taskId, title) => {
        const st: SubTask = {
          id: crypto.randomUUID(),
          title,
          isCompleted: false,
          createdAt: Date.now(),
        }
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...(t.subtasks ?? []), st], updatedAt: Date.now() }
              : t,
          ),
        }))
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t
            return {
              ...t,
              subtasks: t.subtasks?.map((st) =>
                st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
              ),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      deleteSubtask: (taskId, subtaskId) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t
            return {
              ...t,
              subtasks: t.subtasks?.filter((st) => st.id !== subtaskId),
              updatedAt: Date.now(),
            }
          }),
        }))
      },

      batchUpdateStatus: (taskIds, status) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            taskIds.includes(t.id) ? { ...t, status, updatedAt: Date.now() } : t,
          ),
        }))
      },

      batchDelete: (taskIds) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => !taskIds.includes(t.id)),
          reminders: s.reminders.filter((r) => !taskIds.includes(r.taskId)),
        }))
      },

      addReminder: (data) => {
        const r: Reminder = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          isTriggered: false,
          isRead: false,
        }
        set((s) => ({ reminders: [...s.reminders, r] }))
      },

      dismissReminder: (reminderId) => {
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === reminderId ? { ...r, isRead: true } : r)),
        }))
      },

      seedIfEmpty: () => {
        const { tasks, reminders: _reminders } = get()
        if (tasks.length === 0) {
          set({ tasks: INITIAL_TASKS, reminders: INITIAL_REMINDERS, _hydrated: true })
        } else {
          set({ _hydrated: true })
        }
      },
    }),
    {
      name: 'yyc3-task-board-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        reminders: state.reminders,
      }),
      onRehydrateStorage: () => (state) => {
        state?.seedIfEmpty()
      },
    },
  ),
)

// ==========================================
// AI Task Inference Engine (Simulated)
// ==========================================
