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

import { useApp } from '@/app/components/app-context'
import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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

// 默认资料值为 i18n 键，渲染点用 t() 解析；用户自定义输入不含键时 t() 原样返回
const defaultProfile: UserProfile = {
  name: 'pfp.profile.defaultName',
  email: 'admin@yyc3.ai',
  role: 'pfp.profile.defaultRole',
  department: 'pfp.profile.defaultDepartment',
  location: 'pfp.profile.defaultLocation',
  website: 'https://yyc3.ai',
  bio: 'pfp.profile.defaultBio',
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
  const { t } = useI18n()
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
    { id: 'overview' as const, label: t('pfp.tab.overview'), icon: UserCircle, color: tc.primary },
    { id: 'activity' as const, label: t('pfp.tab.activity'), icon: Activity, color: tc.success },
    { id: 'stats' as const, label: t('pfp.tab.stats'), icon: BarChart3, color: tc.secondary },
    {
      id: 'preferences' as const,
      label: t('pfp.tab.preferences'),
      icon: Settings,
      color: tc.accent,
    },
  ]

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="tracking-wider flex items-center gap-3"
            style={{ color: tc.secondary, textShadow: `0 0 15px ${tc.alpha(tc.secondary, 0.5)}` }}
          >
            <UserCircle className="w-6 h-6" />
            {t('pfp.title')}
          </h1>
          <p className="text-xs mt-1 tracking-wider" style={{ color: tc.textMuted }}>
            {t('pfp.subtitle')}
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
                {t(profile.name)[0]}
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
              {t(profile.name)}
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
              {t(profile.role)}
            </span>
          </div>

          <div className="space-y-2.5 pt-3 border-t" style={{ borderColor: tc.borderSubtle }}>
            <InfoRow
              icon={Briefcase}
              label={t('pfp.field.department')}
              value={t(profile.department)}
              color={tc.secondary}
            />
            <InfoRow
              icon={MapPin}
              label={t('pfp.field.location')}
              value={t(profile.location)}
              color={tc.primary}
            />
            <InfoRow
              icon={Globe}
              label={t('pfp.field.website')}
              value={profile.website}
              color={tc.accent}
            />
            <InfoRow
              icon={Clock}
              label={t('pfp.field.joinDate')}
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
            <Edit3 className="w-3 h-3" /> {t('pfp.action.editProfile')}
          </button>
        </NeonCard>

        {/* Quick Stats */}
        <div className="xl:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: t('pfp.stat.activeDays'),
              value: `${usageStats.daysActive}`,
              icon: Clock,
              color: tc.primary,
              sub: t('pfp.unit.day'),
            },
            {
              label: t('pfp.stat.loginStreak'),
              value: `${usageStats.loginStreak}`,
              icon: Zap,
              color: tc.success,
              sub: t('pfp.unit.day'),
            },
            {
              label: t('pfp.stat.aiInteractions'),
              value: `${usageStats.aiInteractions.toLocaleString()}`,
              icon: Brain,
              color: tc.secondary,
              sub: t('pfp.unit.times'),
            },
            {
              label: t('pfp.stat.formSubmissions'),
              value: `${usageStats.formSubmissions}`,
              icon: Target,
              color: tc.accent,
              sub: t('pfp.unit.forms'),
            },
            {
              label: t('pfp.stat.activities'),
              value: `${usageStats.totalActivities}`,
              icon: Activity,
              color: tc.highlight,
              sub: t('pfp.unit.items'),
            },
            {
              label: t('pfp.stat.notifications'),
              value: `${usageStats.totalNotifications}`,
              icon: Bell,
              color: tc.muted,
              sub: t('pfp.unit.items'),
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
              {t('pfp.section.bio')}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: tc.textSecondary }}>
              {profile.bio}
            </p>
          </NeonCard>

          {/* Skills/Badges */}
          <NeonCard color={tc.success} hoverable={false}>
            <h3 className="text-xs uppercase tracking-wider mb-3" style={{ color: tc.textMuted }}>
              {t('pfp.section.achievements')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: t('pfp.badge.aiPioneer'),
                  desc: t('pfp.badge.aiPioneerDesc'),
                  icon: Brain,
                  color: tc.primary,
                  unlocked: true,
                },
                {
                  label: t('pfp.badge.dataMaster'),
                  desc: t('pfp.badge.dataMasterDesc'),
                  icon: BarChart3,
                  color: tc.secondary,
                  unlocked: usageStats.formSubmissions >= 5,
                },
                {
                  label: t('pfp.badge.socialExpert'),
                  desc: t('pfp.badge.socialExpertDesc'),
                  icon: Users,
                  color: tc.accent,
                  unlocked: true,
                },
                {
                  label: t('pfp.badge.efficiencyStar'),
                  desc: t('pfp.badge.efficiencyStarDesc'),
                  icon: Star,
                  color: tc.success,
                  unlocked: usageStats.loginStreak >= 7,
                },
                {
                  label: t('pfp.badge.securityGuard'),
                  desc: t('pfp.badge.securityGuardDesc'),
                  icon: Shield,
                  color: tc.highlight,
                  unlocked: true,
                },
                {
                  label: t('pfp.badge.trendHunter'),
                  desc: t('pfp.badge.trendHunterDesc'),
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
              {t('pfp.section.quickActions')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: t('pfp.page.dashboard'),
                  icon: BarChart3,
                  color: tc.primary,
                  page: 'dashboard' as const,
                },
                {
                  label: t('pfp.page.chat'),
                  icon: Brain,
                  color: tc.secondary,
                  page: 'chat' as const,
                },
                { label: t('pfp.page.clm'), icon: Users, color: tc.accent, page: 'clm' as const },
                {
                  label: t('pfp.page.settings'),
                  icon: Settings,
                  color: tc.muted,
                  page: 'settings' as const,
                },
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
            {t('pfp.section.recentActivity')}
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
                    {t(act.action)}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: tc.textMuted }}>
                    {t(act.target)}
                  </p>
                </div>
                <span className="text-[9px] shrink-0" style={{ color: tc.textMuted }}>
                  {formatTimeAgo(act.timestamp, t)}
                </span>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: tc.textMuted }} />
                <p className="text-xs" style={{ color: tc.textMuted }}>
                  {t('pfp.empty.activities')}
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
              {t('pfp.section.usageFrequency')}
            </h3>
            <div className="space-y-3">
              {[
                { label: t('pfp.page.dashboard'), pct: 85, color: tc.primary },
                { label: t('pfp.page.chat'), pct: 72, color: tc.secondary },
                { label: t('pfp.page.clm'), pct: 64, color: tc.accent },
                { label: t('pfp.page.aiCall'), pct: 58, color: tc.success },
                { label: t('pfp.page.smartForm'), pct: 45, color: tc.highlight },
                { label: t('pfp.page.insights'), pct: 38, color: tc.muted },
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
              {t('pfp.section.performance')}
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: t('pfp.perf.responseEfficiency'),
                  value: '98.2%',
                  desc: t('pfp.perf.responseEfficiencyDesc'),
                  color: tc.success,
                  icon: Zap,
                },
                {
                  label: t('pfp.perf.taskCompletion'),
                  value: '94.7%',
                  desc: t('pfp.perf.taskCompletionDesc'),
                  color: tc.secondary,
                  icon: Target,
                },
                {
                  label: t('pfp.perf.customerSatisfaction'),
                  value: '4.8/5',
                  desc: t('pfp.perf.customerSatisfactionDesc'),
                  color: tc.accent,
                  icon: Star,
                },
                {
                  label: t('pfp.perf.aiAssistRate'),
                  value: '87.3%',
                  desc: t('pfp.perf.aiAssistRateDesc'),
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
              {t('pfp.section.notificationPrefs')}
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: t('pfp.pref.systemNotification'),
                  desc: t('pfp.pref.systemNotificationDesc'),
                  enabled: true,
                },
                {
                  label: t('pfp.pref.customerUpdates'),
                  desc: t('pfp.pref.customerUpdatesDesc'),
                  enabled: true,
                },
                {
                  label: t('pfp.pref.aiTasks'),
                  desc: t('pfp.pref.aiTasksDesc'),
                  enabled: true,
                },
                {
                  label: t('pfp.pref.callAlerts'),
                  desc: t('pfp.pref.callAlertsDesc'),
                  enabled: false,
                },
                {
                  label: t('pfp.pref.dataReports'),
                  desc: t('pfp.pref.dataReportsDesc'),
                  enabled: true,
                },
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
              {t('pfp.section.displaySettings')}
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: t('pfp.display.compactMode'),
                  desc: t('pfp.display.compactModeDesc'),
                  enabled: false,
                },
                {
                  label: t('pfp.display.animations'),
                  desc: t('pfp.display.animationsDesc'),
                  enabled: theme.springAnimEnabled,
                },
                {
                  label: t('pfp.display.realtimeUpdates'),
                  desc: t('pfp.display.realtimeUpdatesDesc'),
                  enabled: true,
                },
                {
                  label: t('pfp.display.soundAlerts'),
                  desc: t('pfp.display.soundAlertsDesc'),
                  enabled: false,
                },
                {
                  label: t('pfp.display.keyboardShortcuts'),
                  desc: t('pfp.display.keyboardShortcutsDesc'),
                  enabled: true,
                },
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
                {t('pfp.modal.editProfile')}
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
                {
                  key: 'name' as const,
                  label: t('pfp.field.name'),
                  icon: UserCircle,
                  placeholder: t('pfp.placeholder.name'),
                },
                {
                  key: 'email' as const,
                  label: t('pfp.field.email'),
                  icon: Mail,
                  placeholder: t('pfp.placeholder.email'),
                },
                {
                  key: 'role' as const,
                  label: t('pfp.field.role'),
                  icon: Briefcase,
                  placeholder: t('pfp.placeholder.role'),
                },
                {
                  key: 'department' as const,
                  label: t('pfp.field.department'),
                  icon: Users,
                  placeholder: t('pfp.placeholder.department'),
                },
                {
                  key: 'location' as const,
                  label: t('pfp.field.location'),
                  icon: MapPin,
                  placeholder: t('pfp.placeholder.location'),
                },
                {
                  key: 'website' as const,
                  label: t('pfp.field.website'),
                  icon: Globe,
                  placeholder: t('pfp.placeholder.website'),
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
                      value={t(editForm[field.key])}
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
                  {t('pfp.field.bio')}
                </label>
                <textarea
                  value={t(editForm.bio)}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder={t('pfp.placeholder.bio')}
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
                <X className="w-3 h-3" /> {t('pfp.action.cancel')}
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
                <Save className="w-3 h-3" /> {t('pfp.action.save')}
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

function formatTimeAgo(
  date: Date,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const diff = Date.now() - date.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return t('pfp.time.secondsAgo', { n: s })
  const m = Math.floor(s / 60)
  if (m < 60) return t('pfp.time.minutesAgo', { n: m })
  const h = Math.floor(m / 60)
  if (h < 24) return t('pfp.time.hoursAgo', { n: h })
  return t('pfp.time.daysAgo', { n: Math.floor(h / 24) })
}
