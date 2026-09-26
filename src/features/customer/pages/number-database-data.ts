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
  { day: 'ndb.day.mon', 新客户: 42, 跟进: 65, 成交: 12 },
  { day: 'ndb.day.tue', 新客户: 56, 跟进: 72, 成交: 18 },
  { day: 'ndb.day.wed', 新客户: 38, 跟进: 58, 成交: 8 },
  { day: 'ndb.day.thu', 新客户: 67, 跟进: 85, 成交: 22 },
  { day: 'ndb.day.fri', 新客户: 72, 跟进: 91, 成交: 28 },
  { day: 'ndb.day.sat', 新客户: 45, 跟进: 42, 成交: 14 },
  { day: 'ndb.day.sun', 新客户: 52, 跟进: 55, 成交: 16 },
]

export const stagePieData = [
  { name: 'ndb.pie.acquisition', value: 342, color: '#00f0ff' },
  { name: 'ndb.pie.conversion', value: 156, color: '#00d4ff' },
  { name: 'ndb.pie.deal', value: 89, color: '#00ffcc' },
  { name: 'ndb.pie.service', value: 534, color: '#00ffc8' },
  { name: 'ndb.pie.loyalty', value: 267, color: '#008b9d' },
]

export const channelData = [
  { channel: 'ndb.channel.official', value: 320, color: '#00f0ff' },
  { channel: 'ndb.channel.expo', value: 245, color: '#00d4ff' },
  { channel: 'ndb.channel.referral', value: 198, color: '#00ffcc' },
  { channel: 'ndb.channel.search', value: 156, color: '#00ffc8' },
  { channel: 'ndb.channel.social', value: 132, color: '#008b9d' },
  { channel: 'ndb.channel.offline', value: 98, color: '#005f73' },
]

export const funnelData = [
  { name: 'ndb.exposure', value: 5200, fill: '#00f0ff' },
  { name: 'ndb.clicks', value: 3800, fill: '#00d4ff' },
  { name: 'ndb.registrations', value: 2100, fill: '#00ffcc' },
  { name: 'ndb.conversions', value: 890, fill: '#00ffc8' },
  { name: 'ndb.closings', value: 420, fill: '#008b9d' },
]

export const monthlyRevenue = [
  { month: 'ndb.month.1', revenue: 245, target: 300 },
  { month: 'ndb.month.2', revenue: 312, target: 300 },
  { month: 'ndb.month.3', revenue: 289, target: 320 },
  { month: 'ndb.month.4', revenue: 378, target: 350 },
  { month: 'ndb.month.5', revenue: 425, target: 380 },
  { month: 'ndb.month.6', revenue: 398, target: 400 },
]

export const radarData = [
  { dim: 'ndb.radar.response', value: 92 },
  { dim: 'ndb.radar.satisfaction', value: 88 },
  { dim: 'ndb.radar.conversion', value: 76 },
  { dim: 'ndb.radar.quality', value: 95 },
  { dim: 'ndb.radar.teamwork', value: 82 },
  { dim: 'ndb.radar.data', value: 71 },
]

// ---- Neon Tooltip ----
/** Recharts tooltip props interface */
export interface TooltipPayloadEntry {
  name: string
  value: number | string
  color: string
}

export const ALL_TAGS = [
  'ndb.tag.vip',
  'ndb.tag.keyClient',
  'ndb.tag.newClient',
  'ndb.tag.highPotential',
  'ndb.tag.pending',
  'ndb.tag.dormant',
  'ndb.tag.decisionMaker',
  'ndb.tag.techContact',
  'ndb.tag.strategicPartner',
]
