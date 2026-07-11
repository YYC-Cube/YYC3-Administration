/**
 * @file use-debounce.test.ts
 * @description YYC³ Debounce Hooks — Unit Tests
 *   Covers: useDebouncedValue, useDebouncedCallback, useThrottledCallback.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useDebouncedCallback,
  useDebouncedValue,
  useThrottledCallback,
} from '../../src/app/components/hooks/use-debounce'

// ==========================================
// Setup / Teardown
// ==========================================

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ==========================================
// useDebouncedValue
// ==========================================

describe('useDebouncedValue', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'first' },
    })

    rerender({ value: 'second' })
    expect(result.current).toBe('first') // Still old value

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('second') // Now updated
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'd' })

    expect(result.current).toBe('a') // Still not updated

    act(() => vi.advanceTimersByTime(300)) // Full delay from last change
    expect(result.current).toBe('d')
  })

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 'init' },
    })

    rerender({ value: 'updated' })
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('init')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('updated')
  })
})

// ==========================================
// useDebouncedCallback
// ==========================================

describe('useDebouncedCallback', () => {
  it('should debounce callback invocation', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    result.current('arg1')
    expect(callback).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(300))
    expect(callback).toHaveBeenCalledWith('arg1')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should cancel previous timer on rapid calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))

    result.current('first')
    result.current('second')
    result.current('third')

    act(() => vi.advanceTimersByTime(300))
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('third')
  })

  it('should cleanup timer on unmount', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300))

    result.current('test')
    unmount()

    act(() => vi.advanceTimersByTime(300))
    expect(callback).not.toHaveBeenCalled()
  })
})

// ==========================================
// useThrottledCallback
// ==========================================

describe('useThrottledCallback', () => {
  it('should invoke immediately on first call', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 100))

    result.current()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should throttle rapid calls', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 100))

    result.current()
    result.current()
    result.current()

    expect(callback).toHaveBeenCalledTimes(1) // Only first call

    act(() => vi.advanceTimersByTime(100))
    expect(callback).toHaveBeenCalledTimes(2) // Trailing call
  })

  it('should not throttle after interval passes', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottledCallback(callback, 100))

    result.current()
    act(() => vi.advanceTimersByTime(100))

    result.current()
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
