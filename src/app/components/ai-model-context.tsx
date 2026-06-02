import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'

// ==========================================
// YYC³ AI 模型状态管理 — Context API + localStorage
// 提供多服务商模型管理、激活切换、API Key 存储
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
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

function saveModels(models: AIModel[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models))
  } catch {
    /* ignore */
  }
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

  const openModelSettings = useCallback(() => setModelSettingsOpen(true), [])
  const closeModelSettings = useCallback(() => setModelSettingsOpen(false), [])

  const addAIModel = useCallback((model: Omit<AIModel, 'id'>) => {
    const id = 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    setAiModels((prev) => {
      const next = [...prev, { ...model, id }]
      saveModels(next)
      return next
    })
  }, [])

  const removeAIModel = useCallback((id: string) => {
    setAiModels((prev) => {
      const next = prev.filter((m) => m.id !== id)
      saveModels(next)
      return next
    })
    setActiveModelId((prev) => {
      if (prev === id) {
        saveActiveId(null)
        return null
      }
      return prev
    })
  }, [])

  const updateAIModel = useCallback((id: string, partial: Partial<AIModel>) => {
    setAiModels((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, ...partial } : m))
      saveModels(next)
      return next
    })
  }, [])

  const activateAIModel = useCallback((id: string) => {
    setAiModels((prev) => {
      const next = prev.map((m) => ({ ...m, isActive: m.id === id }))
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
