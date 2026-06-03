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

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

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
  const [selectedStatus, setSelectedStatus] = useState<'all' | Lead['status']>('all')

  const leads: Lead[] = [
    {
      id: 'L001',
      name: '张明',
      company: '某科技有限公司',
      position: '市场总监',
      email: 'zhang.ming@example.com',
      phone: '138****5678',
      source: '抖音广告',
      score: 92,
      status: 'qualified',
      createdAt: '2024-06-03 14:30',
      value: 50000,
    },
    {
      id: 'L002',
      name: '李娜',
      company: '某电商平台',
      position: '运营经理',
      email: 'li.na@example.com',
      phone: '139****8765',
      source: '微信公众号',
      score: 88,
      status: 'contacted',
      createdAt: '2024-06-03 10:15',
      value: 35000,
    },
    {
      id: 'L003',
      name: '王强',
      company: '某零售集团',
      position: '数字化主管',
      email: 'wang.qiang@example.com',
      phone: '136****4321',
      source: '小红书',
      score: 85,
      status: 'new',
      createdAt: '2024-06-03 09:20',
      value: 60000,
    },
    {
      id: 'L004',
      name: '陈静',
      company: '某连锁品牌',
      position: '品牌经理',
      email: 'chen.jing@example.com',
      phone: '137****9012',
      source: '百度搜索',
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
      label: '新增线索',
      value: '247',
      change: '+18.5%',
      icon: UserPlus,
      color: tc.primary,
    },
    {
      label: '转化率',
      value: '24.8%',
      change: '+3.2%',
      icon: Target,
      color: tc.success,
    },
    {
      label: '获客成本',
      value: '¥156',
      change: '-12.3%',
      icon: DollarSign,
      color: tc.secondary,
    },
    {
      label: '预计价值',
      value: '¥2.4M',
      change: '+25.6%',
      icon: TrendingUp,
      color: tc.accent,
    },
  ]

  const sourceStats = [
    { source: '抖音广告', leads: 82, conversion: 28, cost: 145, color: tc.primary },
    { source: '微信公众号', leads: 65, conversion: 22, cost: 98, color: tc.secondary },
    { source: '小红书', leads: 48, conversion: 18, cost: 178, color: tc.accent },
    { source: '百度搜索', leads: 52, conversion: 15, cost: 220, color: tc.warning },
  ]

  const getStatusConfig = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return { label: '新线索', color: tc.primary, bgColor: tc.alpha(tc.primary, 0.15) }
      case 'contacted':
        return { label: '已联系', color: tc.secondary, bgColor: tc.alpha(tc.secondary, 0.15) }
      case 'qualified':
        return { label: '已认证', color: tc.success, bgColor: tc.alpha(tc.success, 0.15) }
      case 'converted':
        return { label: '已转化', color: tc.accent, bgColor: tc.alpha(tc.accent, 0.15) }
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
            客户获取系统
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            AI智能获客 · 精准定向 · 成本优化
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
          添加线索
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
            AI获客洞察
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
                最佳获客时段
              </h3>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              周二、周四上午10:00-11:30转化率提升35%，建议优先投放
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
                高价值人群
              </h3>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              30-45岁企业决策者转化价值高出平均值2.8倍，建议精准定向
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
                优质渠道组合
              </h3>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              抖音+微信组合投放ROI提升42%，建议增加跨渠道协同策略
            </p>
          </div>
        </div>
      </NeonCard>

      {/* 渠道表现 */}
      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          获客渠道表现
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
                    {source.source}
                  </h3>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: tc.alpha(source.color, 0.15),
                      color: source.color,
                    }}
                  >
                    转化率 {conversionRate}%
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      线索数量
                    </p>
                    <p className="text-lg font-bold" style={{ color: tc.textPrimary }}>
                      {source.leads}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      转化数
                    </p>
                    <p className="text-lg font-bold" style={{ color: tc.success }}>
                      {source.conversion}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      获客成本
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
            {status === 'all' ? '全部线索' : getStatusConfig(status as Lead['status']).label}
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
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold" style={{ color: tc.textPrimary }}>
                            {lead.name}
                          </h3>
                          <p className="text-sm" style={{ color: tc.textSecondary }}>
                            {lead.position} · {lead.company}
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
                          线索状态
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
                          来源渠道
                        </p>
                        <span
                          className="inline-block px-3 py-1 rounded text-sm font-medium"
                          style={{
                            background: tc.bgInput,
                            color: tc.textPrimary,
                          }}
                        >
                          {lead.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：评分和价值 */}
                  <div className="lg:col-span-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs mb-2" style={{ color: tc.textMuted }}>
                          AI评分
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
                          预计价值
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
                        联系
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: tc.bgCard,
                          color: tc.textSecondary,
                          border: `1px solid ${tc.borderSubtle}`,
                        }}
                      >
                        详情
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
