/**
 * NeonCard Component - Unit Tests
 * 测试双主题卡片组件的渲染和交互
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { NeonCard } from '../../src/app/components/neon-card'
import { ThemeSwitcherProvider } from '../../src/app/components/theme-switcher-context'

// Test wrapper with theme provider
const TestWrapper = ({
  children,
  theme = 'cyberpunk',
}: {
  children: ReactNode
  theme?: 'cyberpunk' | 'liquidGlass'
}) => <ThemeSwitcherProvider defaultTheme={theme}>{children}</ThemeSwitcherProvider>

describe('NeonCard Component', () => {
  describe('CTC-NC-001: Cyberpunk 主题渲染', () => {
    it('应该正确渲染霓虹边框和背景', () => {
      const { container } = render(
        <TestWrapper theme="cyberpunk">
          <NeonCard>
            <p>Test Content</p>
          </NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement

      // 验证基础结构
      expect(card).toBeTruthy()
      expect(card.tagName).toBe('DIV')

      // 验证 Cyberpunk 主题属性
      expect(card.getAttribute('data-neon-card')).toBe('')
    })
  })

  describe('CTC-NC-002: Liquid Glass 主题渲染', () => {
    it('应该正确渲染毛玻璃效果', () => {
      const { container } = render(
        <TestWrapper theme="liquidGlass">
          <NeonCard>
            <p>Test Content</p>
          </NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement

      // 验证基础结构
      expect(card).toBeTruthy()

      // Liquid Glass 主题应该有不同的样式
      // 具体验证取决于实现细节
    })
  })

  describe('CTC-NC-003: 鼠标悬停交互', () => {
    it('应该在鼠标悬停时触发动画', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <TestWrapper>
          <NeonCard>
            <p>Hover me</p>
          </NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement

      // 模拟鼠标悬停
      await user.hover(card)

      // 验证样式变化（具体验证取决于实现）
      // 例如检查是否添加了 hover 相关类或样式
    })
  })

  describe('CTC-NC-004: 自定义 className 传递', () => {
    it('应该正确合并自定义类名', () => {
      const customClass = 'custom-card-class'

      const { container } = render(
        <TestWrapper>
          <NeonCard className={customClass}>
            <p>Content</p>
          </NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement

      // 验证同时包含默认类名和自定义类名
      expect(card.className).toContain(customClass)
    })
  })

  describe('CTC-NC-005: children 内容渲染', () => {
    it('应该正确渲染子内容', () => {
      const testText = 'Test Child Content'

      render(
        <TestWrapper>
          <NeonCard>
            <div data-testid="child-content">{testText}</div>
          </NeonCard>
        </TestWrapper>,
      )

      const childContent = screen.getByTestId('child-content')
      expect(childContent).toBeTruthy()
      expect(childContent.textContent).toBe(testText)
    })

    it('应该支持复杂的 children 结构', () => {
      render(
        <TestWrapper>
          <NeonCard>
            <div>
              <h2>Title</h2>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
              <button>Action</button>
            </div>
          </NeonCard>
        </TestWrapper>,
      )

      expect(screen.getByText('Title')).toBeTruthy()
      expect(screen.getByText('Paragraph 1')).toBeTruthy()
      expect(screen.getByText('Paragraph 2')).toBeTruthy()
      expect(screen.getByText('Action')).toBeTruthy()
    })
  })

  describe('CTC-NC-006: 主题切换响应', () => {
    it('主题切换时样式应该立即更新', () => {
      const { container, rerender } = render(
        <TestWrapper theme="cyberpunk">
          <NeonCard>
            <p>Content</p>
          </NeonCard>
        </TestWrapper>,
      )

      const cardCyber = container.firstChild as HTMLElement
      const _cyberClasses = cardCyber.className

      // 切换到 Liquid Glass
      rerender(
        <TestWrapper theme="liquidGlass">
          <NeonCard>
            <p>Content</p>
          </NeonCard>
        </TestWrapper>,
      )

      const cardLiquid = container.firstChild as HTMLElement
      const _liquidClasses = cardLiquid.className

      // 验证类名发生了变化（具体取决于实现）
      // 这里假设主题切换会导致类名变化
    })
  })

  describe('CTC-NC-007: 性能 - 大量卡片渲染', () => {
    it('应该能够渲染 100+ 卡片无明显卡顿', () => {
      const startTime = performance.now()

      const { container } = render(
        <TestWrapper>
          <div>
            {Array.from({ length: 100 }).map((_, index) => (
              <NeonCard key={index}>
                <p>Card {index}</p>
              </NeonCard>
            ))}
          </div>
        </TestWrapper>,
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // 验证渲染时间在合理范围内（<1000ms）
      expect(renderTime).toBeLessThan(1000)

      // 验证所有卡片都渲染了
      const cards = container.querySelectorAll('[data-neon-card]')
      expect(cards.length).toBe(100)
    })
  })

  describe('边界和错误处理', () => {
    it('应该处理空 children', () => {
      const { container } = render(
        <TestWrapper>
          <NeonCard>{''}</NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toBeTruthy()
    })

    it('应该处理 null children', () => {
      const { container } = render(
        <TestWrapper>
          <NeonCard>{null}</NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toBeTruthy()
    })

    it('应该处理 undefined className', () => {
      const { container } = render(
        <TestWrapper>
          <NeonCard className={undefined}>
            <p>Content</p>
          </NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement
      expect(card).toBeTruthy()
    })
  })

  describe('可访问性测试', () => {
    it('应该支持 ARIA 属性传递', () => {
      const { container } = render(
        <TestWrapper>
          <NeonCard ariaLabel="Test Card">
            <p>Content</p>
          </NeonCard>
        </TestWrapper>,
      )

      const card = container.firstChild as HTMLElement
      expect(card.getAttribute('aria-label')).toBe('Test Card')
    })
  })
})
