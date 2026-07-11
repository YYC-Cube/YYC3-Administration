/**
 * @file neon-card.tsx
 * @description Cyberpunk-styled card with neon glow border and optional scroll-reveal animation.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2025-07-11
 * @tags neon, card, cyberpunk, liquid-glass
 */

import * as React from 'react'
import { memo, useEffect, useRef, useState } from 'react'

import { getThemeNavColor, useThemeColors } from './hooks/use-theme-colors'
import { useThemeSwitcher } from './theme-switcher-context'

interface NeonCardProps {
  children: React.ReactNode
  color?: string
  className?: string
  style?: React.CSSProperties
  hoverable?: boolean
  onClick?: () => void
  noReveal?: boolean
  ariaLabel?: string
}

/**
 * Cyberpunk-styled card with neon glow border and optional scroll-reveal animation.
 * Uses `IntersectionObserver` for performant lazy entrance and `will-change` hints.
 * Memoized with `React.memo` to prevent unnecessary re-renders.
 *
 * @component
 * @param color - Neon glow color (default `#00f0ff`).
 * @param hoverable - Enable hover lift and glow intensification.
 * @param noReveal - Disable IntersectionObserver scroll-reveal animation.
 * @param ariaLabel - Accessible label for the card container.
 * @example
 * ```tsx
 * <NeonCard color="#00f0ff" hoverable>
 *   <p>Card content</p>
 * </NeonCard>
 * ```
 */
export const NeonCard = memo(function NeonCard({
  children,
  color = '#00f0ff',
  className = '',
  style,
  hoverable = true,
  onClick,
  noReveal = false,
  ariaLabel,
}: NeonCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(noReveal)
  const { theme } = useThemeSwitcher()
  const tc = useThemeColors()
  const isLiquid = tc.isLiquidGlass
  const effectiveColor = getThemeNavColor(color, tc.isCyberpunk)

  // IntersectionObserver for scroll reveal
  useEffect(() => {
    if (noReveal || revealed) return
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [noReveal, revealed])

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      data-neon-card=""
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={`
        relative overflow-hidden rounded-2xl p-5
        transition-all duration-400
        ${hoverable ? 'cursor-pointer hover:-translate-y-2 hover:scale-[1.02]' : ''}
        ${className}
      `}
      style={
        isLiquid
          ? {
              ...style,
              background: tc.bgCard,
              backdropFilter: tc.backdropFilter,
              WebkitBackdropFilter: tc.backdropFilter,
              border: `1px solid ${tc.borderDefault}`,
              borderTop: '1px solid rgba(255,255,255,0.18)',
              borderLeft: '1px solid rgba(255,255,255,0.14)',
              boxShadow: tc.shadowMd,
              transition: tc.transitionAll,
              willChange: hoverable ? 'transform, box-shadow' : 'auto',
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
              borderRadius: '20px',
            }
          : {
              ...style,
              background: tc.bgCard,
              backdropFilter: tc.backdropFilter,
              borderColor: `${effectiveColor}33`,
              border: `1px solid ${tc.borderDefault}`,
              boxShadow: tc.shadowMd,
              transition: tc.transitionAll,
              willChange: hoverable ? 'transform, box-shadow' : 'auto',
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
            }
      }
      onMouseEnter={(e) => {
        if (hoverable) {
          if (isLiquid) {
            e.currentTarget.style.background = tc.bgCardHover
            e.currentTarget.style.boxShadow = tc.shadowCardHover
          } else {
            e.currentTarget.style.borderColor = tc.borderActive
            e.currentTarget.style.boxShadow = tc.shadowCardHover
          }
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          if (isLiquid) {
            e.currentTarget.style.background = tc.bgCard
            e.currentTarget.style.boxShadow = tc.shadowMd
          } else {
            e.currentTarget.style.borderColor = tc.borderDefault
            e.currentTarget.style.boxShadow = tc.shadowMd
          }
        }
      }}
    >
      {/* Shimmer effect */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full pointer-events-none opacity-0 hover:opacity-100"
        style={{
          background: isLiquid
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          animation: 'shimmer-move 3s ease-in-out infinite',
        }}
      />
      {/* Circuit grid overlay — cyberpunk only */}
      {!isLiquid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `linear-gradient(${effectiveColor}0f 1px, transparent 1px), linear-gradient(90deg, ${effectiveColor}0f 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
})
