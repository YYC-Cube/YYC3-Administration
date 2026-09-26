/**
 * @file list-view.tsx
 * @description 任务看板·列表视图(F-11 自 task-board-components.tsx 拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,ListView
 */

import { ClipboardList, Edit3, Trash2 } from 'lucide-react'

import { PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG } from '../task-board-data'

import type { Task } from '../task-board-data'

import { useI18n } from '@/app/components/i18n-context'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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
  const { t } = useI18n()
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
                {t(task.title)}
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
