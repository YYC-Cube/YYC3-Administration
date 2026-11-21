/**
 * @file services/doc-sync.ts
 * @description YYC³ Administration —— 通用域文档云同步工厂(P6 续/M2 批次二)
 *   复用 user_settings 同步管线:登录水合(GET /data/docs/:scope → 远端整文档
 *   覆盖本地)+ 本地变更防抖上行(PUT 全量)。适用于"store 即整文档持久化"的域
 *   (task-board 等);行式/分片域待出现查询需求时另行建模。
 *   水合竞态护栏(hydrating)与 1.5s 防抖与 settings 版一致。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags p6,m2,doc-sync,self-hosted
 */

import { apiFetch, isApiConfigured } from './api-client'

import type { DocScope } from '@server/contract/docs'

import { useAuthStore } from '@/stores/useAuthStore'

const PUSH_DEBOUNCE_MS = 1500

export interface DocSyncHandle {
  /** 登录后调用:水合 + 订阅(幂等) */
  start(userId: string): Promise<void>
  /** 登出调用:解订阅并放弃未上行变更 */
  stop(): void
}

export interface DocSyncOptions {
  /** 从 store 提取当前文档(全量) */
  pick(): Record<string, unknown>
  /** 远端文档 → store(整文档覆盖) */
  apply(remote: Record<string, unknown>): void
  /** 🔑 订阅文档 store 变更(数据变更时触发 listener → 防抖上行);
   *  订阅源必须是文档 store 本身——订阅错 auth store 会导致永不上行 */
  subscribe(fn: () => void): () => void
}

/**
 * 创建某域的同步句柄。调用方持有句柄并跟随认证生命周期 start/stop。
 * 失败策略与 settings 版一致:水合失败保留本地(下次登录重试)、上行失败静默重试。
 */
export function createDocSync(scope: DocScope, opts: DocSyncOptions): DocSyncHandle {
  let unsubStore: (() => void) | null = null
  let pushTimer: ReturnType<typeof setTimeout> | null = null
  let hydrating = false

  function isActive(): boolean {
    return (
      isApiConfigured &&
      useAuthStore.getState().status === 'authenticated' &&
      !!useAuthStore.getState().user
    )
  }

  return {
    async start(userId: string) {
      if (!isApiConfigured || unsubStore) return
      if (useAuthStore.getState().status !== 'authenticated') return
      try {
        const doc = await apiFetch<{ data: Record<string, unknown>; updatedAt: string | null }>(
          `/data/docs/${scope}`,
        )
        if (doc.updatedAt && doc.data && typeof doc.data === 'object') {
          hydrating = true
          try {
            opts.apply(doc.data)
          } finally {
            hydrating = false
          }
        }
      } catch (error) {
        console.warn(`[doc-sync:${scope}] 水合失败,保留本地:`, error)
        return
      }
      unsubStore = opts.subscribe(() => {
        if (hydrating) return
        if (pushTimer) clearTimeout(pushTimer)
        pushTimer = setTimeout(() => {
          void apiFetch(`/data/docs/${scope}`, {
            method: 'PUT',
            body: JSON.stringify({ data: opts.pick() }),
          }).catch((error) => {
            console.warn(`[doc-sync:${scope}] 上行失败(下次变更重试):`, error)
          })
        }, PUSH_DEBOUNCE_MS)
      })
      void userId // 作用域即当前登录用户;保留参数以对齐 settings 版签名
    },
    stop() {
      unsubStore?.()
      unsubStore = null
      if (pushTimer) clearTimeout(pushTimer)
      pushTimer = null
    },
  }
}
