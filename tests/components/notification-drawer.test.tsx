/**
 * @file notification-drawer.test.tsx
 * @description NotificationDrawer 单元测试 — 开闭 / 空态 / 筛选 / 已读 / 清理 / ESC / 点击外部
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 以可变对象驱动 useApp 返回值,便于构造不同场景
const h = vi.hoisted(() => ({
  app: {} as Record<string, unknown>,
}))

vi.mock('@/app/components/app-context', () => ({
  useApp: () => h.app,
}))

import { I18nProvider } from '@/app/components/i18n-context'
import { NotificationDrawer } from '@/app/components/notification-drawer'

interface NotifInput {
  id: string
  read: boolean
}

const makeNotifications = (items: NotifInput[]) =>
  items.map((n) => ({
    id: n.id,
    title: `zzz.title.${n.id}`,
    message: `zzz.message.${n.id}`,
    type: 'info' as const,
    color: '#00f0ff',
    timestamp: new Date(),
    read: n.read,
  }))

let markNotificationRead: ReturnType<typeof vi.fn>
let clearNotifications: ReturnType<typeof vi.fn>

const setupApp = (items: NotifInput[]) => {
  const notifications = makeNotifications(items)
  markNotificationRead = vi.fn()
  clearNotifications = vi.fn()
  h.app = {
    notifications,
    markNotificationRead,
    clearNotifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  }
}

const wrap = (node: ReactNode) => render(<I18nProvider>{node}</I18nProvider>)

beforeEach(() => {
  setupApp([{ id: 'n1', read: false }])
})

describe('NotificationDrawer — 基础渲染', () => {
  it('open=true 渲染背景遮罩,open=false 不渲染', () => {
    const { container, unmount } = wrap(<NotificationDrawer open={true} onClose={vi.fn()} />)
    expect(container.querySelectorAll('.fixed.inset-0').length).toBeGreaterThan(0)
    unmount()

    const { container: closed } = wrap(<NotificationDrawer open={false} onClose={vi.fn()} />)
    expect(closed.querySelectorAll('.fixed.inset-0').length).toBe(0)
    // 关闭态仍渲染列表项
    expect(screen.getByText('zzz.title.n1')).toBeInTheDocument()
  })

  it('通知列表为空时展示空态文案', () => {
    setupApp([])
    wrap(<NotificationDrawer open={true} onClose={vi.fn()} />)
    expect(screen.getByText('暂无通知')).toBeInTheDocument()
  })

  it('未读筛选下无未读通知时展示对应空态文案', () => {
    setupApp([{ id: 'n1', read: true }])
    wrap(<NotificationDrawer open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('未读'))
    expect(screen.getByText('没有未读通知')).toBeInTheDocument()
  })
})

describe('NotificationDrawer — 交互', () => {
  it('点击未读通知触发 markNotificationRead', () => {
    wrap(<NotificationDrawer open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('zzz.title.n1'))
    expect(markNotificationRead).toHaveBeenCalledWith('n1')
  })

  it('点击已读通知不会触发 markNotificationRead', () => {
    setupApp([{ id: 'n1', read: true }])
    wrap(<NotificationDrawer open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('zzz.title.n1'))
    expect(markNotificationRead).not.toHaveBeenCalled()
  })

  it('存在未读时点击“全部标为已读”触发 clearNotifications', () => {
    wrap(<NotificationDrawer open={true} onClose={vi.fn()} />)
    fireEvent.click(screen.getByTitle('全部标为已读'))
    expect(clearNotifications).toHaveBeenCalledTimes(1)
  })

  it('按 Esc 触发 onClose', () => {
    const onClose = vi.fn()
    wrap(<NotificationDrawer open={true} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('NotificationDrawer — 点击外部关闭(定时器门控)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('open 状态下延时后点击抽屉外部触发 onClose', async () => {
    const onClose = vi.fn()
    wrap(<NotificationDrawer open={true} onClose={onClose} />)

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closed 状态下不会注册外部点击监听', async () => {
    const onClose = vi.fn()
    wrap(<NotificationDrawer open={false} onClose={onClose} />)

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    fireEvent.mouseDown(document.body)
    expect(onClose).not.toHaveBeenCalled()
  })
})
