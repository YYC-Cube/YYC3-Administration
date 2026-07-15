import {
  BarChart3,
  Brain,
  DollarSign,
  Download,
  Filter,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { ContentCard, PageHeader, StatCard } from './shared-styles.tsx'

// ==========================================
// YYC³ 营销效果分析 - Marketing Analytics
// 实时数据追踪 · AI智能分析 · 可视化报表
// ==========================================

interface MetricData {
  label: string
  value: number
  change: number
  trend: 'up' | 'down'
  icon: typeof TrendingUp
  color: string
}

export function MarketingAnalyticsPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const metrics: MetricData[] = [
    {
      label: t('ma.roi'),
      value: 3.8,
      change: 12.5,
      trend: 'up',
      icon: TrendingUp,
      color: tc.success,
    },
    {
      label: t('ma.conversion'),
      value: 4.2,
      change: 0.8,
      trend: 'up',
      icon: Target,
      color: tc.primary,
    },
    {
      label: t('ma.acquisitionCost'),
      value: 128,
      change: -8.3,
      trend: 'down',
      icon: DollarSign,
      color: tc.secondary,
    },
    {
      label: t('ma.reachRate'),
      value: 1580,
      change: 15.2,
      trend: 'up',
      icon: Users,
      color: tc.accent,
    },
  ]

  const channelPerformance = [
    { channel: '抖音', roi: 4.2, cost: 45000, revenue: 189000, conversion: 5.8 },
    { channel: '微信', roi: 3.8, cost: 38000, revenue: 144400, conversion: 4.2 },
    { channel: '小红书', roi: 3.5, cost: 28000, revenue: 98000, conversion: 3.9 },
    { channel: '百度', roi: 2.9, cost: 35000, revenue: 101500, conversion: 3.1 },
  ]

  const campaignAnalytics = [
    {
      name: '618预热活动',
      impressions: 1250000,
      clicks: 52000,
      conversions: 2100,
      revenue: 315000,
      roi: 4.5,
    },
    {
      name: '新品上市推广',
      impressions: 850000,
      clicks: 34000,
      conversions: 1420,
      revenue: 213000,
      roi: 3.8,
    },
    {
      name: '会员专属优惠',
      impressions: 420000,
      clicks: 18500,
      conversions: 890,
      revenue: 142000,
      roi: 5.2,
    },
  ]

  const aiInsights = [
    {
      title: '最佳投放时段',
      content: '晚上20:00-22:00转化率最高，建议增加该时段预算配比30%',
      impact: '预计提升ROI 15%',
    },
    {
      title: '受众优化建议',
      content: '25-34岁女性用户转化率高出平均值42%，建议精准定向',
      impact: '预计降低获客成本 18%',
    },
    {
      title: '渠道组合优化',
      content: '抖音+小红书组合投放效果提升35%，建议增加联动策略',
      impact: '预计提升整体转化率 12%',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('ma.title')}
        subtitle={t('ma.desc')}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: timeRange === range ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
                    color: timeRange === range ? tc.primary : tc.textSecondary,
                    border: `1px solid ${timeRange === range ? tc.primary : tc.borderSubtle}`,
                    boxShadow: timeRange === range ? tc.neonGlow(tc.primary, 0.3) : 'none',
                  }}
                >
                  {t(`ma.timeRange.${range}`)}
                </button>
              ))}
            </div>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: tc.gradientButton,
                color: tc.textPrimary,
                boxShadow: tc.shadowMd,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              {t('ma.export')}
            </button>
          </div>
        }
      />

      {/* Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={
                metric.label === t('ma.conversion') || metric.label === t('ma.reachRate')
                  ? `${metric.value}%`
                  : metric.label === t('ma.acquisitionCost')
                    ? `¥${metric.value}`
                    : metric.value
              }
              icon={Icon}
              color={metric.color}
              change={`${metric.trend === 'up' ? '+' : ''}${metric.change}%`}
              trend={metric.trend}
            />
          )
        })}
      </div>

      {/* AI Insights */}
      <ContentCard>
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-4 h-4" style={{ color: tc.primary }} />
          <h2 className="text-xs font-semibold" style={{ color: tc.textSecondary }}>
            {t('ma.aiAnalyze')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border transition-all"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.04)',
              }}
            >
              <h3 className="text-[11px] text-white/70 font-medium mb-2">{insight.title}</h3>
              <p className="text-[11px] text-white/40 mb-3">{insight.content}</p>
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#00ffc8' }}>
                <TrendingUp className="w-3 h-3" />
                {insight.impact}
              </div>
            </div>
          ))}
        </div>
      </ContentCard>

      {/* Channel Performance */}
      <ContentCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ma.channelPerformance')}
          </h2>
          <button
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Filter className="w-3 h-3" />
            {t('ma.filter')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left py-2.5 px-3 text-[9px] text-white/20 uppercase tracking-wider">
                  渠道
                </th>
                <th className="text-right py-2.5 px-3 text-[9px] text-white/20 uppercase tracking-wider">
                  投入成本
                </th>
                <th className="text-right py-2.5 px-3 text-[9px] text-white/20 uppercase tracking-wider">
                  营收
                </th>
                <th className="text-right py-2.5 px-3 text-[9px] text-white/20 uppercase tracking-wider">
                  ROI
                </th>
                <th className="text-right py-2.5 px-3 text-[9px] text-white/20 uppercase tracking-wider">
                  转化率
                </th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((channel, idx) => (
                <tr
                  key={channel.channel}
                  style={{
                    borderBottom:
                      idx < channelPerformance.length - 1
                        ? '1px solid rgba(255,255,255,0.04)'
                        : 'none',
                  }}
                >
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-white/60">{channel.channel}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-[11px] text-white/40">
                    ¥{channel.cost.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right text-[11px]" style={{ color: '#00ffc8' }}>
                    ¥{channel.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]"
                      style={{
                        background: 'rgba(0,240,255,0.1)',
                        color: '#00f0ff',
                        border: '1px solid rgba(0,240,255,0.2)',
                      }}
                    >
                      {channel.roi}x
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-[11px] text-white/60">
                    {channel.conversion}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentCard>

      {/* Campaign Details */}
      <ContentCard>
        <h2 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-[#00d4ff]" />
          {t('ma.campaignMetrics')}
        </h2>
        <div className="space-y-3">
          {campaignAnalytics.map((campaign) => {
            const ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
            const conversionRate = ((campaign.conversions / campaign.clicks) * 100).toFixed(2)

            return (
              <div
                key={campaign.name}
                className="p-4 rounded-xl border transition-all"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[11px] text-white/70 font-medium">{campaign.name}</h3>
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]"
                    style={{
                      background: 'rgba(0,240,255,0.1)',
                      color: '#00f0ff',
                      border: '1px solid rgba(0,240,255,0.2)',
                    }}
                  >
                    <BarChart3 className="w-3 h-3" />
                    ROI {campaign.roi}x
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-0.5">
                      曝光量
                    </p>
                    <p className="text-[11px] text-white/60 tabular-nums">
                      {(campaign.impressions / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-0.5">
                      点击量
                    </p>
                    <p className="text-[11px] text-white/60 tabular-nums">
                      {(campaign.clicks / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-0.5">
                      点击率
                    </p>
                    <p className="text-[11px]" style={{ color: '#00d4ff' }}>
                      {ctr}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-0.5">
                      转化数
                    </p>
                    <p className="text-[11px]" style={{ color: '#00ffc8' }}>
                      {campaign.conversions}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mb-0.5">
                      转化率
                    </p>
                    <p className="text-[11px]" style={{ color: '#00ffcc' }}>
                      {conversionRate}%
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ContentCard>
    </div>
  )
}
