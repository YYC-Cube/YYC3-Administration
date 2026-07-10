/**
 * @file multi-end/storage.ts
 * @description YYC³ 多端离线存储服务 — IndexedDB 封装
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @status stable
 * @tags multi-end,storage,indexeddb,offline
 */

// ==========================================
// 存储分层策略（对齐规范文档第 6.1 节）
// 内存 → Zustand 状态
// 本地持久化 → IndexedDB（本模块）
// 云端 → 后端 API
// ==========================================

const DB_NAME = 'yyc3_offline_db'
const DB_VERSION = 1

interface StoreSchema {
  editorSnapshots: { id: string; content: string; updatedAt: number }
  aiChatHistory: { id: string; sessionId: string; messages: unknown; updatedAt: number }
  userPreferences: { key: string; value: unknown }
  apiCache: { url: string; response: unknown; cachedAt: number }
}

type StoreName = keyof StoreSchema

/**
 * 打开/初始化 IndexedDB 数据库
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('editorSnapshots')) {
        db.createObjectStore('editorSnapshots', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('aiChatHistory')) {
        db.createObjectStore('aiChatHistory', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('apiCache')) {
        db.createObjectStore('apiCache', { keyPath: 'url' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * 离线存储管理器
 */
export class OfflineStorage {
  private dbPromise: Promise<IDBDatabase> | null = null

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB()
    }
    return this.dbPromise
  }

  // ---- 编辑器快照 ----

  async saveEditorSnapshot(id: string, content: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('editorSnapshots', 'readwrite')
      tx.objectStore('editorSnapshots').put({ id, content, updatedAt: Date.now() })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getEditorSnapshot(id: string): Promise<string | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('editorSnapshots', 'readonly')
      const request = tx.objectStore('editorSnapshots').get(id)
      request.onsuccess = () => resolve(request.result?.content ?? null)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteEditorSnapshot(id: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('editorSnapshots', 'readwrite')
      tx.objectStore('editorSnapshots').delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  // ---- AI 对话历史 ----

  async saveChatHistory(sessionId: string, messages: unknown): Promise<void> {
    const db = await this.getDB()
    const id = `chat_${sessionId}`
    return new Promise((resolve, reject) => {
      const tx = db.transaction('aiChatHistory', 'readwrite')
      tx.objectStore('aiChatHistory').put({ id, sessionId, messages, updatedAt: Date.now() })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getChatHistory(sessionId: string): Promise<unknown | null> {
    const db = await this.getDB()
    const id = `chat_${sessionId}`
    return new Promise((resolve, reject) => {
      const tx = db.transaction('aiChatHistory', 'readonly')
      const request = tx.objectStore('aiChatHistory').get(id)
      request.onsuccess = () => resolve(request.result?.messages ?? null)
      request.onerror = () => reject(request.error)
    })
  }

  // ---- 用户偏好 ----

  async setPreference(key: string, value: unknown): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('userPreferences', 'readwrite')
      tx.objectStore('userPreferences').put({ key, value })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getPreference<T>(key: string): Promise<T | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('userPreferences', 'readonly')
      const request = tx.objectStore('userPreferences').get(key)
      request.onsuccess = () => resolve((request.result?.value as T) ?? null)
      request.onerror = () => reject(request.error)
    })
  }

  // ---- API 缓存 ----

  async cacheApiResponse(url: string, response: unknown): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('apiCache', 'readwrite')
      tx.objectStore('apiCache').put({ url, response, cachedAt: Date.now() })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async getCachedApiResponse<T>(url: string, maxAgeMs = 5 * 60 * 1000): Promise<T | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('apiCache', 'readonly')
      const request = tx.objectStore('apiCache').get(url)
      request.onsuccess = () => {
        const entry = request.result
        if (entry && Date.now() - entry.cachedAt < maxAgeMs) {
          resolve(entry.response as T)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  /** 清理过期缓存 */
  async clearExpiredCache(maxAgeMs = 24 * 60 * 60 * 1000): Promise<void> {
    const db = await this.getDB()
    const now = Date.now()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('apiCache', 'readwrite')
      const store = tx.objectStore('apiCache')
      const request = store.openCursor()
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          if (now - cursor.value.cachedAt > maxAgeMs) {
            cursor.delete()
          }
          cursor.continue()
        }
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }
}

/** 单例 */
export const offlineStorage = new OfflineStorage()