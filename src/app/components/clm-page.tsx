import {
  Crown,
  Handshake,
  HeartHandshake,
  Mail,
  Megaphone,
  Phone,
  Plus,
  Search,
  Star,
  Target,
  User,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

interface Customer {
  id: string
  name: string
  company: string
  phone: string
  email: string
  stage: 'acquisition' | 'conversion' | 'closing' | 'service' | 'loyalty'
  value: number
  healthScore: number
  lastContact: string
  nextFollowUp: string
}

const STAGE_CONFIG = {
  acquisition: { label: '获客', icon: Megaphone, color: '#00f0ff' },
  conversion: { label: '转化', icon: Target, color: '#00d4ff' },
  closing: { label: '成交', icon: Handshake, color: '#00ffcc' },
  service: { label: '服务', icon: HeartHandshake, color: '#00ffc8' },
  loyalty: { label: '忠诚', icon: Crown, color: '#008b9d' },
}

export function CLMPage() {
  const tc = useThemeColors()
  const { t: translate } = useI18n()

  const [activeStage, setActiveStage] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const customers: Customer[] = [
    {
      id: 'C001',
      name: '张明远',
      company: '星际科技有限公司',
      phone: '138-0000-1234',
      email: 'zhangmy@startech.com',
      stage: 'loyalty',
      value: 580000,
      healthScore: 92,
      lastContact: '2天前',
      nextFollowUp: '本周',
    },
    {
      id: 'C002',
      name: '李思琪',
      company: '云端数据服务',
      phone: '139-1111-5678',
      email: 'lisq@clouddata.cn',
      stage: 'closing',
      value: 320000,
      healthScore: 85,
      lastContact: '昨天',
      nextFollowUp: '明天',
    },
    {
      id: 'C003',
      name: '王建华',
      company: '量子计算科技',
      phone: '137-2222-9012',
      email: 'wangjh@quantum.cn',
      stage: 'conversion',
      value: 180000,
      healthScore: 78,
      lastContact: '5天前',
      nextFollowUp: '下周',
    },
    {
      id: 'C004',
      name: '陈雅文',
      company: '智链网络科技',
      phone: '136-3333-3456',
      email: 'chenyw@smartchain.com',
      stage: 'service',
      value: 420000,
      healthScore: 95,
      lastContact: '1天前',
      nextFollowUp: '本月',
    },
    {
      id: 'C005',
      name: '赵鹏飞',
      company: '未来能源集团',
      phone: '135-4444-7890',
      email: 'zhaopf@futureenergy.cn',
      stage: 'acquisition',
      value: 95000,
      healthScore: 65,
      lastContact: '刚刚',
      nextFollowUp: '明天',
    },
    {
      id: 'C006',
      name: '刘雨晴',
      company: '智云科技有限公司',
      phone: '134-5555-2345',
      email: 'liuyq@smartcloud.com',
      stage: 'loyalty',
      value: 680000,
      healthScore: 98,
      lastContact: '3天前',
      nextFollowUp: '下月',
    },
    {
      id: 'C007',
      name: '孙伟强',
      company: '创新工坊',
      phone: '133-6666-6789',
      email: 'sunwq@innovation.cn',
      stage: 'conversion',
      value: 150000,
      healthScore: 72,
      lastContact: '1周前',
      nextFollowUp: '本周',
    },
    {
      id: 'C008',
      name: '周婷婷',
      company: '数字未来科技',
      phone: '132-7777-0123',
      email: 'zhoutt@digitalfuture.com',
      stage: 'closing',
      value: 280000,
      healthScore: 88,
      lastContact: '昨天',
      nextFollowUp: '今天',
    },
  ]

  const stats = [
    { label: '总客户数', value: '1,256', change: '+12%', positive: true },
    { label: '转化率', value: '34.2%', change: '+2.1%', positive: true },
    { label: '客户健康度', value: '87.5%', change: '+1.5%', positive: true },
    { label: '客户终身价值', value: '¥285万', change: '+8%', positive: true },
  ]

  const stageCounts = {
    acquisition: 245,
    conversion: 189,
    closing: 156,
    service: 328,
    loyalty: 338,
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesStage = activeStage === 'all' || customer.stage === activeStage
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    return matchesStage && matchesSearch
  })

  return (
    <div className="space-y-6" style={{ color: tc.textPrimary }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {translate('clm.title')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            全周期客户管理系统 · AI驱动价值提升
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
        >
          <Plus className="w-5 h-5" />
          {translate('clm.addCustomer')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <NeonCard key={stat.label} color={tc.accent} hoverable={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" style={{ color: tc.accent }} />
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  stat.positive ? 'text-green-400' : 'text-red-400'
                }`}
                style={{
                  background: stat.positive
                    ? tc.alpha(tc.success, 0.15)
                    : tc.alpha(tc.destructive, 0.15),
                  color: stat.positive ? tc.success : tc.destructive,
                }}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
              {stat.value}
            </p>
          </NeonCard>
        ))}
      </div>

      <NeonCard color={tc.secondary} hoverable={false} className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          {translate('clm.funnel')}
        </h2>
        <div className="flex items-end justify-between h-64 gap-4">
          {Object.entries(STAGE_CONFIG).map(([stage, config]) => {
            const Icon = config.icon
            const count = stageCounts[stage as keyof typeof stageCounts]
            const maxCount = Math.max(...Object.values(stageCounts))
            const height = (count / maxCount) * 100

            return (
              <div
                key={stage}
                className="flex-1 flex flex-col items-center"
                onClick={() => setActiveStage(stage)}
              >
                <div
                  className="w-full rounded-t-lg relative group cursor-pointer"
                  style={{
                    height: `${height}%`,
                    minHeight: '30px',
                    background: `linear-gradient(180deg, ${config.color}80, ${config.color}20)`,
                    border: `1px solid ${config.color}`,
                    boxShadow: activeStage === stage ? `0 0 20px ${config.color}40` : 'none',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-lg font-bold text-white">{count}</span>
                  </div>
                </div>
                <div
                  className={`mt-3 flex flex-col items-center p-2 rounded-lg ${
                    activeStage === stage ? 'opacity-100' : 'opacity-60'
                  }`}
                  style={{
                    border: `1px solid ${activeStage === stage ? config.color : 'transparent'}`,
                  }}
                >
                  <Icon className="w-5 h-5 mb-1" style={{ color: config.color }} />
                  <span className="text-sm font-medium" style={{ color: tc.textPrimary }}>
                    {config.label}
                  </span>
                  <span className="text-xs" style={{ color: tc.textSecondary }}>
                    {count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </NeonCard>

      <NeonCard color={tc.primary} hoverable={false} className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            {activeStage === 'all'
              ? translate('clm.allCustomers')
              : STAGE_CONFIG[activeStage as keyof typeof STAGE_CONFIG].label}
          </h2>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: tc.bgCard,
                border: `1px solid ${tc.borderSubtle}`,
              }}
            >
              <Search className="w-4 h-4" style={{ color: tc.textMuted }} />
              <input
                type="text"
                placeholder="搜索客户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-40"
                style={{ color: tc.textPrimary }}
              />
            </div>
            <div className="flex gap-2">
              {['all', ...Object.keys(STAGE_CONFIG)].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: activeStage === stage ? tc.alpha(tc.accent, 0.15) : tc.bgCard,
                    border: `1px solid ${activeStage === stage ? tc.accent : tc.borderSubtle}`,
                    color: activeStage === stage ? tc.accent : tc.textSecondary,
                  }}
                >
                  {stage === 'all'
                    ? '全部'
                    : STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredCustomers.map((customer) => {
            const stageConfig = STAGE_CONFIG[customer.stage]
            const StageIcon = stageConfig.icon

            return (
              <div
                key={customer.id}
                className="p-5 rounded-xl hover:scale-[1.02] transition-transform cursor-pointer"
                style={{
                  background: tc.bgCard,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: tc.bgCard,
                      border: `1px solid ${stageConfig.color}`,
                    }}
                  >
                    <User className="w-6 h-6" style={{ color: stageConfig.color }} />
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(customer.healthScore / 20) ? 'fill-current' : ''
                        }`}
                        style={{ color: tc.warning }}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-semibold mb-1" style={{ color: tc.textPrimary }}>
                  {customer.name}
                </h3>
                <p className="text-sm mb-3" style={{ color: tc.textSecondary }}>
                  {customer.company}
                </p>

                <div
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-4"
                  style={{
                    background: `${stageConfig.color}20`,
                    border: `1px solid ${stageConfig.color}`,
                    color: stageConfig.color,
                  }}
                >
                  <StageIcon className="w-3 h-3" />
                  {stageConfig.label}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: tc.textMuted }}>客户价值</span>
                    <span className="font-medium" style={{ color: tc.success }}>
                      ¥{customer.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: tc.textMuted }}>健康度</span>
                    <span className="font-medium" style={{ color: tc.accent }}>
                      {customer.healthScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: tc.textMuted }}>下次跟进</span>
                    <span style={{ color: tc.textSecondary }}>{customer.nextFollowUp}</span>
                  </div>
                </div>

                <div
                  className="flex gap-2 mt-4 pt-4 border-t"
                  style={{ borderColor: tc.borderSubtle }}
                >
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs"
                    style={{
                      background: tc.bgCard,
                      border: `1px solid ${tc.borderSubtle}`,
                      color: tc.textSecondary,
                    }}
                  >
                    <Phone className="w-3 h-3" />
                    呼叫
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs"
                    style={{
                      background: tc.bgCard,
                      border: `1px solid ${tc.borderSubtle}`,
                      color: tc.textSecondary,
                    }}
                  >
                    <Mail className="w-3 h-3" />
                    邮件
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
