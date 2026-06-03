import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Globe,
  Mail,
  MapPin,
  Save,
  Settings,
  Shield,
  Star,
  Target,
  TrendingUp,
  UserCircle,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { useApp } from './app-context'
import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 个人中心 — Profile & Personal Center
// Phase 2A: 用户档案 · 偏好设置 · 使用统计
// ==========================================

const PROFILE_STORAGE_KEY = 'yyc3_user_profile'

/** User profile data stored in localStorage. */
interface UserProfile {
  name: string
  email: string
  role: string
  department: string
  location: string
  website: string
  bio: string
  avatar: string
  joinDate: string
}

const defaultProfile: UserProfile = {
  name: '管理员',
  email: 'admin@yyc3.ai',
  role: '系统管理员',
  department: 'AI 智能营销部',
  location: '中国 · 上海',
  website: 'https://yyc3.ai',
  bio: 'YYC³ 言语智能系统管理员，负责 AI 营销自动化终端的运营与管理。',
  avatar: '',
  joinDate: '2024-06-15',
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...defaultProfile }
}

function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch {
    /* ignore */
  }
}

/**
 * Personal Center / Profile page.
 * Displays user profile card, usage statistics, recent activity,
 * and system preferences with editable profile fields.
 */
export function ProfilePage() {
  const { t: _t } = useI18n()
  const { recentActivities, notifications, setActivePage, theme } = useApp()
  const tc = useThemeColors()
  const [profile, setProfile] = useState<UserProfile>(loadProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<UserProfile>(profile)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'stats' | 'preferences'>(
    'overview',
  )

  // Usage stats from localStorage
  const usageStats = useMemo(() => {
    let formCount = 0
    try {
      const raw = localStorage.getItem('yyc3_form_submissions')
      if (raw) formCount = JSON.parse(raw).length
    } catch {
      /* */
    }

    return {
      daysActive: Math.floor((Date.now() - new Date(profile.joinDate).getTime()) / 86400000),
      totalActivities: recentActivities.length,
      totalNotifications: notifications.length,
      formSubmissions: formCount,
      loginStreak: 12,
      aiInteractions: 1892,
    }
  }, [profile.joinDate, recentActivities.length, notifications.length])

  const handleSave = useCallback(() => {
    setProfile(editForm)
    saveProfile(editForm)
    setIsEditing(false)
  }, [editForm])

  const handleCancel = useCallback(() => {
    setEditForm(profile)
    setIsEditing(false)
  }, [profile])

  const tabs = [
    { id: 'overview' as const, label: '概览', icon: UserCircle, color: tc.primary },
    { id: 'activity' as const, label: '活动', icon: Activity, color: tc.success },
    { id: 'stats' as const, label: '统计', icon: BarChart3, color: tc.secondary },
    { id: 'preferences' as const, label: '偏好', icon: Settings, color: tc.accent },
  ]

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="tracking-wider flex items-center gap-3"
            style={{ color: tc.secondary, textShadow: `0 0 15px ${tc.alpha(tc.secondary, 0.5)}` }}
          >
            <UserCircle className="w-6 h-6" />
            个人中心
          </h2>
          <p className="text-xs mt-1 tracking-wider" style={{ color: tc.textMuted }}>
            Personal Center — 用户档案与使用统计
          </p>
        </div>
      </div>

      {/* Profile Card + Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Profile Card */}
        <NeonCard color={tc.secondary} hoverable={false}>
          <div className="text-center mb-4">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2 relative"
              style={{
                background: tc.isCyberpunk
                  ? `linear-gradient(135deg, ${tc.alpha(tc.secondary, 0.15)}, ${tc.alpha(tc.primary, 0.15)})`
                  : `linear-gradient(135deg, ${tc.alpha(tc.secondary, 0.15)}, ${tc.alpha(tc.accent, 0.1)})`,
                borderColor: tc.alpha(tc.secondary, 0.4),
                boxShadow: `0 0 25px ${tc.alpha(tc.secondary, 0.2)}, inset 0 0 15px ${tc.alpha(tc.secondary, 0.1)}`,
              }}
            >
              <span className="text-2xl" style={{ color: tc.textSecondary }}>
                {profile.name[0]}
              </span>
              {/* Online indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  background: tc.statusOnline,
                  borderColor: tc.bgBase,
                  boxShadow: tc.statusOnlineGlow,
                }}
              >
                <CheckCircle2 className="w-3 h-3" style={{ color: tc.bgBase }} />
              </div>
            </div>
            <h3 style={{ color: tc.textPrimary }} className="mb-0.5">
              {profile.name}
            </h3>
            <p className="text-xs mb-2" style={{ color: tc.textMuted }}>
              {profile.email}
            </p>
            <span
              className="inline-block text-[10px] px-3 py-1 rounded-full"
              style={{
                background: tc.alpha(tc.secondary, 0.1),
                color: tc.secondary,
                border: `1px solid ${tc.alpha(tc.secondary, 0.25)}`,
              }}
            >
              {profile.role}
            </span>
          </div>

          <div className="space-y-2.5 pt-3 border-t" style={{ borderColor: tc.borderSubtle }}>
            <InfoRow
              icon={Briefcase}
              label="部门"
              value={profile.department}
              color={tc.secondary}
            />
            <InfoRow icon={MapPin} label="位置" value={profile.location} color={tc.primary} />
            <InfoRow icon={Globe} label="网站" value={profile.website} color={tc.accent} />
            <InfoRow
              icon={Clock}
              label="加入"
              value={formatDate(profile.joinDate)}
              color={tc.success}
            />
          </div>

          <button
            onClick={() => {
              setIsEditing(true)
              setEditForm(profile)
            }}
            className="w-full mt-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-80"
            style={{
              background: tc.alpha(tc.secondary, 0.08),
              border: `1px solid ${tc.alpha(tc.secondary, 0.25)}`,
              color: tc.secondary,
            }}
          >
            <Edit3 className="w-3 h-3" /> 编辑资料
          </button>
        </NeonCard>

        {/* Quick Stats */}
        <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: '活跃天数',
              value: `${usageStats.daysActive}`,
              icon: Clock,
              color: tc.primary,
              sub: '天',
            },
            {
              label: '连续登录',
              value: `${usageStats.loginStreak}`,
              icon: Zap,
              color: tc.success,
              sub: '天',
            },
            {
              label: 'AI 交互',
              value: `${usageStats.aiInteractions.toLocaleString()}`,
              icon: Brain,
              color: tc.secondary,
              sub: '次',
            },
            {
              label: '表单提交',
              value: `${usageStats.formSubmissions}`,
              icon: Target,
              color: tc.accent,
              sub: '份',
            },
            {
              label: '活动记录',
              value: `${usageStats.totalActivities}`,
              icon: Activity,
              color: tc.highlight,
              sub: '条',
            },
            {
              label: '系统通知',
              value: `${usageStats.totalNotifications}`,
              icon: Bell,
              color: tc.muted,
              sub: '条',
            },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <NeonCard key={i} color={stat.color}>
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider mb-1"
                      style={{ color: tc.textMuted }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="text-xl"
                      style={{
                        color: stat.color,
                        textShadow: `0 0 10px ${tc.alpha(stat.color, 0.5)}`,
                      }}
                    >
                      {stat.value}
                      <span className="text-xs ml-1" style={{ color: tc.textMuted }}>
                        {stat.sub}
                      </span>
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: tc.alpha(stat.color, 0.1),
                      border: `1px solid ${tc.alpha(stat.color, 0.2)}`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: tc.alpha(stat.color, 0.8) }} />
                  </div>
                </div>
              </NeonCard>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-all duration-300"
              style={{
                background: active ? tc.alpha(tab.color, 0.1) : 'transparent',
                border: `1px solid ${active ? tc.alpha(tab.color, 0.3) : 'transparent'}`,
                color: active ? tab.color : tc.navInactiveText,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div
          className="grid grid-cols-1 xl:grid-cols-2 gap-5"
          style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
        >
          {/* Bio Card */}
          <NeonCard color={tc.secondary} hoverable={false}>
            <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
              个人简介 · Bio
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: tc.textSecondary }}>
              {profile.bio}
            </p>
          </NeonCard>

          {/* Skills/Badges */}
          <NeonCard color={tc.success} hoverable={false}>
            <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
              成就徽章 · Achievements
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: 'AI 先锋',
                  desc: '首次使用 AI 工具',
                  icon: Brain,
                  color: tc.primary,
                  unlocked: true,
                },
                {
                  label: '数据大师',
                  desc: '提交 50+ 表单',
                  icon: BarChart3,
                  color: tc.secondary,
                  unlocked: usageStats.formSubmissions >= 5,
                },
                {
                  label: '社交达人',
                  desc: '管理 100+ 客户',
                  icon: Users,
                  color: tc.accent,
                  unlocked: true,
                },
                {
                  label: '效率之星',
                  desc: '连续登录 7 天',
                  icon: Star,
                  color: tc.success,
                  unlocked: usageStats.loginStreak >= 7,
                },
                {
                  label: '安全卫士',
                  desc: '完成安全认证',
                  icon: Shield,
                  color: tc.highlight,
                  unlocked: true,
                },
                {
                  label: '趋势猎手',
                  desc: '查看 100+ 洞察',
                  icon: TrendingUp,
                  color: tc.muted,
                  unlocked: true,
                },
              ].map((badge, i) => {
                const Icon = badge.icon
                return (
                  <div
                    key={i}
                    className="rounded-xl p-3 border transition-all duration-300"
                    style={{
                      background: badge.unlocked
                        ? tc.alpha(badge.color, 0.05)
                        : tc.alpha(tc.textMuted, 0.01),
                      borderColor: badge.unlocked ? tc.alpha(badge.color, 0.2) : tc.borderSubtle,
                      opacity: badge.unlocked ? 1 : 0.4,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: badge.unlocked ? badge.color : tc.textMuted }}
                      />
                      <span
                        className="text-[10px]"
                        style={{ color: badge.unlocked ? badge.color : tc.textMuted }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[9px]" style={{ color: tc.textMuted }}>
                      {badge.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </NeonCard>

          {/* Quick Actions */}
          <NeonCard color={tc.primary} hoverable={false} className="xl:col-span-2">
            <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
              快捷操作 · Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: '数据驾驶舱',
                  icon: BarChart3,
                  color: tc.primary,
                  page: 'dashboard' as const,
                },
                { label: 'AI 聊天', icon: Brain, color: tc.secondary, page: 'chat' as const },
                { label: '客户管理', icon: Users, color: tc.accent, page: 'clm' as const },
                { label: '系统设置', icon: Settings, color: tc.muted, page: 'settings' as const },
              ].map((action, i) => {
                const Icon = action.icon
                return (
                  <button
                    key={i}
                    onClick={() => setActivePage(action.page)}
                    className="rounded-xl p-3 border flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 text-left"
                    style={{
                      background: tc.alpha(action.color, 0.05),
                      borderColor: tc.alpha(action.color, 0.15),
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: tc.alpha(action.color, 0.12),
                        border: `1px solid ${tc.alpha(action.color, 0.25)}`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: action.color }} />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs" style={{ color: tc.textSecondary }}>
                        {action.label}
                      </span>
                    </div>
                    <ChevronRight className="w-3 h-3" style={{ color: tc.textMuted }} />
                  </button>
                )
              })}
            </div>
          </NeonCard>
        </div>
      )}

      {activeTab === 'activity' && (
        <NeonCard color={tc.success} hoverable={false}>
          <h3 className="text-xs uppercase tracking-wider mb-4" style={{ color: tc.textMuted }}>
            最近活动 · Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 15).map((act, i) => (
              <div
                key={act.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200"
                style={{
                  background: tc.alpha(tc.bgBase, 0.3),
                  borderColor: tc.borderSubtle,
                  animation: `spring-in 0.3s var(--spring-easing) ${i * 0.03}s both`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: act.color, boxShadow: `0 0 4px ${act.color}` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: tc.textSecondary }}>
                    {act.action}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: tc.textMuted }}>
                    {act.target}
                  </p>
                </div>
                <span className="text-[9px] shrink-0" style={{ color: tc.textMuted }}>
                  {formatTimeAgo(act.timestamp)}
                </span>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: tc.textMuted }} />
                <p className="text-xs" style={{ color: tc.textMuted }}>
                  暂无活动记录
                </p>
              </div>
            )}
          </div>
        </NeonCard>
      )}

      {activeTab === 'stats' && (
        <div
          className="grid grid-cols-1 xl:grid-cols-2 gap-5"
          style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
        >
          <NeonCard color={tc.primary} hoverable={false}>
            <h3 className="text-xs uppercase tracking-wider mb-4" style={{ color: tc.textMuted }}>
              使用频率 · Usage Frequency
            </h3>
            <div className="space-y-3">
              {[
                { label: '数据驾驶舱', pct: 85, color: tc.primary },
                { label: 'AI 聊天', pct: 72, color: tc.secondary },
                { label: '客户管理', pct: 64, color: tc.accent },
                { label: 'AI 呼叫', pct: 58, color: tc.success },
                { label: '智能表单', pct: 45, color: tc.highlight },
                { label: '数据洞察', pct: 38, color: tc.muted },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px]" style={{ color: tc.textMuted }}>
                      {item.label}
                    </span>
                    <span className="text-[10px]" style={{ color: item.color }}>
                      {item.pct}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ background: tc.alpha(tc.textMuted, 0.05) }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.pct}%`,
                        background: tc.isCyberpunk
                          ? `linear-gradient(90deg, ${tc.alpha(item.color, 0.6)}, ${item.color})`
                          : `linear-gradient(90deg, ${tc.alpha(item.color, 0.7)}, ${item.color})`,
                        boxShadow: `0 0 4px ${tc.alpha(item.color, 0.3)}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>

          <NeonCard color={tc.secondary} hoverable={false}>
            <h3 className="text-xs uppercase tracking-wider mb-4" style={{ color: tc.textMuted }}>
              效能指标 · Performance
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: '响应效率',
                  value: '98.2%',
                  desc: '平均响应时间 < 2s',
                  color: tc.success,
                  icon: Zap,
                },
                {
                  label: '任务完成率',
                  value: '94.7%',
                  desc: '本月任务完成情况',
                  color: tc.secondary,
                  icon: Target,
                },
                {
                  label: '客户满意度',
                  value: '4.8/5',
                  desc: '最近 30 天评分',
                  color: tc.accent,
                  icon: Star,
                },
                {
                  label: 'AI 辅助率',
                  value: '87.3%',
                  desc: 'AI 协助完成的工作',
                  color: tc.primary,
                  icon: Brain,
                },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: tc.alpha(item.color, 0.1),
                        border: `1px solid ${tc.alpha(item.color, 0.2)}`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: tc.textSecondary }}>
                          {item.label}
                        </span>
                        <span
                          className="text-sm"
                          style={{
                            color: item.color,
                            textShadow: `0 0 6px ${tc.alpha(item.color, 0.4)}`,
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                      <p className="text-[9px]" style={{ color: tc.textMuted }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </NeonCard>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div
          className="grid grid-cols-1 xl:grid-cols-2 gap-5"
          style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
        >
          <NeonCard color={tc.accent} hoverable={false}>
            <h3 className="text-xs uppercase tracking-wider mb-4" style={{ color: tc.textMuted }}>
              通知偏好 · Notification Preferences
            </h3>
            <div className="space-y-3">
              {[
                { label: '系统通知', desc: '重要系统更新和维护通知', enabled: true },
                { label: '客户动态', desc: '客户状态变更和跟进提醒', enabled: true },
                { label: 'AI 任务', desc: 'AI 任务完成和异常提醒', enabled: true },
                { label: '呼叫提醒', desc: '呼叫任务和回访提醒', enabled: false },
                { label: '数据报告', desc: '每日/周报数据摘要', enabled: true },
              ].map((pref, i) => (
                <PreferenceToggle
                  key={i}
                  label={pref.label}
                  desc={pref.desc}
                  defaultEnabled={pref.enabled}
                  color={tc.accent}
                />
              ))}
            </div>
          </NeonCard>

          <NeonCard color={tc.secondary} hoverable={false}>
            <h3 className="text-xs uppercase tracking-wider mb-4" style={{ color: tc.textMuted }}>
              显示设置 · Display Settings
            </h3>
            <div className="space-y-3">
              {[
                { label: '紧凑模式', desc: '减少元素间距，显示更多内容', enabled: false },
                { label: '动画效果', desc: '弹簧动画和过渡效果', enabled: theme.springAnimEnabled },
                { label: '实时更新', desc: '自动刷新数据和通知推送', enabled: true },
                { label: '声音提醒', desc: '通知和呼叫声音提醒', enabled: false },
                { label: '键盘快捷键', desc: '启用全局键盘快捷键', enabled: true },
              ].map((pref, i) => (
                <PreferenceToggle
                  key={i}
                  label={pref.label}
                  desc={pref.desc}
                  defaultEnabled={pref.enabled}
                  color={tc.secondary}
                />
              ))}
            </div>
          </NeonCard>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ background: tc.bgOverlay, backdropFilter: tc.backdropFilter }}
            onClick={handleCancel}
          />
          <div
            className="relative w-full max-w-lg mx-4 rounded-2xl border p-6 overflow-y-auto max-h-[80vh]"
            style={{
              background: tc.isCyberpunk ? tc.alpha(tc.bgBase, 0.95) : tc.alpha(tc.bgBase, 0.9),
              borderColor: tc.alpha(tc.secondary, 0.2),
              backdropFilter: tc.backdropFilter,
              boxShadow: `0 25px 50px rgba(0,0,0,0.3), ${tc.neonGlow(tc.secondary, 0.5)}`,
              animation: 'spring-in 0.4s var(--spring-easing) both',
              scrollbarWidth: 'none',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm flex items-center gap-2" style={{ color: tc.secondary }}>
                <Edit3 className="w-4 h-4" />
                编辑个人资料
              </h3>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: tc.alpha(tc.textMuted, 0.05) }}
              >
                <X className="w-4 h-4" style={{ color: tc.textMuted }} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'name' as const, label: '姓名', icon: UserCircle, placeholder: '输入姓名' },
                { key: 'email' as const, label: '邮箱', icon: Mail, placeholder: '输入邮箱' },
                { key: 'role' as const, label: '职位', icon: Briefcase, placeholder: '输入职位' },
                { key: 'department' as const, label: '部门', icon: Users, placeholder: '输入部门' },
                { key: 'location' as const, label: '位置', icon: MapPin, placeholder: '输入位置' },
                {
                  key: 'website' as const,
                  label: '网站',
                  icon: Globe,
                  placeholder: '输入网站 URL',
                },
              ].map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.key}>
                    <label
                      className="text-[10px] mb-1 flex items-center gap-1"
                      style={{ color: tc.textMuted }}
                    >
                      <Icon className="w-3 h-3" /> {field.label}
                    </label>
                    <input
                      type="text"
                      value={editForm[field.key]}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-transparent"
                      style={{
                        border: `1px solid ${tc.borderDefault}`,
                        outline: 'none',
                        color: tc.textPrimary,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = tc.borderActive
                        e.currentTarget.style.boxShadow = tc.neonGlow(tc.secondary, 0.5)
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = tc.borderDefault
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                )
              })}

              <div>
                <label className="text-[10px] mb-1 block" style={{ color: tc.textMuted }}>
                  个人简介
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="介绍自己…"
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-transparent resize-none"
                  style={{
                    border: `1px solid ${tc.borderDefault}`,
                    outline: 'none',
                    scrollbarWidth: 'none',
                    color: tc.textPrimary,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = tc.borderActive
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = tc.borderDefault
                  }}
                />
              </div>
            </div>

            <div
              className="flex justify-end gap-3 mt-6 pt-4 border-t"
              style={{ borderColor: tc.borderSubtle }}
            >
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                style={{
                  background: tc.alpha(tc.textMuted, 0.03),
                  border: `1px solid ${tc.borderSubtle}`,
                  color: tc.textMuted,
                }}
              >
                <X className="w-3 h-3" /> 取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                style={{
                  background: tc.gradientCard,
                  border: `1px solid ${tc.borderActive}`,
                  color: tc.secondary,
                  boxShadow: tc.neonGlow(tc.secondary, 0.3),
                }}
              >
                <Save className="w-3 h-3" /> 保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Helper Components ----

function InfoRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Mail
  label: string
  value: string
  color: string
}) {
  const tc = useThemeColors()
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: tc.alpha(color, 0.6) }} />
      <span className="text-[10px] w-10 shrink-0" style={{ color: tc.textMuted }}>
        {label}
      </span>
      <span className="text-xs truncate" style={{ color: tc.textSecondary }}>
        {value}
      </span>
    </div>
  )
}

function PreferenceToggle({
  label,
  desc,
  defaultEnabled,
  color,
}: {
  label: string
  desc: string
  defaultEnabled: boolean
  color: string
}) {
  const tc = useThemeColors()
  const [enabled, setEnabled] = useState(defaultEnabled)
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
      style={{ background: tc.alpha(tc.bgBase, 0.3), border: `1px solid ${tc.borderSubtle}` }}
    >
      <div>
        <p className="text-xs" style={{ color: tc.textSecondary }}>
          {label}
        </p>
        <p className="text-[9px]" style={{ color: tc.textMuted }}>
          {desc}
        </p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className="relative w-10 h-6 rounded-full transition-all duration-300 shrink-0 ml-3"
        style={{
          background: enabled ? tc.alpha(color, 0.3) : tc.alpha(tc.textMuted, 0.06),
          border: `1px solid ${enabled ? tc.alpha(color, 0.6) : tc.alpha(tc.textMuted, 0.1)}`,
        }}
      >
        <div
          className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-300"
          style={{
            width: 18,
            height: 18,
            left: enabled ? 20 : 3,
            background: enabled ? color : tc.alpha(tc.textMuted, 0.3),
            boxShadow: enabled ? `0 0 6px ${color}` : 'none',
          }}
        />
      </button>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}秒前`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  return `${Math.floor(h / 24)}天前`
}
