/**
 * @file badge.test.tsx
 * @description Badge 组件单元测试 — 变体 / className 合并 / asChild / 属性透传
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge, badgeVariants } from '@/shared/ui/badge'

describe('Badge — 变体', () => {
  it('默认变体带 data-slot 与 primary 背景类', () => {
    const { container } = render(<Badge>默认</Badge>)
    const root = container.querySelector('[data-slot="badge"]')
    expect(root).not.toBeNull()
    expect(root?.tagName).toBe('SPAN')
    expect(root?.className).toContain('bg-primary')
    expect(root?.className).toContain('text-primary-foreground')
  })

  it('secondary 变体应用次要色类', () => {
    const { container } = render(<Badge variant="secondary">次要</Badge>)
    const root = container.querySelector('[data-slot="badge"]')
    expect(root?.className).toContain('bg-secondary')
    expect(root?.className).toContain('text-secondary-foreground')
  })

  it('destructive 变体应用危险色类', () => {
    const { container } = render(<Badge variant="destructive">危险</Badge>)
    const root = container.querySelector('[data-slot="badge"]')
    expect(root?.className).toContain('bg-destructive')
    expect(root?.className).toContain('text-white')
  })

  it('outline 变体应用前景文字类', () => {
    const { container } = render(<Badge variant="outline">轮廓</Badge>)
    const root = container.querySelector('[data-slot="badge"]')
    expect(root?.className).toContain('text-foreground')
    expect(root?.className).toContain('border')
  })

  it('badgeVariants 直接调用返回对应类名', () => {
    const outline = badgeVariants({ variant: 'outline' })
    expect(outline).toContain('text-foreground')
    expect(outline).toContain('inline-flex')

    const def = badgeVariants()
    expect(def).toContain('bg-primary')
  })
})

describe('Badge — className 合并', () => {
  it('自定义类名被追加到根元素', () => {
    const { container } = render(<Badge className="custom-badge">自定义</Badge>)
    const root = container.querySelector('[data-slot="badge"]')
    expect(root?.className).toContain('custom-badge')
    expect(root?.className).toContain('bg-primary')
  })

  it('冲突的 Tailwind 工具类以后传入者为准', () => {
    const { container } = render(<Badge className="text-lg">冲突</Badge>)
    const root = container.querySelector('[data-slot="badge"]')
    expect(root?.className).toContain('text-lg')
    expect(root?.className).not.toContain('text-xs')
  })
})

describe('Badge — asChild', () => {
  it('asChild 将样式合并到子元素(锚点)', () => {
    const { container } = render(
      <Badge asChild>
        <a href="/link">链接徽标</a>
      </Badge>,
    )
    const anchor = container.querySelector('a')
    expect(anchor).not.toBeNull()
    expect(anchor).toHaveAttribute('data-slot', 'badge')
    expect(anchor?.className).toContain('inline-flex')
    expect(anchor).toHaveAttribute('href', '/link')
  })

  it('asChild 时自定义类名合并到子元素', () => {
    const { container } = render(
      <Badge asChild className="custom-child">
        <span>子节点</span>
      </Badge>,
    )
    const child = container.querySelector('[data-slot="badge"]')
    expect(child?.tagName).toBe('SPAN')
    expect(child?.className).toContain('custom-child')
  })
})

describe('Badge — 属性透传', () => {
  it('透传 aria-label 与文本内容', () => {
    render(<Badge aria-label="状态徽标">激活</Badge>)
    const badge = screen.getByLabelText('状态徽标')
    expect(badge).toHaveTextContent('激活')
  })

  it('透传 id 与 data-* 属性', () => {
    const { container } = render(
      <Badge id="badge-x" data-testid="badge-y">
        透传
      </Badge>,
    )
    const root = container.querySelector('#badge-x')
    expect(root).not.toBeNull()
    expect(root).toHaveAttribute('data-testid', 'badge-y')
  })
})
