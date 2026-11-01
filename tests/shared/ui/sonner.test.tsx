/**
 * Unit Tests: shared/ui/sonner Toaster 主题适配（批次三分支补强）
 * 覆盖:useTheme 默认参数('system')、dark/cyberpunk/liquidGlass 三路 ||
 *      与 isDark 三元的两种取值——此前 B 0%。
 * sonner 以 stub 组件替换,断言透传的 theme prop。
 */

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const themeState = vi.hoisted(() => ({ value: undefined as string | undefined }))

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: themeState.value }),
}))

vi.mock('sonner', () => ({
  Toaster: (props: { theme?: string }) => (
    <div data-testid="sonner-stub" data-theme={props.theme ?? 'unset'} />
  ),
}))

import { Toaster } from '@/shared/ui/sonner'

describe('Toaster — 主题分支矩阵', () => {
  beforeEach(() => {
    themeState.value = undefined
  })

  it('theme 未注入 → 默认 system → light（默认参数 + || 全 false 路径）', () => {
    render(<Toaster />)
    expect(screen.getByTestId('sonner-stub')).toHaveAttribute('data-theme', 'light')
  })

  it('theme=light → light', () => {
    themeState.value = 'light'
    render(<Toaster />)
    expect(screen.getByTestId('sonner-stub')).toHaveAttribute('data-theme', 'light')
  })

  it('theme=dark → dark（|| 第一操作数）', () => {
    themeState.value = 'dark'
    render(<Toaster />)
    expect(screen.getByTestId('sonner-stub')).toHaveAttribute('data-theme', 'dark')
  })

  it('theme=cyberpunk → dark（|| 第二操作数）', () => {
    themeState.value = 'cyberpunk'
    render(<Toaster />)
    expect(screen.getByTestId('sonner-stub')).toHaveAttribute('data-theme', 'dark')
  })

  it('theme=liquidGlass → dark（|| 第三操作数）', () => {
    themeState.value = 'liquidGlass'
    render(<Toaster />)
    expect(screen.getByTestId('sonner-stub')).toHaveAttribute('data-theme', 'dark')
  })
})
