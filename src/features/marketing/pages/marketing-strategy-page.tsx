import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 营销方案策划 - Marketing Strategy Planning
// AI智能方案生成 · 多维度策略分析 · 数据驱动决策
// ==========================================

interface StrategyPlan {
  id: string
  name: string
  objective: string
  status: 'draft' | 'approved' | 'active' | 'completed'
  budget: number
  startDate: string
  endDate: string
  channels: string[]
  kpis: { name: string; target: number; current: number }[]
  aiScore: number
}

export function MarketingStrategyPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const strategies: StrategyPlan[] = [
    {
      id: 'S001',
      name: 'strat.plan.s001.name',
      objective: 'strat.plan.s001.objective',
      status: 'active',
      budget: 50000,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      channels: ['strat.channel.wechat', 'strat.channel.douyin', 'strat.channel.xiaohongshu', 'strat.channel.baidu'],
      kpis: [
        { name: 'strat.kpi.brandExposure', target: 1000000, current: 650000 },
        { name: 'strat.kpi.registeredUsers', target: 5000, current: 3200 },
        { name: 'strat.kpi.orderConversion', target: 1000, current: 580 },
      ],
      aiScore: 87,
    },
    {
      id: 'S002',
      name: 'strat.plan.s002.name',
      objective: 'strat.plan.s002.objective',
      status: 'approved',
      budget: 120000,
      startDate: '2024-06-01',
      endDate: '2024-06-18',
      channels: ['strat.channel.all'],
      kpis: [
        { name: 'strat.kpi.sales', target: 3000000, current: 0 },
        { name: 'strat.kpi.newUsers', target: 10000, current: 0 },
        { name: 'strat.kpi.repurchaseRate', target: 35, current: 0 },
      ],
      aiScore: 92,
    },
    {
      id: 'S003',
      name: 'strat.plan.s003.name',
      objective: 'strat.plan.s003.objective',
      status: 'draft',
      budget: 200000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      channels: ['strat.channel.wechat', 'strat.channel.weibo', 'strat.channel.zhihu', 'strat.channel.bilibili'],
      kpis: [
        { name: 'strat.kpi.brandMentions', target: 5000000, current: 0 },
        { name: 'strat.kpi.positiveReviews', target: 90, current: 0 },
        { name: 'strat.kpi.fansGrowth', target: 50000, current: 0 },
      ],
      aiScore: 85,
    },
  ]

  const getStatusConfig = (status: StrategyPlan['status']) => {
    switch (status) {
      case 'draft':
        return { label: t('strat.status.draft'), color: tc.textMuted, icon: FileText }
      case 'approved':
        return { label: t('strat.status.approved'), color: tc.success, icon: CheckCircle2 }
      case 'active':
        return { label: t('strat.status.active'), color: tc.primary, icon: Clock }
      case 'completed':
        return { label: t('strat.status.completed'), color: tc.secondary, icon: CheckCircle2 }
    }
  }

  const aiInsights = [
    { icon: Brain, text: 'strat.insight.i1', score: 94 },
    { icon: TrendingUp, text: 'strat.insight.i2', score: 88 },
    { icon: Users, text: 'strat.insight.i3', score: 91 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.marketingPlan')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {t('strat.subtitle')}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: tc.gradientButton,
            color: tc.textPrimary,
            boxShadow: tc.shadowMd,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = tc.hoverTransform
            e.currentTarget.style.boxShadow = tc.shadowGlow
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = tc.shadowMd
          }}
        >
          <Plus className="w-5 h-5" />
          {t('strat.createPlan')}
        </button>
      </div>

      {/* AI智能洞察 */}
      <NeonCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6" style={{ color: tc.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            {t('strat.aiInsights')}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-lg transition-all"
              style={{
                background: tc.bgCard,
                border: `1px solid ${tc.borderSubtle}`,
              }}
            >
              <insight.icon
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                style={{ color: tc.primary }}
              />
              <div className="flex-1">
                <p style={{ color: tc.textPrimary }}>{t(insight.text)}</p>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  color: tc.primary,
                }}
              >
                <Zap className="w-4 h-4" />
                {t('strat.scoreUnit', { score: insight.score })}
              </div>
            </div>
          ))}
        </div>
      </NeonCard>

      {/* 方案列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {strategies.map((plan) => {
          const statusConfig = getStatusConfig(plan.status)
          const StatusIcon = statusConfig.icon

          return (
            <NeonCard
              key={plan.id}
              className="p-6 cursor-pointer transition-all"
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                borderColor: selectedPlan === plan.id ? tc.primary : tc.borderDefault,
              }}
            >
              {/* 状态和评分 */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: tc.alpha(statusConfig.color, 0.1),
                    color: statusConfig.color,
                  }}
                >
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </div>
                <div
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    background: tc.alpha(tc.primary, 0.15),
                    color: tc.primary,
                    boxShadow: tc.neonGlow(tc.primary, 0.3),
                  }}
                >
                  <Brain className="w-4 h-4" />
                  {plan.aiScore}
                </div>
              </div>

              {/* 方案名称和目标 */}
              <h3 className="text-lg font-bold mb-2" style={{ color: tc.textPrimary }}>
                {t(plan.name)}
              </h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: tc.textSecondary }}>
                {t(plan.objective)}
              </p>

              {/* 预算和时间 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                    {t('strat.budget')}
                  </p>
                  <p className="font-bold" style={{ color: tc.primary }}>
                    ¥{plan.budget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                    {t('strat.period')}
                  </p>
                  <p className="text-sm font-medium" style={{ color: tc.textPrimary }}>
                    {new Date(plan.startDate).toLocaleDateString()} -
                    {new Date(plan.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* 渠道 */}
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: tc.textMuted }}>
                  {t('strat.channels')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.channels.map((channel) => (
                    <span
                      key={channel}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: tc.bgCard,
                        color: tc.textSecondary,
                        border: `1px solid ${tc.borderSubtle}`,
                      }}
                    >
                      {t(channel)}
                    </span>
                  ))}
                </div>
              </div>

              {/* KPI进度 */}
              <div className="space-y-2">
                <p className="text-xs mb-2" style={{ color: tc.textMuted }}>
                  {t('strat.kpiProgress')}
                </p>
                {plan.kpis.slice(0, 2).map((kpi) => {
                  const progress = plan.status === 'draft' ? 0 : (kpi.current / kpi.target) * 100
                  return (
                    <div key={kpi.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: tc.textSecondary }}>
                          {t(kpi.name)}
                        </span>
                        <span className="text-xs font-medium" style={{ color: tc.primary }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: tc.bgInput }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${progress}%`,
                            background: tc.gradientPrimary,
                            boxShadow: tc.neonGlow(tc.primary, 0.5),
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 操作按钮 */}
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  color: tc.primary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = tc.alpha(tc.primary, 0.2)
                  e.currentTarget.style.borderColor = tc.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = tc.alpha(tc.primary, 0.1)
                  e.currentTarget.style.borderColor = tc.borderSubtle
                }}
              >
                {t('strat.viewDetail')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </NeonCard>
          )
        })}
      </div>
    </div>
  )
}
