/**
 * @file reminders-panel.tsx
 * @description 任务看板·提醒面板(F-11 自 task-board-components.tsx 拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,RemindersPanel
 */

import { BellRing, X } from 'lucide-react'
import { motion } from 'motion/react'

import {} from '../task-board-data'
import { useTaskStore } from '../task-board-store'

import type { ReminderType } from '../task-board-data'

import { useI18n } from '@/app/components/i18n-context'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

export function RemindersPanel({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
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
                  {t(r.message)}
                </p>
                {task && (
                  <p className="text-[9px] mt-0.5" style={{ color: tc.textMuted }}>
                    {t(task.title)}
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
