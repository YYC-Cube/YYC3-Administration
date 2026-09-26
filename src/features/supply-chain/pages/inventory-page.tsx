/**
 * @file inventory-page.tsx
 * @description YYC³ 库存管理 — Inventory Management
 *   库存盘点 · 出入库管理 · 库存预警 · 批次追踪 · 仓库管理
 *   AI 智能补货建议 · 库存优化 · 周转率分析
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @tags P1,supply-chain,inventory,AI
 */

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Box,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Warehouse,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

type InventoryTab = 'overview' | 'stockList' | 'inOutRecords' | 'warehouses'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  warehouse: string
  quantity: number
  safetyStock: number
  unit: string
  status: 'normal' | 'low' | 'outOfStock' | 'overstock'
  lastUpdated: string
}

interface InOutRecord {
  id: string
  type: 'in' | 'out'
  itemName: string
  quantity: number
  unit: string
  operator: string
  date: string
  note: string
}

// Mock display strings (name/category/warehouse/unit/operator/note) are i18n keys (ivp.*);
// render points must wrap them with t(). Non-key legacy values fall through t() unchanged.
const mockInventory: InventoryItem[] = [
  {
    id: 'I001',
    name: 'ivp.item.bearing6205',
    sku: 'BRG-6205-001',
    category: 'ivp.cat.mechanical',
    warehouse: 'ivp.wh.main',
    quantity: 1250,
    safetyStock: 500,
    unit: 'ivp.unit.piece',
    status: 'normal',
    lastUpdated: '2026-07-15',
  },
  {
    id: 'I002',
    name: 'ivp.item.mcuChip',
    sku: 'IC-STM32-002',
    category: 'ivp.cat.electronics',
    warehouse: 'ivp.wh.electronics',
    quantity: 320,
    safetyStock: 500,
    unit: 'ivp.unit.sheet',
    status: 'low',
    lastUpdated: '2026-07-15',
  },
  {
    id: 'I003',
    name: 'ivp.item.powerModule',
    sku: 'PWR-24V-003',
    category: 'ivp.cat.electronics',
    warehouse: 'ivp.wh.electronics',
    quantity: 0,
    safetyStock: 200,
    unit: 'ivp.unit.piece',
    status: 'outOfStock',
    lastUpdated: '2026-07-14',
  },
  {
    id: 'I004',
    name: 'ivp.item.boltM10',
    sku: 'BLT-M10-004',
    category: 'ivp.cat.fasteners',
    warehouse: 'ivp.wh.main',
    quantity: 8500,
    safetyStock: 2000,
    unit: 'ivp.unit.piece',
    status: 'normal',
    lastUpdated: '2026-07-15',
  },
  {
    id: 'I005',
    name: 'ivp.item.esdBag',
    sku: 'PKG-ESD-005',
    category: 'ivp.cat.packaging',
    warehouse: 'ivp.wh.packaging',
    quantity: 15000,
    safetyStock: 5000,
    unit: 'ivp.unit.piece',
    status: 'overstock',
    lastUpdated: '2026-07-14',
  },
  {
    id: 'I006',
    name: 'ivp.item.thermalPaste',
    sku: 'THM-GRS-006',
    category: 'ivp.cat.chemicals',
    warehouse: 'ivp.wh.chemicals',
    quantity: 85,
    safetyStock: 100,
    unit: 'ivp.unit.tube',
    status: 'low',
    lastUpdated: '2026-07-13',
  },
]

const mockRecords: InOutRecord[] = [
  {
    id: 'R001',
    type: 'in',
    itemName: 'ivp.item.bearing6205',
    quantity: 500,
    unit: 'ivp.unit.piece',
    operator: 'ivp.op.zhang',
    date: '2026-07-15 14:30',
    note: 'ivp.note.purchaseIn1',
  },
  {
    id: 'R002',
    type: 'out',
    itemName: 'ivp.item.mcuChip',
    quantity: 200,
    unit: 'ivp.unit.sheet',
    operator: 'ivp.op.li',
    date: '2026-07-15 10:15',
    note: 'ivp.note.productionOut',
  },
  {
    id: 'R003',
    type: 'in',
    itemName: 'ivp.item.boltM10',
    quantity: 3000,
    unit: 'ivp.unit.piece',
    operator: 'ivp.op.wang',
    date: '2026-07-14 16:00',
    note: 'ivp.note.purchaseIn2',
  },
  {
    id: 'R004',
    type: 'out',
    itemName: 'ivp.item.powerModule',
    quantity: 150,
    unit: 'ivp.unit.piece',
    operator: 'ivp.op.zhao',
    date: '2026-07-14 09:30',
    note: 'ivp.note.rdUse',
  },
  {
    id: 'R005',
    type: 'out',
    itemName: 'ivp.item.thermalPaste',
    quantity: 25,
    unit: 'ivp.unit.tube',
    operator: 'ivp.op.sun',
    date: '2026-07-13 11:00',
    note: 'ivp.note.maintenanceUse',
  },
]

const statusConfig: Record<string, { labelKey: string; color: string; icon: typeof CheckCircle }> =
  {
    normal: { labelKey: 'inv.normal', color: '#22c55e', icon: CheckCircle },
    low: { labelKey: 'inv.low', color: '#eab308', icon: AlertTriangle },
    outOfStock: { labelKey: 'inv.outOfStock', color: '#ef4444', icon: XCircle },
    overstock: { labelKey: 'inv.overstock', color: '#3b82f6', icon: Box },
  }

export function InventoryPage() {
  const { t } = useI18n()
  const tc = useThemeColors()
  const [activeTab, setActiveTab] = useState<InventoryTab>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs: { id: InventoryTab; labelKey: string; icon: typeof ClipboardList }[] = [
    { id: 'overview', labelKey: 'inv.cat.overview', icon: ClipboardList },
    { id: 'stockList', labelKey: 'inv.cat.stockList', icon: Package },
    { id: 'inOutRecords', labelKey: 'inv.cat.inOutRecords', icon: RefreshCw },
    { id: 'warehouses', labelKey: 'inv.cat.warehouses', icon: Warehouse },
  ]

  const stats = [
    { label: t('inv.stat.totalSku'), value: '1,286', trend: '', color: tc.primary },
    {
      label: t('inv.stat.lowStockAlerts'),
      value: '12',
      trend: t('inv.stat.needAttention'),
      color: '#eab308',
    },
    {
      label: t('inv.stat.totalValue'),
      value: '¥8.52M',
      trend: '+5.6%',
      trendUp: true,
      color: '#22c55e',
    },
    {
      label: t('inv.stat.turnoverRate'),
      value: '3.8x',
      trend: '+0.4x',
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
              {t('inv.title')}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: tc.textMuted }}>
              {t('inv.desc')}
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
              {t('inv.aiRestock')}
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              style={{ background: tc.primary, color: '#000' }}
            >
              <Plus className="w-3.5 h-3.5" />
              {t('inv.newRecord')}
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
                      style={{
                        color: stat.trendUp
                          ? '#22c55e'
                          : stat.trend.includes('关注')
                            ? '#eab308'
                            : tc.textMuted,
                      }}
                    >
                      {stat.trendUp && <TrendingUp className="w-3 h-3" />}
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
                    {t('inv.aiInsights')}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: AlertTriangle,
                      labelKey: 'inv.ai.restockAlert',
                      descKey: 'inv.ai.restockAlertDesc',
                      color: '#eab308',
                    },
                    {
                      icon: TrendingDown,
                      labelKey: 'inv.ai.slowMoving',
                      descKey: 'inv.ai.slowMovingDesc',
                      color: '#ef4444',
                    },
                    {
                      icon: BarChart3,
                      labelKey: 'inv.ai.turnoverOpt',
                      descKey: 'inv.ai.turnoverOptDesc',
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

            {/* Stock Alerts Summary */}
            <NeonCard color={tc.muted} hoverable={false}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold" style={{ color: tc.textPrimary }}>
                    {t('inv.stockAlerts')}
                  </h3>
                  <button
                    className="text-[10px] flex items-center gap-0.5"
                    style={{ color: tc.primary }}
                  >
                    {t('inv.viewAll')} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {mockInventory
                    .filter((i) => i.status !== 'normal')
                    .slice(0, 4)
                    .map((item) => {
                      const cfg = statusConfig[item.status]
                      const Icon = cfg.icon
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-lg"
                          style={{
                            background: tc.alpha(cfg.color, 0.04),
                            border: `1px solid ${tc.alpha(cfg.color, 0.12)}`,
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
                                {t(item.name)}
                              </p>
                              <p className="text-[10px]" style={{ color: tc.textMuted }}>
                                {item.sku} · {t(item.warehouse)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-xs font-semibold"
                              style={{ color: item.quantity === 0 ? '#ef4444' : tc.textPrimary }}
                            >
                              {item.quantity} {t(item.unit)}
                            </p>
                            <p className="text-[10px]" style={{ color: tc.textMuted }}>
                              {t('inv.safetyStock')}: {item.safetyStock}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </NeonCard>
          </div>
        )}

        {/* Stock List Tab */}
        {activeTab === 'stockList' && (
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
                  placeholder={t('inv.searchItem')}
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
            {mockInventory
              .filter(
                (s) =>
                  !searchQuery || t(s.name).includes(searchQuery) || s.sku.includes(searchQuery),
              )
              .map((item) => {
                const cfg = statusConfig[item.status]
                return (
                  <NeonCard key={item.id} color={cfg.color} hoverable>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: tc.alpha(cfg.color, 0.1) }}
                        >
                          <Package className="w-5 h-5" style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium" style={{ color: tc.textPrimary }}>
                              {t(item.name)}
                            </p>
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px]"
                              style={{ background: tc.alpha(cfg.color, 0.1), color: cfg.color }}
                            >
                              {t(cfg.labelKey)}
                            </span>
                          </div>
                          <p className="text-[10px]" style={{ color: tc.textMuted }}>
                            {item.sku} · {t(item.category)} · {t(item.warehouse)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold" style={{ color: tc.textPrimary }}>
                          {item.quantity} {t(item.unit)}
                        </p>
                        <p className="text-[10px]" style={{ color: tc.textMuted }}>
                          {t('inv.safetyStock')}: {item.safetyStock} · {item.lastUpdated}
                        </p>
                      </div>
                    </div>
                  </NeonCard>
                )
              })}
          </div>
        )}

        {/* In/Out Records Tab */}
        {activeTab === 'inOutRecords' && (
          <div className="space-y-2">
            {mockRecords.map((record) => (
              <NeonCard
                key={record.id}
                color={record.type === 'in' ? '#22c55e' : '#ef4444'}
                hoverable
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: tc.alpha(tc.muted, 0.1), color: tc.textMuted }}
                      >
                        {record.id}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"
                        style={{
                          background:
                            record.type === 'in'
                              ? tc.alpha('#22c55e', 0.1)
                              : tc.alpha('#ef4444', 0.1),
                          color: record.type === 'in' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {record.type === 'in' ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUp className="w-3 h-3" />
                        )}
                        {record.type === 'in' ? t('inv.in') : t('inv.out')}
                      </span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: tc.textPrimary }}>
                      {record.type === 'in' ? '+' : '-'}
                      {record.quantity} {t(record.unit)}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: tc.textPrimary }}>
                    {t(record.itemName)}
                  </p>
                  <div
                    className="flex items-center gap-3 text-[10px]"
                    style={{ color: tc.textMuted }}
                  >
                    <span>
                      {t('inv.operator')}: {t(record.operator)}
                    </span>
                    <span>{record.date}</span>
                    <span>{t(record.note)}</span>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        )}

        {/* Warehouses Tab */}
        {activeTab === 'warehouses' && (
          <div className="space-y-3">
            <NeonCard color={tc.primary} hoverable={false}>
              <div className="p-4 text-center">
                <Warehouse
                  className="w-12 h-12 mx-auto mb-3"
                  style={{ color: tc.alpha(tc.primary, 0.3) }}
                />
                <p className="text-sm" style={{ color: tc.textMuted }}>
                  {t('inv.warehousesComingSoon')}
                </p>
                <p className="text-[10px] mt-1" style={{ color: tc.textMuted }}>
                  {t('inv.warehousesComingSoonDesc')}
                </p>
              </div>
            </NeonCard>
          </div>
        )}
      </div>
    </div>
  )
}
