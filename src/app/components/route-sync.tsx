/* eslint-disable react-refresh/only-export-components */
/**
 * @file route-sync.tsx
 * @description URL ↔ activePage 双向同步(P2-② hash 路由化)
 *   "URL 即状态源"的最小侵入方案:不重写 cyberpunk-standalone 的页面
 *   分发,而是让 hash 路由与 app-context.activePage 互相同步——应用内
 *   导航写 URL(#/<pageId>),浏览器后退/前进/深链还原状态。
 *   HashRouter 兼容 GitHub Pages 静态托管(无需服务端重写规则)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags routing,router,sync
 */

import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router'

import { useApp } from './app-context'
import { NAV_CATEGORIES } from './nav-config'

import type { PageId } from './app-context'

/** 全部可路由页面 id(nav-config 为单一来源,与 PageId 联合类型一一对应) */
export const PAGE_IDS: readonly PageId[] = NAV_CATEGORIES.flatMap((c) => c.items.map((i) => i.id))

export function isPageId(value: string): value is PageId {
  return (PAGE_IDS as readonly string[]).includes(value)
}

/**
 * 挂载于 AppProvider 内部。
 * 防循环设计:
 * - hash→state 仅响应 POP(后退/前进/刷新/深链首载);应用内导航产生的
 *   PUSH/REPLACE 不回写状态,由 state→hash 单向负责;
 * - state→hash 首帧跳过——深链必须先于持久化旧页面确立状态,
 *   否则挂载竞态会把 URL 顶回旧页面(并污染历史栈)。
 */
export function RouteSync() {
  const location = useLocation()
  const navigate = useNavigate()
  const navType = useNavigationType()
  const { activePage, setActivePage } = useApp()
  const mountedRef = useRef(false)
  // 刚由 URL→state 应用过的路径:POP 过渡期 state 尚未提交,
  // state→hash 效应若以过期 state 抢跑会 PUSH 污染前进栈(后退失效)
  const appliedFromUrlRef = useRef<string | null>(null)

  // hash → state
  useEffect(() => {
    if (navType !== 'POP') return
    const path = location.pathname.replace(/^\/+/, '')
    if (path && isPageId(path) && path !== activePage) {
      appliedFromUrlRef.current = path
      setActivePage(path)
    }
    // 故意不依赖 activePage:仅响应 URL/导航类型变化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navType, setActivePage])

  // state → hash
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    // 本轮 location 正是刚应用到 state 的 URL(POP 进行中)——交由其完成,不抢跑
    if (appliedFromUrlRef.current === location.pathname.replace(/^\/+/, '')) {
      appliedFromUrlRef.current = null
      return
    }
    const target = `/${activePage}`
    if (location.pathname !== target) {
      navigate(target)
    }
  }, [activePage, location.pathname, navigate])

  return null
}
