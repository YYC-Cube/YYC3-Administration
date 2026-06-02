/**
 * @file yyc3-theme-integration.ts
 * @description YYC³ 主题系统集成配置 — 将 @yyc3/ui 2.0.0 主题系统与 My-mgmt 现有主题融合
 */

import type { ThemeConfig } from './app-context'

// ==========================================
// YYC³ 主题预设定义
// 支持: yyc3-dark / yyc3-light / yyc3-brand / nova
// ==========================================

export type YYC3ThemePreset = 'yyc3-dark' | 'yyc3-light' | 'yyc3-brand' | 'nova'

export interface YYC3ThemeConfig {
  preset: YYC3ThemePreset
  colors: YYC3ColorTokens
  effects: YYC3EffectConfig
  typography: YYC3TypographyConfig
}

// ==========================================
// YYC³ 颜色令牌系统 (Design Tokens)
// ==========================================

export interface YYC3ColorTokens {
  // 主色调
  primary: string
  primaryForeground: string

  // 次要色
  secondary: string
  secondaryForeground: string

  // 强调色
  accent: string
  accentForeground: string

  // 背景色
  background: string
  foreground: string

  // 卡片
  card: string
  cardForeground: string

  // 边框
  border: string
  input: string

  // 状态色
  destructive: string
  destructiveForeground: string
  muted: string
  mutedForeground: string
  ring: string

  // 特殊色（YYC³ 扩展）
  neon: {
    cyan: string
    magenta: string
    yellow: string
    green: string
  }

  // 渐变色
  gradients: {
    primary: string
    secondary: string
    accent: string
    neon: string
  }
}

// ==========================================
// YYC³ 效果配置
// ==========================================

export interface YYC3EffectConfig {
  // 霓虹发光
  neonGlow: {
    enabled: boolean
    intensity: number // 0-100
    spread: number // 0-50
  }

  // 毛玻璃
  glassmorphism: {
    enabled: boolean
    blur: number // 0-30
    opacity: number // 0-1
  }

  // 动画
  animation: {
    spring: boolean
    glitch: boolean
    dataFlow: boolean
    scanline: boolean
  }

  // 阴影
  shadows: {
    neon: string
    soft: string
    hard: string
  }
}

// ==========================================
// YYC3 排版配置
// ==========================================

export interface YYC3TypographyConfig {
  fontFamily: {
    sans: string
    mono: string
    display: string
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  fontWeight: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
}

// ==========================================
// 预设主题定义
// ==========================================

export const YYC3_THEME_PRESETS: Record<YYC3ThemePreset, YYC3ThemeConfig> = {
  'yyc3-dark': {
    preset: 'yyc3-dark',
    colors: {
      primary: '#00f0ff',
      primaryForeground: '#000000',

      secondary: '#1a1a2e',
      secondaryForeground: '#e0e0e0',

      accent: '#ff00ff',
      accentForeground: '#ffffff',

      background: '#0a0a0f',
      foreground: '#e8e8f0',

      card: '#12121a',
      cardForeground: '#e8e8f0',

      border: 'rgba(0, 240, 255, 0.15)',
      input: 'rgba(0, 240, 255, 0.08)',

      destructive: '#ff0055',
      destructiveForeground: '#ffffff',

      muted: 'rgba(255, 255, 255, 0.05)',
      mutedForeground: 'rgba(255, 255, 255, 0.5)',
      ring: '#00f0ff',

      neon: {
        cyan: '#00f0ff',
        magenta: '#ff00ff',
        yellow: '#ffff00',
        green: '#00ff88',
      },

      gradients: {
        primary: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)',
        secondary: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        accent: 'linear-gradient(135deg, #ff00ff 0%, #ff0080 100%)',
        neon: 'linear-gradient(135deg, #00f0ff 0%, #ff00ff 50%, #ffff00 100%)',
      },
    },

    effects: {
      neonGlow: {
        enabled: true,
        intensity: 80,
        spread: 20,
      },
      glassmorphism: {
        enabled: true,
        blur: 16,
        opacity: 0.08,
      },
      animation: {
        spring: true,
        glitch: false,
        dataFlow: true,
        scanline: false,
      },
      shadows: {
        neon: '0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.1)',
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        hard: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      },
    },

    typography: {
      fontFamily: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
        display: "'Orbitron', sans-serif",
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },

  'yyc3-light': {
    preset: 'yyc3-light',
    colors: {
      primary: '#0066cc',
      primaryForeground: '#ffffff',

      secondary: '#f8fafc',
      secondaryForeground: '#1e293b',

      accent: '#8b5cf6',
      accentForeground: '#ffffff',

      background: '#ffffff',
      foreground: '#0f172a',

      card: '#ffffff',
      cardForeground: '#0f172a',

      border: '#e2e8f0',
      input: '#e2e8f0',

      destructive: '#ef4444',
      destructiveForeground: '#ffffff',

      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      ring: '#0066cc',

      neon: {
        cyan: '#06b6d4',
        magenta: '#a855f7',
        yellow: '#eab308',
        green: '#22c55e',
      },

      gradients: {
        primary: 'linear-gradient(135deg, #0066cc 0%, #0099ff 100%)',
        secondary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        accent: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        neon: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #eab308 100%)',
      },
    },

    effects: {
      neonGlow: {
        enabled: false,
        intensity: 0,
        spread: 0,
      },
      glassmorphism: {
        enabled: true,
        blur: 12,
        opacity: 0.7,
      },
      animation: {
        spring: true,
        glitch: false,
        dataFlow: false,
        scanline: false,
      },
      shadows: {
        neon: 'none',
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        hard: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },

    typography: {
      fontFamily: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
        display: "'Inter', sans-serif",
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },

  'yyc3-brand': {
    preset: 'yyc3-brand',
    colors: {
      primary: '#ff6b35',
      primaryForeground: '#ffffff',

      secondary: '#1a1a1a',
      secondaryForeground: '#f5f5f5',

      accent: '#f7931e',
      accentForeground: '#ffffff',

      background: '#fefefe',
      foreground: '#1a1a1a',

      card: '#ffffff',
      cardForeground: '#1a1a1a',

      border: '#e5e5e5',
      input: '#e5e5e5',

      destructive: '#dc2626',
      destructiveForeground: '#ffffff',

      muted: '#f5f5f5',
      mutedForeground: '#737373',
      ring: '#ff6b35',

      neon: {
        cyan: '#00b4d8',
        magenta: '#c77dff',
        yellow: '#ffd60a',
        green: '#80ed99',
      },

      gradients: {
        primary: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        secondary: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
        accent: 'linear-gradient(135deg, #f7931e 0%, #ffd60a 100%)',
        neon: 'linear-gradient(135deg, #00b4d8 0%, #c77dff 50%, #ffd60a 100%)',
      },
    },

    effects: {
      neonGlow: {
        enabled: true,
        intensity: 40,
        spread: 10,
      },
      glassmorphism: {
        enabled: true,
        blur: 14,
        opacity: 0.6,
      },
      animation: {
        spring: true,
        glitch: false,
        dataFlow: false,
        scanline: false,
      },
      shadows: {
        neon: '0 0 20px rgba(255, 107, 53, 0.2)',
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        hard: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
    },

    typography: {
      fontFamily: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
        display: "'Inter', sans-serif",
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },

  nova: {
    preset: 'nova',
    colors: {
      primary: '#a855f7',
      primaryForeground: '#ffffff',

      secondary: '#0f0f23',
      secondaryForeground: '#e0e0ff',

      accent: '#06b6d4',
      accentForeground: '#ffffff',

      background: '#050510',
      foreground: '#e0e0ff',

      card: '#0a0a1a',
      cardForeground: '#e0e0ff',

      border: 'rgba(168, 85, 247, 0.2)',
      input: 'rgba(168, 85, 247, 0.1)',

      destructive: '#ff0055',
      destructiveForeground: '#ffffff',

      muted: 'rgba(168, 85, 247, 0.08)',
      mutedForeground: 'rgba(224, 224, 255, 0.5)',
      ring: '#a855f7',

      neon: {
        cyan: '#06b6d4',
        magenta: '#a855f7',
        yellow: '#fbbf24',
        green: '#34d399',
      },

      gradients: {
        primary: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        secondary: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
        accent: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        neon: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #fbbf24 100%)',
      },
    },

    effects: {
      neonGlow: {
        enabled: true,
        intensity: 90,
        spread: 25,
      },
      glassmorphism: {
        enabled: true,
        blur: 20,
        opacity: 0.1,
      },
      animation: {
        spring: true,
        glitch: true,
        dataFlow: true,
        scanline: true,
      },
      shadows: {
        neon: '0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)',
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        hard: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
      },
    },

    typography: {
      fontFamily: {
        sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
        display: "'Orbitron', sans-serif",
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },
}

// ==========================================
// 主题转换工具函数
// 将 YYC³ 主题转换为 My-mgmt 现有的 ThemeConfig
// ==========================================

export function convertYyc3ToAppTheme(yyc3Theme: YYC3ThemeConfig): Partial<ThemeConfig> {
  return {
    neonIntensity: yyc3Theme.effects.neonGlow.intensity,
    scanlineEnabled: yyc3Theme.effects.animation.scanline,
    glitchEnabled: yyc3Theme.effects.animation.glitch,
    circuitGridEnabled: yyc3Theme.effects.animation.dataFlow,
    dataFlowEnabled: yyc3Theme.effects.animation.dataFlow,
    springAnimEnabled: yyc3Theme.effects.animation.spring,
    blurEnabled: yyc3Theme.effects.glassmorphism.enabled,
  }
}

export function getAppThemeForYyc3(preset: YYC3ThemePreset): Partial<ThemeConfig> {
  const yyc3Config = YYC3_THEME_PRESETS[preset]
  return convertYyc3ToAppTheme(yyc3Config)
}

// ==========================================
// CSS 变量生成器
// 用于动态注入 CSS 自定义属性
// ==========================================

export function generateYyc3CssVariables(theme: YYC3ThemeConfig): string {
  const { colors, effects, typography } = theme

  return `
    :root {
      /* YYC³ Color Tokens */
      --yyc3-primary: ${colors.primary};
      --yyc3-primary-foreground: ${colors.primaryForeground};
      --yyc3-secondary: ${colors.secondary};
      --yyc3-secondary-foreground: ${colors.secondaryForeground};
      --yyc3-accent: ${colors.accent};
      --yyc3-accent-foreground: ${colors.accentForeground};
      --yyc3-background: ${colors.background};
      --yyc3-foreground: ${colors.foreground};
      --yyc3-card: ${colors.card};
      --yyc3-card-foreground: ${colors.cardForeground};
      --yyc3-border: ${colors.border};
      --yyc3-input: ${colors.input};
      --yyc3-destructive: ${colors.destructive};
      --yyc3-destructive-foreground: ${colors.destructiveForeground};
      --yyc3-muted: ${colors.muted};
      --yyc3-muted-foreground: ${colors.mutedForeground};
      --yyc3-ring: ${colors.ring};
      
      /* Neon Colors */
      --yyc3-neon-cyan: ${colors.neon.cyan};
      --yyc3-neon-magenta: ${colors.neon.magenta};
      --yyc3-neon-yellow: ${colors.neon.yellow};
      --yyc3-neon-green: ${colors.neon.green};
      
      /* Gradients */
      --yyc3-gradient-primary: ${colors.gradients.primary};
      --yyc3-gradient-secondary: ${colors.gradients.secondary};
      --yyc3-gradient-accent: ${colors.gradients.accent};
      --yyc3-gradient-neon: ${colors.gradients.neon};
      
      /* Effects */
      --yyc3-glow-intensity: ${effects.neonGlow.intensity};
      --yyc3-glow-spread: ${effects.neonGlow.spread};
      --yyc3-blur: ${effects.glassmorphism.blur}px;
      --yyc3-glass-opacity: ${effects.glassmorphism.opacity};
      
      /* Shadows */
      --yyc3-shadow-neon: ${effects.shadows.neon};
      --yyc3-shadow-soft: ${effects.shadows.soft};
      --yyc3-shadow-hard: ${effects.shadows.hard};
      
      /* Typography */
      --yyc3-font-sans: ${typography.fontFamily.sans};
      --yyc3-font-mono: ${typography.fontFamily.mono};
      --yyc3-font-display: ${typography.fontFamily.display};
    }
  `
}

// ==========================================
// 导出默认配置
// ==========================================

export const DEFAULT_YYC3_PRESET: YYC3ThemePreset = 'yyc3-dark'

export default YYC3_THEME_PRESETS
