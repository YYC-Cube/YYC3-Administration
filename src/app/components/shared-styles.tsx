import { useThemeColors } from './hooks/use-theme-colors'

import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const tc = useThemeColors()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: tc.textPrimary }}>
          {title}
        </h1>
        <p className="text-[11px]" style={{ color: tc.textMuted }}>
          {subtitle}
        </p>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

export interface StatCardProps {
  label: string
  value: string | number
  icon: (props: { className?: string; style?: React.CSSProperties }) => ReactNode
  color: string
  change?: string
  trend?: 'up' | 'down'
}

export function StatCard({ label, value, icon: Icon, color, change, trend = 'up' }: StatCardProps) {
  const tc = useThemeColors()

  const ArrowUpRight = (props: { className?: string; style?: React.CSSProperties }) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 7-5 5-5-5" />
      <path d="M12 17V7h5" />
    </svg>
  )

  const ArrowDownRight = (props: { className?: string; style?: React.CSSProperties }) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 17-5-5-5 5" />
      <path d="M12 7v10h5" />
    </svg>
  )

  const borderColor = color + '20'
  const hoverBorderColor = color + '40'
  const hoverBoxShadow = '0 0 15px ' + color + '15'
  const iconBgColor = color + '10'
  const iconBorderColor = color + '20'
  const iconColor = color + '70'
  const textShadowColor = '0 0 8px ' + color + '40'

  return (
    <div
      className="rounded-xl p-4 border transition-all duration-300 group"
      style={{ background: tc.bgCard, borderColor }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = hoverBorderColor
        e.currentTarget.style.boxShadow = hoverBoxShadow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = borderColor
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={TYPOGRAPHY.label}>{label}</p>
          <p className={TYPOGRAPHY.value} style={{ color, textShadow: textShadowColor }}>
            {value}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBgColor, border: '1px solid ' + iconBorderColor }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? (
            <ArrowUpRight className="w-3 h-3" style={{ color: tc.success }} />
          ) : (
            <ArrowDownRight className="w-3 h-3" style={{ color: tc.muted }} />
          )}
          <span className="text-[10px]" style={{ color: trend === 'up' ? tc.success : tc.muted }}>
            {change}
          </span>
        </div>
      )}
    </div>
  )
}

export interface ContentCardProps {
  title?: string
  children: ReactNode
  color?: string
}

export function ContentCard({ title, children, color = '#00f0ff' }: ContentCardProps) {
  const tc = useThemeColors()
  const borderColor = color + '12'
  return (
    <div className="rounded-2xl p-5 border" style={{ background: tc.bgCard, borderColor }}>
      {title && <h3 className={TYPOGRAPHY.heading3}>{title}</h3>}
      {children}
    </div>
  )
}

export const TYPOGRAPHY = {
  heading1: 'text-xl font-bold',
  heading2: 'text-lg font-semibold',
  heading3: 'text-[10px] text-white/30 uppercase tracking-wider',
  body: 'text-[11px] text-white/60',
  bodyMuted: 'text-[10px] text-white/20',
  label: 'text-[9px] text-white/20 uppercase tracking-wider',
  value: 'text-lg tabular-nums',
}

export const COLORS = {
  primary: '#00f0ff',
  secondary: '#00d4ff',
  success: '#00ffc8',
  warning: '#00ffcc',
  muted: '#005f73',
}
