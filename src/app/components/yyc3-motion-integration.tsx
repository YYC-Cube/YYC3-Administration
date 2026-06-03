/**
 * @file yyc3-motion-integration.ts
 * @description YYC³ 动效系统集成 — 将 @yyc3/motion 1.0.0 集成到 My-mgmt 项目
 *
 * 功能：
 * - 弹簧物理动画系统
 * - 故障艺术效果（Glitch）
 * - 数据流动画
 * - 扫描线效果
 * - 霓虹发光动画
 */

import { useCallback, useEffect, useState } from 'react'

// ==========================================
// 动画配置类型定义
// ==========================================

export interface MotionConfig {
  spring: SpringConfig
  glitch: GlitchConfig
  dataFlow: DataFlowConfig
  scanline: ScanlineConfig
  neonGlow: NeonGlowConfig
}

export interface SpringConfig {
  enabled: boolean
  stiffness: number // 弹性系数 (50-500)
  damping: number // 阻尼系数 (5-50)
  mass: number // 质量 (0.5-10)
  precision: number // 精度 (0.01-0.1)
}

export interface GlitchConfig {
  enabled: boolean
  intensity: 'low' | 'medium' | 'high' | 'extreme'
  frequency: number // 触发频率 (秒)
  duration: number // 持续时间 (毫秒)
  types: ('split' | 'rgb-shift' | 'noise' | 'corruption')[]
}

export interface DataFlowConfig {
  enabled: boolean
  speed: 'slow' | 'normal' | 'fast'
  density: 'sparse' | 'normal' | 'dense'
  color: string
  direction: 'horizontal' | 'vertical' | 'both'
  particleCount: number
}

export interface ScanlineConfig {
  enabled: boolean
  opacity: number // 透明度 (0-1)
  speed: number // 移动速度 (秒)
  gap: number // 线间距 (像素)
  thickness: number // 线粗细 (像素)
}

export interface NeonGlowConfig {
  enabled: boolean
  intensity: number // 强度 (0-100)
  pulseSpeed: number // 脉冲速度 (秒)
  spread: number // 扩散半径 (像素)
  color: string
}

// ==========================================
// 默认配置
// ==========================================

export const DEFAULT_MOTION_CONFIG: MotionConfig = {
  spring: {
    enabled: true,
    stiffness: 300,
    damping: 20,
    mass: 1,
    precision: 0.01,
  },
  glitch: {
    enabled: false,
    intensity: 'medium',
    frequency: 8,
    duration: 200,
    types: ['split', 'rgb-shift'],
  },
  dataFlow: {
    enabled: true,
    speed: 'normal',
    density: 'normal',
    color: '#00f0ff',
    direction: 'horizontal',
    particleCount: 30,
  },
  scanline: {
    enabled: false,
    opacity: 0.06,
    speed: 12,
    gap: 4,
    thickness: 2,
  },
  neonGlow: {
    enabled: true,
    intensity: 80,
    pulseSpeed: 2,
    spread: 20,
    color: '#00f0ff',
  },
}

// ==========================================
// 动画 Hook: useSpringAnimation
// ==========================================

export function useSpringAnimation(initialValue: number = 0) {
  const [currentValue, setCurrentValue] = useState(initialValue)
  const [targetValue, setTargetValue] = useState(initialValue)
  const [velocity, setVelocity] = useState(0)

  useEffect(() => {
    if (!DEFAULT_MOTION_CONFIG.spring.enabled) {
      setCurrentValue(targetValue)
      return
    }

    let animationFrameId: number
    let lastTime = performance.now()

    const { stiffness, damping, mass, precision } = DEFAULT_MOTION_CONFIG.spring

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      if (deltaTime > 0.1) {
        // 防止大时间跳跃
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const displacement = targetValue - currentValue
      const springForce = displacement * stiffness
      const dampingForce = velocity * damping

      const acceleration = (springForce - dampingForce) / mass

      const newVelocity = velocity + acceleration * deltaTime
      const newValue = currentValue + newVelocity * deltaTime

      setVelocity(newVelocity)
      setCurrentValue(newValue)

      if (Math.abs(displacement) > precision || Math.abs(newVelocity) > precision) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue])

  const animateTo = useCallback((value: number) => {
    setTargetValue(value)
  }, [])

  return { value: currentValue, animateTo }
}

// ==========================================
// 动画 Hook: useGlitchEffect
// ==========================================

export function useGlitchEffect() {
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchStyle, setGlitchStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!DEFAULT_MOTION_CONFIG.glitch.enabled) return

    const { frequency, duration, types, intensity } = DEFAULT_MOTION_CONFIG.glitch

    const triggerGlitch = () => {
      setIsGlitching(true)

      const style: React.CSSProperties = {}

      if (types.includes('split')) {
        style.textShadow = `
          ${intensity === 'extreme' ? 4 : intensity === 'high' ? 3 : 2}px 0 #ff0000,
          ${-(intensity === 'extreme' ? 4 : intensity === 'high' ? 3 : 2)}px 0 #00ffff
        `
      }

      if (types.includes('rgb-shift')) {
        style.filter = `drop-shadow(${intensity === 'extreme' ? 3 : 2}px 0 red) drop-shadow(-${intensity === 'extreme' ? 3 : 2}px 0 cyan)`
      }

      if (types.includes('noise')) {
        style.opacity = `${0.9 + Math.random() * 0.1}`
      }

      setGlitchStyle(style)

      setTimeout(() => {
        setIsGlitching(false)
        setGlitchStyle({})
      }, duration)
    }

    const interval = setInterval(triggerGlitch, frequency * 1000)

    return () => clearInterval(interval)
  }, [])

  return { isGlitching, glitchStyle }
}

// ==========================================
// 动画组件: DataFlowBackground
// ==========================================

interface DataFlowBackgroundProps {
  className?: string
  config?: Partial<DataFlowConfig>
}

export function DataFlowBackground({ className = '', config = {} }: DataFlowBackgroundProps) {
  const finalConfig = { ...DEFAULT_MOTION_CONFIG.dataFlow, ...config }

  if (!finalConfig.enabled) return null

  const particles = Array.from({ length: finalConfig.particleCount }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: finalConfig.direction === 'vertical' ? `${Math.random() * 100}%` : '50%',
    delay: `${Math.random() * 5}s`,
    size: finalConfig.density === 'dense' ? 3 : finalConfig.density === 'normal' ? 2 : 1,
    duration: finalConfig.speed === 'fast' ? '2s' : finalConfig.speed === 'slow' ? '6s' : '4s',
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <style>{`
        @keyframes data-flow-h {
          0% { transform: translateX(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        
        @keyframes data-flow-v {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            background: finalConfig.color,
            boxShadow: `0 0 ${particle.size * 2}px ${finalConfig.color}`,
            animation: `data-flow-${finalConfig.direction === 'vertical' ? 'v' : 'h'} ${particle.duration} linear infinite`,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  )
}

// ==========================================
// 动画组件: ScanlineOverlay
// ==========================================

interface ScanlineOverlayProps {
  className?: string
  config?: Partial<ScanlineConfig>
}

export function ScanlineOverlay({ className = '', config = {} }: ScanlineOverlayProps) {
  const finalConfig = { ...DEFAULT_MOTION_CONFIG.scanline, ...config }

  if (!finalConfig.enabled) return null

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${finalConfig.gap}px,
          rgba(0, 0, 0, ${finalConfig.opacity}) ${finalConfig.gap}px,
          rgba(0, 0, 0, ${finalConfig.opacity}) ${finalConfig.gap + finalConfig.thickness}px
        )`,
        animation: `scanline-move ${finalConfig.speed}s linear infinite`,
      }}
    >
      <style>{`
        @keyframes scanline-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(${finalConfig.gap + finalConfig.thickness}px); }
        }
      `}</style>
    </div>
  )
}

// ==========================================
// 动画组件: NeonGlowWrapper
// ==========================================

interface NeonGlowWrapperProps {
  children: React.ReactNode
  className?: string
  config?: Partial<NeonGlowConfig>
}

export function NeonGlowWrapper({ children, className = '', config = {} }: NeonGlowWrapperProps) {
  const finalConfig = { ...DEFAULT_MOTION_CONFIG.neonGlow, ...config }

  if (!finalConfig.enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      className={`relative ${className}`}
      style={{
        animation: `neon-pulse ${finalConfig.pulseSpeed}s ease-in-out infinite`,
      }}
    >
      <style>{`
        @keyframes neon-pulse {
          0%, 100% { 
            box-shadow: 0 0 ${finalConfig.spread}px ${finalConfig.color}${Math.round(
              finalConfig.intensity * 0.25,
            )
              .toString(16)
              .padStart(2, '0')},
                        0 0 ${finalConfig.spread * 2}px ${finalConfig.color}${Math.round(
                          finalConfig.intensity * 0.15,
                        )
                          .toString(16)
                          .padStart(2, '0')};
          }
          50% { 
            box-shadow: 0 0 ${finalConfig.spread * 1.5}px ${finalConfig.color}${Math.round(
              finalConfig.intensity * 0.35,
            )
              .toString(16)
              .padStart(2, '0')},
                        0 0 ${finalConfig.spread * 3}px ${finalConfig.color}${Math.round(
                          finalConfig.intensity * 0.2,
                        )
                          .toString(16)
                          .padStart(2, '0')};
          }
        }
      `}</style>
      {children}
    </div>
  )
}

// ==========================================
// 组合动画容器
// ==========================================

interface MotionContainerProps {
  children: React.ReactNode
  className?: string
  enableSpring?: boolean
  enableGlitch?: boolean
  enableDataFlow?: boolean
  enableScanline?: boolean
  enableNeonGlow?: boolean
  motionConfig?: Partial<MotionConfig>
}

export function MotionContainer({
  children,
  className = '',
  enableSpring = true,
  enableGlitch = false,
  enableDataFlow = true,
  enableScanline = false,
  enableNeonGlow = true,
  motionConfig,
}: MotionContainerProps) {
  const config = motionConfig
    ? { ...DEFAULT_MOTION_CONFIG, ...motionConfig }
    : DEFAULT_MOTION_CONFIG

  const { isGlitching, glitchStyle } = useGlitchEffect()
  const { value: scale, animateTo } = useSpringAnimation(1)

  useEffect(() => {
    if (enableSpring) {
      animateTo(1.02)
      setTimeout(() => animateTo(1), 300)
    }
  }, [enableSpring, animateTo])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...(isGlitching && enableGlitch ? glitchStyle : {}),
        transform: enableSpring ? `scale(${scale})` : undefined,
      }}
    >
      {/* 背景层 */}
      {enableDataFlow && <DataFlowBackground config={config.dataFlow} />}
      {enableScanline && <ScanlineOverlay config={config.scanline} />}

      {/* 内容层 */}
      <NeonGlowWrapper config={enableNeonGlow ? config.neonGlow : { enabled: false }}>
        {children}
      </NeonGlowWrapper>
    </div>
  )
}

// ==========================================
// 导出所有模块
// ==========================================

export default {
  DEFAULT_MOTION_CONFIG,
  useSpringAnimation,
  useGlitchEffect,
  DataFlowBackground,
  ScanlineOverlay,
  NeonGlowWrapper,
  MotionContainer,
}
