/**
 * @file avatar.test.tsx
 * @description Avatar 组件冒烟测试(回退内容 / 根元素属性 / 图片元素)
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

describe('Avatar', () => {
  it('渲染回退内容', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('根元素带 data-slot 并合并自定义类', () => {
    const { container } = render(
      <Avatar className="custom-avatar">
        <AvatarFallback>X</AvatarFallback>
      </Avatar>,
    )
    const root = container.querySelector('[data-slot="avatar"]')
    expect(root).toBeTruthy()
    expect(root?.className).toContain('custom-avatar')
    expect(root?.className).toContain('rounded-full')
  })

  it('同时传入图片与回退时正常渲染,回退内容可见', () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="头像" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('FB')).toBeInTheDocument()
    expect(screen.getByText('FB')).toHaveAttribute('data-slot', 'avatar-fallback')
  })
})
