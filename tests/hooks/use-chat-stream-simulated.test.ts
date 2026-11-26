/**
 * @file use-chat-stream-simulated.test.ts
 * @description useChatStream 补测(85×4 门禁冲刺):startSimulatedStream 全路径、
 *   中途 abort、双启动互斥、startRealStream AbortError 吞并与异常上抛、isStreamingFor。
 *   既有 use-chat-stream.test.ts 已覆盖 SSE 正常消费与 reset。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,hooks,chat-stream,gate85
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useChatStream } from '@/shared/hooks/use-chat-stream'

describe('useChatStream — startSimulatedStream 全路径', () => {
  it('逐字流式至完整文本,isStreaming 收尾为 false', async () => {
    const { result } = renderHook(() => useChatStream())

    await act(async () => {
      await result.current.startSimulatedStream('abcdefgh', 'm1', 1)
    })

    expect(result.current.streamState.content).toBe('abcdefgh')
    expect(result.current.streamState.isStreaming).toBe(false)
    expect(result.current.streamState.messageId).toBe('m1')
  })

  it('空文本:立即完成', async () => {
    const { result } = renderHook(() => useChatStream())
    await act(async () => {
      const r = await result.current.startSimulatedStream('', 'm0', 1)
      expect(r).toBe('')
    })
    expect(result.current.streamState.isStreaming).toBe(false)
  })

  it('中途 stopStream:提前退出,内容为部分前缀', async () => {
    const { result } = renderHook(() => useChatStream())
    const longText = 'x'.repeat(200)

    let streamPromise: Promise<string> | null = null
    act(() => {
      streamPromise = result.current.startSimulatedStream(longText, 'm2', 30)
    })

    // 等若干字符后中止
    await waitFor(
      () => {
        expect(result.current.streamState.content.length).toBeGreaterThan(2)
      },
      { timeout: 3000, interval: 10 },
    )
    act(() => {
      result.current.stopStream()
    })
    await streamPromise!
    // 注:startSimulatedStream 的返回值恒为 fullText(设计如此);中止语义体现在 state
    expect(result.current.streamState.content.length).toBeLessThan(longText.length)
    expect(result.current.streamState.isStreaming).toBe(false)
  }, 10000)

  it('二次启动立即中止前一流(互斥)', async () => {
    const { result } = renderHook(() => useChatStream())
    let first: Promise<string> | null = null
    act(() => {
      first = result.current.startSimulatedStream('aaaaaaaaaaaaaaaaaaaa', 'mA', 30)
    })
    await act(async () => {
      await result.current.startSimulatedStream('bb', 'mB', 1)
    })
    expect(result.current.streamState.content).toBe('bb')
    expect(result.current.streamState.messageId).toBe('mB')
    await first!
  }, 10000)
})

describe('useChatStream — startRealStream 异常分支', () => {
  it('AbortError 被吞并:保留累计内容,不抛出', async () => {
    const { result } = renderHook(() => useChatStream())

    async function* abortingStream() {
      yield { token: '部分', done: false }
      const err = new Error('The operation was aborted.')
      err.name = 'AbortError'
      throw err
    }

    await act(async () => {
      const r = await result.current.startRealStream(abortingStream(), 'm3')
      expect(r).toBe('部分')
    })
    expect(result.current.streamState.content).toBe('部分')
    expect(result.current.streamState.isStreaming).toBe(false)
  })

  it('其他异常原样上抛', async () => {
    const { result } = renderHook(() => useChatStream())

    async function* brokenStream() {
      yield { token: 'a', done: false }
      throw new TypeError('bad stream')
    }

    await expect(
      act(async () => {
        await result.current.startRealStream(brokenStream(), 'm4')
      }),
    ).rejects.toThrow('bad stream')
  })

  it('done 分块终止消费并保留内容', async () => {
    const { result } = renderHook(() => useChatStream())

    async function* doneStream() {
      yield { token: 'one', done: false }
      yield { token: '', done: true }
      yield { token: 'never', done: false }
    }

    await act(async () => {
      const r = await result.current.startRealStream(doneStream(), 'm5')
      expect(r).toBe('one')
    })
  })
})

describe('useChatStream — isStreamingFor', () => {
  it('流式期间对目标 id 为 true,其他 id 为 false', async () => {
    const { result } = renderHook(() => useChatStream())
    expect(result.current.isStreamingFor('mx')).toBe(false)

    let resolveStream: () => void = () => {}
    const gate = new Promise<void>((r) => {
      resolveStream = r
    })

    async function* gatedStream() {
      yield { token: 'x', done: false }
      await gate
    }

    let p: Promise<string> | null = null
    act(() => {
      p = result.current.startRealStream(gatedStream(), 'mx')
    })
    await waitFor(() => {
      expect(result.current.isStreamingFor('mx')).toBe(true)
      expect(result.current.isStreamingFor('other')).toBe(false)
    })
    resolveStream()
    await act(async () => {
      await p!
    })
    expect(result.current.isStreamingFor('mx')).toBe(false)
  })
})
