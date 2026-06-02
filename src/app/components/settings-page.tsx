/**
 * @file components/settings-page.tsx
 * @description YYC³ Unified Settings Page - Enterprise-grade Settings Management UI
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,ui,management,enterprise
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
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Upload,
  User,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type ReactNode, useMemo, useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { AccountSettingsPanel } from './settings/account-settings-panel'
import { AgentsSettingsPanel } from './settings/agents-settings-panel'
import { ContextSettingsPanel } from './settings/context-settings-panel'
import { ConversationSettingsPanel } from './settings/conversation-settings-panel'
import { GeneralSettingsPanel } from './settings/general-settings-panel'
import { ImportExportPanel } from './settings/import-export-panel'
import { MCPSettingsPanel } from './settings/mcp-settings-panel'
import { ModelsSettingsPanel } from './settings/models-settings-panel'
import { RulesSettingsPanel } from './settings/rules-settings-panel'
import { SkillsSettingsPanel } from './settings/skills-settings-panel'

import type { SettingsCategory } from '@/types/settings'

import { searchSettings } from '@/services/settings-search'
import { useSettingsStore } from '@/stores/useSettingsStore'

/**
 * 设置分类配置
 */
const SETTINGS_CATEGORIES: Array<{
  id: SettingsCategory
  label: string
  icon: (props: { className?: string }) => ReactNode
  description: string
}> = [
  {
    id: 'account',
    label: '账号信息',
    icon: User,
    description: '管理您的个人信息和头像',
  },
  {
    id: 'general',
    label: '通用设置',
    icon: SettingsIcon,
    description: '主题、语言、编辑器等基础配置',
  },
  {
    id: 'agents',
    label: '智能体管理',
    icon: Bot,
    description: '配置和管理AI智能体',
  },
  {
    id: 'mcp',
    label: 'MCP 连接',
    icon: Plug,
    description: '模型上下文协议连接管理',
  },
  {
    id: 'models',
    label: '模型配置',
    icon: Cpu,
    description: 'AI 模型和 API 密钥配置',
  },
  {
    id: 'context',
    label: '上下文管理',
    icon: FolderTree,
    description: '代码索引和文档集管理',
  },
  {
    id: 'conversation',
    label: '对话流设置',
    icon: MessageSquare,
    description: '对话行为和通知配置',
  },
  {
    id: 'rules',
    label: '规则管理',
    icon: FileCode,
    description: '自定义规则和约束',
  },
  {
    id: 'skills',
    label: '技能管理',
    icon: Zap,
    description: '自定义技能和能力',
  },
  {
    id: 'import-export',
    label: '导入/导出',
    icon: Download,
    description: '备份和迁移设置',
  },
]

/**
 * 设置页面主组件
 */
export function SettingsPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const { settings, searchQuery, setSearchQuery, exportConfig, importConfig, resetSettings } =
    useSettingsStore()

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('account')
  const [showSearchResults, setShowSearchResults] = useState(false)

  // 执行搜索
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchSettings(settings, searchQuery)
  }, [settings, searchQuery])

  // 处理搜索输入
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setShowSearchResults(value.trim().length > 0)
  }

  // 处理导出配置
  const handleExport = () => {
    const config = exportConfig()
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yyc3-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 处理导入配置
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target?.result as string)
            importConfig(config)
            alert('配置导入成功！')
          } catch (error) {
            alert('配置文件格式错误')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // 处理重置
  const handleReset = () => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      resetSettings()
      alert('设置已重置')
    }
  }

  // 渲染当前分类的设置面板
  const renderSettingsPanel = () => {
    switch (activeCategory) {
      case 'account':
        return <AccountSettingsPanel />
      case 'general':
        return <GeneralSettingsPanel />
      case 'agents':
        return <AgentsSettingsPanel />
      case 'mcp':
        return <MCPSettingsPanel />
      case 'models':
        return <ModelsSettingsPanel />
      case 'context':
        return <ContextSettingsPanel />
      case 'conversation':
        return <ConversationSettingsPanel />
      case 'rules':
        return <RulesSettingsPanel />
      case 'skills':
        return <SkillsSettingsPanel />
      case 'import-export':
        return <ImportExportPanel />
      default:
        return null
    }
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: tc.springEasing as any }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2" style={{ color: tc.primary }}>
          ⚙️ 系统设置
        </h1>
        <p style={{ color: tc.textSecondary }}>
          配置和管理 YYC³ CloudPivot Intelli-Matrix 的各项功能
        </p>
      </motion.div>

      {/* 搜索栏 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 relative"
      >
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full py-3 pl-12 pr-4 bg-transparent outline-none"
            style={{ color: tc.textPrimary }}
          />
        </div>

        {/* 搜索结果下拉 */}
        <AnimatePresence>
          {showSearchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
              style={{
                background: tc.bgElevated,
                border: `1px solid ${tc.borderDefault}`,
                backdropFilter: tc.backdropFilter,
                boxShadow: tc.shadowLg,
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              {searchResults.map((result, index) => (
                <motion.div
                  key={result.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 cursor-pointer hover:bg-opacity-20 transition-colors"
                  style={{
                    borderBottom: `1px solid ${tc.borderSubtle}`,
                  }}
                  onClick={() => {
                    setShowSearchResults(false)
                    setSearchQuery('')
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium" style={{ color: tc.textPrimary }}>
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-sm mt-1" style={{ color: tc.textSecondary }}>
                          {result.description}
                        </div>
                      )}
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: tc.bgInput,
                        color: tc.textMuted,
                      }}
                    >
                      {result.category}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 主体内容 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧导航 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-3"
        >
          <div
            className="rounded-xl p-4 sticky top-8"
            style={{
              background: tc.bgCard,
              border: `1px solid ${tc.borderDefault}`,
              backdropFilter: tc.backdropFilter,
            }}
          >
            <div className="space-y-1">
              {SETTINGS_CATEGORIES.map((category, index) => {
                const Icon = category.icon
                const isActive = activeCategory === category.id

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
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
                    <Icon className="size-[18px]" />
                    <span className="flex-1 text-sm font-medium">{category.label}</span>
                    {isActive && <ChevronRight size={16} />}
                  </motion.button>
                )
              })}
            </div>

            {/* 快捷操作 */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: tc.borderSubtle }}>
              <div className="space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-105"
                  style={{
                    background: tc.alpha(tc.secondary, 0.1),
                    color: tc.secondary,
                    border: `1px solid ${tc.alpha(tc.secondary, 0.3)}`,
                  }}
                >
                  <Download size={16} />
                  导出配置
                </button>
                <button
                  onClick={handleImport}
                  className="w-full px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-105"
                  style={{
                    background: tc.alpha(tc.accent, 0.1),
                    color: tc.accent,
                    border: `1px solid ${tc.alpha(tc.accent, 0.3)}`,
                  }}
                >
                  <Upload size={16} />
                  导入配置
                </button>
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all hover:scale-105"
                  style={{
                    background: tc.alpha(tc.danger, 0.1),
                    color: tc.danger,
                    border: `1px solid ${tc.alpha(tc.danger, 0.3)}`,
                  }}
                >
                  <RotateCcw size={16} />
                  重置设置
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 右侧设置面板 */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
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
            {renderSettingsPanel()}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
