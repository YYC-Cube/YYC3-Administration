/**
 * @file registry.test.ts
 * @description i18n 语言注册表单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from '../../../src/lib/i18n/registry'

describe('SUPPORTED_LOCALES — 支持的语言列表', () => {
  it('包含英语作为默认语言', () => {
    expect(SUPPORTED_LOCALES).toContain('en')
  })

  it('包含中文（简体和繁体）', () => {
    expect(SUPPORTED_LOCALES).toContain('zh-CN')
    expect(SUPPORTED_LOCALES).toContain('zh-TW')
  })

  it('包含日语、韩语', () => {
    expect(SUPPORTED_LOCALES).toContain('ja')
    expect(SUPPORTED_LOCALES).toContain('ko')
  })

  it('包含欧洲语言', () => {
    expect(SUPPORTED_LOCALES).toContain('fr')
    expect(SUPPORTED_LOCALES).toContain('de')
    expect(SUPPORTED_LOCALES).toContain('es')
    expect(SUPPORTED_LOCALES).toContain('pt-BR')
  })

  it('包含阿拉伯语', () => {
    expect(SUPPORTED_LOCALES).toContain('ar')
  })

  it('至少有 10 种语言', () => {
    expect(SUPPORTED_LOCALES.length).toBeGreaterThanOrEqual(10)
  })
})

describe('DEFAULT_LOCALE — 默认语言', () => {
  it('默认语言为英语', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })
})

describe('isSupportedLocale — 判断是否支持', () => {
  it('支持的语言返回 true', () => {
    expect(isSupportedLocale('en')).toBe(true)
    expect(isSupportedLocale('zh-CN')).toBe(true)
    expect(isSupportedLocale('ja')).toBe(true)
    expect(isSupportedLocale('ar')).toBe(true)
  })

  it('不支持的语言返回 false', () => {
    expect(isSupportedLocale('xyz')).toBe(false)
    expect(isSupportedLocale('')).toBe(false)
    expect(isSupportedLocale('zh-XX')).toBe(false)
  })

  it('作为类型守卫正确工作', () => {
    const locale: string = 'en'
    if (isSupportedLocale(locale)) {
      // TypeScript 应该推断 locale 为 Locale 类型
      expect(locale).toBe('en')
    }
  })
})
