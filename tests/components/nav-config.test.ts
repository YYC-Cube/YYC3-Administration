/**
 * @file nav-config.test.ts
 * @description 导航配置单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import {
  findCategoryByPageId,
  findNavItem,
  getCategoryItems,
  NAV_CATEGORIES,
} from '../../src/app/components/nav-config'

describe('NAV_CATEGORIES — 导航分类结构', () => {
  it('包含所有主要分类', () => {
    const ids = NAV_CATEGORIES.map((c) => c.id)
    expect(ids).toContain('overview')
    expect(ids).toContain('conversation')
    expect(ids).toContain('customer')
    expect(ids).toContain('toolkit')
    expect(ids).toContain('platform')
    expect(ids).toContain('marketing')
  })

  it('每个分类有 labelKey, icon, color, items', () => {
    for (const cat of NAV_CATEGORIES) {
      expect(cat.labelKey).toBeTruthy()
      expect(cat.icon).toBeDefined()
      expect(cat.color).toMatch(/^#/)
      expect(cat.items.length).toBeGreaterThan(0)
    }
  })

  it('每个子项有 id, labelKey, icon, color', () => {
    for (const cat of NAV_CATEGORIES) {
      for (const item of cat.items) {
        expect(item.id).toBeTruthy()
        expect(item.labelKey).toBeTruthy()
        expect(item.icon).toBeDefined()
        expect(item.color).toMatch(/^#/)
      }
    }
  })

  it('所有 PageId 唯一', () => {
    const allIds: string[] = []
    NAV_CATEGORIES.forEach((cat) => cat.items.forEach((item) => allIds.push(item.id)))
    const uniqueIds = new Set(allIds)
    expect(allIds.length).toBe(uniqueIds.size)
  })
})

describe('findCategoryByPageId — 通过页面 ID 查找分类', () => {
  it('找到 dashboard 所属分类', () => {
    const cat = findCategoryByPageId('dashboard')
    expect(cat).toBeDefined()
    expect(cat?.id).toBe('overview')
  })

  it('找到 chat 所属分类', () => {
    const cat = findCategoryByPageId('chat')
    expect(cat).toBeDefined()
    expect(cat?.id).toBe('conversation')
  })

  it('找到 clm 所属分类', () => {
    const cat = findCategoryByPageId('clm')
    expect(cat).toBeDefined()
    expect(cat?.id).toBe('customer')
  })

  it('未知的 pageId 返回 undefined', () => {
    expect(findCategoryByPageId('nonexistent' as never)).toBeUndefined()
  })
})

describe('getCategoryItems — 获取分类子项', () => {
  it('获取 overview 分类的子项', () => {
    const items = getCategoryItems('overview')
    expect(items.length).toBeGreaterThan(0)
    const ids = items.map((i) => i.id)
    expect(ids).toContain('dashboard')
    expect(ids).toContain('logs')
    expect(ids).toContain('insights')
  })

  it('未知分类返回空数组', () => {
    expect(getCategoryItems('nonexistent')).toEqual([])
  })
})

describe('findNavItem — 查找导航项', () => {
  it('通过 dashboard 找到导航项', () => {
    const item = findNavItem('dashboard')
    expect(item).toBeDefined()
    expect(item?.id).toBe('dashboard')
    expect(item?.labelKey).toBe('nav.dashboard')
  })

  it('通过 customerCare 找到导航项', () => {
    const item = findNavItem('customerCare')
    expect(item).toBeDefined()
    expect(item?.id).toBe('customerCare')
  })

  it('未知 pageId 返回 undefined', () => {
    expect(findNavItem('nonexistent' as never)).toBeUndefined()
  })
})
