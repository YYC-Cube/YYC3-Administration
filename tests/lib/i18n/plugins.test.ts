/**
 * @file plugins.test.ts
 * @description I18n Plugin System — Unit Tests
 *   Covers: PluginManager (register/unregister/execute hooks), MissingKeyReporter.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { describe, expect, it, vi } from 'vitest'

import { PluginManager } from '../../../src/lib/i18n/plugins'

import type { I18nContext, I18nPlugin } from '../../../src/lib/i18n/plugins'

describe('PluginManager — Registration', () => {
  it('registers a plugin', () => {
    const mgr = new PluginManager()
    const plugin: I18nPlugin = {
      name: 'test-plugin',
      afterTranslate: (result: string) => result.toUpperCase(),
    }
    mgr.register(plugin)
    expect(mgr.getRegisteredPlugins()).toHaveLength(1)
    expect(mgr.getRegisteredPlugins()[0]).toBe('test-plugin')
  })

  it('registers multiple plugins', () => {
    const mgr = new PluginManager()
    mgr.register({ name: 'p1' })
    mgr.register({ name: 'p2' })
    expect(mgr.getRegisteredPlugins()).toHaveLength(2)
  })

  it('allows overwriting duplicate plugin names', () => {
    const mgr = new PluginManager()
    mgr.register({ name: 'dup' })
    mgr.register({ name: 'dup' })
    expect(mgr.getRegisteredPlugins()).toHaveLength(1)
  })

  it('unregisters a plugin by name', () => {
    const mgr = new PluginManager()
    mgr.register({ name: 'test' })
    const result = mgr.unregister('test')
    expect(result).toBe(true)
    expect(mgr.getRegisteredPlugins()).toHaveLength(0)
  })

  it('returns false when unregistering non-existent plugin', () => {
    const mgr = new PluginManager()
    expect(mgr.unregister('nonexistent')).toBe(false)
  })
})

describe('PluginManager — Hook Execution', () => {
  it('executes afterTranslate hooks in order', () => {
    const mgr = new PluginManager()
    mgr.register({
      name: 'upper',
      afterTranslate: (result: string) => result.toUpperCase(),
    })
    mgr.register({
      name: 'exclaim',
      afterTranslate: (result: string) => result + '!',
    })

    const result = mgr.executeAfterTranslate('hello', 'test.key')
    expect(result).toBe('HELLO!')
  })

  it('executes beforeTranslate hooks', () => {
    const mgr = new PluginManager()
    let capturedKey = ''
    mgr.register({
      name: 'capture',
      beforeTranslate: (key: string) => {
        capturedKey = key
      },
    })

    mgr.executeBeforeTranslate('my-key')
    expect(capturedKey).toBe('my-key')
  })

  it('modifies key and params via beforeTranslate', () => {
    const mgr = new PluginManager()
    mgr.register({
      name: 'modify',
      beforeTranslate: (_key: string, _params?: Record<string, string>) => ({
        key: 'modified-key',
        params: { lang: 'en' },
      }),
    })

    const result = mgr.executeBeforeTranslate('original', {})
    expect(result.key).toBe('modified-key')
    expect(result.params?.lang).toBe('en')
  })

  it('handles afterTranslate returning void (no modification)', () => {
    const mgr = new PluginManager()
    mgr.register({ name: 'noop', afterTranslate: (_r: string) => undefined })
    const result = mgr.executeAfterTranslate('test', 'key')
    expect(result).toBe('test')
  })
})

describe('PluginManager — System Hooks', () => {
  it('notifies locale change', () => {
    const mgr = new PluginManager()
    const handler = vi.fn()
    mgr.register({ name: 'locale-watcher', onLocaleChange: handler })

    mgr.notifyLocaleChange('zh-CN', 'en')
    expect(handler).toHaveBeenCalledWith('zh-CN', 'en')
  })

  it('handles errors via plugins', () => {
    const mgr = new PluginManager()
    const handler = vi.fn()
    mgr.register({ name: 'error-handler', onError: handler })

    const error = new Error('test error')
    const ctx: I18nContext = { locale: 'en', key: 'test' }
    mgr.handleError(error, ctx)
    expect(handler).toHaveBeenCalledWith(error, ctx)
  })

  it('handles missing keys with fallback', () => {
    const mgr = new PluginManager()
    mgr.register({
      name: 'missing-fallback',
      onMissingKey: (key: string) => `FALLBACK:${key}`,
    })

    const result = mgr.handleMissingKey('missing.key', 'en')
    expect(result).toBe('FALLBACK:missing.key')
  })
})

describe('PluginManager — Lifecycle', () => {
  it('calls init on all plugins', async () => {
    const mgr = new PluginManager()
    const initFn = vi.fn()
    mgr.register({ name: 'p1', init: initFn })
    mgr.register({ name: 'p2', init: initFn })

    await mgr.initAll({ locale: 'en', key: '' })
    expect(initFn).toHaveBeenCalledTimes(2)
  })

  it('calls destroy on all plugins', async () => {
    const mgr = new PluginManager()
    const destroyFn = vi.fn()
    mgr.register({ name: 'p1', destroy: destroyFn })

    await mgr.destroyAll()
    expect(destroyFn).toHaveBeenCalledTimes(1)
    expect(mgr.getRegisteredPlugins()).toHaveLength(0)
  })
})

describe('PluginManager — getPlugin', () => {
  it('retrieves a plugin by name', () => {
    const mgr = new PluginManager()
    mgr.register({ name: 'find-me', version: '1.0' })
    const plugin = mgr.getPlugin('find-me')
    expect(plugin).toBeTruthy()
    expect(plugin?.name).toBe('find-me')
    expect(plugin?.version).toBe('1.0')
  })

  it('returns undefined for non-existent plugin', () => {
    const mgr = new PluginManager()
    expect(mgr.getPlugin('ghost')).toBeUndefined()
  })
})

describe('PluginManager — Edge Cases', () => {
  it('handles afterTranslate with params', () => {
    const mgr = new PluginManager()
    mgr.register({
      name: 'interpolate',
      afterTranslate: (result: string) => result.replace('{name}', 'World'),
    })
    const result = mgr.executeAfterTranslate('Hello {name}', 'greeting.key')
    expect(result).toBe('Hello World')
  })
})
