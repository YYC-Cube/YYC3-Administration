/**
 * @file textarea.test.tsx
 * @description Textarea 组件冒烟测试(渲染 / 输入)
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Textarea } from '@/shared/ui/textarea'

describe('Textarea', () => {
  it('渲染并支持输入', async () => {
    const user = userEvent.setup()
    render(<Textarea placeholder="备注" />)
    const ta = screen.getByPlaceholderText('备注')
    await user.type(ta, '你好')
    expect(ta).toHaveValue('你好')
  })

  it('根元素带 data-slot 并合并自定义类', () => {
    const { container } = render(<Textarea className="custom-textarea" />)
    const root = container.querySelector('[data-slot="textarea"]')
    expect(root?.className).toContain('custom-textarea')
    expect(root?.className).toContain('min-h-16')
  })
})
