/**
 * @file layout-presets.test.ts
 * @description YYC³ Layout Presets — Unit Tests
 *   Covers: built-in presets, custom preset CRUD, preset lookup.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  deleteCustomPreset,
  getAllPresets,
  getPreset,
  LAYOUT_PRESETS,
  loadCustomPresets,
  saveCustomPreset,
} from '../../src/app/components/panels/layout-presets'

import type { LayoutPreset } from '../../src/app/components/panels/layout-presets'

// ==========================================
// Setup
// ==========================================

beforeEach(() => {
  localStorage.clear()
})

// ==========================================
// Built-in Presets
// ==========================================

describe('Layout Presets — Built-in', () => {
  it('should have at least 5 built-in presets', () => {
    expect(LAYOUT_PRESETS.length).toBeGreaterThanOrEqual(5)
  })

  it('should include development preset', () => {
    const dev = getPreset('development')
    expect(dev).toBeDefined()
    expect(dev?.activePanel).toBe('file-explorer')
    expect(dev?.editorVisible).toBe(true)
    expect(dev?.aiAssistantVisible).toBe(true)
  })

  it('should include writing mode with collapsed panel', () => {
    const writing = getPreset('writing')
    expect(writing).toBeDefined()
    expect(writing?.panelCollapsed).toBe(true)
  })

  it('should include minimal mode with no AI assistant', () => {
    const minimal = getPreset('minimal')
    expect(minimal).toBeDefined()
    expect(minimal?.aiAssistantVisible).toBe(false)
    expect(minimal?.editorVisible).toBe(true)
  })

  it('all presets should have required fields', () => {
    for (const preset of LAYOUT_PRESETS) {
      expect(preset.id).toBeTruthy()
      expect(preset.name).toBeTruthy()
      expect(preset.description).toBeTruthy()
      expect(preset.activePanel).toBeTruthy()
      expect(typeof preset.panelWidth).toBe('number')
    }
  })

  it('should return undefined for non-existent preset', () => {
    expect(getPreset('nonexistent')).toBeUndefined()
  })
})

// ==========================================
// Custom Presets
// ==========================================

describe('Layout Presets — Custom CRUD', () => {
  const mockPreset: LayoutPreset = {
    id: 'custom-1',
    name: 'My Custom Layout',
    description: 'Custom workspace layout',
    icon: 'Star',
    activePanel: 'task-manager',
    panelWidth: 350,
    panelCollapsed: false,
    expandedFolders: ['root'],
    editorVisible: true,
    aiAssistantVisible: false,
    aiAssistantWidth: 0,
  }

  it('should save a custom preset', () => {
    saveCustomPreset(mockPreset)

    const stored = loadCustomPresets()
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe('custom-1')
    expect(stored[0].name).toBe('My Custom Layout')
  })

  it('should update existing custom preset', () => {
    saveCustomPreset(mockPreset)
    saveCustomPreset({ ...mockPreset, name: 'Updated Name' })

    const stored = loadCustomPresets()
    expect(stored).toHaveLength(1)
    expect(stored[0].name).toBe('Updated Name')
  })

  it('should delete a custom preset', () => {
    saveCustomPreset(mockPreset)
    expect(loadCustomPresets()).toHaveLength(1)

    deleteCustomPreset('custom-1')
    expect(loadCustomPresets()).toHaveLength(0)
  })

  it('should handle delete of non-existent preset gracefully', () => {
    deleteCustomPreset('nonexistent')
    expect(loadCustomPresets()).toHaveLength(0)
  })
})

// ==========================================
// getAllPresets
// ==========================================

describe('Layout Presets — getAllPresets', () => {
  it('should combine built-in and custom presets', () => {
    const customPreset: LayoutPreset = {
      id: 'custom-combined',
      name: 'Combined Test',
      description: 'Test',
      icon: 'Star',
      activePanel: 'file-explorer',
      panelWidth: 300,
      panelCollapsed: false,
      expandedFolders: [],
      editorVisible: true,
      aiAssistantVisible: true,
      aiAssistantWidth: 380,
    }

    saveCustomPreset(customPreset)

    const all = getAllPresets()
    expect(all.length).toBe(LAYOUT_PRESETS.length + 1)
    expect(all.some((p) => p.id === 'custom-combined')).toBe(true)
    expect(all.some((p) => p.id === 'development')).toBe(true)
  })
})
