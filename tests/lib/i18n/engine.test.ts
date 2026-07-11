/**
 * @file engine.test.ts
 * @description i18n 引擎集成测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nEngine } from '../../../src/lib/i18n/engine'

// ==========================================
// Engine — 基本翻译
// ==========================================

describe('I18nEngine — 基本翻译', () => {
  let engine: I18nEngine

  beforeEach(() => {
    engine = new I18nEngine({ locale: 'en', debug: false })
  })

  afterEach(async () => {
    await engine.destroy()
  })

  it('默认语言为 en', () => {
    expect(engine.getLocale()).toBe('en')
  })

  it('t() 翻译存在的 key', () => {
    engine.registerTranslation('en', {
      greeting: 'Hello World',
    })
    expect(engine.t('greeting')).toBe('Hello World')
  })

  it('t() 缺失的 key 返回 key 本身', () => {
    expect(engine.t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('t() 支持嵌套 key', () => {
    engine.registerTranslation('en', {
      nav: { home: 'Home', settings: 'Settings' },
    })
    expect(engine.t('nav.home')).toBe('Home')
    expect(engine.t('nav.settings')).toBe('Settings')
  })

  it('t() 支持参数插值', () => {
    engine.registerTranslation('en', {
      welcome: 'Hello {name}',
    })
    expect(engine.t('welcome', { name: 'Alice' })).toBe('Hello Alice')
  })
})

// ==========================================
// Engine — 语言切换
// ==========================================

describe('I18nEngine — 语言切换', () => {
  let engine: I18nEngine

  beforeEach(() => {
    engine = new I18nEngine({ locale: 'en' })
    engine.registerTranslation('en', { hello: 'Hello' })
    engine.registerTranslation('zh-CN' as never, { hello: '你好' } as never)
  })

  afterEach(async () => {
    await engine.destroy()
  })

  it('setLocale 切换语言', async () => {
    await engine.setLocale('en')
    expect(engine.getLocale()).toBe('en')
    expect(engine.t('hello')).toBe('Hello')
  })

  it('subscribe 监听语言变化', async () => {
    const callback = vi.fn()
    engine.registerTranslation('zh-CN' as never, { test: '测试' } as never)
    const unsub = engine.subscribe(callback)

    // 切换到 zh-CN 触发通知
    await engine.setLocale('zh-CN')
    expect(callback).toHaveBeenCalledWith('zh-CN')

    unsub()
    expect(typeof unsub).toBe('function')
  })
})

// ==========================================
// Engine — 缓存
// ==========================================

describe('I18nEngine — 缓存系统', () => {
  let engine: I18nEngine

  beforeEach(() => {
    engine = new I18nEngine({ locale: 'en', cache: { enabled: true, maxSize: 100 } })
    engine.registerTranslation('en', { cached: 'Cached Value' })
  })

  afterEach(async () => {
    await engine.destroy()
  })

  it('首次翻译后缓存命中', () => {
    engine.t('cached')
    const stats = engine.cache.getStats()
    // 第一次是 miss（未缓存），第二次是 hit
    engine.t('cached')
    const newStats = engine.cache.getStats()
    expect(newStats.hits).toBeGreaterThan(stats.hits)
  })

  it('clear cache 后重新查询', () => {
    engine.t('cached')
    engine.cache.clear()
    const stats = engine.cache.getStats()
    expect(stats.size).toBe(0)
  })
})

// ==========================================
// Engine — 批量翻译
// ==========================================

describe('I18nEngine — 批量翻译', () => {
  let engine: I18nEngine

  beforeEach(() => {
    engine = new I18nEngine({ locale: 'en' })
    engine.registerTranslation('en', {
      apple: 'Apple',
      banana: 'Banana',
      cherry: 'Cherry',
    })
  })

  afterEach(async () => {
    await engine.destroy()
  })

  it('batchTranslate 翻译多个 key', () => {
    const result = engine.batchTranslate(['apple', 'banana', 'cherry'])
    expect(result.apple).toBe('Apple')
    expect(result.banana).toBe('Banana')
    expect(result.cherry).toBe('Cherry')
  })

  it('batchTranslate 处理不存在的 key', () => {
    const result = engine.batchTranslate(['apple', 'nonexistent'])
    expect(result.apple).toBe('Apple')
    expect(result.nonexistent).toBe('nonexistent')
  })
})

// ==========================================
// Engine — 命名空间
// ==========================================

describe('I18nEngine — 命名空间', () => {
  let engine: I18nEngine

  beforeEach(() => {
    engine = new I18nEngine({ locale: 'en' })
    engine.registerTranslation('en', {
      nav: { home: 'Home', about: 'About' },
    })
  })

  afterEach(async () => {
    await engine.destroy()
  })

  it('createNamespace 自动添加前缀', () => {
    const ns = engine.createNamespace('nav')
    expect(ns.t('home')).toBe('Home')
    expect(ns.t('about')).toBe('About')
  })

  it('namespace getLocale 返回当前语言', () => {
    const ns = engine.createNamespace('nav')
    expect(ns.getLocale()).toBe('en')
  })
})

// ==========================================
// Engine — 统计信息
// ==========================================

describe('I18nEngine — 统计', () => {
  it('getStats 返回引擎状态', async () => {
    const engine = new I18nEngine({ locale: 'en' })
    const stats = engine.getStats()
    expect(stats).toHaveProperty('locale')
    expect(stats).toHaveProperty('cache')
    expect(stats).toHaveProperty('plugins')
    expect(stats).toHaveProperty('subscriberCount')
    expect(stats).toHaveProperty('loadedLocales')
    await engine.destroy()
  })
})

// ==========================================
// Engine — Debug 模式
// ==========================================

describe('I18nEngine — Debug 模式', () => {
  it('setDebug(true) 挂载全局调试对象', async () => {
    const engine = new I18nEngine({ locale: 'en', debug: false })
    engine.setDebug(true)
    expect((globalThis as Record<string, unknown>).__i18n_debug__).toBeDefined()
    engine.setDebug(false)
    expect((globalThis as Record<string, unknown>).__i18n_debug__).toBeUndefined()
    await engine.destroy()
  })
})
