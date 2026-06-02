import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Crown,
  Database,
  Download,
  Edit3,
  Eye,
  FileText,
  Flame,
  Gauge,
  Globe,
  Handshake,
  HeartHandshake,
  Layers,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Phone,
  Plus,
  Radio,
  Repeat,
  Search,
  Send,
  Shield,
  Sparkles,
  Star,
  StarOff,
  Target,
  Ticket,
  Trash2,
  TrendingUp,
  Undo2,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useContacts } from './contacts-context'
import { useI18n } from './i18n-context'

import type { SharedContact } from './contacts-context'
import type { ReactNode } from 'react'

// ==========================================
// YYC³ 号码库 — Number Database Hub
// 全功能 CRM 中枢：智能协同·分析中心·客户价值·服务运营·知识赋能·效能监控
// ==========================================

// ---- Tab Types ----
type TabId =
  | 'overview'
  | 'contacts'
  | 'analytics'
  | 'collaboration'
  | 'value'
  | 'service'
  | 'knowledge'
  | 'monitor'

const TABS: {
  id: TabId
  label: string
  sublabel: string
  icon: (props: { className?: string }) => ReactNode
  color: string
}[] = [
  { id: 'overview', label: '总览', sublabel: 'Overview', icon: Gauge, color: '#00f0ff' },
  { id: 'contacts', label: '客户信息', sublabel: 'Contacts', icon: Users, color: '#00d4ff' },
  { id: 'analytics', label: '智能分析', sublabel: 'Analytics', icon: BarChart3, color: '#00ffcc' },
  { id: 'collaboration', label: '协同管理', sublabel: 'Synergy', icon: Layers, color: '#00ffc8' },
  { id: 'value', label: '客户价值', sublabel: 'Value', icon: Crown, color: '#008b9d' },
  { id: 'service', label: '服务运营', sublabel: 'Service', icon: HeartHandshake, color: '#00f0ff' },
  { id: 'knowledge', label: '知识赋能', sublabel: 'Knowledge', icon: BookOpen, color: '#00d4ff' },
  { id: 'monitor', label: '效能监控', sublabel: 'Monitor', icon: Radio, color: '#005f73' },
]

// ---- Contact type alias from shared context ----
type Contact = SharedContact

const STAGE_META: Record<
  string,
  { icon: (props: { className?: string }) => ReactNode; color: string }
> = {
  获客: { icon: Megaphone, color: '#00f0ff' },
  转化: { icon: Target, color: '#00d4ff' },
  成交: { icon: Handshake, color: '#00ffcc' },
  服务: { icon: HeartHandshake, color: '#00ffc8' },
  忠诚: { icon: Crown, color: '#008b9d' },
}

const TAG_COLORS: Record<string, string> = {
  VIP: '#00d4ff',
  重点客户: '#00ffcc',
  新客户: '#00f0ff',
  高潜力: '#00ffc8',
  待跟进: '#008b9d',
  休眠: '#005f73',
  决策人: '#41ffdd',
  技术对接: '#00b4d8',
  战略合作: '#80ffea',
}

// ---- Data now comes from shared ContactsContext ----

// ---- Chart Data ----
const weeklyTrend = [
  { day: '周一', 新客户: 42, 跟进: 65, 成交: 12 },
  { day: '周二', 新客户: 56, 跟进: 72, 成交: 18 },
  { day: '周三', 新客户: 38, 跟进: 58, 成交: 8 },
  { day: '周四', 新客户: 67, 跟进: 85, 成交: 22 },
  { day: '周五', 新客户: 72, 跟进: 91, 成交: 28 },
  { day: '周六', 新客户: 45, 跟进: 42, 成交: 14 },
  { day: '周日', 新客户: 52, 跟进: 55, 成交: 16 },
]

const stagePieData = [
  { name: '获客', value: 342, color: '#00f0ff' },
  { name: '转化', value: 156, color: '#00d4ff' },
  { name: '成交', value: 89, color: '#00ffcc' },
  { name: '服务', value: 534, color: '#00ffc8' },
  { name: '忠诚', value: 267, color: '#008b9d' },
]

const channelData = [
  { channel: '官网', value: 320, color: '#00f0ff' },
  { channel: '展会', value: 245, color: '#00d4ff' },
  { channel: '推荐', value: 198, color: '#00ffcc' },
  { channel: '搜索', value: 156, color: '#00ffc8' },
  { channel: '社媒', value: 132, color: '#008b9d' },
  { channel: '线下', value: 98, color: '#005f73' },
]

const funnelData = [
  { name: '曝光', value: 5200, fill: '#00f0ff' },
  { name: '点击', value: 3800, fill: '#00d4ff' },
  { name: '注册', value: 2100, fill: '#00ffcc' },
  { name: '转化', value: 890, fill: '#00ffc8' },
  { name: '成交', value: 420, fill: '#008b9d' },
]

const monthlyRevenue = [
  { month: '1月', revenue: 245, target: 300 },
  { month: '2月', revenue: 312, target: 300 },
  { month: '3月', revenue: 289, target: 320 },
  { month: '4月', revenue: 378, target: 350 },
  { month: '5月', revenue: 425, target: 380 },
  { month: '6月', revenue: 398, target: 400 },
]

const radarData = [
  { dim: '响应速度', value: 92 },
  { dim: '客户满意度', value: 88 },
  { dim: '转化效率', value: 76 },
  { dim: '服务质量', value: 95 },
  { dim: '团队协作', value: 82 },
  { dim: '数据利用', value: 71 },
]

// ---- Neon Tooltip ----
/** Recharts tooltip props interface */
interface TooltipPayloadEntry {
  name: string
  value: number | string
  color: string
}
const NeonTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 border"
      style={{
        background: 'rgba(10,10,10,0.95)',
        borderColor: 'rgba(0,240,255,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <p className="text-[10px] text-white/40 mb-1">{label}</p>
      {payload.map((p: TooltipPayloadEntry, i: number) => (
        <p key={i} className="text-[11px]" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ---- Stat Card ----
const StatCard = memo(
  ({
    label,
    value,
    icon: Icon,
    color,
    change,
    trend,
  }: {
    label: string
    value: string
    icon: (props: { className?: string; style?: React.CSSProperties }) => ReactNode
    color: string
    change: string
    trend?: 'up' | 'down'
  }) => (
    <div
      className="rounded-xl p-4 border transition-all duration-300 group"
      style={{ background: 'rgba(10,10,10,0.5)', borderColor: `${color}20` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}40`
        e.currentTarget.style.boxShadow = `0 0 15px ${color}15`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}20`
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p>
          <p
            className="text-lg tabular-nums mt-0.5"
            style={{ color, textShadow: `0 0 8px ${color}40` }}
          >
            {value}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: `${color}70` }} />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        {(trend || 'up') === 'up' ? (
          <ArrowUpRight className="w-3 h-3 text-[#00ffc8]" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-[#005f73]" />
        )}
        <span
          className="text-[10px]"
          style={{ color: (trend || 'up') === 'up' ? '#00ffc8' : '#005f73' }}
        >
          {change}
        </span>
      </div>
    </div>
  ),
)

// ===========================================================
// Tab: Overview
// ===========================================================
function OverviewTab({ contacts }: { contacts: Contact[] }) {
  const { t } = useI18n()
  const totalValue = contacts.reduce((s, c) => s + c.totalValue, 0)
  const avgAI = contacts.length
    ? Math.round(contacts.reduce((s, c) => s + c.aiScore, 0) / contacts.length)
    : 0
  const highRisk = contacts.filter((c) => c.riskLevel === 'high').length
  const todayFollowUp = contacts.filter((c) => c.tags.includes('待跟进')).length

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.totalCustomers')}
          value={contacts.length.toString()}
          icon={Users}
          color="#00f0ff"
          change={t('ndb.thisWeek', { count: 12 })}
        />
        <StatCard
          label={t('ndb.totalValue')}
          value={`¥${(totalValue / 10000).toFixed(1)}万`}
          icon={TrendingUp}
          color="#00ffc8"
          change="+18.5%"
        />
        <StatCard
          label={t('ndb.avgAiScore')}
          value={avgAI.toString()}
          icon={Brain}
          color="#00d4ff"
          change="+3.2"
        />
        <StatCard
          label={t('ndb.pendingFollowUp')}
          value={`${todayFollowUp}`}
          icon={Bell}
          color="#00ffcc"
          change={t('ndb.highRiskCount', { count: highRisk })}
          trend={highRisk > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Trend */}
        <div
          className="xl:col-span-2 rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.weeklyTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMagenta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<NeonTooltip />} />
              <Area
                type="monotone"
                dataKey="新客户"
                stroke="#00f0ff"
                fill="url(#gradCyan)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="跟进"
                stroke="#00d4ff"
                fill="url(#gradMagenta)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="成交"
                stroke="#00ffcc"
                fill="rgba(0,255,204,0.05)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stage Pie */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#00d4ff]" />
            {t('ndb.stageDist')}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={stagePieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {stagePieData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}50)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<NeonTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {stagePieData.map((s) => (
              <span
                key={s.name}
                className="text-[9px] flex items-center gap-1"
                style={{ color: `${s.color}90` }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: s.color }}
                />
                {s.name} {s.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Tasks & Recent Follow-ups */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Today's Follow-ups */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,204,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-[#00ffcc]" />
            {t('ndb.todayTasks')}
          </h3>
          <div className="space-y-2">
            {[
              { task: '跟进王建华技术方案评估', priority: '高', time: '10:00', color: '#005f73' },
              { task: '准备李思琪季度采购合同', priority: '中', time: '14:00', color: '#00ffcc' },
              { task: '陈雅文续约方案审批', priority: '高', time: '15:30', color: '#005f73' },
              { task: '孙浩然竞品分析报告', priority: '中', time: '16:00', color: '#00ffcc' },
              { task: '吴志强安全合规文档准备', priority: '低', time: '17:00', color: '#00ffc8' },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-1.5 h-8 rounded-full"
                  style={{ background: t.color, boxShadow: `0 0 6px ${t.color}40` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 truncate">{t.task}</p>
                  <p className="text-[9px] text-white/20">{t.time}</p>
                </div>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${t.color}15`,
                    color: t.color,
                    border: `1px solid ${t.color}25`,
                  }}
                >
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
            {t('ndb.aiRecommend')}
          </h3>
          <div className="space-y-2">
            {[
              {
                action: '立即联系',
                target: '王建华（量子计算）',
                reason: '健康度连续3天下降，风险升至中级',
                icon: AlertTriangle,
                color: '#005f73',
              },
              {
                action: '发送方案',
                target: '孙浩然（智造工业）',
                reason: '竞对报价中，需加速推进',
                icon: Send,
                color: '#00ffcc',
              },
              {
                action: '安排续约',
                target: '周小敏（新智教育）',
                reason: '合同30天内到期，满意度高',
                icon: Repeat,
                color: '#00ffc8',
              },
              {
                action: '提档升级',
                target: '吴志强（金融云）',
                reason: 'AI评分78→85可能，建议安全架构会议',
                icon: Zap,
                color: '#00d4ff',
              },
              {
                action: '唤醒跟进',
                target: '刘芳芳（生物智能）',
                reason: '7天未联系，初期客户需持续培育',
                icon: Flame,
                color: '#008b9d',
              },
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:border-white/10 group cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${r.color}15`, border: `1px solid ${r.color}25` }}
                >
                  <r.icon className="w-3.5 h-3.5" style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: `${r.color}15`, color: r.color }}
                    >
                      {r.action}
                    </span>
                    <span className="text-[11px] text-white/60 truncate">{r.target}</span>
                  </div>
                  <p className="text-[9px] text-white/25 mt-0.5">{r.reason}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Contacts (inline contact list with quick actions)
// ===========================================================
function ContactsTab({
  contacts,
  setContacts,
  onEdit,
}: {
  contacts: Contact[]
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
  onEdit?: (c: Contact) => void
}) {
  const { t } = useI18n()
  const { deleteContact, toggleStar: ctxToggleStar } = useContacts()
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let r = contacts
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.tags.some((t) => t.includes(q)),
      )
    }
    if (filterStage) r = r.filter((c) => c.stage === filterStage)
    return r.sort((a, b) => b.aiScore - a.aiScore)
  }, [contacts, search, filterStage])

  const selected = useMemo(() => contacts.find((c) => c.id === selectedId), [contacts, selectedId])

  const toggleBatchSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleBatchDelete = useCallback(() => {
    selectedIds.forEach((id) => deleteContact(id))
    setSelectedIds(new Set())
    setBatchMode(false)
  }, [selectedIds, deleteContact])

  return (
    <div className="flex h-full gap-4">
      {/* List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white/70 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,240,255,0.12)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.12)')}
              placeholder={t('ndb.searchPlaceholder')}
            />
          </div>
          <div className="flex gap-1">
            {(['获客', '转化', '成交', '服务', '忠诚'] as const).map((s) => {
              const active = filterStage === s
              const col = STAGE_META[s].color
              return (
                <button
                  key={s}
                  onClick={() => setFilterStage(active ? null : s)}
                  className="px-2 py-1.5 rounded-lg text-[10px] transition-all border"
                  style={{
                    background: active ? `${col}15` : 'transparent',
                    borderColor: active ? `${col}40` : 'rgba(255,255,255,0.06)',
                    color: active ? col : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
          {/* Batch mode toggle */}
          <button
            onClick={() => {
              setBatchMode(!batchMode)
              setSelectedIds(new Set())
            }}
            className="px-2.5 py-1.5 rounded-lg text-[10px] transition-all border"
            style={{
              background: batchMode ? 'rgba(0,95,115,0.1)' : 'rgba(255,255,255,0.03)',
              borderColor: batchMode ? 'rgba(0,95,115,0.3)' : 'rgba(255,255,255,0.06)',
              color: batchMode ? '#005f73' : 'rgba(255,255,255,0.25)',
            }}
          >
            {batchMode ? `${t('common.delete')} (${selectedIds.size})` : t('common.edit')}
          </button>
        </div>

        {/* Batch actions bar */}
        {batchMode && selectedIds.size > 0 && (
          <div
            className="flex items-center gap-3 mb-3 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(0,95,115,0.06)',
              border: '1px solid rgba(0,95,115,0.15)',
              animation: 'spring-in 0.2s var(--spring-easing) both',
            }}
          >
            <span className="text-[10px] text-[#005f73]">
              {selectedIds.size} {t('ndb.recordCount', { count: selectedIds.size }).split(' ')[1]}
            </span>
            <button
              onClick={handleBatchDelete}
              className="text-[10px] px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: 'rgba(0,95,115,0.15)',
                border: '1px solid rgba(0,95,115,0.3)',
                color: '#005f73',
              }}
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              {t('common.delete')}
            </button>
            <button
              onClick={() => {
                setBatchMode(false)
                setSelectedIds(new Set())
              }}
              className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto space-y-1.5" style={{ scrollbarWidth: 'none' }}>
          <p className="text-[9px] text-white/15 mb-1">
            {t('ndb.recordCount', { count: filtered.length })}
          </p>
          {filtered.map((c, i) => {
            const sm = STAGE_META[c.stage]
            const isActive = selectedId === c.id
            const isBatchSelected = selectedIds.has(c.id)
            return (
              <div
                key={c.id}
                onClick={() =>
                  batchMode ? toggleBatchSelect(c.id) : setSelectedId(isActive ? null : c.id)
                }
                className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 group"
                style={{
                  background: isBatchSelected
                    ? 'rgba(0,95,115,0.06)'
                    : isActive
                      ? 'rgba(0,240,255,0.06)'
                      : 'rgba(10,10,10,0.4)',
                  borderColor: isBatchSelected
                    ? 'rgba(0,95,115,0.25)'
                    : isActive
                      ? 'rgba(0,240,255,0.25)'
                      : 'rgba(255,255,255,0.04)',
                  animation: `spring-in 0.3s var(--spring-easing) ${i * 0.02}s both`,
                }}
              >
                {batchMode ? (
                  <div
                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                    style={{
                      background: isBatchSelected ? '#005f73' : 'transparent',
                      borderColor: isBatchSelected ? '#005f73' : 'rgba(255,255,255,0.15)',
                    }}
                  >
                    {isBatchSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      ctxToggleStar(c.id)
                    }}
                    className="shrink-0"
                  >
                    {c.starred ? (
                      <Star className="w-3.5 h-3.5 text-[#00ffcc] fill-[#00ffcc]" />
                    ) : (
                      <StarOff className="w-3.5 h-3.5 text-white/10" />
                    )}
                  </button>
                )}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${sm.color}15`, border: `1px solid ${sm.color}25` }}
                >
                  <span className="text-[11px] text-white/70">{c.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80 truncate">{c.name}</span>
                    {c.tags.slice(0, 1).map((t) => (
                      <span
                        key={t}
                        className="text-[8px] px-1.5 py-0.5 rounded-full hidden sm:inline"
                        style={{
                          background: `${TAG_COLORS[t] || '#00f0ff'}12`,
                          color: `${TAG_COLORS[t] || '#00f0ff'}90`,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/25 truncate">
                    {c.position} · {c.company}
                  </p>
                </div>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full hidden md:inline-block"
                  style={{
                    background: `${sm.color}15`,
                    color: sm.color,
                    border: `1px solid ${sm.color}25`,
                  }}
                >
                  {c.stage}
                </span>
                <div className="hidden lg:block">
                  <AIBadge score={c.aiScore} />
                </div>
                <span className="text-xs text-[#00ffc8] tabular-nums hidden lg:block">
                  ¥{(c.totalValue / 1000).toFixed(0)}K
                </span>
                <span className="text-[10px] text-white/15 hidden xl:block">{c.lastContact}</span>
                {/* Inline actions */}
                {!batchMode && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(c)
                        }}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                        title={t('common.edit')}
                      >
                        <Edit3 className="w-3 h-3 text-white/20 hover:text-[#00f0ff]" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDeleteId(c.id)
                      }}
                      className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                      title={t('ndb.deleteContact')}
                    >
                      <Trash2 className="w-3 h-3 text-white/20 hover:text-[#005f73]" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Delete confirmation */}
        {confirmDeleteId && (
          <div
            className="flex items-center gap-3 mt-3 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(0,95,115,0.06)',
              border: '1px solid rgba(0,95,115,0.15)',
              animation: 'spring-in 0.2s var(--spring-easing) both',
            }}
          >
            <AlertTriangle className="w-4 h-4 text-[#005f73] shrink-0" />
            <span className="text-[10px] text-[#005f73] flex-1">{t('ndb.confirmDelete')}</span>
            <button
              onClick={() => {
                deleteContact(confirmDeleteId)
                setConfirmDeleteId(null)
                if (selectedId === confirmDeleteId) setSelectedId(null)
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: 'rgba(0,95,115,0.15)',
                border: '1px solid rgba(0,95,115,0.3)',
                color: '#005f73',
              }}
            >
              {t('common.delete')}
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="text-[10px] text-white/30 px-2 py-1"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div
          className="hidden xl:block w-72 shrink-0 overflow-y-auto border-l rounded-2xl"
          style={{
            background: 'rgba(5,5,5,0.95)',
            borderColor: 'rgba(0,240,255,0.12)',
            scrollbarWidth: 'none',
            animation: 'spring-in 0.3s var(--spring-easing) both',
          }}
        >
          <div className="p-5 text-center border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{
                background: `linear-gradient(135deg, ${STAGE_META[selected.stage].color}30, rgba(0,212,255,0.2))`,
                border: `2px solid ${STAGE_META[selected.stage].color}40`,
              }}
            >
              <span className="text-lg text-white/80">{selected.name[0]}</span>
            </div>
            <h3 className="text-white/90 tracking-wider">{selected.name}</h3>
            <p className="text-[10px] text-white/30">
              {selected.position} · {selected.company}
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <button
                className="p-2 rounded-xl transition-colors hover:bg-[#00ffcc]/10"
                style={{ border: '1px solid rgba(0,255,204,0.2)' }}
              >
                <Phone className="w-3.5 h-3.5 text-[#00ffcc]" />
              </button>
              <button
                className="p-2 rounded-xl transition-colors hover:bg-[#00f0ff]/10"
                style={{ border: '1px solid rgba(0,240,255,0.2)' }}
              >
                <Mail className="w-3.5 h-3.5 text-[#00f0ff]" />
              </button>
              <button
                className="p-2 rounded-xl transition-colors hover:bg-[#00d4ff]/10"
                style={{ border: '1px solid rgba(0,212,255,0.2)' }}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#00d4ff]" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: '电话', value: selected.phone, icon: Phone, color: '#00ffcc' },
              { label: '邮箱', value: selected.email, icon: Mail, color: '#00f0ff' },
              { label: '地址', value: selected.source, icon: MapPin, color: '#00ffc8' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-3 h-3 shrink-0" style={{ color: `${item.color}60` }} />
                <span className="text-[10px] text-white/40 truncate">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {[
              { label: 'AI评分', value: selected.aiScore.toString(), color: '#00d4ff' },
              { label: '通话', value: selected.totalCalls.toString(), color: '#00ffcc' },
              {
                label: '价值',
                value: `¥${(selected.totalValue / 1000).toFixed(0)}K`,
                color: '#00ffc8',
              },
              {
                label: '风险',
                value:
                  selected.riskLevel === 'low'
                    ? '低'
                    : selected.riskLevel === 'medium'
                      ? '中'
                      : '高',
                color:
                  selected.riskLevel === 'low'
                    ? '#00ffc8'
                    : selected.riskLevel === 'high'
                      ? '#005f73'
                      : '#00ffcc',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-lg p-2"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <p className="text-[8px] text-white/20">{s.label}</p>
                <p className="text-xs tabular-nums" style={{ color: s.color }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <p className="text-[9px] text-white/20 mb-1">备注</p>
            <p className="text-[10px] text-white/35">{selected.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ===========================================================
// Tab: Analytics (智能分析中心)
// ===========================================================
function AnalyticsTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.yoyGrowth')}
          value="+23.7%"
          icon={TrendingUp}
          color="#00f0ff"
          change={t('ndb.vsLastYear')}
        />
        <StatCard
          label={t('ndb.momGrowth')}
          value="+8.2%"
          icon={BarChart3}
          color="#00d4ff"
          change={t('ndb.vsLastMonth')}
        />
        <StatCard
          label={t('ndb.targetRate')}
          value="87.5%"
          icon={Target}
          color="#00ffcc"
          change={t('ndb.targetGap', { pct: '12.5%' })}
          trend="up"
        />
        <StatCard
          label={t('ndb.teamRank')}
          value="TOP 3"
          icon={Award}
          color="#00ffc8"
          change={t('ndb.nationwide', { rank: 3 })}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Revenue vs Target */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.revenueVsTarget')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<NeonTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#00f0ff"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
                name="实际营收"
              />
              <Bar
                dataKey="target"
                fill="#00d4ff"
                radius={[4, 4, 0, 0]}
                opacity={0.3}
                name="目标"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Analysis */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#00d4ff]" />
            {t('ndb.channelAnalysis')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                type="number"
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="channel"
                type="category"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<NeonTooltip />} />
              <Bar dataKey="value" name="客户数" radius={[0, 4, 4, 0]}>
                {channelData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Trend Prediction */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Radar */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,204,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#00ffcc]" />
            {t('ndb.radarChart')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart outerRadius={80} data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
              <PolarRadiusAxis
                angle={30}
                tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 8 }}
                domain={[0, 100]}
              />
              <Radar
                name="能力值"
                dataKey="value"
                stroke="#00f0ff"
                fill="#00f0ff"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Prediction */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,200,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-[#00ffc8]" />
            {t('ndb.aiTrendPredict')}
          </h3>
          <div className="space-y-3">
            {[
              {
                title: 'Q2 营收预测',
                desc: '基于当前增长趋势，预计 Q2 可达 ¥165万，超额完成目标 12%',
                confidence: 87,
                color: '#00ffc8',
              },
              {
                title: '客户流失预警',
                desc: '3位客户健康度持续下降，建议72小时内安排专项跟进',
                confidence: 92,
                color: '#005f73',
              },
              {
                title: '转化率优化',
                desc: '「官网注册」渠道转化率低于均值，建议优化落地页内容',
                confidence: 78,
                color: '#00ffcc',
              },
              {
                title: '团队效能建议',
                desc: '张明远负载偏高(18客户)，建议将3位获客阶段客户分配给新人',
                confidence: 85,
                color: '#00d4ff',
              },
            ].map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/60">{p.title}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: `${p.color}15`, color: p.color }}
                  >
                    置信度 {p.confidence}%
                  </span>
                </div>
                <p className="text-[10px] text-white/30">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Collaboration (智能协同管理)
// ===========================================================
function CollaborationTab() {
  const { t } = useI18n()
  const [selectedTask, setSelectedTask] = useState<number | null>(null)

  const tasks = [
    {
      id: 1,
      title: '星际科技技术方案交付',
      assignee: '张伟',
      status: '进行中',
      priority: '高',
      progress: 72,
      deadline: '2026-03-15',
      color: '#00f0ff',
    },
    {
      id: 2,
      title: '云端数据Q2采购合同',
      assignee: '李娜',
      status: '审批中',
      priority: '高',
      progress: 45,
      deadline: '2026-03-20',
      color: '#00d4ff',
    },
    {
      id: 3,
      title: '量子计算技术演示准备',
      assignee: '王磊',
      status: '待开始',
      priority: '中',
      progress: 10,
      deadline: '2026-03-18',
      color: '#00ffcc',
    },
    {
      id: 4,
      title: '智链网络续约方案',
      assignee: '陈静',
      status: '进行中',
      priority: '高',
      progress: 88,
      deadline: '2026-03-14',
      color: '#00ffc8',
    },
    {
      id: 5,
      title: '未来能源年度复盘报告',
      assignee: '赵明',
      status: '已完成',
      priority: '低',
      progress: 100,
      deadline: '2026-03-12',
      color: '#008b9d',
    },
    {
      id: 6,
      title: '金融云安全架构评审',
      assignee: '刘洋',
      status: '进行中',
      priority: '中',
      progress: 56,
      deadline: '2026-03-22',
      color: '#00f0ff',
    },
  ]

  const progressData = [
    { person: '张伟', completed: 12, total: 15 },
    { person: '李娜', completed: 8, total: 12 },
    { person: '王磊', completed: 6, total: 10 },
    { person: '陈静', completed: 14, total: 16 },
    { person: '赵明', completed: 10, total: 10 },
    { person: '刘洋', completed: 7, total: 11 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.activeTasks')}
          value="24"
          icon={Layers}
          color="#00f0ff"
          change="+5"
        />
        <StatCard
          label={t('ndb.completionRate')}
          value="78.3%"
          icon={Check}
          color="#00ffc8"
          change="+6.2%"
        />
        <StatCard
          label={t('ndb.avgProcessTime')}
          value="2.3d"
          icon={Clock}
          color="#00ffcc"
          change="-0.5d"
        />
        <StatCard
          label={t('ndb.teamEfficiency')}
          value="92.1"
          icon={Zap}
          color="#00d4ff"
          change="+3.8"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Task List */}
        <div
          className="xl:col-span-2 rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.taskBoard')}
          </h3>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(selectedTask === t.id ? null : t.id)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 group"
                style={{
                  background: selectedTask === t.id ? `${t.color}08` : 'rgba(255,255,255,0.02)',
                  borderColor: selectedTask === t.id ? `${t.color}25` : 'rgba(255,255,255,0.04)',
                  animation: `spring-in 0.3s var(--spring-easing) ${i * 0.03}s both`,
                }}
              >
                <div
                  className="w-2 h-10 rounded-full"
                  style={{ background: t.color, opacity: t.status === '已完成' ? 0.3 : 1 }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/70 truncate">{t.title}</p>
                  <p className="text-[9px] text-white/20">
                    {t.assignee} · {t.deadline}
                  </p>
                </div>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      t.status === '已完成'
                        ? 'rgba(0,255,200,0.1)'
                        : t.status === '进行中'
                          ? 'rgba(0,240,255,0.1)'
                          : t.status === '审批中'
                            ? 'rgba(0,212,255,0.1)'
                            : 'rgba(255,255,255,0.05)',
                    color:
                      t.status === '已完成'
                        ? '#00ffc8'
                        : t.status === '进行中'
                          ? '#00f0ff'
                          : t.status === '审批中'
                            ? '#00d4ff'
                            : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${t.status === '已完成' ? 'rgba(0,255,200,0.2)' : t.status === '进行中' ? 'rgba(0,240,255,0.2)' : t.status === '审批中' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {t.status}
                </span>
                <div className="w-20 hidden sm:block">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${t.progress}%`,
                        background:
                          t.progress >= 80 ? '#00ffc8' : t.progress >= 50 ? '#00ffcc' : '#008b9d',
                      }}
                    />
                  </div>
                  <p className="text-[8px] text-white/15 text-right mt-0.5">{t.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Progress */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,200,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00ffc8]" />
            {t('ndb.teamProgress')}
          </h3>
          <div className="space-y-4">
            {progressData.map((p, i) => {
              const pct = Math.round((p.completed / p.total) * 100)
              const color =
                pct >= 90 ? '#00ffc8' : pct >= 70 ? '#00f0ff' : pct >= 50 ? '#00ffcc' : '#008b9d'
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-white/50">{p.person}</span>
                    <span className="text-[10px] tabular-nums" style={{ color }}>
                      {p.completed}/{p.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: color,
                        boxShadow: `0 0 6px ${color}40`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Customer Value (客户价值管理)
// ===========================================================
function ValueTab({ contacts }: { contacts: Contact[] }) {
  return (
    <div className="space-y-6">
      {/* Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,139,157,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#008b9d]" />
            销售漏斗 · Conversion Funnel
          </h3>
          <div className="space-y-2">
            {funnelData.map((stage, i) => {
              const maxVal = funnelData[0].value
              const widthPct = Math.max(20, (stage.value / maxVal) * 100)
              const convRate =
                i > 0 ? ((stage.value / funnelData[i - 1].value) * 100).toFixed(1) : '100'
              return (
                <div
                  key={stage.name}
                  className="relative"
                  style={{ animation: `spring-in 0.3s var(--spring-easing) ${i * 0.05}s both` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 w-8 text-right shrink-0">
                      {stage.name}
                    </span>
                    <div className="flex-1 relative">
                      <div
                        className="h-8 rounded-lg flex items-center px-3 transition-all duration-500"
                        style={{
                          width: `${widthPct}%`,
                          background: `${stage.fill}15`,
                          border: `1px solid ${stage.fill}30`,
                          boxShadow: `0 0 8px ${stage.fill}15`,
                        }}
                      >
                        <span className="text-[11px] tabular-nums" style={{ color: stage.fill }}>
                          {stage.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {i > 0 && (
                      <span className="text-[9px] text-white/20 w-12 text-right shrink-0">
                        {convRate}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Customer Portraits */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-[#00d4ff]" />
            全景客户画像 · RFM 分层
          </h3>
          <div className="space-y-2">
            {[
              {
                tier: 'S 级',
                label: '战略客户',
                count: 5,
                value: '¥1,920K',
                color: '#00d4ff',
                desc: '高频·高价值·活跃',
              },
              {
                tier: 'A 级',
                label: '核心客户',
                count: 12,
                value: '¥864K',
                color: '#00ffcc',
                desc: '高频·中高价值',
              },
              {
                tier: 'B 级',
                label: '成长客户',
                count: 28,
                value: '¥420K',
                color: '#00f0ff',
                desc: '中频·中等价值',
              },
              {
                tier: 'C 级',
                label: '潜力客户',
                count: 45,
                value: '¥156K',
                color: '#00ffc8',
                desc: '低频·待培育',
              },
              {
                tier: 'D 级',
                label: '休眠客户',
                count: 18,
                value: '¥32K',
                color: '#005f73',
                desc: '极低频·需唤醒',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}
                >
                  <span className="text-[10px]" style={{ color: t.color }}>
                    {t.tier}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60">
                    {t.label} <span className="text-white/20">· {t.desc}</span>
                  </p>
                  <p className="text-[9px] text-white/20">{t.count}位客户</p>
                </div>
                <span className="text-xs tabular-nums" style={{ color: t.color }}>
                  {t.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follow-up Timeline */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
      >
        <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
          跟进记录图谱 · Follow-up Timeline
        </h3>
        <div className="relative pl-6">
          <div
            className="absolute left-2 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, #00f0ff40, #00d4ff40, transparent)' }}
          />
          {[
            {
              time: '今天 14:30',
              action: 'AI 自动跟进',
              target: '陈雅文 · 智链网络',
              detail: '发送续约方案v2.1，客户已读',
              color: '#00ffc8',
            },
            {
              time: '今天 10:15',
              action: '电话沟通',
              target: '张明远 · 星际科技',
              detail: '技术方案讨论，客户反馈积极',
              color: '#00f0ff',
            },
            {
              time: '昨天 16:00',
              action: '邮���发送',
              target: '孙浩然 · 智造工业',
              detail: '产品对比文档+报价单',
              color: '#00ffcc',
            },
            {
              time: '昨天 11:30',
              action: 'AI 智能提醒',
              target: '王建华 · 量子计算',
              detail: '客户3天未响应，建议换种方式联系',
              color: '#005f73',
            },
            {
              time: '3月11日',
              action: '视频会议',
              target: '赵鹏飞 · 未来能源',
              detail: '年度合作复盘，双方确认续约意向',
              color: '#00d4ff',
            },
            {
              time: '3月10日',
              action: '工单创建',
              target: '李思琪 · 云端数据',
              detail: '数据分析模块优化需求 #T-892',
              color: '#008b9d',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative mb-4 last:mb-0"
              style={{ animation: `spring-in 0.3s var(--spring-easing) ${i * 0.04}s both` }}
            >
              <div
                className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2"
                style={{ borderColor: item.color, background: `${item.color}30` }}
              />
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] text-white/20">{item.time}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.action}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">{item.target}</p>
                  <p className="text-[9px] text-white/25">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Service (服务体验升级)
// ===========================================================
function ServiceTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.activeTickets')}
          value="37"
          icon={Ticket}
          color="#00f0ff"
          change="+8"
        />
        <StatCard
          label={t('ndb.avgResolveTime')}
          value="4.2h"
          icon={Clock}
          color="#00ffc8"
          change="-1.3h"
        />
        <StatCard
          label={t('ndb.satisfactionScore')}
          value="4.8/5"
          icon={Star}
          color="#00ffcc"
          change="+0.2"
        />
        <StatCard
          label={t('ndb.churnAlert')}
          value="3"
          icon={AlertTriangle}
          color="#005f73"
          change={t('ndb.urgentAttention')}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Tickets */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.ticketSystem')}
          </h3>
          <div className="space-y-2">
            {[
              {
                id: 'T-892',
                title: '数据分析模块优化',
                customer: '李思琪',
                channel: '在线',
                priority: '中',
                status: '处理中',
                color: '#00f0ff',
              },
              {
                id: 'T-893',
                title: 'API集成异常反馈',
                customer: '陈雅文',
                channel: '邮件',
                priority: '高',
                status: '待分配',
                color: '#005f73',
              },
              {
                id: 'T-894',
                title: '报表导出格式需求',
                customer: '赵鹏飞',
                channel: '电话',
                priority: '低',
                status: '已解决',
                color: '#00ffc8',
              },
              {
                id: 'T-895',
                title: '权限配置咨询',
                customer: '周小敏',
                channel: '在线',
                priority: '中',
                status: '处理中',
                color: '#00ffcc',
              },
              {
                id: 'T-896',
                title: '安全合规文档申请',
                customer: '吴志强',
                channel: '邮件',
                priority: '高',
                status: '待分配',
                color: '#005f73',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <span className="text-[9px] text-white/15 tabular-nums w-12 shrink-0">{t.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 truncate">{t.title}</p>
                  <p className="text-[9px] text-white/20">
                    {t.customer} · {t.channel}
                  </p>
                </div>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      t.priority === '高'
                        ? 'rgba(0,95,115,0.1)'
                        : t.priority === '中'
                          ? 'rgba(0,255,204,0.1)'
                          : 'rgba(0,255,200,0.1)',
                    color:
                      t.priority === '高' ? '#005f73' : t.priority === '中' ? '#00ffcc' : '#00ffc8',
                  }}
                >
                  {t.priority}
                </span>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      t.status === '已解决'
                        ? 'rgba(0,255,200,0.1)'
                        : t.status === '处理中'
                          ? 'rgba(0,240,255,0.1)'
                          : 'rgba(0,95,115,0.1)',
                    color:
                      t.status === '已解决'
                        ? '#00ffc8'
                        : t.status === '处理中'
                          ? '#00f0ff'
                          : '#005f73',
                  }}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Alert + Wake-up */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,95,115,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-[#005f73]" />
            {t('ndb.churnWakeup')}
          </h3>
          <div className="space-y-3">
            {[
              {
                name: '刘芳芳',
                company: '生物智能',
                days: 7,
                health: 38,
                strategy: '发送行业白皮书+预约技术演示',
                channel: '邮件+电话',
                color: '#005f73',
              },
              {
                name: '黄丽华',
                company: '健康智能',
                days: 5,
                health: 42,
                strategy: '推送行业案例+优惠方案',
                channel: '微信+短信',
                color: '#005f73',
              },
              {
                name: '王建华',
                company: '量子计算',
                days: 3,
                health: 55,
                strategy: '技术团队直接对接+定制演示',
                channel: '视频会议',
                color: '#00ffcc',
              },
            ].map((a, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${a.color}15` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/60">{a.name}</span>
                    <span className="text-[9px] text-white/20">{a.company}</span>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: `${a.color}15`, color: a.color }}
                  >
                    {a.days}天未联系
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] text-white/20">健康度</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${a.health}%`,
                        background: a.health > 50 ? '#00ffcc' : '#005f73',
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] tabular-nums"
                    style={{ color: a.health > 50 ? '#00ffcc' : '#005f73' }}
                  >
                    {a.health}
                  </span>
                </div>
                <p className="text-[9px] text-white/25 mb-1">
                  <Sparkles className="w-2.5 h-2.5 inline text-[#00d4ff]/60 mr-1" />
                  AI策略: {a.strategy}
                </p>
                <p className="text-[8px] text-white/15">推荐渠道: {a.channel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Knowledge (知识赋能平台)
// ===========================================================
function KnowledgeTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.knowledgeDocs')}
          value="1,247"
          icon={FileText}
          color="#00f0ff"
          change="+32"
        />
        <StatCard
          label={t('ndb.todayTraining')}
          value="3"
          icon={BookOpen}
          color="#00d4ff"
          change="1 active"
        />
        <StatCard
          label={t('ndb.aiMeetingNotes')}
          value="89"
          icon={MessageSquare}
          color="#00ffcc"
          change="+5"
        />
        <StatCard
          label={t('ndb.teamMotivation')}
          value="94.2"
          icon={Award}
          color="#00ffc8"
          change="+2.8"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Knowledge Base */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.knowledgeBase')}
          </h3>
          <div className="space-y-2">
            {[
              {
                title: '量子加密通信解决方案白皮书',
                type: '技术文档',
                views: 342,
                date: '3月12日',
                color: '#00f0ff',
              },
              {
                title: '2026Q1 产品更新说明',
                type: '产品资料',
                views: 567,
                date: '3月10日',
                color: '#00d4ff',
              },
              {
                title: '客户续约话术模板 v3.2',
                type: '话术库',
                views: 1204,
                date: '3月8日',
                color: '#00ffcc',
              },
              {
                title: '竞品分析报告：AI智能呼叫赛道',
                type: '市场分析',
                views: 298,
                date: '3月5日',
                color: '#00ffc8',
              },
              {
                title: '新人入职培训手册 2026版',
                type: '培训资料',
                views: 189,
                date: '3月1日',
                color: '#008b9d',
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 hover:border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <FileText className="w-4 h-4 shrink-0" style={{ color: `${doc.color}60` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 truncate">{doc.title}</p>
                  <p className="text-[9px] text-white/20">
                    {doc.type} · {doc.date}
                  </p>
                </div>
                <span className="text-[9px] text-white/15 flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> {doc.views}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Motivations */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,200,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#00ffc8]" />
            {t('ndb.dailyMotivation')}
          </h3>
          <div className="space-y-3">
            {[
              {
                name: '张伟',
                role: '高级销售',
                msg: '本周签约3单，连续突破记录！你的专业度和执行力令人钦佩，继续保持这股冲劲！',
                type: '鼓励',
                score: 96,
                color: '#00ffc8',
              },
              {
                name: '李娜',
                role: '客户经理',
                msg: '客户满意度评分4.9，全团队最高！你对客户的用心被看到了，期待下个月更精彩的表现！',
                type: '鼓励',
                score: 94,
                color: '#00f0ff',
              },
              {
                name: '王磊',
                role: '技术支持',
                msg: '本周工单解决率有所下降，建议优先处理高优先级工单。相信你的技术能力，调整节奏就好！',
                type: '诫勉',
                score: 72,
                color: '#00ffcc',
              },
              {
                name: '刘洋',
                role: '售前顾问',
                msg: '方案制作质量很高，但交付周期偏长。尝试用模板化��法提效，你一定能做到的！',
                type: '诫勉',
                score: 78,
                color: '#008b9d',
              },
            ].map((m, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: `${m.color}15`, border: `1px solid ${m.color}25` }}
                    >
                      <span className="text-[9px]" style={{ color: m.color }}>
                        {m.name[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-white/60">{m.name}</span>
                      <span className="text-[9px] text-white/20 ml-1.5">{m.role}</span>
                    </div>
                  </div>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: m.type === '鼓励' ? 'rgba(0,255,200,0.1)' : 'rgba(0,139,157,0.1)',
                      color: m.type === '鼓励' ? '#00ffc8' : '#008b9d',
                      border: `1px solid ${m.type === '鼓励' ? 'rgba(0,255,200,0.2)' : 'rgba(0,139,157,0.2)'}`,
                    }}
                  >
                    {m.type}
                  </span>
                </div>
                <p className="text-[10px] text-white/35 leading-relaxed">{m.msg}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] text-white/15">绩效指数</span>
                  <div className="flex-1 h-1 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${m.score}%`, background: m.color }}
                    />
                  </div>
                  <span className="text-[9px] tabular-nums" style={{ color: m.color }}>
                    {m.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Monitor (效能监控大屏)
// ===========================================================
function MonitorTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.realtimeVisits')}
          value="2,847"
          icon={Eye}
          color="#00f0ff"
          change="+342"
        />
        <StatCard
          label={t('ndb.apiResponseTime')}
          value="12ms"
          icon={Zap}
          color="#00ffc8"
          change="-3ms"
        />
        <StatCard
          label={t('ndb.sysAvailability')}
          value="99.97%"
          icon={Shield}
          color="#00ffcc"
          change="30d"
        />
        <StatCard
          label={t('ndb.anomalyAlerts')}
          value="0"
          icon={AlertTriangle}
          color="#005f73"
          change={t('ndb.sysNormal')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.funnelAnalysis')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<NeonTooltip />} />
              <Bar dataKey="value" name="数量" radius={[4, 4, 0, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} opacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Metrics Grid */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,95,115,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#005f73]" />
            关键指标监控面板
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'CPU 使用率',
                value: '34%',
                max: 100,
                current: 34,
                color: '#00ffc8',
                threshold: 80,
              },
              {
                label: '内存使用',
                value: '62%',
                max: 100,
                current: 62,
                color: '#00ffcc',
                threshold: 85,
              },
              {
                label: '磁盘 I/O',
                value: '18MB/s',
                max: 100,
                current: 18,
                color: '#00f0ff',
                threshold: 90,
              },
              {
                label: '网络吞吐',
                value: '245Mbps',
                max: 1000,
                current: 24.5,
                color: '#00d4ff',
                threshold: 80,
              },
              {
                label: '并发连接',
                value: '1,247',
                max: 5000,
                current: 25,
                color: '#008b9d',
                threshold: 80,
              },
              {
                label: '队列积压',
                value: '3',
                max: 100,
                current: 3,
                color: '#00ffc8',
                threshold: 50,
              },
            ].map((m, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-white/25">{m.label}</span>
                  <span className="text-xs tabular-nums" style={{ color: m.color }}>
                    {m.value}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${m.current}%`,
                      background: m.color,
                      boxShadow: `0 0 6px ${m.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behavior Analysis */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,204,0.12)' }}
      >
        <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00ffcc]" />
          用户行为路径 · 页面停留热点
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { page: '数据驾驶舱', visits: 4523, avgTime: '3:42', heat: 95, color: '#00f0ff' },
            { page: '客户管理', visits: 3891, avgTime: '5:18', heat: 88, color: '#00d4ff' },
            { page: 'AI 呼叫', visits: 2674, avgTime: '8:45', heat: 82, color: '#00ffcc' },
            { page: '智能表单', visits: 2145, avgTime: '2:56', heat: 72, color: '#00ffc8' },
            { page: '数据洞察', visits: 1892, avgTime: '4:12', heat: 65, color: '#008b9d' },
            { page: '号码库', visits: 1567, avgTime: '6:33', heat: 58, color: '#005f73' },
          ].map((p, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center border transition-all duration-200 hover:border-white/10"
              style={{ background: `${p.color}08`, borderColor: `${p.color}15` }}
            >
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center relative"
                style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}
              >
                <span className="text-xs" style={{ color: p.color }}>
                  {p.heat}
                </span>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{
                    background: p.heat >= 80 ? '#005f73' : p.heat >= 60 ? '#00ffcc' : '#00ffc8',
                    boxShadow: `0 0 4px ${p.heat >= 80 ? '#005f73' : p.heat >= 60 ? '#00ffcc' : '#00ffc8'}`,
                    animation: p.heat >= 80 ? 'neon-pulse 1.5s ease-in-out infinite' : 'none',
                  }}
                />
              </div>
              <p className="text-[10px] text-white/50">{p.page}</p>
              <p className="text-[9px] text-white/20">{p.visits.toLocaleString()} 访问</p>
              <p className="text-[8px] text-white/15">均停留 {p.avgTime}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- AI Score Badge ----
const AIBadge = memo(({ score }: { score: number }) => {
  const color =
    score >= 90 ? '#00ffc8' : score >= 70 ? '#00ffcc' : score >= 50 ? '#008b9d' : '#005f73'
  return (
    <div className="flex items-center gap-1">
      <div className="relative w-6 h-6">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-[7px] tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  )
})

// ===========================================================
// Main Export
// ===========================================================
// ===========================================================
// Add/Edit Contact Modal with Conditional Field Logic
// ===========================================================
const ALL_TAGS = [
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

function ContactFormModal({
  contact,
  onSave,
  onClose,
}: {
  contact: Contact | null
  onSave: (c: Contact) => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const isEdit = !!contact
  const [form, setForm] = useState<Contact>(
    contact || {
      id: `c${Date.now()}`,
      name: '',
      phone: '',
      email: '',
      company: '',
      position: '',
      stage: '获客',
      tags: [],
      aiScore: 50,
      aiInsights: ['新建联系人，AI 将自动分析'],
      starred: false,
      address: '',
      source: '手动录入',
      createdAt: new Date().toISOString().slice(0, 10),
      lastContact: '刚刚',
      totalCalls: 0,
      totalValue: 0,
      notes: '',
      riskLevel: 'medium',
    },
  )

  const updateField = (key: keyof Contact, value: string | number | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  // ---- Conditional field visibility based on stage ----
  const showValueField = form.stage !== '获客' // Value only visible after acquisition
  const showRenewalField = form.stage === '服务' || form.stage === '忠诚' // Renewal notes for service/loyalty
  const showRiskField = form.stage !== '忠诚' // Risk not relevant for loyal customers

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ animation: 'fade-in 0.2s ease-out both' }}
    >
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border p-6"
        style={{
          background: 'rgba(10,10,10,0.96)',
          borderColor: 'rgba(0,240,255,0.3)',
          boxShadow: '0 0 40px rgba(0,240,255,0.15)',
          scrollbarWidth: 'none',
          animation: 'spring-in 0.4s var(--spring-easing) both',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-sm tracking-wider"
            style={{ color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.5)' }}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            {isEdit ? t('ndb.editContact') : t('ndb.addContact')}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-white/30" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">姓名 *</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
                placeholder="联系人姓名"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">{t('ndb.phone')} *</label>
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
                placeholder="138-0000-0000"
              />
            </div>
          </div>

          {/* Email & Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">{t('ndb.email')}</label>
              <input
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">公司</label>
              <input
                value={form.company}
                onChange={(e) => updateField('company', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
                placeholder="公司名称"
              />
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="text-[10px] text-white/30 mb-2 block">生命周期阶段</label>
            <div className="flex gap-2">
              {(['获客', '转化', '成交', '服务', '忠诚'] as const).map((stage) => {
                const meta = STAGE_META[stage]
                const active = form.stage === stage
                return (
                  <button
                    key={stage}
                    onClick={() => updateField('stage', stage)}
                    className="flex-1 py-2 rounded-xl text-[11px] transition-all duration-300 border"
                    style={{
                      background: active ? `${meta.color}15` : 'rgba(255,255,255,0.02)',
                      borderColor: active ? `${meta.color}50` : 'rgba(255,255,255,0.06)',
                      color: active ? meta.color : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {stage}
                  </button>
                )
              })}
            </div>
            {/* Conditional hint */}
            <p className="text-[9px] text-white/15 mt-1.5 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-[#00ffcc]/40" />
              {t('ndb.formCondition')}: {t('ndb.whenStage')} "{form.stage}" →{' '}
              {showValueField ? '价值字��可见' : '价值字段隐藏'}
            </p>
          </div>

          {/* Conditional: Value (hidden for 获客) */}
          {showValueField && (
            <div style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}>
              <label className="text-[10px] text-white/30 mb-1 block">{t('ndb.value')} (¥)</label>
              <input
                type="number"
                value={form.totalValue}
                onChange={(e) => updateField('totalValue', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
              />
            </div>
          )}

          {/* Conditional: Risk (hidden for 忠诚) */}
          {showRiskField && (
            <div style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}>
              <label className="text-[10px] text-white/30 mb-2 block">{t('ndb.risk')}</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((r) => {
                  const active = form.riskLevel === r
                  const color = r === 'low' ? '#00ffc8' : r === 'medium' ? '#00ffcc' : '#005f73'
                  const label =
                    r === 'low'
                      ? t('ndb.riskLow')
                      : r === 'medium'
                        ? t('ndb.riskMedium')
                        : t('ndb.riskHigh')
                  return (
                    <button
                      key={r}
                      onClick={() => updateField('riskLevel', r)}
                      className="flex-1 py-1.5 rounded-xl text-[10px] transition-all border"
                      style={{
                        background: active ? `${color}15` : 'rgba(255,255,255,0.02)',
                        borderColor: active ? `${color}40` : 'rgba(255,255,255,0.06)',
                        color: active ? color : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-[10px] text-white/30 mb-2 block">标签</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map((tag) => {
                const active = form.tags.includes(tag)
                const color = TAG_COLORS[tag] || '#00f0ff'
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-2.5 py-1 rounded-full text-[10px] transition-all duration-200 border"
                    style={{
                      background: active ? `${color}20` : 'transparent',
                      borderColor: active ? `${color}50` : 'rgba(255,255,255,0.08)',
                      color: active ? color : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {active && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] text-white/30 mb-1 block">{t('ndb.notes')}</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none resize-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,240,255,0.15)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
              placeholder="客户备注信息…"
            />
          </div>

          {/* Conditional: Renewal notes for service/loyalty */}
          {showRenewalField && (
            <div style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}>
              <label className="text-[10px] text-[#00ffc8]/60 mb-1 block flex items-center gap-1">
                <Repeat className="w-3 h-3" /> 续约/服务备注 (仅服务/忠诚阶段)
              </label>
              <input
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(0,255,200,0.04)',
                  border: '1px solid rgba(0,255,200,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,255,200,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,255,200,0.15)')}
                placeholder="续约周期、服务等级…"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-3 mt-6 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-white/40 transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => {
              if (form.name && form.phone) onSave(form)
            }}
            className="px-5 py-2 rounded-xl text-xs transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,212,255,0.2))',
              border: '1px solid rgba(0,240,255,0.4)',
              color: '#00f0ff',
              boxShadow: '0 0 12px rgba(0,240,255,0.2)',
              opacity: form.name && form.phone ? 1 : 0.4,
            }}
          >
            <Check className="w-3.5 h-3.5 inline mr-1" />
            {isEdit ? t('common.save') : t('ndb.addContact')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Recycle Bin Panel (deleted contacts recovery)
// ===========================================================
function RecycleBinPanel({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const { deletedContacts, recoverContact, recoverAllContacts, clearDeletedContacts } =
    useContacts()

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ animation: 'fade-in 0.2s ease-out both' }}
    >
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg max-h-[70vh] overflow-y-auto rounded-2xl border p-6"
        style={{
          background: 'rgba(10,10,10,0.96)',
          borderColor: 'rgba(0,95,115,0.3)',
          boxShadow: '0 0 40px rgba(0,95,115,0.15)',
          scrollbarWidth: 'none',
          animation: 'spring-in 0.4s var(--spring-easing) both',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="text-sm tracking-wider flex items-center gap-2"
            style={{ color: '#005f73', textShadow: '0 0 10px rgba(0,95,115,0.5)' }}
          >
            <Trash2 className="w-4 h-4" />
            {t('ndb.deletedContacts')}
            <span className="text-[10px] text-white/20 ml-1">({deletedContacts.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            {deletedContacts.length > 0 && (
              <div className="contents">
                <button
                  onClick={recoverAllContacts}
                  className="text-[10px] px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: 'rgba(0,255,200,0.08)',
                    border: '1px solid rgba(0,255,200,0.2)',
                    color: '#00ffc8',
                  }}
                >
                  <Undo2 className="w-3 h-3 inline mr-1" />
                  {t('ndb.recoverAll')}
                </button>
                <button
                  onClick={clearDeletedContacts}
                  className="text-[10px] px-2.5 py-1 rounded-lg transition-all"
                  style={{
                    background: 'rgba(0,95,115,0.08)',
                    border: '1px solid rgba(0,95,115,0.2)',
                    color: '#005f73',
                  }}
                >
                  {t('ndb.clearDeleted')}
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-white/30" />
            </button>
          </div>
        </div>

        {deletedContacts.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">{t('ndb.noDeleted')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {deletedContacts.map((d, i) => {
              const sm = STAGE_META[d.contact.stage]
              return (
                <div
                  key={d.contact.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.04)',
                    animation: `spring-in 0.3s var(--spring-easing) ${i * 0.03}s both`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${sm?.color || '#00f0ff'}15`,
                      border: `1px solid ${sm?.color || '#00f0ff'}25`,
                    }}
                  >
                    <span className="text-[11px] text-white/70">{d.contact.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60 truncate">{d.contact.name}</p>
                    <p className="text-[9px] text-white/20">
                      {d.contact.company} · {t('ndb.deletedAt')}{' '}
                      {new Date(d.deletedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => recoverContact(d.contact.id)}
                    className="text-[10px] px-2.5 py-1 rounded-lg transition-all"
                    style={{
                      background: 'rgba(0,255,200,0.08)',
                      border: '1px solid rgba(0,255,200,0.2)',
                      color: '#00ffc8',
                    }}
                  >
                    <Undo2 className="w-3 h-3 inline mr-1" />
                    {t('ndb.recover')}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Number Database Hub — full-featured CRM center.
 * Provides 8 tabbed views: Overview, Contacts, Analytics, Collaboration,
 * Customer Value, Service Operations, Knowledge Base, and Performance Monitor.
 * Integrates with {@link ContactsContext} for shared contact state.
 */
export function NumberDatabasePage() {
  const { t } = useI18n()
  const {
    contacts,
    deletedContacts,
    addContact,
    updateContact,
    deleteContact,
    toggleStar,
    setContacts,
  } = useContacts()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [showRecycleBin, setShowRecycleBin] = useState(false)

  const handleSaveContact = useCallback(
    (c: Contact) => {
      if (editContact) {
        updateContact(c.id, c)
      } else {
        addContact(c)
      }
      setShowAddModal(false)
      setEditContact(null)
    },
    [editContact, updateContact, addContact],
  )

  // Tab label/sublabel via i18n
  const tabLabels: Record<TabId, { label: string; sublabel: string }> = {
    overview: { label: t('ndb.tab.overview'), sublabel: t('ndb.tab.overviewSub') },
    contacts: { label: t('ndb.tab.contacts'), sublabel: t('ndb.tab.contactsSub') },
    analytics: { label: t('ndb.tab.analytics'), sublabel: t('ndb.tab.analyticsSub') },
    collaboration: { label: t('ndb.tab.collaboration'), sublabel: t('ndb.tab.collaborationSub') },
    value: { label: t('ndb.tab.value'), sublabel: t('ndb.tab.valueSub') },
    service: { label: t('ndb.tab.service'), sublabel: t('ndb.tab.serviceSub') },
    knowledge: { label: t('ndb.tab.knowledge'), sublabel: t('ndb.tab.knowledgeSub') },
    monitor: { label: t('ndb.tab.monitor'), sublabel: t('ndb.tab.monitorSub') },
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Page Header */}
      <div className="shrink-0 px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="tracking-wider flex items-center gap-3"
              style={{ color: '#00f0ff', textShadow: '0 0 15px rgba(0,240,255,0.5)' }}
            >
              <Database className="w-6 h-6" />
              {t('ndb.title')}
            </h2>
            <p className="text-xs text-white/25 mt-1 tracking-wider">{t('ndb.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Recycle Bin */}
            <button
              onClick={() => setShowRecycleBin(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all relative"
              style={{
                background: 'rgba(0,95,115,0.06)',
                border: '1px solid rgba(0,95,115,0.2)',
                color: '#005f73',
              }}
            >
              <Trash2 className="w-3 h-3" />
              {deletedContacts.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[7px] flex items-center justify-center"
                  style={{ background: '#005f73', color: 'white' }}
                >
                  {deletedContacts.length}
                </span>
              )}
            </button>
            <button
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all"
              style={{
                background: 'rgba(0,240,255,0.06)',
                border: '1px solid rgba(0,240,255,0.2)',
                color: '#00f0ff',
              }}
            >
              <Download className="w-3 h-3" /> {t('ndb.export')}
            </button>
            <button
              onClick={() => {
                setEditContact(null)
                setShowAddModal(true)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.15))',
                border: '1px solid rgba(0,240,255,0.3)',
                color: '#00f0ff',
                boxShadow: '0 0 12px rgba(0,240,255,0.15)',
              }}
            >
              <Plus className="w-3 h-3" /> {t('ndb.addContact')}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            const labels = tabLabels[tab.id]
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-300 border shrink-0"
                style={{
                  background: active ? `${tab.color}12` : 'transparent',
                  borderColor: active ? `${tab.color}40` : 'rgba(255,255,255,0.04)',
                  color: active ? tab.color : 'rgba(255,255,255,0.3)',
                  boxShadow: active ? `0 0 12px ${tab.color}20` : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {labels.label}
                <span className="text-[8px] opacity-40 hidden lg:inline">{labels.sublabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'none' }}>
        {activeTab === 'overview' && <OverviewTab contacts={contacts} />}
        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            setContacts={setContacts}
            onEdit={(c) => {
              setEditContact(c)
              setShowAddModal(true)
            }}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'collaboration' && <CollaborationTab />}
        {activeTab === 'value' && <ValueTab contacts={contacts} />}
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'knowledge' && <KnowledgeTab />}
        {activeTab === 'monitor' && <MonitorTab />}
      </div>

      {/* Modals */}
      {showAddModal && (
        <ContactFormModal
          contact={editContact}
          onSave={handleSaveContact}
          onClose={() => {
            setShowAddModal(false)
            setEditContact(null)
          }}
        />
      )}
      {showRecycleBin && <RecycleBinPanel onClose={() => setShowRecycleBin(false)} />}
    </div>
  )
}
