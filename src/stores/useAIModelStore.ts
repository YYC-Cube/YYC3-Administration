/**
 * @file stores/useAIModelStore.ts
 * @description YYC³ AI 模型配置单一真源(P2-① 收敛)
 *   历史:ai-model-context(Context)、useSettingsStore.settings.models、
 *   panel-store.aiProviderConfig 三处并存且互不知晓——用户在模型设置配好
 *   GLM 后,侧栏 AI 助手仍是 mock(审计报告 STATE-002)。
 *   本 store 承接 ai-model-context 的全部状态与加密持久化,并提供:
 *   - useAIModel() 兼容 hook(原 Context 消费方零迁移)
 *   - useActiveProviderConfig() 面向 ai-proxy-service 的配置映射
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags ai,store,zustand,security
 */

import { create } from 'zustand'

import { getSecure, migrateToSecure, setSecure } from '../lib/secure-storage'

// ==========================================
// Types
// ==========================================

export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'ollama' | 'custom'
  endpoint: string
  apiKey: string
  isActive: boolean
  isDetected?: boolean
}

/** ai-proxy-service 的请求配置形态(chatStream 消费) */
export interface AIProviderRequestConfig {
  provider: 'mock' | 'openai' | 'claude' | 'deepseek'
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  baseUrl?: string
}

const STORAGE_KEY = 'yyc3_ai_models'
const ACTIVE_KEY = 'yyc3_active_model_id'

// ==========================================
// Persistence(加密,与原 ai-model-context 一致)
// ==========================================

function loadModelsSync(): AIModel[] {
  // 同步首帧:仅读旧明文(如有),正式加载走异步 ensureLoaded
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function persistModels(models: AIModel[]) {
  void setSecure(STORAGE_KEY, JSON.stringify(models))
}

function persistActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* ignore */
  }
}

function loadActiveIdSync(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY) || null
  } catch {
    return null
  }
}

// ==========================================
// Store
// ==========================================

interface AIModelState {
  modelSettingsOpen: boolean
  aiModels: AIModel[]
  activeModelId: string | null
  openModelSettings: () => void
  closeModelSettings: () => void
  addAIModel: (model: Omit<AIModel, 'id'>) => void
  removeAIModel: (id: string) => void
  updateAIModel: (id: string, partial: Partial<AIModel>) => void
  activateAIModel: (id: string) => void
}

export const useAIModelStore = create<AIModelState>()((set, get) => ({
  modelSettingsOpen: false,
  aiModels: loadModelsSync(),
  activeModelId: loadActiveIdSync(),

  openModelSettings: () => set({ modelSettingsOpen: true }),
  closeModelSettings: () => set({ modelSettingsOpen: false }),

  addAIModel: (model) => {
    const id = 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    set((s) => {
      const next = [...s.aiModels, { ...model, id }]
      persistModels(next)
      return { aiModels: next }
    })
  },

  removeAIModel: (id) => {
    set((s) => {
      const next = s.aiModels.filter((m) => m.id !== id)
      persistModels(next)
      const { activeModelId } = s
      if (activeModelId === id) {
        persistActiveId(null)
        return { aiModels: next, activeModelId: null }
      }
      return { aiModels: next }
    })
  },

  updateAIModel: (id, partial) => {
    set((s) => {
      const next = s.aiModels.map((m) => (m.id === id ? { ...m, ...partial } : m))
      persistModels(next)
      return { aiModels: next }
    })
  },

  activateAIModel: (id) => {
    set((s) => {
      const next = s.aiModels.map((m) => ({ ...m, isActive: m.id === id }))
      persistModels(next)
      return { aiModels: next, activeModelId: id }
    })
    persistActiveId(id)
  },
}))

// 异步初始化:旧明文一次性迁移 + 加密数据正式加载(幂等,仅首模块加载执行)
let initialized = false
export function ensureAIModelsLoaded(): void {
  if (initialized) return
  initialized = true
  void (async () => {
    await migrateToSecure(STORAGE_KEY)
    const raw = await getSecure(STORAGE_KEY)
    if (!raw) return
    try {
      const models: AIModel[] = JSON.parse(raw)
      if (Array.isArray(models)) useAIModelStore.setState({ aiModels: models })
    } catch {
      /* 加密数据损坏时保持初始状态 */
    }
  })()
}
ensureAIModelsLoaded()

// ==========================================
// 兼容 hook(原 ai-model-context 消费方零迁移)
// ==========================================

/**
 * AI 模型管理 hook(单一真源)。
 * 返回形态与原 AIModelContext 一致;模型设置弹窗开关亦在此,
 * cyberpunk-standalone / chat-interface 可直接消费。
 */
export function useAIModel() {
  return useAIModelStore()
}

// ==========================================
// 面向 ai-proxy-service 的映射
// ==========================================

const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 4096

/**
 * 将激活的 AIModel 映射为 ai-proxy-service 的请求配置。
 * - openai 兼容端点(含 custom)→ provider 'openai' + baseUrl
 * - ollama → OpenAI 兼容层(默认 /v1)
 * - 无激活模型 → mock(保持演示可用)
 * claude/deepseek 官方端点由模型设置以 custom 端点 + openai 兼容方式
 * 配置时自动按 endpoint 域名识别还原为原生 provider。
 */
export function toProviderRequestConfig(model: AIModel | null): AIProviderRequestConfig {
  if (!model || !model.apiKey) {
    return {
      provider: 'mock',
      apiKey: '',
      model: 'mock-v1',
      temperature: DEFAULT_TEMPERATURE,
      maxTokens: DEFAULT_MAX_TOKENS,
    }
  }

  let provider: AIProviderRequestConfig['provider'] = 'openai'
  let baseUrl = model.endpoint.replace(/\/chat\/completions\/?$/, '').replace(/\/v1\/?$/, '')

  if (model.provider === 'ollama') {
    provider = 'openai'
    baseUrl = model.endpoint.replace(/\/api\/chat\/?$/, '').replace(/\/v1\/?$/, '') + '/v1'
  } else if (model.endpoint.includes('anthropic.com')) {
    provider = 'claude'
    baseUrl = model.endpoint.replace(/\/messages\/?$/, '')
  } else if (model.endpoint.includes('deepseek.com')) {
    provider = 'deepseek'
    baseUrl = model.endpoint.replace(/\/chat\/completions\/?$/, '').replace(/\/v1\/?$/, '')
  }

  return {
    provider,
    apiKey: model.apiKey,
    model: model.name,
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    baseUrl: baseUrl || undefined,
  }
}

/** 便捷 selector:激活模型(无则 null) */
export function useActiveModel(): AIModel | null {
  return useAIModelStore((s) => s.aiModels.find((m) => m.id === s.activeModelId) ?? null)
}

/** 便捷 selector:面向 ai-proxy-service 的激活配置 */
export function useActiveProviderConfig(): AIProviderRequestConfig {
  return useAIModelStore((s) =>
    toProviderRequestConfig(s.aiModels.find((m) => m.id === s.activeModelId) ?? null),
  )
}
