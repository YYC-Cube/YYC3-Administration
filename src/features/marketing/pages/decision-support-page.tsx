import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  DollarSign,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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
  const { t } = useI18n()

  const decisions: Decision[] = [
    {
      id: 'D001',
      title: 'ds.decision.d001.title',
      category: 'budget',
      priority: 'high',
      impact: 'ds.decision.d001.impact',
      confidence: 94,
      recommendation: 'ds.decision.d001.rec',
    },
    {
      id: 'D002',
      title: 'ds.decision.d002.title',
      category: 'timing',
      priority: 'high',
      impact: 'ds.decision.d002.impact',
      confidence: 91,
      recommendation: 'ds.decision.d002.rec',
    },
    {
      id: 'D003',
      title: 'ds.decision.d003.title',
      category: 'audience',
      priority: 'medium',
      impact: 'ds.decision.d003.impact',
      confidence: 88,
      recommendation: 'ds.decision.d003.rec',
    },
    {
      id: 'D004',
      title: 'ds.decision.d004.title',
      category: 'channel',
      priority: 'medium',
      impact: 'ds.decision.d004.impact',
      confidence: 85,
      recommendation: 'ds.decision.d004.rec',
    },
  ]

  const predictions = [
    {
      metric: 'ds.pred.revenue',
      value: '¥3.2M',
      change: '+28%',
      confidence: 92,
      icon: DollarSign,
      color: tc.success,
    },
    {
      metric: 'ds.pred.userGrowth',
      value: '+45K',
      change: '+35%',
      confidence: 89,
      icon: Users,
      color: tc.primary,
    },
    {
      metric: 'ds.pred.conversion',
      value: '26.8%',
      change: '+8%',
      confidence: 87,
      icon: Target,
      color: tc.secondary,
    },
    {
      metric: 'ds.pred.roi',
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
      title: 'ds.risk.r001.title',
      severity: 'high',
      message: 'ds.risk.r001.message',
      action: 'ds.risk.r001.action',
    },
    {
      id: 'R002',
      title: 'ds.risk.r002.title',
      severity: 'medium',
      message: 'ds.risk.r002.message',
      action: 'ds.risk.r002.action',
    },
    {
      id: 'R003',
      title: 'ds.risk.r003.title',
      severity: 'low',
      message: 'ds.risk.r003.message',
      action: 'ds.risk.r003.action',
    },
  ]

  const getPriorityConfig = (priority: Decision['priority']) => {
    switch (priority) {
      case 'high':
        return { label: t('ds.priority.high'), color: tc.danger, icon: AlertTriangle }
      case 'medium':
        return { label: t('ds.priority.medium'), color: tc.warning, icon: Activity }
      case 'low':
        return { label: t('ds.priority.low'), color: tc.textMuted, icon: CheckCircle2 }
    }
  }

  const getCategoryLabel = (category: Decision['category']) => {
    switch (category) {
      case 'budget':
        return t('ds.category.budget')
      case 'channel':
        return t('ds.category.channel')
      case 'timing':
        return t('ds.category.timing')
      case 'audience':
        return t('ds.category.audience')
    }
  }

  const getSeverityLabel = (severity: string) => {
    if (severity === 'high') return t('ds.severity.high')
    if (severity === 'medium') return t('ds.severity.medium')
    return t('ds.severity.low')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.aiDecisionSupport')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {t('ds.subtitle')}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: tc.alpha(tc.primary, 0.1), border: `1px solid ${tc.primary}` }}
        >
          <Brain className="w-5 h-5" style={{ color: tc.primary }} />
          <span className="text-sm font-medium" style={{ color: tc.primary }}>
            {t('ds.aiLiveAnalysis')}
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
                {t(pred.metric)}
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
            {t('ds.riskAlerts')}
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
                    {t(alert.title)}
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
                  {getSeverityLabel(alert.severity)}
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: tc.textSecondary }}>
                {t(alert.message)}
              </p>
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  color: tc.primary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                {t(alert.action)}
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
            {t('ds.aiDecisions')}
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
                        {t(decision.title)}
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
                    {t('ds.expectedImpact')}
                  </p>
                  <p className="text-lg font-bold" style={{ color: tc.success }}>
                    {t(decision.impact)}
                  </p>
                </div>

                <p className="text-sm mb-4" style={{ color: tc.textSecondary }}>
                  {t(decision.recommendation)}
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
                    {t('ds.adopt')}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: tc.bgCard,
                      color: tc.textSecondary,
                      border: `1px solid ${tc.borderSubtle}`,
                    }}
                  >
                    {t('ds.detailAnalysis')}
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
