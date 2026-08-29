/**
 * @file task-board-components.tsx
 * @description 任务板组件层:可拖拽卡片、看板列、任务弹窗、AI 推断面板、
 *   提醒面板、统计视图与列表视图(P2-③ 巨石拆分)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,components,toolkit
 */

import {
  AlertTriangle,
  Archive,
  BellRing,
  Brain,
  Calendar,
  Check,
  ClipboardList,
  Code,
  Copy,
  Edit3,
  FileCode,
  GripVertical,
  Layers,
  List,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Sparkles,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import { aiInference } from './task-board-ai'
import {
  DND_ITEM_TYPE,
  KANBAN_COLUMNS,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  TYPE_CONFIG,
} from './task-board-data'
import { useTaskStore } from './task-board-store'

import type {
  ReminderType,
  Task,
  TaskInferenceResult,
  TaskPriority,
  TaskStatus,
  TaskType,
  ViewMode,
} from './task-board-data'

import { useI18n } from '@/app/components/i18n-context'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

export function DraggableTaskCard({
  task,
  tc,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
}: {
  task: Task
  tc: ReturnType<typeof useThemeColors>
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const moveTask = useTaskStore((s) => s.moveTask)
  const reorderInColumn = useTaskStore((s) => s.reorderInColumn)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_ITEM_TYPE,
    item: () => ({ id: task.id, status: task.status }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  })

  // Intra-column reorder drop target
  const [{ isOverReorder }, reorderDrop] = useDrop({
    accept: DND_ITEM_TYPE,
    canDrop: (item: { id: string; status: TaskStatus }) =>
      item.id !== task.id && item.status === task.status,
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.id !== task.id && item.status === task.status) {
        reorderInColumn(item.id, task.id, 'before')
      }
    },
    collect: (monitor) => ({
      isOverReorder: monitor.isOver({ shallow: true }) && monitor.canDrop(),
    }),
  })

  const pCfg = PRIORITY_CONFIG[task.priority]
  const tCfg = TYPE_CONFIG[task.type]
  const completedSubs = task.subtasks?.filter((s) => s.isCompleted).length ?? 0
  const totalSubs = task.subtasks?.length ?? 0
  const subProgress = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0
  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== 'done'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    if (showMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  return (
    <div
      ref={(node) => {
        preview(reorderDrop(node))
      }}
      className="rounded-xl border p-3 cursor-grab group relative transition-all"
      style={{
        background: isSelected ? `${pCfg.color}08` : tc.bgCard,
        borderColor: isOverReorder ? tc.primary : isSelected ? `${pCfg.color}40` : tc.borderDefault,
        boxShadow: isOverReorder
          ? `0 -2px 0 0 ${tc.primary}`
          : isSelected
            ? `0 0 12px ${pCfg.color}15`
            : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? 'rotate(3deg)' : 'none',
      }}
      onClick={() => onSelect(task.id)}
    >
      {/* Drag handle */}
      <div
        ref={drag}
        className="absolute top-2 left-1 cursor-grab opacity-0 group-hover:opacity-40 transition-opacity"
      >
        <GripVertical className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
      </div>

      {/* Priority bar */}
      <div
        className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full"
        style={{ background: pCfg.color, opacity: 0.6 }}
      />

      {/* Header: type + priority + menu */}
      <div className="flex items-center justify-between mb-2 mt-1 pl-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{
              background: `${tCfg.color}15`,
              color: tCfg.color,
              border: `1px solid ${tCfg.color}25`,
            }}
          >
            {tCfg.label}
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full"
            style={{
              background: `${pCfg.color}15`,
              color: pCfg.color,
              border: `1px solid ${pCfg.color}25`,
            }}
          >
            {pCfg.icon} {pCfg.label}
          </span>
          {task.source === 'ai-inferred' && (
            <span
              className="text-[8px] px-1 py-0.5 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.12)',
                color: '#a78bfa',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              AI {task.confidence ? `${Math.round(task.confidence * 100)}%` : ''}
            </span>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}
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
                style={{
                  background: tc.bgElevated,
                  borderColor: tc.borderDefault,
                  boxShadow: tc.shadowLg,
                }}
              >
                {[
                  {
                    label: 'Edit',
                    icon: Edit3,
                    color: tc.textSecondary,
                    action: () => {
                      onEdit(task)
                      setShowMenu(false)
                    },
                  },
                  {
                    label: 'Duplicate',
                    icon: Copy,
                    color: tc.textSecondary,
                    action: () => {
                      onDuplicate(task.id)
                      setShowMenu(false)
                    },
                  },
                  {
                    label: 'Archive',
                    icon: Archive,
                    color: '#f97316',
                    action: () => {
                      onArchive(task.id)
                      setShowMenu(false)
                    },
                  },
                  {
                    label: 'Delete',
                    icon: Trash2,
                    color: '#ef4444',
                    action: () => {
                      onDelete(task.id)
                      setShowMenu(false)
                    },
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation()
                      item.action()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors hover:bg-white/5"
                    style={{ color: item.color }}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t my-1" style={{ borderColor: tc.borderSubtle }} />
                <div className="px-3 py-1">
                  <p className="text-[9px] mb-1" style={{ color: tc.textMuted }}>
                    Move to:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {KANBAN_COLUMNS.filter((s) => s !== task.status).map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveTask(task.id, s)
                          setShowMenu(false)
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded border transition-colors hover:bg-white/5"
                        style={{
                          color: STATUS_CONFIG[s].color,
                          borderColor: `${STATUS_CONFIG[s].color}30`,
                        }}
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
      <h4 className="text-[13px] mb-1 line-clamp-2 pl-3" style={{ color: tc.textPrimary }}>
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-[10px] mb-2 line-clamp-2 pl-3" style={{ color: tc.textMuted }}>
          {task.description}
        </p>
      )}

      {/* Subtask progress */}
      {totalSubs > 0 && (
        <div className="mb-2 pl-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px]" style={{ color: tc.textMuted }}>
              {completedSubs}/{totalSubs} subtasks
            </span>
            <span
              className="text-[9px]"
              style={{ color: subProgress === 100 ? '#22c55e' : tc.textMuted }}
            >
              {Math.round(subProgress)}%
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${subProgress}%`,
                background: subProgress === 100 ? '#22c55e' : pCfg.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 pl-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[8px] px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: tc.textMuted,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[8px] px-1 py-0.5" style={{ color: tc.textMuted }}>
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pl-3">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className="flex items-center gap-0.5 text-[9px]"
              style={{ color: isOverdue ? '#ef4444' : tc.textMuted }}
            >
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: tc.textMuted }}>
              <Timer className="w-3 h-3" />
              {task.actualHours
                ? `${task.actualHours}/${task.estimatedHours}h`
                : `${task.estimatedHours}h`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {task.relatedFiles && task.relatedFiles.length > 0 && (
            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: tc.textMuted }}>
              <FileCode className="w-3 h-3" />
              {task.relatedFiles.length}
            </span>
          )}
          {(task.dependencies?.length ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: '#f97316' }}>
              <Layers className="w-3 h-3" />
              {task.dependencies!.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Droppable Kanban Column
// ==========================================

export function DroppableKanbanColumn({
  status,
  tasks,
  tc,
  selectedIds,
  onSelect,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
}: {
  status: TaskStatus
  tasks: Task[]
  tc: ReturnType<typeof useThemeColors>
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onDuplicate: (id: string) => void
}) {
  const moveTask = useTaskStore((s) => s.moveTask)
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        moveTask(item.id, status)
      }
    },
    canDrop: (item: { id: string; status: TaskStatus }) => item.status !== status,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const isActive = isOver && canDrop

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
          </div>
          <span className="text-[12px]" style={{ color: tc.textPrimary }}>
            {cfg.label}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: `${cfg.color}12`, color: cfg.color }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={drop}
        className="flex-1 space-y-2 p-2 rounded-xl border min-h-[120px] overflow-y-auto transition-all duration-200"
        style={{
          background: isActive ? `${cfg.color}18` : cfg.bgColor,
          borderColor: isActive ? `${cfg.color}50` : `${cfg.color}15`,
          boxShadow: isActive ? `inset 0 0 20px ${cfg.color}15, 0 0 15px ${cfg.color}10` : 'none',
          transform: isActive ? 'scale(1.01)' : 'scale(1)',
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
              {isActive ? 'Drop here' : 'No tasks'}
            </span>
          </div>
        )}
        {/* Drop indicator when dragging over */}
        {isActive && tasks.length > 0 && (
          <div
            className="rounded-lg border-2 border-dashed py-3 text-center transition-all"
            style={{ borderColor: `${cfg.color}50` }}
          >
            <span className="text-[10px]" style={{ color: cfg.color }}>
              Drop here
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// Task Modal (Create / Edit)
// ==========================================

export function TaskModal({
  tc,
  task,
  onSave,
  onClose,
}: {
  tc: ReturnType<typeof useThemeColors>
  task: Task | null
  onSave: (data: Partial<Task>) => void
  onClose: () => void
}) {
  const isEdit = !!task
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [type, setType] = useState<TaskType>(task?.type ?? 'feature')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [tagsInput, setTagsInput] = useState(task?.tags?.join(', ') ?? '')
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours?.toString() ?? '')
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
  )

  const handleSubmit = () => {
    if (!title.trim()) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({
      ...(task ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      type,
      status,
      tags: tags.length > 0 ? tags : undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    })
  }

  const inputStyle = {
    background: tc.bgInput,
    borderColor: tc.borderDefault,
    color: tc.textPrimary,
  }
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = `${tc.primary}50`
    e.currentTarget.style.boxShadow = `0 0 0 3px ${tc.primary}15`
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = tc.borderDefault
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="relative w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ background: tc.bgElevated, borderColor: tc.borderDefault, boxShadow: tc.shadowLg }}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: tc.borderSubtle }}
        >
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Edit3 className="w-4 h-4" style={{ color: tc.primary }} />
            ) : (
              <Plus className="w-4 h-4" style={{ color: tc.primary }} />
            )}
            <span className="text-sm" style={{ color: tc.textPrimary }}>
              {isEdit ? 'Edit Task' : 'Create Task'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4" style={{ color: tc.textMuted }} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label
              className="text-[10px] uppercase tracking-wider mb-1 block"
              style={{ color: tc.textMuted }}
            >
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-3 py-2 text-[13px] rounded-xl border outline-none transition-all"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          <div>
            <label
              className="text-[10px] uppercase tracking-wider mb-1 block"
              style={{ color: tc.textMuted }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={3}
              className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none transition-all resize-none"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                className="text-[10px] uppercase tracking-wider mb-1 block"
                style={{ color: tc.textMuted }}
              >
                Priority
              </label>
              <div className="flex flex-col gap-1">
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className="text-[10px] px-2 py-1 rounded-lg border text-left transition-all"
                    style={{
                      background: priority === p ? `${PRIORITY_CONFIG[p].color}15` : 'transparent',
                      borderColor:
                        priority === p ? `${PRIORITY_CONFIG[p].color}40` : tc.borderSubtle,
                      color: priority === p ? PRIORITY_CONFIG[p].color : tc.textMuted,
                    }}
                  >
                    {PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                className="text-[10px] uppercase tracking-wider mb-1 block"
                style={{ color: tc.textMuted }}
              >
                Type
              </label>
              <div className="flex flex-col gap-1">
                {(Object.keys(TYPE_CONFIG) as TaskType[]).map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setType(tp)}
                    className="text-[10px] px-2 py-1 rounded-lg border text-left transition-all"
                    style={{
                      background: type === tp ? `${TYPE_CONFIG[tp].color}15` : 'transparent',
                      borderColor: type === tp ? `${TYPE_CONFIG[tp].color}40` : tc.borderSubtle,
                      color: type === tp ? TYPE_CONFIG[tp].color : tc.textMuted,
                    }}
                  >
                    {TYPE_CONFIG[tp].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                className="text-[10px] uppercase tracking-wider mb-1 block"
                style={{ color: tc.textMuted }}
              >
                Status
              </label>
              <div className="flex flex-col gap-1">
                {KANBAN_COLUMNS.map((s) => {
                  const SIcon = STATUS_CONFIG[s].icon
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className="text-[10px] px-2 py-1 rounded-lg border text-left transition-all flex items-center gap-1"
                      style={{
                        background: status === s ? `${STATUS_CONFIG[s].color}15` : 'transparent',
                        borderColor: status === s ? `${STATUS_CONFIG[s].color}40` : tc.borderSubtle,
                        color: status === s ? STATUS_CONFIG[s].color : tc.textMuted,
                      }}
                    >
                      <SIcon className="w-3 h-3" />
                      {STATUS_CONFIG[s].label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="text-[10px] uppercase tracking-wider mb-1 block"
                style={{ color: tc.textMuted }}
              >
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="text-[10px] uppercase tracking-wider mb-1 block"
                style={{ color: tc.textMuted }}
              >
                Est. Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label
              className="text-[10px] uppercase tracking-wider mb-1 block"
              style={{ color: tc.textMuted }}
            >
              Tags (comma separated)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="auth, security, P0"
              className="w-full px-3 py-2 text-[12px] rounded-xl border outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <div
          className="flex items-center justify-end gap-2 px-5 py-3 border-t"
          style={{ borderColor: tc.borderSubtle }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] rounded-xl border transition-all hover:bg-white/5"
            style={{ borderColor: tc.borderDefault, color: tc.textMuted }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 text-[12px] rounded-xl border transition-all"
            style={{
              background: title.trim() ? tc.gradientButton : 'rgba(255,255,255,0.05)',
              borderColor: title.trim() ? `${tc.primary}40` : tc.borderDefault,
              color: title.trim() ? '#fff' : tc.textMuted,
              opacity: title.trim() ? 1 : 0.5,
            }}
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ==========================================
// AI Inference Panel (with multiple modes)
// ==========================================

export function AIInferencePanel({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const addTask = useTaskStore((s) => s.addTask)
  const [mode, setMode] = useState<'conversation' | 'code' | 'description'>('conversation')
  const [input, setInput] = useState('')
  const [inferring, setInferring] = useState(false)
  const [results, setResults] = useState<TaskInferenceResult[]>([])

  const placeholders: Record<string, string> = {
    conversation:
      'Paste AI conversation text here... e.g. "We need to add rate limiting to the API and fix the WebSocket reconnection bug"',
    code: 'Paste code with TODO/FIXME comments... e.g.\n// TODO: implement retry logic\n// FIXME: memory leak in useEffect',
    description:
      'Describe the work to be done... e.g. "Optimize the first load performance, implement code splitting with React.lazy"',
  }

  const handleInfer = async () => {
    if (!input.trim() && results.length === 0) return
    setInferring(true)
    setResults([])
    try {
      let res: TaskInferenceResult[]
      if (mode === 'conversation') res = await aiInference.inferFromConversation(input)
      else if (mode === 'code') res = await aiInference.inferFromCode(input)
      else res = await aiInference.inferFromDescription(input)
      setResults(res)
    } catch {
      // ignore
    }
    setInferring(false)
  }

  const handleAccept = (r: TaskInferenceResult) => {
    addTask({
      title: r.title,
      description: r.description,
      status: 'todo',
      priority: r.priority,
      type: r.type,
      tags: r.tags,
      estimatedHours: r.estimatedHours,
      relatedFiles: r.relatedFiles,
      source: 'ai-inferred',
      confidence: r.confidence,
    })
    setResults((prev) => prev.filter((x) => x !== r))
  }

  const modeConfig = [
    { id: 'conversation' as const, label: 'Conversation', icon: MessageSquare, color: '#3b82f6' },
    { id: 'code' as const, label: 'Code Scan', icon: Code, color: '#22c55e' },
    { id: 'description' as const, label: 'Description', icon: Edit3, color: '#f97316' },
  ]

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: '#a78bfa' }} />
          <span className="text-[12px]" style={{ color: tc.textPrimary }}>
            AI Task Inference
          </span>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-1">
        {modeConfig.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id)
              setResults([])
            }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all"
            style={{
              background: mode === m.id ? `${m.color}12` : 'transparent',
              borderColor: mode === m.id ? `${m.color}30` : tc.borderSubtle,
              color: mode === m.id ? m.color : tc.textMuted,
            }}
          >
            <m.icon className="w-3 h-3" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholders[mode]}
        rows={3}
        className="w-full px-3 py-2 text-[11px] rounded-xl border outline-none resize-none transition-all"
        style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#a78bfa50'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.1)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = tc.borderDefault
          e.currentTarget.style.boxShadow = 'none'
        }}
      />

      <button
        onClick={handleInfer}
        disabled={inferring || !input.trim()}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] px-3 py-2 rounded-xl border transition-all"
        style={{
          background: inferring
            ? 'transparent'
            : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
          borderColor: 'rgba(139,92,246,0.3)',
          color: '#a78bfa',
          opacity: !input.trim() && !inferring ? 0.5 : 1,
        }}
      >
        {inferring ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        {inferring
          ? 'AI Analyzing...'
          : `Infer Tasks from ${modeConfig.find((m) => m.id === mode)?.label}`}
      </button>

      {/* Results */}
      <AnimatePresence>
        {results.map((r, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-xl border p-3"
            style={{
              background: `${TYPE_CONFIG[r.type].color}06`,
              borderColor: `${TYPE_CONFIG[r.type].color}20`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <Sparkles
                    className="w-3 h-3 shrink-0"
                    style={{ color: PRIORITY_CONFIG[r.priority].color }}
                  />
                  <span className="text-[12px] truncate" style={{ color: tc.textPrimary }}>
                    {r.title}
                  </span>
                </div>
                <p className="text-[10px] mb-1.5 line-clamp-2" style={{ color: tc.textMuted }}>
                  {r.description}
                </p>
                <p className="text-[9px] italic mb-2" style={{ color: tc.textMuted }}>
                  Reasoning: {r.reasoning}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${TYPE_CONFIG[r.type].color}15`,
                      color: TYPE_CONFIG[r.type].color,
                    }}
                  >
                    {TYPE_CONFIG[r.type].label}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${PRIORITY_CONFIG[r.priority].color}15`,
                      color: PRIORITY_CONFIG[r.priority].color,
                    }}
                  >
                    {PRIORITY_CONFIG[r.priority].label}
                  </span>
                  {r.estimatedHours && (
                    <span className="text-[9px]" style={{ color: tc.textMuted }}>
                      {r.estimatedHours}h
                    </span>
                  )}
                  <span className="text-[9px]" style={{ color: tc.textMuted }}>
                    Confidence: {Math.round(r.confidence * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => handleAccept(r)}
                  className="text-[9px] px-2 py-1 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}
                >
                  <Check className="w-3 h-3 inline mr-0.5" />
                  Accept
                </button>
                <button
                  onClick={() => setResults((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-[9px] px-2 py-1 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                >
                  <X className="w-3 h-3 inline mr-0.5" />
                  Dismiss
                </button>
              </div>
            </div>
            <div
              className="mt-2 h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${r.confidence * 100}%` }}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
                style={{ background: PRIORITY_CONFIG[r.priority].color }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ==========================================
// Reminders Panel
// ==========================================

export function RemindersPanel({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const reminders = useTaskStore((s) => s.reminders)
  const tasks = useTaskStore((s) => s.tasks)
  const dismissReminder = useTaskStore((s) => s.dismissReminder)

  const unread = reminders.filter((r) => !r.isRead)
  const typeColors: Record<ReminderType, string> = {
    deadline: '#ef4444',
    dependency: '#f97316',
    blocking: '#eab308',
    progress: '#22c55e',
    custom: '#8b5cf6',
  }

  if (unread.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 space-y-2"
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.04))',
        borderColor: 'rgba(239,68,68,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <BellRing className="w-4 h-4" style={{ color: '#ef4444' }} />
        <span className="text-[12px]" style={{ color: tc.textPrimary }}>
          Reminders ({unread.length})
        </span>
      </div>
      {unread.slice(0, 3).map((r) => {
        const task = tasks.find((t) => t.id === r.taskId)
        return (
          <div
            key={r.id}
            className="flex items-start justify-between gap-2 px-2 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ background: typeColors[r.type] }}
              />
              <div>
                <p className="text-[11px]" style={{ color: tc.textSecondary }}>
                  {r.message}
                </p>
                {task && (
                  <p className="text-[9px] mt-0.5" style={{ color: tc.textMuted }}>
                    {task.title}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissReminder(r.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" style={{ color: tc.textMuted }} />
            </button>
          </div>
        )
      })}
    </motion.div>
  )
}

// ==========================================
// Stats View
// ==========================================

export function TaskStats({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const tasks = useTaskStore((s) => s.tasks)
  const active = tasks.filter((t) => !t.isArchived)
  const total = active.length
  const overdue = active.filter(
    (t) => t.dueDate && t.dueDate < Date.now() && t.status !== 'done',
  ).length
  const aiInferred = active.filter((t) => t.source === 'ai-inferred').length
  const totalEstHours = active.reduce((s, t) => s + (t.estimatedHours ?? 0), 0)

  const byStatus = KANBAN_COLUMNS.map((s) => ({
    status: s,
    count: active.filter((t) => t.status === s).length,
    ...STATUS_CONFIG[s],
  }))
  const stats = [
    { label: 'Total Tasks', value: total.toString(), icon: ClipboardList, color: tc.primary },
    { label: 'Overdue', value: overdue.toString(), icon: AlertTriangle, color: '#ef4444' },
    { label: 'AI Inferred', value: aiInferred.toString(), icon: Brain, color: '#a78bfa' },
    { label: 'Est. Hours', value: `${totalEstHours}h`, icon: Timer, color: '#f97316' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border p-3 flex items-center gap-3"
              style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}
              >
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[18px]" style={{ color: tc.textPrimary }}>
                  {s.value}
                </p>
                <p className="text-[10px]" style={{ color: tc.textMuted }}>
                  {s.label}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
      >
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
          Status Distribution
        </p>
        <div className="space-y-2">
          {byStatus.map((s) => {
            const pct = total > 0 ? (s.count / total) * 100 : 0
            return (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-[11px] w-20 shrink-0" style={{ color: s.color }}>
                  {s.label}
                </span>
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    style={{ background: s.color }}
                  />
                </div>
                <span className="text-[10px] w-8 text-right" style={{ color: tc.textMuted }}>
                  {s.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
      >
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
          Priority Breakdown
        </p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
            const count = active.filter((t) => t.priority === p).length
            const cfg = PRIORITY_CONFIG[p]
            return (
              <div
                key={p}
                className="text-center rounded-xl border p-2"
                style={{ background: `${cfg.color}08`, borderColor: `${cfg.color}20` }}
              >
                <p className="text-[16px]" style={{ color: cfg.color }}>
                  {count}
                </p>
                <p className="text-[9px]" style={{ color: tc.textMuted }}>
                  {cfg.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// List View
// ==========================================

export function ListView({
  tasks,
  tc,
  selectedIds,
  onSelect,
  onEdit,
  onDelete,
}: {
  tasks: Task[]
  tc: ReturnType<typeof useThemeColors>
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
    >
      <div
        className="grid grid-cols-12 gap-2 px-4 py-2 border-b text-[10px] uppercase tracking-wider"
        style={{ borderColor: tc.borderSubtle, color: tc.textMuted }}
      >
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
      {tasks.map((task, _idx) => {
        const sCfg = STATUS_CONFIG[task.status]
        const pCfg = PRIORITY_CONFIG[task.priority]
        const tCfg = TYPE_CONFIG[task.type]
        const isOverdue = task.dueDate && task.dueDate < Date.now() && task.status !== 'done'
        const SIcon = sCfg.icon
        return (
          <div
            key={task.id}
            className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b items-center cursor-pointer transition-colors hover:bg-white/[0.02] group"
            style={{
              borderColor: tc.borderSubtle,
              background: selectedIds.has(task.id) ? `${pCfg.color}06` : 'transparent',
            }}
            onClick={() => onSelect(task.id)}
          >
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.has(task.id)}
                onChange={() => onSelect(task.id)}
                className="w-3.5 h-3.5 rounded border"
                style={{ accentColor: tc.primary }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="col-span-4">
              <p className="text-[12px] truncate" style={{ color: tc.textPrimary }}>
                {task.title}
              </p>
              {task.tags && task.tags.length > 0 && (
                <div className="flex gap-1 mt-0.5">
                  {task.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] px-1 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: tc.textMuted }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-1">
              <span className="flex items-center gap-1 text-[10px]" style={{ color: sCfg.color }}>
                <SIcon className="w-3 h-3" />
                {sCfg.label}
              </span>
            </div>
            <div className="col-span-1">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: `${pCfg.color}15`, color: pCfg.color }}
              >
                {pCfg.icon} {pCfg.label}
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-[10px]" style={{ color: tCfg.color }}>
                {tCfg.label}
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-[10px]" style={{ color: isOverdue ? '#ef4444' : tc.textMuted }}>
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-[10px]" style={{ color: tc.textMuted }}>
                {task.estimatedHours ? `${task.estimatedHours}h` : '-'}
              </span>
            </div>
            <div className="col-span-1">
              {task.source === 'ai-inferred' ? (
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}
                >
                  AI
                </span>
              ) : (
                <span className="text-[8px]" style={{ color: tc.textMuted }}>
                  Manual
                </span>
              )}
            </div>
            <div className="col-span-1 flex items-center justify-end gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(task)
                }}
                className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
              >
                <Edit3 className="w-3 h-3" style={{ color: tc.textMuted }} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
                className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
              >
                <Trash2 className="w-3 h-3" style={{ color: '#ef4444' }} />
              </button>
            </div>
          </div>
        )
      })}
      {tasks.length === 0 && (
        <div className="text-center py-12" style={{ color: tc.textMuted }}>
          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No tasks match your filters</p>
        </div>
      )}
    </div>
  )
}

// ==========================================
// Main Page Component
// ==========================================
