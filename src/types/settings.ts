/**
 * @file types/settings.ts
 * @description YYC³ Settings System - Comprehensive Type Definitions
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,types,typescript,configuration
 */

/**
 * 主题类型
 */
export type Theme = 'cyberpunk' | 'liquidGlass' | 'auto'

/**
 * 语言类型
 */
export type Language = 'zh-CN' | 'en-US' | 'ja-JP'

/**
 * 通知类型
 */
export type NotificationType = 'banner' | 'sound' | 'menu'

/**
 * 提示音类型
 */
export type SoundType = 'complete' | 'waiting' | 'interrupt'

/**
 * 代码审查范围
 */
export type CodeReviewScope = 'none' | 'all' | 'changed'

/**
 * 命令运行方式
 */
export type CommandRunMode = 'sandbox' | 'direct'

/**
 * 技能范围类型
 */
export type SkillScope = 'global' | 'project'

/**
 * 规则范围类型
 */
export type RuleScope = 'personal' | 'project'

/**
 * 用户信息
 */
export interface UserProfile {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  role?: string
  location?: string
  website?: string
}

/**
 * 通用设置
 */
export interface GeneralSettings {
  /** 主题 */
  theme: Theme
  /** 语言 */
  language: Language
  /** 编辑器字体 */
  editorFont: string
  /** 编辑器字体大小 */
  editorFontSize: number
  /** Word wrap */
  wordWrap: boolean
  /** 快捷键方案 */
  keybindingScheme: 'vscode' | 'vim' | 'emacs' | 'custom'
  /** 自定义快捷键 */
  customKeybindings: Record<string, string>
  /** 本地链接默认打开方式 */
  localLinkOpenMode: 'system' | 'builtin'
  /** Markdown 文件默认打开方式 */
  markdownOpenMode: 'editor' | 'preview'
  /** Node.js 版本 */
  nodeVersion: string
  /** 启用动画效果 */
  enableAnimations: boolean
  /** 启用音效 */
  enableSounds: boolean
}

/**
 * 智能体配置
 */
export interface AgentConfig {
  id: string
  name: string
  description?: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  isBuiltIn: boolean
  isCustom: boolean
  enabled: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * MCP 配置
 */
export interface MCPConfig {
  id: string
  name: string
  type: 'market' | 'manual'
  endpoint?: string
  enabled: boolean
  projectLevel: boolean
  description?: string
  version?: string
  createdAt?: string
}

/**
 * 模型配置
 */
export interface ModelConfig {
  id: string
  provider: string
  model: string
  apiKey: string
  enabled: boolean
  baseUrl?: string
  maxTokens?: number
  temperature?: number
  createdAt?: string
}

/**
 * 上下文设置
 */
export interface ContextSettings {
  /** 代码索引状态 */
  indexStatus: 'idle' | 'indexing' | 'completed' | 'error'
  /** 忽略文件规则 */
  ignoreRules: string[]
  /** 文档集列表 */
  documentSets: DocumentSet[]
  /** 自动索引 */
  autoIndex: boolean
  /** 索引深度 */
  indexDepth: number
}

/**
 * 文档集
 */
export interface DocumentSet {
  id: string
  name: string
  source: 'url' | 'local'
  url?: string
  localPath?: string
  enabled: boolean
  description?: string
  lastSync?: string
}

/**
 * 对话流设置
 */
export interface ConversationSettings {
  /** 使用待办清单 */
  useTodoList: boolean
  /** 自动折叠对话节点 */
  autoCollapseNodes: boolean
  /** 自动修复代码规范问题 */
  autoFixCodeIssues: boolean
  /** 智能体主动提问 */
  agentProactiveQuestion: boolean
  /** 代码审查范围 */
  codeReviewScope: CodeReviewScope
  /** 审查后跳转 */
  jumpAfterReview: boolean
  /** 自动运行 MCP */
  autoRunMCP: boolean
  /** 命令运行方式 */
  commandRunMode: CommandRunMode
  /** 白名单命令 */
  whitelistCommands: string[]
  /** 通知方式 */
  notificationTypes: NotificationType[]
  /** 音量 */
  volume: number
  /** 提示音配置 */
  soundConfig: Record<SoundType, string>
  /** 自动保存 */
  autoSave: boolean
  /** 保存间隔（秒） */
  saveInterval: number
}

/**
 * 规则配置
 */
export interface RuleConfig {
  id: string
  name: string
  content: string
  scope: RuleScope
  enabled: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 技能配置
 */
export interface SkillConfig {
  id: string
  name: string
  description?: string
  content: string
  scope: SkillScope
  enabled: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * 导入设置
 */
export interface ImportSettings {
  /** 包含 AGENTS.md */
  includeAgentsMD: boolean
  /** 包含 CLAUDE.md */
  includeClaudeMD: boolean
  /** 包含项目配置 */
  includeProjectConfig: boolean
  /** 包含用户数据 */
  includeUserData: boolean
}

/**
 * 完整设置
 */
export interface Settings {
  /** 用户信息 */
  userProfile: UserProfile
  /** 通用设置 */
  general: GeneralSettings
  /** 智能体列表 */
  agents: AgentConfig[]
  /** MCP 列表 */
  mcpConfigs: MCPConfig[]
  /** 模型列表 */
  models: ModelConfig[]
  /** 上下文设置 */
  context: ContextSettings
  /** 对话流设置 */
  conversation: ConversationSettings
  /** 规则列表 */
  rules: RuleConfig[]
  /** 技能列表 */
  skills: SkillConfig[]
  /** 导入设置 */
  importSettings: ImportSettings
}

/**
 * 设置分类（用于侧边栏导航）
 */
export type SettingsCategory =
  | 'account'
  | 'general'
  | 'agents'
  | 'mcp'
  | 'models'
  | 'context'
  | 'conversation'
  | 'rules'
  | 'skills'
  | 'import-export'

/**
 * 设置分类元数据
 */
export interface SettingsCategoryMeta {
  id: SettingsCategory
  label: string
  icon: string
  description: string
}
