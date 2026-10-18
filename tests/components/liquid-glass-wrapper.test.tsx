/**
 * @file liquid-glass-wrapper.test.tsx
 * @description LiquidGlassWrapper / LiquidCard / LiquidButton / LiquidInput 单元测试(双主题)
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  LiquidButton,
  LiquidCard,
  LiquidGlassWrapper,
  LiquidInput,
} from '@/app/components/liquid-glass-wrapper'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'

function wrap(node: ReactNode, theme: 'cyberpunk' | 'liquidGlass') {
  return render(<ThemeSwitcherProvider defaultTheme={theme}>{node}</ThemeSwitcherProvider>)
}

afterEach(() => {
  document.getElementById('liquid-glow-container')?.remove()
})

describe('LiquidGlassWrapper — 主题包装', () => {
  it('cyberpunk 主题:直接渲染子组件,不注入包装器与光晕层', () => {
    const { container } = wrap(
      <LiquidGlassWrapper>
        <span data-testid="child">内容</span>
      </LiquidGlassWrapper>,
      'cyberpunk',
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(container.querySelector('.liquid-glass-theme-wrapper')).toBeNull()
    expect(document.getElementById('liquid-glow-container')).toBeNull()
  })

  it('liquidGlass 主题:注入包装器与光晕/粒子层', () => {
    const { container } = wrap(
      <LiquidGlassWrapper>
        <span data-testid="child">内容</span>
      </LiquidGlassWrapper>,
      'liquidGlass',
    )
    expect(container.querySelector('.liquid-glass-theme-wrapper')).toBeTruthy()
    const glow = document.getElementById('liquid-glow-container')
    expect(glow).toBeTruthy()
    expect(glow?.querySelectorAll('.liquid-glow').length).toBe(3)
    expect(glow?.querySelectorAll('.particle').length).toBe(20)
  })
})

describe('LiquidCard — 主题分支', () => {
  it('cyberpunk 主题渲染原样式并透传 className 与 onClick', () => {
    const onClick = vi.fn()
    const { container } = wrap(
      <LiquidCard className="custom" onClick={onClick}>
        <span>卡片</span>
      </LiquidCard>,
      'cyberpunk',
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('custom')
    fireEvent.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('liquidGlass 主题 glass 变体应用 glass-card 类', () => {
    const { container } = wrap(
      <LiquidCard variant="glass">
        <span>玻璃卡</span>
      </LiquidCard>,
      'liquidGlass',
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('glass-card')
    expect(card.className).toContain('spring-enter')
  })

  it('liquidGlass 主题 neo 变体 + 不可悬停', () => {
    const { container } = wrap(
      <LiquidCard variant="neo" hoverable={false}>
        <span>拟态卡</span>
      </LiquidCard>,
      'liquidGlass',
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('neo-card')
    expect(card.className).toContain('pointer-events-none')
  })
})

describe('LiquidButton — 主题/尺寸/变体', () => {
  it('cyberpunk 主题 primary 变体渲染并响应点击', () => {
    const onClick = vi.fn()
    wrap(
      <LiquidButton onClick={onClick} size="lg">
        点击
      </LiquidButton>,
      'cyberpunk',
    )
    const btn = screen.getByRole('button', { name: '点击' })
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('cyberpunk 主题 secondary 变体与禁用态', () => {
    wrap(
      <LiquidButton variant="secondary" size="sm" disabled>
        禁用
      </LiquidButton>,
      'cyberpunk',
    )
    expect(screen.getByRole('button', { name: '禁用' })).toBeDisabled()
  })

  it('liquidGlass 主题各变体渲染', () => {
    wrap(
      <div>
        <LiquidButton variant="primary" size="md">
          P
        </LiquidButton>
        <LiquidButton variant="ghost" size="sm">
          G
        </LiquidButton>
      </div>,
      'liquidGlass',
    )
    expect(screen.getByRole('button', { name: 'P' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'G' })).toBeInTheDocument()
  })
})

describe('LiquidInput — 输入交互', () => {
  it('cyberpunk 主题输入触发 onChange', () => {
    const onChange = vi.fn()
    wrap(<LiquidInput value="" onChange={onChange} placeholder="p" />, 'cyberpunk')
    const input = screen.getByPlaceholderText('p')
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(onChange).toHaveBeenCalledWith('abc')
  })

  it('liquidGlass 主题输入渲染并触发 onChange', () => {
    const onChange = vi.fn()
    const { container } = wrap(
      <LiquidInput value="x" onChange={onChange} type="password" className="my-input" />,
      'liquidGlass',
    )
    const input = container.querySelector('input.input-liquid') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.type).toBe('password')
    fireEvent.change(input, { target: { value: 'y' } })
    expect(onChange).toHaveBeenCalledWith('y')
  })
})
