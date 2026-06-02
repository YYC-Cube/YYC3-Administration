import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  DollarSign,
  Lightbulb,
  PieChart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 智能决策支持 - Intelligent Decision Support
// AI预测分析 · 策略建议 · 风险评估
// ==========================================

interface Decision {
  id: string
  title: string
  category: 'budget' | 'channel' | 'timing' | 'audience'
  priority: 'high' | 'medium' | 'low'
  impact: string
  confidence: number
  recommendation: string
}

export function DecisionSupportPage() {
  const tc = useThemeColors()

  const decisions: Decision[] = [
    {
      id: 'D001',
      title: '增加抖音渠道预算',
      category: 'budget',
      priority: 'high',
      impact: '预计ROI提升 +32%',
      confidence: 94,
      recommendation: '建议将预算从¥30K增加至¥45K，预测将带来额外¥180K营收',
    },
    {
      id: 'D002',
      title: '优化投放时段策略',
      category: 'timing',
      priority: 'high',
      impact: '转化率提升 +28%',
      confidence: 91,
      recommendation: '晚间20:00-22:00转化率最高，建议集中70%预算在此时段',
    },
    {
      id: 'D003',
      title: '精准定向高价值人群',
      category: 'audience',
      priority: 'medium',
      impact: '获客成本降低 -25%',
      confidence: 88,
      recommendation: 'AI识别出30-45岁企业决策者群体转化价值高2.8倍',
    },
    {
      id: 'D004',
      title: '暂停低效渠道投放',
      category: 'channel',
      priority: 'medium',
      impact: '节省预算 ¥18K',
      confidence: 85,
      recommendation: '某渠道ROI仅1.2x，建议暂停并将预算转移至高效渠道',
    },
  ]

  const predictions = [
    {
      metric: '下月营收预测',
      value: '¥3.2M',
      change: '+28%',
      confidence: 92,
      icon: DollarSign,
      color: tc.success,
    },
    {
      metric: '用户增长预测',
      value: '+45K',
      change: '+35%',
      confidence: 89,
      icon: Users,
      color: tc.primary,
    },
    {
      metric: '转化率趋势',
      value: '26.8%',
      change: '+8%',
      confidence: 87,
      icon: Target,
      color: tc.secondary,
    },
    {
      metric: 'ROI预期',
      value: '4.2x',
      change: '+15%',
      confidence: 91,
      icon: TrendingUp,
      color: tc.accent,
    },
  ]

  const riskAlerts = [
    {
      id: 'R001',
      title: '预算即将耗尽',
      severity: 'high',
      message: '618活动预算使用率已达92%，预计3天内耗尽',
      action: '增加预算',
    },
    {
      id: 'R002',
      title: '竞争对手加大投放',
      severity: 'medium',
      message: '检测到竞品在核心渠道投放增加40%，可能影响曝光',
      action: '调整策略',
    },
    {
      id: 'R003',
      title: '季节性流量下降',
      severity: 'low',
      message: '预测下周流量将下降15%，建议调整投放节奏',
      action: '查看详情',
    },
  ]

  const getPriorityConfig = (priority: Decision['priority']) => {
    switch (priority) {
      case 'high':
        return { label: '高优先级', color: tc.danger, icon: AlertTriangle }
      case 'medium':
        return { label: '中优先级', color: tc.warning, icon: Activity }
      case 'low':
        return { label: '低优先级', color: tc.textMuted, icon: CheckCircle2 }
    }
  }

  const getCategoryLabel = (category: Decision['category']) => {
    switch (category) {
      case 'budget':
        return '预算优化'
      case 'channel':
        return '渠道选择'
      case 'timing':
        return '时段优化'
      case 'audience':
        return '受众定向'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            智能决策支持
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            AI预测分析 · 策略建议 · 风险评估
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: tc.alpha(tc.primary, 0.1), border: `1px solid ${tc.primary}` }}
        >
          <Brain className="w-5 h-5" style={{ color: tc.primary }} />
          <span className="text-sm font-medium" style={{ color: tc.primary }}>
            AI实时分析
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {predictions.map((pred) => {
          const Icon = pred.icon
          return (
            <NeonCard key={pred.metric} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: pred.color }} />
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                  style={{ background: tc.alpha(tc.primary, 0.1), color: tc.primary }}
                >
                  <Zap className="w-3 h-3" />
                  {pred.confidence}%
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
                {pred.metric}
              </p>
              <p className="text-2xl font-bold mb-1" style={{ color: tc.textPrimary }}>
                {pred.value}
              </p>
              <p className="text-xs font-medium" style={{ color: tc.success }}>
                {pred.change}
              </p>
            </NeonCard>
          )
        })}
      </div>

      <NeonCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6" style={{ color: tc.warning }} />
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            风险预警
          </h2>
        </div>
        <div className="space-y-3">
          {riskAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-lg"
              style={{
                background: tc.bgCard,
                border: `1px solid ${alert.severity === 'high' ? tc.danger : alert.severity === 'medium' ? tc.warning : tc.borderSubtle}`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        alert.severity === 'high'
                          ? tc.danger
                          : alert.severity === 'medium'
                            ? tc.warning
                            : tc.textMuted,
                    }}
                  />
                  <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                    {alert.title}
                  </h3>
                </div>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: tc.alpha(
                      alert.severity === 'high'
                        ? tc.danger
                        : alert.severity === 'medium'
                          ? tc.warning
                          : tc.textMuted,
                      0.1,
                    ),
                    color:
                      alert.severity === 'high'
                        ? tc.danger
                        : alert.severity === 'medium'
                          ? tc.warning
                          : tc.textMuted,
                  }}
                >
                  {alert.severity === 'high'
                    ? '紧急'
                    : alert.severity === 'medium'
                      ? '注意'
                      : '提示'}
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: tc.textSecondary }}>
                {alert.message}
              </p>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  color: tc.primary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                {alert.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </NeonCard>

      <NeonCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6" style={{ color: tc.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            AI决策建议
          </h2>
        </div>
        <div className="space-y-4">
          {decisions.map((decision) => {
            const priorityConfig = getPriorityConfig(decision.priority)
            const PriorityIcon = priorityConfig.icon

            return (
              <div
                key={decision.id}
                className="p-5 rounded-lg transition-all"
                style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: tc.alpha(tc.primary, 0.15) }}
                    >
                      <Brain className="w-6 h-6" style={{ color: tc.primary }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1" style={{ color: tc.textPrimary }}>
                        {decision.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: tc.bgInput, color: tc.textSecondary }}
                        >
                          {getCategoryLabel(decision.category)}
                        </span>
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: tc.alpha(priorityConfig.color, 0.1),
                            color: priorityConfig.color,
                          }}
                        >
                          <PriorityIcon className="w-3 h-3" />
                          {priorityConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
                    style={{
                      background: tc.alpha(tc.primary, 0.15),
                      color: tc.primary,
                      boxShadow: tc.neonGlow(tc.primary, 0.3),
                    }}
                  >
                    <Award className="w-4 h-4" />
                    {decision.confidence}%
                  </div>
                </div>

                <div
                  className="mb-4 p-3 rounded-lg"
                  style={{
                    background: tc.alpha(tc.success, 0.05),
                    border: `1px solid ${tc.alpha(tc.success, 0.1)}`,
                  }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: tc.success }}>
                    预期影响
                  </p>
                  <p className="text-lg font-bold" style={{ color: tc.success }}>
                    {decision.impact}
                  </p>
                </div>

                <p className="text-sm mb-4" style={{ color: tc.textSecondary }}>
                  {decision.recommendation}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: tc.gradientButton,
                      color: tc.textPrimary,
                      boxShadow: tc.shadowMd,
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    采纳建议
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: tc.bgCard,
                      color: tc.textSecondary,
                      border: `1px solid ${tc.borderSubtle}`,
                    }}
                  >
                    详细分析
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </NeonCard>
    </div>
  )
}
