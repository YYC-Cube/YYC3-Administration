/**
 * @file page-transition.test.tsx
 * @description PageTransition 单元测试 — 初始渲染 / key 切换两阶段过渡 / 同 key 子内容同步
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PageTransition } from '@/app/components/page-transition'

describe('PageTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初始渲染展示传入的子内容', () => {
    render(
      <PageTransition pageKey="a">
        <div data-testid="content">页面 A</div>
      </PageTransition>,
    )
    expect(screen.getByTestId('content')).toHaveTextContent('页面 A')
  })

  it('pageKey 切换时依次经历 exit → enter → idle 三阶段', async () => {
    const { container, rerender } = render(
      <PageTransition pageKey="a">
        <div data-testid="content">页面 A</div>
      </PageTransition>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(screen.getByTestId('content')).toHaveTextContent('页面 A')
    expect(wrapper.style.animation).toBe('')

    rerender(
      <PageTransition pageKey="b">
        <div data-testid="content">页面 B</div>
      </PageTransition>,
    )
    // 退出阶段:应用退出动画
    expect(wrapper.style.animation).toContain('page-exit')
    expect(screen.getByTestId('content')).toHaveTextContent('页面 B')

    // 200ms 后进入进入阶段
    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    expect(wrapper.style.animation).toContain('page-enter')

    // 350ms 后回到 idle,清理动画
    await act(async () => {
      vi.advanceTimersByTime(350)
    })
    expect(wrapper.style.animation).toBe('')
  })

  it('同一 pageKey 下子内容变化会在 idle 阶段同步更新', () => {
    const { rerender } = render(
      <PageTransition pageKey="same">
        <div data-testid="content">版本 1</div>
      </PageTransition>,
    )
    rerender(
      <PageTransition pageKey="same">
        <div data-testid="content">版本 2</div>
      </PageTransition>,
    )
    expect(screen.getByTestId('content')).toHaveTextContent('版本 2')
  })
})
