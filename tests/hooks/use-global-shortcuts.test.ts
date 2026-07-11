/**
 * @file use-global-shortcuts.test.ts
 * @description YYC³ Global Shortcuts Hook — Unit Tests
 *   Covers: combo parsing, formatCombo, shortcut registration.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_SHORTCUTS,
  formatCombo,
  useGlobalShortcuts,
} from '../../src/app/components/hooks/use-global-shortcuts'

// ==========================================
// formatCombo
// ==========================================

describe('formatCombo', () => {
  it('should format ctrl+k combo', () => {
    const formatted = formatCombo('ctrl+k')
    // Non-Mac: "Ctrl+K", Mac: "⌃K" or similar
    expect(formatted).toBeTruthy()
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('should format shift+/ combo', () => {
    const formatted = formatCombo('shift+/')
    expect(formatted).toBeTruthy()
  })

  it('should format escape key', () => {
    const formatted = formatCombo('escape')
    expect(formatted.toLowerCase()).toContain('esc')
  })

  it('should format enter key', () => {
    const formatted = formatCombo('enter')
    expect(formatted).toContain('↵')
  })

  it('should format arrow keys', () => {
    expect(formatCombo('up')).toContain('↑')
    expect(formatCombo('down')).toContain('↓')
    expect(formatCombo('left')).toContain('←')
    expect(formatCombo('right')).toContain('→')
  })
})

// ==========================================
// DEFAULT_SHORTCUTS
// ==========================================

describe('DEFAULT_SHORTCUTS', () => {
  it('should include command palette shortcut', () => {
    const cmdPalette = DEFAULT_SHORTCUTS.find((s) => s.id === 'cmd-palette')
    expect(cmdPalette).toBeDefined()
    expect(cmdPalette?.combo).toBe('ctrl+k')
  })

  it('should have unique IDs', () => {
    const ids = DEFAULT_SHORTCUTS.map((s) => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('should all have labels and combos', () => {
    for (const shortcut of DEFAULT_SHORTCUTS) {
      expect(shortcut.label).toBeTruthy()
      expect(shortcut.combo).toBeTruthy()
    }
  })
})

// ==========================================
// useGlobalShortcuts Hook
// ==========================================

describe('useGlobalShortcuts Hook', () => {
  it('should call handler on matching key combo', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() =>
      useGlobalShortcuts([{ id: 'test', label: 'Test', combo: 'ctrl+k', handler }]),
    )

    // Simulate Ctrl+K
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event)
    })

    expect(handler).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('should not call handler on non-matching combo', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() =>
      useGlobalShortcuts([{ id: 'test', label: 'Test', combo: 'ctrl+k', handler }]),
    )

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'j', // Wrong key
        ctrlKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event)
    })

    expect(handler).not.toHaveBeenCalled()

    unmount()
  })

  it('should respect enabled flag', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() =>
      useGlobalShortcuts([
        { id: 'test', label: 'Test', combo: 'ctrl+s', handler, enabled: false },
      ]),
    )

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event)
    })

    expect(handler).not.toHaveBeenCalled()

    unmount()
  })

  it('should cleanup event listener on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() =>
      useGlobalShortcuts([{ id: 'test', label: 'Test', combo: 'ctrl+k', handler }]),
    )

    unmount()

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      window.dispatchEvent(event)
    })

    expect(handler).not.toHaveBeenCalled()
  })
})
