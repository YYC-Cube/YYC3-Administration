/**
 * @file error-monitor.ts
 * @description YYC³ Error Monitoring（终审 F-14 整改）——可选 Sentry 接线。
 *   仅在构建期注入了 VITE_SENTRY_DSN 时激活；未配置则完全惰性
 *   （不加载 SDK chunk，首屏零额外体积，运行时零开销）。
 *   DSN 属构建期内联的公开配置（非密钥），但请勿在文档/仓库提交真实项目 DSN。
 */

import { APP_VERSION } from '@/app/version'

/** 构建期内联的 DSN；未配置 = undefined → 监控关闭 */
const DSN = import.meta.env.VITE_SENTRY_DSN

/**
 * 初始化错误监控（fire-and-forget，应用入口处调用一次）。
 *
 * 动态 import：Sentry chunk 仅在配置了 DSN 的构建中被引用，
 * 默认构建（未配置）完全不产生该 chunk。
 * 初始化失败只告警不抛出——监控永远不能影响业务。
 */
export async function initErrorReporting(): Promise<void> {
  if (!DSN) {
    return
  }
  try {
    const { init } = await import('@sentry/browser')
    init({
      dsn: DSN,
      release: APP_VERSION,
      environment: import.meta.env.MODE,
      // 静态演示站流量不可控，采样保守防配额意外耗尽
      tracesSampleRate: 0,
      sampleRate: 0.5,
    })
  } catch (error) {
    console.warn('[error-monitor] 初始化失败（不影响应用运行）:', error)
  }
}
