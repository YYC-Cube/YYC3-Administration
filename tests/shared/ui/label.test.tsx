/**
 * @file label.test.tsx
 * @description Label 组件冒烟测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Label } from '@/shared/ui/label'

describe('Label', () => {
  it('渲染文本内容并关联 htmlFor', () => {
    render(<Label htmlFor="name">姓名</Label>)
    const label = screen.getByText('姓名')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'name')
  })

  it('根元素带 data-slot 并合并自定义类', () => {
    const { container } = render(<Label className="custom-label">标签</Label>)
    const root = container.querySelector('[data-slot="label"]')
    expect(root?.className).toContain('custom-label')
    expect(root?.className).toContain('font-medium')
  })
})
