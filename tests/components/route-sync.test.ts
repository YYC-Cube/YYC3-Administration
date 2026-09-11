/**
 * Unit Tests: route-sync 数据面(P2-② hash 路由化)
 * 覆盖:PAGE_IDS 与 nav-config/PageId 的完整性守卫、isPageId 判定
 * (双向同步的 POP/PUSH 行为由 E2E NAV-007/008 端到端验证)
 */

import { describe, expect, it } from 'vitest'

import { isPageId, PAGE_IDS } from '@/app/components/route-sync'

describe('route-sync — 可路由页面清单', () => {
  it('PAGE_IDS 覆盖全部 41 个 PageId(nav-config 单一来源派生)', () => {
    expect(PAGE_IDS).toHaveLength(41)
    for (const id of [
      'dashboard',
      'chat',
      'devWorkspace',
      'taskBoard',
      'nlpProcessing',
      'inventory',
    ]) {
      expect(PAGE_IDS).toContain(id)
    }
  })

  it('PAGE_IDS 无重复', () => {
    expect(new Set(PAGE_IDS).size).toBe(PAGE_IDS.length)
  })

  it('isPageId 接受合法 id,拒绝未知路径与注入串', () => {
    expect(isPageId('settings')).toBe(true)
    expect(isPageId('..')).toBe(false)
    expect(isPageId('')).toBe(false)
    expect(isPageId('dashboard/../../etc')).toBe(false)
    expect(isPageId('__proto__')).toBe(false)
  })
})
