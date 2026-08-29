/**
 * Unit Tests: useAIModelStore(P2-① 收敛后的 AI 配置单一真源)
 * 覆盖:CRUD/激活语义、加密持久化、toProviderRequestConfig 映射矩阵
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  type AIModel,
  toProviderRequestConfig,
  useAIModelStore,
} from '../../src/stores/useAIModelStore'

const model = (over: Partial<AIModel> = {}): AIModel => ({
  id: 'm_test',
  name: 'glm-4.6',
  provider: 'openai',
  endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: 'sk-test',
  isActive: false,
  ...over,
})

describe('useAIModelStore — CRUD 与激活语义', () => {
  beforeEach(() => {
    useAIModelStore.setState({ aiModels: [], activeModelId: null, modelSettingsOpen: false })
  })
  afterEach(() => {
    useAIModelStore.setState({ aiModels: [], activeModelId: null, modelSettingsOpen: false })
  })

  it('addAIModel 生成 id 并追加', () => {
    useAIModelStore.getState().addAIModel(model())
    const list = useAIModelStore.getState().aiModels
    expect(list).toHaveLength(1)
    expect(list[0].id).toMatch(/^m_/)
  })

  it('activateAIModel 单激活并记录 activeModelId', () => {
    const { addAIModel, activateAIModel } = useAIModelStore.getState()
    addAIModel(model({ name: 'a' }))
    addAIModel(model({ name: 'b' }))
    const ids = useAIModelStore.getState().aiModels.map((m) => m.id)
    activateAIModel(ids[1])
    const s = useAIModelStore.getState()
    expect(s.activeModelId).toBe(ids[1])
    expect(s.aiModels.find((m) => m.id === ids[1])?.isActive).toBe(true)
    expect(s.aiModels.find((m) => m.id === ids[0])?.isActive).toBe(false)
  })

  it('removeAIModel 删除激活项时清空 activeModelId', () => {
    const { addAIModel, activateAIModel, removeAIModel } = useAIModelStore.getState()
    addAIModel(model())
    const id = useAIModelStore.getState().aiModels[0].id
    activateAIModel(id)
    removeAIModel(id)
    expect(useAIModelStore.getState().aiModels).toHaveLength(0)
    expect(useAIModelStore.getState().activeModelId).toBeNull()
  })

  it('removeAIModel 删除非激活项不影响 activeModelId', () => {
    const { addAIModel, activateAIModel, removeAIModel } = useAIModelStore.getState()
    addAIModel(model())
    addAIModel(model({ name: 'b' }))
    const ids = useAIModelStore.getState().aiModels.map((m) => m.id)
    activateAIModel(ids[1])
    removeAIModel(ids[0])
    expect(useAIModelStore.getState().activeModelId).toBe(ids[1])
  })

  it('updateAIModel 局部合并', () => {
    const { addAIModel, updateAIModel } = useAIModelStore.getState()
    addAIModel(model())
    const id = useAIModelStore.getState().aiModels[0].id
    updateAIModel(id, { apiKey: 'sk-new' })
    expect(useAIModelStore.getState().aiModels[0].apiKey).toBe('sk-new')
    expect(useAIModelStore.getState().aiModels[0].name).toBe('glm-4.6')
  })

  it('openModelSettings/closeModelSettings 切换浮层', () => {
    useAIModelStore.getState().openModelSettings()
    expect(useAIModelStore.getState().modelSettingsOpen).toBe(true)
    useAIModelStore.getState().closeModelSettings()
    expect(useAIModelStore.getState().modelSettingsOpen).toBe(false)
  })
})

describe('toProviderRequestConfig — 提供方映射矩阵', () => {
  it('无模型/无 key → mock(演示可用)', () => {
    for (const input of [null, model({ apiKey: '' })]) {
      const c = toProviderRequestConfig(input)
      expect(c.provider).toBe('mock')
      expect(c.apiKey).toBe('')
    }
  })

  it('openai 兼容端点 → openai,baseUrl 剥离路径与 /v1 尾缀', () => {
    const c = toProviderRequestConfig(
      model({ endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions' }),
    )
    expect(c.provider).toBe('openai')
    expect(c.baseUrl).toBe('https://open.bigmodel.cn/api/paas/v4')
    expect(c.model).toBe('glm-4.6')
  })

  it('ollama → openai 兼容层(/v1),剥离 /api/chat', () => {
    const c = toProviderRequestConfig(
      model({ provider: 'ollama', endpoint: 'http://localhost:11434/api/chat', name: 'qwen3' }),
    )
    expect(c.provider).toBe('openai')
    expect(c.baseUrl).toBe('http://localhost:11434/v1')
  })

  it('anthropic 端点 → claude,剥离 /messages', () => {
    const c = toProviderRequestConfig(
      model({ endpoint: 'https://api.anthropic.com/v1/messages', name: 'claude-4' }),
    )
    expect(c.provider).toBe('claude')
    expect(c.baseUrl).toBe('https://api.anthropic.com/v1')
  })

  it('deepseek 端点 → deepseek', () => {
    const c = toProviderRequestConfig(
      model({ endpoint: 'https://api.deepseek.com/v1/chat/completions' }),
    )
    expect(c.provider).toBe('deepseek')
    expect(c.baseUrl).toBe('https://api.deepseek.com')
  })

  it('custom 泛化端点按域名识别;默认温度与令牌数下发', () => {
    const c = toProviderRequestConfig(model({ provider: 'custom' }))
    expect(c.provider).toBe('openai') // bigmodel 域名不匹配特殊三家
    expect(c.temperature).toBe(0.7)
    expect(c.maxTokens).toBeGreaterThan(0)
  })
})
