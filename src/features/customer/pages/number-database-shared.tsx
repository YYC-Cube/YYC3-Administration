/**
 * @file number-database-shared.tsx
 * @description 客户号牌库共享展示件:NeonTooltip/StatCard/AIBadge
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,shared,components
 */

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { memo } from 'react'

import type { TooltipPayloadEntry } from './number-database-data'
import type { ReactNode } from 'react'

import { useThemeColors } from '@/shared/hooks/use-theme-colors'

const NeonTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 border"
      style={{
        background: 'rgba(10,10,10,0.95)',
        borderColor: 'rgba(0,240,255,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="text-[10px] text-white/40 mb-1">{label}</p>
      {payload.map((p: TooltipPayloadEntry, i: number) => (
        <p key={i} className="text-[11px]" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ---- Stat Card ----
const StatCard = memo(
  ({
    label,
    value,
    icon: Icon,
    color,
    change,
    trend,
  }: {
    label: string
    value: string
    icon: (props: { className?: string; style?: React.CSSProperties }) => ReactNode
    color: string
    change: string
    trend?: 'up' | 'down'
  }) => (
    <div
      className="rounded-xl p-4 border transition-all duration-300 group"
      style={{ background: 'rgba(10,10,10,0.5)', borderColor: `${color}20` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}40`
        e.currentTarget.style.boxShadow = `0 0 15px ${color}15`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}20`
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p>
          <p
            className="text-lg tabular-nums mt-0.5"
            style={{ color, textShadow: `0 0 8px ${color}40` }}
          >
            {value}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: `${color}70` }} />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        {(trend || 'up') === 'up' ? (
          <ArrowUpRight className="w-3 h-3 text-[#00ffc8]" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-[#005f73]" />
        )}
        <span
          className="text-[10px]"
          style={{ color: (trend || 'up') === 'up' ? '#00ffc8' : '#005f73' }}
        >
          {change}
        </span>
      </div>
    </div>
  ),
)

// ===========================================================
// Tab: Overview
// ===========================================================

const AIBadge = memo(({ score }: { score: number }) => {
  const color =
    score >= 90 ? '#00ffc8' : score >= 70 ? '#00ffcc' : score >= 50 ? '#008b9d' : '#005f73'
  return (
    <div className="flex items-center gap-1">
      <div className="relative w-6 h-6">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[7px] tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  )
})

// ===========================================================
// Main Export
// ===========================================================
// ===========================================================
// Add/Edit Contact Modal with Conditional Field Logic
// ===========================================================
export { NeonTooltip, StatCard, AIBadge }
