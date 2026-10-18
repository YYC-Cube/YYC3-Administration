/**
 * @file select.test.tsx
 * @description Select 组件冒烟测试(触发器 / 打开态选项 / 选择交互)
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

function renderSelect(props?: { open?: boolean; onValueChange?: (v: string) => void }) {
  return render(
    <Select
      value="a"
      open={props?.open}
      onOpenChange={vi.fn()}
      onValueChange={props?.onValueChange ?? vi.fn()}
    >
      <SelectTrigger>
        <SelectValue placeholder="请选择" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>分组</SelectLabel>
          <SelectItem value="a">选项 A</SelectItem>
          <SelectItem value="b">选项 B</SelectItem>
        </SelectGroup>
        <SelectSeparator />
      </SelectContent>
    </Select>,
  )
}

describe('Select', () => {
  it('关闭状态渲染触发器(combobox)', () => {
    renderSelect()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('打开状态渲染分组标签与全部选项', () => {
    renderSelect({ open: true })
    expect(screen.getByText('分组')).toBeInTheDocument()
    expect(screen.getAllByText('选项 A').length).toBeGreaterThan(0)
    expect(screen.getByText('选项 B')).toBeInTheDocument()
  })

  it('点击选项触发 onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderSelect({ open: true, onValueChange })
    await user.click(screen.getByText('选项 B'))
    expect(onValueChange).toHaveBeenCalledWith('b')
  })
})
