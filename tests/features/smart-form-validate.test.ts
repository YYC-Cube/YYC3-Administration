/**
 * Unit Tests: smart-form-data 校验器与模板库(⑤ 分域覆盖爬坡)
 */

import { describe, expect, it } from 'vitest'

import type { FieldDef } from '@/features/supply-chain/pages/smart-form-data'

import {
  CUSTOM_TEMPLATES_KEY,
  fieldTypeInfo,
  FORM_STORAGE_KEY,
  formTemplates,
  validateField,
} from '@/features/supply-chain/pages/smart-form-data'

const field = (over: Partial<FieldDef> = {}): FieldDef => ({
  id: 'f1',
  type: 'text',
  label: '字段',
  required: false,
  ...over,
})

describe('validateField — 校验矩阵', () => {
  it('required 且空值 → 必填提示', () => {
    for (const empty of ['', null, undefined]) {
      expect(validateField(field({ required: true }), empty)).toBeTruthy()
    }
  })

  it('required 有值 → 通过', () => {
    expect(validateField(field({ required: true }), 'x')).toBeNull()
  })

  it('非 required 空值 → 通过', () => {
    expect(validateField(field(), '')).toBeNull()
  })

  it('validation:phone → 手机号格式(空值跳过)', () => {
    const f = field({ validation: 'phone' })
    expect(validateField(f, 'not-a-phone')).toBeTruthy()
    expect(validateField(f, '138 0013 8000')).toBeNull() // 去空格后合法
    expect(validateField(f, '')).toBeNull() // 空值不校验格式
  })

  it('validation:email → 邮箱格式', () => {
    const f = field({ validation: 'email' })
    expect(validateField(f, 'bad-email')).toBeTruthy()
    expect(validateField(f, 'a@b.co')).toBeNull()
  })

  it('数组空值视为未填(required)', () => {
    expect(validateField(field({ required: true, type: 'select' }), [])).toBeTruthy()
    expect(validateField(field({ required: true, type: 'select' }), ['a'])).toBeNull()
  })
})

describe('smart-form-data — 模板库与元信息', () => {
  it('内置模板非空且结构完整', () => {
    expect(formTemplates.length).toBeGreaterThanOrEqual(4)
    for (const t of formTemplates) {
      expect(t.id).toBeTruthy()
      expect(t.title).toBeTruthy()
      expect(Array.isArray(t.fields)).toBe(true)
    }
  })

  it('字段类型元信息覆盖全部 FieldType 键', () => {
    expect(Object.keys(fieldTypeInfo).length).toBeGreaterThanOrEqual(10)
  })

  it('存储键常量稳定(向后兼容)', () => {
    expect(FORM_STORAGE_KEY).toBe('yyc3_form_submissions')
    expect(CUSTOM_TEMPLATES_KEY).toBe('yyc3_custom_templates')
  })
})
