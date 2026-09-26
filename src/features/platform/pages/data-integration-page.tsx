import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  GitBranch,
  Pause,
  Play,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 数据集成页面 - Data Integration
// 企业级数据集成 · 实时CDC同步 · 数据质量保障
// ==========================================

type IntegrationTab = 'sources' | 'sync' | 'transform' | 'quality' | 'lineage' | 'monitoring'

interface DataSource {
  id: string
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  records: number
  quality: number
}

export function DataIntegrationPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<IntegrationTab>('sources')

  const dataSources: DataSource[] = [
    {
      id: 'mysql-1',
      name: t('dip.source.mainDb'),
      type: 'MySQL',
      status: 'connected',
      lastSync: t('dip.time.minAgo', { n: 1 }),
      records: 2840000,
      quality: 98,
    },
    {
      id: 'pg-1',
      name: t('dip.source.analyticsDb'),
      type: 'PostgreSQL',
      status: 'connected',
      lastSync: t('dip.time.minAgo', { n: 3 }),
      records: 1560000,
      quality: 95,
    },
    {
      id: 'redis-1',
      name: t('dip.source.cacheDb'),
      type: 'Redis',
      status: 'connected',
      lastSync: t('dip.time.realtime'),
      records: 128000,
      quality: 100,
    },
    {
      id: 'mongo-1',
      name: t('dip.source.docDb'),
      type: 'MongoDB',
      status: 'connected',
      lastSync: t('dip.time.minAgo', { n: 5 }),
      records: 890000,
      quality: 92,
    },
    {
      id: 'kafka-1',
      name: t('dip.source.mq'),
      type: 'Kafka',
      status: 'connected',
      lastSync: t('dip.time.realtime'),
      records: 56000,
      quality: 97,
    },
    {
      id: 'api-1',
      name: t('dip.source.externalApi'),
      type: 'REST API',
      status: 'error',
      lastSync: t('dip.time.hoursAgo', { n: 2 }),
      records: 0,
      quality: 0,
    },
  ]

  const syncThroughputData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    records: 5000 + Math.random() * 10000,
    errors: Math.random() * 100,
  }))

  const qualityTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: [
      t('ch.day.mon'),
      t('ch.day.tue'),
      t('ch.day.wed'),
      t('ch.day.thu'),
      t('ch.day.fri'),
      t('ch.day.sat'),
      t('ch.day.sun'),
    ][i],
    completeness: 92 + Math.random() * 6,
    accuracy: 88 + Math.random() * 8,
    consistency: 90 + Math.random() * 7,
  }))

  const tabs = [
    { id: 'sources' as const, label: t('di.cat.sources'), icon: Database },
    { id: 'sync' as const, label: t('di.cat.sync'), icon: Activity },
    { id: 'transform' as const, label: t('di.cat.transform'), icon: Cpu },
    { id: 'quality' as const, label: t('di.cat.quality'), icon: CheckCircle2 },
    { id: 'lineage' as const, label: t('di.cat.lineage'), icon: GitBranch },
    { id: 'monitoring' as const, label: t('di.cat.monitoring'), icon: BarChart3 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return tc.success
      case 'error':
        return tc.destructive
      case 'disconnected':
        return tc.muted
      default:
        return tc.muted
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return t('di.status.connected')
      case 'error':
        return t('di.status.error')
      case 'disconnected':
        return t('di.status.disconnected')
      default:
        return t('dip.status.unknown')
    }
  }

  const _getQualityColor = (quality: number) => {
    if (quality >= 95) return tc.success
    if (quality >= 85) return tc.warning
    return tc.destructive
  }

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, #06b6d4, ${tc.primary}, ${tc.secondary})`,
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: tc.alpha('#06b6d4', 0.1),
              border: `1px solid ${tc.alpha('#06b6d4', 0.2)}`,
              boxShadow: `0 0 15px ${tc.alpha('#06b6d4', 0.1)}`,
            }}
          >
            <Database className="w-5 h-5" style={{ color: '#06b6d4' }} />
          </div>
          <div>
            <h1
              className="tracking-wider"
              style={{
                color: tc.primary,
                textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
              }}
            >
              {t('di.title')}
            </h1>
            <p className="text-[10px] text-white/20 tracking-wider">{t('di.desc')}</p>
          </div>
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: tc.alpha('#06b6d4', 0.08),
              color: '#06b6d4',
              border: `1px solid ${tc.alpha('#06b6d4', 0.15)}`,
            }}
          >
            {t('di.platformIntegration')}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: t('di.stat.sources'),
              value: t('dip.stat.countValue', { n: 15 }),
              trend: t('di.stat.thisMonth'),
              trendUp: true,
              color: '#06b6d4',
            },
            {
              label: t('di.stat.syncTasks'),
              value: t('dip.stat.countValue', { n: 48 }),
              trend: t('di.status.running'),
              color: '#22c55e',
            },
            {
              label: t('di.stat.dataQuality'),
              value: t('dip.stat.qualityValue', { n: 94 }),
              trend: t('di.stat.plus3'),
              trendUp: true,
              color: '#8b5cf6',
            },
            {
              label: t('di.stat.dailyThroughput'),
              value: '2.1TB',
              trend: t('di.stat.stable'),
              color: '#f97316',
            },
          ].map((stat, idx) => (
            <NeonCard key={idx} color={stat.color}>
              <div
                style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.05}s both` }}
              >
                <p className="text-[10px] text-white/30 mb-1">{stat.label}</p>
                <p
                  className="text-xl mb-0.5"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 12px ${tc.alpha(stat.color, 0.3)}`,
                  }}
                >
                  {stat.value}
                </p>
                {stat.trend && (
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {stat.trend}
                  </span>
                )}
              </div>
            </NeonCard>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 whitespace-nowrap transition-all"
                style={{
                  background: isActive ? tc.alpha('#06b6d4', 0.15) : tc.alpha(tc.card, 0.5),
                  border: `1px solid ${isActive ? tc.alpha('#06b6d4', 0.3) : tc.alpha(tc.border, 0.1)}`,
                  color: isActive ? '#06b6d4' : tc.mutedForeground,
                  boxShadow: isActive ? `0 0 15px ${tc.alpha('#06b6d4', 0.2)}` : 'none',
                }}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {activeTab === 'sources' && (
          <div className="space-y-4">
            {dataSources.map((source, idx) => (
              <NeonCard key={idx} color={getStatusColor(source.status)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: tc.alpha(getStatusColor(source.status), 0.1),
                        border: `1px solid ${tc.alpha(getStatusColor(source.status), 0.2)}`,
                      }}
                    >
                      <Database
                        className="w-5 h-5"
                        style={{ color: getStatusColor(source.status) }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[12px] text-white/70">{source.name}</h4>
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(getStatusColor(source.status), 0.1),
                            color: getStatusColor(source.status),
                            border: `1px solid ${tc.alpha(getStatusColor(source.status), 0.2)}`,
                          }}
                        >
                          {source.type}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px] flex items-center gap-1"
                          style={{
                            background: tc.alpha(getStatusColor(source.status), 0.1),
                            color: getStatusColor(source.status),
                            border: `1px solid ${tc.alpha(getStatusColor(source.status), 0.2)}`,
                          }}
                        >
                          {source.status === 'connected' && (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          )}
                          {source.status === 'error' && <AlertTriangle className="w-2.5 h-2.5" />}
                          {getStatusText(source.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t('dip.lastSync')}: {source.lastSync}
                        </span>
                        {source.records > 0 && (
                          <>
                            <span>
                              {t('dip.recordCount')}: {source.records.toLocaleString()}
                            </span>
                            <span>
                              {t('dip.quality')}: {source.quality}
                              {t('dip.unit.points')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 rounded-lg text-[10px] transition-all"
                      onClick={() => {}}
                      style={{
                        background: tc.alpha(tc.secondary, 0.1),
                        border: `1px solid ${tc.alpha(tc.secondary, 0.2)}`,
                        color: tc.secondary,
                      }}
                    >
                      {t('dip.action.configure')}
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg text-[10px] transition-all"
                      onClick={() => {}}
                      style={{
                        background: tc.alpha(tc.accent, 0.1),
                        border: `1px solid ${tc.alpha(tc.accent, 0.2)}`,
                        color: tc.accent,
                      }}
                    >
                      {t('dip.action.test')}
                    </button>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-4">
            <NeonCard color={tc.primary}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: tc.primary }} />
                {t('dip.sync.taskList')}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: t('dip.sync.userSync'),
                    source: 'MySQL',
                    target: 'PostgreSQL',
                    mode: t('dip.mode.realtimeCdc'),
                    status: 'running',
                  },
                  {
                    name: t('dip.sync.orderSync'),
                    source: 'MySQL',
                    target: 'MongoDB',
                    mode: t('dip.mode.incremental'),
                    status: 'running',
                  },
                  {
                    name: t('dip.sync.logArchive'),
                    source: 'Kafka',
                    target: 'S3',
                    mode: t('dip.mode.batch'),
                    status: 'running',
                  },
                  {
                    name: t('dip.sync.analyticsUpdate'),
                    source: 'PostgreSQL',
                    target: 'Redis',
                    mode: t('dip.mode.scheduled'),
                    status: 'paused',
                  },
                ].map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      background: tc.alpha(tc.muted, 0.05),
                      border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-[11px] text-white/60">{task.name}</h4>
                        <p className="text-[9px] text-white/30">
                          {task.source} → {task.target}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(tc.accent, 0.1),
                            color: tc.accent,
                            border: `1px solid ${tc.alpha(tc.accent, 0.2)}`,
                          }}
                        >
                          {task.mode}
                        </span>
                        <button
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          onClick={() => {}}
                          style={{
                            background: tc.alpha(
                              task.status === 'running' ? tc.success : tc.warning,
                              0.1,
                            ),
                            border: `1px solid ${tc.alpha(task.status === 'running' ? tc.success : tc.warning, 0.2)}`,
                            color: task.status === 'running' ? tc.success : tc.warning,
                          }}
                        >
                          {task.status === 'running' ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>

            {/* Sync Throughput */}
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">{t('dip.sync.throughput')}</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={syncThroughputData}>
                    <defs>
                      <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tc.accent} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={tc.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="hour"
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <YAxis
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: tc.alpha(tc.card, 0.95),
                        border: `1px solid ${tc.alpha(tc.border, 0.3)}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="records"
                      stroke={tc.accent}
                      fill="url(#throughputGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === 'transform' && (
          <NeonCard color={tc.secondary}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: tc.secondary }} />
              {t('dip.transform.rules')}
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: t('dip.transform.masking'),
                  type: t('dip.transformType.masking'),
                  fields: ['phone', 'email', 'idCard'],
                  status: 'active',
                },
                {
                  name: t('dip.transform.amountConvert'),
                  type: t('dip.transformType.format'),
                  fields: ['amount'],
                  status: 'active',
                },
                {
                  name: t('dip.transform.timestampNorm'),
                  type: t('dip.transformType.type'),
                  fields: ['createdAt', 'updatedAt'],
                  status: 'active',
                },
                {
                  name: t('dip.transform.addressClean'),
                  type: t('dip.transformType.clean'),
                  fields: ['address'],
                  status: 'inactive',
                },
              ].map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg"
                  style={{
                    background: tc.alpha(tc.muted, 0.05),
                    border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-[11px] text-white/60">{rule.name}</h4>
                      <p className="text-[9px] text-white/30">
                        {t('dip.transform.fields')}: {rule.fields.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(tc.accent, 0.1),
                          color: tc.accent,
                          border: `1px solid ${tc.alpha(tc.accent, 0.2)}`,
                        }}
                      >
                        {rule.type}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(
                            rule.status === 'active' ? tc.success : tc.muted,
                            0.1,
                          ),
                          color: rule.status === 'active' ? tc.success : tc.mutedForeground,
                          border: `1px solid ${tc.alpha(rule.status === 'active' ? tc.success : tc.muted, 0.2)}`,
                        }}
                      >
                        {rule.status === 'active'
                          ? t('dip.state.enabled')
                          : t('dip.state.disabled')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {activeTab === 'quality' && (
          <div className="space-y-4">
            {/* Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  dimension: t('dip.quality.completeness'),
                  score: 94,
                  threshold: 90,
                  color: tc.success,
                },
                {
                  dimension: t('dip.quality.accuracy'),
                  score: 91,
                  threshold: 85,
                  color: tc.success,
                },
                {
                  dimension: t('dip.quality.consistency'),
                  score: 88,
                  threshold: 85,
                  color: tc.warning,
                },
              ].map((item, idx) => (
                <NeonCard key={idx} color={item.color}>
                  <div className="text-center">
                    <p className="text-[10px] text-white/30 mb-2">{item.dimension}</p>
                    <p
                      className="text-3xl mb-1"
                      style={{
                        color: item.color,
                        textShadow: `0 0 15px ${tc.alpha(item.color, 0.3)}`,
                      }}
                    >
                      {item.score}
                      <span className="text-lg">{t('dip.unit.points')}</span>
                    </p>
                    <p className="text-[9px] text-white/30">
                      {t('dip.quality.threshold')}: {item.threshold}
                      {t('dip.unit.points')}
                    </p>
                  </div>
                </NeonCard>
              ))}
            </div>

            {/* Quality Trend */}
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">{t('dip.quality.trend')}</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityTrendData}>
                    <XAxis
                      dataKey="day"
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <YAxis
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                      domain={[80, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: tc.alpha(tc.card, 0.95),
                        border: `1px solid ${tc.alpha(tc.border, 0.3)}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Line type="monotone" dataKey="completeness" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="consistency" stroke="#eab308" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === 'lineage' && (
          <NeonCard color={tc.warning}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4" style={{ color: tc.warning }} />
              {t('dip.lineage.title')}
            </h3>
            <div className="space-y-4">
              {[
                {
                  table: 'users',
                  upstream: ['user_raw', 'user_profile'],
                  downstream: ['user_analytics', 'user_report'],
                },
                {
                  table: 'orders',
                  upstream: ['order_raw', 'payment_info'],
                  downstream: ['sales_analytics', 'revenue_report'],
                },
              ].map((lineage, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg"
                  style={{
                    background: tc.alpha(tc.muted, 0.05),
                    border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                  }}
                >
                  <div className="text-center mb-3">
                    <div
                      className="inline-block px-3 py-2 rounded-lg"
                      style={{
                        background: tc.alpha(tc.warning, 0.15),
                        border: `1px solid ${tc.alpha(tc.warning, 0.3)}`,
                      }}
                    >
                      <h4 className="text-[12px]" style={{ color: tc.warning }}>
                        {lineage.table}
                      </h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-white/30 mb-2">{t('dip.lineage.upstream')}</p>
                      <div className="space-y-1">
                        {lineage.upstream.map((source, sidx) => (
                          <div
                            key={sidx}
                            className="px-2 py-1 rounded text-[10px] text-white/50"
                            style={{
                              background: tc.alpha(tc.muted, 0.05),
                              border: `1px solid ${tc.alpha(tc.border, 0.05)}`,
                            }}
                          >
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 mb-2">{t('dip.lineage.downstream')}</p>
                      <div className="space-y-1">
                        {lineage.downstream.map((target, tidx) => (
                          <div
                            key={tidx}
                            className="px-2 py-1 rounded text-[10px] text-white/50"
                            style={{
                              background: tc.alpha(tc.muted, 0.05),
                              border: `1px solid ${tc.alpha(tc.border, 0.05)}`,
                            }}
                          >
                            {target}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-4">
            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  metric: t('dip.metric.throughput'),
                  value: '8.5K/s',
                  status: 'good',
                  icon: Activity,
                },
                { metric: t('dip.metric.latency'), value: '45ms', status: 'good', icon: Clock },
                {
                  metric: t('dip.metric.errorRate'),
                  value: '0.02%',
                  status: 'good',
                  icon: CheckCircle2,
                },
                {
                  metric: t('dip.metric.queueBacklog'),
                  value: '128',
                  status: 'warning',
                  icon: AlertTriangle,
                },
              ].map((item, idx) => (
                <NeonCard key={idx} color={item.status === 'good' ? tc.success : tc.warning}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-white/30 mb-1">{item.metric}</p>
                      <p
                        className="text-lg"
                        style={{
                          color: item.status === 'good' ? tc.success : tc.warning,
                          textShadow: `0 0 12px ${tc.alpha(
                            item.status === 'good' ? tc.success : tc.warning,
                            0.3,
                          )}`,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                    <item.icon
                      className="w-4 h-4"
                      style={{
                        color: tc.alpha(item.status === 'good' ? tc.success : tc.warning, 0.5),
                      }}
                    />
                  </div>
                </NeonCard>
              ))}
            </div>

            {/* Alert Rules */}
            <NeonCard color={tc.destructive}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: tc.destructive }} />
                {t('dip.alert.rules')}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: t('dip.alert.syncLatency'),
                    condition: t('dip.alert.cond.latency'),
                    severity: 'critical',
                    enabled: true,
                  },
                  {
                    name: t('dip.alert.errorRate'),
                    condition: '> 1%',
                    severity: 'warning',
                    enabled: true,
                  },
                  {
                    name: t('dip.alert.qualityDrop'),
                    condition: t('dip.alert.cond.quality'),
                    severity: 'warning',
                    enabled: true,
                  },
                  {
                    name: t('dip.alert.throughputDrop'),
                    condition: '< 1K/s',
                    severity: 'info',
                    enabled: false,
                  },
                ].map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      background: tc.alpha(tc.muted, 0.05),
                      border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[11px] text-white/60">{rule.name}</h4>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(
                              rule.severity === 'critical'
                                ? tc.destructive
                                : rule.severity === 'warning'
                                  ? tc.warning
                                  : tc.accent,
                              0.1,
                            ),
                            color:
                              rule.severity === 'critical'
                                ? tc.destructive
                                : rule.severity === 'warning'
                                  ? tc.warning
                                  : tc.accent,
                            border: `1px solid ${tc.alpha(
                              rule.severity === 'critical'
                                ? tc.destructive
                                : rule.severity === 'warning'
                                  ? tc.warning
                                  : tc.accent,
                              0.2,
                            )}`,
                          }}
                        >
                          {rule.severity === 'critical'
                            ? t('dip.severity.critical')
                            : rule.severity === 'warning'
                              ? t('dip.severity.warning')
                              : t('dip.severity.info')}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(rule.enabled ? tc.success : tc.muted, 0.1),
                            color: rule.enabled ? tc.success : tc.mutedForeground,
                            border: `1px solid ${tc.alpha(rule.enabled ? tc.success : tc.muted, 0.2)}`,
                          }}
                        >
                          {rule.enabled ? t('dip.state.enabled') : t('dip.state.disabled')}
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-white/30">
                      {t('dip.alert.triggerCondition')}: {rule.condition}
                    </p>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        )}
      </div>

      {/* AI Capabilities */}
      <div className="px-6 pb-8">
        <NeonCard color={tc.accent} hoverable={false}>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 shrink-0" style={{ color: tc.accent }} />
            <div>
              <h4 className="text-[11px] text-white/60 mb-2">{t('dip.ai.features')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  t('dip.ai.connPool'),
                  t('dip.ai.syncPerf'),
                  t('dip.ai.conflictResolve'),
                  t('dip.ai.ruleRecommend'),
                  t('dip.ai.qualityScore'),
                  t('dip.ai.lineageDiscovery'),
                  t('dip.ai.anomalyDetection'),
                  t('dip.ai.fieldMapping'),
                ].map((cap, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{
                        background: tc.accent,
                        boxShadow: `0 0 4px ${tc.alpha(tc.accent, 0.5)}`,
                      }}
                    />
                    <span className="text-[10px] text-white/35">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}
