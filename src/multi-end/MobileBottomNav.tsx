/**
 * @file multi-end/MobileBottomNav.tsx
 * @description YYC³ 移动端底部导航栏 — 触控优化，适配 xs/sm 断点
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @status stable
 * @tags multi-end,mobile,bottom-nav,touch
 */

import {
  BarChart3,
  Bot,
  Code,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Wrench,
} from 'lucide-react'
import { useCallback } from 'react'

import { type PageId, useApp } from '../app/components/app-context'
import { useI18n } from '../app/components/i18n-context'
import { useBreakpoint } from './breakpoints'

import type { ReactNode } from 'react'

// ==========================================
// 底部导航配置
// ==========================================

interface NavItem {
  id: PageId
  labelKey: string
  icon: (props: { className?: string }) => ReactNode
  color: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: (p) => <LayoutDashboard {...p} />, color: '#00f0ff' },
  { id: 'chat', labelKey: 'nav.chat', icon: (p) => <MessageCircle {...p} />, color: '#00ffcc' },
  { id: 'devWorkspace', labelKey: 'nav.devWorkspace', icon: (p) => <Code {...p} />, color: '#00d4ff' },
  { id: 'aiCreativeTools', labelKey: 'nav.aiTools', icon: (p) => <Bot {...p} />, color: '#41ffdd' },
  { id: 'settings', labelKey: 'nav.settings', icon: (p) => <Settings {...p} />, color: '#888888' },
]

/**
 * 移动端底部导航栏
 * 仅在 xs/sm 断点显示，提供 5 个核心 Tab 快速切换
 */
export function MobileBottomNav() {
  const bp = useBreakpoint()
  const { activePage, setActivePage } = useApp()
  const { t } = useI18n()

  const handleNavigate = useCallback(
    (pageId: PageId) => {
      setActivePage(pageId)
    },
    [setActivePage]
  )

  // 仅在 xs/sm 断点显示
  if (bp !== 'xs' && bp !== 'sm') {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 px-1 pb-safe"
      style={{
        background: 'rgba(10,10,10,0.95)',
        borderTop: '1px solid rgba(0,240,255,0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activePage === item.id
        return (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className="flex flex-col items-center justify-center gap-1 min-w-0 flex-1 py-1 transition-all duration-200 active:scale-90"
            style={{
              color: isActive ? item.color : 'rgba(255,255,255,0.35)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] leading-none truncate max-w-full">
              {t(item.labelKey as never)}
            </span>
            {isActive && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}