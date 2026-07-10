/**
 * @file multi-end/index.ts
 * @description YYC³ 多端适配模块 — 统一导出入口
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

// 断点系统
export {
  BREAKPOINTS,
  BREAKPOINT_QUERIES,
  BREAKPOINT_UP,
  BREAKPOINT_DOWN,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouchDevice,
} from './breakpoints'
export type { Breakpoint } from './breakpoints'

// 平台检测
export { detectPlatform, getPlatformCapabilities, getPlatformLabel } from './platform'
export type { Platform, PlatformCapabilities } from './platform'

// 离线存储
export { offlineStorage, OfflineStorage } from './storage'

// 平台感知组件
export { PlatformAware, MobileOnly, DesktopOnly, BreakpointAware } from './PlatformAware'

// 移动端底部导航
export { MobileBottomNav } from './MobileBottomNav'
