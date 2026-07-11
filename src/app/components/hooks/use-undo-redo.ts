/**
 * @file hooks/use-undo-redo.ts
 * @description YYC³ Undo/Redo Hook — Generic undo/redo state management
 *   with configurable history depth. Used for editor content, form changes,
 *   and any stateful operation requiring history reversal.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags ux,undo-redo,history,editor
 */

import { useCallback, useState } from 'react'

// ==========================================
// Types
// ==========================================

interface HistoryEntry<T> {
  state: T
  timestamp: number
  description?: string
}

interface HistoryState<T> {
  entries: HistoryEntry<T>[]
  index: number
}

// ==========================================
// Hook
// ==========================================

/**
 * Undo/Redo state management hook.
 * Maintains a bounded history stack of state changes.
 *
 * @param initialValue - The starting value
 * @param maxHistory - Maximum number of history entries (default: 50)
 * @returns State, setters, and undo/redo controls
 */
export function useUndoRedo<T>(initialValue: T, maxHistory: number = 50) {
  const [state, setState] = useState<HistoryState<T>>({
    entries: [{ state: initialValue, timestamp: Date.now() }],
    index: 0,
  })

  const present = state.entries[state.index]?.state ?? initialValue
  const canUndo = state.index > 0
  const canRedo = state.index < state.entries.length - 1

  /**
   * Push a new state onto the history stack.
   * Any future states (after undo) are discarded.
   */
  const setNewState = useCallback(
    (newValue: T | ((prev: T) => T), description?: string) => {
      setState((prev) => {
        const currentValue = prev.entries[prev.index]?.state ?? initialValue
        const resolved =
          typeof newValue === 'function' ? (newValue as (prev: T) => T)(currentValue) : newValue

        // Skip if value is unchanged (shallow compare)
        if (resolved === currentValue) return prev

        // Truncate any future history (after undo)
        const truncated = prev.entries.slice(0, prev.index + 1)

        // Add new entry
        const newEntry: HistoryEntry<T> = {
          state: resolved,
          timestamp: Date.now(),
          description,
        }

        let next = [...truncated, newEntry]

        // Enforce max history size
        if (next.length > maxHistory) {
          next = next.slice(next.length - maxHistory)
        }

        return { entries: next, index: next.length - 1 }
      })
    },
    [initialValue, maxHistory],
  )

  /** Undo the last change. No-op if at the beginning of history. */
  const undo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: Math.max(0, prev.index - 1),
    }))
  }, [])

  /** Redo a previously undone change. No-op if at the end of history. */
  const redo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: Math.min(prev.entries.length - 1, prev.index + 1),
    }))
  }, [])

  /** Reset to a new initial value, clearing all history. */
  const reset = useCallback((value: T) => {
    setState({
      entries: [{ state: value, timestamp: Date.now() }],
      index: 0,
    })
  }, [])

  /** Clear all history but keep current value. */
  const clearHistory = useCallback(() => {
    setState((prev) => ({
      entries: [prev.entries[prev.index] ?? { state: initialValue, timestamp: Date.now() }],
      index: 0,
    }))
  }, [initialValue])

  /** Get a list of history entries for display (most recent first). */
  const getHistoryList = useCallback(() => {
    return state.entries
      .slice(0, state.index + 1)
      .reverse()
      .map((entry, i) => ({
        ...entry,
        displayIndex: state.index - i,
        isCurrent: i === 0,
      }))
  }, [state.entries, state.index])

  return {
    present,
    setState: setNewState,
    undo,
    redo,
    reset,
    clearHistory,
    canUndo,
    canRedo,
    historyIndex: state.index,
    historyLength: state.entries.length,
    getHistoryList,
  }
}
