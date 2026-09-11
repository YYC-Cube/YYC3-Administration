/**
 * @file cyberpunk-nav.ts
 * @description 应用壳导航配置:核心项、折叠分组与个人区(P2-③ 拆分;
 *   与 nav-config.ts 的分类表互补——本文件服务侧边栏渲染)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags nav,shell,config
 */

import {
  Award,
  BarChart3,
  Brain,
  ClipboardList,
  Code,
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
  MessageCircle,
  MessageSquare,
  PenTool,
  Phone,
  PlayCircle,
  Radio,
  Rocket,
  ScrollText,
  Server,
  Settings,
  Star,
  Target,
  UserCircle,
  UserPlus,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'

import type { PageId } from '@/app/components/app-context'

interface NavItem {
  id: PageId
  labelKey: string
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
export const coreNavItems: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, color: '#00f0ff' },
  { id: 'chat', labelKey: 'nav.chat', icon: MessageCircle, color: '#00f0ff' },
  { id: 'clm', labelKey: 'nav.clm', icon: Users, color: '#00d4ff', badge: 5 },
  { id: 'aicall', labelKey: 'nav.aicall', icon: Phone, color: '#00ffcc', badge: 3 },
  { id: 'customerCare', labelKey: 'nav.customerCare', icon: Heart, color: '#00d4ff', badge: 8 },
  { id: 'contacts', labelKey: 'nav.contacts', icon: Database, color: '#00ffc8', badge: 10 },
  { id: 'forms', labelKey: 'nav.forms', icon: ClipboardList, color: '#41ffdd' },
  { id: 'tools', labelKey: 'nav.tools', icon: Wrench, color: '#00ffc8' },
  { id: 'workflow', labelKey: 'nav.workflow', icon: GitBranch, color: '#41ffdd' },
  { id: 'logs', labelKey: 'nav.logs', icon: ScrollText, color: '#00ffc8' },
  { id: 'collab', labelKey: 'nav.collab', icon: Layers, color: '#00ffcc' },
  { id: 'insights', labelKey: 'nav.insights', icon: BarChart3, color: '#00f0ff' },
  { id: 'quickActions', labelKey: 'nav.quickActions', icon: Zap, color: '#f97316' },
  { id: 'taskBoard', labelKey: 'nav.taskBoard', icon: Target, color: '#22c55e' },
  { id: 'devWorkspace', labelKey: 'nav.devWorkspace', icon: Code, color: '#3b82f6' },
]

// Collapsible nav groups
export const navGroups: NavGroup[] = [
  {
    groupKey: 'platformIntegration',
    labelKey: 'nav.group.platformIntegration',
    items: [
      { id: 'paramSettings', labelKey: 'nav.paramSettings', icon: Settings, color: '#8b5cf6' },
      { id: 'platformSettings', labelKey: 'nav.platformSettings', icon: Server, color: '#3b82f6' },
      { id: 'wechatConfig', labelKey: 'nav.wechatConfig', icon: MessageSquare, color: '#22c55e' },
      { id: 'channelCenter', labelKey: 'nav.channelCenter', icon: Radio, color: '#f97316' },
      { id: 'dataIntegration', labelKey: 'nav.dataIntegration', icon: Database, color: '#06b6d4' },
    ],
  },
  {
    groupKey: 'aiMarketing',
    labelKey: 'nav.group.aiMarketing',
    items: [
      { id: 'appOverview', labelKey: 'nav.appOverview', icon: LayoutDashboard, color: '#00f0ff' },
      { id: 'marketingPlan', labelKey: 'nav.marketingPlan', icon: Megaphone, color: '#8b5cf6' },
      { id: 'promotionExec', labelKey: 'nav.promotionExec', icon: PlayCircle, color: '#22c55e' },
      {
        id: 'marketingAnalytics',
        labelKey: 'nav.marketingAnalytics',
        icon: BarChart3,
        color: '#3b82f6',
      },
      { id: 'marketingAssets', labelKey: 'nav.marketingAssets', icon: Image, color: '#ec4899' },
      {
        id: 'customerAcquisition',
        labelKey: 'nav.customerAcquisition',
        icon: UserPlus,
        color: '#22c55e',
      },
      { id: 'brandMgmt', labelKey: 'nav.brandMgmt', icon: Award, color: '#eab308' },
      { id: 'aiCreativeTools', labelKey: 'nav.aiCreativeTools', icon: PenTool, color: '#8b5cf6' },
      {
        id: 'aiMarketingEngine',
        labelKey: 'nav.aiMarketingEngine',
        icon: Rocket,
        color: '#f97316',
      },
      { id: 'aiDecisionSupport', labelKey: 'nav.aiDecisionSupport', icon: Brain, color: '#a855f7' },
      { id: 'nlpProcessing', labelKey: 'nav.nlpProcessing', icon: Languages, color: '#14b8a6' },
      { id: 'platformHub', labelKey: 'nav.platformHub', icon: Link, color: '#06b6d4' },
      { id: 'intelligentOps', labelKey: 'nav.intelligentOps', icon: Wrench, color: '#ef4444' },
    ],
  },
]

// Flat list of all nav items for top bar (core only) and lookups
export const navItems = coreNavItems

export const sidebarPersonal = [
  { id: 'history', labelKey: 'nav.history', icon: History, color: '#00f0ff' },
  { id: 'favorites', labelKey: 'nav.favorites', icon: Star, color: '#00ffcc' },
  { id: 'profile', labelKey: 'nav.profile', icon: UserCircle, color: '#00d4ff' },
]

/**
 * Full-screen standalone cyberpunk terminal layout.
 * Renders the complete application shell: top header bar, proximity-sensing
 * sidebar navigation, page content area with transitions, and status footer.
 * Integrates realtime simulation, keyboard shortcuts, and responsive mobile drawer.
 *
 * @param onSwitchMode - Callback to switch to widget (floating panel) mode.
 */

export type { NavItem, NavGroup }
