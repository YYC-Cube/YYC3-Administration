/**
 * @file use-chat-stream.test.ts
 * @description YYC³ Chat Stream Hook — Unit Tests
 *   Covers: simulated streaming, real SSE streaming, abort, reset.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useChatStream } from '../../src/app/components/hooks/use-chat-stream'

// ==========================================
// Real SSE Stream (test these first — no fake timers needed)
// ==========================================

describe('useChatStream — Real SSE Stream', () => {
  it('should consume async generator and accumulate content', async () => {
    const { result } = renderHook(() => useChatStream())

    async function* mockStream() {
      yield { token: 'Hello', done: false }
      yield { token: ' ', done: false }
      yield { token: 'World', done: false }
      yield { token: '', done: true }
    }

    await act(async () => {
      await result.current.startRealStream(mockStream(), 'msg4')
    })

    expect(result.current.streamState.content).toBe('Hello World')
    expect(result.current.streamState.isStreaming).toBe(false)
    expect(result.current.streamState.messageId).toBe('msg4')
  })

  it('should handle empty stream', async () => {
    const { result } = renderHook(() => useChatStream())

    async function* emptyStream() {
      yield { token: '', done: true }
    }

    await act(async () => {
      await result.current.startRealStream(emptyStream(), 'msg5')
    })

    expect(result.current.streamState.content).toBe('')
    expect(result.current.streamState.isStreaming).toBe(false)
  })

  it('should handle stream with abort', async () => {
    const { result } = renderHook(() => useChatStream())

    async function* longStream() {
      yield { token: 'part1', done: false }
      await new Promise((r) => setTimeout(r, 50))
      yield { token: 'part2', done: false }
      yield { token: '', done: true }
    }

    let streamPromise: Promise<string> | null = null
    act(() => {
      streamPromise = result.current.startRealStream(longStream(), 'msg6')
    })

    await act(async () => {
      result.current.stopStream()
      if (streamPromise) await streamPromise
    })

    expect(result.current.streamState.isStreaming).toBe(false)
  })
})

// ==========================================
// Stop & Reset
// ==========================================

describe('useChatStream — Stop & Reset', () => {
  it('should set isStreaming to false on stopStream', async () => {
    const { result } = renderHook(() => useChatStream())

    act(() => {
      result.current.stopStream()
    })

    expect(result.current.streamState.isStreaming).toBe(false)
  })

  it('should clear all state on reset', () => {
    const { result } = renderHook(() => useChatStream())

    act(() => {
      result.current.resetStream()
    })

    expect(result.current.streamState.content).toBe('')
    expect(result.current.streamState.isStreaming).toBe(false)
    expect(result.current.streamState.messageId).toBeNull()
  })
})

// ==========================================
// isStreamingFor
// ==========================================

describe('useChatStream — isStreamingFor', () => {
  it('should return false when not streaming', () => {
    const { result } = renderHook(() => useChatStream())
    expect(result.current.isStreamingFor('any')).toBe(false)
  })

  it('should return true for active stream messageId', async () => {
    const { result } = renderHook(() => useChatStream())

    async function* mockStream() {
      yield { token: 'data', done: false }
      await new Promise((r) => setTimeout(r, 100))
      yield { token: '', done: true }
    }

    act(() => {
      // Start but don't await — stream is in progress
      result.current.startRealStream(mockStream(), 'active-msg')
    })

    expect(result.current.isStreamingFor('active-msg')).toBe(true)
    expect(result.current.isStreamingFor('other')).toBe(false)

    // Wait for stream to finish
    await waitFor(() => {
      expect(result.current.streamState.isStreaming).toBe(false)
    })
  })
})
