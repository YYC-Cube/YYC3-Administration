import {
  Award,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Check,
  ChevronDown,
  ClipboardList,
  Code,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Heart,
  History,
  Image,
  Languages,
  Layers,
  LayoutDashboard,
  Link,
  Megaphone,
  Menu,
  MessageCircle,
  MessageSquare,
  PenTool,
  Phone,
  PlayCircle,
  Radio,
  Rocket,
  ScrollText,
  Search,
  Server,
  Settings,
  Shield,
  Star,
  Target,
  UserCircle,
  UserPlus,
  Users,
  Wifi,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { NavGroup, NavItem } from '@/app/components/cyberpunk-nav'

import { type PageId, useApp, useRealtimeSimulation } from '@/app/components/app-context'
import { CommandPalette, useCommandPalette } from '@/app/components/command-palette'
import { navGroups, navItems, sidebarPersonal } from '@/app/components/cyberpunk-nav'
import { DataExportModal } from '@/app/components/data-export-modal'
import { ErrorBoundary } from '@/app/components/error-boundary'
import { useI18n } from '@/app/components/i18n-context'
import { renderLazyPage } from '@/app/components/lazy-pages'
import { findCategoryByPageId, NAV_CATEGORIES } from '@/app/components/nav-config'
import { NotificationDrawer } from '@/app/components/notification-drawer'
import { OnboardingTutorial } from '@/app/components/onboarding-tutorial'
import { PageTransition } from '@/app/components/page-transition'
import { ParticleCanvas } from '@/app/components/particle-canvas'
import { ChatPage, FormsTabPage } from '@/app/components/shell-pages'
import { ThemeSwitcherButtonCompact } from '@/app/components/theme-switcher-button'
import { DashboardPage } from '@/features/overview/pages/dashboard-page'
import { ProfilePage } from '@/features/platform/pages/profile-page'
import { ModelSettings } from '@/features/settings/model-settings/model-settings'
import { SettingsPage } from '@/features/settings/pages/settings-page-standalone'
import { ApiDocs } from '@/features/toolkit/pages/api-docs'
import { MobileBottomNav } from '@/multi-end'
import { getThemeNavColor, useThemeColors } from '@/shared/hooks/use-theme-colors'
import { useAIModel } from '@/stores/useAIModelStore'

// --- Nav item type ---
export function CyberpunkStandalone({ onSwitchMode }: { onSwitchMode: () => void }) {
  const {
    activePage,
    setActivePage,
    sidebarPinned,
    setSidebarPinned,
    unreadCount,
    theme,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useApp()
  const { t, locale, setLocale, flags: localeFlags, labels: localeLabels } = useI18n()
  const { openModelSettings } = useAIModel()
  const tc = useThemeColors()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [sensorGlow, setSensorGlow] = useState(0)
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    platformIntegration: true,
    aiMarketing: true,
  })
  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])
  // Auto-expand group when one of its items is active
  useEffect(() => {
    for (const g of navGroups) {
      if (g.items.some((i) => i.id === activePage) && collapsedGroups[g.groupKey]) {
        setCollapsedGroups((prev) => ({ ...prev, [g.groupKey]: false }))
        break
      }
    }
  }, [activePage]) // eslint-disable-line react-hooks/exhaustive-deps

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    const cat = findCategoryByPageId(activePage)
    return cat?.id ?? 'overview'
  })
  const cmdPalette = useCommandPalette()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const sensorZoneRef = useRef<HTMLDivElement>(null)
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Phase 4: Realtime simulation — auto-push notifications & activities
  useRealtimeSimulation()

  // Phase 4: Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Ctrl+. → Toggle notification drawer
      if ((e.ctrlKey || e.metaKey) && e.key === '.') {
        e.preventDefault()
        setNotifDrawerOpen((prev) => !prev)
      }
      // Ctrl+/ → Toggle sidebar pin
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setSidebarPinned(!sidebarPinned)
      }
      // Ctrl+E → Open export modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        setExportModalOpen(true)
      }
      // Ctrl+N → Navigate to chat (new session)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setActivePage('chat')
      }
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [sidebarPinned, setSidebarPinned, setActivePage])

  // Responsive: detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Close mobile sidebar when navigating
  const handleNavClick = useCallback(
    (page: PageId) => {
      setActivePage(page)
      const cat = findCategoryByPageId(page)
      if (cat) setActiveCategory(cat.id)
      if (isMobile) setMobileSidebarOpen(false)
    },
    [isMobile, setActivePage, setMobileSidebarOpen],
  )

  // Proximity sensor: detect mouse near the sidebar edge
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarPinned) return
      const threshold = 80 // px from left edge
      const dist = e.clientX
      if (dist <= threshold) {
        const intensity = Math.max(0, 1 - dist / threshold)
        setSensorGlow(intensity)
        if (dist <= 60) {
          clearTimeout(collapseTimerRef.current)
          setSidebarExpanded(true)
        }
      } else if (!sidebarRef.current?.contains(e.target as Node)) {
        setSensorGlow(0)
        collapseTimerRef.current = setTimeout(() => {
          setSidebarExpanded(false)
        }, 400)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(collapseTimerRef.current)
    }
  }, [sidebarPinned])

  const handleSidebarEnter = () => {
    clearTimeout(collapseTimerRef.current)
    setSidebarExpanded(true)
    setSensorGlow(1)
  }

  const handleSidebarLeave = () => {
    if (sidebarPinned) return
    setSensorGlow(0)
    collapseTimerRef.current = setTimeout(() => {
      setSidebarExpanded(false)
    }, 300)
  }

  const isExpanded = sidebarExpanded || sidebarPinned

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: tc.bgBase }}>
      {/* Circuit Grid BG — cyberpunk only */}
      {tc.isCyberpunk && theme.circuitGridEnabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(0,240,255,${(0.04 * theme.neonIntensity) / 100}) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,${(0.04 * theme.neonIntensity) / 100}) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      )}
      {/* Scanlines — cyberpunk only */}
      {tc.isCyberpunk && theme.scanlineEnabled && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
            animation: 'scanline-move 12s linear infinite',
          }}
        />
      )}

      {/* Particle Background — cyberpunk only */}
      {tc.isCyberpunk && <ParticleCanvas />}

      {/* === HEADER === */}
      <header
        role="banner"
        aria-label={t('header.ariaLabel')}
        className="relative z-50 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6"
        style={{
          background: tc.headerBg,
          borderBottom: tc.isCyberpunk
            ? `2px solid ${tc.headerBorder}`
            : `1px solid ${tc.headerBorder}`,
          boxShadow: tc.isCyberpunk
            ? `0 0 ${(15 * theme.neonIntensity) / 100}px rgba(0,240,255,${(0.4 * theme.neonIntensity) / 100}), 0 0 ${(30 * theme.neonIntensity) / 100}px rgba(0,240,255,${(0.15 * theme.neonIntensity) / 100})`
            : tc.headerGlow,
          backdropFilter: theme.blurEnabled ? tc.backdropFilter : 'none',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors md:hidden"
            >
              <Menu className="w-5 h-5" style={{ color: tc.primary }} />
            </button>
          )}
          {/* Logo */}
          <div
            className={`flex items-center gap-2 sm:gap-3 ${tc.isLiquidGlass ? 'logo-liquid' : ''}`}
            style={{
              animation: theme.springAnimEnabled
                ? tc.isCyberpunk
                  ? 'float-rotate 6s ease-in-out infinite'
                  : 'logoFloat 6s ease-in-out infinite'
                : 'none',
            }}
          >
            <img
              src="/yyc3-icons/Web App/apple-touch-icon.png"
              alt="YYC³ Logo"
              className="h-10 w-auto object-contain"
              style={{
                filter: tc.isCyberpunk ? 'drop-shadow(0 0 10px rgba(0,240,255,0.5))' : 'none',
              }}
            />
          </div>
        </div>

        {/* Center - Category Tabs */}
        <nav
          className="hidden md:flex items-center gap-1"
          role="navigation"
          aria-label={t('ui.mainNav')}
        >
          {NAV_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon
            const isActive = activeCategory === cat.id
            const c = cat.color
            return (
              <button
                key={cat.id}
                data-nav-id={cat.items[0]?.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  const firstItem = cat.items[0]
                  if (firstItem) handleNavClick(firstItem.id)
                }}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300"
                style={{
                  background: isActive ? tc.alpha(c, 0.12) : 'transparent',
                  color: isActive ? c : tc.alpha(c, 0.5),
                  boxShadow: isActive ? `0 0 8px ${tc.alpha(c, 0.15)}` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = tc.alpha(c, 0.06)
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <CatIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden lg:inline">{t(cat.labelKey)}</span>
                {isActive && (
                  <div
                    className="absolute -bottom-0.5 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: c, boxShadow: `0 0 6px ${tc.alpha(c, 0.4)}` }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Bar */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer"
            style={{
              background: tc.alpha(tc.primary, 0.06),
              border: `1px solid ${tc.alpha(tc.primary, 0.15)}`,
              minWidth: 160,
            }}
            onClick={() => cmdPalette.setOpen(true)}
          >
            <Search className="w-3.5 h-3.5 shrink-0" style={{ color: tc.alpha(tc.primary, 0.4) }} />
            <span className="text-xs truncate" style={{ color: tc.alpha(tc.primary, 0.35) }}>
              {t('ui.search')}
            </span>
            <kbd
              className="ml-auto text-[9px] px-1 py-0.5 rounded"
              style={{
                background: tc.alpha(tc.primary, 0.08),
                border: `1px solid ${tc.alpha(tc.primary, 0.1)}`,
                color: tc.alpha(tc.primary, 0.3),
              }}
            >
              ⌘K
            </kbd>
          </div>
          {/* Mobile search button */}
          <button
            className="sm:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
            onClick={() => cmdPalette.setOpen(true)}
            title={t('ui.searchHint')}
          >
            <Search className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </button>

          {/* Migrated from sidebar: History / Favorites / Profile */}
          {sidebarPersonal.map((item) => {
            const PIcon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'profile') handleNavClick('profile')
                }}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors group relative"
                title={t(item.labelKey)}
              >
                <PIcon
                  className="w-4 h-4 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                />
              </button>
            )
          })}

          {/* Settings */}
          <button
            onClick={() => handleNavClick('settings')}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors group relative"
            title={t('nav.settings')}
          >
            <Settings
              className="w-4 h-4 transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            />
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors group relative"
              title={t('nav.language')}
              aria-label={t('nav.language')}
            >
              <Globe
                className="w-4 h-4 transition-colors"
                style={{ color: langOpen ? tc.primary : 'rgba(255,255,255,0.3)' }}
              />
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-50 rounded-xl border p-1 min-w-[170px] backdrop-blur-xl"
                  style={{
                    background: tc.bgElevated,
                    borderColor: tc.borderDefault,
                    boxShadow: tc.shadowLg,
                  }}
                >
                  {(
                    ['zh', 'en', 'ja', 'zh-TW', 'ko', 'fr', 'de', 'es', 'pt-BR', 'ar'] as const
                  ).map((code) => {
                    const active = locale === code
                    const flag = localeFlags[code as keyof typeof localeFlags] ?? ''
                    const label = localeLabels[code as keyof typeof localeLabels] ?? code
                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setLocale(code)
                          setLangOpen(false)
                          toast.success(`${flag} ${label} ✓`, { duration: 1500 })
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
                        style={{
                          background: active ? tc.alpha(tc.primary, 0.1) : 'transparent',
                          color: active ? tc.primary : tc.textSecondary,
                        }}
                      >
                        <span className="text-base">{flag}</span>
                        <span className="flex-1 text-left">{label}</span>
                        {active && <Check className="w-3.5 h-3.5" style={{ color: tc.primary }} />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* AI Model */}
          <button
            onClick={openModelSettings}
            className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
            title={t('header.aiModel')}
            aria-label={t('header.aiModel')}
          >
            <Bot className="w-4 h-4 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <span className="sr-only">{t('ui.aiModel')}</span>
          </button>
          {/* Notifications */}
          <button
            onClick={() => setNotifDrawerOpen(true)}
            className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
            title={t('header.notifications')}
            aria-label={
              unreadCount > 0
                ? t('header.unreadNotif', { count: unreadCount })
                : t('header.notifications')
            }
          >
            <Bell
              className="w-4 h-4 transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] text-white"
                style={{
                  background: tc.isCyberpunk ? '#005f73' : tc.primary,
                  boxShadow: tc.isCyberpunk
                    ? '0 0 6px #005f73'
                    : `0 0 8px ${tc.alpha(tc.primary, 0.5)}`,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          {/* Theme Switcher Button */}
          <div className="hidden sm:block">
            <ThemeSwitcherButtonCompact />
          </div>
          <button
            onClick={onSwitchMode}
            className="hidden sm:block px-3 py-1.5 rounded-xl text-xs transition-all duration-300 border"
            style={{
              borderColor: tc.alpha(tc.secondary, 0.25),
              color: tc.secondary,
              background: tc.alpha(tc.secondary, 0.05),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 15px ${tc.alpha(tc.secondary, 0.4)}`
              e.currentTarget.style.background = tc.alpha(tc.secondary, 0.15)
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.background = tc.alpha(tc.secondary, 0.05)
            }}
          >
            {t('header.widgetMode')}
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px-36px)] sm:h-[calc(100vh-64px-40px)] relative z-10">
        {/* === MOBILE SIDEBAR DRAWER === */}
        {isMobile && mobileSidebarOpen && (
          <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: theme.blurEnabled ? 'blur(4px)' : 'none',
                animation: 'fade-in 0.2s ease-out both',
              }}
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <div
              className="absolute left-0 top-0 bottom-0 w-72 border-r overflow-y-auto"
              style={{
                background: tc.isCyberpunk ? 'rgba(10,10,10,0.96)' : 'rgba(10,15,10,0.92)',
                borderColor: tc.sidebarBorderExpanded,
                backdropFilter: theme.blurEnabled ? tc.backdropFilter : 'none',
                boxShadow: tc.isCyberpunk
                  ? `4px 0 30px rgba(0,240,255,${(0.15 * theme.neonIntensity) / 100})`
                  : '4px 0 30px rgba(0,0,0,0.2)',
                animation: 'slide-in-left 0.35s var(--spring-easing) both',
                scrollbarWidth: 'none',
              }}
            >
              {/* Close button */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: tc.alpha(tc.primary, 0.1) }}
              >
                <span
                  className="text-xs tracking-wider uppercase"
                  style={{ color: tc.alpha(tc.primary, 0.6) }}
                >
                  {t('nav.menu')}
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4 text-white/30" />
                </button>
              </div>
              {/* Nav items */}
              <div className="p-3 space-y-0.5">
                <p
                  className="text-[9px] tracking-[0.2em] mb-2 px-3 uppercase"
                  style={{
                    color: tc.alpha(tc.primary, 0.4),
                    textShadow: `0 0 5px ${tc.alpha(tc.primary, 0.3)}`,
                  }}
                >
                  {t('nav.coreFeatures')}
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = activePage === item.id
                  const mc = getThemeNavColor(item.color, tc.isCyberpunk)
                  return (
                    <button
                      key={item.id}
                      data-nav-id={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300"
                      style={{
                        background: active ? tc.navActiveBg(mc) : 'transparent',
                        boxShadow: active ? tc.navActiveGlow(mc) : 'none',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                        style={{
                          background: active ? tc.alpha(mc, 0.12) : tc.alpha(mc, 0.04),
                          border: `1px solid ${active ? tc.alpha(mc, 0.3) : tc.alpha(mc, 0.12)}`,
                          boxShadow: active
                            ? `0 0 8px ${tc.alpha(mc, 0.15)}, inset 0 0 4px ${tc.alpha(mc, 0.05)}`
                            : `0 0 4px ${tc.alpha(mc, 0.06)}`,
                        }}
                      >
                        <Icon
                          className="w-4 h-4 transition-all duration-300"
                          style={{ color: active ? mc : tc.alpha(mc, 0.6) }}
                        />
                      </div>
                      <span
                        className="text-sm transition-colors duration-300"
                        style={{ color: active ? mc : tc.textSecondary }}
                      >
                        {t(item.labelKey)}
                      </span>
                      {item.badge && (
                        <span
                          className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] text-white font-medium"
                          style={{ background: mc, boxShadow: tc.navBadgeShadow(mc) }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {/* Nav Groups (mobile drawer) */}
              {navGroups.map((group) => {
                const isCollapsed = collapsedGroups[group.groupKey] ?? true
                return (
                  <div key={group.groupKey} className="px-3 mt-1">
                    <button
                      onClick={() => toggleGroup(group.groupKey)}
                      className="w-full flex items-center justify-between px-3 py-1.5"
                    >
                      <span
                        className="text-[9px] tracking-[0.2em] uppercase"
                        style={{ color: tc.alpha(tc.primary, 0.35) }}
                      >
                        {t(group.labelKey)}
                      </span>
                      <ChevronDown
                        className="w-3 h-3 transition-transform duration-300"
                        style={{
                          color: tc.alpha(tc.primary, 0.25),
                          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        }}
                      />
                    </button>
                    {!isCollapsed && (
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const GIcon = item.icon
                          const active = activePage === item.id
                          const mc = getThemeNavColor(item.color, tc.isCyberpunk)
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleNavClick(item.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300"
                              style={{
                                background: active ? tc.navActiveBg(mc) : 'transparent',
                                boxShadow: active ? tc.navActiveGlow(mc) : 'none',
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{
                                  background: active ? tc.alpha(mc, 0.12) : tc.alpha(mc, 0.04),
                                  border: `1px solid ${active ? tc.alpha(mc, 0.3) : tc.alpha(mc, 0.12)}`,
                                }}
                              >
                                <GIcon
                                  className="w-3.5 h-3.5"
                                  style={{ color: active ? mc : tc.alpha(mc, 0.55) }}
                                />
                              </div>
                              <span
                                className="text-[12px]"
                                style={{ color: active ? mc : tc.textSecondary }}
                              >
                                {t(item.labelKey)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {/* Divider */}
              <div className="mx-4 my-2">
                <div
                  className="h-px"
                  style={{
                    background: tc.isCyberpunk
                      ? 'linear-gradient(90deg, transparent, rgba(0,240,255,0.15), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(0,255,135,0.1), transparent)',
                  }}
                />
              </div>
              {/* Personal */}
              <div className="p-3 space-y-0.5">
                <p
                  className="text-[9px] tracking-[0.2em] mb-2 px-3 uppercase"
                  style={{ color: tc.alpha(tc.secondary, 0.4) }}
                >
                  {t('nav.personal')}
                </p>
                {sidebarPersonal.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'profile') handleNavClick('profile')
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
                        style={{
                          background: `${item.color}06`,
                          border: `1px solid ${item.color}20`,
                          boxShadow: `0 0 4px ${item.color}10`,
                        }}
                      >
                        <Icon
                          className="w-4 h-4 transition-all duration-300"
                          style={{ color: `${item.color}85` }}
                        />
                      </div>
                      <span className="text-sm text-white/40 transition-colors duration-300 hover:text-white/60">
                        {t(item.labelKey)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* === SENSOR EDGE LINE === (desktop only) */}
        {!isMobile && (
          <div
            ref={sensorZoneRef}
            className="absolute left-0 top-0 bottom-0 w-1 z-30 pointer-events-none transition-all duration-500"
            style={{
              background:
                sensorGlow > 0
                  ? `linear-gradient(180deg, transparent, ${tc.alpha(tc.primary, sensorGlow * 0.6)}, ${tc.alpha(tc.secondary, sensorGlow * 0.4)}, transparent)`
                  : 'transparent',
              boxShadow:
                sensorGlow > 0
                  ? `0 0 ${sensorGlow * 20}px ${tc.alpha(tc.primary, sensorGlow * 0.5)}, 0 0 ${sensorGlow * 40}px ${tc.alpha(tc.primary, sensorGlow * 0.2)}`
                  : 'none',
            }}
          />
        )}

        {/* === SENSING SIDEBAR === (desktop only) */}
        {!isMobile && (
          <aside
            ref={sidebarRef}
            onMouseEnter={handleSidebarEnter}
            onMouseLeave={handleSidebarLeave}
            role="complementary"
            aria-label={t('ui.sidebarNav')}
            className="shrink-0 border-r relative z-20 overflow-hidden"
            style={{
              width: isExpanded ? 256 : 68,
              transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              background: tc.sidebarBg,
              borderColor: isExpanded ? tc.sidebarBorderExpanded : tc.sidebarBorder,
              backdropFilter: theme.blurEnabled ? tc.backdropFilter : 'none',
              boxShadow: tc.isCyberpunk
                ? isExpanded
                  ? `4px 0 25px rgba(0,240,255,${(0.08 * theme.neonIntensity) / 100}), inset 0 0 30px rgba(0,240,255,0.02)`
                  : `${sensorGlow * 3}px 0 ${sensorGlow * 15}px rgba(0,240,255,${sensorGlow * 0.1})`
                : isExpanded
                  ? '4px 0 30px rgba(0,0,0,0.15), inset 0 0 30px rgba(0,255,135,0.02)'
                  : `${sensorGlow * 3}px 0 ${sensorGlow * 15}px rgba(0,255,135,${sensorGlow * 0.05})`,
            }}
          >
            {/* Sensor pulse strip */}
            <div
              className="absolute right-0 top-0 bottom-0 w-[2px] transition-all duration-500"
              style={{
                background: isExpanded
                  ? tc.isCyberpunk
                    ? 'linear-gradient(180deg, transparent, rgba(0,240,255,0.4), rgba(0,212,255,0.3), transparent)'
                    : 'linear-gradient(180deg, transparent, rgba(0,255,135,0.3), rgba(6,182,212,0.2), transparent)'
                  : sensorGlow > 0
                    ? `linear-gradient(180deg, transparent, ${tc.alpha(tc.primary, sensorGlow * 0.3)}, transparent)`
                    : 'transparent',
                boxShadow: isExpanded ? `0 0 8px ${tc.alpha(tc.primary, 0.3)}` : 'none',
              }}
            />

            <div className="h-full overflow-y-auto py-3" style={{ scrollbarWidth: 'none' }}>
              {/* Pin Toggle */}
              <div className={`flex ${isExpanded ? 'justify-end px-4' : 'justify-center'} mb-2`}>
                <button
                  onClick={() => setSidebarPinned(!sidebarPinned)}
                  className="p-1.5 rounded-lg transition-all duration-300 hover:bg-white/5 group"
                  title={sidebarPinned ? t('ui.unpinSidebar') : t('ui.pinSidebar')}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-sm border transition-all duration-300"
                    style={{
                      borderColor: sidebarPinned ? tc.primary : 'rgba(255,255,255,0.15)',
                      background: sidebarPinned ? tc.alpha(tc.primary, 0.2) : 'transparent',
                      boxShadow: sidebarPinned ? `0 0 8px ${tc.alpha(tc.primary, 0.4)}` : 'none',
                    }}
                  >
                    {sidebarPinned && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: tc.primary }}
                        />
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {/* Category Sub-pages */}
              <div className="mb-4">
                {isExpanded && (
                  <h3
                    className="text-[9px] tracking-[0.2em] mb-2 px-5 uppercase"
                    style={{
                      color: tc.alpha(tc.primary, 0.4),
                      textShadow: `0 0 5px ${tc.alpha(tc.primary, 0.3)}`,
                      animation: 'spring-in 0.3s var(--spring-easing) both',
                    }}
                  >
                    {NAV_CATEGORIES.find((c) => c.id === activeCategory)?.labelKey
                      ? t(NAV_CATEGORIES.find((c) => c.id === activeCategory)!.labelKey)
                      : ''}
                  </h3>
                )}
                <div className="space-y-0.5 px-2">
                  {(NAV_CATEGORIES.find((c) => c.id === activeCategory)?.items ?? []).map(
                    (item) => {
                      const Icon = item.icon
                      const active = activePage === item.id
                      const label = t(item.labelKey)
                      const c = getThemeNavColor(item.color, tc.isCyberpunk)
                      return (
                        <button
                          key={item.id}
                          data-nav-id={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className="w-full flex items-center rounded-xl transition-all duration-300 group relative"
                          style={{
                            padding: isExpanded ? '8px 12px' : '10px 0',
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            gap: isExpanded ? 12 : 0,
                            background: active ? tc.navActiveBg(c) : 'transparent',
                            boxShadow: active ? tc.navActiveGlow(c) : 'none',
                          }}
                          title={!isExpanded ? label : undefined}
                        >
                          <div
                            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                            style={{
                              background: active ? tc.alpha(c, 0.12) : tc.alpha(c, 0.04),
                              border: `1px solid ${active ? tc.alpha(c, 0.3) : tc.alpha(c, 0.12)}`,
                              boxShadow: active
                                ? `0 0 8px ${tc.alpha(c, 0.15)}, inset 0 0 4px ${tc.alpha(c, 0.05)}`
                                : `0 0 4px ${tc.alpha(c, 0.06)}`,
                            }}
                          >
                            <Icon
                              className="w-4 h-4 transition-all duration-300"
                              style={{ color: active ? c : tc.alpha(c, 0.6) }}
                            />
                          </div>
                          {isExpanded && (
                            <span
                              className="text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
                              style={{
                                color: active ? c : tc.textSecondary,
                                textShadow: active ? `0 0 6px ${tc.alpha(c, 0.2)}` : 'none',
                                animation: 'spring-in 0.3s var(--spring-easing) both',
                              }}
                            >
                              {label}
                            </span>
                          )}
                          {item.badge && isExpanded && (
                            <span
                              className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] text-white font-medium"
                              style={{
                                background: c,
                                boxShadow: tc.navBadgeShadow(c),
                                minWidth: 18,
                                textAlign: 'center',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                          {item.badge && !isExpanded && (
                            <div
                              className="absolute -inset-0.5 rounded-xl pointer-events-none"
                              style={{
                                border: `2px solid ${c}`,
                                boxShadow: tc.isCyberpunk
                                  ? `0 0 8px ${c}60, 0 0 16px ${c}40`
                                  : `0 0 10px ${tc.alpha(c, 0.3)}`,
                                animation: 'neon-pulse 2s ease-in-out infinite',
                              }}
                            />
                          )}
                          {active && (
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-300"
                              style={{
                                height: 24,
                                background: c,
                                boxShadow: tc.isCyberpunk
                                  ? `0 0 6px ${c}80`
                                  : `0 0 8px ${tc.alpha(c, 0.4)}`,
                              }}
                            />
                          )}
                        </button>
                      )
                    },
                  )}
                </div>
              </div>

              {/* Personal Section — migrated to header toolbar */}
              {/* Divider */}
              <div className="mx-4 mb-4">
                <div
                  className="h-px"
                  style={{
                    background: tc.isCyberpunk
                      ? 'linear-gradient(90deg, transparent, rgba(0,240,255,0.15), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(0,255,135,0.1), transparent)',
                  }}
                />
              </div>

              {/* Personal Section — migrated to header toolbar */}

              {/* System Status (only when expanded) */}
              {isExpanded && (
                <div
                  className="mx-3 rounded-2xl p-3 border"
                  style={{
                    background: tc.alpha(tc.primary, 0.03),
                    borderColor: tc.alpha(tc.primary, 0.12),
                    boxShadow: `inset 0 0 20px ${tc.alpha(tc.primary, 0.02)}`,
                    animation: 'spring-in 0.4s var(--spring-easing) 0.1s both',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: tc.statusOnline,
                        boxShadow: tc.statusOnlineGlow,
                        animation: 'neon-pulse 2s ease-in-out infinite',
                      }}
                    />
                    <span className="text-[9px] tracking-wider" style={{ color: tc.statusOnline }}>
                      {t('sidebar.systemOnline')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white/25">{t('sidebar.cpu')}</span>
                      <span style={{ color: tc.primary }}>42%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full w-[42%]"
                        style={{
                          background: `linear-gradient(90deg, ${tc.primary}, ${tc.secondary})`,
                          boxShadow: `0 0 6px ${tc.alpha(tc.primary, 0.5)}`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-white/25">{t('ui.memory')}</span>
                      <span style={{ color: tc.secondary }}>67%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full w-[67%]"
                        style={{
                          background: `linear-gradient(90deg, ${tc.secondary}, ${tc.accent})`,
                          boxShadow: `0 0 6px ${tc.alpha(tc.secondary, 0.5)}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* === MAIN CONTENT with Page Transition === */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden relative"
          role="main"
          aria-label={t('ui.mainContent')}
        >
          <PageTransition pageKey={activePage}>
            {activePage === 'dashboard' && (
              <ErrorBoundary name="Dashboard">
                <DashboardPage onOpenExport={() => setExportModalOpen(true)} />
              </ErrorBoundary>
            )}
            {activePage === 'chat' && (
              <ErrorBoundary name="Chat">
                <ChatPage />
              </ErrorBoundary>
            )}
            {activePage === 'clm' && renderLazyPage('clm')}
            {activePage === 'aicall' && renderLazyPage('aicall')}
            {activePage === 'customerCare' && renderLazyPage('customerCare')}
            {activePage === 'contacts' && renderLazyPage('contacts')}
            {activePage === 'forms' && (
              <ErrorBoundary name="Forms">
                <FormsTabPage />
              </ErrorBoundary>
            )}
            {activePage === 'smartForm' && renderLazyPage('smartForm')}
            {activePage === 'tools' && renderLazyPage('tools')}
            {activePage === 'workflow' && renderLazyPage('workflow')}
            {activePage === 'logs' && renderLazyPage('logs')}
            {activePage === 'collab' && renderLazyPage('collab')}
            {activePage === 'insights' && renderLazyPage('insights')}
            {activePage === 'quickActions' && renderLazyPage('quickActions')}
            {activePage === 'taskBoard' && renderLazyPage('taskBoard')}
            {activePage === 'devWorkspace' && renderLazyPage('devWorkspace')}
            {activePage === 'apiDocs' && (
              <ErrorBoundary name="ApiDocs">
                <ApiDocs />
              </ErrorBoundary>
            )}
            {activePage === 'finance' && renderLazyPage('finance')}
            {activePage === 'salary' && renderLazyPage('salary')}
            {activePage === 'settings' && (
              <ErrorBoundary name="Settings">
                <SettingsPage />
              </ErrorBoundary>
            )}
            {activePage === 'profile' && (
              <ErrorBoundary name="Profile">
                <ProfilePage />
              </ErrorBoundary>
            )}
            {/* Platform Integration modules */}
            {activePage === 'paramSettings' && renderLazyPage('paramSettings')}
            {activePage === 'platformSettings' && renderLazyPage('platformSettings')}
            {activePage === 'wechatConfig' && renderLazyPage('wechatConfig')}
            {activePage === 'channelCenter' && renderLazyPage('channelCenter')}
            {activePage === 'dataIntegration' && renderLazyPage('dataIntegration')}
            {/* AI Marketing modules */}
            {activePage === 'marketingPlan' && renderLazyPage('marketingPlan')}
            {activePage === 'promotionExec' && renderLazyPage('promotionExec')}
            {activePage === 'marketingAnalytics' && renderLazyPage('marketingAnalytics')}
            {activePage === 'marketingAssets' && renderLazyPage('marketingAssets')}
            {activePage === 'customerAcquisition' && renderLazyPage('customerAcquisition')}
            {activePage === 'brandMgmt' && renderLazyPage('brandMgmt')}
            {activePage === 'intelligentOps' && renderLazyPage('intelligentOps')}
            {activePage === 'platformHub' && renderLazyPage('platformHub')}
            {activePage === 'aiCreativeTools' && renderLazyPage('aiCreativeTools')}
            {activePage === 'aiMarketingEngine' && renderLazyPage('aiMarketingEngine')}
            {activePage === 'appOverview' && renderLazyPage('appOverview')}
            {activePage === 'aiDecisionSupport' && renderLazyPage('aiDecisionSupport')}
            {activePage === 'nlpProcessing' && renderLazyPage('nlpProcessing')}
            {activePage === 'procurement' && renderLazyPage('procurement')}
            {activePage === 'inventory' && renderLazyPage('inventory')}
          </PageTransition>
        </main>
      </div>

      {/* === FOOTER STATUS BAR === */}
      <footer
        role="contentinfo"
        aria-label={t('footer.ariaLabel')}
        className="relative z-50 h-9 sm:h-10 flex items-center justify-between px-3 sm:px-6"
        style={{
          background: tc.footerBg,
          borderTop: tc.isCyberpunk
            ? `2px solid ${tc.footerBorder}`
            : `1px solid ${tc.footerBorder}`,
          boxShadow: tc.isCyberpunk
            ? `0 0 ${(10 * theme.neonIntensity) / 100}px rgba(0,240,255,${(0.3 * theme.neonIntensity) / 100}), 0 0 ${(20 * theme.neonIntensity) / 100}px rgba(0,240,255,${(0.1 * theme.neonIntensity) / 100})`
            : `0 -2px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.03)`,
          backdropFilter: theme.blurEnabled ? tc.backdropFilter : 'none',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: tc.statusOnline,
                boxShadow: tc.statusOnlineGlow,
                animation: 'neon-pulse 2s ease-in-out infinite',
              }}
            />
            <span
              className="text-[9px] sm:text-[10px] tracking-wider"
              style={{ color: tc.statusOnline }}
            >
              {t('footer.online')}
            </span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5">
            <Wifi className="w-3 h-3" style={{ color: tc.alpha(tc.primary, 0.5) }} />
            <span className="text-[10px] text-white/30">12ms</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-1.5">
            <Shield className="w-3 h-3" style={{ color: tc.alpha(tc.success, 0.5) }} />
            <span className="text-[10px] text-white/30">{t('footer.secure')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5">
            <Cpu className="w-3 h-3" style={{ color: tc.alpha(tc.secondary, 0.5) }} />
            <span className="text-[10px] text-white/30">{t('footer.gpu')}</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <span className="text-[9px] sm:text-[10px] text-white/20 tracking-wider">
            YYC³ {t('brand.version')}{' '}
            <span className="hidden md:inline">| {t('brand.tagline')}</span>
          </span>
        </div>
      </footer>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette open={cmdPalette.open} onClose={cmdPalette.onClose} />

      {/* Notification Drawer */}
      <NotificationDrawer open={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)} />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial />

      {/* Data Export Modal (Ctrl+E) */}
      <DataExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />

      {/* AI Model Settings Modal */}
      <ModelSettings />

      {/* 多端适配：移动端底部导航栏 */}
      <MobileBottomNav />
    </div>
  )
}

// === Inline Page Components ===
