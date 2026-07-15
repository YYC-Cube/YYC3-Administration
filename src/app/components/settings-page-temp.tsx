/**
 * @file components/settings-page-temp.tsx
 * @description YYC³ Settings Page - Temporary Simplified Version
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,ui,temporary
 */

import {
  Bot,
  ChevronRight,
  Cpu,
  Download,
  FileCode,
  FolderTree,
  MessageSquare,
  Plug,
  Search,
  Settings as SettingsIcon,
  User,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'

/**
 * 临时设置页面 - 快速修复版本
 */
export function SettingsPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState('account')

  const categories = [
    { id: 'account', label: t('stg.cat.account'), icon: User },
    { id: 'general', label: t('stg.cat.general'), icon: SettingsIcon },
    { id: 'agents', label: t('stg.cat.agents'), icon: Bot },
    { id: 'mcp', label: t('stg.cat.mcp'), icon: Plug },
    { id: 'models', label: t('stg.cat.models'), icon: Cpu },
    { id: 'context', label: t('stg.cat.context'), icon: FolderTree },
    { id: 'conversation', label: t('stg.cat.conversation'), icon: MessageSquare },
    { id: 'rules', label: t('stg.cat.rules'), icon: FileCode },
    { id: 'skills', label: t('stg.cat.skills'), icon: Zap },
    { id: 'import-export', label: t('stg.cat.importExport'), icon: Download },
  ]

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: tc.bgBase,
        color: tc.textPrimary,
      }}
    >
      {/* 页面头部 */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: tc.primary }}>
          ⚙️ {t('stg.systemSettings')}
        </h1>
        <p style={{ color: tc.textSecondary }}>{t('stg.pageDesc')}</p>
      </motion.div>

      {/* 搜索栏 */}
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
            className="w-full py-3 pl-12 pr-4 bg-transparent outline-none"
            style={{ color: tc.textPrimary }}
          />
        </div>
      </motion.div>

      {/* 主体内容 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧导航 */}
        <div className="col-span-3">
          <div
            className="rounded-xl p-4 sticky top-8"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderDefault}`,
              backdropFilter: tc.backdropFilter,
            }}
          >
            <div className="space-y-1">
              {categories.map((category) => {
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
                    }}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-sm font-medium">{category.label}</span>
                    {isActive && <ChevronRight size={16} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 右侧设置面板 */}
        <div className="col-span-9">
          <div
            className="rounded-xl p-8"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderDefault}`,
              backdropFilter: tc.backdropFilter,
              minHeight: '600px',
            }}
          >
            {/* 临时内容 */}
            <div className="text-center py-20">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  border: `2px solid ${tc.alpha(tc.primary, 0.3)}`,
                }}
              >
                <SettingsIcon size={40} style={{ color: tc.primary }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
                {t('stg.settingsReady')}
              </h2>
              <p className="text-lg mb-4" style={{ color: tc.textSecondary }}>
                {t('stg.currentSelection')}:{' '}
                {categories.find((c) => c.id === activeCategory)?.label}
              </p>
              <div
                className="inline-block px-6 py-3 rounded-lg"
                style={{
                  background: tc.alpha(tc.accent, 0.1),
                  border: `1px solid ${tc.alpha(tc.accent, 0.3)}`,
                }}
              >
                <p style={{ color: tc.accent }}>🎉 {t('stg.panelLoading')}</p>
                <p className="text-sm mt-2" style={{ color: tc.textMuted }}>
                  {t('stg.fullFeatureSoon')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
