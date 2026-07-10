---
file: YYC3-M-MultiEnd-多端适配开发者指南.md
description: YYC³ 多端适配开发者指南 — API 参考、使用示例、最佳实践
author: YanYuCloudCube Team <admin@0379.email>
version: v2.0.0
created: 2026-07-11
updated: 2026-07-11
status: stable
tags: [多端适配],[开发者指南],[API]
category: developer-guide
language: zh-CN
audience: developers
complexity: intermediate
---

# YYC³ 多端适配开发者指南

---

## 1. 快速开始

```ts
// 导入多端模块
import {
  useBreakpoint, useIsMobile, useIsDesktop,
  detectPlatform, getPlatformCapabilities,
  offlineStorage,
  PlatformAware, MobileOnly, DesktopOnly, BreakpointAware,
  MobileBottomNav,
} from '@/multi-end'
```

## 2. 断点系统

### 2.1 断点常量

| 常量 | 值 | 范围 |
|------|-----|------|
| `BREAKPOINTS.xs` | 0 | < 480px |
| `BREAKPOINTS.sm` | 480 | 480–767px |
| `BREAKPOINTS.md` | 768 | 768–1023px |
| `BREAKPOINTS.lg` | 1024 | 1024–1279px |
| `BREAKPOINTS.xl` | 1280 | >= 1280px |

> **v2.0.0 修正**：`BREAKPOINTS` 值已修正为各断点**最小宽度**，而非边界阈值。`getBreakpoint()` 函数按降序匹配（先检查 `xl >= 1280`，再 `lg >= 1024`，以此类推）。

### 2.2 断点 Hooks

| Hook | 返回值 | 触发条件 |
|------|--------|---------|
| `useBreakpoint()` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | 当前视口断点 |
| `useIsMobile()` | `boolean` | < 768px (xs/sm) |
| `useIsTablet()` | `boolean` | 768-1023px (md) |
| `useIsDesktop()` | `boolean` | >= 1024px (lg/xl) |
| `useIsTouchDevice()` | `boolean` | 触控设备 |

### 2.3 Media Query 工具

```ts
import { BREAKPOINT_QUERIES, BREAKPOINT_UP, BREAKPOINT_DOWN } from '@/multi-end'

// 精确匹配
BREAKPOINT_QUERIES.sm  // "(min-width: 480px) and (max-width: 767px)"

// 向上匹配（>=）
BREAKPOINT_UP.lg       // "(min-width: 1024px)"

// 向下匹配（<=）
BREAKPOINT_DOWN.md     // "(max-width: 1023px)"
```

## 3. 平台检测

| 函数 | 说明 |
|------|------|
| `detectPlatform()` | 返回 `'web' \| 'pwa' \| 'mobile' \| 'desktop'` |
| `getPlatformCapabilities()` | 返回能力清单对象 |
| `getPlatformLabel()` | 返回平台中文标签映射 |

```ts
const platform = detectPlatform()
// 'web' | 'pwa' | 'mobile' | 'desktop'

const caps = getPlatformCapabilities()
// { supportsWasm, supportsWebGPU, maxStorageSize, isTouchDevice, ... }

const labels = getPlatformLabel()
// { web: 'Web 端', pwa: 'PWA 应用', mobile: '移动端', desktop: '桌面端' }
```

## 4. 离线存储

```ts
// 编辑器快照
await offlineStorage.saveEditorSnapshot('file-id', content)
const content = await offlineStorage.getEditorSnapshot('file-id')
await offlineStorage.deleteEditorSnapshot('file-id')

// AI 对话历史
await offlineStorage.saveChatHistory('session-id', messages)
const history = await offlineStorage.getChatHistory('session-id')

// API 缓存
await offlineStorage.cacheApiResponse('/api/endpoint', data)
const cached = await offlineStorage.getCachedApiResponse('/api/endpoint')

// 清理过期缓存
await offlineStorage.clearExpiredCache()
```

## 5. 条件渲染组件

```tsx
// 按平台裁剪
<PlatformAware platforms={['desktop', 'pwa']}>
  <PerformancePanel />
</PlatformAware>

// 按设备类型
<MobileOnly fallback={<DesktopNav />}>
  <MobileBottomNav />
</MobileOnly>

<DesktopOnly>
  <SidebarPanel />
</DesktopOnly>

// 按断点
<BreakpointAware breakpoints={['xs', 'sm']}>
  <BottomSheet />
</BreakpointAware>
```

## 6. 移动端底部导航

```tsx
import { MobileBottomNav } from '@/multi-end'

// 已内置 useIsMobile() 检测，直接使用
// 仅在 xs/sm 断点 (width < 768px) 时渲染
<MobileBottomNav />
```

## 7. 测试指南

### 7.1 运行测试

```bash
# 多端模块测试
pnpm vitest run tests/multi-end/

# 全局测试
pnpm vitest run
```

### 7.2 测试覆盖

| 测试套件 | 用例数 | 覆盖内容 |
|---------|-------|---------|
| Breakpoints | 2 | 常量值验证、升序检查 |
| useIsMobile | 2 | 移动端/桌面端判断 |
| useBreakpoint | 10 | 10 个边界值测试 |
| useIsTablet | 2 | 平板端判断 |
| useIsDesktop | 2 | 桌面端判断 |
| Platform | 5 | 平台检测、能力清单、标签 |
| PlatformAware | 3 | 匹配/不匹配/空渲染 |
| MobileOnly | 2 | 移动端显示/桌面端隐藏 |
| DesktopOnly | 2 | 桌面端显示/移动端隐藏 |
| BreakpointAware | 2 | 断点匹配/不匹配 |
| MobileBottomNav | 3 | 渲染/隐藏/按钮数量 |
| Integration | 1 | 组合组件场景 |

### 7.3 测试注意事项

1. **Mock 窗口宽度**：使用 `Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => width })` 设置 `window.innerWidth`，不使用 `writable: true`（jsdom 不支持）
2. **Mock 上下文**：`MobileBottomNav` 依赖 `useApp()` 和 `useI18n()`，测试时需 `vi.mock` 这两个上下文
3. **PWA 环境**：`detectPlatform()` 在 jsdom 中默认返回 `'web'`，不会返回 `'pwa'`

## 8. 最佳实践

1. **优先使用 `DesktopOnly`/`MobileOnly`** 而非手动判断 `useBreakpoint()`
2. **离线存储需捕获异常**：隐私模式或配额不足时 IndexedDB 可能不可用
3. **PWA 缓存策略**：静态资源走 CacheFirst，API 走 NetworkFirst
4. **底部导航**：`MobileBottomNav` 已内置断点检测，直接使用即可
5. **断点边界值**：`>=` 语义，480px 属于 `sm`（非 `xs`），768px 属于 `md`（非 `sm`），以此类推

## 9. 变更记录

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0.0 | 2026-07-11 | 初始版本 |
| v2.0.0 | 2026-07-11 | 修正 BREAKPOINTS 断点值，新增测试指南章节，补充测试注意事项 |