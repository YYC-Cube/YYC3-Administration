import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Calculator,
  Calendar,
  Clock,
  Download,
  Percent,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC3 薪资系统 — Salary Management System
// Phase 1: 薪资驾驶舱 · 薪资核算 · 个税管理 · 考勤汇总
// ==========================================

type SalaryTab = 'dashboard' | 'calculation' | 'tax' | 'attendance'

export function SalaryPage() {
  const { t } = useI18n()
  const tc = useThemeColors()
  const [activeTab, setActiveTab] = useState<SalaryTab>('dashboard')

  const tabs: { id: SalaryTab; label: string; icon: typeof Wallet }[] = useMemo(
    () => [
      { id: 'dashboard', label: t('sal.tab.dashboard'), icon: BarChart3 },
      { id: 'calculation', label: t('sal.tab.calculation'), icon: Calculator },
      { id: 'tax', label: t('sal.tab.tax'), icon: Percent },
      { id: 'attendance', label: t('sal.tab.attendance'), icon: Clock },
    ],
    [t],
  )

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="tracking-wider flex items-center gap-3"
            style={{ color: tc.primary, textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.5)}` }}
          >
            <Wallet className="w-6 h-6" />
            {t('sal.title')}
          </h1>
          <p className="text-xs text-white/25 mt-1 tracking-wider">
            Salary Management System — Intelligent Payroll Engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            style={{
              background: tc.alpha(tc.primary, 0.08),
              border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
              color: tc.primary,
            }}
          >
            <Calendar className="w-3 h-3" />
            2026-06
          </button>
          <button
            className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
            style={{
              background: tc.alpha(tc.success, 0.08),
              border: `1px solid ${tc.alpha(tc.success, 0.2)}`,
              color: tc.success,
            }}
          >
            <Calculator className="w-3 h-3" />
            {t('sal.runCalculation')}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{
          background: tc.alpha(tc.textPrimary, 0.02),
          border: `1px solid ${tc.alpha(tc.textPrimary, 0.06)}`,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all duration-300"
              style={{
                background: isActive ? tc.alpha(tc.primary, 0.1) : 'transparent',
                color: isActive ? tc.primary : tc.alpha(tc.textPrimary, 0.35),
                boxShadow: isActive ? `0 0 8px ${tc.alpha(tc.primary, 0.1)}` : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <SalaryDashboard tc={tc} />}
      {activeTab === 'calculation' && <SalaryCalculation tc={tc} />}
      {activeTab === 'tax' && <TaxManagement tc={tc} />}
      {activeTab === 'attendance' && <AttendanceBoard tc={tc} />}
    </div>
  )
}

// ==========================================
//  Salary Dashboard
// ==========================================
function SalaryDashboard({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const kpiCards = useMemo(
    () => [
      {
        label: t('sal.kpi.grossPay'),
        value: '¥1,280,000',
        change: '+5.2%',
        up: true,
        icon: TrendingUp,
        color: '#10b981',
      },
      {
        label: t('sal.kpi.netPay'),
        value: '¥968,000',
        change: '+4.8%',
        up: true,
        icon: Wallet,
        color: '#3b82f6',
      },
      {
        label: t('sal.kpi.companyCost'),
        value: '¥358,400',
        change: '+3.1%',
        up: true,
        icon: Users,
        color: '#8b5cf6',
      },
      {
        label: t('sal.kpi.avgSalary'),
        value: '¥12,800',
        change: '+2.1%',
        up: true,
        icon: BarChart3,
        color: '#06b6d4',
      },
    ],
    [t],
  )

  const deptBreakdown = useMemo(
    () => [
      { deptKey: 'sal.dept.tech', count: 18, total: '¥420,000', pct: 32.8, color: '#06b6d4' },
      { deptKey: 'sal.dept.sales', count: 22, total: '¥380,000', pct: 29.7, color: '#10b981' },
      { deptKey: 'sal.dept.ops', count: 12, total: '¥280,000', pct: 21.9, color: '#8b5cf6' },
      { deptKey: 'sal.dept.mgmt', count: 5, total: '¥200,000', pct: 15.6, color: '#f59e0b' },
    ],
    [],
  )

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
                  <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">
                    {card.label}
                  </p>
                  <p
                    className="text-xl"
                    style={{ color: card.color, textShadow: `0 0 10px ${card.color}50` }}
                  >
                    {card.value}
                  </p>
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}10`, border: `1px solid ${card.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: `${card.color}80` }} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {card.up ? (
                  <ArrowUpRight className="w-3 h-3" style={{ color: '#10b981' }} />
                ) : (
                  <ArrowDownRight className="w-3 h-3" style={{ color: '#ef4444' }} />
                )}
                <span className="text-[10px]" style={{ color: card.up ? '#10b981' : '#ef4444' }}>
                  {card.change}
                </span>
                <span className="text-[10px] text-white/15 ml-1">{t('sal.vsLastMonth')}</span>
              </div>
            </NeonCard>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Department Breakdown */}
        <NeonCard color="#8b5cf6" hoverable={false}>
          <h3 className="text-xs mb-4 uppercase tracking-wider" style={{ color: tc.textSecondary }}>
            {t('sal.deptBreakdown')}
          </h3>
          <div className="space-y-3">
            {deptBreakdown.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-white/50">{t(d.deptKey)}</span>
                    <span className="text-[10px] text-white/20">
                      {t('sal.unit.people', { n: d.count })}
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: d.color }}>
                    {d.total} · {d.pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${d.pct}%`,
                      background: d.color,
                      boxShadow: `0 0 6px ${d.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

        {/* Salary Composition */}
        <NeonCard color="#10b981" hoverable={false}>
          <h3 className="text-xs mb-4 uppercase tracking-wider" style={{ color: tc.textSecondary }}>
            {t('sal.composition')}
          </h3>
          {[
            { name: t('sal.comp.base'), pct: 62, color: '#10b981' },
            { name: t('sal.comp.performance'), pct: 18, color: '#3b82f6' },
            { name: t('sal.comp.allowance'), pct: 12, color: '#f59e0b' },
            { name: t('sal.comp.overtime'), pct: 5, color: '#06b6d4' },
            { name: t('sal.comp.other'), pct: 3, color: '#6b7280' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 mb-2.5">
              <div className="w-3 h-3 rounded" style={{ background: item.color }} />
              <span className="text-xs text-white/50 flex-1">{item.name}</span>
              <div className="w-20 h-1.5 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.pct}%`, background: item.color }}
                />
              </div>
              <span className="text-[10px] text-white/30 w-8 text-right">{item.pct}%</span>
            </div>
          ))}
        </NeonCard>
      </div>

      {/* AI Insights */}
      <NeonCard color="#8b5cf6" hoverable={false}>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          <h3 className="text-xs text-white/40 uppercase tracking-wider">
            AI {t('sal.aiInsight')}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: t('sal.ai.costForecast'),
              descKey: 'sal.ai.costForecastDesc',
              icon: TrendingUp,
              color: '#10b981',
            },
            {
              title: t('sal.ai.taxOptimize'),
              descKey: 'sal.ai.taxOptimizeDesc',
              icon: ShieldCheck,
              color: '#8b5cf6',
            },
            {
              title: t('sal.ai.anomalyDetect'),
              descKey: 'sal.ai.anomalyDetectDesc',
              icon: Clock,
              color: '#f59e0b',
            },
          ].map((insight, i) => {
            const Icon = insight.icon
            return (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{ background: `${insight.color}08`, border: `1px solid ${insight.color}15` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: insight.color }} />
                  <span
                    className="text-[10px] uppercase tracking-wider"
                    style={{ color: insight.color }}
                  >
                    {insight.title}
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{t(insight.descKey)}</p>
              </div>
            )
          })}
        </div>
      </NeonCard>
    </div>
  )
}

// ==========================================
//  Salary Calculation
// ==========================================
function SalaryCalculation({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const employees = useMemo(
    () => [
      {
        nameKey: 'sal.name.zhangsan',
        deptKey: 'sal.dept.sales',
        base: 8000,
        gross: 12800,
        deductions: 2180,
        net: 10620,
        status: t('sal.status.calculated'),
        statusColor: '#06b6d4',
      },
      {
        nameKey: 'sal.name.lisi',
        deptKey: 'sal.dept.tech',
        base: 12000,
        gross: 15600,
        deductions: 2890,
        net: 12710,
        status: t('sal.status.calculated'),
        statusColor: '#06b6d4',
      },
      {
        nameKey: 'sal.name.wangwu',
        deptKey: 'sal.dept.ops',
        base: 9000,
        gross: 11200,
        deductions: 1750,
        net: 9450,
        status: t('sal.status.approved'),
        statusColor: '#10b981',
      },
      {
        nameKey: 'sal.name.zhaoliu',
        deptKey: 'sal.dept.mgmt',
        base: 15000,
        gross: 22500,
        deductions: 4820,
        net: 17680,
        status: t('sal.status.approved'),
        statusColor: '#10b981',
      },
      {
        nameKey: 'sal.name.sunqi',
        deptKey: 'sal.dept.sales',
        base: 8000,
        gross: 9600,
        deductions: 1420,
        net: 8180,
        status: t('sal.status.paid'),
        statusColor: '#8b5cf6',
      },
    ],
    [t],
  )

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: t('sal.action.batchCalc'),
            descKey: 'sal.action.batchCalcDesc',
            icon: Calculator,
            color: '#8b5cf6',
          },
          {
            label: t('sal.action.approve'),
            descKey: 'sal.action.approveDesc',
            icon: UserCheck,
            color: '#10b981',
          },
          {
            label: t('sal.action.export'),
            descKey: 'sal.action.exportDesc',
            icon: Download,
            color: '#06b6d4',
          },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <NeonCard key={i} color={action.color}>
              <button className="w-full text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" style={{ color: action.color }} />
                  <span className="text-xs text-white/70">{action.label}</span>
                </div>
                <p className="text-[10px] text-white/25">{t(action.descKey)}</p>
              </button>
            </NeonCard>
          )
        })}
      </div>

      {/* Employee Salary Table */}
      <NeonCard color="#8b5cf6" hoverable={false}>
        <h3 className="text-xs mb-4 uppercase tracking-wider" style={{ color: tc.textSecondary }}>
          {t('sal.employeeList')}
        </h3>
        {/* Table Header */}
        <div
          className="grid grid-cols-7 gap-2 pb-2 mb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            'sal.table.name',
            'sal.table.dept',
            'sal.table.base',
            'sal.table.gross',
            'sal.table.deductions',
            'sal.table.net',
            'sal.table.status',
          ].map((h, i) => (
            <span key={i} className="text-[10px] text-white/25 uppercase tracking-wider">
              {t(h)}
            </span>
          ))}
        </div>
        {employees.map((emp, i) => (
          <div
            key={i}
            className="grid grid-cols-7 gap-2 py-2 items-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            <span className="text-xs text-white/70">{t(emp.nameKey)}</span>
            <span className="text-[10px] text-white/40">{t(emp.deptKey)}</span>
            <span className="text-[10px] text-white/50">¥{emp.base.toLocaleString()}</span>
            <span className="text-xs" style={{ color: '#10b981' }}>
              ¥{emp.gross.toLocaleString()}
            </span>
            <span className="text-[10px]" style={{ color: '#ef4444' }}>
              -¥{emp.deductions.toLocaleString()}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: '#3b82f6', textShadow: '0 0 6px rgba(59,130,246,0.3)' }}
            >
              ¥{emp.net.toLocaleString()}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded inline-block text-center"
              style={{
                background: `${emp.statusColor}10`,
                color: emp.statusColor,
                border: `1px solid ${emp.statusColor}20`,
              }}
            >
              {emp.status}
            </span>
          </div>
        ))}
      </NeonCard>
    </div>
  )
}

// ==========================================
//  Tax Management
// ==========================================
function TaxManagement({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const taxBrackets = useMemo(
    () => [
      { level: 1, range: '≤ ¥3,000', rate: '3%', deduction: '¥0', employees: 12 },
      { level: 2, range: '¥3,000 - ¥12,000', rate: '10%', deduction: '¥210', employees: 18 },
      { level: 3, range: '¥12,000 - ¥25,000', rate: '20%', deduction: '¥1,410', employees: 8 },
      { level: 4, range: '¥25,000 - ¥35,000', rate: '25%', deduction: '¥2,660', employees: 3 },
      { level: 5, range: '> ¥35,000', rate: '30%', deduction: '¥4,410', employees: 1 },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      {/* Tax Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('sal.tax.monthlyTotal'), value: '¥42,800', color: '#8b5cf6' },
          { label: t('sal.tax.ytdTotal'), value: '¥256,800', color: '#06b6d4' },
          { label: t('sal.tax.avgPerPerson'), value: '¥1,069', color: '#10b981' },
        ].map((s, i) => (
          <NeonCard key={i} color={s.color}>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-lg" style={{ color: s.color, textShadow: `0 0 10px ${s.color}50` }}>
              {s.value}
            </p>
          </NeonCard>
        ))}
      </div>

      {/* Tax Bracket Table */}
      <NeonCard color="#8b5cf6" hoverable={false}>
        <h3 className="text-xs mb-4 uppercase tracking-wider" style={{ color: tc.textSecondary }}>
          {t('sal.tax.brackets')}
        </h3>
        <div
          className="grid grid-cols-5 gap-2 pb-2 mb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            'sal.tax.level',
            'sal.tax.taxableIncome',
            'sal.tax.rate',
            'sal.tax.quickDeduction',
            'sal.tax.people',
          ].map((h, i) => (
            <span key={i} className="text-[10px] text-white/25 uppercase tracking-wider">
              {t(h)}
            </span>
          ))}
        </div>
        {taxBrackets.map((bracket, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-2 py-2 items-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            <span className="text-xs text-white/50">{bracket.level}</span>
            <span className="text-[10px] text-white/40">{bracket.range}</span>
            <span className="text-xs" style={{ color: '#8b5cf6' }}>
              {bracket.rate}
            </span>
            <span className="text-[10px] text-white/40">{bracket.deduction}</span>
            <span className="text-[10px] text-white/30">
              {t('sal.unit.people', { n: bracket.employees })}
            </span>
          </div>
        ))}
      </NeonCard>
    </div>
  )
}

// ==========================================
//  Attendance Board
// ==========================================
function AttendanceBoard({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const attendanceData = useMemo(
    () => [
      {
        nameKey: 'sal.name.zhangsan',
        deptKey: 'sal.dept.sales',
        workDays: 22,
        actual: 21,
        late: 1,
        leave: 1,
        overtime: 12,
        color: '#10b981',
      },
      {
        nameKey: 'sal.name.lisi',
        deptKey: 'sal.dept.tech',
        workDays: 22,
        actual: 22,
        late: 0,
        leave: 0,
        overtime: 24,
        color: '#06b6d4',
      },
      {
        nameKey: 'sal.name.wangwu',
        deptKey: 'sal.dept.ops',
        workDays: 22,
        actual: 20,
        late: 2,
        leave: 2,
        overtime: 8,
        color: '#8b5cf6',
      },
      {
        nameKey: 'sal.name.zhaoliu',
        deptKey: 'sal.dept.mgmt',
        workDays: 22,
        actual: 22,
        late: 0,
        leave: 0,
        overtime: 6,
        color: '#f59e0b',
      },
      {
        nameKey: 'sal.name.sunqi',
        deptKey: 'sal.dept.sales',
        workDays: 22,
        actual: 19,
        late: 3,
        leave: 3,
        overtime: 16,
        color: '#ef4444',
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      {/* Attendance Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: t('sal.att.totalEmployees'), value: '42', color: '#8b5cf6' },
          { label: t('sal.att.fullAttendance'), value: '35', color: '#10b981' },
          { label: t('sal.att.lateCount'), value: '6', color: '#f59e0b' },
          { label: t('sal.att.absentCount'), value: '3', color: '#ef4444' },
        ].map((s, i) => (
          <NeonCard key={i} color={s.color}>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-lg" style={{ color: s.color, textShadow: `0 0 10px ${s.color}50` }}>
              {s.value}
            </p>
          </NeonCard>
        ))}
      </div>

      {/* Attendance Table */}
      <NeonCard color="#8b5cf6" hoverable={false}>
        <h3 className="text-xs mb-4 uppercase tracking-wider" style={{ color: tc.textSecondary }}>
          {t('sal.att.summary')}
        </h3>
        <div
          className="grid grid-cols-7 gap-2 pb-2 mb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            'sal.att.name',
            'sal.att.dept',
            'sal.att.workDays',
            'sal.att.actual',
            'sal.att.late',
            'sal.att.leave',
            'sal.att.overtime',
          ].map((h, i) => (
            <span key={i} className="text-[10px] text-white/25 uppercase tracking-wider">
              {t(h)}
            </span>
          ))}
        </div>
        {attendanceData.map((emp, i) => (
          <div
            key={i}
            className="grid grid-cols-7 gap-2 py-2 items-center"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            <span className="text-xs text-white/70">{t(emp.nameKey)}</span>
            <span className="text-[10px] text-white/40">{t(emp.deptKey)}</span>
            <span className="text-[10px] text-white/40">
              {t('sal.unit.day', { n: emp.workDays })}
            </span>
            <span
              className="text-xs"
              style={{ color: emp.actual === emp.workDays ? '#10b981' : '#f59e0b' }}
            >
              {t('sal.unit.day', { n: emp.actual })}
            </span>
            <span
              className="text-[10px]"
              style={{ color: emp.late > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}
            >
              {t('sal.unit.times', { n: emp.late })}
            </span>
            <span
              className="text-[10px]"
              style={{ color: emp.leave > 0 ? '#06b6d4' : 'rgba(255,255,255,0.3)' }}
            >
              {t('sal.unit.day', { n: emp.leave })}
            </span>
            <span
              className="text-[10px]"
              style={{ color: emp.overtime > 20 ? '#ef4444' : '#8b5cf6' }}
            >
              {t('sal.unit.hours', { n: emp.overtime })}
            </span>
          </div>
        ))}
      </NeonCard>
    </div>
  )
}
