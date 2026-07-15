/**
 * @file components/settings-page-standalone.tsx
 * @description YYC³ Settings Page — Theme, Language (with flag icons), Editor config,
 *   toast-based operation feedback, and full scroll support.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-17
 * @updated 2026-07-11
 * @status stable
 * @tags settings,ui,language,i18n
 */

import {
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Download,
  FileCode,
  FolderTree,
  Globe,
  MessageSquare,
  Palette,
  Plug,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Upload,
  User,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useThemeColors } from './hooks/use-theme-colors'
import { type Locale, useI18n } from './i18n-context'
import { useThemeSwitcher } from './theme-switcher-context'

import type { LucideIcon } from 'lucide-react'

// ==========================================
// Language Definitions with Flag Icons
// ==========================================

interface LangOption {
  code: string // UI locale code (e.g. 'zh', 'en', 'ja')
  label: string // Native display name
  englishLabel: string
  flag: string // Emoji flag
  dir?: 'ltr' | 'rtl'
}

const LANGUAGES: LangOption[] = [
  { code: 'zh', label: '简体中文', englishLabel: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'en', label: 'English', englishLabel: 'English', flag: '��' },
  { code: 'ja', label: '日本語', englishLabel: 'Japanese', flag: '��' },
  { code: 'zh-TW', label: '繁體中文', englishLabel: 'Chinese (Traditional)', flag: '��' },
  { code: 'ko', label: '한국어', englishLabel: 'Korean', flag: '🇰🇷' },
  { code: 'fr', label: 'Français', englishLabel: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', englishLabel: 'German', flag: '🇩🇪' },
  { code: 'es', label: 'Español', englishLabel: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', englishLabel: 'Arabic', flag: '🇸🇦', dir: 'rtl' },
  { code: 'pt-BR', label: 'Português (BR)', englishLabel: 'Portuguese (Brazil)', flag: '🇧🇷' },
]

// ==========================================
// Custom Language Selector with Flags
// ==========================================

function LanguageSelector({
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

  const selected = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[2]

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
        <span className="text-xs" style={{ color: tc.textMuted }}>
          {selected.englishLabel}
        </span>
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
                <span className="text-xs" style={{ color: tc.textMuted }}>
                  {lang.englishLabel}
                </span>
                {active && <Check size={16} style={{ color: tc.primary }} />}
              </button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

// ==========================================
// Settings Page
// ==========================================

interface SettingsCategory {
  id: string
  label: string
  icon: LucideIcon
  description: string
}

export function SettingsPage() {
  const tc = useThemeColors()
  const { theme, setTheme } = useThemeSwitcher()
  const { locale: language, setLocale: setLanguage, t } = useI18n()
  const [activeCategory, setActiveCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [importingLoading, setImportingLoading] = useState(false)

  const SETTINGS_CATEGORIES: SettingsCategory[] = [
    {
      id: 'account',
      label: t('stg.cat.account'),
      icon: User,
      description: t('stg.cat.accountDesc'),
    },
    {
      id: 'general',
      label: t('stg.cat.general'),
      icon: SettingsIcon,
      description: t('stg.cat.generalDesc'),
    },
    { id: 'agents', label: t('stg.cat.agents'), icon: Bot, description: t('stg.cat.agentsDesc') },
    { id: 'mcp', label: t('stg.cat.mcp'), icon: Plug, description: t('stg.cat.mcpDesc') },
    { id: 'models', label: t('stg.cat.models'), icon: Cpu, description: t('stg.cat.modelsDesc') },
    {
      id: 'context',
      label: t('stg.cat.context'),
      icon: FolderTree,
      description: t('stg.cat.contextDesc'),
    },
    {
      id: 'conversation',
      label: t('stg.cat.conversation'),
      icon: MessageSquare,
      description: t('stg.cat.conversationDesc'),
    },
    { id: 'rules', label: t('stg.cat.rules'), icon: FileCode, description: t('stg.cat.rulesDesc') },
    { id: 'skills', label: t('stg.cat.skills'), icon: Zap, description: t('stg.cat.skillsDesc') },
    {
      id: 'import-export',
      label: t('stg.cat.importExport'),
      icon: Download,
      description: t('stg.cat.importExportDesc'),
    },
  ]

  // ── Import/Export/Reset with toast feedback ──

  const handleExport = useCallback(() => {
    try {
      const config = {
        theme,
        language,
        exportTime: new Date().toISOString(),
        version: '2.0.0',
      }
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `yyc3-settings-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('stg.exportSuccess'), {
        description: `${t('stg.exportSuccess')}: ${a.download}`,
        duration: 3000,
      })
    } catch {
      toast.error(t('stg.exportFailed'), { description: t('stg.exportFailedDesc') })
    }
  }, [theme, language])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setImportingLoading(true)
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string)
          if (config.theme) setTheme(config.theme)
          if (config.language) setLanguage(config.language)
          toast.success(t('stg.importSuccessToast'), {
            description: t('stg.importApplied'),
            duration: 3000,
          })
        } catch {
          toast.error(t('stg.importFailed'), { description: t('stg.importFailedDesc') })
        } finally {
          setImportingLoading(false)
        }
      }
      reader.onerror = () => {
        toast.error(t('stg.readFailed'), { description: t('stg.readFailedDesc') })
        setImportingLoading(false)
      }
      reader.readAsText(file)
    }
    input.click()
  }, [setTheme, setLanguage])

  const handleReset = useCallback(() => {
    toast(t('stg.resetConfirmToast'), {
      duration: 8000,
      action: {
        label: t('stg.confirmReset'),
        onClick: () => {
          setTheme('cyberpunk')
          setLanguage('zh')
          toast.success(t('stg.resetDoneToast'), { description: t('stg.resetDefaultDesc') })
        },
      },
      cancel: {
        label: t('stg.cancel'),
        onClick: () => toast(t('stg.cancelled')),
      },
    })
  }, [setTheme, setLanguage])

  // ── General Settings Panel ──

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          {t('stg.generalSettings')}
        </h2>
        <p style={{ color: tc.textSecondary }}>{t('stg.generalSettingsDesc')}</p>
      </div>

      {/* ── Theme Selector ── */}
      <SettingsCard icon={Palette} title={t('stg.theme')} description={t('stg.themeDesc')} tc={tc}>
        <div className="grid grid-cols-2 gap-4">
          <ThemeOption
            name="Cyberpunk"
            description={t('stg.cyberpunkDesc')}
            active={theme === 'cyberpunk'}
            onClick={() => {
              setTheme('cyberpunk')
              toast.success(t('stg.themeSwitched'), {
                description: `Cyberpunk ${t('stg.cyberpunkDesc')}`,
              })
            }}
            tc={tc}
            gradient="linear-gradient(135deg, #00f0ff, #00d4ff)"
          />
          <ThemeOption
            name="Liquid Glass"
            description={t('stg.liquidGlassDesc')}
            active={theme === 'liquidGlass'}
            onClick={() => {
              setTheme('liquidGlass')
              toast.success(t('stg.themeSwitched'), {
                description: `Liquid Glass ${t('stg.liquidGlassDesc')}`,
              })
            }}
            tc={tc}
            gradient="linear-gradient(135deg, #00ff87, #06b6d4)"
          />
        </div>
      </SettingsCard>

      {/* ── Language Selector with Flags ── */}
      <SettingsCard
        icon={Globe}
        title={t('stg.language')}
        description={t('stg.languageDesc')}
        tc={tc}
      >
        <LanguageSelector
          value={language}
          onChange={(code) => {
            setLanguage(code as Locale)
            const lang = LANGUAGES.find((l) => l.code === code)
            toast.success(t('stg.languageSwitched'), {
              description: lang ? `${lang.flag} ${lang.label}` : code,
              duration: 2000,
            })
          }}
          tc={tc}
        />
      </SettingsCard>

      {/* ── Tip ── */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: tc.alpha(tc.accent, 0.1),
          border: `1px solid ${tc.alpha(tc.accent, 0.3)}`,
        }}
      >
        <p style={{ color: tc.accent }}>{t('stg.comingSoon')}</p>
      </div>
    </div>
  )

  // ── Placeholder Panel ──

  const renderPlaceholderPanel = (categoryId: string) => {
    const category = SETTINGS_CATEGORIES.find((c) => c.id === categoryId)
    if (!category) return null
    const Icon = category.icon

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
            {category.label}
          </h2>
          <p style={{ color: tc.textSecondary }}>{category.description}</p>
        </div>
        <div
          className="flex flex-col items-center justify-center p-16 rounded-xl"
          style={{
            background: tc.bgElevated,
            border: `1px solid ${tc.borderSubtle}`,
          }}
        >
          <div className="p-4 rounded-full mb-4" style={{ background: tc.alpha(tc.primary, 0.08) }}>
            <Icon size={40} style={{ color: tc.textMuted }} />
          </div>
          <p className="text-base font-medium mb-1" style={{ color: tc.textSecondary }}>
            {category.label}
          </p>
          <p className="text-sm" style={{ color: tc.textMuted }}>
            {t('stg.fullFeatureSoon')}
          </p>
        </div>
      </div>
    )
  }

  const renderCurrentPanel = () =>
    activeCategory === 'general' ? renderGeneralSettings() : renderPlaceholderPanel(activeCategory)

  // ── Main Layout ──

  return (
    <div
      className="min-h-full p-6 lg:p-8"
      style={{
        background: tc.bgBase,
        color: tc.textPrimary,
      }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
          {t('stg.systemSettings')}
        </h1>
        <p className="text-sm" style={{ color: tc.textSecondary }}>
          {t('stg.pageDesc')}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            background: tc.bgCard,
            border: `1px solid ${tc.borderDefault}`,
            backdropFilter: tc.backdropFilter,
          }}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={20}
            style={{ color: tc.textMuted }}
          />
          <input
            type="text"
            placeholder={t('stg.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-12 pr-4 bg-transparent outline-none"
            style={{ color: tc.textPrimary }}
          />
        </div>
      </motion.div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <div
            className="rounded-xl p-4 lg:sticky lg:top-4"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderDefault}`,
              backdropFilter: tc.backdropFilter,
            }}
          >
            <nav className="space-y-1">
              {SETTINGS_CATEGORIES.map((category) => {
                const Icon = category.icon
                const isActive = activeCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all"
                    style={{
                      background: isActive ? tc.alpha(tc.primary, 0.1) : 'transparent',
                      color: isActive ? tc.primary : tc.textSecondary,
                      border: isActive
                        ? `1px solid ${tc.alpha(tc.primary, 0.3)}`
                        : '1px solid transparent',
                      boxShadow: isActive ? tc.neonGlow(tc.primary, 0.3) : 'none',
                    }}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-sm font-medium">{category.label}</span>
                    {isActive && <ChevronRight size={16} />}
                  </button>
                )
              })}
            </nav>

            {/* Quick Actions */}
            <div
              className="mt-6 pt-6 space-y-2"
              style={{ borderTop: `1px solid ${tc.borderSubtle}` }}
            >
              <button
                onClick={handleExport}
                disabled={importingLoading}
                className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: tc.alpha(tc.secondary, 0.1),
                  color: tc.secondary,
                  border: `1px solid ${tc.alpha(tc.secondary, 0.3)}`,
                }}
              >
                <Download size={16} />
                {t('stg.exportConfig')}
              </button>
              <button
                onClick={handleImport}
                disabled={importingLoading}
                className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: importingLoading
                    ? tc.alpha(tc.textMuted, 0.1)
                    : tc.alpha(tc.accent, 0.1),
                  color: importingLoading ? tc.textMuted : tc.accent,
                  border: `1px solid ${tc.alpha(importingLoading ? tc.textMuted : tc.accent, 0.3)}`,
                  cursor: importingLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <Upload size={16} />
                {importingLoading ? t('stg.importing') : t('stg.importConfig')}
              </button>
              <button
                onClick={handleReset}
                className="w-full px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: tc.alpha(tc.danger, 0.1),
                  color: tc.danger,
                  border: `1px solid ${tc.alpha(tc.danger, 0.3)}`,
                }}
              >
                <RotateCcw size={16} />
                {t('stg.resetSettings')}
              </button>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-9"
        >
          <div
            className="rounded-xl p-6 lg:p-8"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderDefault}`,
              backdropFilter: tc.backdropFilter,
              minHeight: '500px',
            }}
          >
            {renderCurrentPanel()}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ==========================================
// Sub-components
// ==========================================

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
  tc,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: React.ReactNode
  tc: ReturnType<typeof useThemeColors>
}) {
  return (
    <div
      className="p-6 rounded-xl"
      style={{
        background: tc.bgElevated,
        border: `1px solid ${tc.borderSubtle}`,
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ background: tc.alpha(tc.primary, 0.1), color: tc.primary }}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold mb-1" style={{ color: tc.textPrimary }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ThemeOption({
  name,
  description,
  active,
  onClick,
  tc,
  gradient,
}: {
  name: string
  description: string
  active: boolean
  onClick: () => void
  tc: ReturnType<typeof useThemeColors>
  gradient: string
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-lg transition-all hover:scale-[1.03] active:scale-[0.98]"
      style={{
        background: active ? tc.alpha(tc.primary, 0.1) : tc.bgInput,
        border: active ? `2px solid ${tc.primary}` : `1px solid ${tc.borderDefault}`,
        boxShadow: active ? tc.neonGlow(tc.primary, 0.3) : 'none',
      }}
    >
      <div className="w-full h-20 rounded-lg mb-3" style={{ background: gradient }} />
      <div className="font-medium" style={{ color: tc.textPrimary }}>
        {name}
      </div>
      <div className="text-xs mt-1" style={{ color: tc.textSecondary }}>
        {description}
      </div>
    </button>
  )
}
