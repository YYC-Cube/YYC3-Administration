import { Activity, DollarSign, Target, Users } from 'lucide-react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 应用总览看板 - Application Overview Dashboard
// 全局数据 · 核心指标 · 实时监控
// ==========================================

export function AppOverviewPage() {
  const tc = useThemeColors()
  const { t } = useI18n()

  const coreMetrics = [
    { label: 'appov.metric.revenue', value: '¥2.48M', change: '+28.5%', icon: DollarSign, color: tc.success },
    { label: 'appov.metric.users', value: '125.8K', change: '+18.3%', icon: Users, color: tc.primary },
    { label: 'appov.metric.conversion', value: '24.6%', change: '+5.2%', icon: Target, color: tc.secondary },
    { label: 'appov.metric.activity', value: '68.9%', change: '+3.8%', icon: Activity, color: tc.accent },
  ]

  const channelData = [
    { channel: 'appov.channel.wechat', revenue: 890000, users: 45000, conversion: 28.5, color: tc.success },
    { channel: 'appov.channel.douyin', revenue: 720000, users: 38000, conversion: 25.2, color: tc.primary },
    { channel: 'appov.channel.xiaohongshu', revenue: 480000, users: 25000, conversion: 22.8, color: tc.secondary },
    { channel: 'appov.channel.baidu', revenue: 390000, users: 17800, conversion: 18.9, color: tc.accent },
  ]

  const recentActivities = [
    {
      id: 'ACT001',
      type: 'campaign',
      title: 'appov.activity.act001.title',
      time: 'appov.activity.act001.time',
      status: 'success',
    },
    {
      id: 'ACT002',
      type: 'lead',
      title: 'appov.activity.act002.title',
      time: 'appov.activity.act002.time',
      status: 'info',
    },
    {
      id: 'ACT003',
      type: 'alert',
      title: 'appov.activity.act003.title',
      time: 'appov.activity.act003.time',
      status: 'warning',
    },
    {
      id: 'ACT004',
      type: 'report',
      title: 'appov.activity.act004.title',
      time: 'appov.activity.act004.time',
      status: 'success',
    },
  ]

  const topPerformers = [
    { name: 'appov.performer.p1', revenue: 520000, conversion: 32.5, roi: 4.8 },
    { name: 'appov.performer.p2', revenue: 385000, conversion: 28.2, roi: 4.2 },
    { name: 'appov.performer.p3', revenue: 298000, conversion: 25.8, roi: 3.9 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.appOverview')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {t('appov.subtitle')}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: tc.alpha(tc.success, 0.1), border: `1px solid ${tc.success}` }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: tc.success, boxShadow: `0 0 8px ${tc.success}` }}
          />
          <span className="text-sm font-medium" style={{ color: tc.success }}>
            {t('appov.liveUpdate')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {coreMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <NeonCard key={metric.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: metric.color }} />
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ background: tc.alpha(tc.success, 0.1), color: tc.success }}
                >
                  {metric.change}
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
                {t(metric.label)}
              </p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
                {metric.value}
              </p>
            </NeonCard>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NeonCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
            {t('appov.channelRevenue')}
          </h2>
          <div className="space-y-4">
            {channelData.map((channel) => {
              const total = channelData.reduce((sum, c) => sum + c.revenue, 0)
              const percentage = ((channel.revenue / total) * 100).toFixed(1)
              return (
                <div key={channel.channel}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: tc.textPrimary }}>
                      {t(channel.channel)}
                    </span>
                    <span className="text-sm font-medium" style={{ color: channel.color }}>
                      ¥{(channel.revenue / 1000).toFixed(0)}K ({percentage}%)
                    </span>
                  </div>
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{ background: tc.bgInput }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${percentage}%`,
                        background: channel.color,
                        boxShadow: `0 0 10px ${channel.color}`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </NeonCard>

        <NeonCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
            {t('appov.recentActivity')}
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${activity.status === 'success' ? 'animate-pulse' : ''}`}
                  style={{
                    background:
                      activity.status === 'success'
                        ? tc.success
                        : activity.status === 'warning'
                          ? tc.warning
                          : tc.primary,
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: tc.textPrimary }}>
                    {t(activity.title)}
                  </p>
                  <p className="text-xs" style={{ color: tc.textMuted }}>
                    {t(activity.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          {t('appov.topPerformers')}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                <th
                  className="text-left py-3 px-4 text-sm font-medium"
                  style={{ color: tc.textMuted }}
                >
                  {t('appov.th.projectName')}
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium"
                  style={{ color: tc.textMuted }}
                >
                  {t('appov.th.revenue')}
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium"
                  style={{ color: tc.textMuted }}
                >
                  {t('appov.th.conversion')}
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium"
                  style={{ color: tc.textMuted }}
                >
                  ROI
                </th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((project, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom:
                      idx < topPerformers.length - 1 ? `1px solid ${tc.borderSubtle}` : 'none',
                  }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: tc.alpha(tc.primary, 0.15),
                          color: tc.primary,
                          fontWeight: 'bold',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span className="font-medium" style={{ color: tc.textPrimary }}>
                        {t(project.name)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium" style={{ color: tc.success }}>
                    ¥{(project.revenue / 1000).toFixed(0)}K
                  </td>
                  <td className="py-4 px-4 text-right font-medium" style={{ color: tc.primary }}>
                    {project.conversion}%
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ background: tc.alpha(tc.accent, 0.15), color: tc.accent }}
                    >
                      {project.roi}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeonCard>
    </div>
  )
}
