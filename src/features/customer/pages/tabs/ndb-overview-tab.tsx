/**
 * @file ndb-overview-tab.tsx
 * @description 号牌库·总览标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,OverviewTab
 */

import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CalendarDays,
  ChevronRight,
  Flame,
  Repeat,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { stagePieData, weeklyTrend } from '../number-database-data'
import { NeonTooltip, StatCard } from '../number-database-shared'

import type { Contact } from '../number-database-data'

import { useI18n } from '@/app/components/i18n-context'

export function OverviewTab({ contacts }: { contacts: Contact[] }) {
  const { t } = useI18n()
  const totalValue = contacts.reduce((s, c) => s + c.totalValue, 0)
  const avgAI = contacts.length
    ? Math.round(contacts.reduce((s, c) => s + c.aiScore, 0) / contacts.length)
    : 0
  const highRisk = contacts.filter((c) => c.riskLevel === 'high').length
  const todayFollowUp = contacts.filter((c) => c.tags.includes('pending')).length

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.totalCustomers')}
          value={contacts.length.toString()}
          icon={Users}
          color="#00f0ff"
          change={t('ndb.thisWeek', { count: 12 })}
        />
        <StatCard
          label={t('ndb.totalValue')}
          value={`¥${(totalValue / 10000).toFixed(1)}万`}
          icon={TrendingUp}
          color="#00ffc8"
          change="+18.5%"
        />
        <StatCard
          label={t('ndb.avgAiScore')}
          value={avgAI.toString()}
          icon={Brain}
          color="#00d4ff"
          change="+3.2"
        />
        <StatCard
          label={t('ndb.pendingFollowUp')}
          value={`${todayFollowUp}`}
          icon={Bell}
          color="#00ffcc"
          change={t('ndb.highRiskCount', { count: highRisk })}
          trend={highRisk > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Trend */}
        <div
          className="xl:col-span-2 rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.weeklyTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMagenta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => t(v)}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<NeonTooltip />} />
              <Area
                type="monotone"
                dataKey="新客户"
                name={t('ndb.newCustomers')}
                stroke="#00f0ff"
                fill="url(#gradCyan)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="跟进"
                name={t('ndb.followUp')}
                stroke="#00d4ff"
                fill="url(#gradMagenta)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="成交"
                name={t('ndb.deals')}
                stroke="#00ffcc"
                fill="rgba(0,255,204,0.05)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stage Pie */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#00d4ff]" />
            {t('ndb.stageDist')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <Pie>
              <Pie
                data={stagePieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {stagePieData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}50)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<NeonTooltip />} />
            </Pie>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {stagePieData.map((s) => (
              <span
                key={s.name}
                className="text-[9px] flex items-center gap-1"
                style={{ color: `${s.color}90` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: s.color }}
                />
                {t(s.name)} {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Tasks & Recent Follow-ups */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Today's Follow-ups */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,204,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-[#00ffcc]" />
            {t('ndb.todayTasks')}
          </h3>
          <div className="space-y-2">
            {[
              {
                task: 'ndbo.task.1.task',
                priority: 'ndb.high',
                time: 'ndbo.task.1.time',
                color: '#005f73',
              },
              {
                task: 'ndbo.task.2.task',
                priority: 'ndb.medium',
                time: 'ndbo.task.2.time',
                color: '#00ffcc',
              },
              {
                task: 'ndbo.task.3.task',
                priority: 'ndb.high',
                time: 'ndbo.task.3.time',
                color: '#005f73',
              },
              {
                task: 'ndbo.task.4.task',
                priority: 'ndb.medium',
                time: 'ndbo.task.4.time',
                color: '#00ffcc',
              },
              {
                task: 'ndbo.task.5.task',
                priority: 'ndb.low',
                time: 'ndbo.task.5.time',
                color: '#00ffc8',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-1.5 h-8 rounded-full"
                  style={{ background: item.color, boxShadow: `0 0 6px ${item.color}40` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 truncate">{t(item.task)}</p>
                  <p className="text-[9px] text-white/20">{t(item.time)}</p>
                </div>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${item.color}15`,
                    color: item.color,
                    border: `1px solid ${item.color}25`,
                  }}
                >
                  {t(item.priority)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
            {t('ndb.aiRecommend')}
          </h3>
          <div className="space-y-2">
            {[
              {
                action: 'ndbo.rec.1.action',
                target: 'ndbo.rec.1.target',
                reason: 'ndbo.rec.1.reason',
                icon: AlertTriangle,
                color: '#005f73',
              },
              {
                action: 'ndbo.rec.2.action',
                target: 'ndbo.rec.2.target',
                reason: 'ndbo.rec.2.reason',
                icon: Send,
                color: '#00ffcc',
              },
              {
                action: 'ndbo.rec.3.action',
                target: 'ndbo.rec.3.target',
                reason: 'ndbo.rec.3.reason',
                icon: Repeat,
                color: '#00ffc8',
              },
              {
                action: 'ndbo.rec.4.action',
                target: 'ndbo.rec.4.target',
                reason: 'ndbo.rec.4.reason',
                icon: Zap,
                color: '#00d4ff',
              },
              {
                action: 'ndbo.rec.5.action',
                target: 'ndbo.rec.5.target',
                reason: 'ndbo.rec.5.reason',
                icon: Flame,
                color: '#008b9d',
              },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:border-white/10 group cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${r.color}15`, border: `1px solid ${r.color}25` }}
                >
                  <r.icon className="w-3.5 h-3.5" style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: `${r.color}15`, color: r.color }}
                    >
                      {t(r.action)}
                    </span>
                    <span className="text-[11px] text-white/60 truncate">{t(r.target)}</span>
                  </div>
                  <p className="text-[9px] text-white/25 mt-0.5">{t(r.reason)}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Contacts (inline contact list with quick actions)
// ===========================================================
