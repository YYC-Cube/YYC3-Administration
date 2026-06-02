import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote,
  BarChart3, Brain, Calendar, CheckCircle2, Clock, CreditCard,
  FileText, Landmark, Plus, Receipt, RefreshCw, Send,
  ShieldCheck, TrendingDown, TrendingUp, Wallet,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC3 财务管理系统 — Finance Management
// Phase 1: 驾驶舱 · 凭证管理 · 报销中心 · 预算看板
// ==========================================

type FinanceTab = 'dashboard' | 'vouchers' | 'expenses' | 'budget'

export function FinancePage() {
  const { t } = useI18n()
  const tc = useThemeColors()
  const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard')

  const tabs: { id: FinanceTab; label: string; icon: typeof Wallet }[] = useMemo(() => [
    { id: 'dashboard', label: t('finance.tab.dashboard'), icon: BarChart3 },
    { id: 'vouchers', label: t('finance.tab.vouchers'), icon: FileText },
    { id: 'expenses', label: t('finance.tab.expenses'), icon: Receipt },
    { id: 'budget', label: t('finance.tab.budget'), icon: Wallet },
  ], [t])

  return (
    <div className="h-full overflow-y-auto p-6" style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="tracking-wider flex items-center gap-3" style={{ color: '#06b6d4', textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>
            <Landmark className="w-6 h-6" />
            {t('finance.title')}
          </h2>
          <p className="text-xs text-white/25 mt-1 tracking-wider">Finance Management System — AI-Powered Financial Intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: '#06b6d4' }}
          >
            <Calendar className="w-3 h-3" />
            2026-06
          </button>
          <button
            className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}
          >
            <Plus className="w-3 h-3" />
            {t('finance.newVoucher')}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all duration-300"
              style={{
                background: isActive ? 'rgba(6,182,212,0.1)' : 'transparent',
                color: isActive ? '#06b6d4' : 'rgba(255,255,255,0.35)',
                boxShadow: isActive ? '0 0 8px rgba(6,182,212,0.1)' : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <FinanceDashboard tc={tc} />}
      {activeTab === 'vouchers' && <VoucherManagement tc={tc} />}
      {activeTab === 'expenses' && <ExpenseCenter tc={tc} />}
      {activeTab === 'budget' && <BudgetBoard tc={tc} />}
    </div>
  )
}

// ==========================================
//  Finance Dashboard
// ==========================================
function FinanceDashboard({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const kpiCards = useMemo(() => [
    { label: t('finance.kpi.income'), value: '¥1,280,000', change: '+12.3%', up: true, icon: TrendingUp, color: '#10b981' },
    { label: t('finance.kpi.expense'), value: '¥856,000', change: '-3.2%', up: false, icon: TrendingDown, color: '#ef4444' },
    { label: t('finance.kpi.profit'), value: '¥424,000', change: '+28.5%', up: true, icon: Banknote, color: '#06b6d4' },
    { label: t('finance.kpi.cash'), value: '¥3,560,000', change: '+5.1%', up: true, icon: Wallet, color: '#8b5cf6' },
  ], [t])

  const pendingItems = useMemo(() => [
    { title: '报销审批 — 张三 差旅报销 ¥3,200', status: 'pending', time: '2小时前', color: '#f59e0b' },
    { title: '报销审批 — 李四 办公用品 ¥1,580', status: 'pending', time: '4小时前', color: '#f59e0b' },
    { title: '凭证审核 — 6月第23号凭证', status: 'pending', time: '昨天', color: '#06b6d4' },
    { title: '预算预警 — 销售部已达85%', status: 'warning', time: '今天', color: '#ef4444' },
    { title: '税务申报 — 截止6月15日', status: 'info', time: '提醒', color: '#3b82f6' },
  ], [])

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon
          return (
            <NeonCard key={i} color={card.color}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-xl" style={{ color: card.color, textShadow: `0 0 10px ${card.color}50` }}>{card.value}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${card.color}10`, border: `1px solid ${card.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: `${card.color}80` }} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {card.up ? <ArrowUpRight className="w-3 h-3" style={{ color: '#10b981' }} /> : <ArrowDownRight className="w-3 h-3" style={{ color: '#ef4444' }} />}
                <span className="text-[10px]" style={{ color: card.up ? '#10b981' : '#ef4444' }}>{card.change}</span>
                <span className="text-[10px] text-white/15 ml-1">vs 上月</span>
              </div>
            </NeonCard>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Budget Execution */}
        <NeonCard color="#06b6d4" hoverable={false}>
          <h3 className="text-xs text-white/40 mb-4 uppercase tracking-wider">{t('finance.budgetExecution')}</h3>
          {[
            { dept: '技术部', used: 72, total: '¥420,000', color: '#10b981' },
            { dept: '销售部', used: 85, total: '¥380,000', color: '#f59e0b' },
            { dept: '运营部', used: 58, total: '¥280,000', color: '#06b6d4' },
            { dept: '管理层', used: 41, total: '¥200,000', color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">{item.dept}</span>
                <span className="text-[10px]" style={{ color: item.color }}>{item.total} · {item.used}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.used}%`, background: item.color, boxShadow: `0 0 6px ${item.color}40` }} />
              </div>
            </div>
          ))}
        </NeonCard>

        {/* Pending Items */}
        <NeonCard color="#f59e0b" hoverable={false}>
          <h3 className="text-xs text-white/40 mb-4 uppercase tracking-wider">{t('finance.pendingItems')}</h3>
          <div className="space-y-2.5">
            {pendingItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 truncate">{item.title}</p>
                  <p className="text-[10px] text-white/20 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      {/* AI Financial Insight */}
      <NeonCard color="#8b5cf6" hoverable={false}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          <h3 className="text-xs text-white/40 uppercase tracking-wider">AI {t('finance.aiInsight')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, title: t('finance.ai.revenueTrend'), desc: '预计下月收入增长 8-12%，建议加大营销投入', color: '#10b981' },
            { icon: ShieldCheck, title: t('finance.ai.riskAlert'), desc: '应收账款逾期风险增加，建议加强催收', color: '#f59e0b' },
            { icon: AlertTriangle, title: t('finance.ai.costOptimize'), desc: '办公费用同比上升 15%，存在优化空间', color: '#06b6d4' },
          ].map((insight, i) => {
            const Icon = insight.icon
            return (
              <div key={i} className="p-3 rounded-xl" style={{ background: `${insight.color}08`, border: `1px solid ${insight.color}15` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: insight.color }} />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: insight.color }}>{insight.title}</span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{insight.desc}</p>
              </div>
            )
          })}
        </div>
      </NeonCard>
    </div>
  )
}

// ==========================================
//  Voucher Management
// ==========================================
function VoucherManagement({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const vouchers = useMemo(() => [
    { no: 'PZ-202606-001', date: '2026-06-01', type: t('finance.voucherType.receipt'), amount: '¥128,000', status: t('finance.status.posted'), statusColor: '#10b981' },
    { no: 'PZ-202606-002', date: '2026-06-01', type: t('finance.voucherType.payment'), amount: '¥56,000', status: t('finance.status.posted'), statusColor: '#10b981' },
    { no: 'PZ-202606-003', date: '2026-06-02', type: t('finance.voucherType.transfer'), amount: '¥35,000', status: t('finance.status.approved'), statusColor: '#06b6d4' },
    { no: 'PZ-202606-004', date: '2026-06-02', type: t('finance.voucherType.auto'), amount: '¥24,000', status: t('finance.status.pending'), statusColor: '#f59e0b' },
    { no: 'PZ-202606-005', date: '2026-06-03', type: t('finance.voucherType.payment'), amount: '¥8,500', status: t('finance.status.draft'), statusColor: '#6b7280' },
  ], [t])

  return (
    <div className="space-y-4">
      <NeonCard color="#06b6d4" hoverable={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs text-white/40 uppercase tracking-wider">{t('finance.voucherList')}</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg text-[10px]" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <Brain className="w-3 h-3 inline mr-1" />AI {t('finance.autoGenerate')}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {vouchers.map((v, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${v.statusColor}10`, border: `1px solid ${v.statusColor}20` }}>
                <FileText className="w-4 h-4" style={{ color: v.statusColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">{v.no}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${v.statusColor}10`, color: v.statusColor, border: `1px solid ${v.statusColor}20` }}>{v.status}</span>
                </div>
                <p className="text-[10px] text-white/25 mt-0.5">{v.date} · {v.type}</p>
              </div>
              <span className="text-sm font-medium" style={{ color: '#06b6d4', textShadow: '0 0 8px rgba(6,182,212,0.3)' }}>{v.amount}</span>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  )
}

// ==========================================
//  Expense Center
// ==========================================
function ExpenseCenter({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const expenses = useMemo(() => [
    { applicant: '张三', dept: '销售部', type: t('finance.expenseType.travel'), amount: '¥3,200', status: t('finance.status.pending'), statusColor: '#f59e0b', date: '2026-06-02' },
    { applicant: '李四', dept: '技术部', type: t('finance.expenseType.office'), amount: '¥1,580', status: t('finance.status.pending'), statusColor: '#f59e0b', date: '2026-06-01' },
    { applicant: '王五', dept: '运营部', type: t('finance.expenseType.marketing'), amount: '¥8,600', status: t('finance.status.approved'), statusColor: '#10b981', date: '2026-05-30' },
    { applicant: '赵六', dept: '管理层', type: t('finance.expenseType.travel'), amount: '¥5,400', status: t('finance.status.paid'), statusColor: '#06b6d4', date: '2026-05-28' },
  ], [t])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('finance.expense.pending'), value: '2', color: '#f59e0b', icon: Clock },
          { label: t('finance.expense.approved'), value: '5', color: '#10b981', icon: CheckCircle2 },
          { label: t('finance.expense.totalMonth'), value: '¥18,780', color: '#06b6d4', icon: CreditCard },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <NeonCard key={i} color={s.color}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: s.color }} />
                <div>
                  <p className="text-[10px] text-white/25">{s.label}</p>
                  <p className="text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              </div>
            </NeonCard>
          )
        })}
      </div>

      {/* Expense List */}
      <NeonCard color="#f59e0b" hoverable={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs text-white/40 uppercase tracking-wider">{t('finance.expenseList')}</h3>
          <button className="px-3 py-1 rounded-lg text-[10px]" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <Plus className="w-3 h-3 inline mr-1" />{t('finance.newExpense')}
          </button>
        </div>
        <div className="space-y-2">
          {expenses.map((e, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${e.statusColor}10`, border: `1px solid ${e.statusColor}20` }}>
                <Receipt className="w-4 h-4" style={{ color: e.statusColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">{e.applicant} · {e.type}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${e.statusColor}10`, color: e.statusColor, border: `1px solid ${e.statusColor}20` }}>{e.status}</span>
                </div>
                <p className="text-[10px] text-white/25 mt-0.5">{e.dept} · {e.date}</p>
              </div>
              <span className="text-sm" style={{ color: '#ef4444' }}>{e.amount}</span>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  )
}

// ==========================================
//  Budget Board
// ==========================================
function BudgetBoard({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const budgetItems = useMemo(() => [
    { account: '办公费用', planned: 50000, used: 38000, dept: '全公司', color: '#06b6d4' },
    { account: '差旅费用', planned: 80000, used: 62000, dept: '销售部', color: '#10b981' },
    { account: '营销推广', planned: 200000, used: 168000, dept: '市场部', color: '#8b5cf6' },
    { account: '设备采购', planned: 120000, used: 45000, dept: '技术部', color: '#3b82f6' },
    { account: '培训费用', planned: 30000, used: 12000, dept: '人力部', color: '#f59e0b' },
    { account: '招待费用', planned: 20000, used: 18500, dept: '管理层', color: '#ef4444' },
  ], [])

  return (
    <div className="space-y-4">
      {/* Budget Overview */}
      <div className="grid grid-cols-2 gap-4">
        <NeonCard color="#10b981">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{t('finance.budget.total')}</p>
          <p className="text-xl" style={{ color: '#10b981', textShadow: '0 0 10px rgba(16,185,129,0.5)' }}>¥500,000</p>
          <p className="text-[10px] text-white/15 mt-1">年度预算总额</p>
        </NeonCard>
        <NeonCard color="#06b6d4">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{t('finance.budget.used')}</p>
          <p className="text-xl" style={{ color: '#06b6d4', textShadow: '0 0 10px rgba(6,182,212,0.5)' }}>¥343,500</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex-1 h-1 rounded-full bg-white/5">
              <div className="h-full rounded-full" style={{ width: '68.7%', background: '#06b6d4', boxShadow: '0 0 6px rgba(6,182,212,0.3)' }} />
            </div>
            <span className="text-[10px] text-white/20">68.7%</span>
          </div>
        </NeonCard>
      </div>

      {/* Budget Items */}
      <NeonCard color="#8b5cf6" hoverable={false}>
        <h3 className="text-xs text-white/40 mb-4 uppercase tracking-wider">{t('finance.budget.items')}</h3>
        <div className="space-y-3">
          {budgetItems.map((item, i) => {
            const pct = Math.round((item.used / item.planned) * 100)
            return (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-xs text-white/60">{item.account}</span>
                    <span className="text-[10px] text-white/20 ml-2">{item.dept}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs" style={{ color: item.color }}>¥{item.used.toLocaleString()}</span>
                    <span className="text-[10px] text-white/20"> / ¥{item.planned.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${pct}%`,
                    background: pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : item.color,
                    boxShadow: `0 0 6px ${pct > 90 ? 'rgba(239,68,68,0.4)' : pct > 75 ? 'rgba(245,158,11,0.4)' : `${item.color}40`}`,
                  }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-white/15">{pct >= 90 ? '⚠️ 预算紧张' : pct >= 75 ? '接近预警线' : '正常'}</span>
                  <span className="text-[10px]" style={{ color: pct > 90 ? '#ef4444' : pct > 75 ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}>{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </NeonCard>
    </div>
  )
}
