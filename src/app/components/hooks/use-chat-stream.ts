/** @file hooks/use-chat-stream.ts — Streaming AI response hook with AbortController */
import { useCallback, useRef, useState } from 'react'

/**
 * Represents the current state of a streaming AI response.
 * @property content - Accumulated text received so far
 * @property isStreaming - Whether streaming is currently in progress
 * @property messageId - ID of the message being streamed, if any
 */
export interface StreamState {
  content: string
  isStreaming: boolean
  messageId: string | null
}

/**
 * Manages streaming AI response with AbortController for stop support.
 * Provides token-by-token simulation or real SSE streaming.
 *
 * @returns Object containing stream state and control methods
 */
export function useChatStream() {
  const [state, setState] = useState<StreamState>({
    content: '',
    isStreaming: false,
    messageId: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  /**
   * Stream text character by character (simulated streaming).
   * Real SSE integration can replace this via `streamSSE`.
   */
  const startSimulatedStream = useCallback(
    async (fullText: string, messageId: string, speed = 8) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState({ content: '', isStreaming: true, messageId })

      let cur = ''
      for (let i = 0; i < fullText.length; i++) {
        if (controller.signal.aborted) break
        cur += fullText[i]
        setState({ content: cur, isStreaming: true, messageId })
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, speed)
          // Also resolve on abort so we exit quickly
          controller.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            resolve()
          })
        })
      }

      if (!controller.signal.aborted) {
        setState({ content: fullText, isStreaming: false, messageId })
      }
      return fullText
    },
    [],
  )

  /** Stop the current stream immediately. Sets isStreaming to false. */
  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setState((prev) => ({ ...prev, isStreaming: false }))
  }, [])

  /** Reset stream state */
  const resetStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setState({ content: '', isStreaming: false, messageId: null })
  }, [])

  /** Whether the current stream is for a given message id */
  const isStreamingFor = useCallback(
    (msgId: string) => state.isStreaming && state.messageId === msgId,
    [state.isStreaming, state.messageId],
  )

  return {
    streamState: state,
    startSimulatedStream,
    stopStream,
    resetStream,
    isStreamingFor,
  }
}
