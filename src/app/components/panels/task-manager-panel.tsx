/**
 * @file task-manager-panel.tsx
 * @description YYC³ Developer Workspace — Task Manager panel with full CRUD,
 *   status toggling, inline creation, priority management, AI task inference,
 *   and cross-store integration with the main TaskBoard page.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,task-manager,crud
 */

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Ban,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Eye,
  ListTodo,
  Play,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ThemeColors } from '../hooks/use-theme-colors'

// ==========================================
// Types
// ==========================================

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'
type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

interface MiniTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: number
  source?: string
  isArchived?: boolean
  createdAt: number
  tags?: string[]
}

// ==========================================
// Status & Priority Config
// ==========================================

const STATUS_CFG: Record<
  TaskStatus,
  { label: string; icon: typeof Circle; color: string; next: TaskStatus }
> = {
  todo: { label: '待办', icon: Circle, color: '#6b7280', next: 'in-progress' },
  'in-progress': { label: '进行中', icon: Play, color: '#3b82f6', next: 'review' },
  review: { label: '审查', icon: Eye, color: '#8b5cf6', next: 'done' },
  done: { label: '完成', icon: CheckCircle2, color: '#22c55e', next: 'todo' },
  blocked: { label: '阻塞', icon: Ban, color: '#ef4444', next: 'todo' },
}

const PRIORITY_CFG: Record<TaskPriority, { label: string; color: string; icon: typeof ArrowUp }> = {
  critical: { label: '紧急', color: '#ef4444', icon: AlertTriangle },
  high: { label: '高', color: '#f97316', icon: ArrowUp },
  medium: { label: '中', color: '#eab308', icon: ChevronRight },
  low: { label: '低', color: '#22c55e', icon: ArrowDown },
}

const STORAGE_KEY = 'yyc3-task-board-storage'

// ==========================================
// Component
// ==========================================

export function TaskManagerPanel({ tc }: { tc: ThemeColors }) {
  const [tasks, setTasks] = useState<MiniTask[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  // Sync from localStorage (cross-store with TaskBoardPage)
  const syncTasks = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setTasks(parsed.state?.tasks ?? [])
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    syncTasks()
    const handler = () => syncTasks()
    window.addEventListener('storage', handler)
    // Also poll periodically for same-tab updates
    const interval = setInterval(syncTasks, 2000)
    return () => {
      window.removeEventListener('storage', handler)
      clearInterval(interval)
    }
  }, [syncTasks])

  // Write back to localStorage
  const persistTasks = useCallback((updatedTasks: MiniTask[]) => {
    setTasks(updatedTasks)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : { state: {} }
      parsed.state = { ...parsed.state, tasks: updatedTasks }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } catch {
      /* ignore */
    }
  }, [])

  // Create task
  const handleCreate = useCallback(() => {
    if (!newTitle.trim()) return
    const newTask: MiniTask = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      status: 'todo',
      priority: newPriority,
      dueDate: newDueDate ? new Date(newDueDate).getTime() : undefined,
      source: 'workspace-panel',
      createdAt: Date.now(),
    }
    persistTasks([newTask, ...tasks])
    setNewTitle('')
    setNewDueDate('')
    setShowCreate(false)
  }, [newTitle, newPriority, newDueDate, tasks, persistTasks])

  // Toggle status
  const handleToggleStatus = useCallback(
    (taskId: string) => {
      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          const cfg = STATUS_CFG[t.status]
          return { ...t, status: cfg.next }
        }
        return t
      })
      persistTasks(updated)
    },
    [tasks, persistTasks],
  )

  // Delete task
  const handleDelete = useCallback(
    (taskId: string) => {
      persistTasks(tasks.filter((t) => t.id !== taskId))
    },
    [tasks, persistTasks],
  )

  // AI Quick Infer — create mock tasks from context
  const handleAIInfer = useCallback(() => {
    const aiTasks: MiniTask[] = [
      {
        id: crypto.randomUUID(),
        title: '重构 useThemeColors hook 提升类型安全性',
        status: 'todo',
        priority: 'medium',
        source: 'ai-inferred',
        createdAt: Date.now(),
        tags: ['refactor'],
      },
      {
        id: crypto.randomUUID(),
        title: '为 panel-store.ts 添加单元测试',
        status: 'todo',
        priority: 'high',
        source: 'ai-inferred',
        createdAt: Date.now(),
        tags: ['test'],
      },
      {
        id: crypto.randomUUID(),
        title: '优化 Monaco Editor 懒加载',
        status: 'todo',
        priority: 'low',
        source: 'ai-inferred',
        createdAt: Date.now(),
        tags: ['performance'],
      },
    ]
    persistTasks([...aiTasks, ...tasks])
  }, [tasks, persistTasks])

  const activeTasks = useMemo(() => tasks.filter((t) => !t.isArchived), [tasks])

  const filtered = useMemo(() => {
    let result = activeTasks
    if (filter !== 'all') result = result.filter((t) => t.status === filter)
    return result.slice(0, 30)
  }, [activeTasks, filter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeTasks.forEach((t) => {
      counts[t.status] = (counts[t.status] ?? 0) + 1
    })
    return counts
  }, [activeTasks])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        <span className="text-[11px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
          任务
        </span>
        <div className="flex items-center gap-1">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{ background: `${tc.primary}12`, color: tc.primary }}
          >
            {activeTasks.length}
          </span>
          <button
            onClick={handleAIInfer}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
            title="AI 推断任务"
          >
            <Brain className="w-3 h-3" style={{ color: '#a78bfa' }} />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
            title="新建任务"
          >
            {showCreate ? (
              <X className="w-3 h-3" style={{ color: tc.textMuted }} />
            ) : (
              <Plus className="w-3 h-3" style={{ color: tc.primary }} />
            )}
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b"
            style={{ borderColor: tc.borderSubtle }}
          >
            <div className="px-3 py-2 space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="任务标题..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') setShowCreate(false)
                }}
                className="w-full text-[11px] px-2 py-1.5 rounded-lg border outline-none transition-all"
                style={{
                  background: tc.bgInput,
                  borderColor: tc.borderDefault,
                  color: tc.textPrimary,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = `${tc.primary}50`
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = tc.borderDefault
                }}
              />
              <div className="flex items-center gap-2">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="text-[9px] px-1.5 py-1 rounded-lg border outline-none"
                  style={{
                    background: tc.bgInput,
                    borderColor: tc.borderDefault,
                    color: tc.textPrimary,
                  }}
                >
                  {(
                    Object.entries(PRIORITY_CFG) as [TaskPriority, typeof PRIORITY_CFG.critical][]
                  ).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="text-[9px] px-1.5 py-1 rounded-lg border outline-none flex-1"
                  style={{
                    background: tc.bgInput,
                    borderColor: tc.borderDefault,
                    color: tc.textPrimary,
                  }}
                />
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim()}
                  className="text-[9px] px-2 py-1 rounded-lg transition-all"
                  style={{
                    background: newTitle.trim() ? `${tc.primary}15` : 'transparent',
                    color: newTitle.trim() ? tc.primary : tc.textMuted,
                    border: `1px solid ${newTitle.trim() ? `${tc.primary}30` : tc.borderSubtle}`,
                  }}
                >
                  添加
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter bar */}
      <div
        className="flex gap-1 px-3 py-2 overflow-x-auto border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        <button
          onClick={() => setFilter('all')}
          className="text-[9px] px-2 py-0.5 rounded-lg border shrink-0 transition-all"
          style={{
            background: filter === 'all' ? `${tc.primary}10` : 'transparent',
            borderColor: filter === 'all' ? `${tc.primary}30` : tc.borderSubtle,
            color: filter === 'all' ? tc.primary : tc.textMuted,
          }}
        >
          全部
        </button>
        {(Object.entries(STATUS_CFG) as [TaskStatus, typeof STATUS_CFG.todo][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="text-[9px] px-2 py-0.5 rounded-lg border shrink-0 transition-all flex items-center gap-0.5"
              style={{
                background: filter === key ? `${cfg.color}12` : 'transparent',
                borderColor: filter === key ? `${cfg.color}30` : tc.borderSubtle,
                color: filter === key ? cfg.color : tc.textMuted,
              }}
            >
              {cfg.label} {statusCounts[key] ? <span>({statusCounts[key]})</span> : null}
            </button>
          ),
        )}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((task) => {
          const sCfg = STATUS_CFG[task.status] ?? STATUS_CFG['todo']
          const pCfg = PRIORITY_CFG[task.priority] ?? PRIORITY_CFG['medium']
          const SIcon = sCfg.icon
          const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== 'done'
          const isExpanded = expandedTask === task.id
          return (
            <div
              key={task.id}
              className="px-3 py-2 border-b transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: tc.borderSubtle }}
            >
              <div className="flex items-start gap-2">
                <button
                  onClick={() => handleToggleStatus(task.id)}
                  className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                  title={`移至 ${sCfg.next}`}
                >
                  <SIcon className="w-3.5 h-3.5" style={{ color: sCfg.color }} />
                </button>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                >
                  <p
                    className="text-[11px] truncate"
                    style={{
                      color: tc.textPrimary,
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      opacity: task.status === 'done' ? 0.6 : 1,
                    }}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span
                      className="text-[8px] px-1 py-0.5 rounded"
                      style={{ background: `${pCfg.color}12`, color: pCfg.color }}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span
                        className="text-[8px] flex items-center gap-0.5"
                        style={{ color: isOverdue ? '#ef4444' : tc.textMuted }}
                      >
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(task.dueDate).toLocaleDateString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    {task.source === 'ai-inferred' && (
                      <span
                        className="text-[7px] px-1 rounded flex items-center gap-0.5"
                        style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}
                      >
                        <Sparkles className="w-2 h-2" />
                        AI
                      </span>
                    )}
                    {task.source === 'workspace-panel' && (
                      <span
                        className="text-[7px] px-1 rounded"
                        style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
                      >
                        Panel
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity mt-0.5 shrink-0"
                >
                  <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
                </button>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-5.5 mt-1.5 overflow-hidden"
                  >
                    <div
                      className="text-[9px] space-y-1 p-2 rounded-lg"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${tc.borderSubtle}`,
                      }}
                    >
                      {task.description && (
                        <p style={{ color: tc.textSecondary }}>{task.description}</p>
                      )}
                      <div className="flex items-center gap-2" style={{ color: tc.textMuted }}>
                        <Clock className="w-2.5 h-2.5" />
                        <span>创建于 {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {(Object.entries(STATUS_CFG) as [TaskStatus, typeof STATUS_CFG.todo][]).map(
                          ([key, cfg]) => (
                            <button
                              key={key}
                              onClick={() => {
                                const updated = tasks.map((t) =>
                                  t.id === task.id ? { ...t, status: key as TaskStatus } : t,
                                )
                                persistTasks(updated)
                              }}
                              className="text-[8px] px-1.5 py-0.5 rounded transition-all"
                              style={{
                                background: task.status === key ? `${cfg.color}20` : 'transparent',
                                color: cfg.color,
                                border: `1px solid ${task.status === key ? `${cfg.color}40` : 'transparent'}`,
                              }}
                            >
                              {cfg.label}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <ListTodo className="w-6 h-6 mb-1" style={{ color: tc.textMuted }} />
            <span className="text-[10px]" style={{ color: tc.textMuted }}>
              {activeTasks.length === 0 ? '暂无任务' : '无匹配任务'}
            </span>
            <button
              onClick={() => setShowCreate(true)}
              className="text-[9px] mt-2 px-3 py-1 rounded-lg transition-all hover:bg-white/5"
              style={{ color: tc.primary, border: `1px solid ${tc.primary}30` }}
            >
              <Plus className="w-3 h-3 inline mr-1" />
              创建任务
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
