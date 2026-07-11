/**
 * @file hooks/use-debounce.ts
 * @description YYC³ Debounce/Throttle Hooks — Performance optimization for
 *   search inputs, resize handlers, and other high-frequency events.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags performance,hooks,debounce
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Debounce a value — returns a new value that only updates after `delay` ms
 * of no changes. Useful for search inputs.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default 300ms)
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

/**
 * Debounce a callback function — returns a memoized version that delays
 * invocation until `delay` ms after the last call.
 *
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default 300ms)
 * @returns Debounced callback
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number = 300,
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  // Update the ref each render so we always call the latest callback
  callbackRef.current = callback

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay)
    },
    [delay],
  )
}

/**
 * Throttle a callback function — invokes at most once per `interval` ms.
 * Uses trailing-edge invocation to ensure the last call is always processed.
 *
 * @param callback - The function to throttle
 * @param interval - Minimum interval between invocations (default 100ms)
 * @returns Throttled callback
 */
export function useThrottledCallback<T extends (...args: never[]) => void>(
  callback: T,
  interval: number = 100,
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  callbackRef.current = callback

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const remaining = interval - (now - lastCallRef.current)

      if (remaining <= 0) {
        // Enough time has passed — invoke immediately
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        lastCallRef.current = now
        callbackRef.current(...args)
      } else if (!timerRef.current) {
        // Schedule trailing invocation
        timerRef.current = setTimeout(() => {
          lastCallRef.current = Date.now()
          timerRef.current = null
          callbackRef.current(...args)
        }, remaining)
      }
    },
    [interval],
  )
}
