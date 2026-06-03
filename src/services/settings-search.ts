/**
 * @file services/settings-search.ts
 * @description YYC³ Settings Search Service - Advanced Search & Filter Logic
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,search,service,filter
 */

import type { Settings } from '../types/settings'

/**
 * 搜索结果项
 */
export interface SearchResult {
  /** 设置路径 */
  path: string
  /** 设置标题 */
  title: string
  /** 设置描述 */
  description?: string
  /** 设置值 */
  value: unknown
  /** 设置类型 */
  type: 'setting' | 'agent' | 'mcp' | 'model' | 'rule' | 'skill' | 'profile'
  /** 分类 */
  category: string
}

/**
 * 搜索设置
 * @param settings 完整设置对象
 * @param query 搜索查询字符串
 * @returns 搜索结果数组
 */
export function searchSettings(settings: Settings, query: string): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const results: SearchResult[] = []
  const lowerQuery = query.toLowerCase()

  // 搜索用户信息
  searchUserProfile(settings.userProfile, lowerQuery, results)

  // 搜索通用设置
  searchGeneralSettings(settings.general, lowerQuery, results)

  // 搜索智能体
  searchAgents(settings.agents, lowerQuery, results)

  // 搜索 MCP
  searchMCPs(settings.mcpConfigs, lowerQuery, results)

  // 搜索模型
  searchModels(settings.models, lowerQuery, results)

  // 搜索上下文设置
  searchContextSettings(settings.context, lowerQuery, results)

  // 搜索对话流设置
  searchConversationSettings(settings.conversation, lowerQuery, results)

  // 搜索规则
  searchRules(settings.rules, lowerQuery, results)

  // 搜索技能
  searchSkills(settings.skills, lowerQuery, results)

  return results
}

/**
 * 搜索用户信息
 */
function searchUserProfile(
  profile: Settings['userProfile'],
  query: string,
  results: SearchResult[],
): void {
  const fields: Array<{ key: keyof Settings['userProfile']; title: string }> = [
    { key: 'username', title: '用户名' },
    { key: 'email', title: '邮箱' },
    { key: 'bio', title: '个人简介' },
    { key: 'role', title: '角色' },
    { key: 'location', title: '位置' },
  ]

  fields.forEach(({ key, title }) => {
    const value = profile[key]
    if (value && (title.toLowerCase().includes(query) || value.toLowerCase().includes(query))) {
      results.push({
        path: `userProfile.${key}`,
        title,
        value,
        type: 'profile',
        category: '账号信息',
      })
    }
  })
}

/**
 * 搜索通用设置
 */
function searchGeneralSettings(
  general: Settings['general'],
  query: string,
  results: SearchResult[],
): void {
  const settingsMap: Record<string, { title: string; value: unknown; description?: string }> = {
    'general.theme': { title: '主题', value: general.theme, description: '界面主题风格' },
    'general.language': { title: '语言', value: general.language, description: '系统语言' },
    'general.editorFont': { title: '编辑器字体', value: general.editorFont },
    'general.editorFontSize': { title: '编辑器字体大小', value: general.editorFontSize },
    'general.wordWrap': { title: '自动换行', value: general.wordWrap },
    'general.keybindingScheme': { title: '快捷键方案', value: general.keybindingScheme },
    'general.localLinkOpenMode': { title: '本地链接打开方式', value: general.localLinkOpenMode },
    'general.markdownOpenMode': { title: 'Markdown 打开方式', value: general.markdownOpenMode },
    'general.nodeVersion': { title: 'Node.js 版本', value: general.nodeVersion },
    'general.enableAnimations': { title: '启用动画', value: general.enableAnimations },
    'general.enableSounds': { title: '启用音效', value: general.enableSounds },
  }

  for (const [path, info] of Object.entries(settingsMap)) {
    if (
      info.title.toLowerCase().includes(query) ||
      (info.description && info.description.toLowerCase().includes(query)) ||
      String(info.value).toLowerCase().includes(query)
    ) {
      results.push({
        path,
        title: info.title,
        description: info.description,
        value: info.value,
        type: 'setting',
        category: '通用设置',
      })
    }
  }
}

/**
 * 搜索智能体
 */
function searchAgents(agents: Settings['agents'], query: string, results: SearchResult[]): void {
  for (const agent of agents) {
    if (
      agent.name.toLowerCase().includes(query) ||
      (agent.description && agent.description.toLowerCase().includes(query)) ||
      agent.model.toLowerCase().includes(query)
    ) {
      results.push({
        path: `agents.${agent.id}`,
        title: agent.name,
        description: agent.description,
        value: agent,
        type: 'agent',
        category: '智能体',
      })
    }
  }
}

/**
 * 搜索 MCP
 */
function searchMCPs(
  mcpConfigs: Settings['mcpConfigs'],
  query: string,
  results: SearchResult[],
): void {
  for (const mcp of mcpConfigs) {
    if (
      mcp.name.toLowerCase().includes(query) ||
      (mcp.description && mcp.description.toLowerCase().includes(query)) ||
      (mcp.endpoint && mcp.endpoint.toLowerCase().includes(query))
    ) {
      results.push({
        path: `mcp.${mcp.id}`,
        title: mcp.name,
        description: mcp.description,
        value: mcp,
        type: 'mcp',
        category: 'MCP 连接',
      })
    }
  }
}

/**
 * 搜索模型
 */
function searchModels(models: Settings['models'], query: string, results: SearchResult[]): void {
  for (const model of models) {
    if (
      model.provider.toLowerCase().includes(query) ||
      model.model.toLowerCase().includes(query) ||
      (model.baseUrl && model.baseUrl.toLowerCase().includes(query))
    ) {
      results.push({
        path: `models.${model.id}`,
        title: `${model.provider} - ${model.model}`,
        value: model,
        type: 'model',
        category: '模型配置',
      })
    }
  }
}

/**
 * 搜索上下文设置
 */
function searchContextSettings(
  context: Settings['context'],
  query: string,
  results: SearchResult[],
): void {
  const settingsMap: Record<string, { title: string; value: unknown; description?: string }> = {
    'context.indexStatus': { title: '代码索引状态', value: context.indexStatus },
    'context.autoIndex': { title: '自动索引', value: context.autoIndex },
    'context.indexDepth': { title: '索引深度', value: context.indexDepth },
  }

  for (const [path, info] of Object.entries(settingsMap)) {
    if (info.title.toLowerCase().includes(query)) {
      results.push({
        path,
        title: info.title,
        description: info.description,
        value: info.value,
        type: 'setting',
        category: '上下文管理',
      })
    }
  }

  // 搜索文档集
  for (const docSet of context.documentSets) {
    if (
      docSet.name.toLowerCase().includes(query) ||
      (docSet.description && docSet.description.toLowerCase().includes(query))
    ) {
      results.push({
        path: `context.documentSets.${docSet.id}`,
        title: docSet.name,
        description: docSet.description,
        value: docSet,
        type: 'setting',
        category: '文档集',
      })
    }
  }
}

/**
 * 搜索对话流设置
 */
function searchConversationSettings(
  conversation: Settings['conversation'],
  query: string,
  results: SearchResult[],
): void {
  const settingsMap: Record<string, { title: string; value: unknown; description?: string }> = {
    'conversation.useTodoList': { title: '使用待办清单', value: conversation.useTodoList },
    'conversation.autoCollapseNodes': {
      title: '自动折叠对话节点',
      value: conversation.autoCollapseNodes,
    },
    'conversation.autoFixCodeIssues': {
      title: '自动修复代码规范问题',
      value: conversation.autoFixCodeIssues,
    },
    'conversation.agentProactiveQuestion': {
      title: '智能体主动提问',
      value: conversation.agentProactiveQuestion,
    },
    'conversation.codeReviewScope': { title: '代码审查范围', value: conversation.codeReviewScope },
    'conversation.jumpAfterReview': { title: '审查后跳转', value: conversation.jumpAfterReview },
    'conversation.autoRunMCP': { title: '自动运行 MCP', value: conversation.autoRunMCP },
    'conversation.commandRunMode': { title: '命令运行方式', value: conversation.commandRunMode },
    'conversation.autoSave': { title: '自动保存', value: conversation.autoSave },
    'conversation.volume': { title: '音量', value: conversation.volume },
  }

  for (const [path, info] of Object.entries(settingsMap)) {
    if (
      info.title.toLowerCase().includes(query) ||
      String(info.value).toLowerCase().includes(query)
    ) {
      results.push({
        path,
        title: info.title,
        description: info.description,
        value: info.value,
        type: 'setting',
        category: '对话流设置',
      })
    }
  }
}

/**
 * 搜索规则
 */
function searchRules(rules: Settings['rules'], query: string, results: SearchResult[]): void {
  for (const rule of rules) {
    if (
      rule.name.toLowerCase().includes(query) ||
      (rule.description && rule.description.toLowerCase().includes(query)) ||
      rule.content.toLowerCase().includes(query)
    ) {
      results.push({
        path: `rules.${rule.id}`,
        title: rule.name,
        description: rule.description,
        value: rule,
        type: 'rule',
        category: '规则管理',
      })
    }
  }
}

/**
 * 搜索技能
 */
function searchSkills(skills: Settings['skills'], query: string, results: SearchResult[]): void {
  for (const skill of skills) {
    if (
      skill.name.toLowerCase().includes(query) ||
      (skill.description && skill.description.toLowerCase().includes(query)) ||
      skill.content.toLowerCase().includes(query)
    ) {
      results.push({
        path: `skills.${skill.id}`,
        title: skill.name,
        description: skill.description,
        value: skill,
        type: 'skill',
        category: '技能管理',
      })
    }
  }
}
