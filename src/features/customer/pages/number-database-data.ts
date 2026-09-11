/**
 * @file number-database-data.ts
 * @description 客户号牌库数据层:标签页定义、阶段/标签元信息、图表种子数据
 *   与全量标签(P2-③ 巨石拆分)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,data,charts
 */

import {
  BarChart3,
  BookOpen,
  Crown,
  Gauge,
  Handshake,
  HeartHandshake,
  Layers,
  Megaphone,
  Radio,
  Target,
  Users,
} from 'lucide-react'

import type { SharedContact } from '@/features/customer/pages/contacts-context'
import type { ReactNode } from 'react'

export type TabId =
  | 'overview'
  | 'contacts'
  | 'analytics'
  | 'collaboration'
  | 'value'
  | 'service'
  | 'knowledge'
  | 'monitor'

export const TABS: {
  id: TabId
  icon: (props: { className?: string }) => ReactNode
  color: string
}[] = [
  { id: 'overview', icon: Gauge, color: '#00f0ff' },
  { id: 'contacts', icon: Users, color: '#00d4ff' },
  { id: 'analytics', icon: BarChart3, color: '#00ffcc' },
  { id: 'collaboration', icon: Layers, color: '#00ffc8' },
  { id: 'value', icon: Crown, color: '#008b9d' },
  { id: 'service', icon: HeartHandshake, color: '#00f0ff' },
  { id: 'knowledge', icon: BookOpen, color: '#00d4ff' },
  { id: 'monitor', icon: Radio, color: '#005f73' },
]

// ---- Contact type alias from shared context ----
export type Contact = SharedContact

export const STAGE_META: Record<
  string,
  { icon: (props: { className?: string }) => ReactNode; color: string }
> = {
  acquisition: { icon: Megaphone, color: '#00f0ff' },
  conversion: { icon: Target, color: '#00d4ff' },
  deal: { icon: Handshake, color: '#00ffcc' },
  service: { icon: HeartHandshake, color: '#00ffc8' },
  loyalty: { icon: Crown, color: '#008b9d' },
}

export const STAGE_KEYS = ['acquisition', 'conversion', 'deal', 'service', 'loyalty'] as const

export const TAG_COLORS: Record<string, string> = {
  VIP: '#00d4ff',
  keyClient: '#00ffcc',
  newClient: '#00f0ff',
  highPotential: '#00ffc8',
  pending: '#008b9d',
  dormant: '#005f73',
  decisionMaker: '#41ffdd',
  techContact: '#00b4d8',
  strategicPartner: '#80ffea',
}

// ---- Data now comes from shared ContactsContext ----

// ---- Chart Data ----
export const weeklyTrend = [
  { day: '周一', 新客户: 42, 跟进: 65, 成交: 12 },
  { day: '周二', 新客户: 56, 跟进: 72, 成交: 18 },
  { day: '周三', 新客户: 38, 跟进: 58, 成交: 8 },
  { day: '周四', 新客户: 67, 跟进: 85, 成交: 22 },
  { day: '周五', 新客户: 72, 跟进: 91, 成交: 28 },
  { day: '周六', 新客户: 45, 跟进: 42, 成交: 14 },
  { day: '周日', 新客户: 52, 跟进: 55, 成交: 16 },
]

export const stagePieData = [
  { name: '获客', value: 342, color: '#00f0ff' },
  { name: '转化', value: 156, color: '#00d4ff' },
  { name: '成交', value: 89, color: '#00ffcc' },
  { name: '服务', value: 534, color: '#00ffc8' },
  { name: '忠诚', value: 267, color: '#008b9d' },
]

export const channelData = [
  { channel: '官网', value: 320, color: '#00f0ff' },
  { channel: '展会', value: 245, color: '#00d4ff' },
  { channel: '推荐', value: 198, color: '#00ffcc' },
  { channel: '搜索', value: 156, color: '#00ffc8' },
  { channel: '社媒', value: 132, color: '#008b9d' },
  { channel: '线下', value: 98, color: '#005f73' },
]

export const funnelData = [
  { name: '曝光', value: 5200, fill: '#00f0ff' },
  { name: '点击', value: 3800, fill: '#00d4ff' },
  { name: '注册', value: 2100, fill: '#00ffcc' },
  { name: '转化', value: 890, fill: '#00ffc8' },
  { name: '成交', value: 420, fill: '#008b9d' },
]

export const monthlyRevenue = [
  { month: '1月', revenue: 245, target: 300 },
  { month: '2月', revenue: 312, target: 300 },
  { month: '3月', revenue: 289, target: 320 },
  { month: '4月', revenue: 378, target: 350 },
  { month: '5月', revenue: 425, target: 380 },
  { month: '6月', revenue: 398, target: 400 },
]

export const radarData = [
  { dim: '响应速度', value: 92 },
  { dim: '客户满意度', value: 88 },
  { dim: '转化效率', value: 76 },
  { dim: '服务质量', value: 95 },
  { dim: '团队协作', value: 82 },
  { dim: '数据利用', value: 71 },
]

// ---- Neon Tooltip ----
/** Recharts tooltip props interface */
export interface TooltipPayloadEntry {
  name: string
  value: number | string
  color: string
}

export const ALL_TAGS = [
  'VIP',
  '重点客户',
  '新客户',
  '高潜力',
  '待跟进',
  '休眠',
  '决策人',
  '技术对接',
  '战略合作',
]
