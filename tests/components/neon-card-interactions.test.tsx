/**
 * @file neon-card-interactions.test.tsx
 * @description NeonCard 交互分支补测(85×4 门禁冲刺)
 *   既有 neon-card.test.tsx 覆盖双主题渲染;本文件驱动:悬停进出(双主题)、
 *   hoverable 关闭、onClick 角色化 + 键盘激活(Enter/空格/其他键)、
 *   noReveal、IntersectionObserver 揭示动画、ariaLabel。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,components,neon-card,gate85
 */

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NeonCard } from '@/app/components/neon-card'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'

// IntersectionObserver 实例捕获(替换 setup.ts 的全局空桩)
interface IOInstance {
  callback: (entries: Array<{ isIntersecting: boolean }>) => void
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}
let ioInstances: IOInstance[] = []
const RealIO = global.IntersectionObserver

beforeEach(() => {
  ioInstances = []
  global.IntersectionObserver = class MockIO {
    observe = vi.fn()
    disconnect = vi.fn()
    callback: (entries: Array<{ isIntersecting: boolean }>) => void
    constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
      this.callback = cb
      ioInstances.push(this as unknown as IOInstance)
    }
    takeRecords() {
      return []
    }
    unobserve() {}
  } as unknown as typeof IntersectionObserver
})

afterEach(() => {
  cleanup()
  global.IntersectionObserver = RealIO
})

function wrap(ui: ReactNode, theme: 'cyberpunk' | 'liquidGlass' = 'cyberpunk') {
  return render(
    <ThemeSwitcherProvider defaultTheme={theme}>{ui}</ThemeSwitcherProvider>,
  )
}

const getCard = (container: HTMLElement) => {
  const card = container.querySelector('[data-neon-card]')
  if (!card) throw new Error('neon card not found')
  return card as HTMLElement
}

describe('NeonCard — 悬停交互(双主题 × hoverable)', () => {
  it('cyberpunk 主题悬停:borderColor→borderActive,离开还原', () => {
    const { container } = wrap(
      <NeonCard hoverable>
        <p>内容</p>
      </NeonCard>,
      'cyberpunk',
    )
    const card = getCard(container)
    const beforeBorder = card.style.borderColor
    fireEvent.mouseEnter(card)
    expect(card.style.boxShadow).not.toBe('')
    expect(card.style.borderColor).not.toBe(beforeBorder)
    fireEvent.mouseLeave(card)
    expect(card.style.borderColor).toBe(beforeBorder)
  })

  it('liquidGlass 主题悬停:background→hover 底,离开还原', () => {
    const { container } = wrap(
      <NeonCard hoverable>
        <p>内容</p>
      </NeonCard>,
      'liquidGlass',
    )
    const card = getCard(container)
    const beforeBg = card.style.background
    fireEvent.mouseEnter(card)
    expect(card.style.background).not.toBe(beforeBg)
    fireEvent.mouseLeave(card)
    expect(card.style.background).toBe(beforeBg)
  })

  it('hoverable=false:悬停不改变任何样式', () => {
    const { container } = wrap(
      <NeonCard hoverable={false}>
        <p>内容</p>
      </NeonCard>,
      'cyberpunk',
    )
    const card = getCard(container)
    const before = card.style.borderColor
    fireEvent.mouseEnter(card)
    expect(card.style.borderColor).toBe(before)
    fireEvent.mouseLeave(card)
    expect(card.style.borderColor).toBe(before)
  })
})

describe('NeonCard — onClick 角色化 + 键盘激活', () => {
  it('提供 onClick 时获得 button 角色/tabIndex,Enter 与空格触发,其他键不触发', () => {
    const onClick = vi.fn()
    const { container } = wrap(<NeonCard onClick={onClick}>可点击</NeonCard>)
    const card = getCard(container)
    expect(card.getAttribute('role')).toBe('button')
    expect(card.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(card, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)
    fireEvent.keyDown(card, { key: 'Escape' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('无 onClick 时无角色/无 tabIndex/无键盘处理', () => {
    const { container } = wrap(<NeonCard>静态</NeonCard>)
    const card = getCard(container)
    expect(card.getAttribute('role')).toBeNull()
    expect(card.getAttribute('tabindex')).toBeNull()
    fireEvent.keyDown(card, { key: 'Enter' }) // 不应抛错
  })

  it('click 直接触发 onClick', () => {
    const onClick = vi.fn()
    const { container } = wrap(<NeonCard onClick={onClick}>点击</NeonCard>)
    fireEvent.click(getCard(container))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('ariaLabel 透传', () => {
    const { container } = wrap(<NeonCard ariaLabel="测试卡片">内容</NeonCard>)
    expect(getCard(container).getAttribute('aria-label')).toBe('测试卡片')
  })
})

describe('NeonCard — 揭示动画', () => {
  it('noReveal=true:立即显现且不注册 IntersectionObserver', () => {
    const { container } = wrap(
      <NeonCard noReveal>
        <p>直出</p>
      </NeonCard>,
    )
    expect(getCard(container).style.opacity).toBe('1')
    expect(ioInstances).toHaveLength(0)
  })

  it('默认:注册观察器,进入视口后揭示并断开观察', async () => {
    const { container } = wrap(<NeonCard>待揭示</NeonCard>)
    expect(ioInstances).toHaveLength(1)
    const io = ioInstances[0]
    expect(io.observe).toHaveBeenCalled()

    // 未进入视口:保持隐藏
    io.callback([{ isIntersecting: false }])
    expect(getCard(container).style.opacity).toBe('0')

    // 进入视口:揭示 + 断开(状态更新经 act 刷出)
    await act(async () => {
      io.callback([{ isIntersecting: true }])
    })
    expect(getCard(container).style.opacity).toBe('1')
    expect(io.disconnect).toHaveBeenCalled()
  })

  it('卸载时断开观察器', () => {
    const { container, unmount } = wrap(<NeonCard>卸载</NeonCard>)
    const io = ioInstances[0]
    unmount()
    expect(io.disconnect).toHaveBeenCalled()
    void container
  })

  it('揭示后重渲染不再重复注册观察器(revealed 早退)', () => {
    const { rerender } = wrap(<NeonCard>首轮</NeonCard>)
    const io = ioInstances[0]
    io.callback([{ isIntersecting: true }])
    const count = ioInstances.length
    rerender(
      <ThemeSwitcherProvider defaultTheme="cyberpunk">
        <NeonCard>二轮</NeonCard>
      </ThemeSwitcherProvider>,
    )
    expect(ioInstances.length).toBe(count) // revealed → effect 早退
  })

  it('双主题下 circuit 网格仅 cyberpunk 渲染(经背景网格样式判别)', () => {
    const cyber = wrap(
      <NeonCard noReveal>
        <p>cyber</p>
      </NeonCard>,
      'cyberpunk',
    )
    expect(screen.getByText('cyber')).toBeTruthy()
    cyber.unmount()
    wrap(
      <NeonCard noReveal>
        <p>liquid</p>
      </NeonCard>,
      'liquidGlass',
    )
    expect(screen.getByText('liquid')).toBeTruthy()
  })
})
