import type { NotificationItem } from './app-context'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Clock,
  Eye,
  Info,
  X,
} from 'lucide-react'

import { useApp } from './app-context'
import { useI18n } from './i18n-context'
// ==========================================
// YYC³ 通知抽屉面板 — Notification Drawer
// Cyberpunk-themed sliding notification panel
// ==========================================

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

const typeIcons: Record<
  NotificationItem['type'],
  (props: { className?: string; style?: React.CSSProperties }) => ReactNode
> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

const typeColors: Record<NotificationItem['type'], string> = {
  info: '#00f0ff',
  success: '#00ffc8',
  warning: '#00d4ff',
  error: '#005f73',
}

function formatTimeAgo(
  date: Date,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return t('common.justNow')
  if (minutes < 60) return t('common.minutesAgo', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('common.hoursAgo', { n: hours })
  const days = Math.floor(hours / 24)
  return t('common.daysAgo', { n: days })
}

/**
 * Slide-in notification drawer panel.
 * Displays all system notifications with read/unread filtering,
 * time-ago formatting, and individual mark-as-read actions.
 *
 * @param open - Whether the drawer is currently visible.
 * @param onClose - Callback to close the drawer.
 */
export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { notifications, markNotificationRead, clearNotifications, unreadCount } = useApp()
  const { t } = useI18n()
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [open, onClose])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const filtered = filterType === 'unread' ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className="contents">
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[998]"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full z-[999] overflow-hidden"
        style={{
          width: 400,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          background: 'rgba(10,10,10,0.97)',
          borderLeft: '2px solid rgba(0,240,255,0.2)',
          boxShadow: open
            ? '-20px 0 60px rgba(0,0,0,0.5), -4px 0 20px rgba(0,240,255,0.08)'
            : 'none',
          backdropFilter: 'blur(30px)',
        }}
      >
        {/* Circuit grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Glow strip left edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(0,240,255,0.5), rgba(0,212,255,0.4), rgba(0,255,204,0.3), transparent)',
            boxShadow: '0 0 12px rgba(0,240,255,0.3)',
          }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div
            className="shrink-0 px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(0,240,255,0.15)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,255,204,0.15))',
                  border: '1px solid rgba(0,240,255,0.3)',
                  boxShadow: '0 0 12px rgba(0,240,255,0.2)',
                }}
              >
                <Bell className="w-4.5 h-4.5" style={{ color: '#00f0ff' }} />
              </div>
              <div>
                <h3
                  className="text-sm text-white/85 tracking-wider"
                  style={{ textShadow: '0 0 10px rgba(0,240,255,0.3)' }}
                >
                  {t('notif.title')}
                </h3>
                <p className="text-[9px] text-white/25 tracking-wider">{t('notif.center')}</p>
              </div>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] text-white"
                  style={{
                    background: '#005f73',
                    boxShadow: '0 0 8px rgba(0,95,115,0.5)',
                  }}
                >
                  {t('notif.unreadCount', { count: unreadCount })}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <X className="w-4 h-4 text-white/30 hover:text-white/60" />
            </button>
          </div>

          {/* Toolbar */}
          <div
            className="shrink-0 px-5 py-2.5 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              {(
                [
                  ['all', t('notif.all')],
                  ['unread', t('notif.unread')],
                ] as [typeof filterType, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className="px-3 py-1 rounded-lg text-[11px] transition-all duration-200"
                  style={{
                    background: filterType === key ? 'rgba(0,240,255,0.1)' : 'transparent',
                    color: filterType === key ? '#00f0ff' : 'rgba(255,255,255,0.3)',
                    border:
                      filterType === key
                        ? '1px solid rgba(0,240,255,0.25)'
                        : '1px solid transparent',
                  }}
                >
                  {label}
                  {key === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 text-[9px]" style={{ color: '#005f73' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={clearNotifications}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors group"
                  title={t('notif.markAllReadTitle')}
                >
                  <CheckCheck className="w-3.5 h-3.5 text-white/20 group-hover:text-[#00ffc8] transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <BellOff className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.08)' }} />
                <p className="text-sm text-white/15">
                  {filterType === 'unread' ? t('notif.noUnread') : t('notif.empty')}
                </p>
              </div>
            ) : (
              <div className="py-2 px-3 space-y-1">
                {filtered.map((notif, idx) => {
                  const Icon = typeIcons[notif.type]
                  const color = typeColors[notif.type]
                  const isHovered = hoveredId === notif.id

                  return (
                    <div
                      key={notif.id}
                      className="relative flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-300 group"
                      style={{
                        background: isHovered
                          ? `${color}08`
                          : notif.read
                            ? 'transparent'
                            : 'rgba(0,240,255,0.03)',
                        border: `1px solid ${isHovered ? `${color}20` : notif.read ? 'transparent' : 'rgba(0,240,255,0.06)'}`,
                        animation: `spring-in 0.3s var(--spring-easing) ${idx * 0.03}s both`,
                      }}
                      onMouseEnter={() => setHoveredId(notif.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        if (!notif.read) markNotificationRead(notif.id)
                      }}
                    >
                      {/* Unread indicator */}
                      {!notif.read && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                          style={{
                            background: color,
                            boxShadow: `0 0 6px ${color}80`,
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200"
                        style={{
                          background: `${color}12`,
                          border: `1px solid ${color}25`,
                          boxShadow: isHovered ? `0 0 8px ${color}25` : 'none',
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p
                            className="text-xs truncate"
                            style={{
                              color: notif.read ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                            }}
                          >
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-white/25 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3 h-3 text-white/15" />
                          <span className="text-[9px] text-white/15">
                            {formatTimeAgo(notif.timestamp, t)}
                          </span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{
                              background: `${color}10`,
                              color: `${color}70`,
                              border: `1px solid ${color}15`,
                            }}
                          >
                            {notif.type === 'info'
                              ? t('notif.typeInfo')
                              : notif.type === 'success'
                                ? t('notif.typeSuccess')
                                : notif.type === 'warning'
                                  ? t('notif.typeWarning')
                                  : t('notif.typeError')}
                          </span>
                        </div>
                      </div>

                      {/* Hover action */}
                      {isHovered && !notif.read && (
                        <button
                          className="shrink-0 p-1 rounded-lg hover:bg-white/5 transition-colors"
                          title={t('notif.markRead')}
                          onClick={(e) => {
                            e.stopPropagation()
                            markNotificationRead(notif.id)
                          }}
                        >
                          <Eye className="w-3 h-3" style={{ color: `${color}60` }} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="shrink-0 px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(0,240,255,0.1)' }}
          >
            <span className="text-[9px] text-white/15 tracking-wider">
              {t('notif.footerTotal', { total: notifications.length, unread: unreadCount })}
            </span>
            <span className="text-[9px] text-white/10 tracking-wider">
              {t('notif.footerBrand')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
