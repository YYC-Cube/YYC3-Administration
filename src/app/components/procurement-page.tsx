/**
 * @file procurement-page.tsx
 * @description YYC³ 采购管理 — Procurement Management
 *   供应商管理 · 采购申请 · 审批流程 · 采购订单 · 合同管理
 *   AI 智能供应商推荐 · 价格分析 · 风险预警
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @tags P1,supply-chain,procurement,AI
 */

import {
  AlertTriangle,
  Building2,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  Plus,
  Search,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

type ProcurementTab = 'overview' | 'suppliers' | 'orders' | 'contracts'

interface Supplier {
  id: string
  name: string
  category: string
  rating: number
  status: 'active' | 'pending' | 'suspended'
  orderCount: number
  totalAmount: string
  lastOrder: string
}

interface PurchaseOrder {
  id: string
  title: string
  supplier: string
  amount: string
  status: 'pending' | 'approved' | 'inProgress' | 'completed' | 'rejected'
  date: string
  priority: 'high' | 'medium' | 'low'
}

const mockSuppliers: Supplier[] = [
  {
    id: 'S001',
    name: '华科电子科技',
    category: '电子元器件',
    rating: 4.8,
    status: 'active',
    orderCount: 156,
    totalAmount: '¥2,380,000',
    lastOrder: '2026-07-15',
  },
  {
    id: 'S002',
    name: '鼎新制造集团',
    category: '机械零部件',
    rating: 4.6,
    status: 'active',
    orderCount: 89,
    totalAmount: '¥1,560,000',
    lastOrder: '2026-07-14',
  },
  {
    id: 'S003',
    name: '远航物流供应链',
    category: '物流服务',
    rating: 4.5,
    status: 'active',
    orderCount: 234,
    totalAmount: '¥890,000',
    lastOrder: '2026-07-15',
  },
  {
    id: 'S004',
    name: '瑞丰包装材料',
    category: '包装材料',
    rating: 4.3,
    status: 'pending',
    orderCount: 45,
    totalAmount: '¥320,000',
    lastOrder: '2026-07-10',
  },
  {
    id: 'S005',
    name: '星辰软件开发',
    category: 'IT服务',
    rating: 4.7,
    status: 'active',
    orderCount: 67,
    totalAmount: '¥1,120,000',
    lastOrder: '2026-07-13',
  },
  {
    id: 'S006',
    name: '恒达化工原料',
    category: '化工原料',
    rating: 3.9,
    status: 'suspended',
    orderCount: 23,
    totalAmount: '¥450,000',
    lastOrder: '2026-06-28',
  },
]

const mockOrders: PurchaseOrder[] = [
  {
    id: 'PO-2026-001',
    title: 'Q3 电子元件批量采购',
    supplier: '华科电子科技',
    amount: '¥580,000',
    status: 'approved',
    date: '2026-07-15',
    priority: 'high',
  },
  {
    id: 'PO-2026-002',
    title: '精密轴承采购订单',
    supplier: '鼎新制造集团',
    amount: '¥245,000',
    status: 'inProgress',
    date: '2026-07-14',
    priority: 'high',
  },
  {
    id: 'PO-2026-003',
    title: '办公设备更新采购',
    supplier: '星辰软件开发',
    amount: '¥180,000',
    status: 'pending',
    date: '2026-07-13',
    priority: 'medium',
  },
  {
    id: 'PO-2026-004',
    title: '包装材料季度采购',
    supplier: '瑞丰包装材料',
    amount: '¥95,000',
    status: 'completed',
    date: '2026-07-12',
    priority: 'low',
  },
  {
    id: 'PO-2026-005',
    title: '实验室试剂采购',
    supplier: '恒达化工原料',
    amount: '¥320,000',
    status: 'rejected',
    date: '2026-07-11',
    priority: 'medium',
  },
  {
    id: 'PO-2026-006',
    title: '物流服务年度合同',
    supplier: '远航物流供应链',
    amount: '¥150,000',
    status: 'inProgress',
    date: '2026-07-10',
    priority: 'high',
  },
]

const statusConfig: Record<string, { labelKey: string; color: string; icon: typeof CheckCircle }> =
  {
    active: { labelKey: 'prc.active', color: '#22c55e', icon: CheckCircle },
    pending: { labelKey: 'prc.pending', color: '#eab308', icon: Clock },
    suspended: { labelKey: 'prc.suspended', color: '#ef4444', icon: XCircle },
    approved: { labelKey: 'prc.approved', color: '#22c55e', icon: CheckCircle },
    inProgress: { labelKey: 'prc.inProgress', color: '#3b82f6', icon: Clock },
    completed: { labelKey: 'prc.completed', color: '#22c55e', icon: CheckCircle },
    rejected: { labelKey: 'prc.rejected', color: '#ef4444', icon: XCircle },
  }

export function ProcurementPage() {
  const { t } = useI18n()
  const tc = useThemeColors()
  const [activeTab, setActiveTab] = useState<ProcurementTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs: { id: ProcurementTab; labelKey: string; icon: typeof ClipboardList }[] = [
    { id: 'overview', labelKey: 'prc.cat.overview', icon: ClipboardList },
    { id: 'suppliers', labelKey: 'prc.cat.suppliers', icon: Building2 },
    { id: 'orders', labelKey: 'prc.cat.orders', icon: FileText },
    { id: 'contracts', labelKey: 'prc.cat.contracts', icon: Shield },
  ]

  const stats = [
    { label: t('prc.stat.activeSuppliers'), value: '4', trend: t('prc.stable'), color: tc.primary },
    {
      label: t('prc.stat.pendingOrders'),
      value: '3',
      trend: t('prc.stat.needAttention'),
      color: '#eab308',
    },
    {
      label: t('prc.stat.monthlySpend'),
      value: '¥1.57M',
      trend: '-12.3%',
      trendUp: true,
      color: '#22c55e',
    },
    {
      label: t('prc.stat.onTimeRate'),
      value: '94.2%',
      trend: '+2.1%',
      trendUp: true,
      color: '#3b82f6',
    },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
              {t('prc.title')}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: tc.textMuted }}>
              {t('prc.desc')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              style={{
                background: tc.alpha(tc.primary, 0.1),
                color: tc.primary,
                border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('prc.aiAnalyze')}
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              style={{ background: tc.primary, color: '#000' }}
            >
              <Plus className="w-3.5 h-3.5" />
              {t('prc.newOrder')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {stats.map((stat, idx) => (
            <NeonCard key={idx} color={stat.color} hoverable>
              <div className="p-3">
                <p className="text-[10px]" style={{ color: tc.textMuted }}>
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold" style={{ color: tc.textPrimary }}>
                    {stat.value}
                  </span>
                  {stat.trend && (
                    <span
                      className="text-[10px] flex items-center gap-0.5"
                      style={{ color: stat.trendUp ? '#22c55e' : '#ef4444' }}
                    >
                      {stat.trendUp ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
            </NeonCard>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
              style={{
                background: activeTab === tab.id ? tc.alpha(tc.primary, 0.12) : 'transparent',
                color: activeTab === tab.id ? tc.primary : tc.textMuted,
                border: `1px solid ${activeTab === tab.id ? tc.alpha(tc.primary, 0.3) : 'transparent'}`,
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* AI Insights */}
            <NeonCard color={tc.primary} hoverable={false}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" style={{ color: tc.primary }} />
                  <h3 className="text-sm font-semibold" style={{ color: tc.textPrimary }}>
                    {t('prc.aiInsights')}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: AlertTriangle,
                      labelKey: 'prc.ai.riskAlert',
                      descKey: 'prc.ai.riskAlertDesc',
                      color: '#eab308',
                    },
                    {
                      icon: TrendingDown,
                      labelKey: 'prc.ai.costOpt',
                      descKey: 'prc.ai.costOptDesc',
                      color: '#22c55e',
                    },
                    {
                      icon: Building2,
                      labelKey: 'prc.ai.supplierRec',
                      descKey: 'prc.ai.supplierRecDesc',
                      color: '#3b82f6',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg"
                      style={{
                        background: tc.alpha(item.color, 0.06),
                        border: `1px solid ${tc.alpha(item.color, 0.15)}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                        <span className="text-xs font-medium" style={{ color: tc.textPrimary }}>
                          {t(item.labelKey)}
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: tc.textMuted }}>
                        {t(item.descKey)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </NeonCard>

            {/* Recent Orders */}
            <NeonCard color={tc.muted} hoverable={false}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: tc.textPrimary }}>
                    {t('prc.recentOrders')}
                  </h3>
                  <button
                    className="text-[10px] flex items-center gap-0.5"
                    style={{ color: tc.primary }}
                  >
                    {t('prc.viewAll')} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {mockOrders.slice(0, 4).map((order) => {
                    const cfg = statusConfig[order.status]
                    const Icon = cfg.icon
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-2.5 rounded-lg transition-all"
                        style={{
                          background: tc.alpha(tc.muted, 0.04),
                          border: `1px solid ${tc.alpha(tc.muted, 0.08)}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: tc.alpha(cfg.color, 0.1) }}
                          >
                            <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: tc.textPrimary }}>
                              {order.title}
                            </p>
                            <p className="text-[10px]" style={{ color: tc.textMuted }}>
                              {order.supplier} · {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold" style={{ color: tc.textPrimary }}>
                            {order.amount}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px]"
                            style={{ background: tc.alpha(cfg.color, 0.1), color: cfg.color }}
                          >
                            {t(cfg.labelKey)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </NeonCard>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 relative">
                <Search
                  className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: tc.textMuted }}
                />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none transition-all"
                  style={{
                    background: tc.alpha(tc.muted, 0.06),
                    border: `1px solid ${tc.alpha(tc.muted, 0.15)}`,
                    color: tc.textPrimary,
                  }}
                  placeholder={t('prc.searchSupplier')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="p-2 rounded-lg"
                style={{
                  background: tc.alpha(tc.muted, 0.06),
                  border: `1px solid ${tc.alpha(tc.muted, 0.15)}`,
                  color: tc.textMuted,
                }}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
            {mockSuppliers
              .filter((s) => !searchQuery || s.name.includes(searchQuery))
              .map((supplier) => {
                const cfg = statusConfig[supplier.status]
                return (
                  <NeonCard key={supplier.id} color={cfg.color} hoverable>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: tc.alpha(cfg.color, 0.1) }}
                        >
                          <Building2 className="w-5 h-5" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium" style={{ color: tc.textPrimary }}>
                              {supplier.name}
                            </p>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px]"
                              style={{ background: tc.alpha(cfg.color, 0.1), color: cfg.color }}
                            >
                              {t(cfg.labelKey)}
                            </span>
                          </div>
                          <p className="text-[10px]" style={{ color: tc.textMuted }}>
                            {supplier.category} · {t('prc.rating')}: {supplier.rating}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color: tc.textPrimary }}>
                          {supplier.totalAmount}
                        </p>
                        <p className="text-[10px]" style={{ color: tc.textMuted }}>
                          {supplier.orderCount} {t('prc.orders')}
                        </p>
                      </div>
                    </div>
                  </NeonCard>
                )
              })}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-2">
            {mockOrders.map((order) => {
              const cfg = statusConfig[order.status]
              return (
                <NeonCard key={order.id} color={cfg.color} hoverable>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                          style={{ background: tc.alpha(tc.muted, 0.1), color: tc.textMuted }}
                        >
                          {order.id}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{ background: tc.alpha(cfg.color, 0.1), color: cfg.color }}
                        >
                          {t(cfg.labelKey)}
                        </span>
                        {order.priority === 'high' && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px]"
                            style={{ background: tc.alpha('#ef4444', 0.1), color: '#ef4444' }}
                          >
                            {t('prc.highPriority')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: tc.textPrimary }}>
                        {order.amount}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: tc.textPrimary }}>
                      {order.title}
                    </p>
                    <div
                      className="flex items-center gap-3 text-[10px]"
                      style={{ color: tc.textMuted }}
                    >
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {order.supplier}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.date}
                      </span>
                    </div>
                  </div>
                </NeonCard>
              )
            })}
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="space-y-3">
            <NeonCard color={tc.primary} hoverable={false}>
              <div className="p-4 text-center">
                <Shield
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: tc.alpha(tc.primary, 0.3) }}
                />
                <p className="text-sm" style={{ color: tc.textMuted }}>
                  {t('prc.contractsComingSoon')}
                </p>
                <p className="text-[10px] mt-1" style={{ color: tc.textMuted }}>
                  {t('prc.contractsComingSoonDesc')}
                </p>
              </div>
            </NeonCard>
          </div>
        )}
      </div>
    </div>
  )
}
