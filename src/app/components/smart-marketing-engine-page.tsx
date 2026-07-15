import { Brain, Pause, Play, Rocket, Sparkles, TrendingUp, Users, Zap } from 'lucide-react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 智能营销引擎 - Smart Marketing Engine
// AI自动化 · 策略优化 · 效果最大化
// ==========================================

export function SmartMarketingEnginePage() {
  const tc = useThemeColors()
  const { t } = useI18n()

  const engineStats = [
    { label: '自动化任务', value: '128', change: '+32', icon: Rocket, color: tc.primary },
    { label: '优化建议', value: '45', change: '+12', icon: Brain, color: tc.secondary },
    { label: 'ROI提升', value: '+42%', change: '+8%', icon: TrendingUp, color: tc.success },
    { label: '覆盖用户', value: '2.8M', change: '+18%', icon: Users, color: tc.accent },
  ]

  const automationTasks = [
    {
      id: 'A001',
      name: '自动推送营销内容',
      status: 'running',
      frequency: '每日 09:00',
      target: 25000,
      reached: 18500,
    },
    {
      id: 'A002',
      name: '智能受众分组',
      status: 'running',
      frequency: '实时',
      target: 0,
      reached: 0,
    },
    {
      id: 'A003',
      name: '自动优化出价',
      status: 'running',
      frequency: '每小时',
      target: 0,
      reached: 0,
    },
    {
      id: 'A004',
      name: '效果自动报告',
      status: 'paused',
      frequency: '每周一',
      target: 0,
      reached: 0,
    },
  ]

  const aiRecommendations = [
    {
      title: '预算重新分配',
      impact: '高',
      description: '建议将30%预算从低效渠道转移至高转化渠道',
      expectedROI: '+28%',
    },
    {
      title: '受众精准定向',
      impact: '中',
      description: 'AI识别出3个高价值受众群体，建议增加定向投放',
      expectedROI: '+15%',
    },
    {
      title: '投放时段优化',
      impact: '高',
      description: '晚间20:00-22:00转化率提升40%，建议增加预算',
      expectedROI: '+22%',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.aiMarketingEngine')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            AI自动化 · 策略优化 · 效果最大化
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
        >
          <Zap className="w-5 h-5" />
          启动引擎
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
                {stat.label}
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
            AI智能优化建议
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
                    {rec.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium`}
                    style={{
                      background:
                        rec.impact === '高' ? tc.alpha(tc.danger, 0.1) : tc.alpha(tc.warning, 0.1),
                      color: rec.impact === '高' ? tc.danger : tc.warning,
                    }}
                  >
                    {rec.impact}影响
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
                {rec.description}
              </p>
            </div>
          ))}
        </div>
      </NeonCard>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          自动化任务
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
                    {task.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: tc.textMuted }}>
                    {task.frequency}
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
                    <span style={{ color: tc.textMuted }}>进度</span>
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
