/**
 * @file cyber-tooltip.test.tsx
 * @description CyberTooltip 单元测试 — 空态早退 / 双主题渲染
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { CyberTooltip } from '@/app/components/cyber-tooltip'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'

function wrap(node: ReactNode, theme: 'cyberpunk' | 'liquidGlass' = 'cyberpunk') {
  return render(<ThemeSwitcherProvider defaultTheme={theme}>{node}</ThemeSwitcherProvider>)
}

describe('CyberTooltip', () => {
  it('active=false 时返回 null', () => {
    const { container } = wrap(<CyberTooltip active={false} payload={[]} label="L" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('payload 为空时返回 null', () => {
    const { container } = wrap(<CyberTooltip active={true} payload={[]} label="L" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('cyberpunk 主题下渲染标签与数据项', () => {
    wrap(
      <CyberTooltip
        active={true}
        label="本周指标"
        payload={[
          { name: '新客户', value: 42, color: '#00f0ff' },
          { name: '呼叫数', value: 35, color: '#00d4ff' },
        ]}
      />,
    )
    expect(screen.getByText('本周指标')).toBeInTheDocument()
    expect(screen.getByText('新客户: 42')).toBeInTheDocument()
    expect(screen.getByText('呼叫数: 35')).toBeInTheDocument()
  })

  it('liquidGlass 主题下同样渲染数据项', () => {
    wrap(
      <CyberTooltip
        active={true}
        label="指标"
        payload={[{ name: '转化率', value: '38%', color: '#00ff87' }]}
      />,
      'liquidGlass',
    )
    expect(screen.getByText('转化率: 38%')).toBeInTheDocument()
  })
})
