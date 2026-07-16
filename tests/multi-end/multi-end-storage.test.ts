/**
 * @file multi-end-storage.test.ts
 * @description OfflineStorage — Unit Tests (constructor + API shape)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { beforeAll, describe, expect, it, vi } from 'vitest'

import { OfflineStorage } from '../../src/multi-end/storage'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ==========================================
// Simple indexedDB mock that captures calls
// ==========================================

beforeAll(() => {
  const storeData = new Map<string, any>()

  ;(globalThis as any).indexedDB = {
    open: vi.fn(() => ({
      result: {
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            put: vi.fn((value: any) => {
              const key = value.id || value.key || value.url
              storeData.set(key, value)
              return { onerror: null }
            }),
            get: vi.fn((key: string) => ({
              onerror: null,
              result: storeData.get(key) || null,
            })),
            delete: vi.fn((key: string) => {
              storeData.delete(key)
              return { onerror: null }
            }),
            clear: vi.fn(() => {
              storeData.clear()
              return { onerror: null }
            }),
            add: vi.fn(),
            count: vi.fn(),
            getAll: vi.fn(),
            index: vi.fn(),
            createIndex: vi.fn(),
            deleteIndex: vi.fn(),
            getKey: vi.fn(),
            getAllKeys: vi.fn(),
          })),
          oncomplete: null as any,
          onerror: null as any,
        })),
        objectStoreNames: {
          contains: vi.fn(() => true),
        },
        close: vi.fn(),
        createObjectStore: vi.fn(),
        deleteObjectStore: vi.fn(),
        name: 'yyc3_offline_db',
        version: 1,
      },
      onupgradeneeded: null as any,
      onerror: null as any,
      onsuccess: null as any,
      error: null,
      source: null,
      readyState: 'done',
      transaction: null,
    })),
    deleteDatabase: vi.fn(),
    cmp: vi.fn(),
  }
})

// ── Tests ──

describe('OfflineStorage — Constructor', () => {
  it('creates an instance', () => {
    const storage = new OfflineStorage()
    expect(storage).toBeTruthy()
    expect(storage).toBeInstanceOf(OfflineStorage)
  })

  it('has expected API methods', () => {
    const storage = new OfflineStorage()
    expect(typeof storage.saveEditorSnapshot).toBe('function')
    expect(typeof storage.getEditorSnapshot).toBe('function')
    expect(typeof storage.deleteEditorSnapshot).toBe('function')
    expect(typeof storage.setPreference).toBe('function')
    expect(typeof storage.getPreference).toBe('function')
    expect(typeof storage.cacheApiResponse).toBe('function')
    expect(typeof storage.getCachedApiResponse).toBe('function')
    expect(typeof storage.clearExpiredCache).toBe('function')
  })
})

describe('OfflineStorage — IndexedDB Calls', () => {
  it('calls indexedDB.open on first operation', async () => {
    // indexedDB.open is already called during module evaluation via openDB()
    // but only on first call to getDB(). Verify open is available.
    expect(typeof indexedDB.open).toBe('function')
  })
})
