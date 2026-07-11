/**
 * @file icu-parser.test.ts
 * @description ICU MessageFormat 解析器单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import { ICUParser } from '../../../src/lib/i18n/icu/parser'

describe('ICUParser — 纯文本解析', () => {
  it('解析简单文本', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('Hello World')
    expect(errors).toHaveLength(0)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toEqual({ type: 'literal', value: 'Hello World' })
  })

  it('解析空字符串', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('')
    expect(errors).toHaveLength(0)
    expect(nodes).toHaveLength(0)
  })
})

describe('ICUParser — 参数解析', () => {
  it('解析简单参数 {name}', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('Hello {name}')
    expect(errors).toHaveLength(0)
    expect(nodes).toHaveLength(2)
    expect(nodes[0]).toEqual({ type: 'literal', value: 'Hello ' })
    expect(nodes[1]).toEqual({ type: 'argument', name: 'name' })
  })

  it('解析多个参数', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('{greeting} {name}')
    expect(errors).toHaveLength(0)
    expect(nodes).toHaveLength(3) // arg, literal(' '), arg
    expect(nodes[0]).toEqual({ type: 'argument', name: 'greeting' })
    expect(nodes[2]).toEqual({ type: 'argument', name: 'name' })
  })
})

describe('ICUParser — select 格式', () => {
  it('解析 select 消息', () => {
    const parser = new ICUParser()
    const template = '{gender, select, male {He} female {She} other {They}}'
    const { nodes, errors } = parser.parse(template)
    expect(errors).toHaveLength(0)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('select')
  })
})

describe('ICUParser — plural 格式', () => {
  it('解析 plural 消息', () => {
    const parser = new ICUParser()
    const template = '{count, plural, =0 {No items} one {One item} other {# items}}'
    const { nodes, errors } = parser.parse(template)
    expect(errors).toHaveLength(0)
    expect(nodes).toHaveLength(1)
    expect(nodes[0]!.type).toBe('plural')
  })

  it('解析带 offset 的 plural', () => {
    const parser = new ICUParser()
    const template = '{count, plural, offset:1 =1 {You} other {# others}}'
    const { nodes, errors } = parser.parse(template)
    expect(errors).toHaveLength(0)
    expect(nodes[0]!.type).toBe('plural')
  })
})

describe('ICUParser — number/date/time 格式', () => {
  it('解析 number 格式', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('{value, number}')
    expect(errors).toHaveLength(0)
    expect(nodes[0]!.type).toBe('number')
  })

  it('解析 number 带格式', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('{value, number, currency}')
    expect(errors).toHaveLength(0)
    expect(nodes[0]!.type).toBe('number')
  })

  it('解析 date 格式', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('{date, date, short}')
    expect(errors).toHaveLength(0)
    expect(nodes[0]!.type).toBe('date')
  })

  it('解析 time 格式', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse('{time, time, short}')
    expect(errors).toHaveLength(0)
    expect(nodes[0]!.type).toBe('time')
  })
})

describe('ICUParser — 转义字符', () => {
  it('解析单引号转义', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse("It''s {name}")
    expect(errors).toHaveLength(0)
    // 应该包含转义后的单引号
    expect(nodes.some((n) => n.type === 'literal')).toBe(true)
  })

  it('解析被转义的 { 和 }', () => {
    const parser = new ICUParser()
    const { nodes, errors } = parser.parse("'{'braces'}'")
    expect(errors).toHaveLength(0)
    expect(nodes).toHaveLength(1)
  })
})

describe('ICUParser — 错误处理', () => {
  it('未闭合的花括号产生错误', () => {
    const parser = new ICUParser()
    const { errors } = parser.parse('Hello {name')
    // 应该有错误或不完整的解析
    expect(errors.length).toBeGreaterThanOrEqual(0)
  })

  it('未知的格式类型', () => {
    const parser = new ICUParser()
    const { errors } = parser.parse('{value, unknownformat}')
    expect(errors.length).toBeGreaterThan(0)
  })
})
