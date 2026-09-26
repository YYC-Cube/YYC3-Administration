/**
 * @file workspace-settings-panel.tsx
 * @description YYC³ Developer Workspace — Inline Settings Panel for editor preferences,
 *   theme, language, AI provider, and keybindings. Connected to useSettingsStore.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,settings,workspace
 */

import { Check, Code, Monitor, Palette, RotateCcw, Settings, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import type { ThemeColors } from '@/shared/hooks/use-theme-colors'

import { useI18n } from '@/app/components/i18n-context'
import { useThemeSwitcher } from '@/app/components/theme-switcher-context'
import { usePanelStore } from '@/features/dev-workspace/panels/panel-store'
import { useActiveModel } from '@/stores/useAIModelStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

type SettingsSection = 'editor' | 'theme' | 'keybindings' | 'ai' | 'workspace'

export function WorkspaceSettingsPanel({ tc }: { tc: ThemeColors }) {
  const settings = useSettingsStore((s) => s.settings)
  const updateGeneralSettings = useSettingsStore((s) => s.updateGeneralSettings)
  const { theme, setTheme } = useThemeSwitcher()
  const { locale, setLocale, t } = useI18n()
  const { panelWidth, setPanelWidth } = usePanelStore()
  const activeModel = useActiveModel()
  const [activeSection, setActiveSection] = useState<SettingsSection>('editor')

  const { general } = settings

  const sections: { key: SettingsSection; label: string; icon: typeof Settings }[] = [
    { key: 'editor', label: 'wsp.section.editor', icon: Code },
    { key: 'theme', label: 'wsp.section.theme', icon: Palette },
    { key: 'keybindings', label: 'wsp.section.keybindings', icon: Zap },
    { key: 'ai', label: 'wsp.section.ai', icon: Monitor },
    { key: 'workspace', label: 'wsp.section.workspace', icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center px-3 py-2 border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        <Settings className="w-3 h-3 mr-1.5" style={{ color: tc.textMuted }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
          {t('wsp.title')}
        </span>
      </div>

      {/* Section tabs */}
      <div
        className="flex gap-0.5 px-3 py-2 overflow-x-auto border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className="text-[9px] px-2 py-1 rounded-lg shrink-0 transition-all flex items-center gap-1"
              style={{
                background: activeSection === s.key ? `${tc.primary}12` : 'transparent',
                color: activeSection === s.key ? tc.primary : tc.textMuted,
              }}
            >
              <Icon className="w-3 h-3" />
              {t(s.label)}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeSection === 'editor' && (
              <div className="space-y-3">
                <SettingRow label={t('wsp.font')} tc={tc}>
                  <select
                    value={general.editorFont}
                    onChange={(e) => updateGeneralSettings({ editorFont: e.target.value })}
                    className="text-[10px] px-2 py-1 rounded-lg border outline-none w-full"
                    style={{
                      background: tc.bgInput,
                      borderColor: tc.borderDefault,
                      color: tc.textPrimary,
                    }}
                  >
                    <option value='Monaco, Consolas, "Courier New", monospace'>
                      Monaco / Consolas
                    </option>
                    <option value='"Fira Code", Monaco, monospace'>Fira Code</option>
                    <option value='"JetBrains Mono", Monaco, monospace'>JetBrains Mono</option>
                    <option value='"Source Code Pro", Monaco, monospace'>Source Code Pro</option>
                  </select>
                </SettingRow>

                <SettingRow label={t('wsp.fontSize')} tc={tc}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="24"
                      step="1"
                      value={general.editorFontSize}
                      onChange={(e) =>
                        updateGeneralSettings({ editorFontSize: parseInt(e.target.value) })
                      }
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${tc.primary} 0%, ${tc.primary} ${((general.editorFontSize - 10) / 14) * 100}%, ${tc.borderDefault} ${((general.editorFontSize - 10) / 14) * 100}%, ${tc.borderDefault} 100%)`,
                      }}
                    />
                    <span className="text-[10px] w-6 text-right" style={{ color: tc.textPrimary }}>
                      {general.editorFontSize}
                    </span>
                  </div>
                </SettingRow>

                <SettingRow label={t('wsp.wordWrap')} tc={tc}>
                  <ToggleSwitch
                    checked={general.wordWrap}
                    onChange={(v) => updateGeneralSettings({ wordWrap: v })}
                    tc={tc}
                  />
                </SettingRow>

                <SettingRow label={t('wsp.animations')} tc={tc}>
                  <ToggleSwitch
                    checked={general.enableAnimations}
                    onChange={(v) => updateGeneralSettings({ enableAnimations: v })}
                    tc={tc}
                  />
                </SettingRow>

                <SettingRow label={t('wsp.sounds')} tc={tc}>
                  <ToggleSwitch
                    checked={general.enableSounds}
                    onChange={(v) => updateGeneralSettings({ enableSounds: v })}
                    tc={tc}
                  />
                </SettingRow>
              </div>
            )}

            {activeSection === 'theme' && (
              <div className="space-y-3">
                <SettingRow label={t('wsp.theme')} tc={tc}>
                  <div className="flex gap-2">
                    {(['cyberpunk', 'liquidGlass'] as const).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => setTheme(themeKey)}
                        className="flex-1 text-[9px] px-2 py-2 rounded-lg border transition-all text-center"
                        style={{
                          background: theme === themeKey ? `${tc.primary}15` : 'transparent',
                          borderColor: theme === themeKey ? `${tc.primary}40` : tc.borderSubtle,
                          color: theme === themeKey ? tc.primary : tc.textMuted,
                        }}
                      >
                        {theme === themeKey && <Check className="w-3 h-3 inline mr-1" />}
                        {themeKey === 'cyberpunk'
                          ? t('wsp.theme.cyberpunk')
                          : t('wsp.theme.liquidGlass')}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow label={t('wsp.language')} tc={tc}>
                  <select
                    value={locale}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e) => setLocale(e.target.value as any)}
                    className="text-[10px] px-2 py-1 rounded-lg border outline-none w-full"
                    style={{
                      background: tc.bgInput,
                      borderColor: tc.borderDefault,
                      color: tc.textPrimary,
                    }}
                  >
                    <option value="zh">{t('wsp.lang.zh')}</option>
                    <option value="en">English</option>
                  </select>
                </SettingRow>
              </div>
            )}

            {activeSection === 'keybindings' && (
              <div className="space-y-2">
                <SettingRow label={t('wsp.keybindingScheme')} tc={tc}>
                  <select
                    value={general.keybindingScheme}
                    onChange={(e) =>
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      updateGeneralSettings({ keybindingScheme: e.target.value as any })
                    }
                    className="text-[10px] px-2 py-1 rounded-lg border outline-none w-full"
                    style={{
                      background: tc.bgInput,
                      borderColor: tc.borderDefault,
                      color: tc.textPrimary,
                    }}
                  >
                    <option value="vscode">VS Code</option>
                    <option value="vim">Vim</option>
                    <option value="emacs">Emacs</option>
                  </select>
                </SettingRow>

                <div className="space-y-1 mt-2">
                  <p
                    className="text-[9px] uppercase tracking-wider"
                    style={{ color: tc.textMuted }}
                  >
                    {t('wsp.keybindingList')}
                  </p>
                  {[
                    { keys: 'Ctrl+B', action: t('wsp.kb.togglePanel') },
                    { keys: 'Ctrl+P', action: t('wsp.kb.quickOpen') },
                    { keys: 'Ctrl+E', action: t('wsp.kb.fileExplorer') },
                    { keys: 'Ctrl+S', action: t('wsp.kb.saveFile') },
                    { keys: 'Ctrl+Shift+P', action: t('wsp.kb.commandPalette') },
                    { keys: 'Ctrl+/', action: t('wsp.kb.toggleComment') },
                    { keys: 'Ctrl+D', action: t('wsp.kb.selectNext') },
                  ].map((s) => (
                    <div key={s.keys} className="flex items-center justify-between py-1 px-1">
                      <span className="text-[10px]" style={{ color: tc.textSecondary }}>
                        {s.action}
                      </span>
                      <kbd
                        className="text-[8px] font-mono px-1.5 py-0.5 rounded border"
                        style={{
                          borderColor: tc.borderSubtle,
                          color: tc.textMuted,
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {s.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'ai' && (
              <div className="space-y-3">
                <SettingRow label={t('wsp.provider')} tc={tc}>
                  <span
                    className="text-[10px] px-2 py-1 rounded-lg border"
                    style={{
                      borderColor: tc.borderDefault,
                      color: tc.textPrimary,
                      background: tc.bgInput,
                    }}
                  >
                    {activeModel ? activeModel.provider.toUpperCase() : t('wsp.mockBuiltin')}
                  </span>
                </SettingRow>

                <SettingRow label={t('wsp.model')} tc={tc}>
                  <span className="text-[10px]" style={{ color: tc.textSecondary }}>
                    {activeModel?.name ?? 'mock-v1'}
                  </span>
                </SettingRow>

                <SettingRow label={t('wsp.temperature')} tc={tc}>
                  <span className="text-[10px]" style={{ color: tc.textSecondary }}>
                    0.7
                  </span>
                </SettingRow>

                <SettingRow label={t('wsp.maxTokens')} tc={tc}>
                  <span className="text-[10px]" style={{ color: tc.textSecondary }}>
                    4096
                  </span>
                </SettingRow>

                <p className="text-[8px]" style={{ color: tc.textMuted }}>
                  {t('wsp.aiConfigNote')}
                </p>
              </div>
            )}

            {activeSection === 'workspace' && (
              <div className="space-y-3">
                <SettingRow label={t('wsp.panelWidth')} tc={tc}>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="200"
                      max="600"
                      step="10"
                      value={panelWidth}
                      onChange={(e) => setPanelWidth(parseInt(e.target.value))}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${tc.primary} 0%, ${tc.primary} ${((panelWidth - 200) / 400) * 100}%, ${tc.borderDefault} ${((panelWidth - 200) / 400) * 100}%, ${tc.borderDefault} 100%)`,
                      }}
                    />
                    <span className="text-[10px] w-8 text-right" style={{ color: tc.textPrimary }}>
                      {panelWidth}px
                    </span>
                  </div>
                </SettingRow>

                <div className="pt-2 border-t" style={{ borderColor: tc.borderSubtle }}>
                  <button
                    onClick={() => {
                      updateGeneralSettings({
                        editorFont: 'Monaco, Consolas, "Courier New", monospace',
                        editorFontSize: 14,
                        wordWrap: true,
                        enableAnimations: true,
                        enableSounds: true,
                      })
                      setPanelWidth(300)
                    }}
                    className="w-full text-[10px] py-1.5 rounded-lg border transition-all hover:bg-white/5 flex items-center justify-center gap-1.5"
                    style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t('wsp.resetDefaults')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ==========================================
// Shared sub-components
// ==========================================

function SettingRow({
  label,
  tc,
  children,
}: {
  label: string
  tc: ThemeColors
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        className="text-[9px] block mb-1 uppercase tracking-wider"
        style={{ color: tc.textMuted }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  tc,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  tc: ThemeColors
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-8 h-4 rounded-full transition-colors"
      style={{ background: checked ? `${tc.primary}40` : tc.borderDefault }}
    >
      <div
        className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
        style={{ background: checked ? tc.primary : tc.textMuted, left: checked ? '18px' : '2px' }}
      />
    </button>
  )
}
