import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
  Send,
  Settings,
  Target,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 推广活动执行 - Campaign Execution
// 实时活动监控 · 自动化执行 · 多渠道协同
// ==========================================

interface Campaign {
  id: string
  name: string
  status: 'scheduled' | 'running' | 'paused' | 'completed'
  channel: string
  progress: number
  reach: number
  engagement: number
  conversion: number
  startTime: string
  endTime: string
  budget: number
  spent: number
}

export function CampaignExecutionPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [filter, setFilter] = useState<'all' | 'running' | 'scheduled'>('all')

  const campaigns: Campaign[] = [
    {
      id: 'C001',
      name: 'camp.c001.name',
      status: 'running',
      channel: 'camp.channel.douyin',
      progress: 67,
      reach: 125000,
      engagement: 8500,
      conversion: 420,
      startTime: '2024-06-01 10:00',
      endTime: '2024-06-03 22:00',
      budget: 30000,
      spent: 18500,
    },
    {
      id: 'C002',
      name: 'camp.c002.name',
      status: 'running',
      channel: 'camp.channel.wechat',
      progress: 42,
      reach: 85000,
      engagement: 3200,
      conversion: 180,
      startTime: '2024-06-02 08:00',
      endTime: '2024-06-05 20:00',
      budget: 15000,
      spent: 6300,
    },
    {
      id: 'C003',
      name: 'camp.c003.name',
      status: 'scheduled',
      channel: 'camp.channel.xiaohongshu',
      progress: 0,
      reach: 0,
      engagement: 0,
      conversion: 0,
      startTime: '2024-06-05 09:00',
      endTime: '2024-06-10 18:00',
      budget: 20000,
      spent: 0,
    },
    {
      id: 'C004',
      name: 'camp.c004.name',
      status: 'paused',
      channel: 'camp.channel.all',
      progress: 28,
      reach: 42000,
      engagement: 1800,
      conversion: 95,
      startTime: '2024-05-28 00:00',
      endTime: '2024-06-07 23:59',
      budget: 25000,
      spent: 7200,
    },
  ]

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter === 'all') return true
    return c.status === filter
  })

  const getStatusConfig = (status: Campaign['status']) => {
    switch (status) {
      case 'scheduled':
        return { label: t('camp.status.scheduled'), color: tc.textMuted, icon: Clock, bgGlow: 'none' }
      case 'running':
        return {
          label: t('camp.status.running'),
          color: tc.primary,
          icon: Play,
          bgGlow: tc.neonGlow(tc.primary, 0.3),
        }
      case 'paused':
        return { label: t('camp.status.paused'), color: tc.warning, icon: Pause, bgGlow: 'none' }
      case 'completed':
        return { label: t('camp.status.completed'), color: tc.success, icon: CheckCircle2, bgGlow: 'none' }
    }
  }

  const stats = [
    {
      label: 'camp.stat.running',
      value: campaigns.filter((c) => c.status === 'running').length,
      icon: Activity,
      color: tc.primary,
      change: '+2',
    },
    {
      label: 'camp.stat.reach',
      value: campaigns.reduce((sum, c) => sum + c.reach, 0).toLocaleString(),
      icon: Users,
      color: tc.secondary,
      change: '+12.5%',
    },
    {
      label: 'camp.stat.engagement',
      value: campaigns.reduce((sum, c) => sum + c.engagement, 0).toLocaleString(),
      icon: MessageSquare,
      color: tc.accent,
      change: '+8.3%',
    },
    {
      label: 'camp.stat.conversion',
      value: campaigns.reduce((sum, c) => sum + c.conversion, 0).toLocaleString(),
      icon: Target,
      color: tc.success,
      change: '+15.2%',
    },
  ]

  const getFilterLabel = (f: string) => {
    if (f === 'all') return t('camp.filter.all')
    if (f === 'running') return t('camp.filter.running')
    return t('camp.filter.scheduled')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.promotionExec')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {t('camp.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tc.bgCard,
              color: tc.textSecondary,
              border: `1px solid ${tc.borderDefault}`,
            }}
          >
            <RefreshCw className="w-4 h-4" />
            {t('camp.refresh')}
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              background: tc.gradientButton,
              color: tc.textPrimary,
              boxShadow: tc.shadowMd,
            }}
          >
            <Send className="w-5 h-5" />
            {t('camp.create')}
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <NeonCard key={stat.label} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
              <div
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  background: tc.alpha(tc.success, 0.1),
                  color: tc.success,
                }}
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
        ))}
      </div>

      {/* 筛选器 */}
      <div className="flex items-center gap-3">
        {(['all', 'running', 'scheduled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === f ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
              color: filter === f ? tc.primary : tc.textSecondary,
              border: `1px solid ${filter === f ? tc.primary : tc.borderSubtle}`,
              boxShadow: filter === f ? tc.neonGlow(tc.primary, 0.3) : 'none',
            }}
          >
            {getFilterLabel(f)}
          </button>
        ))}
      </div>

      {/* 活动列表 */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => {
          const statusConfig = getStatusConfig(campaign.status)
          const StatusIcon = statusConfig.icon
          const budgetUsage = (campaign.spent / campaign.budget) * 100

          return (
            <NeonCard key={campaign.id} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 左侧：基本信息 */}
                <div className="lg:col-span-4">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        background: tc.alpha(statusConfig.color, 0.1),
                        color: statusConfig.color,
                        boxShadow: statusConfig.bgGlow,
                      }}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig.label}
                    </div>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: tc.bgInput,
                        color: tc.textSecondary,
                      }}
                    >
                      {t(campaign.channel)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: tc.textPrimary }}>
                    {t(campaign.name)}
                  </h3>
                  <div className="flex items-center gap-2 text-sm" style={{ color: tc.textMuted }}>
                    <Calendar className="w-4 h-4" />
                    <span>
                      {campaign.startTime} - {campaign.endTime}
                    </span>
                  </div>
                </div>

                {/* 中间：数据指标 */}
                <div className="lg:col-span-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                        {t('camp.metric.reach')}
                      </p>
                      <p className="text-lg font-bold" style={{ color: tc.primary }}>
                        {campaign.reach.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                        {t('camp.metric.engagement')}
                      </p>
                      <p className="text-lg font-bold" style={{ color: tc.secondary }}>
                        {campaign.engagement.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                        {t('camp.metric.conversion')}
                      </p>
                      <p className="text-lg font-bold" style={{ color: tc.success }}>
                        {campaign.conversion}
                      </p>
                    </div>
                  </div>

                  {/* 预算进度 */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: tc.textMuted }}>
                        {t('camp.budgetUsage')}
                      </span>
                      <span className="text-xs font-medium" style={{ color: tc.textPrimary }}>
                        ¥{campaign.spent.toLocaleString()} / ¥{campaign.budget.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: tc.bgInput }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${budgetUsage}%`,
                          background: budgetUsage > 80 ? tc.warning : tc.gradientPrimary,
                          boxShadow: tc.neonGlow(tc.primary, 0.4),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 右侧：进度和操作 */}
                <div className="lg:col-span-3 flex flex-col justify-between">
                  {/* 进度环 */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke={tc.bgInput}
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke={tc.primary}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - campaign.progress / 100)}`}
                          style={{
                            filter: `drop-shadow(0 0 4px ${tc.primary})`,
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: tc.primary }}>
                          {campaign.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: tc.alpha(tc.primary, 0.1),
                        color: tc.primary,
                        border: `1px solid ${tc.borderSubtle}`,
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      {t('camp.detail')}
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg transition-all"
                      style={{
                        background: tc.bgCard,
                        color: tc.textSecondary,
                        border: `1px solid ${tc.borderSubtle}`,
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </NeonCard>
          )
        })}
      </div>
    </div>
  )
}
