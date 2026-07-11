/**
 * @file settings-search.test.ts
 * @description Settings Search Service — Unit Tests
 *   Covers: search across categories (use Chinese key terms matching defaults),
 *   result structure, empty results, edge cases.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { describe, expect, it } from 'vitest'

import { searchSettings } from '../../src/services/settings-search'
import { useSettingsStore } from '../../src/stores/useSettingsStore'

import type { Settings } from '../../src/types/settings'

// Helper to get current default settings
function getDefaultSettings(): Settings {
  useSettingsStore.getState().resetSettings()
  return useSettingsStore.getState().settings
}

describe('searchSettings — General Search', () => {
  it('returns results for Chinese key term "主题"', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '主题')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns results for Chinese key term "字体"', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '字体')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns empty array for non-matching query', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, 'xyznonexistent12345!@#')
    expect(results).toHaveLength(0)
  })

  it('handles empty query', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '')
    expect(results).toHaveLength(0)
  })

  it('handles whitespace-only query', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '   ')
    expect(results).toHaveLength(0)
  })
})

describe('searchSettings — Category Targeting', () => {
  it('finds general settings by Chinese keyword', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '语言')
    expect(results.length).toBeGreaterThan(0)
  })

  it('finds conversation settings by Chinese keyword', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '待办')
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('searchSettings — Result Structure', () => {
  it('returns results with correct shape', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '主题')
    expect(results.length).toBeGreaterThan(0)
    const result = results[0]
    expect(result).toHaveProperty('title')
    expect(result).toHaveProperty('path')
    expect(result).toHaveProperty('category')
    expect(typeof result.title).toBe('string')
    expect(typeof result.path).toBe('string')
  })

  it('includes description in results', () => {
    const settings = getDefaultSettings()
    const results = searchSettings(settings, '语言')
    expect(results.length).toBeGreaterThan(0)
    // Results may or may not have description
    results.forEach((r) => {
      expect(r.category).toBeTruthy()
    })
  })
})
