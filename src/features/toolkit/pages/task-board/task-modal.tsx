/**
 * @file task-modal.tsx
 * @description 任务看板·新建/编辑任务弹窗(F-11 自 task-board-components.tsx 拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,TaskModal
 */

import { Edit3, Plus, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { KANBAN_COLUMNS, PRIORITY_CONFIG, STATUS_CONFIG, TYPE_CONFIG } from '../task-board-data'

import type { Task, TaskPriority, TaskStatus, TaskType } from '../task-board-data'

import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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
