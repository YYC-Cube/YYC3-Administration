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
  Archive,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Code,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import {
  AIInferencePanel,
  DraggableTaskCard,
  DroppableKanbanColumn,
  ListView,
  RemindersPanel,
  TaskModal,
  TaskStats,
} from './task-board-components'
import {
  DND_ITEM_TYPE,
  KANBAN_COLUMNS,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  TYPE_CONFIG,
} from './task-board-data'
import { useTaskStore } from './task-board-store'

import type { Task, TaskPriority, TaskStatus, TaskType, ViewMode } from './task-board-data'

import { useI18n } from '@/app/components/i18n-context'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

export function TaskBoardPage() {
  const tc = useThemeColors()
  const { t } = useI18n()

  // Zustand store selectors
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)
  const updateTask = useTaskStore((s) => s.updateTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const archiveTask = useTaskStore((s) => s.archiveTask)
  const duplicateTask = useTaskStore((s) => s.duplicateTask)
  const batchUpdateStatus = useTaskStore((s) => s.batchUpdateStatus)
  const batchDelete = useTaskStore((s) => s.batchDelete)
  const seedIfEmpty = useTaskStore((s) => s.seedIfEmpty)

  // Seed on mount if empty
  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  // Browser Notification API — listen for task move events via window.dispatchEvent
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    const STATUS_LABELS: Record<string, string> = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      review: 'Review',
      done: 'Done',
      blocked: 'Blocked',
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { taskTitle: string; from: string; to: string }
      if (!detail) return
      const body = `"${detail.taskTitle}" → ${STATUS_LABELS[detail.to] ?? detail.to}`
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('YYC³ Task Board', {
          body,
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📋</text></svg>",
        })
      }
    }
    window.addEventListener('yyc3-task-moved', handler)
    return () => window.removeEventListener('yyc3-task-moved', handler)
  }, [])

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | undefined>()
  const [filterPriority, setFilterPriority] = useState<TaskPriority | undefined>()
  const [filterType, setFilterType] = useState<TaskType | undefined>()
  const [showArchived, setShowArchived] = useState(false)
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [modalTask, setModalTask] = useState<Task | null | 'new'>(null)
  const [showFilters, setShowFilters] = useState(false)

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSave = useCallback(
    (data: Partial<Task>) => {
      if (data.id) {
        updateTask(data.id, data)
      } else {
        addTask({
          title: data.title ?? '',
          description: data.description,
          status: data.status ?? 'todo',
          priority: data.priority ?? 'medium',
          type: data.type ?? 'feature',
          dueDate: data.dueDate,
          estimatedHours: data.estimatedHours,
          tags: data.tags,
          source: 'manual' as const,
        })
      }
      setModalTask(null)
    },
    [addTask, updateTask],
  )

  const handleBatchDelete = useCallback(() => {
    batchDelete(Array.from(selectedIds))
    setSelectedIds(new Set())
  }, [selectedIds, batchDelete])

  const handleBatchStatus = useCallback(
    (status: TaskStatus) => {
      batchUpdateStatus(Array.from(selectedIds), status)
      setSelectedIds(new Set())
    },
    [selectedIds, batchUpdateStatus],
  )

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => (showArchived ? true : !t.isArchived))
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)),
      )
    }
    if (filterStatus) result = result.filter((t) => t.status === filterStatus)
    if (filterPriority) result = result.filter((t) => t.priority === filterPriority)
    if (filterType) result = result.filter((t) => t.type === filterType)

    const priorityOrder: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    result.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority]
      else if (sortBy === 'dueDate') cmp = (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity)
      else cmp = a.createdAt - b.createdAt
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return result
  }, [
    tasks,
    searchQuery,
    filterStatus,
    filterPriority,
    filterType,
    showArchived,
    sortBy,
    sortOrder,
  ])

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      review: [],
      done: [],
      blocked: [],
    }
    for (const t of filteredTasks) if (map[t.status]) map[t.status].push(t)
    return map
  }, [filteredTasks])

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="h-full overflow-y-auto p-4 lg:p-6 space-y-5"
        style={{ background: tc.bgBase }}
      >
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(34,197,94,0.1))',
                  border: '1px solid rgba(0,240,255,0.25)',
                  boxShadow: '0 0 15px rgba(0,240,255,0.15)',
                }}
              >
                <Target className="w-5 h-5" style={{ color: '#00f0ff' }} />
              </div>
              <div>
                <h1 className="text-xl" style={{ color: tc.textPrimary }}>
                  {t('nav.taskBoard')}
                </h1>
                <p className="text-[11px]" style={{ color: tc.textMuted }}>
                  {t('taskBoard.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Persistence indicator */}
              <span
                className="text-[9px] px-2 py-1 rounded-full flex items-center gap-1"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <CheckCircle2 className="w-3 h-3" /> Auto-saved
              </span>
              {/* View toggle */}
              <div
                className="flex items-center gap-0.5 rounded-lg border p-0.5"
                style={{ borderColor: tc.borderDefault, background: tc.bgCard }}
              >
                {[
                  { mode: 'kanban' as ViewMode, icon: LayoutGrid, label: 'Kanban' },
                  { mode: 'list' as ViewMode, icon: List, label: 'List' },
                  { mode: 'stats' as ViewMode, icon: BarChart3, label: 'Stats' },
                ].map((v) => (
                  <button
                    key={v.mode}
                    onClick={() => setViewMode(v.mode)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-md transition-all"
                    style={{
                      background: viewMode === v.mode ? `${tc.primary}15` : 'transparent',
                      color: viewMode === v.mode ? tc.primary : tc.textMuted,
                      border:
                        viewMode === v.mode ? `1px solid ${tc.primary}30` : '1px solid transparent',
                    }}
                  >
                    <v.icon className="w-3.5 h-3.5" />
                    {v.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setModalTask('new')}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-xl border transition-all"
                style={{
                  background: tc.gradientButton,
                  borderColor: `${tc.primary}40`,
                  color: '#fff',
                  boxShadow: `0 0 12px ${tc.primary}20`,
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reminders */}
        <RemindersPanel tc={tc} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: tc.textMuted }}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[12px] rounded-xl border outline-none transition-all"
              style={{
                background: tc.bgInput,
                borderColor: tc.borderDefault,
                color: tc.textPrimary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `${tc.primary}50`
                e.currentTarget.style.boxShadow = `0 0 0 3px ${tc.primary}15`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tc.borderDefault
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg border transition-all"
              style={{
                background: showFilters ? `${tc.primary}10` : 'transparent',
                borderColor: showFilters ? `${tc.primary}30` : tc.borderDefault,
                color: showFilters ? tc.primary : tc.textMuted,
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
            <button
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: tc.borderDefault, color: tc.textMuted }}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-3.5 h-3.5" />
              ) : (
                <SortDesc className="w-3.5 h-3.5" />
              )}
              {sortBy === 'priority' ? 'Priority' : sortBy === 'dueDate' ? 'Due Date' : 'Created'}
            </button>
            {(['priority', 'dueDate', 'createdAt'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                style={{
                  background: sortBy === s ? `${tc.primary}10` : 'transparent',
                  borderColor: sortBy === s ? `${tc.primary}30` : tc.borderSubtle,
                  color: sortBy === s ? tc.primary : tc.textMuted,
                }}
              >
                {s === 'priority' ? 'Priority' : s === 'dueDate' ? 'Due' : 'Created'}
              </button>
            ))}
            {selectedIds.size > 0 && (
              <div
                className="flex items-center gap-1 ml-2 pl-2 border-l"
                style={{ borderColor: tc.borderSubtle }}
              >
                <span className="text-[10px] mr-1" style={{ color: tc.textMuted }}>
                  {selectedIds.size} selected
                </span>
                {KANBAN_COLUMNS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleBatchStatus(s)}
                    className="text-[8px] px-1.5 py-0.5 rounded border transition-all hover:bg-white/5"
                    style={{
                      borderColor: `${STATUS_CONFIG[s].color}30`,
                      color: STATUS_CONFIG[s].color,
                    }}
                    title={`Move to ${STATUS_CONFIG[s].label}`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
                <button
                  onClick={handleBatchDelete}
                  className="text-[9px] px-1.5 py-0.5 rounded border transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                >
                  <Trash2 className="w-3 h-3 inline" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="flex flex-wrap gap-2 p-3 rounded-xl border"
                style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[9px] mr-1" style={{ color: tc.textMuted }}>
                    Status:
                  </span>
                  <button
                    onClick={() => setFilterStatus(undefined)}
                    className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                    style={{
                      background: !filterStatus ? `${tc.primary}10` : 'transparent',
                      borderColor: !filterStatus ? `${tc.primary}30` : tc.borderSubtle,
                      color: !filterStatus ? tc.primary : tc.textMuted,
                    }}
                  >
                    All
                  </button>
                  {KANBAN_COLUMNS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(filterStatus === s ? undefined : s)}
                      className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                      style={{
                        background:
                          filterStatus === s ? `${STATUS_CONFIG[s].color}15` : 'transparent',
                        borderColor:
                          filterStatus === s ? `${STATUS_CONFIG[s].color}30` : tc.borderSubtle,
                        color: filterStatus === s ? STATUS_CONFIG[s].color : tc.textMuted,
                      }}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] mr-1" style={{ color: tc.textMuted }}>
                    Priority:
                  </span>
                  <button
                    onClick={() => setFilterPriority(undefined)}
                    className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                    style={{
                      background: !filterPriority ? `${tc.primary}10` : 'transparent',
                      borderColor: !filterPriority ? `${tc.primary}30` : tc.borderSubtle,
                      color: !filterPriority ? tc.primary : tc.textMuted,
                    }}
                  >
                    All
                  </button>
                  {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(filterPriority === p ? undefined : p)}
                      className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                      style={{
                        background:
                          filterPriority === p ? `${PRIORITY_CONFIG[p].color}15` : 'transparent',
                        borderColor:
                          filterPriority === p ? `${PRIORITY_CONFIG[p].color}30` : tc.borderSubtle,
                        color: filterPriority === p ? PRIORITY_CONFIG[p].color : tc.textMuted,
                      }}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] mr-1" style={{ color: tc.textMuted }}>
                    Type:
                  </span>
                  <button
                    onClick={() => setFilterType(undefined)}
                    className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                    style={{
                      background: !filterType ? `${tc.primary}10` : 'transparent',
                      borderColor: !filterType ? `${tc.primary}30` : tc.borderSubtle,
                      color: !filterType ? tc.primary : tc.textMuted,
                    }}
                  >
                    All
                  </button>
                  {(Object.keys(TYPE_CONFIG) as TaskType[]).map((tp) => (
                    <button
                      key={tp}
                      onClick={() => setFilterType(filterType === tp ? undefined : tp)}
                      className="text-[9px] px-2 py-1 rounded-lg border transition-all"
                      style={{
                        background:
                          filterType === tp ? `${TYPE_CONFIG[tp].color}15` : 'transparent',
                        borderColor:
                          filterType === tp ? `${TYPE_CONFIG[tp].color}30` : tc.borderSubtle,
                        color: filterType === tp ? TYPE_CONFIG[tp].color : tc.textMuted,
                      }}
                    >
                      {TYPE_CONFIG[tp].label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="text-[9px] px-2 py-1 rounded-lg border transition-all flex items-center gap-1"
                  style={{
                    background: showArchived ? 'rgba(249,115,22,0.1)' : 'transparent',
                    borderColor: showArchived ? 'rgba(249,115,22,0.3)' : tc.borderSubtle,
                    color: showArchived ? '#f97316' : tc.textMuted,
                  }}
                >
                  <Archive className="w-3 h-3" />
                  {showArchived ? 'Showing Archived' : 'Show Archived'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <div className="xl:col-span-3">
            {viewMode === 'kanban' && (
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
            {viewMode === 'list' && (
              <ListView
                tasks={filteredTasks}
                tc={tc}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onEdit={(t) => setModalTask(t)}
                onDelete={deleteTask}
              />
            )}
            {viewMode === 'stats' && <TaskStats tc={tc} />}
          </div>

          {/* Right: AI Inference Panel */}
          <div className="space-y-4">
            <AIInferencePanel tc={tc} />
            <div
              className="rounded-xl border p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(139,92,246,0.03))',
                borderColor: 'rgba(0,240,255,0.15)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" style={{ color: '#00f0ff' }} />
                <span className="text-[11px]" style={{ color: tc.textPrimary }}>
                  Task Board Tips
                </span>
              </div>
              <ul className="space-y-1.5">
                {[
                  'Drag cards between columns to change status',
                  'Tasks are auto-saved to localStorage (Zustand)',
                  'AI Inference supports 3 modes: Conversation, Code, Description',
                  'Click cards to multi-select for batch operations',
                  'Overdue tasks are highlighted in red',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight
                      className="w-3 h-3 mt-0.5 shrink-0"
                      style={{ color: '#00f0ff' }}
                    />
                    <span className="text-[10px]" style={{ color: tc.textMuted }}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Task Modal */}
        <AnimatePresence>
          {modalTask !== null && (
            <TaskModal
              tc={tc}
              task={modalTask === 'new' ? null : modalTask}
              onSave={handleSave}
              onClose={() => setModalTask(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}
