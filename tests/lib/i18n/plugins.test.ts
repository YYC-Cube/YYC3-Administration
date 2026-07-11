/**
 * @file plugins.test.ts
 * @description i18n 插件系统单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it, vi } from 'vitest'

import { PluginManager } from '../../../src/lib/i18n/plugins'

import type { I18nPlugin } from '../../../src/lib/i18n/plugins'

// ==========================================
// PluginManager — 注册/注销
// ==========================================

describe('PluginManager — 注册和注销', () => {
  it('注册插件', () => {
    const pm = new PluginManager()
    const plugin: I18nPlugin = { name: 'test-plugin' }
    pm.register(plugin)
    expect(pm.getRegisteredPlugins()).toContain('test-plugin')
  })

  it('获取已注册插件', () => {
    const pm = new PluginManager()
    const plugin: I18nPlugin = { name: 'my-plugin', version: '1.0' }
    pm.register(plugin)
    const retrieved = pm.getPlugin('my-plugin')
    expect(retrieved).toBeDefined()
    expect(retrieved?.version).toBe('1.0')
  })

  it('注销已注册插件', () => {
    const pm = new PluginManager()
    const destroyFn = vi.fn()
    pm.register({ name: 'temp', destroy: destroyFn })
    expect(pm.unregister('temp')).toBe(true)
    expect(pm.getRegisteredPlugins()).not.toContain('temp')
    expect(destroyFn).toHaveBeenCalled()
  })

  it('注销不存在的插件返回 false', () => {
    const pm = new PluginManager()
    expect(pm.unregister('nonexistent')).toBe(false)
  })

  it('重复注册会覆盖', () => {
    const pm = new PluginManager()
    pm.register({ name: 'dup', version: '1.0' })
    pm.register({ name: 'dup', version: '2.0' })
    expect(pm.getPlugin('dup')?.version).toBe('2.0')
  })

  it('保持注册顺序', () => {
    const pm = new PluginManager()
    pm.register({ name: 'a' })
    pm.register({ name: 'b' })
    pm.register({ name: 'c' })
    expect(pm.getRegisteredPlugins()).toEqual(['a', 'b', 'c'])
  })
})

// ==========================================
// 生命周期钩子
// ==========================================

describe('PluginManager — 生命周期钩子', () => {
  it('initAll 按顺序初始化所有插件', async () => {
    const pm = new PluginManager()
    const initA = vi.fn()
    const initB = vi.fn()
    pm.register({ name: 'a', init: initA })
    pm.register({ name: 'b', init: initB })
    await pm.initAll({ locale: 'en', key: 'test' })
    expect(initA).toHaveBeenCalled()
    expect(initB).toHaveBeenCalled()
  })

  it('destroyAll 按顺序销毁所有插件', async () => {
    const pm = new PluginManager()
    const destroyA = vi.fn()
    const destroyB = vi.fn()
    pm.register({ name: 'a', destroy: destroyA })
    pm.register({ name: 'b', destroy: destroyB })
    await pm.destroyAll()
    expect(destroyA).toHaveBeenCalled()
    expect(destroyB).toHaveBeenCalled()
    expect(pm.getRegisteredPlugins()).toHaveLength(0)
  })
})

// ==========================================
// 翻译钩子
// ==========================================

describe('PluginManager — beforeTranslate 钩子', () => {
  it('beforeTranslate 可以修改 key', () => {
    const pm = new PluginManager()
    pm.register({
      name: 'redirector',
      beforeTranslate: (key) => ({ key: 'redirected.' + key }),
    })
    const result = pm.executeBeforeTranslate('original')
    expect(result.key).toBe('redirected.original')
  })

  it('beforeTranslate 可以修改 params', () => {
    const pm = new PluginManager()
    pm.register({
      name: 'param-modifier',
      beforeTranslate: (key, params) => ({
        key,
        params: { ...params, extra: 'added' },
      }),
    })
    const result = pm.executeBeforeTranslate('key', { original: 'val' })
    expect(result.params?.extra).toBe('added')
    expect(result.params?.original).toBe('val')
  })

  it('多个 beforeTranslate 钩子链式执行', () => {
    const pm = new PluginManager()
    pm.register({ name: 'a', beforeTranslate: (k) => ({ key: k + '_a' }) })
    pm.register({ name: 'b', beforeTranslate: (k) => ({ key: k + '_b' }) })
    const result = pm.executeBeforeTranslate('key')
    expect(result.key).toBe('key_a_b')
  })

  it('beforeTranslate 返回 void 时不修改', () => {
    const pm = new PluginManager()
    pm.register({ name: 'noop', beforeTranslate: () => {} })
    const result = pm.executeBeforeTranslate('original', { x: '1' })
    expect(result.key).toBe('original')
  })
})

describe('PluginManager — afterTranslate 钩子', () => {
  it('afterTranslate 可以修改结果', () => {
    const pm = new PluginManager()
    pm.register({
      name: 'wrapper',
      afterTranslate: (result) => `[${result}]`,
    })
    const result = pm.executeAfterTranslate('Hello', 'greeting')
    expect(result).toBe('[Hello]')
  })

  it('多个 afterTranslate 钩子链式执行', () => {
    const pm = new PluginManager()
    pm.register({ name: 'a', afterTranslate: (r) => r + '!' })
    pm.register({ name: 'b', afterTranslate: (r) => r + '?' })
    const result = pm.executeAfterTranslate('Hi', 'key')
    expect(result).toBe('Hi!?')
  })
})

// ==========================================
// 系统钩子
// ==========================================

describe('PluginManager — 系统钩子', () => {
  it('notifyLocaleChange 通知所有插件', () => {
    const pm = new PluginManager()
    const handler = vi.fn()
    pm.register({ name: 'locale-watcher', onLocaleChange: handler })
    pm.notifyLocaleChange('zh-CN', 'en')
    expect(handler).toHaveBeenCalledWith('zh-CN', 'en')
  })

  it('handleError 通知所有插件', () => {
    const pm = new PluginManager()
    const handler = vi.fn()
    pm.register({ name: 'error-handler', onError: handler })
    const error = new Error('Test error')
    pm.handleError(error, { locale: 'en', key: 'test' })
    expect(handler).toHaveBeenCalledWith(error, { locale: 'en', key: 'test' })
  })

  it('handleMissingKey 返回第一个非空结果', () => {
    const pm = new PluginManager()
    pm.register({ name: 'a', onMissingKey: () => undefined })
    pm.register({ name: 'b', onMissingKey: (key) => `[missing: ${key}]` })
    const result = pm.handleMissingKey('some.key', 'en')
    expect(result).toBe('[missing: some.key]')
  })

  it('handleMissingKey 无插件时返回 undefined', () => {
    const pm = new PluginManager()
    expect(pm.handleMissingKey('key', 'en')).toBeUndefined()
  })
})
