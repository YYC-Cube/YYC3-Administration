/**
 * @file icu-compiler.test.ts
 * @description ICU MessageFormat 编译器单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import { ICUCompiler } from '../../../src/lib/i18n/icu/compiler'
import { ICUParser } from '../../../src/lib/i18n/icu/parser'

function compile(template: string, params: Record<string, unknown>, locale = 'en') {
  const parser = new ICUParser()
  const { nodes } = parser.parse(template)
  const compiler = new ICUCompiler()
  return compiler.compile(nodes, { locale, params })
}

describe('ICUCompiler — 字面量和参数', () => {
  it('编译纯文本', () => {
    expect(compile('Hello World', {})).toBe('Hello World')
  })

  it('编译简单参数', () => {
    expect(compile('Hello {name}', { name: 'Alice' })).toBe('Hello Alice')
  })

  it('编译多个参数', () => {
    expect(compile('{greeting} {name}!', { greeting: 'Hi', name: 'Bob' })).toBe('Hi Bob!')
  })

  it('参数缺失时返回空字符串', () => {
    expect(compile('Hello {name}', {})).toBe('Hello ')
  })
})

describe('ICUCompiler — select', () => {
  it('选择正确的 select 子句', () => {
    const template = '{gender, select, male {He} female {She} other {They}}'
    expect(compile(template, { gender: 'male' })).toBe('He')
    expect(compile(template, { gender: 'female' })).toBe('She')
    expect(compile(template, { gender: 'other' })).toBe('They')
    expect(compile(template, { gender: 'unknown' })).toBe('They') // fallback to other
  })
})

describe('ICUCompiler — plural (英语)', () => {
  const template = '{count, plural, =0 {No items} one {One item} other {# items}}'

  it('=0 精确匹配', () => {
    expect(compile(template, { count: 0 }, 'en')).toBe('No items')
  })

  it('one 匹配单数', () => {
    expect(compile(template, { count: 1 }, 'en')).toBe('One item')
  })

  it('other 匹配复数（# 替换为数字）', () => {
    expect(compile(template, { count: 5 }, 'en')).toBe('5 items')
    expect(compile(template, { count: 100 }, 'en')).toBe('100 items')
  })
})

describe('ICUCompiler — plural (中文/日语)', () => {
  it('中文始终使用 other', () => {
    const template = '{count, plural, other {# 个项目}}'
    expect(compile(template, { count: 1 }, 'zh-CN')).toBe('1 个项目')
    expect(compile(template, { count: 5 }, 'zh-CN')).toBe('5 个项目')
  })

  it('日语始终使用 other', () => {
    const template = '{count, plural, other {# 個}}'
    expect(compile(template, { count: 1 }, 'ja')).toBe('1 個')
  })
})

describe('ICUCompiler — plural (阿拉伯语)', () => {
  it('阿拉伯语有复杂的复数规则', () => {
    const template =
      '{count, plural, zero {صفر} one {واحد} two {اثنان} few {قليل} many {كثير} other {أخرى}}'
    expect(compile(template, { count: 0 }, 'ar')).toBe('صفر')
    expect(compile(template, { count: 1 }, 'ar')).toBe('واحد')
    expect(compile(template, { count: 2 }, 'ar')).toBe('اثنان')
    expect(compile(template, { count: 5 }, 'ar')).toBe('قليل') // 3-10 = few
    expect(compile(template, { count: 15 }, 'ar')).toBe('كثير') // 11-99 = many
    expect(compile(template, { count: 100 }, 'ar')).toBe('أخرى') // other
  })
})

describe('ICUCompiler — plural with offset', () => {
  it('offset 影响显示数量', () => {
    const template = '{count, plural, offset:1 =1 {You} other {# others}}'
    // count=2, offset=1 → displayCount=1 → matches =1
    expect(compile(template, { count: 2 }, 'en')).toBe('You')
    // count=4, offset=1 → displayCount=3 → other
    expect(compile(template, { count: 4 }, 'en')).toBe('3 others')
  })
})

describe('ICUCompiler — number 格式', () => {
  it('格式化数字', () => {
    const result = compile('{value, number}', { value: 1234567 }, 'en')
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('无效数字返回原值字符串', () => {
    const result = compile('{value, number}', { value: 'abc' }, 'en')
    expect(result).toBe('abc')
  })
})

describe('ICUCompiler — date/time 格式', () => {
  it('格式化日期', () => {
    const date = new Date('2026-01-15')
    const result = compile('{date, date}', { date }, 'en')
    expect(result).toContain('2026')
  })

  it('格式化时间', () => {
    const date = new Date('2026-01-15T10:30:00')
    const result = compile('{time, time}', { time: date }, 'en')
    expect(result.length).toBeGreaterThan(0)
  })

  it('无效日期返回原值', () => {
    const result = compile('{date, date}', { date: 'invalid' }, 'en')
    expect(result).toBe('invalid')
  })
})

describe('ICUCompiler — 自定义格式化器', () => {
  it('使用自定义 pluralRule', () => {
    const parser = new ICUParser()
    const { nodes } = parser.parse('{count, plural, one {one} other {other}}')
    const compiler = new ICUCompiler()
    const customRule = (_locale: string, _count: number) => 'other'
    const result = compiler.compile(nodes, {
      locale: 'en',
      params: { count: 1 },
      pluralRule: customRule,
    })
    expect(result).toBe('other') // 自定义规则总是返回 other
  })

  it('使用自定义 formatNumber', () => {
    const parser = new ICUParser()
    const { nodes } = parser.parse('{value, number}')
    const compiler = new ICUCompiler()
    const result = compiler.compile(nodes, {
      locale: 'en',
      params: { value: 42 },
      formatNumber: () => 'NUM_42',
    })
    expect(result).toBe('NUM_42')
  })
})
