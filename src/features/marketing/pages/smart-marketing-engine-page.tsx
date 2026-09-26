import { Brain, Pause, Play, Rocket, Sparkles, TrendingUp, Users, Zap } from 'lucide-react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 智能营销引擎 - Smart Marketing Engine
// AI自动化 · 策略优化 · 效果最大化
// ==========================================

export function SmartMarketingEnginePage() {
  const tc = useThemeColors()
  const { t } = useI18n()

  const engineStats = [
    { label: 'sme.stat.automation', value: '128', change: '+32', icon: Rocket, color: tc.primary },
    { label: 'sme.stat.suggestions', value: '45', change: '+12', icon: Brain, color: tc.secondary },
    { label: 'sme.stat.roiBoost', value: '+42%', change: '+8%', icon: TrendingUp, color: tc.success },
    { label: 'sme.stat.coverage', value: '2.8M', change: '+18%', icon: Users, color: tc.accent },
  ]

  const automationTasks = [
    {
      id: 'A001',
      name: 'sme.task.a001.name',
      status: 'running',
      frequency: 'sme.task.a001.freq',
      target: 25000,
      reached: 18500,
    },
    {
      id: 'A002',
      name: 'sme.task.a002.name',
      status: 'running',
      frequency: 'sme.task.a002.freq',
      target: 0,
      reached: 0,
    },
    {
      id: 'A003',
      name: 'sme.task.a003.name',
      status: 'running',
      frequency: 'sme.task.a003.freq',
      target: 0,
      reached: 0,
    },
    {
      id: 'A004',
      name: 'sme.task.a004.name',
      status: 'paused',
      frequency: 'sme.task.a004.freq',
      target: 0,
      reached: 0,
    },
  ]

  const aiRecommendations = [
    {
      title: 'sme.rec.r1.title',
      impact: 'high',
      description: 'sme.rec.r1.desc',
      expectedROI: '+28%',
    },
    {
      title: 'sme.rec.r2.title',
      impact: 'medium',
      description: 'sme.rec.r2.desc',
      expectedROI: '+15%',
    },
    {
      title: 'sme.rec.r3.title',
      impact: 'high',
      description: 'sme.rec.r3.desc',
      expectedROI: '+22%',
    },
  ]

  const getImpactLabel = (impact: string) => {
    if (impact === 'high') return t('sme.impact.high')
    return t('sme.impact.medium')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.aiMarketingEngine')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {t('sme.subtitle')}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
        >
          <Zap className="w-5 h-5" />
          {t('sme.startEngine')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {engineStats.map((stat) => {
          const Icon = stat.icon
          return (
            <NeonCard key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ background: tc.alpha(tc.success, 0.1), color: tc.success }}
                >
                  {stat.change}
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
                {t(stat.label)}
              </p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
                {stat.value}
              </p>
            </NeonCard>
          )
        })}
      </div>

      <NeonCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6" style={{ color: tc.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            {t('sme.aiRecommendations')}
          </h2>
        </div>
        <div className="space-y-4">
          {aiRecommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg"
              style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" style={{ color: tc.primary }} />
                  <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                    {t(rec.title)}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium`}
                    style={{
                      background:
                        rec.impact === 'high' ? tc.alpha(tc.danger, 0.1) : tc.alpha(tc.warning, 0.1),
                      color: rec.impact === 'high' ? tc.danger : tc.warning,
                    }}
                  >
                    {t('sme.impactSuffix', { impact: getImpactLabel(rec.impact) })}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: tc.alpha(tc.success, 0.15), color: tc.success }}
                  >
                    {rec.expectedROI}
                  </span>
                </div>
              </div>
              <p className="text-sm" style={{ color: tc.textSecondary }}>
                {t(rec.description)}
              </p>
            </div>
          ))}
        </div>
      </NeonCard>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          {t('sme.automationTasks')}
        </h2>
        <div className="space-y-4">
          {automationTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg"
              style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {task.status === 'running' ? (
                    <div
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ background: tc.success, boxShadow: `0 0 10px ${tc.success}` }}
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-full" style={{ background: tc.textMuted }} />
                  )}
                  <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                    {t(task.name)}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: tc.textMuted }}>
                    {t(task.frequency)}
                  </span>
                  <button
                    className="p-2 rounded-lg"
                    style={{
                      background: tc.alpha(tc.primary, 0.1),
                      color: task.status === 'running' ? tc.danger : tc.success,
                    }}
                  >
                    {task.status === 'running' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {task.target > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span style={{ color: tc.textMuted }}>{t('sme.progress')}</span>
                    <span style={{ color: tc.textPrimary }}>
                      {task.reached.toLocaleString()} / {task.target.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: tc.bgInput }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${(task.reached / task.target) * 100}%`,
                        background: tc.gradientPrimary,
                        boxShadow: tc.neonGlow(tc.primary, 0.4),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  )
}
