/**
 * @file detector.test.ts
 * @description i18n 语言检测单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import {
  detectSystemLocale,
  isChineseLocale,
  normalizeLocale,
} from '../../../src/lib/i18n/detector'

// ==========================================
// normalizeLocale
// ==========================================

describe('normalizeLocale — 语言标签归一化', () => {
  it('常见中文标签归一化为 zh-CN', () => {
    expect(normalizeLocale('zh')).toBe('zh-CN')
    expect(normalizeLocale('zh-CN')).toBe('zh-CN')
    expect(normalizeLocale('zh_cn')).toBe('zh-CN')
    expect(normalizeLocale('zh-Hans')).toBe('zh-CN')
    expect(normalizeLocale('zh-hans-cn')).toBe('zh-CN')
  })

  it('繁体中文归一化为 zh-TW', () => {
    expect(normalizeLocale('zh-TW')).toBe('zh-TW')
    expect(normalizeLocale('zh_hk')).toBe('zh-TW')
    expect(normalizeLocale('zh-Hant')).toBe('zh-TW')
  })

  it('英语标签归一化', () => {
    expect(normalizeLocale('en')).toBe('en')
    expect(normalizeLocale('en-US')).toBe('en')
    expect(normalizeLocale('en_gb')).toBe('en')
  })

  it('日语归一化', () => {
    expect(normalizeLocale('ja')).toBe('ja')
    expect(normalizeLocale('ja-JP')).toBe('ja')
  })

  it('韩语归一化', () => {
    expect(normalizeLocale('ko')).toBe('ko')
    expect(normalizeLocale('ko-KR')).toBe('ko')
  })

  it('法语归一化', () => {
    expect(normalizeLocale('fr')).toBe('fr')
    expect(normalizeLocale('fr-FR')).toBe('fr')
  })

  it('德语归一化', () => {
    expect(normalizeLocale('de')).toBe('de')
    expect(normalizeLocale('de_de')).toBe('de')
  })

  it('西班牙语归一化', () => {
    expect(normalizeLocale('es')).toBe('es')
    expect(normalizeLocale('es-ES')).toBe('es')
  })

  it('葡萄牙语归一化为 pt-BR', () => {
    expect(normalizeLocale('pt')).toBe('pt-BR')
    expect(normalizeLocale('pt-BR')).toBe('pt-BR')
  })

  it('阿拉伯语归一化', () => {
    expect(normalizeLocale('ar')).toBe('ar')
    expect(normalizeLocale('ar-SA')).toBe('ar')
  })

  it('带编码后缀的 locale (如 .UTF-8) 正确解析', () => {
    expect(normalizeLocale('zh_CN.UTF-8')).toBe('zh-CN')
    expect(normalizeLocale('en_US.UTF-8')).toBe('en')
  })

  it('大写标签归一化', () => {
    expect(normalizeLocale('ZH-CN')).toBe('zh-CN')
    expect(normalizeLocale('EN')).toBe('en')
  })

  it('未知语言返回 null', () => {
    expect(normalizeLocale('xyz')).toBeNull()
    expect(normalizeLocale('')).toBeNull()
  })
})

// ==========================================
// isChineseLocale
// ==========================================

describe('isChineseLocale — 中文检测', () => {
  it('zh-CN 是中文', () => {
    expect(isChineseLocale('zh-CN')).toBe(true)
  })

  it('zh-TW 是中文', () => {
    expect(isChineseLocale('zh-TW')).toBe(true)
  })

  it('en 不是中文', () => {
    expect(isChineseLocale('en')).toBe(false)
  })

  it('ja 不是中文', () => {
    expect(isChineseLocale('ja')).toBe(false)
  })
})

// ==========================================
// detectSystemLocale
// ==========================================

describe('detectSystemLocale — 系统语言检测', () => {
  it('返回有效的检测结果', () => {
    const result = detectSystemLocale('ja-JP')
    expect(result.locale).toBeTruthy()
    expect(['env', 'system', 'storage', 'default']).toContain(result.source)
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('无 storedLocale 时回退到 system/default', () => {
    const result = detectSystemLocale(null)
    expect(result.locale).toBeTruthy()
    expect(result.source).toBeDefined()
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('无效 storedLocale 被忽略', () => {
    const result = detectSystemLocale('invalid-locale-xyz')
    expect(result).toBeDefined()
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('返回结果包含必需字段', () => {
    const result = detectSystemLocale()
    expect(result).toHaveProperty('locale')
    expect(result).toHaveProperty('source')
    expect(result).toHaveProperty('confidence')
  })
})
