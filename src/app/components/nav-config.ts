import {
  BarChart3,
  Brain,
  ClipboardList,
  Code,
  Database,
  GitBranch,
  Headphones,
  Heart,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  Phone,
  ScrollText,
  Settings,
  Target,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'

import type { PageId } from './app-context'

export interface NavCategory {
  id: string
  labelKey: string
  icon: LucideIcon
  color: string
}

export interface NavSubItem {
  id: PageId
  labelKey: string
  icon: LucideIcon
  color: string
  badge?: number
}

export interface NavCategoryDef extends NavCategory {
  items: NavSubItem[]
}

export const NAV_CATEGORIES: NavCategoryDef[] = [
  {
    id: 'overview',
    labelKey: 'nav.cat.overview',
    icon: LayoutDashboard,
    color: '#00f0ff',
    items: [
      { id: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, color: '#00f0ff' },
      { id: 'logs', labelKey: 'nav.logs', icon: ScrollText, color: '#00ffc8' },
      { id: 'insights', labelKey: 'nav.insights', icon: BarChart3, color: '#00f0ff' },
    ],
  },
  {
    id: 'conversation',
    labelKey: 'nav.cat.conversation',
    icon: MessageCircle,
    color: '#00f0ff',
    items: [{ id: 'chat', labelKey: 'nav.chat', icon: MessageCircle, color: '#00f0ff' }],
  },
  {
    id: 'customer',
    labelKey: 'nav.cat.customer',
    icon: Users,
    color: '#00d4ff',
    items: [
      { id: 'clm', labelKey: 'nav.clm', icon: Users, color: '#00d4ff', badge: 5 },
      { id: 'customerCare', labelKey: 'nav.customerCare', icon: Heart, color: '#00d4ff', badge: 8 },
      { id: 'contacts', labelKey: 'nav.contacts', icon: Database, color: '#00ffc8', badge: 10 },
      {
        id: 'customerAcquisition',
        labelKey: 'nav.customerAcquisition',
        icon: Target,
        color: '#22c55e',
      },
      { id: 'brandMgmt', labelKey: 'nav.brandMgmt', icon: Layers, color: '#eab308' },
    ],
  },
  {
    id: 'toolkit',
    labelKey: 'nav.cat.toolkit',
    icon: Wrench,
    color: '#00ffc8',
    items: [
      { id: 'aicall', labelKey: 'nav.aicall', icon: Phone, color: '#00ffcc', badge: 3 },
      { id: 'tools', labelKey: 'nav.tools', icon: Wrench, color: '#00ffc8' },
      { id: 'workflow', labelKey: 'nav.workflow', icon: GitBranch, color: '#41ffdd' },
      { id: 'forms', labelKey: 'nav.forms', icon: ClipboardList, color: '#41ffdd' },
      { id: 'collab', labelKey: 'nav.collab', icon: Layers, color: '#00ffcc' },
      { id: 'quickActions', labelKey: 'nav.quickActions', icon: Zap, color: '#f97316' },
      { id: 'taskBoard', labelKey: 'nav.taskBoard', icon: Target, color: '#22c55e' },
      { id: 'devWorkspace', labelKey: 'nav.devWorkspace', icon: Code, color: '#3b82f6' },
    ],
  },
  {
    id: 'platform',
    labelKey: 'nav.cat.platform',
    icon: Settings,
    color: '#8b5cf6',
    items: [
      { id: 'paramSettings', labelKey: 'nav.paramSettings', icon: Settings, color: '#8b5cf6' },
      {
        id: 'platformSettings',
        labelKey: 'nav.platformSettings',
        icon: Headphones,
        color: '#3b82f6',
      },
      { id: 'wechatConfig', labelKey: 'nav.wechatConfig', icon: MessageCircle, color: '#22c55e' },
      { id: 'channelCenter', labelKey: 'nav.channelCenter', icon: Megaphone, color: '#f97316' },
      { id: 'dataIntegration', labelKey: 'nav.dataIntegration', icon: Database, color: '#06b6d4' },
      { id: 'platformHub', labelKey: 'nav.platformHub', icon: Layers, color: '#06b6d4' },
      { id: 'intelligentOps', labelKey: 'nav.intelligentOps', icon: Wrench, color: '#ef4444' },
    ],
  },
  {
    id: 'marketing',
    labelKey: 'nav.cat.marketing',
    icon: Megaphone,
    color: '#f97316',
    items: [
      { id: 'appOverview', labelKey: 'nav.appOverview', icon: LayoutDashboard, color: '#00f0ff' },
      { id: 'marketingPlan', labelKey: 'nav.marketingPlan', icon: Megaphone, color: '#8b5cf6' },
      { id: 'promotionExec', labelKey: 'nav.promotionExec', icon: Zap, color: '#22c55e' },
      {
        id: 'marketingAnalytics',
        labelKey: 'nav.marketingAnalytics',
        icon: BarChart3,
        color: '#3b82f6',
      },
      { id: 'marketingAssets', labelKey: 'nav.marketingAssets', icon: Layers, color: '#ec4899' },
      { id: 'aiCreativeTools', labelKey: 'nav.aiCreativeTools', icon: Brain, color: '#8b5cf6' },
      { id: 'aiMarketingEngine', labelKey: 'nav.aiMarketingEngine', icon: Zap, color: '#f97316' },
      { id: 'aiDecisionSupport', labelKey: 'nav.aiDecisionSupport', icon: Brain, color: '#a855f7' },
      { id: 'nlpProcessing', labelKey: 'nav.nlpProcessing', icon: Brain, color: '#14b8a6' },
    ],
  },
]

export function findCategoryByPageId(pageId: PageId): NavCategoryDef | undefined {
  return NAV_CATEGORIES.find((cat) => cat.items.some((item) => item.id === pageId))
}

export function getCategoryItems(categoryId: string): NavSubItem[] {
  return NAV_CATEGORIES.find((cat) => cat.id === categoryId)?.items ?? []
}

export function findNavItem(pageId: PageId): NavSubItem | undefined {
  for (const cat of NAV_CATEGORIES) {
    const found = cat.items.find((item) => item.id === pageId)
    if (found) return found
  }
  return undefined
}
