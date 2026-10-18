/**
 * @file data-export-modal.test.tsx
 * @description DataExportModal 单元测试 — 开闭 / 数据集选择 / 格式选择 / 预览 / 导出流程
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { act, type ReactNode } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { DataExportModal } from '@/app/components/data-export-modal'
import { I18nProvider } from '@/app/components/i18n-context'

const wrap = (node: ReactNode) => render(<I18nProvider>{node}</I18nProvider>)

beforeAll(() => {
  // jsdom 未实现 Blob 下载所需的 objectURL API,打桩以免导出流程抛错
  ;(URL as unknown as { createObjectURL: () => string }).createObjectURL = vi.fn(() => 'blob:mock')
  ;(URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = vi.fn()
  // jsdom 不支持 <a>.click() 触发的真实导航,打桩消除 "Not implemented: navigation" 噪音
  HTMLAnchorElement.prototype.click = vi.fn()
})

describe('DataExportModal — 开闭与基础渲染', () => {
  it('open=false 时不渲染任何内容', () => {
    const { container } = wrap(<DataExportModal open={false} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('open=true 时渲染标题与数据集选择', () => {
    wrap(<DataExportModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText('数据导出中心')).toBeInTheDocument()
    // 未预选数据集时导出按钮禁用
    const exportBtn = screen.getByRole('button', { name: /导出/ })
    expect(exportBtn).toBeDisabled()
  })

  it('preselectedDataset 命中时导出按钮可用,并展示数据预览入口', () => {
    wrap(<DataExportModal open={true} onClose={vi.fn()} preselectedDataset="dashboard" />)
    expect(screen.getByRole('button', { name: /导出/ })).toBeEnabled()
    // 预览按钮文案包含字段名(字面量,非 i18n 键)
    expect(screen.getByRole('button', { name: /日期/ })).toBeInTheDocument()
  })
})

describe('DataExportModal — 交互', () => {
  it('切换导出格式为 JSON 不报错', () => {
    wrap(<DataExportModal open={true} onClose={vi.fn()} preselectedDataset="customers" />)
    fireEvent.click(screen.getByText('JSON'))
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })

  it('点击预览可展开数据预览表格', () => {
    wrap(<DataExportModal open={true} onClose={vi.fn()} preselectedDataset="dashboard" />)
    // 展开前无表头
    expect(screen.queryByText('新客户')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /日期/ }))
    // 展开后出现表头
    expect(screen.getByText('新客户')).toBeInTheDocument()
    expect(screen.getByText('呼叫数')).toBeInTheDocument()
  })

  it('点击取消按钮触发 onClose', () => {
    const onClose = vi.fn()
    wrap(<DataExportModal open={true} onClose={onClose} preselectedDataset="dashboard" />)
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('按 Esc 触发 onClose', () => {
    const onClose = vi.fn()
    wrap(<DataExportModal open={true} onClose={onClose} preselectedDataset="dashboard" />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('点击背景遮罩触发 onClose', () => {
    const onClose = vi.fn()
    const { container } = wrap(
      <DataExportModal open={true} onClose={onClose} preselectedDataset="dashboard" />,
    )
    const backdrop = container.querySelector('.absolute.inset-0') as HTMLElement
    expect(backdrop).toBeTruthy()
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('DataExportModal — 导出流程(定时器)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('点击导出进入导出中状态,完成后回调 onClose', async () => {
    const onClose = vi.fn()
    wrap(<DataExportModal open={true} onClose={onClose} preselectedDataset="dashboard" />)

    fireEvent.click(screen.getByRole('button', { name: /导出/ }))

    await act(async () => {
      vi.advanceTimersByTime(1200)
    })

    await act(async () => {
      vi.advanceTimersByTime(1800)
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
