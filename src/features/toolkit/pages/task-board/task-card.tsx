/**
 * @file task-card.tsx
 * @description 任务看板·可拖拽任务卡(F-11 自 task-board-components.tsx 拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,DraggableTaskCard
 */

import {
  Archive,
  Calendar,
  Copy,
  Edit3,
  FileCode,
  GripVertical,
  Layers,
  MoreHorizontal,
  Timer,
  Trash2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'

import {
  DND_ITEM_TYPE,
  KANBAN_COLUMNS,
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  TYPE_CONFIG,
} from '../task-board-data'
import { useTaskStore } from '../task-board-store'

import type { Task, TaskStatus } from '../task-board-data'

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
  const { t } = useI18n()
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
        {t(task.title)}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-[10px] mb-2 line-clamp-2 pl-3" style={{ color: tc.textMuted }}>
          {t(task.description)}
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
