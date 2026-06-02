/**
 * @file components/settings-page-standalone.tsx
 * @description YYC³ Settings Page - Standalone Version (No External Dependencies)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,ui,standalone
 */

import {
  Bot,
  Briefcase,
  Camera,
  ChevronRight,
  Cpu,
  Download,
  FileCode,
  FolderTree,
  Globe,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageSquare,
  Palette,
  Plug,
  Search,
  Settings as SettingsIcon,
  Type,
  Upload,
  User,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { useThemeSwitcher } from './theme-switcher-context'

/**
 * 独立设置页面 - 无外部状态依赖
 */
export function SettingsPage() {
  const tc = useThemeColors()
  const { theme, setTheme } = useThemeSwitcher()
  const { locale: language, setLocale: setLanguage } = useI18n()
  const [activeCategory, setActiveCategory] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'account', label: '账号信息', icon: User, description: '管理您的个人信息和头像' },
    {
      id: 'general',
      label: '通用设置',
      icon: SettingsIcon,
      description: '主题、语言、编辑器等基础配置',
    },
    { id: 'agents', label: '智能体管理', icon: Bot, description: '配置和管理AI智能体' },
    { id: 'mcp', label: 'MCP 连接', icon: Plug, description: '模型上下文协议连接管理' },
    { id: 'models', label: '模型配置', icon: Cpu, description: 'AI 模型和 API 密钥配置' },
    { id: 'context', label: '上下文管理', icon: FolderTree, description: '代码索引和文档集管理' },
    {
      id: 'conversation',
      label: '对话流设置',
      icon: MessageSquare,
      description: '对话行为和通知配置',
    },
    { id: 'rules', label: '规则管理', icon: FileCode, description: '自定义规则和约束' },
    { id: 'skills', label: '技能管理', icon: Zap, description: '自定义技能和能力' },
    { id: 'import-export', label: '导入/导出', icon: Download, description: '备份和迁移设置' },
  ]

  // 渲染通用设置面板
  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          通用设置
        </h2>
        <p style={{ color: tc.textSecondary }}>配置主题、语言、编辑器等基础选项</p>
      </div>

      {/* 主题设置 */}
      <div
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
            <Palette size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1" style={{ color: tc.textPrimary }}>
              主题
            </h3>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              选择界面主题风格
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Cyberpunk 主题 */}
          <button
            onClick={() => setTheme('cyberpunk')}
            className="text-left p-4 rounded-lg transition-all hover:scale-105"
            style={{
              background: theme === 'cyberpunk' ? tc.alpha(tc.primary, 0.1) : tc.bgInput,
              border:
                theme === 'cyberpunk' ? `2px solid ${tc.primary}` : `1px solid ${tc.borderDefault}`,
              boxShadow: theme === 'cyberpunk' ? tc.neonGlow(tc.primary, 0.3) : 'none',
            }}
          >
            <div
              className="w-full h-20 rounded-lg mb-3"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #00d4ff)',
              }}
            />
            <div className="font-medium" style={{ color: tc.textPrimary }}>
              Cyberpunk
            </div>
            <div className="text-xs mt-1" style={{ color: tc.textSecondary }}>
              赛博朋克风格
            </div>
          </button>

          {/* Liquid Glass 主题 */}
          <button
            onClick={() => setTheme('liquidGlass')}
            className="text-left p-4 rounded-lg transition-all hover:scale-105"
            style={{
              background: theme === 'liquidGlass' ? tc.alpha(tc.primary, 0.1) : tc.bgInput,
              border:
                theme === 'liquidGlass'
                  ? `2px solid ${tc.primary}`
                  : `1px solid ${tc.borderDefault}`,
              boxShadow: theme === 'liquidGlass' ? tc.neonGlow(tc.primary, 0.3) : 'none',
            }}
          >
            <div
              className="w-full h-20 rounded-lg mb-3"
              style={{
                background: 'linear-gradient(135deg, #00ff87, #06b6d4)',
              }}
            />
            <div className="font-medium" style={{ color: tc.textPrimary }}>
              Liquid Glass
            </div>
            <div className="text-xs mt-1" style={{ color: tc.textSecondary }}>
              液态玻璃风格
            </div>
          </button>
        </div>
      </div>

      {/* 语言设置 */}
      <div
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
            <Globe size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1" style={{ color: tc.textPrimary }}>
              语言
            </h3>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              选择系统显示语言
            </p>
          </div>
        </div>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="w-full px-4 py-3 rounded-lg outline-none"
          style={{
            background: tc.bgInput,
            color: tc.textPrimary,
            border: `1px solid ${tc.borderDefault}`,
          }}
        >
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>

      {/* 提示信息 */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: tc.alpha(tc.accent, 0.1),
          border: `1px solid ${tc.alpha(tc.accent, 0.3)}`,
        }}
      >
        <p style={{ color: tc.accent }}>💡 更多设置功能正在开发中...</p>
      </div>
    </div>
  )

  // 渲染占位面板
  const renderPlaceholderPanel = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
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
          className="p-12 rounded-xl text-center"
          style={{
            background: tc.bgElevated,
            border: `1px solid ${tc.borderSubtle}`,
          }}
        >
          <Icon size={48} style={{ color: tc.textMuted }} className="mx-auto mb-4" />
          <p style={{ color: tc.textMuted }}>{category.label}功能面板</p>
          <p className="text-sm mt-2" style={{ color: tc.textMuted }}>
            完整功能即将上线
          </p>
        </div>
      </div>
    )
  }

  // 渲染当前面板
  const renderCurrentPanel = () => {
    if (activeCategory === 'general') {
      return renderGeneralSettings()
    }
    return renderPlaceholderPanel(activeCategory)
  }

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
          ⚙️ 系统设置
        </h1>
        <p style={{ color: tc.textSecondary }}>
          配置和管理 YYC³ CloudPivot Intelli-Matrix 的各项功能
        </p>
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
            placeholder="搜索设置..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                      boxShadow: isActive ? tc.neonGlow(tc.primary, 0.3) : 'none',
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
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="col-span-9"
        >
          <div
            className="rounded-xl p-8"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderDefault}`,
              backdropFilter: tc.backdropFilter,
              minHeight: '600px',
            }}
          >
            {renderCurrentPanel()}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
