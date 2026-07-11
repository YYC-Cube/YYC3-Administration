/**
 * @file ui-utils.test.ts
 * @description UI 工具函数 cn() 单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import { cn } from '../../src/app/components/ui/utils'

describe('cn — Tailwind 类名合并', () => {
  it('合并简单类名', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('处理条件类名（对象语法）', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })

  it('处理条件类名（数组语法）', () => {
    expect(cn('base', ['flex', null, undefined, 'col'])).toBe('base flex col')
  })

  it('Tailwind 冲突类后者覆盖前者', () => {
    // twMerge 会用后一个 px-4 覆盖 px-2
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('不同属性不冲突', () => {
    expect(cn('px-2', 'py-4')).toBe('px-2 py-4')
  })

  it('空参数返回空字符串', () => {
    expect(cn()).toBe('')
  })

  it('undefined / null 被忽略', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('处理颜色冲突', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('处理 display 冲突', () => {
    expect(cn('block', 'flex')).toBe('flex')
  })

  it('混合使用条件和覆盖', () => {
    const result = cn(
      'flex items-center',
      { 'justify-center': true, hidden: false },
      'justify-between',
    )
    expect(result).toContain('justify-between')
    expect(result).not.toContain('justify-center')
  })
})
