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

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const strategies: StrategyPlan[] = [
    {
      id: 'S001',
      name: 'Q1新品上市推广方案',
      objective: '提升新产品市场认知度，首月达成1000+订单',
      status: 'active',
      budget: 50000,
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      channels: ['微信', '抖音', '小红书', '百度'],
      kpis: [
        { name: '品牌曝光', target: 1000000, current: 650000 },
        { name: '注册用户', target: 5000, current: 3200 },
        { name: '订单转化', target: 1000, current: 580 },
      ],
      aiScore: 87,
    },
    {
      id: 'S002',
      name: '618大促营销方案',
      objective: '提升销售额300%，扩大用户基数50%',
      status: 'approved',
      budget: 120000,
      startDate: '2024-06-01',
      endDate: '2024-06-18',
      channels: ['全渠道'],
      kpis: [
        { name: '销售额', target: 3000000, current: 0 },
        { name: '新增用户', target: 10000, current: 0 },
        { name: '复购率', target: 35, current: 0 },
      ],
      aiScore: 92,
    },
    {
      id: 'S003',
      name: '品牌年度传播计划',
      objective: '建立行业领先品牌形象，提升品牌美誉度',
      status: 'draft',
      budget: 200000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      channels: ['微信', '微博', '知乎', 'B站'],
      kpis: [
        { name: '品牌提及', target: 5000000, current: 0 },
        { name: '正面评价', target: 90, current: 0 },
        { name: '粉丝增长', target: 50000, current: 0 },
      ],
      aiScore: 85,
    },
  ]

  const getStatusConfig = (status: StrategyPlan['status']) => {
    switch (status) {
      case 'draft':
        return { label: '草稿', color: tc.textMuted, icon: FileText }
      case 'approved':
        return { label: '已批准', color: tc.success, icon: CheckCircle2 }
      case 'active':
        return { label: '执行中', color: tc.primary, icon: Clock }
      case 'completed':
        return { label: '已完成', color: tc.secondary, icon: CheckCircle2 }
    }
  }

  const aiInsights = [
    { icon: Brain, text: '基于历史数据，建议提升抖音渠道投放比例至35%', score: 94 },
    { icon: TrendingUp, text: '周末投放CTR提升23%，建议增加预算配比', score: 88 },
    { icon: Users, text: '目标人群画像分析完成，精准定向可提升ROI 40%', score: 91 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            营销方案策划
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            AI智能方案生成 · 数据驱动决策 · 多维度策略分析
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
          创建新方案
        </button>
      </div>

      {/* AI智能洞察 */}
      <NeonCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6" style={{ color: tc.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            AI智能洞察
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
                <p style={{ color: tc.textPrimary }}>{insight.text}</p>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  color: tc.primary,
                }}
              >
                <Zap className="w-4 h-4" />
                {insight.score}分
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
                {plan.name}
              </h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: tc.textSecondary }}>
                {plan.objective}
              </p>

              {/* 预算和时间 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                    预算
                  </p>
                  <p className="font-bold" style={{ color: tc.primary }}>
                    ¥{plan.budget.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                    周期
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
                  推广渠道
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
                      {channel}
                    </span>
                  ))}
                </div>
              </div>

              {/* KPI进度 */}
              <div className="space-y-2">
                <p className="text-xs mb-2" style={{ color: tc.textMuted }}>
                  KPI达成进度
                </p>
                {plan.kpis.slice(0, 2).map((kpi) => {
                  const progress = plan.status === 'draft' ? 0 : (kpi.current / kpi.target) * 100
                  return (
                    <div key={kpi.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: tc.textSecondary }}>
                          {kpi.name}
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
                查看详情
                <ArrowRight className="w-4 h-4" />
              </button>
            </NeonCard>
          )
        })}
      </div>
    </div>
  )
}
