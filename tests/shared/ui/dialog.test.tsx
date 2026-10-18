/**
 * @file dialog.test.tsx
 * @description Dialog 组件冒烟测试(开闭 / 结构 / 关闭按钮)
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

describe('Dialog', () => {
  it('open 时渲染标题/描述/页脚与关闭按钮', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>对话框标题</DialogTitle>
            <DialogDescription>对话框描述</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>取消</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText('对话框标题')).toBeInTheDocument()
    expect(screen.getByText('对话框描述')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
    // 内置的 sr-only 关闭按钮
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('关闭状态下仅渲染触发器,不渲染内容', () => {
    render(
      <Dialog>
        <DialogTrigger>打开</DialogTrigger>
        <DialogContent>
          <DialogTitle>隐藏内容</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByText('打开')).toBeInTheDocument()
    expect(screen.queryByText('隐藏内容')).not.toBeInTheDocument()
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })
})
