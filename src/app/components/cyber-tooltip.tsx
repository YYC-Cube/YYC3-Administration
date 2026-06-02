/**
 * Shared theme-aware Recharts tooltip.
 * Renders with Cyberpunk neon or Liquid Glass styling
 * depending on the active UI theme.
 */
import { useThemeColors } from './hooks/use-theme-colors'

/** Recharts tooltip payload entry */
export interface CyberTooltipPayload {
  name: string
  value: number | string
  color: string
}

interface CyberTooltipProps {
  active?: boolean
  payload?: CyberTooltipPayload[]
  label?: string
}

export function CyberTooltip({ active, payload, label }: CyberTooltipProps) {
  const tc = useThemeColors()

  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-xl px-3 py-2 border"
      style={{
        background: tc.isCyberpunk ? 'rgba(10,10,10,0.95)' : 'rgba(10,15,10,0.92)',
        borderColor: tc.alpha(tc.primary, 0.3),
        backdropFilter: tc.backdropFilter,
        boxShadow: tc.isCyberpunk
          ? `0 0 15px ${tc.alpha(tc.primary, 0.2)}`
          : `0 8px 32px rgba(0,0,0,0.15), 0 0 15px ${tc.alpha(tc.primary, 0.1)}`,
      }}
    >
      <p className="text-[10px] text-white/40 mb-1">{label}</p>
      {payload.map((p: CyberTooltipPayload, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}
