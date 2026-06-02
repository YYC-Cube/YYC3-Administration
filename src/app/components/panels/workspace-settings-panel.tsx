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

import {
  Check, ChevronRight, Code, Globe, Monitor, Palette, RotateCcw,
  Settings, Type, Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";


import { useSettingsStore } from "../../../stores/useSettingsStore";
import { useI18n } from "../i18n-context";
import { useThemeSwitcher } from "../theme-switcher-context";

import { usePanelStore } from "./panel-store";

import type { ThemeColors } from "../hooks/use-theme-colors";

type SettingsSection = "editor" | "theme" | "keybindings" | "ai" | "workspace";

export function WorkspaceSettingsPanel({ tc }: { tc: ThemeColors }) {
  const { settings, updateGeneralSettings } = useSettingsStore();
  const { theme, setTheme } = useThemeSwitcher();
  const { locale, setLocale } = useI18n();
  const { aiProviderConfig, setAIProviderConfig, panelWidth, setPanelWidth } = usePanelStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>("editor");

  const { general } = settings;

  const sections: { key: SettingsSection; label: string; icon: typeof Settings }[] = [
    { key: "editor", label: "编辑器", icon: Code },
    { key: "theme", label: "主题", icon: Palette },
    { key: "keybindings", label: "快捷键", icon: Zap },
    { key: "ai", label: "AI 配置", icon: Monitor },
    { key: "workspace", label: "工作区", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-3 py-2 border-b" style={{ borderColor: tc.borderSubtle }}>
        <Settings className="w-3 h-3 mr-1.5" style={{ color: tc.textMuted }} />
        <span className="text-[11px] uppercase tracking-wider" style={{ color: tc.textMuted }}>工作区设置</span>
      </div>

      {/* Section tabs */}
      <div className="flex gap-0.5 px-3 py-2 overflow-x-auto border-b" style={{ borderColor: tc.borderSubtle }}>
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className="text-[9px] px-2 py-1 rounded-lg shrink-0 transition-all flex items-center gap-1"
              style={{ background: activeSection === s.key ? `${tc.primary}12` : "transparent", color: activeSection === s.key ? tc.primary : tc.textMuted }}>
              <Icon className="w-3 h-3" />{s.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {activeSection === "editor" && (
              <div className="space-y-3">
                <SettingRow label="字体" tc={tc}>
                  <select value={general.editorFont}
                    onChange={(e) => updateGeneralSettings({ editorFont: e.target.value })}
                    className="text-[10px] px-2 py-1 rounded-lg border outline-none w-full"
                    style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}>
                    <option value='Monaco, Consolas, "Courier New", monospace'>Monaco / Consolas</option>
                    <option value='"Fira Code", Monaco, monospace'>Fira Code</option>
                    <option value='"JetBrains Mono", Monaco, monospace'>JetBrains Mono</option>
                    <option value='"Source Code Pro", Monaco, monospace'>Source Code Pro</option>
                  </select>
                </SettingRow>

                <SettingRow label="字号" tc={tc}>
                  <div className="flex items-center gap-2">
                    <input type="range" min="10" max="24" step="1"
                      value={general.editorFontSize}
                      onChange={(e) => updateGeneralSettings({ editorFontSize: parseInt(e.target.value) })}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, ${tc.primary} 0%, ${tc.primary} ${((general.editorFontSize - 10) / 14) * 100}%, ${tc.borderDefault} ${((general.editorFontSize - 10) / 14) * 100}%, ${tc.borderDefault} 100%)` }}
                    />
                    <span className="text-[10px] w-6 text-right" style={{ color: tc.textPrimary }}>{general.editorFontSize}</span>
                  </div>
                </SettingRow>

                <SettingRow label="自动换行" tc={tc}>
                  <ToggleSwitch checked={general.wordWrap} onChange={(v) => updateGeneralSettings({ wordWrap: v })} tc={tc} />
                </SettingRow>

                <SettingRow label="动画效果" tc={tc}>
                  <ToggleSwitch checked={general.enableAnimations} onChange={(v) => updateGeneralSettings({ enableAnimations: v })} tc={tc} />
                </SettingRow>

                <SettingRow label="音效" tc={tc}>
                  <ToggleSwitch checked={general.enableSounds} onChange={(v) => updateGeneralSettings({ enableSounds: v })} tc={tc} />
                </SettingRow>
              </div>
            )}

            {activeSection === "theme" && (
              <div className="space-y-3">
                <SettingRow label="主题" tc={tc}>
                  <div className="flex gap-2">
                    {(["cyberpunk", "liquidGlass"] as const).map((t) => (
                      <button key={t} onClick={() => setTheme(t)}
                        className="flex-1 text-[9px] px-2 py-2 rounded-lg border transition-all text-center"
                        style={{ background: theme === t ? `${tc.primary}15` : "transparent", borderColor: theme === t ? `${tc.primary}40` : tc.borderSubtle, color: theme === t ? tc.primary : tc.textMuted }}>
                        {theme === t && <Check className="w-3 h-3 inline mr-1" />}
                        {t === "cyberpunk" ? "赛博朋克" : "液态玻璃"}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                <SettingRow label="语言" tc={tc}>
                  <select value={locale}
                    onChange={(e) => setLocale(e.target.value as any)}
                    className="text-[10px] px-2 py-1 rounded-lg border outline-none w-full"
                    style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}>
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                  </select>
                </SettingRow>
              </div>
            )}

            {activeSection === "keybindings" && (
              <div className="space-y-2">
                <SettingRow label="快捷键方案" tc={tc}>
                  <select value={general.keybindingScheme}
                    onChange={(e) => updateGeneralSettings({ keybindingScheme: e.target.value as any })}
                    className="text-[10px] px-2 py-1 rounded-lg border outline-none w-full"
                    style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}>
                    <option value="vscode">VS Code</option>
                    <option value="vim">Vim</option>
                    <option value="emacs">Emacs</option>
                  </select>
                </SettingRow>

                <div className="space-y-1 mt-2">
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>快捷键列表</p>
                  {[
                    { keys: "Ctrl+B", action: "切换面板" },
                    { keys: "Ctrl+P", action: "快速打开 / 搜索" },
                    { keys: "Ctrl+E", action: "文件浏览器" },
                    { keys: "Ctrl+S", action: "保存文件" },
                    { keys: "Ctrl+Shift+P", action: "命令面板" },
                    { keys: "Ctrl+/", action: "切换注释" },
                    { keys: "Ctrl+D", action: "选中下一匹配" },
                  ].map((s) => (
                    <div key={s.keys} className="flex items-center justify-between py-1 px-1">
                      <span className="text-[10px]" style={{ color: tc.textSecondary }}>{s.action}</span>
                      <kbd className="text-[8px] font-mono px-1.5 py-0.5 rounded border" style={{ borderColor: tc.borderSubtle, color: tc.textMuted, background: "rgba(255,255,255,0.02)" }}>{s.keys}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "ai" && (
              <div className="space-y-3">
                <SettingRow label="提供商" tc={tc}>
                  <span className="text-[10px] px-2 py-1 rounded-lg border" style={{ borderColor: tc.borderDefault, color: tc.textPrimary, background: tc.bgInput }}>
                    {aiProviderConfig.provider === "mock" ? "模拟（内置）" : aiProviderConfig.provider.toUpperCase()}
                  </span>
                </SettingRow>

                <SettingRow label="模型" tc={tc}>
                  <span className="text-[10px]" style={{ color: tc.textSecondary }}>{aiProviderConfig.model}</span>
                </SettingRow>

                <SettingRow label="温度" tc={tc}>
                  <span className="text-[10px]" style={{ color: tc.textSecondary }}>{aiProviderConfig.temperature.toFixed(1)}</span>
                </SettingRow>

                <SettingRow label="最大令牌数" tc={tc}>
                  <span className="text-[10px]" style={{ color: tc.textSecondary }}>{aiProviderConfig.maxTokens}</span>
                </SettingRow>

                <p className="text-[8px]" style={{ color: tc.textMuted }}>
                  在 AI 助手面板（⚙️ 图标）中配置 AI 提供商详情。
                </p>
              </div>
            )}

            {activeSection === "workspace" && (
              <div className="space-y-3">
                <SettingRow label="面板宽度" tc={tc}>
                  <div className="flex items-center gap-2">
                    <input type="range" min="200" max="600" step="10"
                      value={panelWidth}
                      onChange={(e) => setPanelWidth(parseInt(e.target.value))}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, ${tc.primary} 0%, ${tc.primary} ${((panelWidth - 200) / 400) * 100}%, ${tc.borderDefault} ${((panelWidth - 200) / 400) * 100}%, ${tc.borderDefault} 100%)` }}
                    />
                    <span className="text-[10px] w-8 text-right" style={{ color: tc.textPrimary }}>{panelWidth}px</span>
                  </div>
                </SettingRow>

                <div className="pt-2 border-t" style={{ borderColor: tc.borderSubtle }}>
                  <button onClick={() => {
                    updateGeneralSettings({
                      editorFont: 'Monaco, Consolas, "Courier New", monospace',
                      editorFontSize: 14,
                      wordWrap: true,
                      enableAnimations: true,
                      enableSounds: true,
                    });
                    setPanelWidth(300);
                  }} className="w-full text-[10px] py-1.5 rounded-lg border transition-all hover:bg-white/5 flex items-center justify-center gap-1.5"
                    style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                    <RotateCcw className="w-3 h-3" />重置工作区默认值
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// Shared sub-components
// ==========================================

function SettingRow({ label, tc, children }: { label: string; tc: ThemeColors; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[9px] block mb-1 uppercase tracking-wider" style={{ color: tc.textMuted }}>{label}</label>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, tc }: { checked: boolean; onChange: (v: boolean) => void; tc: ThemeColors }) {
  return (
    <button onClick={() => onChange(!checked)} className="relative w-8 h-4 rounded-full transition-colors"
      style={{ background: checked ? `${tc.primary}40` : tc.borderDefault }}>
      <div className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
        style={{ background: checked ? tc.primary : tc.textMuted, left: checked ? "18px" : "2px" }} />
    </button>
  );
}