/**
 * @file cache.test.ts
 * @description LRUCache 单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { LRUCache } from '../../../src/lib/i18n/cache'

describe('LRUCache — 基本操作', () => {
  let cache: LRUCache<string>

  beforeEach(() => {
    cache = new LRUCache({ maxSize: 3, defaultTTL: 60000 })
  })

  it('应该存储和获取值', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('get 不存在的 key 返回 null', () => {
    expect(cache.get('missing')).toBeNull()
  })

  it('has 返回是否存在', () => {
    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)
    expect(cache.has('missing')).toBe(false)
  })

  it('delete 移除指定 key', () => {
    cache.set('key1', 'value1')
    expect(cache.delete('key1')).toBe(true)
    expect(cache.has('key1')).toBe(false)
  })

  it('delete 不存在的 key 返回 false', () => {
    expect(cache.delete('nope')).toBe(false)
  })

  it('clear 清空所有条目并重置统计', () => {
    cache.set('a', '1')
    cache.set('b', '2')
    cache.get('a')
    cache.clear()
    expect(cache.getStats().size).toBe(0)
    expect(cache.getStats().hits).toBe(0)
    expect(cache.getStats().misses).toBe(0)
  })
})

describe('LRUCache — LRU 淘汰策略', () => {
  it('超过 maxSize 时淘汰最久未使用的条目', () => {
    const cache = new LRUCache<string>({ maxSize: 2, defaultTTL: 60000 })
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('c', '3') // 应该淘汰 'a'
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).toBe('2')
    expect(cache.get('c')).toBe('3')
    expect(cache.getStats().evictions).toBe(1)
  })

  it('get 操作刷新 LRU 顺序', () => {
    const cache = new LRUCache<string>({ maxSize: 2, defaultTTL: 60000 })
    cache.set('a', '1')
    cache.set('b', '2')
    cache.get('a') // a 变为最近使用
    cache.set('c', '3') // 应该淘汰 'b'
    expect(cache.get('a')).toBe('1')
    expect(cache.get('b')).toBeNull()
  })

  it('覆盖已存在的 key 不触发淘汰', () => {
    const cache = new LRUCache<string>({ maxSize: 2, defaultTTL: 60000 })
    cache.set('a', '1')
    cache.set('b', '2')
    cache.set('a', 'updated') // 覆盖，不应淘汰
    expect(cache.get('a')).toBe('updated')
    expect(cache.get('b')).toBe('2')
    expect(cache.getStats().evictions).toBe(0)
  })
})

describe('LRUCache — TTL 过期', () => {
  it('过期条目返回 null 并计入 miss', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 50 })
    cache.set('key', 'value')
    expect(cache.get('key')).toBe('value')

    // 等待过期
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cache.get('key')).toBeNull()
        resolve()
      }, 60)
    })
  })

  it('支持自定义 TTL 覆盖默认值', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 10000 })
    cache.set('key', 'value', 50)
    expect(cache.get('key')).toBe('value')

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(cache.get('key')).toBeNull()
        resolve()
      }, 60)
    })
  })
})

describe('LRUCache — 禁用状态', () => {
  it('enabled=false 时 get 始终返回 null', () => {
    const cache = new LRUCache<string>({ enabled: false })
    cache.set('key', 'value')
    expect(cache.get('key')).toBeNull()
  })

  it('enabled=false 时 set 不存储', () => {
    const cache = new LRUCache<string>({ enabled: false })
    cache.set('key', 'value')
    expect(cache.getStats().size).toBe(0)
  })
})

describe('LRUCache — 统计信息', () => {
  it('正确统计 hits/misses/hitRate', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 60000 })
    cache.set('key', 'value')
    cache.get('key') // hit
    cache.get('key') // hit
    cache.get('missing') // miss

    const stats = cache.getStats()
    expect(stats.hits).toBe(2)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo((2 / 3) * 100, 1)
  })

  it('空缓存 hitRate 为 0', () => {
    const cache = new LRUCache<string>()
    expect(cache.getStats().hitRate).toBe(0)
  })

  it('keys 返回所有缓存的 key', () => {
    const cache = new LRUCache<string>({ maxSize: 10, defaultTTL: 60000 })
    cache.set('a', '1')
    cache.set('b', '2')
    const keys = cache.keys()
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })

  it('values 返回所有缓存的值', () => {
    const cache = new LRUCache<number>({ maxSize: 10, defaultTTL: 60000 })
    cache.set('a', 100)
    cache.set('b', 200)
    const vals = cache.values()
    expect(vals).toContain(100)
    expect(vals).toContain(200)
  })
})

describe('LRUCache — 默认配置', () => {
  it('无参数构造使用默认值', () => {
    const cache = new LRUCache<string>()
    expect(cache.config.maxSize).toBe(1000)
    expect(cache.config.defaultTTL).toBe(5 * 60 * 1000)
    expect(cache.config.enabled).toBe(true)
  })
})
