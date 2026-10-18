/**
 * @file tabs.test.tsx
 * @description Tabs 组件冒烟测试(默认激活 / 切换标签)
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

describe('Tabs', () => {
  it('默认展示首个标签内容,点击后切换', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">标签一</TabsTrigger>
          <TabsTrigger value="two">标签二</TabsTrigger>
        </TabsList>
        <TabsContent value="one">内容一</TabsContent>
        <TabsContent value="two">内容二</TabsContent>
      </Tabs>,
    )
    expect(screen.getByText('内容一')).toBeInTheDocument()
    expect(screen.queryByText('内容二')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: '标签二' }))
    expect(screen.getByText('内容二')).toBeInTheDocument()
  })

  it('根元素带 data-slot 且列表带 tablist 语义', () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">AA</TabsContent>
      </Tabs>,
    )
    expect(container.querySelector('[data-slot="tabs"]')).toBeTruthy()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
