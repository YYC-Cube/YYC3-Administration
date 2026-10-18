/**
 * @file shared-styles.test.tsx
 * @description shared-styles 单元测试 — PageHeader / StatCard / ContentCard / 常量
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { type CSSProperties, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import {
  COLORS,
  ContentCard,
  PageHeader,
  StatCard,
  TYPOGRAPHY,
} from '@/app/components/shared-styles'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'

function wrap(node: ReactNode) {
  return render(<ThemeSwitcherProvider defaultTheme="cyberpunk">{node}</ThemeSwitcherProvider>)
}

const Icon = (props: { className?: string; style?: CSSProperties }) => (
  <svg data-testid="stat-icon" {...props} />
)

describe('PageHeader', () => {
  it('渲染标题与副标题,无 actions 时不渲染操作区', () => {
    const { container } = wrap(<PageHeader title="驾驶舱" subtitle="实时概览" />)
    expect(screen.getByText('驾驶舱')).toBeInTheDocument()
    expect(screen.getByText('实时概览')).toBeInTheDocument()
    expect(container.querySelectorAll('.gap-3').length).toBe(0)
  })

  it('传入 actions 时渲染操作区', () => {
    wrap(
      <PageHeader
        title="驾驶舱"
        subtitle="实时概览"
        actions={<button type="button">刷新</button>}
      />,
    )
    expect(screen.getByRole('button', { name: '刷新' })).toBeInTheDocument()
  })
})

describe('StatCard', () => {
  it('渲染标签、数值与图标', () => {
    wrap(<StatCard label="新客户" value={128} icon={Icon} color="#00f0ff" />)
    expect(screen.getByText('新客户')).toBeInTheDocument()
    expect(screen.getByText('128')).toBeInTheDocument()
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument()
  })

  it('trend 为 up 时渲染上涨变更文案', () => {
    wrap(
      <StatCard label="转化率" value="38%" icon={Icon} color="#00ffc8" change="+12%" trend="up" />,
    )
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('trend 为 down 时渲染下降变更文案', () => {
    wrap(
      <StatCard label="流失率" value="3%" icon={Icon} color="#005f73" change="-2%" trend="down" />,
    )
    expect(screen.getByText('-2%')).toBeInTheDocument()
  })

  it('悬停与移出更新边框与阴影样式', () => {
    const { container } = wrap(<StatCard label="呼叫数" value={88} icon={Icon} color="#00f0ff" />)
    const card = container.firstChild as HTMLElement
    // jsdom 会将十六进制颜色归一化为 rgba,故仅断言值发生变化
    const initialBorder = card.style.borderColor
    expect(initialBorder).not.toBe('')

    fireEvent.mouseEnter(card)
    expect(card.style.borderColor).not.toBe(initialBorder)
    expect(card.style.boxShadow).toContain('15px')

    fireEvent.mouseLeave(card)
    expect(card.style.borderColor).toBe(initialBorder)
    expect(card.style.boxShadow).toBe('none')
  })
})

describe('ContentCard', () => {
  it('有标题时渲染标题与内容', () => {
    wrap(
      <ContentCard title="趋势">
        <span>内容区</span>
      </ContentCard>,
    )
    expect(screen.getByText('趋势')).toBeInTheDocument()
    expect(screen.getByText('内容区')).toBeInTheDocument()
  })

  it('无标题时仅渲染内容', () => {
    wrap(
      <ContentCard>
        <span>纯内容</span>
      </ContentCard>,
    )
    expect(screen.getByText('纯内容')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})

describe('shared-styles 常量导出', () => {
  it('TYPOGRAPHY 与 COLORS 包含预期键', () => {
    expect(TYPOGRAPHY.heading1).toBe('text-xl font-bold')
    expect(TYPOGRAPHY.value).toBe('text-lg tabular-nums')
    expect(COLORS.primary).toBe('#00f0ff')
    expect(COLORS.muted).toBe('#005f73')
  })
})
