/**
 * @file components/demo-environment-banner.tsx
 * @description 演示环境警示横幅。
 *   当 Supabase 未配置(应用运行于本地演示认证模式)时,在所有页面
 *   (含登录页)顶部固定展示警示:数据仅保存在本地浏览器,请勿输入真实
 *   账号、密码或 API 密钥。Supabase 激活后自动隐藏。
 *   可关闭,关闭状态记于 sessionStorage(关闭当前会话期间不再出现,
 *   下次打开浏览器重新提示,避免用户长期忽视风险)。
 *
 *   横幅自测量高度并为 body 设置 padding-top,避免遮挡应用顶栏;
 *   卸载/关闭时还原。
 *
 *   见审计报告 F-02(2026-09-26):公网演示站此前无任何风险声明,
 *   用户可能误以为是生产系统而输入真实凭据。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags security,demo,banner,ux
 */

import { AlertCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { isSupabaseConfigured } from '@/lib/supabase-client'

const STORAGE_KEY = 'yyc3_demo_banner_dismissed'

/**
 * 演示环境警示横幅。
 * - 仅在 Supabase 未配置(本地演示认证)时渲染;
 * - 固定顶部、高 z-index,确保覆盖登录页与所有业务页面;
 * - 关闭后当前会话不再出现(sessionStorage),下次启动浏览器重新提示;
 * - 自测量高度,为 body 注入 padding-top 以免遮挡应用内容。
 */
export function DemoEnvironmentBanner() {
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  // 读取已关闭状态(session 级)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') setDismissed(true)
    } catch {
      /* storage 不可用时保持展示(安全侧优先) */
    }
  }, [])

  // 自测量高度 → body padding-top,避免遮挡
  useEffect(() => {
    if (dismissed) return
    const el = bannerRef.current
    if (!el) return
    const apply = () => {
      document.body.style.paddingTop = `${el.offsetHeight}px`
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.body.style.paddingTop = ''
    }
  }, [dismissed])

  if (isSupabaseConfigured || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      ref={bannerRef}
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'none', // 点击穿透,避免拦截下方模态层/应用元素
        background: 'linear-gradient(90deg, #b45309, #d97706)',
        color: '#fffbeb',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <AlertCircle size={18} style={{ flexShrink: 0 }} aria-hidden="true" />
      <span style={{ flex: 1 }}>
        <strong>{t('deb.title')}</strong>
        {t('deb.descLocal')}
        <span style={{ opacity: 0.9 }}> {t('deb.descWarn')}</span>
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t('deb.dismiss')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          pointerEvents: 'auto', // 仅关闭按钮可交互
        }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
