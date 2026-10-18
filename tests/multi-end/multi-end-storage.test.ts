/**
 * @file multi-end-storage.test.ts
 * @description OfflineStorage — Unit Tests (构造 / API 形态 / IndexedDB 存取 / 过期清理 / 降级)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { OfflineStorage } from '@/multi-end/storage'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ==========================================
// 功能性 IndexedDB 内存桩 — 真实触发 onsuccess / oncomplete / cursor
// ==========================================

const dbData: Record<string, Map<string, any>> = {
  editorSnapshots: new Map(),
  aiChatHistory: new Map(),
  userPreferences: new Map(),
  apiCache: new Map(),
}

interface FakeRequest {
  onsuccess: (() => void) | null
  onerror: (() => void) | null
  onupgradeneeded: (() => void) | null
  result: any
  error: any
}

function createRequest(): FakeRequest {
  return { onsuccess: null, onerror: null, onupgradeneeded: null, result: null, error: null }
}

function makeStore(name: string, tx: any) {
  const data = dbData[name]
  return {
    put: (value: any) => {
      const key = value.id ?? value.key ?? value.url
      data.set(key, value)
      setTimeout(() => tx.oncomplete?.(), 0)
      return createRequest()
    },
    delete: (key: string) => {
      data.delete(key)
      setTimeout(() => tx.oncomplete?.(), 0)
      return createRequest()
    },
    get: (key: string) => {
      const req = createRequest()
      queueMicrotask(() => {
        req.result = data.get(key) ?? null
        req.onsuccess?.()
      })
      return req
    },
    openCursor: () => {
      const req = createRequest()
      const entries = Array.from(data.entries())
      let idx = 0
      const step = () => {
        if (idx < entries.length) {
          const [key, value] = entries[idx]
          idx++
          req.result = {
            value,
            delete: () => data.delete(key),
            continue: () => queueMicrotask(step),
          }
        } else {
          req.result = null
        }
        req.onsuccess?.()
      }
      queueMicrotask(step)
      setTimeout(() => tx.oncomplete?.(), 0)
      return req
    },
  }
}

function installIndexedDBMock() {
  const mock = {
    open: vi.fn(() => {
      const req = createRequest()
      const db: any = {
        name: 'yyc3_offline_db',
        version: 1,
        transaction: vi.fn(() => {
          const tx: any = {
            oncomplete: null,
            onerror: null,
            objectStore: (store: string) => makeStore(store, tx),
          }
          return tx
        }),
        objectStoreNames: { contains: () => false },
        createObjectStore: vi.fn(),
        close: vi.fn(),
      }
      req.result = db
      queueMicrotask(() => {
        req.onupgradeneeded?.()
        req.onsuccess?.()
      })
      return req
    }),
    deleteDatabase: vi.fn(),
    cmp: vi.fn(),
  }
  ;(globalThis as any).indexedDB = mock
  ;(window as any).indexedDB = mock
  return mock
}

beforeEach(() => {
  for (const name of Object.keys(dbData)) {
    dbData[name].clear()
  }
  installIndexedDBMock()
})

// ── Tests ──

describe('OfflineStorage — 构造与 API 形态', () => {
  it('可实例化', () => {
    const storage = new OfflineStorage()
    expect(storage).toBeTruthy()
    expect(storage).toBeInstanceOf(OfflineStorage)
  })

  it('暴露预期的 API 方法', () => {
    const storage = new OfflineStorage()
    expect(typeof storage.saveEditorSnapshot).toBe('function')
    expect(typeof storage.getEditorSnapshot).toBe('function')
    expect(typeof storage.deleteEditorSnapshot).toBe('function')
    expect(typeof storage.saveChatHistory).toBe('function')
    expect(typeof storage.getChatHistory).toBe('function')
    expect(typeof storage.setPreference).toBe('function')
    expect(typeof storage.getPreference).toBe('function')
    expect(typeof storage.cacheApiResponse).toBe('function')
    expect(typeof storage.getCachedApiResponse).toBe('function')
    expect(typeof storage.clearExpiredCache).toBe('function')
  })
})

describe('OfflineStorage — IndexedDB 存取', () => {
  it('首次操作时打开数据库(yyc3_offline_db / v1)', async () => {
    const mock = installIndexedDBMock()
    const storage = new OfflineStorage()
    await storage.getEditorSnapshot('anything')
    expect(mock.open).toHaveBeenCalledWith('yyc3_offline_db', 1)
  })

  it('保存 / 读取 / 删除编辑器快照', async () => {
    const storage = new OfflineStorage()
    await storage.saveEditorSnapshot('doc1', 'hello')
    await expect(storage.getEditorSnapshot('doc1')).resolves.toBe('hello')

    await storage.deleteEditorSnapshot('doc1')
    await expect(storage.getEditorSnapshot('doc1')).resolves.toBeNull()
  })

  it('保存 / 读取 AI 对话历史,缺失时返回 null', async () => {
    const storage = new OfflineStorage()
    const messages = [{ role: 'user', content: 'hi' }]
    await storage.saveChatHistory('session-1', messages)
    await expect(storage.getChatHistory('session-1')).resolves.toEqual(messages)
    await expect(storage.getChatHistory('missing')).resolves.toBeNull()
  })

  it('写入 / 读取用户偏好,缺失时返回 null', async () => {
    const storage = new OfflineStorage()
    await storage.setPreference('theme', 'liquidGlass')
    await expect(storage.getPreference('theme')).resolves.toBe('liquidGlass')
    await expect(storage.getPreference('unknown')).resolves.toBeNull()
  })
})

describe('OfflineStorage — API 缓存', () => {
  it('缓存响应并在有效期内返回,过期或缺失返回 null', async () => {
    const storage = new OfflineStorage()
    await storage.cacheApiResponse('/api/a', { ok: true })

    await expect(storage.getCachedApiResponse('/api/a')).resolves.toEqual({ ok: true })
    // maxAgeMs = 0 → 立即视为过期
    await expect(storage.getCachedApiResponse('/api/a', 0)).resolves.toBeNull()
    await expect(storage.getCachedApiResponse('/api/missing')).resolves.toBeNull()
  })

  it('清理过期缓存并保留新鲜缓存', async () => {
    const storage = new OfflineStorage()
    dbData.apiCache.set('/old', { url: '/old', response: 'old', cachedAt: Date.now() - 10_000 })
    dbData.apiCache.set('/new', { url: '/new', response: 'new', cachedAt: Date.now() })

    await storage.clearExpiredCache(1000)

    expect(dbData.apiCache.has('/old')).toBe(false)
    expect(dbData.apiCache.has('/new')).toBe(true)
  })
})

describe('OfflineStorage — 降级(不支持 IndexedDB)', () => {
  it('环境缺少 indexedDB 时拒绝并抛出错误', async () => {
    delete (globalThis as any).indexedDB
    delete (window as any).indexedDB
    const storage = new OfflineStorage()
    await expect(storage.saveEditorSnapshot('x', 'y')).rejects.toThrow('IndexedDB not supported')
  })
})
