/**
 * @file error-boundary.test.tsx
 * @description ErrorBoundary 类组件单元测试 — 捕获异常 / 回退 UI / 自定义 fallback / 重试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from '@/app/components/error-boundary'

/** 仅在 render 时抛错,用于触发错误边界 */
function Boom(): ReactNode {
  throw new Error('kaboom-from-child')
}

describe('ErrorBoundary', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React 捕获错误时会向 console.error 打印,静默以免污染输出
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('无异常时正常渲染 children', () => {
    render(
      <ErrorBoundary>
        <span data-testid="ok">正常内容</span>
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('ok')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('子组件抛错时渲染默认回退 UI,并显示错误信息与重试按钮', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    // 显示原始错误信息
    expect(screen.getByText('kaboom-from-child')).toBeInTheDocument()
    // 提供重试按钮
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('提供 name 时仍渲染回退 UI(覆盖命名分支)', () => {
    render(
      <ErrorBoundary name="Dashboard">
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('kaboom-from-child')).toBeInTheDocument()
  })

  it('传入自定义 fallback 时优先渲染 fallback', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">自定义降级</div>}>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('点击重试会复位错误状态(再次渲染子组件)', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    const retry = screen.getByRole('button')
    // 重试后子组件仍抛错,边界再次捕获并回到回退 UI
    fireEvent.click(retry)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
