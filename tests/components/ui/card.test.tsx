/**
 * Card Component - Unit Tests
 * 测试Card组件及其子组件的渲染和属性传递
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../src/app/components/ui/card'

describe('Card Component', () => {
  describe('Card主组件', () => {
    it('应该渲染Card组件', () => {
      render(<Card>卡片内容</Card>)
      const card = screen.getByText('卡片内容')
      expect(card).toBeTruthy()
    })

    it('应该正确传递className', () => {
      const customClass = 'custom-card-class'
      const { container } = render(<Card className={customClass}>卡片内容</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('data-slot', 'card')
      expect(card.className).toContain(customClass)
    })

    it('应该正确传递data属性', () => {
      const { container } = render(<Card data-testid="test-card">卡片内容</Card>)
      const card = container.querySelector('[data-testid="test-card"]')
      expect(card).toBeTruthy()
    })
  })

  describe('CardHeader组件', () => {
    it('应该渲染CardHeader组件', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>卡片标题</CardTitle>
          </CardHeader>
        </Card>,
      )
      const title = screen.getByText('卡片标题')
      expect(title).toBeTruthy()
    })

    it('应该正确传递className', () => {
      const customClass = 'custom-header-class'
      const { container } = render(
        <Card>
          <CardHeader className={customClass}>
            <CardTitle>标题</CardTitle>
          </CardHeader>
        </Card>,
      )
      const header = container.querySelector('[data-slot="card-header"]')
      expect(header).toBeTruthy()
      expect(header?.className).toContain(customClass)
    })
  })

  describe('CardTitle组件', () => {
    it('应该渲染CardTitle组件', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>测试标题</CardTitle>
          </CardHeader>
        </Card>,
      )
      const title = screen.getByText('测试标题')
      expect(title).toBeTruthy()
      expect(title.tagName).toBe('H4')
    })

    it('应该正确传递className', () => {
      const customClass = 'custom-title-class'
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle className={customClass}>标题</CardTitle>
          </CardHeader>
        </Card>,
      )
      const title = container.querySelector('[data-slot="card-title"]')
      expect(title).toBeTruthy()
      expect(title?.className).toContain(customClass)
    })
  })

  describe('CardDescription组件', () => {
    it('应该渲染CardDescription组件', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>标题</CardTitle>
            <CardDescription>这是一个描述</CardDescription>
          </CardHeader>
        </Card>,
      )
      const description = screen.getByText('这是一个描述')
      expect(description).toBeTruthy()
    })

    it('应该包含text-muted-foreground类', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>标题</CardTitle>
            <CardDescription>描述文本</CardDescription>
          </CardHeader>
        </Card>,
      )
      const description = container.querySelector('[data-slot="card-description"]')
      expect(description).toBeTruthy()
      expect(description?.className).toContain('text-muted-foreground')
    })
  })

  describe('CardContent组件', () => {
    it('应该渲染CardContent组件', () => {
      render(
        <Card>
          <CardContent>卡片内容区域</CardContent>
        </Card>,
      )
      const content = screen.getByText('卡片内容区域')
      expect(content).toBeTruthy()
    })

    it('应该正确传递className', () => {
      const customClass = 'custom-content-class'
      const { container } = render(
        <Card>
          <CardContent className={customClass}>内容</CardContent>
        </Card>,
      )
      const content = container.querySelector('[data-slot="card-content"]')
      expect(content).toBeTruthy()
      expect(content?.className).toContain(customClass)
    })
  })

  describe('CardFooter组件', () => {
    it('应该渲染CardFooter组件', () => {
      render(
        <Card>
          <CardFooter>卡片底部</CardFooter>
        </Card>,
      )
      const footer = screen.getByText('卡片底部')
      expect(footer).toBeTruthy()
    })

    it('应该正确传递className', () => {
      const customClass = 'custom-footer-class'
      const { container } = render(
        <Card>
          <CardFooter className={customClass}>底部内容</CardFooter>
        </Card>,
      )
      const footer = container.querySelector('[data-slot="card-footer"]')
      expect(footer).toBeTruthy()
      expect(footer?.className).toContain(customClass)
    })
  })

  describe('CardAction组件', () => {
    it('应该渲染CardAction组件', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>标题</CardTitle>
            <CardAction>操作区域</CardAction>
          </CardHeader>
        </Card>,
      )
      const action = screen.getByText('操作区域')
      expect(action).toBeTruthy()
    })
  })

  describe('完整Card结构', () => {
    it('应该渲染完整的Card结构', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>完整卡片标题</CardTitle>
            <CardDescription>完整卡片描述</CardDescription>
            <CardAction>操作</CardAction>
          </CardHeader>
          <CardContent>卡片内容</CardContent>
          <CardFooter>卡片底部</CardFooter>
        </Card>,
      )

      expect(screen.getByText('完整卡片标题')).toBeTruthy()
      expect(screen.getByText('完整卡片描述')).toBeTruthy()
      expect(screen.getByText('操作')).toBeTruthy()
      expect(screen.getByText('卡片内容')).toBeTruthy()
      expect(screen.getByText('卡片底部')).toBeTruthy()
    })
  })
})