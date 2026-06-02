import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Calendar,
  DollarSign,
  Eye,
  LayoutDashboard,
  MessageSquare,
  PieChart,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 应用总览看板 - Application Overview Dashboard
// 全局数据 · 核心指标 · 实时监控
// ==========================================

export function AppOverviewPage() {
  const tc = useThemeColors()

  const coreMetrics = [
    { label: '总营收', value: '¥2.48M', change: '+28.5%', icon: DollarSign, color: tc.success },
    { label: '总用户', value: '125.8K', change: '+18.3%', icon: Users, color: tc.primary },
    { label: '转化率', value: '24.6%', change: '+5.2%', icon: Target, color: tc.secondary },
    { label: '活跃度', value: '68.9%', change: '+3.8%', icon: Activity, color: tc.accent },
  ]

  const channelData = [
    { channel: '微信', revenue: 890000, users: 45000, conversion: 28.5, color: tc.success },
    { channel: '抖音', revenue: 720000, users: 38000, conversion: 25.2, color: tc.primary },
    { channel: '小红书', revenue: 480000, users: 25000, conversion: 22.8, color: tc.secondary },
    { channel: '百度', revenue: 390000, users: 17800, conversion: 18.9, color: tc.accent },
  ]

  const recentActivities = [
    {
      id: 'ACT001',
      type: 'campaign',
      title: '618大促活动已启动',
      time: '5分钟前',
      status: 'success',
    },
    { id: 'ACT002', type: 'lead', title: '新增高价值线索 +12', time: '15分钟前', status: 'info' },
    {
      id: 'ACT003',
      type: 'alert',
      title: '营销预算使用率达85%',
      time: '1小时前',
      status: 'warning',
    },
    {
      id: 'ACT004',
      type: 'report',
      title: '周度营销报告已生成',
      time: '2小时前',
      status: 'success',
    },
  ]

  const topPerformers = [
    { name: '产品A - 618促销', revenue: 520000, conversion: 32.5, roi: 4.8 },
    { name: '品牌故事传播', revenue: 385000, conversion: 28.2, roi: 4.2 },
    { name: '会员专属福利', revenue: 298000, conversion: 25.8, roi: 3.9 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            应用总览看板
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            全局数据 · 核心指标 · 实时监控
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
            实时更新
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
                {metric.label}
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
            渠道营收占比
          </h2>
          <div className="space-y-4">
            {channelData.map((channel) => {
              const total = channelData.reduce((sum, c) => sum + c.revenue, 0)
              const percentage = ((channel.revenue / total) * 100).toFixed(1)
              return (
                <div key={channel.channel}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: tc.textPrimary }}>
                      {channel.channel}
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
            最近动态
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
                    {activity.title}
                  </p>
                  <p className="text-xs" style={{ color: tc.textMuted }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          表现最佳项目
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                <th
                  className="text-left py-3 px-4 text-sm font-medium"
                  style={{ color: tc.textMuted }}
                >
                  项目名称
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium"
                  style={{ color: tc.textMuted }}
                >
                  营收
                </th>
                <th
                  className="text-right py-3 px-4 text-sm font-medium"
                  style={{ color: tc.textMuted }}
                >
                  转化率
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
                        {project.name}
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
