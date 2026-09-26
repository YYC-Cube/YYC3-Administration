import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { CyberTooltip } from '@/app/components/cyber-tooltip'
import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 数据洞察增强 — Enhanced Data Insights
// Phase 2A: AI 驱动分析 · 多维图表 · 预测建议
// ==========================================

/**
 * Enhanced Data Insights page with AI-driven analysis panels.
 */
export function InsightsEnhancedPage() {
  const { t } = useI18n()
  const tc = useThemeColors()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [aiInsightsExpanded, setAiInsightsExpanded] = useState(true)

  const insightMetrics = [
    {
      label: t('ins.responseTime'),
      value: '12ms',
      change: '-18%',
      color: tc.primary,
      positive: true,
    },
    {
      label: t('ins.taskSuccess'),
      value: '98.7%',
      change: '+2.3%',
      color: tc.success,
      positive: true,
    },
    {
      label: t('ins.satisfaction'),
      value: '4.8/5',
      change: '+0.3',
      color: tc.accent,
      positive: true,
    },
    {
      label: t('ins.sysLoad'),
      value: '42%',
      change: '-5%',
      color: tc.secondary,
      positive: true,
    },
  ]

  // Weekly trend data
  const weeklyTrend = useMemo(
    () => [
      { day: t('week.mon'), customers: 42, calls: 35, aiTasks: 128, conversion: 38.2 },
      { day: t('week.tue'), customers: 56, calls: 48, aiTasks: 156, conversion: 41.5 },
      { day: t('week.wed'), customers: 38, calls: 32, aiTasks: 112, conversion: 35.8 },
      { day: t('week.thu'), customers: 67, calls: 58, aiTasks: 189, conversion: 44.2 },
      { day: t('week.fri'), customers: 72, calls: 64, aiTasks: 201, conversion: 47.1 },
      { day: t('week.sat'), customers: 45, calls: 28, aiTasks: 95, conversion: 33.9 },
      { day: t('week.sun'), customers: 52, calls: 42, aiTasks: 167, conversion: 40.6 },
    ],
    [t],
  )

  // Conversion funnel
  const funnelData = [
    { stageKey: 'ins.funnel.impression', value: 12400, color: tc.primary },
    { stageKey: 'ins.funnel.click', value: 8200, color: tc.secondary },
    { stageKey: 'ins.funnel.register', value: 3400, color: tc.accent },
    { stageKey: 'ins.funnel.conversion', value: 1560, color: tc.success },
    { stageKey: 'ins.funnel.deal', value: 890, color: tc.warning },
  ]

  // AI Capability Radar
  const radarData = [
    { subjectKey: 'ins.radar.intent', score: 95, fullMark: 100 },
    { subjectKey: 'ins.radar.sentiment', score: 88, fullMark: 100 },
    { subjectKey: 'ins.radar.script', score: 92, fullMark: 100 },
    { subjectKey: 'ins.radar.conversion', score: 85, fullMark: 100 },
    { subjectKey: 'ins.radar.anomaly', score: 91, fullMark: 100 },
    { subjectKey: 'ins.radar.reasoning', score: 87, fullMark: 100 },
  ]

  // Channel performance
  const channelData = [
    { nameKey: 'ins.channel.aiOutbound', value: 42, color: tc.primary },
    { nameKey: 'ins.channel.website', value: 28, color: tc.secondary },
    { nameKey: 'ins.channel.social', value: 15, color: tc.accent },
    { nameKey: 'ins.channel.partner', value: 10, color: tc.success },
    { nameKey: 'ins.channel.referral', value: 5, color: tc.warning },
  ]

  // Hourly heatmap
  const hourlyData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        calls: Math.floor(Math.random() * 30) + (i >= 9 && i <= 18 ? 20 : 2),
        ai: Math.floor(Math.random() * 50) + (i >= 8 && i <= 22 ? 30 : 5),
      })),
    [],
  )

  // AI Insights
  const aiInsights = [
    {
      type: 'trend' as const,
      icon: TrendingUp,
      color: tc.success,
      titleKey: 'ins.ai.trend.title',
      descKey: 'ins.ai.trend.desc',
      confidence: 92,
      impactKey: 'ins.impact.high',
    },
    {
      type: 'anomaly' as const,
      icon: AlertCircle,
      color: tc.secondary,
      titleKey: 'ins.ai.anomaly.title',
      descKey: 'ins.ai.anomaly.desc',
      confidence: 87,
      impactKey: 'ins.impact.mid',
    },
    {
      type: 'prediction' as const,
      icon: Brain,
      color: tc.primary,
      titleKey: 'ins.ai.prediction.title',
      descKey: 'ins.ai.prediction.desc',
      confidence: 85,
      impactKey: 'ins.impact.high',
    },
    {
      type: 'recommendation' as const,
      icon: Lightbulb,
      color: tc.accent,
      titleKey: 'ins.ai.recommendation.title',
      descKey: 'ins.ai.recommendation.desc',
      confidence: 90,
      impactKey: 'ins.impact.mid',
    },
  ]

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="tracking-wider flex items-center gap-3"
            style={{ color: tc.primary, textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.5)}` }}
          >
            <BarChart3 className="w-6 h-6" />
            {t('ins.title')}
          </h2>
          <p className="text-xs text-white/25 mt-1 tracking-wider">
            AI-Powered Data Insights · Phase 2A Enhanced Analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300"
              style={{
                background:
                  timeRange === range ? tc.alpha(tc.primary, 0.12) : 'rgba(255,255,255,0.02)',
                border: `1px solid ${timeRange === range ? tc.alpha(tc.primary, 0.4) : 'rgba(255,255,255,0.06)'}`,
                color: timeRange === range ? tc.primary : 'rgba(255,255,255,0.3)',
              }}
            >
              {range === '7d'
                ? t('ins.range.7d')
                : range === '30d'
                  ? t('ins.range.30d')
                  : t('ins.range.90d')}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {insightMetrics.map((m, i) => (
          <NeonCard key={i} color={m.color}>
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{m.label}</p>
            <p
              className="text-2xl mb-1"
              style={{ color: m.color, textShadow: `0 0 15px ${m.color}60` }}
            >
              {m.value}
            </p>
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: m.positive ? tc.success : tc.muted }}
            >
              {m.positive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {m.change}
            </span>
          </NeonCard>
        ))}
      </div>

      {/* AI Insights Panel */}
      <NeonCard color={tc.secondary} hoverable={false} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: tc.secondary, animation: 'neon-pulse 2s ease-in-out infinite' }}
            />
            AI {t('ins.aiInsightsTitle')}
          </h3>
          <button
            onClick={() => setAiInsightsExpanded(!aiInsightsExpanded)}
            className="text-[10px] px-2 py-1 rounded-lg transition-all"
            style={{
              background: tc.alpha(tc.secondary, 0.06),
              border: `1px solid ${tc.alpha(tc.secondary, 0.15)}`,
              color: tc.secondary,
            }}
          >
            {aiInsightsExpanded ? t('ins.collapse') : t('ins.expand')}
          </button>
        </div>
        {aiInsightsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight, i) => {
              const Icon = insight.icon
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
                  style={{
                    background: `${insight.color}05`,
                    borderColor: `${insight.color}15`,
                    animation: `spring-in 0.3s var(--spring-easing) ${i * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${insight.color}35`
                    e.currentTarget.style.boxShadow = `0 0 15px ${insight.color}10`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${insight.color}15`
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${insight.color}12`,
                        border: `1px solid ${insight.color}25`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: insight.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm text-white/70">{t(insight.titleKey)}</h4>
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded-full"
                          style={{
                            background: tc.alpha(
                              insight.impactKey === 'ins.impact.high' ? tc.success : tc.secondary,
                              0.1,
                            ),
                            color:
                              insight.impactKey === 'ins.impact.high' ? tc.success : tc.secondary,
                            border: `1px solid ${tc.alpha(insight.impactKey === 'ins.impact.high' ? tc.success : tc.secondary, 0.2)}`,
                          }}
                        >
                          {t('ins.impact.label', { level: t(insight.impactKey) })}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/35 leading-relaxed mb-2">
                        {t(insight.descKey)}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Brain className="w-3 h-3" style={{ color: `${insight.color}60` }} />
                          <span className="text-[9px]" style={{ color: `${insight.color}80` }}>
                            {t('ins.ai.confidence', { n: insight.confidence })}
                          </span>
                        </div>
                        <div className="flex-1 h-1 rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${insight.confidence}%`,
                              background: `linear-gradient(90deg, ${insight.color}80, ${insight.color})`,
                              boxShadow: `0 0 4px ${insight.color}40`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </NeonCard>

      {/* Charts Row 1: Trend + Conversion Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Weekly Trend */}
        <div className="xl:col-span-2">
          <NeonCard color={tc.primary} hoverable={false}>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
              {t('ins.weeklyTrend')} · Multi-Metric
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="gradCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tc.primary} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={tc.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tc.accent} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={tc.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradConversion" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tc.secondary} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={tc.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CyberTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    name={t('ins.chart.customers')}
                    stroke={tc.primary}
                    strokeWidth={2}
                    fill="url(#gradCustomers)"
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    name={t('ins.chart.calls')}
                    stroke={tc.accent}
                    strokeWidth={2}
                    fill="url(#gradCalls)"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversion"
                    name={t('ins.chart.conversionRate')}
                    stroke={tc.secondary}
                    strokeWidth={1.5}
                    fill="url(#gradConversion)"
                    strokeDasharray="4 2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </NeonCard>
        </div>

        {/* Conversion Funnel */}
        <NeonCard color="#00ffc8" hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
            {t('ins.funnel.title')}
          </h3>
          <div className="space-y-3">
            {funnelData.map((stage, i) => {
              const widthPct = Math.max(20, (stage.value / funnelData[0].value) * 100)
              const dropRate =
                i > 0 ? ((1 - stage.value / funnelData[i - 1].value) * 100).toFixed(1) : null
              return (
                <div
                  key={i}
                  style={{ animation: `spring-in 0.3s var(--spring-easing) ${i * 0.08}s both` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white/40">{t(stage.stageKey)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: stage.color }}>
                        {stage.value.toLocaleString()}
                      </span>
                      {dropRate && <span className="text-[9px] text-white/15">-{dropRate}%</span>}
                    </div>
                  </div>
                  <div
                    className="h-5 rounded-lg overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-2"
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, ${stage.color}40, ${stage.color}80)`,
                        boxShadow: `0 0 8px ${stage.color}25`,
                        transition: 'width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="flex justify-between text-[10px]">
              <span className="text-white/20">{t('ins.funnel.totalRate')}</span>
              <span
                style={{ color: tc.success, textShadow: `0 0 6px ${tc.alpha(tc.success, 0.3)}` }}
              >
                {((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </NeonCard>
      </div>

      {/* Charts Row 2: Radar + Channel Pie + Hourly Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {/* AI Capability Radar */}
        <NeonCard color={tc.secondary} hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
            {t('ins.radar.title')}
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subjectKey"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                  tickFormatter={(v: string) => t(v)}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={t('ins.radar.name')}
                  dataKey="score"
                  stroke={tc.secondary}
                  fill={tc.secondary}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-3 mt-2">
            <span className="text-[9px] text-white/15 flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: tc.secondary, boxShadow: `0 0 4px ${tc.secondary}` }}
              />
              {t('ins.radar.avg', {
                n: Math.round(radarData.reduce((s, r) => s + r.score, 0) / radarData.length),
              })}
            </span>
          </div>
        </NeonCard>

        {/* Channel Distribution */}
        <NeonCard color={tc.accent} hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
            {t('ins.channel.title')}
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {channelData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                  ))}
                </Pie>
                <Tooltip content={<CyberTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {channelData.map((ch, i) => (
              <span key={i} className="text-[9px] flex items-center gap-1 text-white/30">
                <div className="w-2 h-2 rounded-full" style={{ background: ch.color }} />
                {ch.nameKey && t(ch.nameKey)} {ch.value}%
              </span>
            ))}
          </div>
        </NeonCard>

        {/* Hourly Activity */}
        <NeonCard color={tc.primary} hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">
            {t('ins.hourly.title')}
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData.filter((_, i) => i % 2 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 8 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CyberTooltip />} />
                <Bar
                  dataKey="calls"
                  name={t('ins.chart.calls')}
                  fill={tc.primary}
                  fillOpacity={0.6}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="ai"
                  name={t('ins.chart.aiTasks')}
                  fill={tc.secondary}
                  fillOpacity={0.4}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-[9px] text-white/20 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: tc.primary }} />{' '}
              {t('ins.chart.calls')}
            </span>
            <span className="text-[9px] text-white/20 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: tc.secondary }} />{' '}
              {t('ins.chart.aiTasks')}
            </span>
          </div>
        </NeonCard>
      </div>

      {/* Form submission analytics — pass through to existing component */}
      <FormInsightsAnalytics />
    </div>
  )
}

// ==========================================
// Form Analytics Sub-section (inline)
// ==========================================
function FormInsightsAnalytics() {
  const { t } = useI18n()
  const tc = useThemeColors()
  const [stats, setStats] = useState({
    total: 0,
    byTemplate: [] as { name: string; value: number; color: string }[],
    dailyTrend: [] as { day: string; count: number }[],
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('yyc3_form_submissions')
      interface StoredSubmission {
        templateTitle: string
        submittedAt?: string
      }
      const data: StoredSubmission[] = raw ? JSON.parse(raw) : []
      if (!data.length) return

      const tplMap: Record<string, number> = {}
      data.forEach((s) => {
        tplMap[s.templateTitle] = (tplMap[s.templateTitle] || 0) + 1
      })
      const colorMap: Record<string, string> = {
        客户录入表: '#00d4ff',
        呼叫报告: '#00ffcc',
        满意度调研: '#00f0ff',
        'AI 任务配置': '#00ffc8',
      }
      const byTemplate = Object.entries(tplMap).map(([name, value]) => ({
        name,
        value,
        color: colorMap[name] || '#41ffdd',
      }))

      const now = Date.now()
      const dayLabels = [
        'ins.weekday.sun',
        'ins.weekday.mon',
        'ins.weekday.tue',
        'ins.weekday.wed',
        'ins.weekday.thu',
        'ins.weekday.fri',
        'ins.weekday.sat',
      ]
      const dailyTrend: { day: string; count: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000)
        const dayStr = d.toISOString().slice(0, 10)
        const count = data.filter((s) => s.submittedAt?.startsWith(dayStr)).length
        const mockExtra = Math.floor(Math.random() * 5) + 1
        dailyTrend.push({ day: t(dayLabels[d.getDay()]), count: count + mockExtra })
      }

      setStats({ total: data.length, byTemplate, dailyTrend })
    } catch {
      /* */
    }
  }, [t])

  if (stats.total === 0) return null

  return (
    <NeonCard color={tc.muted} hoverable={false}>
      <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">{t('ins.form.title')}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-[10px] text-white/20">{t('ins.form.totalSubmissions')}</p>
          <p
            className="text-xl"
            style={{ color: tc.muted, textShadow: `0 0 10px ${tc.alpha(tc.muted, 0.4)}` }}
          >
            {stats.total}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/20">{t('ins.form.templateTypes')}</p>
          <p
            className="text-xl"
            style={{ color: tc.primary, textShadow: `0 0 10px ${tc.alpha(tc.primary, 0.4)}` }}
          >
            {stats.byTemplate.length}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/20">{t('ins.form.dailyAvg')}</p>
          <p
            className="text-xl"
            style={{ color: tc.secondary, textShadow: `0 0 10px ${tc.alpha(tc.secondary, 0.4)}` }}
          >
            {Math.max(1, Math.round(stats.total / 7))}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/20">{t('ins.form.dataQuality')}</p>
          <p
            className="text-xl"
            style={{ color: tc.success, textShadow: `0 0 10px ${tc.alpha(tc.success, 0.4)}` }}
          >
            99.8%
          </p>
        </div>
      </div>
      {stats.dailyTrend.length > 0 && (
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.dailyTrend}>
              <defs>
                <linearGradient id="gradFormTrend2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tc.muted} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={tc.muted} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CyberTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name={t('ins.form.submissions')}
                stroke={tc.muted}
                strokeWidth={2}
                fill="url(#gradFormTrend2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </NeonCard>
  )
}
