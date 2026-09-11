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
 * Provides both simulated character-by-character streaming and real SSE streaming.
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
   * Used for mock responses or when SSE is not available.
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

  /**
   * Start real SSE streaming from an async generator (e.g. aiProxyService.chatStream).
   * Tokens are received from the provider in real-time and appended to content.
   *
   * @param stream - An async generator yielding { token, done } chunks
   * @param messageId - The ID of the AI message being streamed
   * @returns The full accumulated text when streaming completes
   */
  const startRealStream = useCallback(
    async (
      stream: AsyncGenerator<{ token: string; done: boolean }>,
      messageId: string,
    ): Promise<string> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState({ content: '', isStreaming: true, messageId })

      let accumulated = ''
      try {
        for await (const chunk of stream) {
          if (controller.signal.aborted) break
          if (chunk.token) {
            accumulated += chunk.token
            setState({ content: accumulated, isStreaming: true, messageId })
          }
          if (chunk.done) break
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Aborted by user — keep partial content
        } else {
          throw err
        }
      }

      if (!controller.signal.aborted) {
        setState({ content: accumulated, isStreaming: false, messageId })
      } else {
        setState((prev) => ({ ...prev, isStreaming: false }))
      }
      return accumulated
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
    startRealStream,
    stopStream,
    resetStream,
    isStreamingFor,
  }
}
