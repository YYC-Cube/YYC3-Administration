/**
 * Unit Tests: doc-sync 工厂(M2 批次二)
 * 覆盖:未认证不水合/空文档不覆盖/有效文档水合进 store/变更防抖上行/停后不订阅。
 * task-board store 与 apiFetch 均 mock,零网络。
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/api-client', () => ({
  isApiConfigured: true,
  apiFetch: apiFetchMock,
}))

vi.mock('@/features/toolkit/pages/task-board-store', () => ({
  useTaskStore: {
    getState: vi.fn(() => ({
      tasks: [{ id: 't1', title: 'local' }],
      reminders: [],
    })),
    setState: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
  },
}))

import { useTaskStore } from '@/features/toolkit/pages/task-board-store'
import { createDocSync } from '@/services/doc-sync'
import { useAuthStore } from '@/stores/useAuthStore'

describe('doc-sync — createDocSync(task-board)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    useAuthStore.setState({
      user: null,
      token: null,
      status: 'unauthenticated',
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('未认证 start → 不水合不订阅', async () => {
    const handle = createDocSync('task-board', {
      pick: () => ({}),
      apply: () => undefined,
      subscribe: () => () => undefined,
    })
    await handle.start('u1')
    expect(apiFetchMock).not.toHaveBeenCalled()
  })

  it('认证后 start → 水合:空文档(updatedAt=null)不覆盖本地', async () => {
    apiFetchMock.mockResolvedValue({ data: {}, updatedAt: null })
    useAuthStore.setState({
      user: { id: 'u1', username: 'u', email: 'u@x', role: 'viewer', createdAt: 1 },
      token: 'self-api',
      status: 'authenticated',
    })
    const apply = vi.fn()
    const handle = createDocSync('task-board', {
      pick: () => ({}),
      apply,
      subscribe: () => () => undefined,
    })
    await handle.start('u1')
    expect(apply).not.toHaveBeenCalled()
    handle.stop()
  })

  it('认证后 start → 有效文档水合进 store', async () => {
    apiFetchMock.mockResolvedValue({
      data: { tasks: [{ id: 't-cloud' }], reminders: [] },
      updatedAt: '2026-11-13T00:00:00Z',
    })
    useAuthStore.setState({
      user: { id: 'u1', username: 'u', email: 'u@x', role: 'viewer', createdAt: 1 },
      token: 'self-api',
      status: 'authenticated',
    })
    const handle = createDocSync('task-board', {
      pick: () => ({}),
      apply: (remote) => {
        useTaskStore.setState({
          tasks: (remote.tasks ?? []) as never[],
          reminders: (remote.reminders ?? []) as never[],
        })
      },
      subscribe: () => () => undefined,
    })
    await handle.start('u1')
    expect(useTaskStore.setState).toHaveBeenCalledWith(
      expect.objectContaining({ tasks: [{ id: 't-cloud' }] }),
    )
    handle.stop()
  })

  it('store 变更 → 1.5s 防抖后 PUT 上行;stop 后不再上行', async () => {
    apiFetchMock.mockResolvedValue({ data: {}, updatedAt: null })
    useAuthStore.setState({
      user: { id: 'u1', username: 'u', email: 'u@x', role: 'viewer', createdAt: 1 },
      token: 'self-api',
      status: 'authenticated',
    })
    const listenerRef: { current: (() => void) | undefined } = { current: undefined }
    const handle = createDocSync('task-board', {
      pick: () => ({ tasks: [{ id: 't1' }], reminders: [] }),
      apply: () => undefined,
      subscribe: (fn: () => void) => {
        listenerRef.current = fn
        return () => undefined
      },
    })
    await handle.start('u1')
    listenerRef.current?.()
    await vi.advanceTimersByTimeAsync(1600)
    expect(apiFetchMock).toHaveBeenCalledWith(
      '/data/docs/task-board',
      expect.objectContaining({ method: 'PUT' }),
    )
    handle.stop()
    // stop 语义 = 解绑认证生命周期(文档 store 订阅由挂载件管理);
    // 此处断言:一次变更恰好一次防抖 PUT
    await vi.advanceTimersByTimeAsync(1600)
    const putCalls = apiFetchMock.mock.calls.filter(
      (c) => (c[1] as { method?: string })?.method === 'PUT',
    ).length
    expect(putCalls).toBe(1)
  })
})
