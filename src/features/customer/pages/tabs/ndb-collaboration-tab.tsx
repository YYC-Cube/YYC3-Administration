/**
 * @file ndb-collaboration-tab.tsx
 * @description 号牌库·协作标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,CollaborationTab
 */

import { Check, Clock, FileText, Layers, Users, Zap } from 'lucide-react'
import { useState } from 'react'

import { StatCard } from '../number-database-shared'

import { useI18n } from '@/app/components/i18n-context'

export function CollaborationTab() {
  const { t } = useI18n()
  const [selectedTask, setSelectedTask] = useState<number | null>(null)

  const tasks = [
    {
      id: 1,
      title: 'ndbc.task.1.title',
      assignee: 'ndbc.task.1.assignee',
      status: 'ndb.inProgress',
      priority: 'ndb.high',
      progress: 72,
      deadline: '2026-03-15',
      color: '#00f0ff',
    },
    {
      id: 2,
      title: 'ndbc.task.2.title',
      assignee: 'ndbc.task.2.assignee',
      status: 'ndb.inReview',
      priority: 'ndb.high',
      progress: 45,
      deadline: '2026-03-20',
      color: '#00d4ff',
    },
    {
      id: 3,
      title: 'ndbc.task.3.title',
      assignee: 'ndbc.task.3.assignee',
      status: 'ndb.notStarted',
      priority: 'ndb.medium',
      progress: 10,
      deadline: '2026-03-18',
      color: '#00ffcc',
    },
    {
      id: 4,
      title: 'ndbc.task.4.title',
      assignee: 'ndbc.task.4.assignee',
      status: 'ndb.inProgress',
      priority: 'ndb.high',
      progress: 88,
      deadline: '2026-03-14',
      color: '#00ffc8',
    },
    {
      id: 5,
      title: 'ndbc.task.5.title',
      assignee: 'ndbc.task.5.assignee',
      status: 'ndb.completed',
      priority: 'ndb.low',
      progress: 100,
      deadline: '2026-03-12',
      color: '#008b9d',
    },
    {
      id: 6,
      title: 'ndbc.task.6.title',
      assignee: 'ndbc.task.6.assignee',
      status: 'ndb.inProgress',
      priority: 'ndb.medium',
      progress: 56,
      deadline: '2026-03-22',
      color: '#00f0ff',
    },
  ]

  const progressData = [
    { person: 'ndbc.task.1.assignee', completed: 12, total: 15 },
    { person: 'ndbc.task.2.assignee', completed: 8, total: 12 },
    { person: 'ndbc.task.3.assignee', completed: 6, total: 10 },
    { person: 'ndbc.task.4.assignee', completed: 14, total: 16 },
    { person: 'ndbc.task.5.assignee', completed: 10, total: 10 },
    { person: 'ndbc.task.6.assignee', completed: 7, total: 11 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.activeTasks')}
          value="24"
          icon={Layers}
          color="#00f0ff"
          change="+5"
        />
        <StatCard
          label={t('ndb.completionRate')}
          value="78.3%"
          icon={Check}
          color="#00ffc8"
          change="+6.2%"
        />
        <StatCard
          label={t('ndb.avgProcessTime')}
          value="2.3d"
          icon={Clock}
          color="#00ffcc"
          change="-0.5d"
        />
        <StatCard
          label={t('ndb.teamEfficiency')}
          value="92.1"
          icon={Zap}
          color="#00d4ff"
          change="+3.8"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Task List */}
        <div
          className="xl:col-span-2 rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.taskBoard')}
          </h3>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 group"
                style={{
                  background:
                    selectedTask === task.id ? `${task.color}08` : 'rgba(255,255,255,0.02)',
                  borderColor:
                    selectedTask === task.id ? `${task.color}25` : 'rgba(255,255,255,0.04)',
                  animation: `spring-in 0.3s var(--spring-easing) ${i * 0.03}s both`,
                }}
              >
                <div
                  className="w-2 h-10 rounded-full"
                  style={{
                    background: task.color,
                    opacity: task.status === 'ndb.completed' ? 0.3 : 1,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/70 truncate">{t(task.title)}</p>
                  <p className="text-[9px] text-white/20">
                    {t(task.assignee)} · {task.deadline}
                  </p>
                </div>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      task.status === 'ndb.completed'
                        ? 'rgba(0,255,200,0.1)'
                        : task.status === 'ndb.inProgress'
                          ? 'rgba(0,240,255,0.1)'
                          : task.status === 'ndb.inReview'
                            ? 'rgba(0,212,255,0.1)'
                            : 'rgba(255,255,255,0.05)',
                    color:
                      task.status === 'ndb.completed'
                        ? '#00ffc8'
                        : task.status === 'ndb.inProgress'
                          ? '#00f0ff'
                          : task.status === 'ndb.inReview'
                            ? '#00d4ff'
                            : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${task.status === 'ndb.completed' ? 'rgba(0,255,200,0.2)' : task.status === 'ndb.inProgress' ? 'rgba(0,240,255,0.2)' : task.status === 'ndb.inReview' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {t(task.status)}
                </span>
                <div className="w-20 hidden sm:block">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${task.progress}%`,
                        background:
                          task.progress >= 80
                            ? '#00ffc8'
                            : task.progress >= 50
                              ? '#00ffcc'
                              : '#008b9d',
                      }}
                    />
                  </div>
                  <p className="text-[8px] text-white/15 text-right mt-0.5">{task.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Progress */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,200,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00ffc8]" />
            {t('ndb.teamProgress')}
          </h3>
          <div className="space-y-4">
            {progressData.map((p, i) => {
              const pct = Math.round((p.completed / p.total) * 100)
              const color =
                pct >= 90 ? '#00ffc8' : pct >= 70 ? '#00f0ff' : pct >= 50 ? '#00ffcc' : '#008b9d'
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-white/50">{t(p.person)}</span>
                    <span className="text-[10px] tabular-nums" style={{ color }}>
                      {p.completed}/{p.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: color,
                        boxShadow: `0 0 6px ${color}40`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Customer Value (客户价值管理)
// ===========================================================
