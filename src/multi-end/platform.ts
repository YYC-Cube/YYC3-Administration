/**
 * @file multi-end/platform.ts
 * @description YYC³ 平台检测与能力适配 — 多端统一入口
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @status stable
 * @tags multi-end,platform,adaption,detection
 */

// ==========================================
// 平台类型定义
// ==========================================

export type Platform = 'web' | 'pwa' | 'mobile' | 'desktop'

/**
 * 各平台能力边界描述
 */
export interface PlatformCapabilities {
  /** 是否支持 WebAssembly */
  supportsWasm: boolean
  /** 是否支持 WebGPU 加速 */
  supportsWebGPU: boolean
  /** 是否支持 IndexedDB */
  supportsIndexedDB: boolean
  /** 是否支持本地文件系统访问 */
  supportsFileSystem: boolean
  /** 是否支持 Web Push 推送 */
  supportsPushNotification: boolean
  /** 本地存储上限（MB） */
  maxStorageSize: number
  /** 是否为触控设备 */
  isTouchDevice: boolean
  /** 是否支持离线使用 */
  isOfflineCapable: boolean
  /** 是否为独立窗口（已安装 PWA） */
  isStandalone: boolean
}

// ==========================================
// 平台检测
// ==========================================

/**
 * 检测当前运行平台
 * - `pwa`: 已安装并运行在独立窗口模式
 * - `mobile`: 移动端浏览器（触控 + 小屏）
 * - `desktop`: 桌面端浏览器（大屏）
 * - `web`: 默认 Web 浏览器
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web'

  // PWA 独立窗口模式
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'pwa'
  }

  // 移动端判断
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
  const isSmallScreen = window.innerWidth < 1024

  if (isMobile || isSmallScreen) {
    return 'mobile'
  }

  return 'desktop'
}

/**
 * 获取当前平台能力清单
 */
export function getPlatformCapabilities(): PlatformCapabilities {
  if (typeof window === 'undefined') {
    return getDefaultCapabilities()
  }

  const standalone = window.matchMedia('(display-mode: standalone)').matches

  return {
    supportsWasm: typeof WebAssembly !== 'undefined',
    supportsWebGPU: 'gpu' in navigator,
    supportsIndexedDB: 'indexedDB' in window,
    supportsFileSystem: 'showOpenFilePicker' in window,
    supportsPushNotification: 'serviceWorker' in navigator && 'PushManager' in window,
    maxStorageSize: estimateStorageQuota(),
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isOfflineCapable: standalone,
    isStandalone: standalone,
  }
}

function getDefaultCapabilities(): PlatformCapabilities {
  return {
    supportsWasm: false,
    supportsWebGPU: false,
    supportsIndexedDB: false,
    supportsFileSystem: false,
    supportsPushNotification: false,
    maxStorageSize: 0,
    isTouchDevice: false,
    isOfflineCapable: false,
    isStandalone: false,
  }
}

/**
 * 估算可用存储配额（MB）
 */
function estimateStorageQuota(): number {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      // 异步估算，同步返回默认值
      return 500 // 默认 500MB
    }
  } catch {
    /* ignore */
  }
  return 100 // 保守估计
}

/**
 * 获取平台标签（中文）
 */
export function getPlatformLabel(): Record<Platform, string> {
  return {
    web: 'Web 端',
    pwa: 'PWA 应用',
    mobile: '移动端',
    desktop: '桌面端',
  }
}
