import {
  Activity,
  ArrowDown,
  Bot,
  ChevronDown,
  Clock,
  Cpu,
  Filter,
  Pause,
  Phone,
  Play,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { type ActivityItem, useApp } from './app-context'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 操作日志面板 — Activity Log
// Cyberpunk-themed timeline view with
// type filtering, auto-scroll, real-time feed
// ==========================================

type FilterType = 'all' | 'customer' | 'call' | 'system' | 'ai'

const filterOptions: Array<{
  id: FilterType
  labelKey: string
  icon: typeof Users
  color: string
}> = [
  { id: 'all', labelKey: 'log.all', icon: Activity, color: '#00f0ff' },
  { id: 'customer', labelKey: 'log.customer', icon: Users, color: '#00d4ff' },
  { id: 'call', labelKey: 'log.call', icon: Phone, color: '#00ffcc' },
  { id: 'system', labelKey: 'log.system', icon: Cpu, color: '#00ffc8' },
  { id: 'ai', labelKey: 'log.ai', icon: Bot, color: '#00f0ff' },
]

const typeIcons: Record<string, typeof Users> = {
  customer: Users,
  call: Phone,
  system: Cpu,
  ai: Bot,
}

function formatTimestamp(
  d: Date,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 5000) return t('log.justNow')
  if (diff < 60000) return t('log.secAgo', { n: Math.floor(diff / 1000) })
  if (diff < 3600000) return t('log.minAgo', { n: Math.floor(diff / 60000) })
  if (diff < 86400000) return t('log.hourAgo', { n: Math.floor(diff / 3600000) })
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function formatTimeOnly(d: Date): string {
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * System activity log page.
 * Streams all recent activities with type-based color coding, filtering
 * (customer/call/system/AI), search, auto-scroll, and time-ago formatting.
 */
export function ActivityLogPage() {
  const { recentActivities } = useApp()
  const { t } = useI18n()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showStats, setShowStats] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(recentActivities.length)

  // Auto-scroll to top when new activities arrive
  useEffect(() => {
    if (autoScroll && recentActivities.length > prevCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    prevCountRef.current = recentActivities.length
  }, [recentActivities.length, autoScroll])

  const filtered = recentActivities.filter((act) => {
    if (activeFilter !== 'all' && act.type !== activeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return act.action.toLowerCase().includes(q) || act.target.toLowerCase().includes(q)
    }
    return true
  })

  // Stats
  const stats = {
    total: recentActivities.length,
    customer: recentActivities.filter((a) => a.type === 'customer').length,
    call: recentActivities.filter((a) => a.type === 'call').length,
    system: recentActivities.filter((a) => a.type === 'system').length,
    ai: recentActivities.filter((a) => a.type === 'ai').length,
  }

  return (
    <div
      className="h-full overflow-hidden flex flex-col"
      style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Header */}
      <div className="shrink-0 p-4 sm:p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="tracking-wider flex items-center gap-3"
              style={{ color: '#00ffc8', textShadow: '0 0 15px rgba(0,255,200,0.5)' }}
            >
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-base sm:text-xl">{t('log.title')}</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-white/25 mt-1 tracking-wider">
              {t('log.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all duration-200"
              style={{
                background: autoScroll ? 'rgba(0,255,200,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${autoScroll ? 'rgba(0,255,200,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: autoScroll ? '#00ffc8' : 'rgba(255,255,255,0.3)',
              }}
            >
              {autoScroll ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span className="hidden sm:inline">
                {autoScroll ? t('log.realtime') : t('log.paused')}
              </span>
            </button>
            {/* Live indicator */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(0,255,200,0.05)',
                border: '1px solid rgba(0,255,200,0.15)',
              }}
            >
              <div
                className="w-2 h-2 rounded-full bg-[#00ffc8]"
                style={{
                  boxShadow: '0 0 6px #00ffc8',
                  animation: 'neon-pulse 2s ease-in-out infinite',
                }}
              />
              <span className="text-[10px] text-[#00ffc8] tracking-wider">{t('log.live')}</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {showStats && (
          <div
            className="grid grid-cols-5 gap-2 mb-4"
            style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
          >
            {[
              { label: t('log.total'), value: stats.total, color: '#00f0ff' },
              { label: t('log.customer'), value: stats.customer, color: '#00d4ff' },
              { label: t('log.call'), value: stats.call, color: '#00ffcc' },
              { label: t('log.system'), value: stats.system, color: '#00ffc8' },
              { label: 'AI', value: stats.ai, color: '#00f0ff' },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl px-3 py-2 border text-center"
                style={{
                  background: `${s.color}06`,
                  borderColor: `${s.color}15`,
                }}
              >
                <p
                  className="text-lg tabular-nums"
                  style={{ color: s.color, textShadow: `0 0 8px ${s.color}40` }}
                >
                  {s.value}
                </p>
                <p className="text-[9px] text-white/20">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter & Search */}
        <div className="flex items-center gap-3 mb-4">
          {/* Type filters */}
          <div className="flex items-center gap-1">
            {filterOptions.map((f) => {
              const Icon = f.icon
              const isActive = activeFilter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] transition-all duration-200"
                  style={{
                    background: isActive ? `${f.color}12` : 'transparent',
                    border: `1px solid ${isActive ? `${f.color}40` : 'transparent'}`,
                    color: isActive ? f.color : 'rgba(255,255,255,0.25)',
                    boxShadow: isActive ? `0 0 8px ${f.color}15` : 'none',
                  }}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{t(f.labelKey)}</span>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="flex-1 relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/15" />
            <input
              type="text"
              placeholder={t('log.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs text-white/60 placeholder-white/15 outline-none"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/15">
            <Activity className="w-8 h-8 mb-3" />
            <p className="text-sm">{t('log.noMatch')}</p>
          </div>
        ) : (
          <div className="relative pl-8">
            {/* Timeline vertical line */}
            <div
              className="absolute left-[11px] top-2 bottom-2 w-[2px] rounded-full"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,240,255,0.3), rgba(0,212,255,0.2), rgba(0,255,200,0.1), transparent)',
              }}
            />

            {filtered.map((act, i) => {
              const Icon = typeIcons[act.type] || Activity
              const isNew = i === 0 && autoScroll

              return (
                <div
                  key={act.id}
                  className="relative mb-1"
                  style={{
                    animation: isNew
                      ? 'slide-in-right 0.5s var(--spring-easing) both'
                      : `spring-in 0.3s var(--spring-easing) ${Math.min(i * 0.03, 0.3)}s both`,
                  }}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-8 top-3 w-[22px] flex items-center justify-center">
                    <div className="relative">
                      <div
                        className="w-[10px] h-[10px] rounded-full z-10 relative"
                        style={{
                          background: act.color,
                          boxShadow: `0 0 6px ${act.color}80`,
                        }}
                      />
                      {isNew && (
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: act.color,
                            animation: 'timeline-ping 1.5s ease-out infinite',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Content card */}
                  <div
                    className="rounded-xl px-4 py-3 border transition-all duration-300 group"
                    style={{
                      background: isNew ? `${act.color}08` : 'rgba(10,10,10,0.4)',
                      borderColor: isNew ? `${act.color}25` : 'rgba(255,255,255,0.03)',
                      borderLeft: `2px solid ${act.color}40`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${act.color}30`
                      e.currentTarget.style.boxShadow = `0 0 12px ${act.color}10`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isNew
                        ? `${act.color}25`
                        : 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Type icon */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `${act.color}12`,
                          border: `1px solid ${act.color}25`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: `${act.color}90` }} />
                      </div>

                      {/* Action & Target */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60">
                          <span style={{ color: `${act.color}` }}>{act.action}</span>
                          <span className="text-white/15"> · </span>
                          <span className="text-white/35">{act.target}</span>
                        </p>
                      </div>

                      {/* Timestamps */}
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-white/20 tabular-nums">
                          {formatTimeOnly(act.timestamp)}
                        </p>
                        <p className="text-[9px] text-white/10">
                          {formatTimestamp(act.timestamp, t)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* End of timeline marker */}
            <div className="relative mt-2">
              <div className="absolute -left-8 top-0 w-[22px] flex items-center justify-center">
                <div
                  className="w-[6px] h-[6px] rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
              </div>
              <p className="text-[9px] text-white/10 pl-2 py-2">
                {t('log.timelineEnd', { count: recentActivities.length })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
