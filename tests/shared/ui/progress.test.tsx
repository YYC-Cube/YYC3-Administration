/**
 * @file progress.test.tsx
 * @description Progress 组件冒烟测试(取值 / 指示器位移)
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Progress } from '@/shared/ui/progress'

describe('Progress', () => {
  it('根据 value 计算指示器位移', () => {
    const { container } = render(<Progress value={40} />)
    const indicator = container.querySelector('[data-slot="progress-indicator"]') as HTMLElement
    expect(indicator.style.transform).toBe('translateX(-60%)')
  })

  it('未传 value 时按 0 处理', () => {
    const { container } = render(<Progress />)
    const indicator = container.querySelector('[data-slot="progress-indicator"]') as HTMLElement
    expect(indicator.style.transform).toBe('translateX(-100%)')
  })

  it('根元素暴露 progressbar 语义并合并自定义类', () => {
    const { container } = render(<Progress value={70} className="custom-progress" />)
    const root = container.querySelector('[data-slot="progress"]') as HTMLElement
    expect(root.className).toContain('custom-progress')
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
