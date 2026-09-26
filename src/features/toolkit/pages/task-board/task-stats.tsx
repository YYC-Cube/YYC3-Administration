/**
 * @file task-stats.tsx
 * @description 任务看板·统计条(F-11 自 task-board-components.tsx 拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,TaskStats
 */

import { AlertTriangle, Brain, ClipboardList, Timer } from 'lucide-react'
import { motion } from 'motion/react'

import { KANBAN_COLUMNS, PRIORITY_CONFIG, STATUS_CONFIG } from '../task-board-data'
import { useTaskStore } from '../task-board-store'

import type { TaskPriority } from '../task-board-data'

import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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
