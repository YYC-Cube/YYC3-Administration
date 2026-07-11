# YYC³ 统一化规范文档

> **项目名称**: YYC³ CloudPivot Intelli-Matrix  
> **版本**: v1.0.0  
> **生效日期**: 2025-07-11  
> **适用范围**: 所有开发人员、设计师、文档编写人员

---

## 📋 目录

1. [设计语言规范](#1-设计语言规范)
2. [代码规范](#2-代码规范)
3. [文档规范](#3-文档规范)
4. [交互规范](#4-交互规范)

---

## 1. 设计语言规范

### 1.1 颜色系统

#### 核心原则

- **使用主题色变量**：所有颜色必须通过`useThemeColors()` hook获取，禁止硬编码颜色值
- **主题切换支持**：所有组件必须支持Cyberpunk和LiquidGlass双主题
- **颜色映射统一**：使用`getThemeNavColor()`函数进行颜色转换

#### 颜色变量命名

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `primary` | string | 主色，用于主要交互元素 |
| `secondary` | string | 次色，用于次要交互元素 |
| `accent` | string | 强调色，用于高亮和强调 |
| `success` | string | 成功状态色 |
| `danger` | string | 危险状态色 |
| `warning` | string | 警告状态色 |
| `muted` | string | 辅助色，用于次要内容 |

#### 背景色系统

| 变量名 | 说明 |
|--------|------|
| `bgBase` | 页面基础背景色 |
| `bgCard` | 卡片背景色 |
| `bgInput` | 输入框背景色 |
| `bgOverlay` | 遮罩层背景色 |

#### 文本色系统

| 变量名 | 说明 |
|--------|------|
| `textPrimary` | 主要文本颜色 |
| `textSecondary` | 次要文本颜色 |
| `textMuted` | 辅助文本颜色 |

#### 边框色系统

| 变量名 | 说明 |
|--------|------|
| `borderDefault` | 默认边框颜色 |
| `borderHover` | 悬停状态边框颜色 |
| `borderActive` | 激活状态边框颜色 |

#### 工具函数

```typescript
// 获取主题色
const tc = useThemeColors()

// 获取颜色透明度变体
const semiTransparent = tc.alpha(tc.primary, 0.5)

// 获取霓虹发光效果
const glow = tc.neonGlow(tc.primary)

// 获取导航项颜色（自动适配主题）
const navColor = getThemeNavColor('#00f0ff', isCyberpunk)
```

### 1.2 排版系统

#### 字体家族

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### 字体大小规范

| 类名 | 大小 | 用途 |
|------|------|------|
| `text-xs` | 12px | 辅助文字、标签、提示 |
| `text-sm` | 14px | 次要文字、按钮文字 |
| `text-base` | 16px | 正文、输入框文字 |
| `text-lg` | 18px | 小标题、卡片标题 |
| `text-xl` | 20px | 中标题、页面副标题 |
| `text-2xl` | 24px | 大标题、主要标题 |
| `text-3xl` | 30px | 页面标题、主标题 |

#### 字重规范

| 字重 | 值 | 用途 |
|------|-----|------|
| Regular | 400 | 正文、辅助文字 |
| Medium | 500 | 强调文字、按钮 |
| Semibold | 600 | 标题、重要信息 |
| Bold | 700 | 主标题、重点强调 |

#### 标题层级

```html
<!-- 页面标题 -->
<h1 class="text-3xl font-bold">页面标题</h1>

<!-- 区块标题 -->
<h2 class="text-xl font-semibold">区块标题</h2>

<!-- 卡片标题 -->
<h3 class="text-lg font-medium">卡片标题</h3>

<!-- 内容标题 -->
<h4 class="text-base font-medium">内容标题</h4>
```

### 1.3 圆角系统

| 类名 | 大小 | 用途 |
|------|------|------|
| `rounded-xs` | 4px | 小元素（按钮、输入框） |
| `rounded-sm` | 8px | 中小元素（标签、徽章） |
| `rounded-md` | 12px | 中等元素（卡片、容器） |
| `rounded-lg` | 16px | 大元素（模态框、大型容器） |
| `rounded-xl` | 20px | 特大元素（特殊容器） |
| `rounded-full` | 9999px | 圆形元素（头像、圆形按钮） |

### 1.4 间距系统

| 类名 | 大小 | 用途 |
|------|------|------|
| `space-1` | 4px | 极小间距 |
| `space-2` | 8px | 小间距 |
| `space-3` | 12px | 中小间距 |
| `space-4` | 16px | 标准间距 |
| `space-5` | 20px | 中大间距 |
| `space-6` | 24px | 大间距 |

### 1.5 阴影系统

| 类名 | 值 | 用途 |
|------|------|------|
| `shadow-sm` | 0 1px 3px rgba(0,0,0,0.1) | 轻微阴影 |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.1) | 中等阴影 |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) | 大阴影 |
| `shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) | 特大阴影 |

---

## 2. 代码规范

### 2.1 文件命名规范

#### UI组件

- **命名格式**: `kebab-case.tsx`
- **示例**: `button.tsx`, `card.tsx`, `input.tsx`

#### 业务组件

- **命名格式**: `PascalCase.tsx`
- **示例**: `DashboardPage.tsx`, `NeonCard.tsx`, `AppOverviewPage.tsx`

#### 工具函数

- **命名格式**: `kebab-case.ts`
- **示例**: `utils.ts`, `api-client.ts`, `formatters.ts`

#### Hooks

- **命名格式**: `use-kebab-case.ts`
- **示例**: `use-theme-colors.ts`, `use-global-shortcuts.ts`

### 2.2 变量命名规范

#### 通用规则

- **camelCase**: 变量、函数、方法名
- **PascalCase**: 类、接口、类型、组件名
- **UPPER_SNAKE_CASE**: 常量、枚举值

#### 特殊规则

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 布尔变量 | 以is/has/can开头 | `isVisible`, `hasError`, `canSubmit` |
| 数组变量 | 复数形式 | `users`, `items`, `dataList` |
| 回调函数 | 以handle开头 | `handleClick`, `handleSubmit` |
| Hook | 以use开头 | `useThemeColors`, `useGlobalShortcuts` |

### 2.3 注释规范

#### 文件头部注释

```typescript
/**
 * @file file-name.ts
 * @description 文件描述信息
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2025-07-11
 * @tags tag1, tag2
 */
```

#### 函数/方法注释

```typescript
/**
 * 函数功能描述
 *
 * @param paramName - 参数说明
 * @param paramName - 参数说明（可选参数标记为可选）
 * @returns 返回值说明
 * @throws 异常说明
 * @example
 * ```typescript
 * // 使用示例
 * const result = functionName(param);
 * ```
 */
```

#### 组件注释

```typescript
/**
 * 组件功能描述
 *
 * @component
 * @param propName - 属性说明
 * @param propName - 属性说明
 * @example
 * ```tsx
 * <Component prop={value} />
 * ```
 */
```

#### 类型/接口注释

```typescript
/**
 * 类型/接口描述
 */
interface InterfaceName {
  /** 属性描述 */
  propertyName: string
}
```

### 2.4 导入导出规范

#### 导入顺序

1. 外部依赖（按字母顺序）
2. 内部依赖（按路径深度排序）
3. 样式文件

```typescript
// 外部依赖
import { useState, useEffect } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

// 内部依赖
import { cn } from './utils'
import { useThemeColors } from '../hooks/use-theme-colors'

// 样式文件（如有）
import './styles.css'
```

#### 导出方式

- **UI组件**: 使用命名导出
- **业务组件**: 使用命名导出
- **工具函数**: 使用命名导出
- **Hooks**: 使用命名导出
- **类型定义**: 使用命名导出

```typescript
// 正确：命名导出
export function Button({}) {}
export { cn }
export type { ThemeColors }

// 错误：默认导出（除非有特殊理由）
export default Button
```

### 2.5 React导入规范

```typescript
// 统一使用
import * as React from 'react'

// 禁止使用
import React from 'react'
```

### 2.6 代码格式规范

#### 缩进

- **使用空格**: 4个空格
- **文件末尾**: 保留一个空行

#### 分号

- **必须使用**: 语句结尾必须加分号

#### 引号

- **单引号**: 字符串使用单引号
- **反引号**: 模板字符串使用反引号

#### 括号

- **函数声明**: 大括号前有空格
- **箭头函数**: 参数括号保留

#### 空行

- **函数之间**: 保留一个空行
- **逻辑块之间**: 保留一个空行
- **导入和代码之间**: 保留一个空行

---

## 3. 文档规范

### 3.1 文档格式统一

#### 标题层级

```markdown
# 一级标题（页面标题）
## 二级标题（章节标题）
### 三级标题（子章节标题）
#### 四级标题（小节标题）
```

#### 目录

所有文档必须包含目录，格式如下：

```markdown
## 📋 目录

1. [章节一](#1-章节一)
2. [章节二](#2-章节二)
3. [章节三](#3-章节三)
```

#### 列表

- **无序列表**: 使用 `-` 或 `*`
- **有序列表**: 使用数字加句点
- **表格**: 使用标准Markdown表格格式

#### 代码块

```markdown
```typescript
// TypeScript代码
const code = 'example'
```

```css
/* CSS代码 */
.selector { }
```

```json
{ "key": "value" }
```
```

### 3.2 文档类型规范

#### 组件文档

```markdown
# 组件名称

## 概述

组件功能描述

## 属性（Props）

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| propName | Type | defaultValue | 属性说明 |

## 使用示例

```tsx
<Component prop={value} />
```

## 主题适配

说明组件在不同主题下的表现

## 可访问性

说明组件的可访问性特性
```

#### API文档

```markdown
# API端点名称

## 概述

API功能描述

## 请求

- **方法**: GET/POST/PUT/DELETE
- **路径**: `/api/endpoint`
- **认证**: 需要/不需要

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paramName | Type | 是/否 | 参数说明 |

### 请求体

```json
{
  "key": "value"
}
```

## 响应

### 成功响应

**状态码**: 200

```json
{
  "data": []
}
```

### 错误响应

**状态码**: 400/401/500

```json
{
  "error": "错误信息"
}
```
```

#### 开发文档

```markdown
# 文档标题

## 概述

文档功能描述

## 背景

相关背景信息

## 实现方案

详细的实现方案

## 代码示例

相关代码示例

## 注意事项

需要注意的事项
```

---

## 4. 交互规范

### 4.1 表单交互规范

#### 输入框

- **聚焦状态**: 显示边框发光效果
- **错误状态**: 边框变为红色，显示错误提示
- **成功状态**: 边框变为绿色
- **占位符**: 使用`text-muted-foreground`颜色

#### 按钮

- **悬停状态**: 上移2px，阴影增强
- **点击状态**: 缩小到98%
- **禁用状态**: 透明度50%，禁用指针事件

#### 验证反馈

```tsx
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>标签</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>说明文字</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 4.2 弹窗行为规范

#### 打开动画

- **缩放动画**: 从0.95倍放大到1倍
- **淡入动画**: 从透明变为不透明
- **持续时间**: 200ms

#### 关闭动画

- **缩放动画**: 从1倍缩小到0.95倍
- **淡出动画**: 从不透明变为透明
- **持续时间**: 200ms

#### 关闭方式

1. 点击关闭按钮
2. 点击遮罩层
3. 按下Esc键

### 4.3 加载状态规范

#### 全局加载

- **全屏遮罩**: 半透明黑色背景
- **加载动画**: 旋转的Spinner组件
- **加载文字**: 居中显示"加载中..."

#### 局部加载

- **骨架屏**: 使用Skeleton组件
- **按钮加载**: 显示Loading图标，禁用按钮
- **列表加载**: 显示多个Skeleton占位

#### 加载组件使用

```tsx
// 页面级加载
<Loading />

// 组件级加载
<Button loading>提交</Button>

// 列表骨架屏
<Skeleton className="h-10 w-full mb-2" />
<Skeleton className="h-10 w-full mb-2" />
<Skeleton className="h-10 w-full" />
```

### 4.4 错误提示规范

#### 错误分类

| 类型 | 颜色 | 图标 | 用途 |
|------|------|------|------|
| 错误 | 红色 | AlertCircle | 操作失败、数据错误 |
| 警告 | 橙色 | AlertTriangle | 潜在问题、需要注意 |
| 信息 | 蓝色 | Info | 提示信息、说明 |
| 成功 | 绿色 | CheckCircle | 操作成功 |

#### Toast提示

```tsx
import { toast } from './use-toast'

// 成功提示
toast.success('操作成功')

// 错误提示
toast.error('操作失败，请重试')

// 警告提示
toast.warning('请检查输入内容')

// 信息提示
toast.info('新消息提醒')
```

#### 内联提示

```tsx
// 错误状态
<Input aria-invalid />
<FormMessage>错误信息</FormMessage>

// 警告提示
<Alert variant="destructive">
  <AlertTitle>警告</AlertTitle>
  <AlertDescription>警告信息</AlertDescription>
</Alert>
```

### 4.5 快捷键规范

#### 通用快捷键

| 快捷键 | 功能 | 分类 |
|--------|------|------|
| `Ctrl + K` | 打开命令面板 | 导航 |
| `Ctrl + /` | 打开侧边栏 | 导航 |
| `Ctrl + .` | 打开通知面板 | 导航 |
| `Ctrl + F` | 全局搜索 | 导航 |
| `Ctrl + N` | 新建对话 | 操作 |
| `Ctrl + S` | 保存文件 | 编辑 |
| `Ctrl + E` | 导出数据 | 操作 |
| `Escape` | 关闭/返回 | 导航 |

#### 快捷键注册

```tsx
import { useGlobalShortcuts } from './hooks/use-global-shortcuts'

useGlobalShortcuts([
  { id: 'save', label: '保存', combo: 'ctrl+s', handler: handleSave },
  { id: 'search', label: '搜索', combo: 'ctrl+f', handler: openSearch },
])
```

#### 快捷键帮助面板

所有快捷键必须在帮助面板中展示：

```tsx
<Dialog open={showShortcuts}>
  <DialogContent>
    <DialogTitle>快捷键列表</DialogTitle>
    <div className="space-y-2">
      {DEFAULT_SHORTCUTS.map((shortcut) => (
        <div key={shortcut.id} className="flex justify-between">
          <span>{shortcut.label}</span>
          <kbd className="px-2 py-1 bg-accent rounded">{formatCombo(shortcut.combo)}</kbd>
        </div>
      ))}
    </div>
  </DialogContent>
</Dialog>
```

---

## ✅ 规范检查清单

### 设计语言检查

- [ ] 所有颜色使用主题变量
- [ ] 支持双主题切换
- [ ] 字体大小符合规范
- [ ] 标题层级正确
- [ ] 圆角和间距符合规范

### 代码规范检查

- [ ] 文件命名符合规范
- [ ] 变量命名符合规范
- [ ] 注释完整符合规范
- [ ] 导入导出符合规范
- [ ] 代码格式符合规范

### 文档规范检查

- [ ] 文档格式统一
- [ ] 包含目录
- [ ] 代码块有语言标识
- [ ] 组件文档完整
- [ ] API文档完整

### 交互规范检查

- [ ] 表单交互统一
- [ ] 弹窗行为统一
- [ ] 加载状态统一
- [ ] 错误提示统一
- [ ] 快捷键统一

---

*规范文档结束*  
*YYC³ CloudPivot Intelli-Matrix*  
*admin@0379.email*