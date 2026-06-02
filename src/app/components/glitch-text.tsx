import { type CSSProperties, memo, useCallback, useEffect, useRef, useState } from 'react'

import { useApp } from './app-context'

// ==========================================
// YYC³ Glitch 文字动效组件 — Phase 5
// 支持随机触发 / hover 加强 / theme 控制
// 赛博朋克标志性视觉效果
// ==========================================

interface GlitchTextProps {
  children: string
  /** Primary neon color */
  color?: string
  /** Additional CSS class */
  className?: string
  /** Inline style overrides */
  style?: CSSProperties
  /** Whether to display as inline */
  inline?: boolean
  /** Random glitch interval range [min, max] in ms. Set null to disable periodic glitch */
  interval?: [number, number] | null
  /** Intensity multiplier (0-2, default 1) */
  intensity?: number
  /** HTML tag to use */
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p'
}

/**
 * Text component with animated cyberpunk glitch distortion effect.
 * Intensity can be controlled and the effect respects `prefers-reduced-motion`.
 */
export const GlitchText = memo(function GlitchText({
  children,
  color = '#00f0ff',
  className = '',
  style,
  inline = true,
  interval = [3000, 8000],
  intensity = 1,
  as: Tag = 'span',
}: GlitchTextProps) {
  const { theme } = useApp()
  const [isGlitching, setIsGlitching] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Random periodic glitch trigger
  useEffect(() => {
    if (!theme.glitchEnabled || !interval) return

    const scheduleGlitch = () => {
      const [min, max] = interval
      const delay = min + Math.random() * (max - min)
      timerRef.current = setTimeout(() => {
        setIsGlitching(true)
        // Glitch lasts 150-400ms
        setTimeout(
          () => {
            setIsGlitching(false)
            scheduleGlitch()
          },
          150 + Math.random() * 250,
        )
      }, delay)
    }

    scheduleGlitch()
    return () => clearTimeout(timerRef.current)
  }, [theme.glitchEnabled, interval])

  const handleMouseEnter = useCallback(() => {
    if (theme.glitchEnabled) setIsHovering(true)
  }, [theme.glitchEnabled])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
  }, [])

  const active = theme.glitchEnabled && (isGlitching || isHovering)
  const hoverActive = theme.glitchEnabled && isHovering
  const px = Math.round(3 * intensity)

  return (
    <Tag
      className={`${inline ? 'inline-block' : 'block'} relative ${className}`}
      style={{
        ...style,
        color,
        willChange: active ? 'transform, clip-path' : 'auto',
        animation: active ? `glitch-skew ${hoverActive ? '0.3s' : '0.5s'} ease-in-out` : undefined,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={children}
    >
      {/* Main text */}
      <span
        className="relative z-10"
        style={{
          animation: active
            ? `glitch-color-shift ${hoverActive ? '0.15s' : '0.3s'} ease-in-out`
            : undefined,
        }}
      >
        {children}
      </span>

      {/* Cyan offset layer */}
      {active && (
        <span
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            color: '#00d4ff',
            opacity: 0.7 * intensity,
            animation: hoverActive
              ? `glitch-text-hover 0.4s steps(2, start) infinite`
              : `glitch-text-1 0.4s steps(2, start)`,
            textShadow: `${px}px 0 #00d4ff`,
          }}
          aria-hidden="true"
        >
          {children}
        </span>
      )}

      {/* Magenta offset layer */}
      {active && (
        <span
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            color: '#00d4ff',
            opacity: 0.5 * intensity,
            animation: hoverActive
              ? `glitch-text-hover 0.35s steps(2, start) 0.05s infinite`
              : `glitch-text-2 0.35s steps(2, start)`,
            textShadow: `${-px}px 0 #00d4ff`,
          }}
          aria-hidden="true"
        >
          {children}
        </span>
      )}
    </Tag>
  )
})
