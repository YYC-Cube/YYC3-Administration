import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  Brain,
  Calendar,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  Edit3,
  Eye,
  FileText,
  FolderKanban,
  Lightbulb,
  MessageSquare,
  Palette,
  PenTool,
  Plus,
  Rocket,
  Search,
  Share2,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  Type,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 智创协同 — Creative Collaboration Platform
// Guidelines-01.md Full Implementation
// 5 Tabs: 创意项目 · 创意库 · 团队协作 · AI工具 · 数据分析
// ==========================================

// ---------- Animated counter ----------
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number>(0)
  useEffect(() => {
    const start = ref.current
    const diff = value - start
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(animate)
      else ref.current = value
    }
    requestAnimationFrame(animate)
  }, [value, duration])
  return <>{display.toLocaleString()}</>
}

// ---------- Progress bar ----------
function ProgressBar({
  value,
  color,
  tc,
}: {
  value: number
  color: string
  tc: ReturnType<typeof useThemeColors>
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: tc.alpha(color, 0.1) }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: `linear-gradient(90deg, ${tc.alpha(color, 0.6)}, ${color})`,
            boxShadow: `0 0 6px ${tc.alpha(color, 0.3)}`,
          }}
        />
      </div>
      <span className="text-[11px] w-8 text-right" style={{ color }}>
        {value}%
      </span>
    </div>
  )
}

// ---------- Avatar circle ----------
function AvatarCircle({
  name,
  color,
  size = 32,
  online,
}: {
  name: string
  color: string
  size?: number
  online?: boolean
}) {
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          fontSize: `${Math.round(size * 0.38)}px`,
          fontWeight: 500,
        }}
      >
        {name.slice(0, 1)}
      </div>
      {online !== undefined && (
        <div
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2"
          style={{
            width: Math.round(size * 0.3),
            height: Math.round(size * 0.3),
            background: online ? '#22c55e' : '#6b7280',
            borderColor: 'rgba(10,15,10,0.9)',
            boxShadow: online ? '0 0 4px #22c55e' : 'none',
          }}
        />
      )}
    </div>
  )
}

// ---------- Tag badge ----------
function Tag({
  label,
  color,
  tc,
}: {
  label: string
  color: string
  tc: ReturnType<typeof useThemeColors>
}) {
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-md text-[10px]"
      style={{
        background: tc.alpha(color, 0.08),
        color,
        border: `1px solid ${tc.alpha(color, 0.15)}`,
      }}
    >
      {label}
    </span>
  )
}

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_PROJECTS = [
  {
    id: 'p1',
    title: '春季家居营销方案',
    desc: '结合AI分析用户偏好，制定个性化营销策略',
    status: '进行中' as const,
    statusColor: '#22c55e',
    aiAssisted: true,
    progress: 75,
    deadline: '2024-01-15',
    team: [
      { name: '张', color: '#8b5cf6' },
      { name: '李', color: '#ec4899' },
      { name: '王', color: '#06b6d4' },
    ],
    tags: ['营销', 'AI辅助', '家居'],
  },
  {
    id: 'p2',
    title: '品牌视觉升级项目',
    desc: '全新品牌形象设计与VI系统建设',
    status: '评审中' as const,
    statusColor: '#eab308',
    aiAssisted: false,
    progress: 90,
    deadline: '2024-01-20',
    team: [
      { name: '陈', color: '#f97316' },
      { name: '刘', color: '#14b8a6' },
    ],
    tags: ['设计', '品牌', '视觉'],
  },
  {
    id: 'p3',
    title: '智能客服话术优化',
    desc: '基于AI对话分析，优化客服响应效率',
    status: '规划中' as const,
    statusColor: '#3b82f6',
    aiAssisted: true,
    progress: 25,
    deadline: '2024-01-25',
    team: [
      { name: '王', color: '#8b5cf6' },
      { name: '李', color: '#ef4444' },
    ],
    tags: ['AI', '客服', '优化'],
  },
]

const MOCK_IDEAS = [
  {
    id: 'i1',
    title: 'AR家具试放功能',
    desc: '让客户通过手机AR技术在家中预览家具摆放效果',
    author: '张创新',
    authorColor: '#8b5cf6',
    category: '技术创新',
    categoryColor: '#22c55e',
    time: '2小时前',
    likes: 24,
    comments: 8,
    aiGenerated: false,
  },
  {
    id: 'i2',
    title: '智能家居搭配推荐',
    desc: '基于用户喜好和空间特点，AI推荐最佳家具搭配方案',
    author: 'AI助手',
    authorColor: '#3b82f6',
    category: 'AI应用',
    categoryColor: '#8b5cf6',
    time: '4小时前',
    likes: 18,
    comments: 5,
    aiGenerated: true,
  },
  {
    id: 'i3',
    title: '用户体验积分系统',
    desc: '设计游戏化积分系统，提升用户参与度和留存率',
    author: '李运营',
    authorColor: '#ec4899',
    category: '运营策略',
    categoryColor: '#f97316',
    time: '昨天',
    likes: 31,
    comments: 12,
    aiGenerated: false,
  },
  {
    id: 'i4',
    title: '多语言智能翻译',
    desc: 'AI实时翻译系统，支持全球化运营和多语种客服',
    author: 'AI助手',
    authorColor: '#3b82f6',
    category: 'AI应用',
    categoryColor: '#8b5cf6',
    time: '昨天',
    likes: 15,
    comments: 3,
    aiGenerated: true,
  },
]

const MOCK_TEAM = [
  { name: '张设计师', role: 'UI设计', color: '#8b5cf6', online: true },
  { name: '李文案', role: '内容策划', color: '#ec4899', online: true },
  { name: '王策划', role: '市场策划', color: '#06b6d4', online: true },
  { name: '陈美工', role: '视觉设计', color: '#f97316', online: true },
  { name: '刘总监', role: '创意总监', color: '#14b8a6', online: true },
]

const MOCK_ACTIVITIES = [
  {
    actor: '张设计师',
    actorColor: '#8b5cf6',
    action: '更新了春季营销方案的设计稿',
    time: '2分钟前',
  },
  { actor: '李文案', actorColor: '#ec4899', action: '提交了新的创意想法', time: '5分钟前' },
  { actor: 'AI助手', actorColor: '#3b82f6', action: '生成了3个新的营销创意', time: '10分钟前' },
  { actor: '王策划', actorColor: '#06b6d4', action: '完成了市场调研报告', time: '15分钟前' },
  { actor: '陈美工', actorColor: '#f97316', action: '上传了品牌VI手册初稿', time: '30分钟前' },
]

const MOCK_AI_TOOLS = [
  {
    id: 't1',
    title: 'AI创意生成器',
    desc: '基于行业趋势和用户数据，智能生成创意方案',
    icon: Sparkles,
    stat: '今日使用次数',
    statValue: '15次',
    statColor: '#8b5cf6',
    btnLabel: '开始创作',
    btnIcon: Sparkles,
    gradient: ['#8b5cf6', '#a855f7'],
  },
  {
    id: 't2',
    title: '智能设计助手',
    desc: 'AI辅助设计，自动生成配色方案和布局建议',
    icon: Palette,
    stat: '设计模板',
    statValue: '200+',
    statColor: '#ec4899',
    btnLabel: '开始设计',
    btnIcon: PenTool,
    gradient: ['#ec4899', '#f43f5e'],
  },
  {
    id: 't3',
    title: '智能文案生成',
    desc: '根据产品特点和目标用户，生成吸引人的营销文案',
    icon: Type,
    stat: '文案风格',
    statValue: '12种',
    statColor: '#3b82f6',
    btnLabel: '生成文案',
    btnIcon: FileText,
    gradient: ['#3b82f6', '#6366f1'],
  },
  {
    id: 't4',
    title: '市场趋势分析',
    desc: 'AI分析市场数据，预测行业趋势和用户需求',
    icon: TrendingUp,
    stat: '数据源',
    statValue: '实时更新',
    statColor: '#22c55e',
    btnLabel: '查看趋势',
    btnIcon: TrendingUp,
    gradient: ['#22c55e', '#10b981'],
  },
  {
    id: 't5',
    title: '创意评估器',
    desc: 'AI评估创意可行性，提供改进建议和风险分析',
    icon: ClipboardCheck,
    stat: '评估维度',
    statValue: '8个',
    statColor: '#f97316',
    btnLabel: '开始评估',
    btnIcon: CheckCircle,
    gradient: ['#f97316', '#ef4444'],
  },
  {
    id: 't6',
    title: '项目智能规划',
    desc: 'AI制定项目计划，优化资源配置和时间安排',
    icon: FolderKanban,
    stat: '成功率',
    statValue: '92%',
    statColor: '#06b6d4',
    btnLabel: '智能规划',
    btnIcon: Target,
    gradient: ['#06b6d4', '#0ea5e9'],
  },
]

// ==========================================
// TAB CONTENT COMPONENTS
// ==========================================

// ---------- Tab 1: 创意项目 ----------
function TabProjects({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(t('collab.allStatus'))

  return (
    <div style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}>
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索项目..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[12px] text-white/70 placeholder-white/20 outline-none transition-all"
            style={{
              background: tc.alpha(tc.primary, 0.03),
              border: `1px solid ${tc.alpha(tc.primary, 0.08)}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = tc.alpha(tc.primary, 0.3)
              e.currentTarget.style.boxShadow = `0 0 0 3px ${tc.alpha(tc.primary, 0.06)}`
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = tc.alpha(tc.primary, 0.08)
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] text-white/40 transition-all hover:text-white/60"
          style={{
            background: tc.alpha(tc.primary, 0.03),
            border: `1px solid ${tc.alpha(tc.primary, 0.08)}`,
          }}
          onClick={() =>
            setStatusFilter((s) =>
              s === '全部状态'
                ? '进行中'
                : s === '进行中'
                  ? '评审中'
                  : s === '评审中'
                    ? '规划中'
                    : '全部状态',
            )
          }
        >
          {statusFilter} <ChevronDown className="w-3 h-3" />
        </button>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] transition-all hover:-translate-y-0.5"
          onClick={() => {}}
          style={{
            background: `linear-gradient(135deg, ${tc.primary}, ${tc.secondary})`,
            color: '#fff',
            boxShadow: `0 4px 12px ${tc.alpha(tc.primary, 0.25)}`,
          }}
        >
          <Plus className="w-3.5 h-3.5" /> 新建项目
        </button>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MOCK_PROJECTS.map((project, idx) => (
          <NeonCard key={project.id} color={project.statusColor}>
            <div style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.06}s both` }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-[13px] text-white/80 truncate">{project.title}</h4>
                    {project.aiAssisted && <Tag label="AI辅助" color={tc.primary} tc={tc} />}
                    <Tag label={project.status} color={project.statusColor} tc={tc} />
                  </div>
                  <p className="text-[11px] text-white/25 leading-relaxed line-clamp-2">
                    {project.desc}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="my-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/25">{t('collab.progress')}</span>
                </div>
                <ProgressBar value={project.progress} color={project.statusColor} tc={tc} />
              </div>

              {/* Deadline + Team */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                  <Calendar className="w-3 h-3" />
                  {project.deadline}
                </div>
                <div className="flex -space-x-1.5">
                  {project.team.map((m, i) => (
                    <AvatarCircle key={i} name={m.name} color={m.color} size={22} />
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-[9px] text-white/25"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-3 pt-2"
                style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}
              >
                {[
                  { icon: Eye, label: '查看' },
                  { icon: Edit3, label: '编辑' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
                    onClick={() => {}}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
                <button
                  className="ml-auto text-white/15 hover:text-white/30 transition-colors"
                  onClick={() => {}}
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </NeonCard>
        ))}
      </div>
    </div>
  )
}

// ---------- Tab 2: 创意库 ----------
function TabIdeas({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  return (
    <div style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] text-white/60 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" style={{ color: tc.accent }} />
          {t('collab.ideas')}
        </h3>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] transition-all hover:-translate-y-0.5"
          onClick={() => {}}
          style={{
            background: `linear-gradient(135deg, ${tc.accent}, ${tc.primary})`,
            color: '#fff',
            boxShadow: `0 4px 12px ${tc.alpha(tc.accent, 0.25)}`,
          }}
        >
          <Plus className="w-3.5 h-3.5" /> {t('collab.submitIdea')}
        </button>
      </div>

      {/* Idea Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_IDEAS.map((idea, idx) => (
          <NeonCard key={idea.id} color={idea.categoryColor}>
            <div style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.06}s both` }}>
              {/* Title */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className="text-[13px] text-white/80">{idea.title}</h4>
                {idea.aiGenerated && (
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px]"
                    style={{
                      background: tc.alpha(tc.primary, 0.08),
                      color: tc.primary,
                      border: `1px solid ${tc.alpha(tc.primary, 0.15)}`,
                    }}
                  >
                    <Sparkles className="w-2.5 h-2.5" /> AI生成
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/25 leading-relaxed mb-3">{idea.desc}</p>

              {/* Author + Category + Time */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <AvatarCircle name={idea.author} color={idea.authorColor} size={20} />
                  <span className="text-[10px] text-white/30">{idea.author}</span>
                </div>
                <Tag label={idea.category} color={idea.categoryColor} tc={tc} />
                <span className="text-[10px] text-white/15 ml-auto">{idea.time}</span>
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-4 pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
              >
                <button
                  className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
                  onClick={() => {}}
                >
                  <ThumbsUp className="w-3 h-3" style={{ color: tc.primary }} />
                  <span style={{ color: tc.primary }}>{idea.likes}</span>
                </button>
                <button
                  className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
                  onClick={() => {}}
                >
                  <MessageSquare className="w-3 h-3" /> 评论
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    className="text-white/15 hover:text-white/30 transition-colors"
                    onClick={() => {}}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="text-white/15 hover:text-white/30 transition-colors"
                    onClick={() => {}}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </NeonCard>
        ))}
      </div>
    </div>
  )
}

// ---------- Tab 3: 团队协作 ----------
function TabTeam({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Online Team Members */}
      <NeonCard color={tc.secondary} hoverable={false}>
        <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" style={{ color: tc.secondary }} />
          {t('collab.onlineMembers')}
        </h3>
        <div className="space-y-1">
          {MOCK_TEAM.map((member, idx) => (
            <div
              key={member.name}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.02] cursor-pointer"
              style={{
                animation: `spring-in 0.3s var(--spring-easing) ${idx * 0.04}s both`,
                border: `1px solid transparent`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tc.alpha(member.color, 0.1)
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <AvatarCircle
                name={member.name}
                color={member.color}
                size={36}
                online={member.online}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-white/65 truncate">{member.name}</p>
                <p className="text-[10px]" style={{ color: '#22c55e' }}>
                  在线
                </p>
              </div>
              <button
                className="text-white/15 hover:text-white/30 transition-colors p-1.5 rounded-lg hover:bg-white/[0.03]"
                onClick={() => {}}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: '#22c55e', boxShadow: '0 0 4px #22c55e' }}
              />
            </div>
          ))}
        </div>
      </NeonCard>

      {/* Real-time Activity */}
      <NeonCard color={tc.primary} hoverable={false}>
        <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" style={{ color: tc.primary }} />
          {t('collab.realtimeActivity')}
        </h3>
        <div className="space-y-1">
          {MOCK_ACTIVITIES.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/[0.02]"
              style={{ animation: `spring-in 0.3s var(--spring-easing) ${idx * 0.04}s both` }}
            >
              <AvatarCircle name={activity.actor} color={activity.actorColor} size={32} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/45 leading-relaxed">
                  <span className="text-white/65">{activity.actor}</span> {activity.action}
                </p>
                <p className="text-[9px] text-white/15 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  )
}

// ---------- Tab 4: AI工具 ----------
function TabAITools({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {MOCK_AI_TOOLS.map((tool, idx) => {
        const Icon = tool.icon
        const BtnIcon = tool.btnIcon
        return (
          <NeonCard key={tool.id} color={tool.gradient[0]}>
            <div style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.05}s both` }}>
              {/* Icon + Title */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${tc.alpha(tool.gradient[0], 0.15)}, ${tc.alpha(tool.gradient[1], 0.08)})`,
                    border: `1px solid ${tc.alpha(tool.gradient[0], 0.2)}`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: tool.gradient[0] }} />
                </div>
                <h4 className="text-[13px] text-white/75">{tool.title}</h4>
              </div>

              {/* Description */}
              <p className="text-[11px] text-white/25 leading-relaxed mb-4">{tool.desc}</p>

              {/* Stat */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-white/20">{tool.stat}</span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{
                    background: tc.alpha(tool.statColor, 0.08),
                    color: tool.statColor,
                    border: `1px solid ${tc.alpha(tool.statColor, 0.15)}`,
                  }}
                >
                  {tool.statValue}
                </span>
              </div>

              {/* Action Button */}
              <button
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] text-white transition-all duration-300 hover:-translate-y-0.5"
                onClick={() => {}}
                style={{
                  background: `linear-gradient(135deg, ${tool.gradient[0]}, ${tool.gradient[1]})`,
                  boxShadow: `0 4px 12px ${tc.alpha(tool.gradient[0], 0.25)}`,
                }}
              >
                <BtnIcon className="w-3.5 h-3.5" />
                {tool.btnLabel}
              </button>
            </div>
          </NeonCard>
        )
      })}
    </div>
  )
}

// ---------- Tab 5: 数据分析 ----------
function TabAnalytics({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const metrics1 = [
    { label: t('collab.creativeAdoption'), value: 78, color: tc.primary },
    { label: t('collab.avgRating'), value: 92, display: '4.6/5.0', color: tc.secondary },
    { label: t('collab.implementationRate'), value: 85, color: tc.accent },
  ]
  const metrics2 = [
    { label: t('collab.onTimeRate'), value: 91, color: '#22c55e' },
    { label: t('collab.teamSatisfaction'), value: 96, display: '4.8/5.0', color: '#3b82f6' },
    { label: t('collab.commEfficiency'), value: 45, display: '+45%', color: '#8b5cf6' },
  ]
  const aiStats = [
    { label: t('collab.creativeGenEfficiency'), value: '40%', color: '#22c55e' },
    { label: t('collab.designTimeSaved'), value: '65%', color: '#3b82f6' },
    { label: t('collab.userSatisfaction'), value: '85%', color: '#8b5cf6' },
  ]

  return (
    <div className="space-y-4" style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}>
      {/* Two analytics panels side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Creative Performance */}
        <NeonCard color={tc.primary} hoverable={false}>
          <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4" style={{ color: tc.primary }} />
            {t('collab.creativeAnalytics')}
          </h3>
          <div className="space-y-4">
            {metrics1.map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-white/30">{m.label}</span>
                  <span className="text-[12px]" style={{ color: m.color }}>
                    {m.display || `${m.value}%`}
                  </span>
                </div>
                <ProgressBar value={m.value} color={m.color} tc={tc} />
              </div>
            ))}
          </div>
        </NeonCard>

        {/* Team Efficiency */}
        <NeonCard color={tc.secondary} hoverable={false}>
          <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-5">
            <Users className="w-4 h-4" style={{ color: tc.secondary }} />
            团队协作效率
          </h3>
          <div className="space-y-4">
            {metrics2.map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-white/30">{m.label}</span>
                  <span className="text-[12px]" style={{ color: m.color }}>
                    {m.display || `${m.value}%`}
                  </span>
                </div>
                <ProgressBar value={m.value} color={m.color} tc={tc} />
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      {/* AI Assistance Stats */}
      <NeonCard color={tc.primary} hoverable={false}>
        <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-5">
          <Brain className="w-4 h-4" style={{ color: tc.primary }} />
          AI辅助效果统计
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiStats.map((stat, i) => (
            <div
              key={i}
              className="text-center"
              style={{ animation: `spring-in 0.4s var(--spring-easing) ${i * 0.08}s both` }}
            >
              <p
                className="text-3xl mb-2"
                style={{
                  color: stat.color,
                  textShadow: `0 0 20px ${tc.alpha(stat.color, 0.4)}`,
                }}
              >
                {stat.value}
              </p>
              <p className="text-[11px] text-white/25">{stat.label}</p>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  )
}

// ==========================================
// Main Page
// ==========================================

type TabKey = 'projects' | 'ideas' | 'team' | 'tools' | 'analytics'

const TAB_CONFIG: { key: TabKey; label: string }[] = [
  { key: 'projects', label: '创意项目' },
  { key: 'ideas', label: '创意库' },
  { key: 'team', label: '团队协作' },
  { key: 'tools', label: 'AI工具' },
  { key: 'analytics', label: '数据分析' },
]

export function CollabCreationPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<TabKey>('projects')

  // Overview cards data
  const overviewCards = useMemo(
    () => [
      {
        title: '活跃项目',
        value: 12,
        trend: '+15% 本月',
        trendUp: true,
        icon: Rocket,
        color: '#8b5cf6',
      },
      {
        title: '创意想法',
        value: 156,
        trend: '+8 今日新增',
        trendUp: true,
        icon: Lightbulb,
        color: '#22c55e',
      },
      {
        title: '协作成员',
        value: 28,
        trend: '15人在线',
        trendUp: null,
        icon: Users,
        color: '#3b82f6',
      },
      {
        title: 'AI辅助率',
        value: 85,
        isPercent: true,
        trend: '效率提升40%',
        trendUp: true,
        icon: Brain,
        color: '#22c55e',
      },
    ],
    [],
  )

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* ===== HEADER ===== */}
      <div className="px-6 pt-6 pb-4">
        {/* Top gradient accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${tc.primary}, #8b5cf6, ${tc.accent}, ${tc.secondary})`,
            opacity: 0.6,
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: tc.alpha('#8b5cf6', 0.1),
                border: `1px solid ${tc.alpha('#8b5cf6', 0.2)}`,
              }}
            >
              <Lightbulb className="w-4.5 h-4.5" style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h1
                className="tracking-wider flex items-center gap-2"
                style={{
                  color: tc.primary,
                  textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
                }}
              >
                {t('collab.title')}
              </h1>
              <p className="text-[10px] text-white/20 tracking-wider">{t('collab.desc')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] transition-all hover:-translate-y-0.5"
              onClick={() => {}}
              style={{
                background: tc.alpha(tc.primary, 0.06),
                border: `1px solid ${tc.alpha(tc.primary, 0.15)}`,
                color: tc.primary,
              }}
            >
              <Brain className="w-3.5 h-3.5" /> AI头脑风暴
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] text-white transition-all hover:-translate-y-0.5"
              onClick={() => {}}
              style={{
                background: `linear-gradient(135deg, ${tc.primary}, ${tc.secondary})`,
                boxShadow: `0 4px 12px ${tc.alpha(tc.primary, 0.25)}`,
              }}
            >
              <Plus className="w-3.5 h-3.5" /> 新建项目
            </button>
          </div>
        </div>
      </div>

      {/* ===== OVERVIEW STAT CARDS ===== */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {overviewCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <NeonCard key={idx} color={card.color}>
                <div
                  style={{ animation: `spring-in 0.4s var(--spring-easing) ${idx * 0.06}s both` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white/35">{card.title}</span>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: tc.alpha(card.color, 0.08),
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: card.color, opacity: 0.7 }} />
                    </div>
                  </div>
                  <p
                    className="text-2xl mb-1"
                    style={{
                      color: card.color,
                      textShadow: `0 0 15px ${tc.alpha(card.color, 0.4)}`,
                    }}
                  >
                    <AnimatedNumber value={card.value} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(card as any).isPercent && <span className="text-lg">%</span>}
                  </p>
                  <div className="flex items-center gap-1">
                    {card.trendUp !== null &&
                      (card.trendUp ? (
                        <ArrowUpRight className="w-3 h-3" style={{ color: '#22c55e' }} />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" style={{ color: '#ef4444' }} />
                      ))}
                    {card.trendUp === null && <Users className="w-3 h-3 text-white/15" />}
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          card.trendUp === true
                            ? '#22c55e'
                            : card.trendUp === false
                              ? '#ef4444'
                              : 'rgba(255,255,255,0.2)',
                      }}
                    >
                      {card.trend}
                    </span>
                  </div>
                </div>
              </NeonCard>
            )
          })}
        </div>
      </div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="px-6 mb-5">
        <div
          className="flex items-center gap-0 rounded-2xl p-1"
          style={{
            background: tc.alpha(tc.primary, 0.03),
            border: `1px solid ${tc.alpha(tc.primary, 0.06)}`,
          }}
        >
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-2 rounded-xl text-[12px] transition-all duration-300 relative"
                style={{
                  background: isActive ? tc.alpha(tc.primary, 0.08) : 'transparent',
                  color: isActive ? tc.primary : 'rgba(255,255,255,0.3)',
                  fontWeight: isActive ? 500 : 400,
                  boxShadow: isActive ? `0 0 12px ${tc.alpha(tc.primary, 0.08)}` : 'none',
                }}
              >
                {tab.label}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{
                      background: tc.primary,
                      boxShadow: `0 0 6px ${tc.alpha(tc.primary, 0.5)}`,
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="px-6 pb-8">
        {activeTab === 'projects' && <TabProjects tc={tc} />}
        {activeTab === 'ideas' && <TabIdeas tc={tc} />}
        {activeTab === 'team' && <TabTeam tc={tc} />}
        {activeTab === 'tools' && <TabAITools tc={tc} />}
        {activeTab === 'analytics' && <TabAnalytics tc={tc} />}
      </div>
    </div>
  )
}
