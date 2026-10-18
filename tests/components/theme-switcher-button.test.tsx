/**
 * @file theme-switcher-button.test.tsx
 * @description ThemeSwitcherButton / ThemeSwitcherButtonCompact 单元测试 — 主题切换与文案
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { I18nProvider } from '@/app/components/i18n-context'
import {
  ThemeSwitcherButton,
  ThemeSwitcherButtonCompact,
} from '@/app/components/theme-switcher-button'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'

function wrap(node: ReactNode) {
  return render(
    <ThemeSwitcherProvider defaultTheme="cyberpunk">
      <I18nProvider>{node}</I18nProvider>
    </ThemeSwitcherProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('ThemeSwitcherButton — 完整按钮', () => {
  it('默认 cyberpunk:展示主题名与切换提示', () => {
    wrap(<ThemeSwitcherButton />)
    expect(screen.getByText('Cyberpunk')).toBeInTheDocument()
    expect(screen.getByText('赛博朋克')).toBeInTheDocument()
    expect(screen.getByTestId('theme-switcher')).toHaveAttribute('title', '切换到液态玻璃主题')
  })

  it('点击后切换到液态玻璃主题并更新文案', () => {
    wrap(<ThemeSwitcherButton />)
    fireEvent.click(screen.getByTestId('theme-switcher'))
    expect(screen.getByText('Liquid Glass')).toBeInTheDocument()
    expect(screen.getByText('液态玻璃')).toBeInTheDocument()
    expect(screen.getByTestId('theme-switcher')).toHaveAttribute('title', '切换到赛博朋克主题')
  })
})

describe('ThemeSwitcherButtonCompact — 紧凑按钮', () => {
  it('渲染图标按钮并可通过点击切换主题', () => {
    wrap(<ThemeSwitcherButtonCompact />)
    const btn = screen.getByTestId('theme-switcher')
    expect(btn).toHaveAttribute('title', '切换到液态玻璃主题')

    fireEvent.click(btn)
    expect(screen.getByTestId('theme-switcher')).toHaveAttribute('title', '切换到赛博朋克主题')
  })
})
