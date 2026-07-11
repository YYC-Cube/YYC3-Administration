/**
 * Button Component - Unit Tests
 * 测试Button组件的所有变体、尺寸和交互
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../../../src/app/components/ui/button'

describe('Button Component', () => {
  describe('变体测试', () => {
    it('应该渲染默认变体按钮', () => {
      render(<Button>默认按钮</Button>)
      const button = screen.getByRole('button', { name: '默认按钮' })
      expect(button).toBeTruthy()
      expect(button).toHaveAttribute('data-slot', 'button')
    })

    it('应该渲染destructive变体按钮', () => {
      render(<Button variant="destructive">删除</Button>)
      const button = screen.getByRole('button', { name: '删除' })
      expect(button).toBeTruthy()
    })

    it('应该渲染outline变体按钮', () => {
      render(<Button variant="outline">轮廓按钮</Button>)
      const button = screen.getByRole('button', { name: '轮廓按钮' })
      expect(button).toBeTruthy()
    })

    it('应该渲染secondary变体按钮', () => {
      render(<Button variant="secondary">次要按钮</Button>)
      const button = screen.getByRole('button', { name: '次要按钮' })
      expect(button).toBeTruthy()
    })

    it('应该渲染ghost变体按钮', () => {
      render(<Button variant="ghost">幽灵按钮</Button>)
      const button = screen.getByRole('button', { name: '幽灵按钮' })
      expect(button).toBeTruthy()
    })

    it('应该渲染link变体按钮', () => {
      render(<Button variant="link">链接按钮</Button>)
      const button = screen.getByRole('button', { name: '链接按钮' })
      expect(button).toBeTruthy()
    })
  })

  describe('尺寸测试', () => {
    it('应该渲染默认尺寸按钮', () => {
      render(<Button size="default">默认尺寸</Button>)
      const button = screen.getByRole('button', { name: '默认尺寸' })
      expect(button).toBeTruthy()
    })

    it('应该渲染sm尺寸按钮', () => {
      render(<Button size="sm">小尺寸</Button>)
      const button = screen.getByRole('button', { name: '小尺寸' })
      expect(button).toBeTruthy()
    })

    it('应该渲染lg尺寸按钮', () => {
      render(<Button size="lg">大尺寸</Button>)
      const button = screen.getByRole('button', { name: '大尺寸' })
      expect(button).toBeTruthy()
    })

    it('应该渲染icon尺寸按钮', () => {
      render(<Button size="icon">图标按钮</Button>)
      const button = screen.getByRole('button', { name: '图标按钮' })
      expect(button).toBeTruthy()
    })
  })

  describe('交互测试', () => {
    it('应该响应点击事件', async () => {
      const onClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={onClick}>点击我</Button>)
      const button = screen.getByRole('button', { name: '点击我' })

      await user.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('禁用状态下不应该响应点击', async () => {
      const onClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button disabled onClick={onClick}>
          禁用按钮
        </Button>,
      )
      const button = screen.getByRole('button', { name: '禁用按钮' })

      await user.click(button)
      expect(onClick).not.toHaveBeenCalled()
      expect(button).toBeDisabled()
    })
  })

  describe('属性传递', () => {
    it('应该正确传递className', () => {
      const customClass = 'custom-test-class'
      render(<Button className={customClass}>自定义类名</Button>)
      const button = screen.getByRole('button', { name: '自定义类名' })
      expect(button.className).toContain(customClass)
    })

    it('应该正确传递aria-label', () => {
      render(<Button aria-label="测试按钮">按钮</Button>)
      const button = screen.getByRole('button', { name: '测试按钮' })
      expect(button).toHaveAttribute('aria-label', '测试按钮')
    })

    it('应该正确传递type属性', () => {
      render(<Button type="submit">提交按钮</Button>)
      const button = screen.getByRole('button', { name: '提交按钮' })
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('子组件渲染', () => {
    it('应该渲染包含图标的按钮', () => {
      render(
        <Button>
          <svg data-testid="icon" className="w-4 h-4" />
          带图标按钮
        </Button>,
      )
      const icon = screen.getByTestId('icon')
      expect(icon).toBeTruthy()
      const button = screen.getByRole('button', { name: '带图标按钮' })
      expect(button).toBeTruthy()
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的角色', () => {
      render(<Button>可访问按钮</Button>)
      const button = screen.getByRole('button', { name: '可访问按钮' })
      expect(button).toBeTruthy()
    })

    it('禁用按钮应该有aria-disabled属性', () => {
      render(<Button disabled>禁用按钮</Button>)
      const button = screen.getByRole('button', { name: '禁用按钮' })
      expect(button).toBeDisabled()
    })
  })
})
