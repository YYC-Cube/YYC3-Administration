/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'

import { getSecure, migrateToSecure, setSecure } from '../../lib/secure-storage'

// ==========================================
// YYC³ AI 模型状态管理 — Context API + 加密存储
// 提供多服务商模型管理、激活切换、API Key 存储
// API Key 等敏感字段经 secure-storage（AES-GCM）加密后落盘，
// 不再以明文写入 localStorage（审计报告 SEC-009）。
// ==========================================

/**
 * Configuration for a single AI model service provider.
 * Supports OpenAI-compatible, Ollama, and custom endpoints.
 */
export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'ollama' | 'custom'
  endpoint: string
  apiKey: string
  isActive: boolean
  isDetected?: boolean
}

interface AIModelContextType {
  modelSettingsOpen: boolean
  openModelSettings: () => void
  closeModelSettings: () => void
  aiModels: AIModel[]
  addAIModel: (model: Omit<AIModel, 'id'>) => void
  removeAIModel: (id: string) => void
  updateAIModel: (id: string, partial: Partial<AIModel>) => void
  activateAIModel: (id: string) => void
  activeModelId: string | null
}

const STORAGE_KEY = 'yyc3_ai_models'
const ACTIVE_KEY = 'yyc3_active_model_id'

function loadModels(): AIModel[] {
  // 同步初始值：仅用于首帧渲染。若存在旧版明文数据则先读出，
  // 随后由 Provider 的异步 effect 完成加密迁移与正式加载。
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function saveModels(models: AIModel[]) {
  // 加密写入为异步操作，此处 fire-and-forget；失败由 secure-storage 内部记录
  void setSecure(STORAGE_KEY, JSON.stringify(models))
}

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY) || null
  } catch {
    return null
  }
}

function saveActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* ignore */
  }
}

const AIModelContext = createContext<AIModelContextType | null>(null)

/**
 * AI model management provider.
 * Handles multi-provider model CRUD, activation switching, and API key persistence.
 * All model data is stored in `localStorage` under `yyc3_ai_models`.
 *
 * @param children - React child nodes to wrap.
 */
export function AIModelProvider({ children }: { children: ReactNode }) {
  const [modelSettingsOpen, setModelSettingsOpen] = useState(false)
  const [aiModels, setAiModels] = useState<AIModel[]>(loadModels)
  const [activeModelId, setActiveModelId] = useState<string | null>(loadActiveId)

  // 异步加载加密存储：含旧明文 → 加密的一次性迁移（migrateToSecure）
  useEffect(() => {
    let cancelled = false
    void (async () => {
      await migrateToSecure(STORAGE_KEY)
      const raw = await getSecure(STORAGE_KEY)
      if (cancelled || !raw) return
      try {
        const models: AIModel[] = JSON.parse(raw)
        setAiModels(models)
      } catch {
        /* 加密数据损坏时保持初始状态 */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const openModelSettings = useCallback(() => setModelSettingsOpen(true), [])
  const closeModelSettings = useCallback(() => setModelSettingsOpen(false), [])

  const addAIModel = useCallback((model: Omit<AIModel, 'id'>) => {
    const id = 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    setAiModels((prev: AIModel[]) => {
      const next = [...prev, { ...model, id }]
      saveModels(next)
      return next
    })
  }, [])

  const removeAIModel = useCallback((id: string) => {
    setAiModels((prev: AIModel[]) => {
      const next = prev.filter((m: AIModel) => m.id !== id)
      saveModels(next)
      return next
    })
    setActiveModelId((prev: string | null) => {
      if (prev === id) {
        saveActiveId(null)
        return null
      }
      return prev
    })
  }, [])

  const updateAIModel = useCallback((id: string, partial: Partial<AIModel>) => {
    setAiModels((prev: AIModel[]) => {
      const next = prev.map((m: AIModel) => (m.id === id ? { ...m, ...partial } : m))
      saveModels(next)
      return next
    })
  }, [])

  const activateAIModel = useCallback((id: string) => {
    setAiModels((prev: AIModel[]) => {
      const next = prev.map((m: AIModel) => ({ ...m, isActive: m.id === id }))
      saveModels(next)
      return next
    })
    setActiveModelId(id)
    saveActiveId(id)
  }, [])

  return (
    <AIModelContext.Provider
      value={{
        modelSettingsOpen,
        openModelSettings,
        closeModelSettings,
        aiModels,
        addAIModel,
        removeAIModel,
        updateAIModel,
        activateAIModel,
        activeModelId,
      }}
    >
      {children}
    </AIModelContext.Provider>
  )
}

/**
 * Hook to access the AI model management state and actions.
 * Must be called within an `<AIModelProvider>` tree.
 *
 * @throws Error if called outside of `AIModelProvider`.
 * @returns Model list, active model, CRUD methods, and settings panel controls.
 */
export function useAIModel() {
  const ctx = useContext(AIModelContext)
  if (!ctx) throw new Error('useAIModel must be used within AIModelProvider')
  return ctx
}
