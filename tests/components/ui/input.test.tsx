/**
 * Input Component - Unit Tests
 * 测试Input组件的渲染、属性传递和交互
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from '../../../src/app/components/ui/input'

describe('Input Component', () => {
  describe('基础渲染', () => {
    it('应该渲染Input组件', () => {
      render(<Input placeholder="测试输入" />)
      const input = screen.getByPlaceholderText('测试输入')
      expect(input).toBeTruthy()
    })

    it('应该具有data-slot属性', () => {
      const { container } = render(<Input placeholder="测试" />)
      const input = container.querySelector('[data-slot="input"]')
      expect(input).toBeTruthy()
    })
  })

  describe('类型测试', () => {
    it('应该渲染text类型输入', () => {
      render(<Input type="text" placeholder="文本输入" />)
      const input = screen.getByPlaceholderText('文本输入')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('应该渲染password类型输入', () => {
      render(<Input type="password" placeholder="密码输入" />)
      const input = screen.getByPlaceholderText('密码输入')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('应该渲染email类型输入', () => {
      render(<Input type="email" placeholder="邮箱输入" />)
      const input = screen.getByPlaceholderText('邮箱输入')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('应该渲染number类型输入', () => {
      render(<Input type="number" placeholder="数字输入" />)
      const input = screen.getByPlaceholderText('数字输入')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('默认应该是text类型', () => {
      const { container } = render(<Input placeholder="默认" />)
      const input = container.querySelector('[data-slot="input"]') as HTMLInputElement
      expect(input.type).toBe('text')
    })
  })

  describe('属性传递', () => {
    it('应该正确传递className', () => {
      const customClass = 'custom-input-class'
      const { container } = render(<Input className={customClass} placeholder="测试" />)
      const input = container.querySelector('[data-slot="input"]')
      expect(input?.className).toContain(customClass)
    })

    it('应该正确传递value属性', () => {
      render(<Input value="测试值" />)
      const input = screen.getByDisplayValue('测试值')
      expect(input).toBeTruthy()
    })

    it('应该正确传递disabled属性', () => {
      render(<Input disabled placeholder="禁用输入" />)
      const input = screen.getByPlaceholderText('禁用输入')
      expect(input).toBeDisabled()
    })

    it('应该正确传递required属性', () => {
      render(<Input required placeholder="必填输入" />)
      const input = screen.getByPlaceholderText('必填输入')
      expect(input).toBeRequired()
    })

    it('应该正确传递name属性', () => {
      render(<Input name="username" placeholder="用户名" />)
      const input = screen.getByPlaceholderText('用户名')
      expect(input).toHaveAttribute('name', 'username')
    })

    it('应该正确传递id属性', () => {
      render(<Input id="user-input" placeholder="输入框" />)
      const input = screen.getByPlaceholderText('输入框')
      expect(input).toHaveAttribute('id', 'user-input')
    })

    it('应该正确传递aria-label', () => {
      render(<Input aria-label="用户名输入" placeholder="用户名" />)
      const input = screen.getByLabelText('用户名输入')
      expect(input).toBeTruthy()
    })

    it('应该正确传递aria-invalid属性', () => {
      render(<Input aria-invalid={true} placeholder="无效输入" />)
      const input = screen.getByPlaceholderText('无效输入')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('交互测试', () => {
    it('应该响应输入事件', async () => {
      const onChange = vi.fn()
      const user = userEvent.setup()

      render(<Input onChange={onChange} placeholder="输入测试" />)
      const input = screen.getByPlaceholderText('输入测试')

      await user.type(input, '测试文本')
      expect(onChange).toHaveBeenCalled()
    })

    it('应该响应focus和blur事件', async () => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const user = userEvent.setup()

      render(<Input onFocus={onFocus} onBlur={onBlur} placeholder="焦点测试" />)
      const input = screen.getByPlaceholderText('焦点测试')

      await user.click(input)
      expect(onFocus).toHaveBeenCalledTimes(1)

      await user.click(document.body)
      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('样式类', () => {
    it('应该包含基础样式类', () => {
      const { container } = render(<Input placeholder="测试" />)
      const input = container.querySelector('[data-slot="input"]')

      expect(input?.className).toContain('rounded-md')
      expect(input?.className).toContain('border')
      expect(input?.className).toContain('h-9')
      expect(input?.className).toContain('outline-none')
    })

    it('禁用状态应该有disabled样式', () => {
      const { container } = render(<Input disabled placeholder="禁用" />)
      const input = container.querySelector('[data-slot="input"]')

      expect(input?.className).toContain('disabled:pointer-events-none')
      expect(input?.className).toContain('disabled:cursor-not-allowed')
      expect(input?.className).toContain('disabled:opacity-50')
    })

    it('aria-invalid状态应该有错误样式', () => {
      const { container } = render(<Input aria-invalid={true} placeholder="无效" />)
      const input = container.querySelector('[data-slot="input"]')

      expect(input?.className).toContain('aria-invalid:ring-destructive/20')
      expect(input?.className).toContain('aria-invalid:border-destructive')
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的角色', () => {
      render(<Input aria-label="可访问输入" placeholder="输入框" />)
      const input = screen.getByRole('textbox', { name: /可访问输入/i })
      expect(input).toBeTruthy()
    })

    it('禁用输入应该有正确的状态', () => {
      render(<Input disabled placeholder="禁用" />)
      const input = screen.getByPlaceholderText('禁用')
      expect(input).toBeDisabled()
    })
  })
})
