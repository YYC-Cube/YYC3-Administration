/**
 * @file formatter.test.ts
 * @description i18n Formatter 单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import { formatRelativeTime, interpolate, pluralize } from '../../../src/lib/i18n/formatter'

// ==========================================
// interpolate
// ==========================================

describe('interpolate — 模板插值', () => {
  it('替换单个占位符', () => {
    expect(interpolate('Hello {name}', { name: 'World' })).toBe('Hello World')
  })

  it('替换多个占位符', () => {
    expect(interpolate('{greeting} {name}!', { greeting: 'Hi', name: 'Alice' })).toBe('Hi Alice!')
  })

  it('无参数时返回原模板', () => {
    expect(interpolate('Hello World')).toBe('Hello World')
  })

  it('空参数对象时返回原模板', () => {
    expect(interpolate('Hello {name}', {})).toBe('Hello {name}')
  })

  it('参数值为 null/undefined 时保留占位符', () => {
    expect(interpolate('Hello {name}', { name: null })).toBe('Hello {name}')
    expect(interpolate('Hello {name}', { name: undefined })).toBe('Hello {name}')
  })

  it('数字参数转为字符串', () => {
    expect(interpolate('Count: {n}', { n: 42 })).toBe('Count: 42')
  })

  it('布尔参数转为字符串', () => {
    expect(interpolate('Active: {val}', { val: true })).toBe('Active: true')
  })

  it('重复占位符全部替换', () => {
    expect(interpolate('{x} and {x}', { x: 'A' })).toBe('A and A')
  })

  it('未匹配的占位符保留原样', () => {
    expect(interpolate('Hello {name}, age {age}', { name: 'Bob' })).toBe('Hello Bob, age {age}')
  })
})

// ==========================================
// pluralize
// ==========================================

describe('pluralize — 复数处理', () => {
  it('count=1 时不加 s', () => {
    expect(pluralize('item(s)', 1)).toBe('item')
  })

  it('count!=1 时加 s', () => {
    expect(pluralize('item(s)', 0)).toBe('items')
    expect(pluralize('item(s)', 2)).toBe('items')
    expect(pluralize('item(s)', 100)).toBe('items')
  })

  it('处理 {count} 占位符', () => {
    expect(pluralize('{count} file(s)', 1)).toBe('1 file')
    expect(pluralize('{count} file(s)', 5)).toBe('5 files')
  })
})

// ==========================================
// formatRelativeTime
// ==========================================

describe('formatRelativeTime — 相对时间格式化', () => {
  it('刚刚（< 60s）', () => {
    const now = Date.now()
    expect(formatRelativeTime(now, 'en')).toBe('just now')
    expect(formatRelativeTime(now, 'zh-CN')).toBe('刚刚')
  })

  it('分钟级别', () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    expect(formatRelativeTime(fiveMinAgo, 'en')).toBe('5m ago')
    expect(formatRelativeTime(fiveMinAgo, 'zh-CN')).toBe('5分钟前')
  })

  it('小时级别', () => {
    const threeHourAgo = Date.now() - 3 * 60 * 60 * 1000
    expect(formatRelativeTime(threeHourAgo, 'en')).toBe('3h ago')
    expect(formatRelativeTime(threeHourAgo, 'zh-CN')).toBe('3小时前')
  })

  it('天级别（< 7天）', () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
    expect(formatRelativeTime(threeDaysAgo, 'en')).toBe('3d ago')
    expect(formatRelativeTime(threeDaysAgo, 'zh-CN')).toBe('3天前')
  })

  it('超过 7 天使用日期格式', () => {
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000
    const result = formatRelativeTime(tenDaysAgo, 'en')
    // 应该是日期格式而非相对时间
    expect(result).not.toContain('ago')
    expect(result.length).toBeGreaterThan(0)
  })

  it('支持多种语言', () => {
    const oneMinAgo = Date.now() - 60 * 1000
    expect(formatRelativeTime(oneMinAgo, 'ja')).toBe('1分前')
    expect(formatRelativeTime(oneMinAgo, 'ko')).toBe('1분 전')
    expect(formatRelativeTime(oneMinAgo, 'fr')).toBe('il y a 1 min')
    expect(formatRelativeTime(oneMinAgo, 'de')).toBe('vor 1 Min.')
    expect(formatRelativeTime(oneMinAgo, 'es')).toBe('hace 1 min')
    expect(formatRelativeTime(oneMinAgo, 'pt-BR')).toBe('1min atrás')
  })

  it('未知语言回退到英语', () => {
    const oneMinAgo = Date.now() - 60 * 1000
    expect(formatRelativeTime(oneMinAgo, 'xyz')).toBe('1m ago')
  })
})
