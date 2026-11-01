/**
 * Unit Tests: useAIModelStore 启动/引导路径（批次三分支补强）
 * 覆盖:loadModelsSync 降级链(空/明文坏 JSON)、loadActiveIdSync 容错(catch/|| null)、
 *      ensureAIModelsLoaded 幂等守卫与加密数据三态(无/坏 JSON/非数组/合法数组)、
 *      useActiveModel 空回退、toProviderRequestConfig 空 endpoint 的 baseUrl 回退
 *
 * 说明:store 模块在 import 时执行顶层 ensureAIModelsLoaded(),故每个用例经
 * vi.resetModules + 动态 import 重新求值模块;加密存储以受控 mock 供数。
 * STORAGE_KEY 未导出,此处按实现值 'yyc3_ai_models' 直接操作 localStorage 明文层。
 */

import { render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const secureState = vi.hoisted(() => ({ data: null as string | null }))

vi.mock('@/lib/secure-storage', () => ({
  migrateToSecure: vi.fn(async () => {}),
  getSecure: vi.fn(async () => secureState.data),
  setSecure: vi.fn(async () => {}),
}))

const STORAGE_KEY = 'yyc3_ai_models'
const ACTIVE_KEY = 'yyc3_active_model_id'

async function freshStore() {
  return await import('@/stores/useAIModelStore')
}

describe('useAIModelStore — 启动/引导分支', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    secureState.data = null
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('空存储 → aiModels/activeModelId 均空(loadModelsSync false 路径)', async () => {
    const mod = await freshStore()
    expect(mod.useAIModelStore.getState().aiModels).toEqual([])
    expect(mod.useAIModelStore.getState().activeModelId).toBeNull()
    // 幂等守卫:二次调用直接返回(initialized true 路径)
    expect(() => mod.ensureAIModelsLoaded()).not.toThrow()
  })

  it('明文坏 JSON → loadModelsSync 走 catch 保持空数组', async () => {
    localStorage.setItem(STORAGE_KEY, '{not-valid-json')
    const mod = await freshStore()
    expect(mod.useAIModelStore.getState().aiModels).toEqual([])
  })

  it('明文合法 JSON → 同步首帧加载(loadModelsSync raw 路径)', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'm_legacy', name: 'legacy' }]))
    const mod = await freshStore()
    expect(mod.useAIModelStore.getState().aiModels).toHaveLength(1)
  })

  it('activeId 持久值 → loadActiveIdSync || truthy 路径', async () => {
    localStorage.setItem(ACTIVE_KEY, 'm_legacy')
    const mod = await freshStore()
    expect(mod.useAIModelStore.getState().activeModelId).toBe('m_legacy')
  })

  it('getItem 抛错 → loadActiveIdSync catch 返回 null', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    const mod = await freshStore()
    expect(mod.useAIModelStore.getState().activeModelId).toBeNull()
  })

  it('加密数据为空 → ensureAIModelsLoaded !raw 早退', async () => {
    secureState.data = null
    const mod = await freshStore()
    await Promise.resolve()
    expect(mod.useAIModelStore.getState().aiModels).toEqual([])
  })

  it('加密数据坏 JSON → catch 保持初始状态', async () => {
    secureState.data = '{broken'
    const mod = await freshStore()
    await Promise.resolve()
    expect(mod.useAIModelStore.getState().aiModels).toEqual([])
  })

  it('加密数据非数组 → Array.isArray false 保持初始状态', async () => {
    secureState.data = JSON.stringify({ not: 'array' })
    const mod = await freshStore()
    await Promise.resolve()
    expect(mod.useAIModelStore.getState().aiModels).toEqual([])
  })

  it('加密数据合法数组 → setState 覆盖为云端列表', async () => {
    secureState.data = JSON.stringify([{ id: 'm_cloud', name: 'glm-4.6', isActive: true }])
    const mod = await freshStore()
    await Promise.resolve()
    expect(mod.useAIModelStore.getState().aiModels).toHaveLength(1)
    expect(mod.useAIModelStore.getState().aiModels[0].id).toBe('m_cloud')
  })
})

describe('useAIModelStore — selector 与映射回退分支', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    secureState.data = null
  })

  it('useActiveModel:无激活 → ?? null 回退', async () => {
    const mod = await freshStore()
    mod.useAIModelStore.setState({ aiModels: [], activeModelId: null })
    let captured: ReturnType<typeof mod.useActiveModel> | undefined
    function Probe() {
      captured = mod.useActiveModel()
      return null
    }
    render(createElement(Probe))
    expect(captured).toBeNull()
  })

  it('useActiveModel:命中激活模型', async () => {
    const mod = await freshStore()
    mod.useAIModelStore.setState({
      aiModels: [
        {
          id: 'm_1',
          name: 'glm-4.6',
          provider: 'openai',
          endpoint: 'https://example.com/v1',
          apiKey: 'sk-test',
          isActive: true,
        },
      ],
      activeModelId: 'm_1',
    })
    let captured: ReturnType<typeof mod.useActiveModel> | undefined
    function Probe() {
      captured = mod.useActiveModel()
      return null
    }
    render(createElement(Probe))
    expect(captured?.id).toBe('m_1')
  })

  it('toProviderRequestConfig:空 endpoint → baseUrl || undefined 走 undefined', async () => {
    const mod = await freshStore()
    const c = mod.toProviderRequestConfig({
      id: 'm_1',
      name: 'local-model',
      provider: 'custom',
      endpoint: '',
      apiKey: 'sk-test',
      isActive: true,
    })
    expect(c.baseUrl).toBeUndefined()
    expect(c.provider).toBe('openai')
  })
})
