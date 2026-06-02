import {
  ChevronDown,
  ChevronUp,
  Droplets,
  Eye,
  EyeOff,
  Grid3X3,
  Info,
  Palette,
  RotateCcw,
  ScanLine,
  Sliders,
  Sparkles,
  Sun,
  Waves,
  Wind,
} from 'lucide-react'
import { useState } from 'react'

import { useApp } from './app-context'
import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'
import { useThemeSwitcher } from './theme-switcher-context'

import type { ThemeConfig } from './app-context'
import type { ReactNode } from 'react'

// ==========================================
// YYC³ 主题配置面板 — Theme Config Panel
// 赛博朋克风格主题定制界面
// ==========================================

interface ToggleItemProps {
  label: string
  sublabel: string
  icon: (props: { className?: string; style?: React.CSSProperties }) => ReactNode
  color: string
  enabled: boolean
  onChange: (v: boolean) => void
}

function ToggleItem({ label, sublabel, icon: Icon, color, enabled, onChange }: ToggleItemProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 group"
      style={{
        background: enabled ? `${color}08` : 'rgba(10,10,10,0.4)',
        borderColor: enabled ? `${color}25` : 'rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
          style={{
            background: enabled ? `${color}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${enabled ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
            boxShadow: enabled ? `0 0 8px ${color}25` : 'none',
          }}
        >
          <Icon className="w-4 h-4" style={{ color: enabled ? color : 'rgba(255,255,255,0.2)' }} />
        </div>
        <div>
          <p
            className="text-sm transition-colors duration-300"
            style={{ color: enabled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}
          >
            {label}
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {sublabel}
          </p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-11 h-6 rounded-full transition-all duration-400 cursor-pointer"
        style={{
          background: enabled ? `${color}30` : 'rgba(255,255,255,0.06)',
          border: `1px solid ${enabled ? `${color}50` : 'rgba(255,255,255,0.1)'}`,
          boxShadow: enabled ? `0 0 10px ${color}30` : 'none',
        }}
      >
        <div
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-400"
          style={{
            left: enabled ? 'calc(100% - 20px)' : '2px',
            width: 18,
            height: 18,
            background: enabled ? color : 'rgba(255,255,255,0.2)',
            boxShadow: enabled ? `0 0 6px ${color}` : 'none',
          }}
        />
      </button>
    </div>
  )
}

/**
 * Visual theme configuration settings page.
 * Provides sliders and toggles for neon intensity, scanlines, glitch effects,
 * circuit grid, data flow, blur, and spring animations. Includes language
 * switching, preset management, live preview, and onboarding reset.
 */
export function ThemeConfigPage() {
  const { theme, updateTheme, resetTheme, setOnboardingDone } = useApp()
  const { t, locale, setLocale } = useI18n()
  const { theme: uiTheme, toggleTheme: toggleUITheme } = useThemeSwitcher()
  const tc = useThemeColors()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const toggleItems: Array<{
    key: keyof ThemeConfig
    label: string
    sublabel: string
    icon: (props: { className?: string; style?: React.CSSProperties }) => ReactNode
    color: string
  }> = [
    {
      key: 'scanlineEnabled',
      label: '扫描线效果',
      sublabel: 'Scanline overlay animation',
      icon: ScanLine,
      color: '#00f0ff',
    },
    {
      key: 'glitchEnabled',
      label: '故障效果',
      sublabel: 'Glitch text distortion',
      icon: Sparkles,
      color: '#00d4ff',
    },
    {
      key: 'circuitGridEnabled',
      label: '电路网格',
      sublabel: 'Circuit board grid background',
      icon: Grid3X3,
      color: '#00ffcc',
    },
    {
      key: 'dataFlowEnabled',
      label: '数据流动画',
      sublabel: 'Data flow particle effects',
      icon: Waves,
      color: '#00ffc8',
    },
    {
      key: 'springAnimEnabled',
      label: '弹簧动画',
      sublabel: 'Spring transition effects',
      icon: Wind,
      color: '#008b9d',
    },
    {
      key: 'blurEnabled',
      label: '毛玻璃效果',
      sublabel: 'Backdrop blur glassmorphism',
      icon: Droplets,
      color: '#00f0ff',
    },
  ]

  const allEnabled = toggleItems.every((t) => theme[t.key] === true)
  const allDisabled = toggleItems.every((t) => theme[t.key] === false)

  return (
    <div
      className="h-full overflow-y-auto p-4 sm:p-6"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="tracking-wider flex items-center gap-3"
            style={{ color: tc.muted, textShadow: `0 0 15px ${tc.alpha(tc.muted, 0.5)}` }}
          >
            <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-base sm:text-xl">{t('theme.title')}</span>
          </h2>
          <p className="text-[10px] sm:text-xs text-white/25 mt-1 tracking-wider">
            {t('theme.subtitle')}
          </p>
        </div>
        <button
          onClick={resetTheme}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs flex items-center gap-2 transition-all duration-300"
          style={{
            background: 'rgba(0,95,115,0.08)',
            border: '1px solid rgba(0,95,115,0.3)',
            color: '#005f73',
          }}
        >
          <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {t('theme.reset')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 max-w-5xl">
        {/* UI Theme Switcher — Cyberpunk / Liquid Glass */}
        <NeonCard color={tc.primary} hoverable={false} className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  border: `1px solid ${tc.alpha(tc.primary, 0.3)}`,
                }}
              >
                <Palette className="w-5 h-5" style={{ color: tc.primary }} />
              </div>
              <div>
                <p className="text-sm text-white/80">
                  {locale === 'zh' ? 'UI 主题风格' : 'UI Theme Style'}
                </p>
                <p className="text-[10px] text-white/20">
                  {locale === 'zh'
                    ? '切换赛博朋克 / 液态玻璃视觉风格'
                    : 'Switch Cyberpunk / Liquid Glass visual style'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (uiTheme !== 'cyberpunk') toggleUITheme()
                }}
                className="px-3 py-1.5 rounded-xl text-xs transition-all duration-300 border"
                style={{
                  background:
                    uiTheme === 'cyberpunk' ? 'rgba(0,240,255,0.15)' : 'rgba(10,10,10,0.4)',
                  borderColor:
                    uiTheme === 'cyberpunk' ? 'rgba(0,240,255,0.5)' : 'rgba(255,255,255,0.06)',
                  color: uiTheme === 'cyberpunk' ? '#00f0ff' : 'rgba(255,255,255,0.35)',
                  boxShadow: uiTheme === 'cyberpunk' ? '0 0 10px rgba(0,240,255,0.15)' : 'none',
                }}
              >
                Cyberpunk
              </button>
              <button
                onClick={() => {
                  if (uiTheme !== 'liquidGlass') toggleUITheme()
                }}
                className="px-3 py-1.5 rounded-xl text-xs transition-all duration-300 border"
                style={{
                  background:
                    uiTheme === 'liquidGlass' ? 'rgba(0,255,135,0.15)' : 'rgba(10,10,10,0.4)',
                  borderColor:
                    uiTheme === 'liquidGlass' ? 'rgba(0,255,135,0.5)' : 'rgba(255,255,255,0.06)',
                  color: uiTheme === 'liquidGlass' ? '#00ff87' : 'rgba(255,255,255,0.35)',
                  boxShadow: uiTheme === 'liquidGlass' ? '0 0 10px rgba(0,255,135,0.15)' : 'none',
                }}
              >
                Liquid Glass
              </button>
            </div>
          </div>
        </NeonCard>

        {/* Language Switcher — Phase 6 i18n */}
        <NeonCard color="#008b9d" hoverable={false} className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(0,139,157,0.1)',
                  border: '1px solid rgba(0,139,157,0.3)',
                }}
              >
                <span className="text-lg">🌐</span>
              </div>
              <div>
                <p className="text-sm text-white/80">{t('theme.language')}</p>
                <p className="text-[10px] text-white/20">{t('theme.langDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLocale('zh')}
                className="px-3 py-1.5 rounded-xl text-xs transition-all duration-300 border"
                style={{
                  background: locale === 'zh' ? 'rgba(0,139,157,0.15)' : 'rgba(10,10,10,0.4)',
                  borderColor: locale === 'zh' ? 'rgba(0,139,157,0.5)' : 'rgba(255,255,255,0.06)',
                  color: locale === 'zh' ? '#008b9d' : 'rgba(255,255,255,0.35)',
                  boxShadow: locale === 'zh' ? '0 0 10px rgba(0,139,157,0.15)' : 'none',
                }}
              >
                {t('theme.chinese')}
              </button>
              <button
                onClick={() => setLocale('en')}
                className="px-3 py-1.5 rounded-xl text-xs transition-all duration-300 border"
                style={{
                  background: locale === 'en' ? 'rgba(0,139,157,0.15)' : 'rgba(10,10,10,0.4)',
                  borderColor: locale === 'en' ? 'rgba(0,139,157,0.5)' : 'rgba(255,255,255,0.06)',
                  color: locale === 'en' ? '#008b9d' : 'rgba(255,255,255,0.35)',
                  boxShadow: locale === 'en' ? '0 0 10px rgba(0,139,157,0.15)' : 'none',
                }}
              >
                {t('theme.english')}
              </button>
            </div>
          </div>
        </NeonCard>

        {/* Neon Intensity Slider */}
        <NeonCard color="#00f0ff" hoverable={false} className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `rgba(0,240,255,${theme.neonIntensity / 600})`,
                border: '1px solid rgba(0,240,255,0.3)',
                boxShadow: `0 0 ${theme.neonIntensity / 5}px rgba(0,240,255,${theme.neonIntensity / 200})`,
              }}
            >
              <Sun className="w-5 h-5" style={{ color: '#00f0ff' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-white/80">霓虹发光强度</p>
                <span
                  className="text-sm tabular-nums min-w-[48px] text-right"
                  style={{
                    color: '#00f0ff',
                    textShadow: `0 0 ${theme.neonIntensity / 10}px rgba(0,240,255,0.5)`,
                  }}
                >
                  {theme.neonIntensity}%
                </span>
              </div>
              <p className="text-[10px] text-white/20">
                Neon Glow Intensity — 调节所有霓虹元素的发光强度
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="relative px-1">
            <div
              className="relative h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
                style={{
                  width: `${theme.neonIntensity}%`,
                  background: 'linear-gradient(90deg, #00f0ff, #00d4ff)',
                  boxShadow: `0 0 8px rgba(0,240,255,${theme.neonIntensity / 200})`,
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={theme.neonIntensity}
              onChange={(e) => updateTheme({ neonIntensity: Number(e.target.value) })}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ height: 32, top: -12 }}
            />
            {/* Marks */}
            <div className="flex justify-between mt-2">
              {[0, 25, 50, 75, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => updateTheme({ neonIntensity: v })}
                  className="text-[9px] px-1.5 py-0.5 rounded transition-all duration-200 cursor-pointer"
                  style={{
                    color:
                      theme.neonIntensity >= v ? 'rgba(0,240,255,0.6)' : 'rgba(255,255,255,0.15)',
                    background: theme.neonIntensity === v ? 'rgba(0,240,255,0.1)' : 'transparent',
                  }}
                >
                  {v === 0 ? '关闭' : v === 25 ? '低' : v === 50 ? '中' : v === 75 ? '高' : '极致'}
                </button>
              ))}
            </div>
          </div>
        </NeonCard>

        {/* Effect Toggles */}
        <NeonCard color="#00d4ff" hoverable={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" style={{ color: '#00d4ff' }} />
              <h3 className="text-sm text-white/60 tracking-wider">视觉效果开关</h3>
            </div>
            <button
              onClick={() => {
                const target = allEnabled ? false : true
                const partial: Partial<ThemeConfig> = {}
                toggleItems.forEach((t) => {
                  ;(partial as any)[t.key] = target
                })
                updateTheme(partial)
              }}
              className="text-[10px] px-2 py-0.5 rounded-lg transition-all duration-200"
              style={{
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#00d4ff',
              }}
            >
              {allEnabled ? '全部关闭' : '全部开启'}
            </button>
          </div>
          <div className="space-y-2">
            {toggleItems.map((item) => (
              <ToggleItem
                key={item.key}
                label={item.label}
                sublabel={item.sublabel}
                icon={item.icon}
                color={item.color}
                enabled={theme[item.key] as boolean}
                onChange={(v) => updateTheme({ [item.key]: v })}
              />
            ))}
          </div>
        </NeonCard>

        {/* Live Preview */}
        <NeonCard color="#00ffcc" hoverable={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {showPreview ? (
                <Eye className="w-4 h-4" style={{ color: '#00ffcc' }} />
              ) : (
                <EyeOff className="w-4 h-4" style={{ color: '#00ffcc' }} />
              )}
              <h3 className="text-sm text-white/60 tracking-wider">实时预览</h3>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-[10px] px-2 py-0.5 rounded-lg transition-colors"
              style={{
                background: 'rgba(0,255,204,0.08)',
                border: '1px solid rgba(0,255,204,0.2)',
                color: '#00ffcc',
              }}
            >
              {showPreview ? '隐藏' : '显示'}
            </button>
          </div>

          {showPreview && (
            <div
              className="rounded-xl p-4 border relative overflow-hidden"
              style={{
                background: '#0a0a0a',
                borderColor: 'rgba(0,240,255,0.15)',
                minHeight: 160,
              }}
            >
              {/* Circuit grid preview */}
              {theme.circuitGridEnabled && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,240,255,${(0.04 * theme.neonIntensity) / 100}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,${(0.04 * theme.neonIntensity) / 100}) 1px, transparent 1px)`,
                    backgroundSize: '16px 16px',
                  }}
                />
              )}

              {/* Scanline preview */}
              {theme.scanlineEnabled && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
                    animation: 'scanline-move 12s linear infinite',
                  }}
                />
              )}

              {/* Content preview */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: '#00ffc8',
                      boxShadow: `0 0 ${(6 * theme.neonIntensity) / 100}px #00ffc8`,
                    }}
                  />
                  <span
                    className="text-[10px] tracking-wider"
                    style={{
                      color: '#00ffc8',
                      textShadow: `0 0 ${(8 * theme.neonIntensity) / 100}px rgba(0,255,200,0.5)`,
                    }}
                  >
                    PREVIEW ACTIVE
                  </span>
                </div>

                <div
                  className="px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: `rgba(0,240,255,${(0.3 * theme.neonIntensity) / 100})`,
                    boxShadow: `0 0 ${(10 * theme.neonIntensity) / 100}px rgba(0,240,255,${(0.2 * theme.neonIntensity) / 100})`,
                    background: theme.blurEnabled ? 'rgba(0,240,255,0.03)' : 'rgba(10,10,10,0.5)',
                    backdropFilter: theme.blurEnabled ? 'blur(10px)' : 'none',
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: `rgba(0,240,255,${0.4 + (0.5 * theme.neonIntensity) / 100})` }}
                  >
                    霓虹强度 {theme.neonIntensity}%
                  </p>
                </div>

                <div
                  className="px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: `rgba(0,212,255,${(0.3 * theme.neonIntensity) / 100})`,
                    boxShadow: `0 0 ${(10 * theme.neonIntensity) / 100}px rgba(0,212,255,${(0.2 * theme.neonIntensity) / 100})`,
                    background: 'rgba(0,212,255,0.03)',
                  }}
                >
                  <p
                    className="text-xs"
                    style={{
                      color: `rgba(0,212,255,${0.4 + (0.5 * theme.neonIntensity) / 100})`,
                      animation: theme.glitchEnabled ? 'glitch-1 3s infinite' : 'none',
                    }}
                  >
                    {theme.glitchEnabled ? 'G̸l̴i̵t̷c̸h̷ 故障效果' : '故障效果已关闭'}
                  </p>
                </div>

                {/* Data flow bar */}
                {theme.dataFlowEnabled && (
                  <div
                    className="w-full h-1 rounded-full relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent, #00f0ff, #00d4ff, transparent)',
                        animation: 'data-flow-h 2s linear infinite',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div className="mt-4">
            <p className="text-[10px] text-white/25 mb-2 uppercase tracking-wider">快速预设</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '极简', neon: 30, effects: false, color: '#00f0ff' },
                { label: '标准', neon: 80, effects: true, color: '#00d4ff' },
                { label: '极致', neon: 100, effects: true, color: '#00ffcc' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    updateTheme({
                      neonIntensity: preset.neon,
                      scanlineEnabled: preset.effects,
                      glitchEnabled: preset.effects,
                      circuitGridEnabled: preset.effects,
                      dataFlowEnabled: preset.effects,
                      springAnimEnabled: true,
                      blurEnabled: true,
                    })
                  }}
                  className="px-3 py-2 rounded-xl text-xs transition-all duration-300 border"
                  style={{
                    background: `${preset.color}08`,
                    borderColor: `${preset.color}20`,
                    color: preset.color,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </NeonCard>

        {/* Advanced / About */}
        <NeonCard color="#00ffc8" hoverable={false} className="lg:col-span-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" style={{ color: '#00ffc8' }} />
              <h3 className="text-sm text-white/60 tracking-wider">高级选项与系统信息</h3>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-white/25" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/25" />
            )}
          </button>

          {showAdvanced && (
            <div
              className="mt-4 space-y-3"
              style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
            >
              {/* Onboarding Reset */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl border"
                style={{ background: 'rgba(10,10,10,0.4)', borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div>
                  <p className="text-sm text-white/60">重置新手引导</p>
                  <p className="text-[10px] text-white/20">下次刷新时重新展示引导教程</p>
                </div>
                <button
                  onClick={() => setOnboardingDone(false)}
                  className="px-3 py-1.5 rounded-lg text-[10px] transition-all duration-200"
                  style={{
                    background: 'rgba(0,255,200,0.08)',
                    border: '1px solid rgba(0,255,200,0.2)',
                    color: '#00ffc8',
                  }}
                >
                  重置
                </button>
              </div>

              {/* Current config summary */}
              <div
                className="px-4 py-3 rounded-xl border"
                style={{ background: 'rgba(10,10,10,0.4)', borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <p className="text-[10px] text-white/25 mb-2 uppercase tracking-wider">
                  当前配置摘要
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="text-[10px]">
                    <span className="text-white/20">霓虹强度: </span>
                    <span className="text-[#00f0ff]">{theme.neonIntensity}%</span>
                  </div>
                  {toggleItems.map((item) => (
                    <div key={item.key} className="text-[10px]">
                      <span className="text-white/20">{item.label}: </span>
                      <span style={{ color: theme[item.key] ? '#00ffc8' : '#005f73' }}>
                        {theme[item.key] ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version Info */}
              <div
                className="px-4 py-3 rounded-xl border"
                style={{ background: 'rgba(10,10,10,0.4)', borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">{t('theme.sysName')}</p>
                    <p className="text-[10px] text-white/20">{t('brand.tagline')}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      background: 'rgba(0,240,255,0.08)',
                      border: '1px solid rgba(0,240,255,0.2)',
                      color: '#00f0ff',
                    }}
                  >
                    {t('brand.version')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </NeonCard>
      </div>
    </div>
  )
}
