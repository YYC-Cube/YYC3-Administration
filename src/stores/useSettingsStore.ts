/**
 * @file stores/useSettingsStore.ts
 * @description YYC³ Settings Store - Zustand State Management with Persistence
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,zustand,state-management,persistence
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  AgentConfig,
  ContextSettings,
  ConversationSettings,
  GeneralSettings,
  ImportSettings,
  MCPConfig,
  ModelConfig,
  RuleConfig,
  Settings,
  SkillConfig,
  UserProfile,
} from '../types/settings'

interface SettingsState {
  /** 设置数据 */
  settings: Settings
  /** 搜索查询 */
  searchQuery: string
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: string | null
}

interface SettingsActions {
  /** 更新用户信息 */
  updateUserProfile: (profile: Partial<UserProfile>) => void
  /** 更新通用设置 */
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void
  /** 添加智能体 */
  addAgent: (agent: AgentConfig) => void
  /** 更新智能体 */
  updateAgent: (id: string, agent: Partial<AgentConfig>) => void
  /** 删除智能体 */
  removeAgent: (id: string) => void
  /** 添加 MCP */
  addMCP: (mcp: MCPConfig) => void
  /** 更新 MCP */
  updateMCP: (id: string, mcp: Partial<MCPConfig>) => void
  /** 删除 MCP */
  removeMCP: (id: string) => void
  /** 添加模型 */
  addModel: (model: ModelConfig) => void
  /** 更新模型 */
  updateModel: (id: string, model: Partial<ModelConfig>) => void
  /** 删除模型 */
  removeModel: (id: string) => void
  /** 更新上下文设置 */
  updateContextSettings: (settings: Partial<ContextSettings>) => void
  /** 更新对话流设置 */
  updateConversationSettings: (settings: Partial<ConversationSettings>) => void
  /** 添加规则 */
  addRule: (rule: RuleConfig) => void
  /** 更新规则 */
  updateRule: (id: string, rule: Partial<RuleConfig>) => void
  /** 删除规则 */
  removeRule: (id: string) => void
  /** 添加技能 */
  addSkill: (skill: SkillConfig) => void
  /** 更新技能 */
  updateSkill: (id: string, skill: Partial<SkillConfig>) => void
  /** 删除技能 */
  removeSkill: (id: string) => void
  /** 更新导入设置 */
  updateImportSettings: (settings: Partial<ImportSettings>) => void
  /** 设置搜索查询 */
  setSearchQuery: (query: string) => void
  /** 导入配置 */
  importConfig: (config: Partial<Settings>) => void
  /** 导出配置 */
  exportConfig: () => Settings
  /** 重置设置 */
  resetSettings: () => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  /** 设置错误 */
  setError: (error: string | null) => void
}

const defaultSettings: Settings = {
  userProfile: {
    id: '',
    username: 'YYC³ User',
    email: 'user@yyc3.cloud',
    bio: '言启象限 | 语枢未来',
    role: 'AI Architect',
  },
  general: {
    theme: 'cyberpunk',
    language: 'zh-CN',
    editorFont: 'Monaco, Consolas, "Courier New", monospace',
    editorFontSize: 14,
    wordWrap: true,
    keybindingScheme: 'vscode',
    customKeybindings: {},
    localLinkOpenMode: 'system',
    markdownOpenMode: 'editor',
    nodeVersion: '20.0.0',
    enableAnimations: true,
    enableSounds: true,
  },
  agents: [],
  mcpConfigs: [],
  models: [],
  context: {
    indexStatus: 'idle',
    ignoreRules: ['node_modules', 'dist', 'build', '.git'],
    documentSets: [],
    autoIndex: true,
    indexDepth: 5,
  },
  conversation: {
    useTodoList: true,
    autoCollapseNodes: false,
    autoFixCodeIssues: true,
    agentProactiveQuestion: true,
    codeReviewScope: 'all',
    jumpAfterReview: true,
    autoRunMCP: false,
    commandRunMode: 'sandbox',
    whitelistCommands: [],
    notificationTypes: ['banner', 'sound'],
    volume: 80,
    soundConfig: {
      complete: 'default',
      waiting: 'default',
      interrupt: 'default',
    },
    autoSave: true,
    saveInterval: 30,
  },
  rules: [],
  skills: [],
  importSettings: {
    includeAgentsMD: false,
    includeClaudeMD: false,
    includeProjectConfig: true,
    includeUserData: false,
  },
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      searchQuery: '',
      loading: false,
      error: null,

      updateUserProfile: (profile) => {
        set((state) => ({
          settings: {
            ...state.settings,
            userProfile: { ...state.settings.userProfile, ...profile },
          },
        }))
      },

      updateGeneralSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            general: { ...state.settings.general, ...settings },
          },
        }))
      },

      addAgent: (agent) => {
        set((state) => ({
          settings: {
            ...state.settings,
            agents: [...state.settings.agents, agent],
          },
        }))
      },

      updateAgent: (id, agent) => {
        set((state) => ({
          settings: {
            ...state.settings,
            agents: state.settings.agents.map((a) =>
              a.id === id ? { ...a, ...agent, updatedAt: new Date().toISOString() } : a,
            ),
          },
        }))
      },

      removeAgent: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            agents: state.settings.agents.filter((a) => a.id !== id),
          },
        }))
      },

      addMCP: (mcp) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mcpConfigs: [...state.settings.mcpConfigs, mcp],
          },
        }))
      },

      updateMCP: (id, mcp) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mcpConfigs: state.settings.mcpConfigs.map((m) => (m.id === id ? { ...m, ...mcp } : m)),
          },
        }))
      },

      removeMCP: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mcpConfigs: state.settings.mcpConfigs.filter((m) => m.id !== id),
          },
        }))
      },

      addModel: (model) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: [...state.settings.models, model],
          },
        }))
      },

      updateModel: (id, model) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: state.settings.models.map((m) => (m.id === id ? { ...m, ...model } : m)),
          },
        }))
      },

      removeModel: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: state.settings.models.filter((m) => m.id !== id),
          },
        }))
      },

      updateContextSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            context: { ...state.settings.context, ...settings },
          },
        }))
      },

      updateConversationSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            conversation: { ...state.settings.conversation, ...settings },
          },
        }))
      },

      addRule: (rule) => {
        set((state) => ({
          settings: {
            ...state.settings,
            rules: [...state.settings.rules, rule],
          },
        }))
      },

      updateRule: (id, rule) => {
        set((state) => ({
          settings: {
            ...state.settings,
            rules: state.settings.rules.map((r) =>
              r.id === id ? { ...r, ...rule, updatedAt: new Date().toISOString() } : r,
            ),
          },
        }))
      },

      removeRule: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            rules: state.settings.rules.filter((r) => r.id !== id),
          },
        }))
      },

      addSkill: (skill) => {
        set((state) => ({
          settings: {
            ...state.settings,
            skills: [...state.settings.skills, skill],
          },
        }))
      },

      updateSkill: (id, skill) => {
        set((state) => ({
          settings: {
            ...state.settings,
            skills: state.settings.skills.map((s) =>
              s.id === id ? { ...s, ...skill, updatedAt: new Date().toISOString() } : s,
            ),
          },
        }))
      },

      removeSkill: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            skills: state.settings.skills.filter((s) => s.id !== id),
          },
        }))
      },

      updateImportSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            importSettings: { ...state.settings.importSettings, ...settings },
          },
        }))
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      importConfig: (config) => {
        set({ settings: { ...defaultSettings, ...config } })
      },

      exportConfig: () => {
        return get().settings
      },

      resetSettings: () => {
        set({ settings: defaultSettings, searchQuery: '', error: null })
      },

      setLoading: (loading) => {
        set({ loading })
      },

      setError: (error) => {
        set({ error })
      },
    }),
    {
      name: 'yyc3-settings-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
)
