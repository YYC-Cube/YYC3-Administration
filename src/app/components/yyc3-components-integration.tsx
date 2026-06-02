/**
 * @file yyc3-components-integration.tsx
 * @description YYC³ UI 组件库集成示例 — 展示如何在 My-mgmt 项目中使用 @yyc3/ui 2.0.0 组件
 */

import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Textarea } from './ui/textarea'

// ==========================================
// 示例 1: 使用 YYC³ Button 组件
// ==========================================

export function Yyc3ButtonExample() {
  return (
    <div className="flex flex-wrap gap-4 p-6">
      <Button variant="default">默认按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="destructive">危险按钮</Button>
      <Button variant="outline">轮廓按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="link">链接按钮</Button>

      <div className="w-full" />

      <Button size="sm">超小</Button>
      <Button size="sm">小型</Button>
      <Button size="default">默认</Button>
      <Button size="lg">大型</Button>

      <Button disabled>禁用状态</Button>
      <Button asChild>
        <a href="#">作为链接</a>
      </Button>
    </div>
  )
}

// ==========================================
// 示例 2: 使用 YYC³ Card 组件（用于数据展示）
// ==========================================

interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  icon?: React.ReactNode
}

export function Yyc3DashboardCard({
  title,
  value,
  description,
  trend = 'stable',
  trendValue,
  icon,
}: DashboardCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    stable: 'text-gray-500',
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trendValue) && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
            {trendValue && (
              <span className={`ml-2 ${trendColors[trend]}`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ==========================================
// 示例 3: 使用 YYC³ 表单组件（用于员工关怀）
// ==========================================

export function Yyc3EmployeeCareForm() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>员工关怀申请表</CardTitle>
        <CardDescription>填写员工关怀相关信息，系统将自动匹配合适的资源</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee-name">员工姓名</Label>
            <Input id="employee-name" placeholder="请输入员工姓名" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-id">工号</Label>
            <Input id="employee-id" placeholder="请输入工号" />
          </div>
        </div>

        {/* 关怀类型 */}
        <div className="space-y-2">
          <Label htmlFor="care-type">关怀类型</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择关怀类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="family">家庭关爱</SelectItem>
              <SelectItem value="health">身心健康</SelectItem>
              <SelectItem value="career">职业发展</SelectItem>
              <SelectItem value="emergency">紧急援助</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 详细描述 */}
        <div className="space-y-2">
          <Label htmlFor="description">详细说明</Label>
          <Textarea id="description" placeholder="请详细描述需要关怀的具体情况..." rows={4} />
        </div>

        {/* 紧急程度 */}
        <div className="space-y-2">
          <Label>紧急程度</Label>
          <div className="flex gap-2">
            <Badge variant="secondary">一般</Badge>
            <Badge variant="outline">较急</Badge>
            <Badge variant="default">紧急</Badge>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">取消</Button>
          <Button>提交申请</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// 示例 4: 使用 YYC³ Tabs 和 Progress（用于营销闭环）
// ==========================================

export function Yyc3MarketingDashboard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>营销闭环数据看板</CardTitle>
        <CardDescription>实时监控营销数据，智能分析转化漏斗</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="leads">线索</TabsTrigger>
            <TabsTrigger value="conversion">转化</TabsTrigger>
            <TabsTrigger value="revenue">营收</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Yyc3DashboardCard
                title="今日新增线索"
                value={128}
                description="相比昨日"
                trend="up"
                trendValue="+12.5%"
                icon="📊"
              />
              <Yyc3DashboardCard
                title="转化率"
                value="8.5%"
                description="本周平均"
                trend="up"
                trendValue="+2.3%"
                icon="📈"
              />
              <Yyc3DashboardCard
                title="今日营收"
                value="¥128,500"
                description="目标完成度"
                trend="up"
                trendValue="85%"
                icon="💰"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>月度目标完成进度</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>客户满意度</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>团队协作效率</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <div className="text-center py-10 text-muted-foreground">线索管理模块 - 开发中...</div>
          </TabsContent>

          <TabsContent value="conversion">
            <div className="text-center py-10 text-muted-foreground">转化分析模块 - 开发中...</div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="text-center py-10 text-muted-foreground">营收统计模块 - 开发中...</div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// ==========================================
// 示例 5: 使用 YYC³ Dialog 和 Avatar（用于客户跟进）
// ==========================================

export function Yyc3CustomerFollowUpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>查看客户详情</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/avatars/customer.png" alt="客户头像" />
              <AvatarFallback>张</AvatarFallback>
            </Avatar>
            <div>
              <div>张三</div>
              <div className="text-sm font-normal text-muted-foreground">A级客户 · 意向度 92分</div>
            </div>
          </DialogTitle>
          <DialogDescription>客户全生命周期信息与跟进记录</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>客户阶段</Label>
              <Badge variant="default">商机确认</Badge>
            </div>
            <div className="space-y-2">
              <Label>最后联系时间</Label>
              <span className="text-sm text-muted-foreground">2026-04-30 14:30</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>下次跟进计划</Label>
            <div className="rounded-md border p-3 bg-muted/50">
              <p className="text-sm">预约线下拜访 · 时间：2026-05-03 10:00</p>
              <p className="text-xs text-muted-foreground mt-1">
                目标：展示产品Demo，推进至方案报价阶段
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>跟进历史</Label>
            <div className="max-h-32 overflow-y-auto space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs">
                  电话
                </Badge>
                <span className="text-muted-foreground">2026-04-30: 初次沟通，了解需求</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs">
                  微信
                </Badge>
                <span className="text-muted-foreground">2026-04-29: 发送产品资料</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs">
                  邮件
                </Badge>
                <span className="text-muted-foreground">2026-04-28: 发送公司介绍</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">编辑客户信息</Button>
          <Button>创建跟进任务</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// 导出所有示例组件
// ==========================================

export default {
  Yyc3ButtonExample,
  Yyc3DashboardCard,
  Yyc3EmployeeCareForm,
  Yyc3MarketingDashboard,
  Yyc3CustomerFollowUpDialog,
}
