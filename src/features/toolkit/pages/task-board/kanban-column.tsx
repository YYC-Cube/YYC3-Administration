/**
 * @file kanban-column.tsx
 * @description 任务看板·看板列(拖放目标)(F-11 自 task-board-components.tsx 拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,DroppableKanbanColumn
 */

import {} from 'lucide-react'
import { useDrop } from 'react-dnd'

import { DND_ITEM_TYPE, STATUS_CONFIG } from '../task-board-data'
import { useTaskStore } from '../task-board-store'

import { DraggableTaskCard } from './task-card'

import type { Task, TaskStatus } from '../task-board-data'

import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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
