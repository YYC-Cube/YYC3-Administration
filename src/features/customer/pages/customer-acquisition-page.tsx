import {
  Award,
  Brain,
  DollarSign,
  Mail,
  MessageSquare,
  Phone,
  Target,
  TrendingUp,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 客户获取系统 - Customer Acquisition System
// AI智能获客 · 精准定向 · 成本优化
// ==========================================

interface Lead {
  id: string
  name: string
  company: string
  position: string
  email: string
  phone: string
  source: string
  score: number
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  createdAt: string
  value: number
}

export function CustomerAcquisitionPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [selectedStatus, setSelectedStatus] = useState<'all' | Lead['status']>('all')

  const leads: Lead[] = [
    {
      id: 'L001',
      name: 'acq.lead1.name',
      company: 'acq.lead1.company',
      position: 'acq.lead1.position',
      email: 'zhang.ming@example.com',
      phone: '138****5678',
      source: 'acq.source.douyin',
      score: 92,
      status: 'qualified',
      createdAt: '2024-06-03 14:30',
      value: 50000,
    },
    {
      id: 'L002',
      name: 'acq.lead2.name',
      company: 'acq.lead2.company',
      position: 'acq.lead2.position',
      email: 'li.na@example.com',
      phone: '139****8765',
      source: 'acq.source.wechat',
      score: 88,
      status: 'contacted',
      createdAt: '2024-06-03 10:15',
      value: 35000,
    },
    {
      id: 'L003',
      name: 'acq.lead3.name',
      company: 'acq.lead3.company',
      position: 'acq.lead3.position',
      email: 'wang.qiang@example.com',
      phone: '136****4321',
      source: 'acq.source.xiaohongshu',
      score: 85,
      status: 'new',
      createdAt: '2024-06-03 09:20',
      value: 60000,
    },
    {
      id: 'L004',
      name: 'acq.lead4.name',
      company: 'acq.lead4.company',
      position: 'acq.lead4.position',
      email: 'chen.jing@example.com',
      phone: '137****9012',
      source: 'acq.source.baidu',
      score: 78,
      status: 'new',
      createdAt: '2024-06-02 16:45',
      value: 28000,
    },
  ]

  const filteredLeads = leads.filter((lead) => {
    if (selectedStatus === 'all') return true
    return lead.status === selectedStatus
  })

  const stats = [
    {
      label: t('acq.stats.newLeads'),
      value: '247',
      change: '+18.5%',
      icon: UserPlus,
      color: tc.primary,
    },
    {
      label: t('acq.stats.convRate'),
      value: '24.8%',
      change: '+3.2%',
      icon: Target,
      color: tc.success,
    },
    {
      label: t('acq.stats.cac'),
      value: '¥156',
      change: '-12.3%',
      icon: DollarSign,
      color: tc.secondary,
    },
    {
      label: t('acq.stats.estValue'),
      value: '¥2.4M',
      change: '+25.6%',
      icon: TrendingUp,
      color: tc.accent,
    },
  ]

  const sourceStats = [
    { source: 'acq.source.douyin', leads: 82, conversion: 28, cost: 145, color: tc.primary },
    { source: 'acq.source.wechat', leads: 65, conversion: 22, cost: 98, color: tc.secondary },
    { source: 'acq.source.xiaohongshu', leads: 48, conversion: 18, cost: 178, color: tc.accent },
    { source: 'acq.source.baidu', leads: 52, conversion: 15, cost: 220, color: tc.warning },
  ]

  const getStatusConfig = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return {
          label: t('acq.status.new'),
          color: tc.primary,
          bgColor: tc.alpha(tc.primary, 0.15),
        }
      case 'contacted':
        return {
          label: t('acq.status.contacted'),
          color: tc.secondary,
          bgColor: tc.alpha(tc.secondary, 0.15),
        }
      case 'qualified':
        return {
          label: t('acq.status.qualified'),
          color: tc.success,
          bgColor: tc.alpha(tc.success, 0.15),
        }
      case 'converted':
        return {
          label: t('acq.status.converted'),
          color: tc.accent,
          bgColor: tc.alpha(tc.accent, 0.15),
        }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return tc.success
    if (score >= 80) return tc.primary
    if (score >= 70) return tc.secondary
    return tc.textMuted
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.customerAcquisition')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {t('acq.subtitle')}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: tc.gradientButton,
            color: tc.textPrimary,
            boxShadow: tc.shadowMd,
          }}
        >
          <UserPlus className="w-5 h-5" />
          {t('acq.addLead')}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <NeonCard key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: stat.change.startsWith('+')
                      ? tc.alpha(tc.success, 0.1)
                      : tc.alpha(tc.danger, 0.1),
                    color: stat.change.startsWith('+') ? tc.success : tc.danger,
                  }}
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

      {/* AI获客洞察 */}
      <NeonCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6" style={{ color: tc.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            {t('acq.insight.title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderSubtle}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" style={{ color: tc.primary }} />
              <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                {t('acq.insight.bestTime')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              {t('acq.insight.bestTimeDesc')}
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderSubtle}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5" style={{ color: tc.secondary }} />
              <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                {t('acq.insight.highValue')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              {t('acq.insight.highValueDesc')}
            </p>
          </div>
          <div
            className="p-4 rounded-lg"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderSubtle}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5" style={{ color: tc.success }} />
              <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                {t('acq.insight.bestChannel')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              {t('acq.insight.bestChannelDesc')}
            </p>
          </div>
        </div>
      </NeonCard>

      {/* 渠道表现 */}
      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          {t('acq.channelPerformance')}
        </h2>
        <div className="space-y-4">
          {sourceStats.map((source) => {
            const conversionRate = ((source.conversion / source.leads) * 100).toFixed(1)
            return (
              <div
                key={source.source}
                className="p-4 rounded-lg transition-all"
                style={{
                  background: tc.bgCard,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                    {t(source.source)}
                  </h3>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: tc.alpha(source.color, 0.15),
                      color: source.color,
                    }}
                  >
                    {t('acq.conversionRate', { rate: conversionRate })}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      {t('acq.leadCount')}
                    </p>
                    <p className="text-lg font-bold" style={{ color: tc.textPrimary }}>
                      {source.leads}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      {t('acq.conversions')}
                    </p>
                    <p className="text-lg font-bold" style={{ color: tc.success }}>
                      {source.conversion}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      {t('acq.cost')}
                    </p>
                    <p className="text-lg font-bold" style={{ color: tc.secondary }}>
                      ¥{source.cost}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </NeonCard>

      {/* 线索筛选 */}
      <div className="flex items-center gap-3">
        {(['all', 'new', 'contacted', 'qualified', 'converted'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: selectedStatus === status ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
              color: selectedStatus === status ? tc.primary : tc.textSecondary,
              border: `1px solid ${selectedStatus === status ? tc.primary : tc.borderSubtle}`,
              boxShadow: selectedStatus === status ? tc.neonGlow(tc.primary, 0.3) : 'none',
            }}
          >
            {status === 'all' ? t('acq.allLeads') : getStatusConfig(status as Lead['status']).label}
          </button>
        ))}
      </div>

      {/* 线索列表 */}
      <NeonCard className="p-6">
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const statusConfig = getStatusConfig(lead.status)
            const scoreColor = getScoreColor(lead.score)

            return (
              <div
                key={lead.id}
                className="p-5 rounded-lg transition-all hover:scale-[1.01]"
                style={{
                  background: tc.bgCard,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* 左侧：基本信息 */}
                  <div className="lg:col-span-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                          style={{
                            background: tc.alpha(tc.primary, 0.15),
                            color: tc.primary,
                          }}
                        >
                          {t(lead.name).charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold" style={{ color: tc.textPrimary }}>
                            {t(lead.name)}
                          </h3>
                          <p className="text-sm" style={{ color: tc.textSecondary }}>
                            {t(lead.position)} · {t(lead.company)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2" style={{ color: tc.textSecondary }}>
                        <Mail className="w-4 h-4" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: tc.textSecondary }}>
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </div>
                    </div>
                  </div>

                  {/* 中间：状态和来源 */}
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                          {t('acq.leadStatus')}
                        </p>
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                          style={{
                            background: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                          {t('acq.sourceChannel')}
                        </p>
                        <span
                          className="inline-block px-3 py-1 rounded text-sm font-medium"
                          style={{
                            background: tc.bgInput,
                            color: tc.textPrimary,
                          }}
                        >
                          {t(lead.source)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：评分和价值 */}
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs mb-2" style={{ color: tc.textMuted }}>
                          {t('acq.aiScore')}
                        </p>
                        <div className="flex items-center gap-3">
                          <div
                            className="flex-1 h-2 rounded-full overflow-hidden"
                            style={{ background: tc.bgInput }}
                          >
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${lead.score}%`,
                                background: scoreColor,
                                boxShadow: `0 0 8px ${scoreColor}`,
                              }}
                            />
                          </div>
                          <span className="text-lg font-bold" style={{ color: scoreColor }}>
                            {lead.score}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                          {t('acq.estValue')}
                        </p>
                        <p className="text-xl font-bold" style={{ color: tc.primary }}>
                          ¥{lead.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: tc.alpha(tc.primary, 0.1),
                          color: tc.primary,
                          border: `1px solid ${tc.borderSubtle}`,
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {t('acq.contact')}
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: tc.bgCard,
                          color: tc.textSecondary,
                          border: `1px solid ${tc.borderSubtle}`,
                        }}
                      >
                        {t('acq.details')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </NeonCard>
    </div>
  )
}
