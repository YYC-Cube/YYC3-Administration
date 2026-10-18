/**
 * @file onboarding-tutorial.test.tsx
 * @description OnboardingTutorial 单元测试 — 可见性 / 步骤推进 / 键盘导航 / 跳过与完成
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  onboardingDone: false,
  setOnboardingDone: vi.fn(),
}))

vi.mock('@/app/components/app-context', () => ({
  useApp: () => ({
    onboardingDone: h.onboardingDone,
    setOnboardingDone: h.setOnboardingDone,
  }),
}))

import { I18nProvider } from '@/app/components/i18n-context'
import { OnboardingTutorial } from '@/app/components/onboarding-tutorial'

function wrap(node: ReactNode) {
  return render(<I18nProvider>{node}</I18nProvider>)
}

describe('OnboardingTutorial', () => {
  beforeEach(() => {
    h.onboardingDone = false
    h.setOnboardingDone = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('onboardingDone=true 时不渲染任何内容', () => {
    h.onboardingDone = true
    const { container } = wrap(<OnboardingTutorial />)
    expect(container).toBeEmptyDOMElement()
  })

  it('初始不可见,800ms 后展示欢迎步骤与步骤计数', async () => {
    const { container } = wrap(<OnboardingTutorial />)
    expect(container).toBeEmptyDOMElement()
    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    expect(screen.getByText('欢迎来到 YYC³ 言语智能')).toBeInTheDocument()
    expect(screen.getByText('1 / 6')).toBeInTheDocument()
  })

  it('点击下一步推进步骤,点击上一步回退', async () => {
    wrap(<OnboardingTutorial />)
    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    fireEvent.click(screen.getByText('下一步'))
    expect(screen.getByText('感应式导航栏')).toBeInTheDocument()
    expect(screen.getByText('上一步')).toBeInTheDocument()

    fireEvent.click(screen.getByText('上一步'))
    expect(screen.getByText('欢迎来到 YYC³ 言语智能')).toBeInTheDocument()
    expect(screen.queryByText('上一步')).not.toBeInTheDocument()
  })

  it('键盘右/左方向键可切换步骤', async () => {
    wrap(<OnboardingTutorial />)
    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('感应式导航栏')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('欢迎来到 YYC³ 言语智能')).toBeInTheDocument()
  })

  it('点击步骤圆点跳转到指定步骤', async () => {
    const { container } = wrap(<OnboardingTutorial />)
    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    const dotButtons = container.querySelectorAll('.justify-center.gap-2.mb-6 button')
    expect(dotButtons.length).toBe(6)
    fireEvent.click(dotButtons[3])
    expect(screen.getByText('命令面板 (Ctrl+K)')).toBeInTheDocument()
  })

  it('点击“跳过引导”结束引导并调用 setOnboardingDone', async () => {
    const { container } = wrap(<OnboardingTutorial />)
    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    fireEvent.click(screen.getByText('跳过引导'))
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    expect(h.setOnboardingDone).toHaveBeenCalledWith(true)
    expect(container).toBeEmptyDOMElement()
  })

  it('最后一步按钮显示“开始使用”,点击后完成引导', async () => {
    wrap(<OnboardingTutorial />)
    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText('下一步'))
    }
    expect(screen.getByText('开始使用')).toBeInTheDocument()

    fireEvent.click(screen.getByText('开始使用'))
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    expect(h.setOnboardingDone).toHaveBeenCalledWith(true)
  })

  it('按 Escape 触发跳过', async () => {
    wrap(<OnboardingTutorial />)
    await act(async () => {
      vi.advanceTimersByTime(800)
    })
    fireEvent.keyDown(window, { key: 'Escape' })
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    expect(h.setOnboardingDone).toHaveBeenCalledWith(true)
  })
})
