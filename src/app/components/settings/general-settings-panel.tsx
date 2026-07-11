/**
 * @file components/settings/general-settings-panel.tsx
 * @description General Settings Panel - Theme, Language, Editor Configuration
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,general,theme,language
 */

import { Check, ChevronDown, Code, Globe, Palette, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useThemeColors } from '../hooks/use-theme-colors'
import { useI18n } from '../i18n-context'
import { useThemeSwitcher } from '../theme-switcher-context'

import type { LucideIcon } from 'lucide-react'

import { useSettingsStore } from '@/stores/useSettingsStore'

export function GeneralSettingsPanel() {
  const tc = useThemeColors()
  const { theme, setTheme } = useThemeSwitcher()
  const { locale: language, setLocale: setLanguage } = useI18n()
  const { settings, updateGeneralSettings } = useSettingsStore()
  const { general } = settings

  return (
    <div className="space-y-8">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          通用设置
        </h2>
        <p style={{ color: tc.textSecondary }}>配置主题、语言、编辑器等基础选项</p>
      </div>

      {/* 主题设置 */}
      <SettingsSection icon={Palette} title="主题" description="选择界面主题风格" tc={tc}>
        <div className="grid grid-cols-2 gap-4">
          <ThemeOption
            name="Cyberpunk"
            description="赛博朋克风格"
            active={theme === 'cyberpunk'}
            onClick={() => setTheme('cyberpunk')}
            tc={tc}
            preview={
              <div
                className="w-full h-20 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #00f0ff, #00d4ff)',
                }}
              />
            }
          />
          <ThemeOption
            name="Liquid Glass"
            description="液态玻璃风格"
            active={theme === 'liquidGlass'}
            onClick={() => setTheme('liquidGlass')}
            tc={tc}
            preview={
              <div
                className="w-full h-20 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #00ff87, #06b6d4)',
                }}
              />
            }
          />
        </div>
      </SettingsSection>

      {/* 语言设置 */}
      <SettingsSection
        icon={Globe}
        title="语言"
        description="选择系统显示语言（支持 10 种语言）"
        tc={tc}
      >
        <LanguageSelectorWithFlag
          value={language}
          onChange={(code) => {
            setLanguage(code as 'zh' | 'en')
            toast.success('语言已切换', { duration: 2000 })
          }}
          tc={tc}
        />
      </SettingsSection>

      {/* 编辑器设置 */}
      <SettingsSection icon={Code} title="编辑器" description="配置代码编辑器选项" tc={tc}>
        <div className="space-y-4">
          {/* 字体 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tc.textSecondary }}>
              字体
            </label>
            <input
              type="text"
              value={general.editorFont}
              onChange={(e) => updateGeneralSettings({ editorFont: e.target.value })}
              className="w-full px-4 py-3 rounded-lg outline-none"
              style={{
                background: tc.bgInput,
                color: tc.textPrimary,
                border: `1px solid ${tc.borderDefault}`,
              }}
            />
          </div>

          {/* 字体大小 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: tc.textSecondary }}>
              字体大小: {general.editorFontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={general.editorFontSize}
              onChange={(e) => updateGeneralSettings({ editorFontSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 自动换行 */}
          <ToggleOption
            label="自动换行"
            checked={general.wordWrap}
            onChange={(checked) => updateGeneralSettings({ wordWrap: checked })}
            tc={tc}
          />
        </div>
      </SettingsSection>

      {/* 动画和音效 */}
      <SettingsSection icon={Zap} title="动画和音效" description="控制界面动画和声音效果" tc={tc}>
        <div className="space-y-4">
          <ToggleOption
            label="启用动画效果"
            checked={general.enableAnimations}
            onChange={(checked) => updateGeneralSettings({ enableAnimations: checked })}
            tc={tc}
          />
          <ToggleOption
            label="启用音效"
            checked={general.enableSounds}
            onChange={(checked) => updateGeneralSettings({ enableSounds: checked })}
            tc={tc}
          />
        </div>
      </SettingsSection>
    </div>
  )
}

// 设置区块组件
interface SettingsSectionProps {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
  tc: ReturnType<typeof useThemeColors>
}

function SettingsSection({ icon: Icon, title, description, children, tc }: SettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl"
      style={{
        background: tc.bgElevated,
        border: `1px solid ${tc.borderSubtle}`,
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="p-2 rounded-lg"
          style={{
            background: tc.alpha(tc.primary, 0.1),
            color: tc.primary,
          }}
        >
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1" style={{ color: tc.textPrimary }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

// ── Language Selector with Flag Icons ──

const LANGUAGES = [
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
  { code: 'en-US', label: 'English', flag: '🇬🇧' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
]

function LanguageSelectorWithFlag({
  value,
  onChange,
  tc,
}: {
  value: string
  onChange: (code: string) => void
  tc: ReturnType<typeof useThemeColors>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg outline-none transition-all"
        style={{
          background: tc.bgInput,
          color: tc.textPrimary,
          border: `1px solid ${tc.borderDefault}`,
        }}
      >
        <span className="text-xl leading-none">{selected.flag}</span>
        <span className="flex-1 text-left text-sm font-medium">{selected.label}</span>
        <ChevronDown
          size={16}
          className="transition-transform duration-200"
          style={{
            color: tc.textMuted,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
          style={{
            background: tc.bgElevated,
            border: `1px solid ${tc.borderDefault}`,
            boxShadow: tc.shadowLg,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === value
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                style={{
                  background: active ? tc.alpha(tc.primary, 0.1) : 'transparent',
                  color: active ? tc.primary : tc.textPrimary,
                  borderBottom: `1px solid ${tc.borderSubtle}`,
                }}
              >
                <span className="text-xl leading-none">{lang.flag}</span>
                <span className="flex-1 text-sm font-medium">{lang.label}</span>
                {active && <Check size={16} style={{ color: tc.primary }} />}
              </button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

// 主题选项组件
interface ThemeOptionProps {
  name: string
  description: string
  active: boolean
  onClick: () => void
  preview: React.ReactNode
  tc: ReturnType<typeof useThemeColors>
}

function ThemeOption({ name, description, active, onClick, preview, tc }: ThemeOptionProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-lg transition-all hover:scale-105"
      style={{
        background: active ? tc.alpha(tc.primary, 0.1) : tc.bgInput,
        border: active ? `2px solid ${tc.primary}` : `1px solid ${tc.borderDefault}`,
        boxShadow: active ? tc.neonGlow(tc.primary, 0.3) : 'none',
      }}
    >
      {preview}
      <div className="mt-3">
        <div className="font-medium" style={{ color: tc.textPrimary }}>
          {name}
        </div>
        <div className="text-xs mt-1" style={{ color: tc.textSecondary }}>
          {description}
        </div>
      </div>
    </button>
  )
}

// 开关选项组件
interface ToggleOptionProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  tc: ReturnType<typeof useThemeColors>
}

function ToggleOption({ label, checked, onChange, tc }: ToggleOptionProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span style={{ color: tc.textPrimary }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-all"
        style={{
          background: checked ? tc.primary : tc.bgInput,
          border: `1px solid ${checked ? tc.primary : tc.borderDefault}`,
        }}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full"
          style={{
            background: checked ? tc.textInverse : tc.textMuted,
          }}
          animate={{
            left: checked ? '26px' : '4px',
          }}
          transition={{ duration: 0.2 }}
        />
      </button>
    </label>
  )
}
