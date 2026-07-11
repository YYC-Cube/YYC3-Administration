/**
 * @file use-undo-redo.test.ts
 * @description YYC³ Undo/Redo Hook — Unit Tests
 *   Covers: state changes, undo, redo, reset, history tracking.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useUndoRedo } from '../../src/app/components/hooks/use-undo-redo'

// ==========================================
// Initial State
// ==========================================

describe('useUndoRedo — Initial State', () => {
  it('should initialize with the provided value', () => {
    const { result } = renderHook(() => useUndoRedo('initial'))
    expect(result.current.present).toBe('initial')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.historyIndex).toBe(0)
  })

  it('should not allow undo/redo initially', () => {
    const { result } = renderHook(() => useUndoRedo(42))

    act(() => result.current.undo())
    expect(result.current.present).toBe(42)

    act(() => result.current.redo())
    expect(result.current.present).toBe(42)
  })
})

// ==========================================
// State Changes
// ==========================================

describe('useUndoRedo — State Changes', () => {
  it('should track state changes', () => {
    const { result } = renderHook(() => useUndoRedo('a'))

    act(() => result.current.setState('b'))
    expect(result.current.present).toBe('b')
    expect(result.current.canUndo).toBe(true)
    expect(result.current.historyIndex).toBe(1)

    act(() => result.current.setState('c'))
    expect(result.current.present).toBe('c')
    expect(result.current.historyIndex).toBe(2)
  })

  it('should support functional updates', () => {
    const { result } = renderHook(() => useUndoRedo(0))

    act(() => result.current.setState((prev) => prev + 1))
    expect(result.current.present).toBe(1)

    act(() => result.current.setState((prev) => prev + 10))
    expect(result.current.present).toBe(11)
  })

  it('should skip identical values', () => {
    const { result } = renderHook(() => useUndoRedo('same'))

    act(() => result.current.setState('same'))
    expect(result.current.historyIndex).toBe(0)
    expect(result.current.canUndo).toBe(false)
  })
})

// ==========================================
// Undo / Redo
// ==========================================

describe('useUndoRedo — Undo/Redo', () => {
  it('should undo to previous state', () => {
    const { result } = renderHook(() => useUndoRedo('a'))

    act(() => result.current.setState('b'))
    act(() => result.current.setState('c'))

    act(() => result.current.undo())
    expect(result.current.present).toBe('b')

    act(() => result.current.undo())
    expect(result.current.present).toBe('a')

    expect(result.current.canUndo).toBe(false)
  })

  it('should redo to next state', () => {
    const { result } = renderHook(() => useUndoRedo('a'))

    act(() => result.current.setState('b'))
    act(() => result.current.undo())

    expect(result.current.canRedo).toBe(true)

    act(() => result.current.redo())
    expect(result.current.present).toBe('b')
  })

  it('should discard future history on new change after undo', () => {
    const { result } = renderHook(() => useUndoRedo('a'))

    act(() => result.current.setState('b'))
    act(() => result.current.setState('c'))
    act(() => result.current.undo()) // Back to 'b'

    act(() => result.current.setState('d')) // New branch

    expect(result.current.present).toBe('d')
    expect(result.current.canRedo).toBe(false) // 'c' is discarded
    expect(result.current.historyLength).toBe(3) // a, b, d
  })
})

// ==========================================
// Reset & ClearHistory
// ==========================================

describe('useUndoRedo — Reset & Clear', () => {
  it('should reset to a new value with fresh history', () => {
    const { result } = renderHook(() => useUndoRedo('a'))

    act(() => result.current.setState('b'))
    act(() => result.current.setState('c'))

    act(() => result.current.reset('fresh'))

    expect(result.current.present).toBe('fresh')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.historyLength).toBe(1)
  })

  it('should clear history but keep current value', () => {
    const { result } = renderHook(() => useUndoRedo('a'))

    act(() => result.current.setState('b'))
    act(() => result.current.setState('c'))

    act(() => result.current.clearHistory())

    expect(result.current.present).toBe('c')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.historyLength).toBe(1)
  })
})

// ==========================================
// History Limit
// ==========================================

describe('useUndoRedo — History Limit', () => {
  it('should enforce max history size', () => {
    const { result } = renderHook(() => useUndoRedo(0, 5))

    for (let i = 1; i <= 10; i++) {
      act(() => result.current.setState(i))
    }

    expect(result.current.historyLength).toBeLessThanOrEqual(6) // max 5 entries + 1
  })
})

// ==========================================
// History List
// ==========================================

describe('useUndoRedo — History List', () => {
  it('should return history entries with metadata', () => {
    const { result } = renderHook(() => useUndoRedo('a'))

    act(() => result.current.setState('b'))
    act(() => result.current.setState('c'))

    const list = result.current.getHistoryList()
    expect(list.length).toBe(3)
    expect(list[0].state).toBe('c') // Most recent first
    expect(list[0].isCurrent).toBe(true)
    expect(list[2].state).toBe('a')
  })
})
