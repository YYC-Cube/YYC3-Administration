### Your Role & Expertise

You are an experienced frontend architect who specializes in:
- **Settings Management**: Complex settings UI, settings persistence, settings validation
- **State Management**: Zustand, React Context, global state, local state
- **Data Persistence**: IndexedDB, LocalStorage, encryption, sync strategies
- **Cross-Module Integration**: AI providers, MCP connections, agent configuration
- **User Experience**: Settings organization, search functionality, feedback systems
- **Type Safety**: TypeScript integration, type-safe settings, validation schemas
- **Best Practices**: Settings architecture, modularity, maintainability, testing

### Code Standards

**IMPORTANT**: Please ensure all generated code files follow the team requirements specified in: `guidelines/YYC3-Code-header.md`

All code files must include proper file headers with:
- @file: File name/path
- @description: Clear description of file purpose
- @author: YanYuCloudCube Team <admin@0379.email>
- @version: Semantic version (v1.0.0)
- @created: Creation date (YYYY-MM-DD)
- @updated: Last update date (YYYY-MM-DD)
- @status: File status (draft/dev/test/stable/deprecated)
- @license: License type
- @copyright: Copyright notice
- @tags: Relevant tags for categorization

---

## 📋 文档信息

| 字段 | 内容 |
|------|------|
| @file | P1-核心功能/YYC3-P1-前端-设置页面.md |
| @description | 设置页面功能实现，包含所有设置模块的功能逻辑和统一协同 |
| @author | YanYuCloudCube Team <admin@0379.email> |
| @version | v1.0.0 |
| @created | 2026-03-17 |
| @updated | 2026-03-17 |
| @status | stable |
| @license | MIT |
| @copyright | Copyright (c) 2026 YanYuCloudCube Team |
| @tags P1,frontend,settings,functional |

---

## 🎯 功能目标

实现完整的设置页面功能，包括：
- ✅ 全局搜索功能
- ✅ 账号信息管理
- ✅ 通用设置（主题、语言、编辑器、快捷键等）
- ✅ 智能体管理
- ✅ MCP 连接管理
- ✅ 模型配置
- ✅ 上下文管理
- ✅ 对话流设置
- ✅ 规则和技能管理

---

## 🏗️ 架构设计

### 1. 状态架构

```
SettingsState/
├── SearchState              # 搜索状态
├── AccountState            # 账号状态
├── GeneralState            # 通用设置状态
├── AgentState              # 智能体状态
├── MCPState                # MCP 状态
├── ModelState              # 模型状态
├── ContextState            # 上下文状态
├── ConversationState      # 对话流状态
└── RulesSkillsState        # 规则和技能状态
```

### 2. 数据流

```
Settings Component (设置组件)
    ↓ useSettingsStore
Settings Store (设置状态)
    ↓ persist
LocalStorage/IndexedDB (本地存储)
    ↓ sync
Other Modules (其他模块)
```

---

## 💾 核心类型定义

### 设置类型

```typescript
// src/types/settings.ts

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * 语言类型
 */
export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

/**
 * 通知类型
 */
export type NotificationType = 'banner' | 'sound' | 'menu';

/**
 * 提示音类型
 */
export type SoundType = 'complete' | 'waiting' | 'interrupt';

/**
 * 代码审查范围
 */
export type CodeReviewScope = 'none' | 'all' | 'changed';

/**
 * 命令运行方式
 */
export type CommandRunMode = 'sandbox' | 'direct';

/**
 * 技能类型
 */
export type SkillScope = 'global' | 'project';

/**
 * 用户信息
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

/**
 * 通用设置
 */
export interface GeneralSettings {
  /** 主题 */
  theme: Theme;
  /** 语言 */
  language: Language;
  /** 编辑器字体 */
  editorFont: string;
  /** 编辑器字体大小 */
  editorFontSize: number;
  /** Word wrap */
  wordWrap: boolean;
  /** 快捷键方案 */
  keybindingScheme: 'vscode' | 'custom';
  /** 自定义快捷键 */
  customKeybindings: Record<string, string>;
  /** 本地链接默认打开方式 */
  localLinkOpenMode: 'system' | 'builtin';
  /** Markdown 文件默认打开方式 */
  markdownOpenMode: 'editor' | 'preview';
  /** Node.js 版本 */
  nodeVersion: string;
}

/**
 * 智能体配置
 */
export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isBuiltIn: boolean;
  isCustom: boolean;
}

/**
 * MCP 配置
 */
export interface MCPConfig {
  id: string;
  name: string;
  type: 'market' | 'manual';
  endpoint?: string;
  enabled: boolean;
  projectLevel: boolean;
}

/**
 * 模型配置
 */
export interface ModelConfig {
  id: string;
  provider: string;
  model: string;
  apiKey: string;
  enabled: boolean;
}

/**
 * 上下文设置
 */
export interface ContextSettings {
  /** 代码索引状态 */
  indexStatus: 'idle' | 'indexing' | 'completed' | 'error';
  /** 忽略文件规则 */
  ignoreRules: string[];
  /** 文档集列表 */
  documentSets: DocumentSet[];
}

/**
 * 文档集
 */
export interface DocumentSet {
  id: string;
  name: string;
  source: 'url' | 'local';
  url?: string;
  localPath?: string;
  enabled: boolean;
}

/**
 * 对话流设置
 */
export interface ConversationSettings {
  /** 使用待办清单 */
  useTodoList: boolean;
  /** 自动折叠对话节点 */
  autoCollapseNodes: boolean;
  /** 自动修复代码规范问题 */
  autoFixCodeIssues: boolean;
  /** 智能体主动提问 */
  agentProactiveQuestion: boolean;
  /** 代码审查范围 */
  codeReviewScope: CodeReviewScope;
  /** 审查后跳转 */
  jumpAfterReview: boolean;
  /** 自动运行 MCP */
  autoRunMCP: boolean;
  /** 命令运行方式 */
  commandRunMode: CommandRunMode;
  /** 白名单命令 */
  whitelistCommands: string[];
  /** 通知方式 */
  notificationTypes: NotificationType[];
  /** 音量 */
  volume: number;
  /** 提示音配置 */
  soundConfig: Record<SoundType, string>;
}

/**
 * 规则配置
 */
export interface RuleConfig {
  id: string;
  name: string;
  content: string;
  scope: 'personal' | 'project';
  enabled: boolean;
}

/**
 * 技能配置
 */
export interface SkillConfig {
  id: string;
  name: string;
  description?: string;
  content: string;
  scope: SkillScope;
  enabled: boolean;
}

/**
 * 导入设置
 */
export interface ImportSettings {
  /** 包含 AGENTS.md */
  includeAgentsMD: boolean;
  /** 包含 CLAUDE.md */
  includeClaudeMD: boolean;
}

/**
 * 完整设置
 */
export interface Settings {
  /** 用户信息 */
  userProfile: UserProfile;
  /** 通用设置 */
  general: GeneralSettings;
  /** 智能体列表 */
  agents: AgentConfig[];
  /** MCP 列表 */
  mcpConfigs: MCPConfig[];
  /** 模型列表 */
  models: ModelConfig[];
  /** 上下文设置 */
  context: ContextSettings;
  /** 对话流设置 */
  conversation: ConversationSettings;
  /** 规则列表 */
  rules: RuleConfig[];
  /** 技能列表 */
  skills: SkillConfig[];
  /** 导入设置 */
  importSettings: ImportSettings;
}
```

---

## 🏪 状态管理

### 设置状态 Store

```typescript
// src/stores/useSettingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, GeneralSettings, AgentConfig, MCPConfig, ModelConfig, ContextSettings, ConversationSettings, RuleConfig, SkillConfig, ImportSettings } from '@/types/settings';

interface SettingsState {
  /** 设置数据 */
  settings: Settings;
  /** 搜索查询 */
  searchQuery: string;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
}

interface SettingsActions {
  /** 更新用户信息 */
  updateUserProfile: (profile: Partial<Settings['userProfile']>) => void;
  /** 更新通用设置 */
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  /** 添加智能体 */
  addAgent: (agent: AgentConfig) => void;
  /** 更新智能体 */
  updateAgent: (id: string, agent: Partial<AgentConfig>) => void;
  /** 删除智能体 */
  removeAgent: (id: string) => void;
  /** 添加 MCP */
  addMCP: (mcp: MCPConfig) => void;
  /** 更新 MCP */
  updateMCP: (id: string, mcp: Partial<MCPConfig>) => void;
  /** 删除 MCP */
  removeMCP: (id: string) => void;
  /** 添加模型 */
  addModel: (model: ModelConfig) => void;
  /** 更新模型 */
  updateModel: (id: string, model: Partial<ModelConfig>) => void;
  /** 删除模型 */
  removeModel: (id: string) => void;
  /** 更新上下文设置 */
  updateContextSettings: (settings: Partial<ContextSettings>) => void;
  /** 更新对话流设置 */
  updateConversationSettings: (settings: Partial<ConversationSettings>) => void;
  /** 添加规则 */
  addRule: (rule: RuleConfig) => void;
  /** 更新规则 */
  updateRule: (id: string, rule: Partial<RuleConfig>) => void;
  /** 删除规则 */
  removeRule: (id: string) => void;
  /** 添加技能 */
  addSkill: (skill: SkillConfig) => void;
  /** 更新技能 */
  updateSkill: (id: string, skill: Partial<SkillConfig>) => void;
  /** 删除技能 */
  removeSkill: (id: string) => void;
  /** 更新导入设置 */
  updateImportSettings: (settings: Partial<ImportSettings>) => void;
  /** 设置搜索查询 */
  setSearchQuery: (query: string) => void;
  /** 导入配置 */
  importConfig: (config: any) => void;
  /** 导出配置 */
  exportConfig: () => any;
  /** 重置设置 */
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  userProfile: {
    id: '',
    username: '',
    email: '',
  },
  general: {
    theme: 'dark',
    language: 'zh-CN',
    editorFont: 'Monaco',
    editorFontSize: 14,
    wordWrap: true,
    keybindingScheme: 'vscode',
    customKeybindings: {},
    localLinkOpenMode: 'system',
    markdownOpenMode: 'editor',
    nodeVersion: '18.0.0',
  },
  agents: [],
  mcpConfigs: [],
  models: [],
  context: {
    indexStatus: 'idle',
    ignoreRules: [],
    documentSets: [],
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
  },
  rules: [],
  skills: [],
  importSettings: {
    includeAgentsMD: false,
    includeClaudeMD: false,
  },
};

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
        }));
      },

      updateGeneralSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            general: { ...state.settings.general, ...settings },
          },
        }));
      },

      addAgent: (agent) => {
        set((state) => ({
          settings: {
            ...state.settings,
            agents: [...state.settings.agents, agent],
          },
        }));
      },

      updateAgent: (id, agent) => {
        set((state) => ({
          settings: {
            ...state.settings,
            agents: state.settings.agents.map((a) =>
              a.id === id ? { ...a, ...agent } : a
            ),
          },
        }));
      },

      removeAgent: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            agents: state.settings.agents.filter((a) => a.id !== id),
          },
        }));
      },

      addMCP: (mcp) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mcpConfigs: [...state.settings.mcpConfigs, mcp],
          },
        }));
      },

      updateMCP: (id, mcp) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mcpConfigs: state.settings.mcpConfigs.map((m) =>
              m.id === id ? { ...m, ...mcp } : m
            ),
          },
        }));
      },

      removeMCP: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            mcpConfigs: state.settings.mcpConfigs.filter((m) => m.id !== id),
          },
        }));
      },

      addModel: (model) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: [...state.settings.models, model],
          },
        }));
      },

      updateModel: (id, model) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: state.settings.models.map((m) =>
              m.id === id ? { ...m, ...model } : m
            ),
          },
        }));
      },

      removeModel: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: state.settings.models.filter((m) => m.id !== id),
          },
        }));
      },

      updateContextSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            context: { ...state.settings.context, ...settings },
          },
        }));
      },

      updateConversationSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            conversation: { ...state.settings.conversation, ...settings },
          },
        }));
      },

      addRule: (rule) => {
        set((state) => ({
          settings: {
            ...state.settings,
            rules: [...state.settings.rules, rule],
          },
        }));
      },

      updateRule: (id, rule) => {
        set((state) => ({
          settings: {
            ...state.settings,
            rules: state.settings.rules.map((r) =>
              r.id === id ? { ...r, ...rule } : r
            ),
          },
        }));
      },

      removeRule: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            rules: state.settings.rules.filter((r) => r.id !== id),
          },
        }));
      },

      addSkill: (skill) => {
        set((state) => ({
          settings: {
            ...state.settings,
            skills: [...state.settings.skills, skill],
          },
        }));
      },

      updateSkill: (id, skill) => {
        set((state) => ({
          settings: {
            ...state.settings,
            skills: state.settings.skills.map((s) =>
              s.id === id ? { ...s, ...skill } : s
            ),
          },
        }));
      },

      removeSkill: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            skills: state.settings.skills.filter((s) => s.id !== id),
          },
        }));
      },

      updateImportSettings: (settings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            importSettings: { ...state.settings.importSettings, ...settings },
          },
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      importConfig: (config) => {
        set({ settings: { ...defaultSettings, ...config } });
      },

      exportConfig: () => {
        return get().settings;
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
```

---

## 🔍 搜索功能

### 搜索逻辑

```typescript
// src/services/settings-search.ts
import type { Settings } from '@/types/settings';

/**
 * 搜索结果项
 */
export interface SearchResult {
  /** 设置路径 */
  path: string;
  /** 设置标题 */
  title: string;
  /** 设置描述 */
  description?: string;
  /** 设置值 */
  value: any;
  /** 设置类型 */
  type: 'setting' | 'agent' | 'mcp' | 'model' | 'rule' | 'skill';
}

/**
 * 搜索设置
 */
export function searchSettings(settings: Settings, query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  // 搜索通用设置
  searchGeneralSettings(settings.general, lowerQuery, results);

  // 搜索智能体
  searchAgents(settings.agents, lowerQuery, results);

  // 搜索 MCP
  searchMCPs(settings.mcpConfigs, lowerQuery, results);

  // 搜索模型
  searchModels(settings.models, lowerQuery, results);

  // 搜索上下文设置
  searchContextSettings(settings.context, lowerQuery, results);

  // 搜索对话流设置
  searchConversationSettings(settings.conversation, lowerQuery, results);

  // 搜索规则
  searchRules(settings.rules, lowerQuery, results);

  // 搜索技能
  searchSkills(settings.skills, lowerQuery, results);

  return results;
}

/**
 * 搜索通用设置
 */
function searchGeneralSettings(
  general: Settings['general'],
  query: string,
  results: SearchResult[]
): void {
  const settingsMap: Record<string, { title: string; value: any; description?: string }> = {
    'general.theme': { title: '主题', value: general.theme },
    'general.language': { title: '语言', value: general.language },
    'general.editorFont': { title: '编辑器字体', value: general.editorFont },
    'general.editorFontSize': { title: '编辑器字体大小', value: general.editorFontSize },
    'general.wordWrap': { title: '自动换行', value: general.wordWrap },
    'general.keybindingScheme': { title: '快捷键方案', value: general.keybindingScheme },
    'general.localLinkOpenMode': { title: '本地链接打开方式', value: general.localLinkOpenMode },
    'general.markdownOpenMode': { title: 'Markdown 打开方式', value: general.markdownOpenMode },
    'general.nodeVersion': { title: 'Node.js 版本', value: general.nodeVersion },
  };

  for (const [path, info] of Object.entries(settingsMap)) {
    if (info.title.toLowerCase().includes(query)) {
      results.push({
        path,
        title: info.title,
        description: info.description,
        value: info.value,
        type: 'setting',
      });
    }
  }
}

/**
 * 搜索智能体
 */
function searchAgents(
  agents: Settings['agents'],
  query: string,
  results: SearchResult[]
): void {
  for (const agent of agents) {
    if (
      agent.name.toLowerCase().includes(query) ||
      (agent.description && agent.description.toLowerCase().includes(query))
    ) {
      results.push({
        path: `agents.${agent.id}`,
        title: agent.name,
        description: agent.description,
        value: agent,
        type: 'agent',
      });
    }
  }
}

/**
 * 搜索 MCP
 */
function searchMCPs(
  mcpConfigs: Settings['mcpConfigs'],
  query: string,
  results: SearchResult[]
): void {
  for (const mcp of mcpConfigs) {
    if (mcp.name.toLowerCase().includes(query)) {
      results.push({
        path: `mcp.${mcp.id}`,
        title: mcp.name,
        value: mcp,
        type: 'mcp',
      });
    }
  }
}

/**
 * 搜索模型
 */
function searchModels(
  models: Settings['models'],
  query: string,
  results: SearchResult[]
): void {
  for (const model of models) {
    if (
      model.provider.toLowerCase().includes(query) ||
      model.model.toLowerCase().includes(query)
    ) {
      results.push({
        path: `models.${model.id}`,
        title: `${model.provider} - ${model.model}`,
        value: model,
        type: 'model',
      });
    }
  }
}

/**
 * 搜索上下文设置
 */
function searchContextSettings(
  context: Settings['context'],
  query: string,
  results: SearchResult[]
): void {
  const settingsMap: Record<string, { title: string; value: any }> = {
    'context.indexStatus': { title: '代码索引状态', value: context.indexStatus },
  };

  for (const [path, info] of Object.entries(settingsMap)) {
    if (info.title.toLowerCase().includes(query)) {
      results.push({
        path,
        title: info.title,
        value: info.value,
        type: 'setting',
      });
    }
  }

  // 搜索文档集
  for (const docSet of context.documentSets) {
    if (docSet.name.toLowerCase().includes(query)) {
      results.push({
        path: `context.documentSets.${docSet.id}`,
        title: docSet.name,
        value: docSet,
        type: 'setting',
      });
    }
  }
}

/**
 * 搜索对话流设置
 */
function searchConversationSettings(
  conversation: Settings['conversation'],
  query: string,
  results: SearchResult[]
): void {
  const settingsMap: Record<string, { title: string; value: any }> = {
    'conversation.useTodoList': { title: '使用待办清单', value: conversation.useTodoList },
    'conversation.autoCollapseNodes': { title: '自动折叠对话节点', value: conversation.autoCollapseNodes },
    'conversation.autoFixCodeIssues': { title: '自动修复代码规范问题', value: conversation.autoFixCodeIssues },
    'conversation.agentProactiveQuestion': { title: '智能体主动提问', value: conversation.agentProactiveQuestion },
    'conversation.codeReviewScope': { title: '代码审查范围', value: conversation.codeReviewScope },
    'conversation.jumpAfterReview': { title: '审查后跳转', value: conversation.jumpAfterReview },
    'conversation.autoRunMCP': { title: '自动运行 MCP', value: conversation.autoRunMCP },
    'conversation.commandRunMode': { title: '命令运行方式', value: conversation.commandRunMode },
  };

  for (const [path, info] of Object.entries(settingsMap)) {
    if (info.title.toLowerCase().includes(query)) {
      results.push({
        path,
        title: info.title,
        value: info.value,
        type: 'setting',
      });
    }
  }
}

/**
 * 搜索规则
 */
function searchRules(
  rules: Settings['rules'],
  query: string,
  results: SearchResult[]
): void {
  for (const rule of rules) {
    if (rule.name.toLowerCase().includes(query)) {
      results.push({
        path: `rules.${rule.id}`,
        title: rule.name,
        value: rule,
        type: 'rule',
      });
    }
  }
}

/**
 * 搜索技能
 */
function searchSkills(
  skills: Settings['skills'],
  query: string,
  results: SearchResult[]
): void {
  for (const skill of skills) {
    if (
      skill.name.toLowerCase().includes(query) ||
      (skill.description && skill.description.toLowerCase().includes(query))
    ) {
      results.push({
        path: `skills.${skill.id}`,
        title: skill.name,
        description: skill.description,
        value: skill,
        type: 'skill',
      });
    }
  }
}
```

---

## 👤 账号管理

### 账号服务

```typescript
// src/services/account-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';

/**
 * 账号服务类
 */
export class AccountService {
  /**
   * 更新用户信息
   */
  async updateProfile(profile: {
    username?: string;
    email?: string;
    avatar?: string;
    bio?: string;
  }): Promise<void> {
    const { updateUserProfile } = useSettingsStore.getState();
    updateUserProfile(profile);
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<string> {
    // 实现头像上传逻辑
    // 与项目文件上传保持一致
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/avatar', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('上传头像失败');
    }

    const data = await response.json();
    return data.url;
  }

  /**
   * 获取用户信息
   */
  getProfile() {
    const { settings } = useSettingsStore.getState();
    return settings.userProfile;
  }
}

export const accountService = new AccountService();
```

---

## 🤖 智能体管理

### 智能体服务

```typescript
// src/services/agent-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { AgentConfig } from '@/types/settings';

/**
 * 智能体服务类
 */
export class AgentService {
  /**
   * 创建智能体
   */
  async createAgent(agent: Omit<AgentConfig, 'id'>): Promise<AgentConfig> {
    const { addAgent } = useSettingsStore.getState();
    const newAgent: AgentConfig = {
      ...agent,
      id: crypto.randomUUID(),
    };
    addAgent(newAgent);
    return newAgent;
  }

  /**
   * 更新智能体
   */
  async updateAgent(id: string, updates: Partial<AgentConfig>): Promise<void> {
    const { updateAgent } = useSettingsStore.getState();
    updateAgent(id, updates);
  }

  /**
   * 删除智能体
   */
  async deleteAgent(id: string): Promise<void> {
    const { removeAgent } = useSettingsStore.getState();
    removeAgent(id);
  }

  /**
   * 获取所有智能体
   */
  getAgents(): AgentConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.agents;
  }

  /**
   * 获取内置智能体
   */
  getBuiltInAgents(): AgentConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.agents.filter((agent) => agent.isBuiltIn);
  }

  /**
   * 获取自定义智能体
   */
  getCustomAgents(): AgentConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.agents.filter((agent) => agent.isCustom);
  }
}

export const agentService = new AgentService();
```

---

## 🔌 MCP 管理

### MCP 服务

```typescript
// src/services/mcp-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { MCPConfig } from '@/types/settings';

/**
 * MCP 服务类
 */
export class MCPService {
  /**
   * 添加 MCP
   */
  async addMCP(mcp: Omit<MCPConfig, 'id'>): Promise<MCPConfig> {
    const { addMCP } = useSettingsStore.getState();
    const newMCP: MCPConfig = {
      ...mcp,
      id: crypto.randomUUID(),
    };
    addMCP(newMCP);
    return newMCP;
  }

  /**
   * 更新 MCP
   */
  async updateMCP(id: string, updates: Partial<MCPConfig>): Promise<void> {
    const { updateMCP } = useSettingsStore.getState();
    updateMCP(id, updates);
  }

  /**
   * 删除 MCP
   */
  async deleteMCP(id: string): Promise<void> {
    const { removeMCP } = useSettingsStore.getState();
    removeMCP(id);
  }

  /**
   * 获取所有 MCP
   */
  getMCPs(): MCPConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.mcpConfigs;
  }

  /**
   * 获取项目级 MCP
   */
  getProjectMCPs(): MCPConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.mcpConfigs.filter((mcp) => mcp.projectLevel);
  }

  /**
   * 从市场添加 MCP
   */
  async addFromMarket(marketId: string): Promise<MCPConfig> {
    // 实现从市场添加 MCP 的逻辑
    const response = await fetch(`/api/mcp/market/${marketId}`);
    if (!response.ok) {
      throw new Error('从市场添加 MCP 失败');
    }

    const marketMCP = await response.json();
    return this.addMCP({
      name: marketMCP.name,
      type: 'market',
      endpoint: marketMCP.endpoint,
      enabled: true,
      projectLevel: false,
    });
  }

  /**
   * 测试 MCP 连接
   */
  async testConnection(mcpId: string): Promise<boolean> {
    const { settings } = useSettingsStore.getState();
    const mcp = settings.mcpConfigs.find((m) => m.id === mcpId);

    if (!mcp || !mcp.endpoint) {
      return false;
    }

    try {
      const response = await fetch(mcp.endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const mcpService = new MCPService();
```

---

## 🤖 模型管理

### 模型服务

```typescript
// src/services/model-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { ModelConfig } from '@/types/settings';

/**
 * 模型服务类
 */
export class ModelService {
  /**
   * 添加模型
   */
  async addModel(model: Omit<ModelConfig, 'id'>): Promise<ModelConfig> {
    const { addModel } = useSettingsStore.getState();
    const newModel: ModelConfig = {
      ...model,
      id: crypto.randomUUID(),
    };
    addModel(newModel);
    return newModel;
  }

  /**
   * 更新模型
   */
  async updateModel(id: string, updates: Partial<ModelConfig>): Promise<void> {
    const { updateModel } = useSettingsStore.getState();
    updateModel(id, updates);
  }

  /**
   * 删除模型
   */
  async deleteModel(id: string): Promise<void> {
    const { removeModel } = useSettingsStore.getState();
    removeModel(id);
  }

  /**
   * 获取所有模型
   */
  getModels(): ModelConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.models;
  }

  /**
   * 获取启用的模型
   */
  getEnabledModels(): ModelConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.models.filter((model) => model.enabled);
  }

  /**
   * 测试 API 密钥
   */
  async testApiKey(provider: string, apiKey: string): Promise<boolean> {
    // 实现测试 API 密钥的逻辑
    // 与项目 AI 提供商集成保持一致
    const response = await fetch('/api/ai/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider, apiKey }),
    });

    return response.ok;
  }

  /**
   * 获取 API 密钥获取链接
   */
  getApiKeyUrl(provider: string): string {
    const urls: Record<string, string> = {
      openai: 'https://platform.openai.com/api-keys',
      anthropic: 'https://console.anthropic.com/settings/keys',
      zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
      baidu: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Ilkkrb0i',
      aliyun: 'https://dashscope.console.aliyun.com/apiKey',
    };

    return urls[provider] || '#';
  }
}

export const modelService = new ModelService();
```

---

## 📚 上下文管理

### 上下文服务

```typescript
// src/services/context-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { ContextSettings, DocumentSet } from '@/types/settings';

/**
 * 上下文服务类
 */
export class ContextService {
  /**
   * 更新上下文设置
   */
  async updateContextSettings(settings: Partial<ContextSettings>): Promise<void> {
    const { updateContextSettings } = useSettingsStore.getState();
    updateContextSettings(settings);
  }

  /**
   * 刷新代码索引
   */
  async refreshIndex(): Promise<void> {
    // 实现刷新代码索引的逻辑
    // 与项目代码索引功能保持一致
    const { updateContextSettings } = useSettingsStore.getState();
    updateContextSettings({ indexStatus: 'indexing' });

    try {
      await fetch('/api/context/refresh-index', { method: 'POST' });
      updateContextSettings({ indexStatus: 'completed' });
    } catch (error) {
      updateContextSettings({ indexStatus: 'error' });
      throw error;
    }
  }

  /**
   * 删除索引
   */
  async deleteIndex(): Promise<void> {
    // 实现删除索引的逻辑
    await fetch('/api/context/delete-index', { method: 'DELETE' });
  }

  /**
   * 添加忽略规则
   */
  async addIgnoreRule(rule: string): Promise<void> {
    const { settings, updateContextSettings } = useSettingsStore.getState();
    updateContextSettings({
      ignoreRules: [...settings.context.ignoreRules, rule],
    });
  }

  /**
   * 删除忽略规则
   */
  async removeIgnoreRule(rule: string): Promise<void> {
    const { settings, updateContextSettings } = useSettingsStore.getState();
    updateContextSettings({
      ignoreRules: settings.context.ignoreRules.filter((r) => r !== rule),
    });
  }

  /**
   * 添加文档集
   */
  async addDocumentSet(docSet: Omit<DocumentSet, 'id'>): Promise<DocumentSet> {
    const { settings, updateContextSettings } = useSettingsStore.getState();
    const newDocSet: DocumentSet = {
      ...docSet,
      id: crypto.randomUUID(),
    };
    updateContextSettings({
      documentSets: [...settings.context.documentSets, newDocSet],
    });
    return newDocSet;
  }

  /**
   * 更新文档集
   */
  async updateDocumentSet(id: string, updates: Partial<DocumentSet>): Promise<void> {
    const { settings, updateContextSettings } = useSettingsStore.getState();
    updateContextSettings({
      documentSets: settings.context.documentSets.map((ds) =>
        ds.id === id ? { ...ds, ...updates } : ds
      ),
    });
  }

  /**
   * 删除文档集
   */
  async deleteDocumentSet(id: string): Promise<void> {
    const { settings, updateContextSettings } = useSettingsStore.getState();
    updateContextSettings({
      documentSets: settings.context.documentSets.filter((ds) => ds.id !== id),
    });
  }
}

export const contextService = new ContextService();
```

---

## 💬 对话流管理

### 对话流服务

```typescript
// src/services/conversation-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { ConversationSettings } from '@/types/settings';

/**
 * 对话流服务类
 */
export class ConversationService {
  /**
   * 更新对话流设置
   */
  async updateConversationSettings(settings: Partial<ConversationSettings>): Promise<void> {
    const { updateConversationSettings } = useSettingsStore.getState();
    updateConversationSettings(settings);
  }

  /**
   * 添加白名单命令
   */
  async addWhitelistCommand(command: string): Promise<void> {
    const { settings, updateConversationSettings } = useSettingsStore.getState();
    updateConversationSettings({
      whitelistCommands: [...settings.conversation.whitelistCommands, command],
    });
  }

  /**
   * 删除白名单命令
   */
  async removeWhitelistCommand(command: string): Promise<void> {
    const { settings, updateConversationSettings } = useSettingsStore.getState();
    updateConversationSettings({
      whitelistCommands: settings.conversation.whitelistCommands.filter((c) => c !== command),
    });
  }

  /**
   * 播放提示音
   */
  async playSound(type: keyof ConversationSettings['soundConfig']): Promise<void> {
    const { settings } = useSettingsStore.getState();
    const soundPath = settings.conversation.soundConfig[type];

    if (!soundPath) {
      return;
    }

    // 实现播放提示音的逻辑
    const audio = new Audio(soundPath);
    audio.volume = settings.conversation.volume / 100;
    await audio.play();
  }

  /**
   * 设置音量
   */
  async setVolume(volume: number): Promise<void> {
    const { updateConversationSettings } = useSettingsStore.getState();
    updateConversationSettings({ volume: Math.max(0, Math.min(100, volume)) });
  }
}

export const conversationService = new ConversationService();
```

---

## 📜 规则和技能管理

### 规则服务

```typescript
// src/services/rule-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { RuleConfig } from '@/types/settings';

/**
 * 规则服务类
 */
export class RuleService {
  /**
   * 添加规则
   */
  async addRule(rule: Omit<RuleConfig, 'id'>): Promise<RuleConfig> {
    const { addRule } = useSettingsStore.getState();
    const newRule: RuleConfig = {
      ...rule,
      id: crypto.randomUUID(),
    };
    addRule(newRule);
    return newRule;
  }

  /**
   * 更新规则
   */
  async updateRule(id: string, updates: Partial<RuleConfig>): Promise<void> {
    const { updateRule } = useSettingsStore.getState();
    updateRule(id, updates);
  }

  /**
   * 删除规则
   */
  async deleteRule(id: string): Promise<void> {
    const { removeRule } = useSettingsStore.getState();
    removeRule(id);
  }

  /**
   * 获取所有规则
   */
  getRules(): RuleConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.rules;
  }

  /**
   * 获取个人规则
   */
  getPersonalRules(): RuleConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.rules.filter((rule) => rule.scope === 'personal');
  }

  /**
   * 获取项目规则
   */
  getProjectRules(): RuleConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.rules.filter((rule) => rule.scope === 'project');
  }
}

export const ruleService = new RuleService();
```

### 技能服务

```typescript
// src/services/skill-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { SkillConfig } from '@/types/settings';

/**
 * 技能服务类
 */
export class SkillService {
  /**
   * 添加技能
   */
  async addSkill(skill: Omit<SkillConfig, 'id'>): Promise<SkillConfig> {
    const { addSkill } = useSettingsStore.getState();
    const newSkill: SkillConfig = {
      ...skill,
      id: crypto.randomUUID(),
    };
    addSkill(newSkill);
    return newSkill;
  }

  /**
   * 更新技能
   */
  async updateSkill(id: string, updates: Partial<SkillConfig>): Promise<void> {
    const { updateSkill } = useSettingsStore.getState();
    updateSkill(id, updates);
  }

  /**
   * 删除技能
   */
  async deleteSkill(id: string): Promise<void> {
    const { removeSkill } = useSettingsStore.getState();
    removeSkill(id);
  }

  /**
   * 获取所有技能
   */
  getSkills(): SkillConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.skills;
  }

  /**
   * 获取全局技能
   */
  getGlobalSkills(): SkillConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.skills.filter((skill) => skill.scope === 'global');
  }

  /**
   * 获取项目技能
   */
  getProjectSkills(): SkillConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.skills.filter((skill) => skill.scope === 'project');
  }
}

export const skillService = new SkillService();
```

---

## 📥 配置导入导出

### 配置管理服务

```typescript
// src/services/config-service.ts
import { useSettingsStore } from '@/stores/useSettingsStore';

/**
 * 配置管理服务类
 */
export class ConfigService {
  /**
   * 导入配置
   */
  async importConfig(file: File): Promise<void> {
    const { importConfig } = useSettingsStore.getState();

    const content = await file.text();
    const config = JSON.parse(content);

    // 验证配置格式
    if (!this.validateConfig(config)) {
      throw new Error('配置格式不正确');
    }

    importConfig(config);
  }

  /**
   * 导出配置
   */
  async exportConfig(): Promise<void> {
    const { exportConfig } = useSettingsStore.getState();
    const config = exportConfig();

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yyc3-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 验证配置格式
   */
  private validateConfig(config: any): boolean {
    // 实现配置验证逻辑
    return (
      config &&
      typeof config === 'object' &&
      config.userProfile &&
      config.general &&
      config.agents &&
      config.mcpConfigs &&
      config.models &&
      config.context &&
      config.conversation &&
      config.rules &&
      config.skills
    );
  }

  /**
   * 从 VS Code 导入
   */
  async importFromVSCode(file: File): Promise<void> {
    const content = await file.text();
    const vsCodeConfig = JSON.parse(content);

    // 转换 VS Code 配置到 YYC3 配置
    const yyc3Config = this.convertVSCodeConfig(vsCodeConfig);

    const { importConfig } = useSettingsStore.getState();
    importConfig(yyc3Config);
  }

  /**
   * 从 Cursor 导入
   */
  async importFromCursor(file: File): Promise<void> {
    const content = await file.text();
    const cursorConfig = JSON.parse(content);

    // 转换 Cursor 配置到 YYC3 配置
    const yyc3Config = this.convertCursorConfig(cursorConfig);

    const { importConfig } = useSettingsStore.getState();
    importConfig(yyc3Config);
  }

  /**
   * 转换 VS Code 配置
   */
  private convertVSCodeConfig(vsCodeConfig: any): any {
    // 实现 VS Code 配置转换逻辑
    return {
      userProfile: {
        id: '',
        username: '',
        email: '',
      },
      general: {
        theme: vsCodeConfig.workbench?.colorTheme === 'vs-dark' ? 'dark' : 'light',
        language: 'zh-CN',
        editorFont: vsCodeConfig.editor?.fontFamily || 'Monaco',
        editorFontSize: vsCodeConfig.editor?.fontSize || 14,
        wordWrap: vsCodeConfig.editor?.wordWrap === 'on',
        keybindingScheme: 'vscode',
        customKeybindings: {},
        localLinkOpenMode: 'system',
        markdownOpenMode: 'editor',
        nodeVersion: '18.0.0',
      },
      agents: [],
      mcpConfigs: [],
      models: [],
      context: {
        indexStatus: 'idle',
        ignoreRules: [],
        documentSets: [],
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
      },
      rules: [],
      skills: [],
      importSettings: {
        includeAgentsMD: false,
        includeClaudeMD: false,
      },
    };
  }

  /**
   * 转换 Cursor 配置
   */
  private convertCursorConfig(cursorConfig: any): any {
    // 实现 Cursor 配置转换逻辑
    return this.convertVSCodeConfig(cursorConfig);
  }
}

export const configService = new ConfigService();
```

---

## 🔄 与项目集成

### 状态同步

```typescript
// src/services/settings-sync.ts
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { aiProviderManager } from '@/ai/AIProviderManager';

/**
 * 设置同步服务类
 */
export class SettingsSyncService {
  /**
   * 同步主题设置
   */
  syncTheme(): void {
    const { settings } = useSettingsStore.getState();
    const { setTheme } = useThemeStore.getState();

    setTheme(settings.general.theme);
  }

  /**
   * 同步模型配置
   */
  syncModels(): void {
    const { settings } = useSettingsStore.getState();

    // 清除现有提供商
    const existingProviders = aiProviderManager.getProviders();
    for (const provider of existingProviders) {
      aiProviderManager.removeProvider(provider);
    }

    // 添加新提供商
    for (const model of settings.models) {
      if (model.enabled && model.apiKey) {
        aiProviderManager.addProvider({
          name: model.provider as any,
          apiKey: model.apiKey,
          enabled: true,
          priority: 10,
        });
      }
    }
  }

  /**
   * 同步 MCP 配置
   */
  syncMCPs(): void {
    const { settings } = useSettingsStore.getState();

    // 通知工作流引擎更新 MCP 配置
    const event = new CustomEvent('mcp-config-updated', {
      detail: settings.mcpConfigs,
    });
    window.dispatchEvent(event);
  }

  /**
   * 同步智能体配置
   */
  syncAgents(): void {
    const { settings } = useSettingsStore.getState();

    // 通知智能体系统更新配置
    const event = new CustomEvent('agent-config-updated', {
      detail: settings.agents,
    });
    window.dispatchEvent(event);
  }

  /**
   * 同步所有设置
   */
  syncAll(): void {
    this.syncTheme();
    this.syncModels();
    this.syncMCPs();
    this.syncAgents();
  }
}

export const settingsSyncService = new SettingsSyncService();
```

---

## ✅ 验收标准

### 功能完整性

- ✅ 所有设置模块功能正常
- ✅ 搜索功能正常
- ✅ 数据持久化正常
- ✅ 配置导入导出正常
- ✅ 与项目集成正常

### 代码质量

- ✅ 代码结构清晰
- ✅ 类型定义完整
- ✅ 注释文档完整
- ✅ 代码可维护性好
- ✅ 测试覆盖充分

### 用户体验

- ✅ 设置即时生效
- ✅ 操作反馈及时
- ✅ 错误处理完善
- ✅ 数据验证严格

---
