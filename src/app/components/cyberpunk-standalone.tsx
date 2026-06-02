import {
  Award,
  BarChart3,
  Bell,
  Bot,
  Brain,
  ChevronDown,
  ClipboardList,
  Code,
  Cpu,
  Database,
  GitBranch,
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

import { ActivityLogPage } from './activity-log'
import { useAIModel } from './ai-model-context'
import { AIToolsPage } from './ai-tools-page'
import { type PageId, useApp, useRealtimeSimulation } from './app-context'
import { AppOverviewPage } from './app-overview-page'
import { BrandManagementPage } from './brand-management-page'
import { CampaignExecutionPage } from './campaign-execution-page'
import { ChannelCenterPage } from './channel-center-page'
import { ChatInterface } from './chat-interface'
import { CollabCreationPage } from './collab-creation-page'
import { CommandPalette, useCommandPalette } from './command-palette'
import { CustomerAcquisitionPage } from './customer-acquisition-page'
import { CustomerCarePage } from './customer-care-page'
import { DashboardPage } from './dashboard-page'
import { DataExportModal } from './data-export-modal'
import { DataIntegrationPage } from './data-integration-page'
import { DecisionSupportPage } from './decision-support-page'
import { ErrorBoundary } from './error-boundary'
import { FinancePage } from './finance-page'
import { FormHistory } from './form-history'
import { FormTemplateBuilder } from './form-template-builder'
import { GlitchText } from './glitch-text'
import { getThemeNavColor, useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { InsightsEnhancedPage } from './insights-enhanced'
import { LeftPanelPage } from './left-panel-page'
import { MarketingAnalyticsPage } from './marketing-analytics-page'
import { MarketingAssetsPage } from './marketing-assets-page'
import { MarketingStrategyPage } from './marketing-strategy-page'
import { ModelSettings } from './model-settings'
import { findCategoryByPageId, NAV_CATEGORIES } from './nav-config'
import { NeonCard } from './neon-card'
import { NLPProcessingPage } from './nlp-processing-page'
import { NotificationDrawer } from './notification-drawer'
import { NumberDatabasePage } from './number-database'
import { OnboardingTutorial } from './onboarding-tutorial'
import { PageTransition } from './page-transition'
import { ParameterSettingsPage } from './parameter-settings-page'
import { ParticleCanvas } from './particle-canvas'
import { PlatformIntegrationPage } from './platform-integration-page'
import { PlatformSettingsPage } from './platform-settings-page'
import { ProfilePage } from './profile-page'
import { QuickActionsPage } from './quick-actions-page'
import { SalaryPage } from './salary-page'
import { SettingsPage } from './settings-page-standalone'
import { SmartCreationPage } from './smart-creation-page'
import { SmartFormPage } from './smart-form-system'
import { SmartMarketingEnginePage } from './smart-marketing-engine-page'
import { SmartOperationsPage } from './smart-operations-page'
import { TaskBoardPage } from './task-board-page'
import { ThemeSwitcherButtonCompact } from './theme-switcher-button'
import { WechatConfigPage } from './wechat-config-page'

const NAV_LABEL_KEYS: Record<string, string> = {
  dashboard: 'nav.dashboard',
  chat: 'nav.chat',
  clm: 'nav.clm',
  aicall: 'nav.aicall',
  tools: 'nav.tools',
  workflow: 'nav.workflow',
  logs: 'nav.logs',
  insights: 'nav.insights',
  settings: 'nav.settings',
  forms: 'nav.forms',
  contacts: 'nav.contacts',
  customerCare: 'nav.customerCare',
  collab: 'nav.collab',
  // Platform Integration
  paramSettings: 'nav.paramSettings',
  platformSettings: 'nav.platformSettings',
  wechatConfig: 'nav.wechatConfig',
  channelCenter: 'nav.channelCenter',
  dataIntegration: 'nav.dataIntegration',
  // AI Marketing
  marketingPlan: 'nav.marketingPlan',
  promotionExec: 'nav.promotionExec',
  marketingAnalytics: 'nav.marketingAnalytics',
  marketingAssets: 'nav.marketingAssets',
  customerAcquisition: 'nav.customerAcquisition',
  brandMgmt: 'nav.brandMgmt',
  intelligentOps: 'nav.intelligentOps',
  platformHub: 'nav.platformHub',
  aiCreativeTools: 'nav.aiCreativeTools',
  aiMarketingEngine: 'nav.aiMarketingEngine',
  appOverview: 'nav.appOverview',
  aiDecisionSupport: 'nav.aiDecisionSupport',
  nlpProcessing: 'nav.nlpProcessing',
  quickActions: 'nav.quickActions',
  taskBoard: 'nav.taskBoard',
  devWorkspace: 'nav.devWorkspace',
  finance: 'nav.finance',
  salary: 'nav.salary',
}

const SIDEBAR_PERSONAL_KEYS: Record<string, string> = {
  history: 'nav.history',
  favorites: 'nav.favorites',
  profile: 'nav.profile',
}

// --- Nav item type ---
interface NavItem {
  id: PageId
  label: string
  icon: typeof LayoutDashboard
  color: string
  badge?: number
}
interface NavGroup {
  groupKey: string
  labelKey: string
  items: NavItem[]
}

// Core features (flat — always visible)
const coreNavItems: NavItem[] = [
  { id: 'dashboard', label: '数据驾驶舱', icon: LayoutDashboard, color: '#00f0ff' },
  { id: 'chat', label: 'AI 聊天', icon: MessageCircle, color: '#00f0ff' },
  { id: 'clm', label: '客户生命周期', icon: Users, color: '#00d4ff', badge: 5 },
  { id: 'aicall', label: 'AI 智能呼叫', icon: Phone, color: '#00ffcc', badge: 3 },
  { id: 'customerCare', label: '客户关怀中心', icon: Heart, color: '#00d4ff', badge: 8 },
  { id: 'contacts', label: '号码库', icon: Database, color: '#00ffc8', badge: 10 },
  { id: 'forms', label: '智能表单', icon: ClipboardList, color: '#41ffdd' },
  { id: 'tools', label: 'AI 工具', icon: Wrench, color: '#00ffc8' },
  { id: 'workflow', label: '工作流', icon: GitBranch, color: '#41ffdd' },
  { id: 'logs', label: '操作日志', icon: ScrollText, color: '#00ffc8' },
  { id: 'collab', label: '协同创作', icon: Layers, color: '#00ffcc' },
  { id: 'insights', label: '数据洞察', icon: BarChart3, color: '#00f0ff' },
  { id: 'quickActions', label: '一键操作', icon: Zap, color: '#f97316' },
  { id: 'taskBoard', label: '任务看板', icon: Target, color: '#22c55e' },
  { id: 'devWorkspace', label: '开发工作台', icon: Code, color: '#3b82f6' },
]

// Collapsible nav groups
const navGroups: NavGroup[] = [
  {
    groupKey: 'platformIntegration',
    labelKey: 'nav.group.platformIntegration',
    items: [
      { id: 'paramSettings', label: '参数设置', icon: Settings, color: '#8b5cf6' },
      { id: 'platformSettings', label: '平台设置', icon: Server, color: '#3b82f6' },
      { id: 'wechatConfig', label: '微信配置', icon: MessageSquare, color: '#22c55e' },
      { id: 'channelCenter', label: '渠道中心', icon: Radio, color: '#f97316' },
      { id: 'dataIntegration', label: '数据集成', icon: Database, color: '#06b6d4' },
    ],
  },
  {
    groupKey: 'aiMarketing',
    labelKey: 'nav.group.aiMarketing',
    items: [
      { id: 'appOverview', label: '应用总览看板', icon: LayoutDashboard, color: '#00f0ff' },
      { id: 'marketingPlan', label: '营销方案策划', icon: Megaphone, color: '#8b5cf6' },
      { id: 'promotionExec', label: '推广活动执行', icon: PlayCircle, color: '#22c55e' },
      { id: 'marketingAnalytics', label: '营销效果分析', icon: BarChart3, color: '#3b82f6' },
      { id: 'marketingAssets', label: '营销素材管理', icon: Image, color: '#ec4899' },
      { id: 'customerAcquisition', label: '客户获取系统', icon: UserPlus, color: '#22c55e' },
      { id: 'brandMgmt', label: '品牌管理平台', icon: Award, color: '#eab308' },
      { id: 'aiCreativeTools', label: '智能创作工具', icon: PenTool, color: '#8b5cf6' },
      { id: 'aiMarketingEngine', label: '智能营销引擎', icon: Rocket, color: '#f97316' },
      { id: 'aiDecisionSupport', label: '智能决策支持', icon: Brain, color: '#a855f7' },
      { id: 'nlpProcessing', label: '自然语言处理', icon: Languages, color: '#14b8a6' },
      { id: 'platformHub', label: '平台对接中心', icon: Link, color: '#06b6d4' },
      { id: 'intelligentOps', label: '智能运维系统', icon: Wrench, color: '#ef4444' },
    ],
  },
]

// Flat list of all nav items for top bar (core only) and lookups
const navItems = coreNavItems

const sidebarPersonal = [
  { id: 'history', label: '历史记录', icon: History, color: '#00f0ff' },
  { id: 'favorites', label: '收藏夹', icon: Star, color: '#00ffcc' },
  { id: 'profile', label: '个人资料', icon: UserCircle, color: '#00d4ff' },
]

/**
 * Full-screen standalone cyberpunk terminal layout.
 * Renders the complete application shell: top header bar, proximity-sensing
 * sidebar navigation, page content area with transitions, and status footer.
 * Integrates realtime simulation, keyboard shortcuts, and responsive mobile drawer.
 *
 * @param onSwitchMode - Callback to switch to widget (floating panel) mode.
 */
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
  const { t } = useI18n()
  const { openModelSettings } = useAIModel()
  const tc = useThemeColors()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
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
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: tc.gradientPrimary,
                boxShadow: tc.isCyberpunk
                  ? '0 0 15px rgba(0,240,255,0.5), 0 0 30px rgba(0,212,255,0.3)'
                  : '0 0 15px rgba(0,255,135,0.4), 0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {tc.isCyberpunk ? (
                  <GlitchText
                    color="rgba(255,255,255,0.9)"
                    className="tracking-wider"
                    style={{ textShadow: '0 0 10px rgba(0,240,255,0.5)' }}
                    interval={[4000, 10000]}
                    intensity={1.2}
                  >
                    YYC³
                  </GlitchText>
                ) : (
                  <span
                    className="tracking-wider"
                    style={{
                      color: 'rgba(255,255,255,0.95)',
                      textShadow: '0 0 10px rgba(0,255,135,0.3)',
                    }}
                  >
                    YYC³
                  </span>
                )}
                {tc.isCyberpunk ? (
                  <GlitchText
                    color="#00d4ff"
                    className="text-[10px] px-1.5 py-0.5 rounded border"
                    style={{
                      borderColor: 'rgba(0,212,255,0.3)',
                      background: 'rgba(0,212,255,0.08)',
                      textShadow: '0 0 8px rgba(0,212,255,0.5)',
                    }}
                    interval={[5000, 12000]}
                    intensity={0.8}
                  >
                    {t('brand.subtitle')}
                  </GlitchText>
                ) : (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      border: `1px solid rgba(0,255,135,0.2)`,
                      background: 'rgba(0,255,135,0.08)',
                      color: '#00ff87',
                    }}
                  >
                    {t('brand.subtitle')}
                  </span>
                )}
              </div>
              <span
                className="text-[9px] hidden sm:block -mt-0.5 tracking-[0.15em]"
                style={{ color: tc.isCyberpunk ? 'rgba(0,240,255,0.4)' : 'rgba(0,255,135,0.4)' }}
              >
                {t('brand.system')}
              </span>
            </div>
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
                title={
                  SIDEBAR_PERSONAL_KEYS[item.id] ? t(SIDEBAR_PERSONAL_KEYS[item.id]) : item.label
                }
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
                        {NAV_LABEL_KEYS[item.id] ? t(NAV_LABEL_KEYS[item.id]) : item.label}
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
                                {NAV_LABEL_KEYS[item.id] ? t(NAV_LABEL_KEYS[item.id]) : item.label}
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
                        {SIDEBAR_PERSONAL_KEYS[item.id]
                          ? t(SIDEBAR_PERSONAL_KEYS[item.id])
                          : item.label}
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
          className="flex-1 overflow-hidden relative"
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
            {activePage === 'clm' && (
              <ErrorBoundary name="Clm">
                <CLMPage />
              </ErrorBoundary>
            )}
            {activePage === 'aicall' && (
              <ErrorBoundary name="Aicall">
                <AICallPage />
              </ErrorBoundary>
            )}
            {activePage === 'customerCare' && (
              <ErrorBoundary name="CustomerCare">
                <CustomerCarePage />
              </ErrorBoundary>
            )}
            {activePage === 'contacts' && (
              <ErrorBoundary name="Contacts">
                <NumberDatabasePage />
              </ErrorBoundary>
            )}
            {activePage === 'forms' && (
              <ErrorBoundary name="Forms">
                <FormsTabPage />
              </ErrorBoundary>
            )}
            {activePage === 'tools' && (
              <ErrorBoundary name="Tools">
                <AIToolsPage />
              </ErrorBoundary>
            )}
            {activePage === 'workflow' && (
              <ErrorBoundary name="Workflow">
                <WorkflowPage />
              </ErrorBoundary>
            )}
            {activePage === 'logs' && (
              <ErrorBoundary name="Logs">
                <ActivityLogPage />
              </ErrorBoundary>
            )}
            {activePage === 'collab' && (
              <ErrorBoundary name="Collab">
                <CollabCreationPage />
              </ErrorBoundary>
            )}
            {activePage === 'insights' && (
              <ErrorBoundary name="Insights">
                <InsightsEnhancedPage />
              </ErrorBoundary>
            )}
            {activePage === 'quickActions' && (
              <ErrorBoundary name="QuickActions">
                <QuickActionsPage />
              </ErrorBoundary>
            )}
            {activePage === 'taskBoard' && (
              <ErrorBoundary name="TaskBoard">
                <TaskBoardPage />
              </ErrorBoundary>
            )}
            {activePage === 'devWorkspace' && (
              <ErrorBoundary name="DevWorkspace">
                <LeftPanelPage />
              </ErrorBoundary>
            )}
            {activePage === 'finance' && (
              <ErrorBoundary name="Finance">
                <FinancePage />
              </ErrorBoundary>
            )}
            {activePage === 'salary' && (
              <ErrorBoundary name="Salary">
                <SalaryPage />
              </ErrorBoundary>
            )}
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
            {activePage === 'paramSettings' && (
              <ErrorBoundary name="ParamSettings">
                <ParameterSettingsPage />
              </ErrorBoundary>
            )}
            {activePage === 'platformSettings' && (
              <ErrorBoundary name="PlatformSettings">
                <PlatformSettingsPage />
              </ErrorBoundary>
            )}
            {activePage === 'wechatConfig' && (
              <ErrorBoundary name="WechatConfig">
                <WechatConfigPage />
              </ErrorBoundary>
            )}
            {activePage === 'channelCenter' && (
              <ErrorBoundary name="ChannelCenter">
                <ChannelCenterPage />
              </ErrorBoundary>
            )}
            {activePage === 'dataIntegration' && (
              <ErrorBoundary name="DataIntegration">
                <DataIntegrationPage />
              </ErrorBoundary>
            )}
            {/* AI Marketing modules */}
            {activePage === 'marketingPlan' && (
              <ErrorBoundary name="MarketingPlan">
                <MarketingStrategyPage />
              </ErrorBoundary>
            )}
            {activePage === 'promotionExec' && (
              <ErrorBoundary name="PromotionExec">
                <CampaignExecutionPage />
              </ErrorBoundary>
            )}
            {activePage === 'marketingAnalytics' && (
              <ErrorBoundary name="MarketingAnalytics">
                <MarketingAnalyticsPage />
              </ErrorBoundary>
            )}
            {activePage === 'marketingAssets' && (
              <ErrorBoundary name="MarketingAssets">
                <MarketingAssetsPage />
              </ErrorBoundary>
            )}
            {activePage === 'customerAcquisition' && (
              <ErrorBoundary name="CustomerAcquisition">
                <CustomerAcquisitionPage />
              </ErrorBoundary>
            )}
            {activePage === 'brandMgmt' && (
              <ErrorBoundary name="BrandMgmt">
                <BrandManagementPage />
              </ErrorBoundary>
            )}
            {activePage === 'intelligentOps' && (
              <ErrorBoundary name="IntelligentOps">
                <SmartOperationsPage />
              </ErrorBoundary>
            )}
            {activePage === 'platformHub' && (
              <ErrorBoundary name="PlatformHub">
                <PlatformIntegrationPage />
              </ErrorBoundary>
            )}
            {activePage === 'aiCreativeTools' && (
              <ErrorBoundary name="AiCreativeTools">
                <SmartCreationPage />
              </ErrorBoundary>
            )}
            {activePage === 'aiMarketingEngine' && (
              <ErrorBoundary name="AiMarketingEngine">
                <SmartMarketingEnginePage />
              </ErrorBoundary>
            )}
            {activePage === 'appOverview' && (
              <ErrorBoundary name="AppOverview">
                <AppOverviewPage />
              </ErrorBoundary>
            )}
            {activePage === 'aiDecisionSupport' && (
              <ErrorBoundary name="AiDecisionSupport">
                <DecisionSupportPage />
              </ErrorBoundary>
            )}
            {activePage === 'nlpProcessing' && (
              <ErrorBoundary name="NlpProcessing">
                <NLPProcessingPage />
              </ErrorBoundary>
            )}
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
    </div>
  )
}

// === Inline Page Components ===

function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <ChatInterface />
    </div>
  )
}

function CLMPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<'pipeline' | 'segments' | 'touchpoints' | 'health'>(
    'pipeline',
  )
  const tc = useThemeColors()
  const tabs = [
    { id: 'pipeline' as const, label: t('clm.pipeline') },
    { id: 'segments' as const, label: t('clm.segments') },
    { id: 'touchpoints' as const, label: t('clm.touchpoints') },
    { id: 'health' as const, label: t('clm.health') },
  ]
  const stages = [
    { name: t('clm.stage1'), count: 245, pct: 82, color: '#06b6d4' },
    { name: t('clm.stage2'), count: 183, pct: 61, color: '#8b5cf6' },
    { name: t('clm.stage3'), count: 156, pct: 52, color: '#10b981' },
    { name: t('clm.stage4'), count: 128, pct: 43, color: '#f59e0b' },
    { name: t('clm.stage5'), count: 98, pct: 33, color: '#ef4444' },
  ]
  return (
    <div className="p-6 space-y-6" data-neon-card>
      <h2 className="text-xl font-bold" style={{ color: tc.primary }}>
        {t('clm.title')}
      </h2>
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? tc.alpha(tc.primary, 0.15) : 'transparent',
              color: activeTab === tab.id ? tc.primary : tc.muted,
              border: `1px solid ${activeTab === tab.id ? tc.primary : 'transparent'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {stages.map((s, i) => (
          <NeonCard key={i}>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: tc.primary }}>
                {s.name}
              </span>
              <span className="text-sm" style={{ color: tc.muted }}>
                {s.count} {t('clm.customers')}
              </span>
            </div>
            <div
              className="mt-2 h-2 rounded-full overflow-hidden"
              style={{ background: tc.alpha(tc.primary, 0.1) }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
          </NeonCard>
        ))}
      </div>
    </div>
  )
}

function AICallPage() {
  const { t } = useI18n()
  const tc = useThemeColors()
  return (
    <div className="p-6 space-y-6" data-neon-card>
      <h2 className="text-xl font-bold" style={{ color: tc.primary }}>
        {t('aicall.title')}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <NeonCard>
          <div className="text-sm" style={{ color: tc.muted }}>
            {t('aicall.totalCalls')}
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: tc.primary }}>
            1,284
          </div>
        </NeonCard>
        <NeonCard>
          <div className="text-sm" style={{ color: tc.muted }}>
            {t('aicall.successRate')}
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: '#10b981' }}>
            87.3%
          </div>
        </NeonCard>
        <NeonCard>
          <div className="text-sm" style={{ color: tc.muted }}>
            {t('aicall.avgDuration')}
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>
            3:42
          </div>
        </NeonCard>
        <NeonCard>
          <div className="text-sm" style={{ color: tc.muted }}>
            {t('aicall.activeAgents')}
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: '#8b5cf6' }}>
            12
          </div>
        </NeonCard>
      </div>
    </div>
  )
}

function WorkflowPage() {
  const { t } = useI18n()
  const tc = useThemeColors()
  return (
    <div className="p-6 space-y-6" data-neon-card>
      <h2 className="text-xl font-bold" style={{ color: tc.primary }}>
        {t('workflow.title')}
      </h2>
      <div className="space-y-3">
        {[
          { name: t('workflow.wf1'), status: t('status.active'), color: '#10b981' },
          { name: t('workflow.wf2'), status: t('status.paused'), color: '#f59e0b' },
          { name: t('workflow.wf3'), status: t('status.draft'), color: tc.muted },
        ].map((wf, i) => (
          <NeonCard key={i}>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: tc.primary }}>
                {wf.name}
              </span>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: wf.color + '20', color: wf.color }}
              >
                {wf.status}
              </span>
            </div>
          </NeonCard>
        ))}
      </div>
    </div>
  )
}

function FormsTabPage() {
  const [formTab, setFormTab] = useState<'builder' | 'history' | 'smart'>('builder')
  const { t } = useI18n()
  const tc = useThemeColors()
  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 px-6 pt-4">
        {(['builder', 'history', 'smart'] as const).map((id) => (
          <button
            key={id}
            onClick={() => setFormTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: formTab === id ? tc.alpha(tc.primary, 0.15) : 'transparent',
              color: formTab === id ? tc.primary : tc.muted,
              border: `1px solid ${formTab === id ? tc.primary : 'transparent'}`,
            }}
          >
            {t(`forms.tab.${id}`)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {formTab === 'builder' && <FormTemplateBuilder />}
        {formTab === 'history' && <FormHistory />}
        {formTab === 'smart' && <SmartFormPage />}
      </div>
    </div>
  )
}
