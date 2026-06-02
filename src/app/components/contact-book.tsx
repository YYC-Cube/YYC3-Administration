import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  Download,
  Edit3,
  Eye,
  Filter,
  Handshake,
  HeartHandshake,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Star,
  StarOff,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'

import { useApp } from './app-context'
import { type SharedContact, useContacts } from './contacts-context'
import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

import type { LucideIcon } from 'lucide-react'

// ==========================================
// YYC³ 号码簿 — Contact Book
// 全功能联系人管理 + 客户全生命周期衔接 + AI 智能提档
// 已迁移至共享 ContactsProvider
// ==========================================

// Re-export Contact type alias for backward compat
/** Type alias re-exporting {@link SharedContact} for backward compatibility. */
export type Contact = SharedContact

// Theme-aware stage metadata - colors are now token keys
const STAGE_META_KEYS: Record<
  string,
  { icon: LucideIcon; colorKey: keyof ReturnType<typeof useThemeColors>; sublabel: string }
> = {
  获客: { icon: Megaphone, colorKey: 'primary', sublabel: 'Acquisition' },
  转化: { icon: Target, colorKey: 'secondary', sublabel: 'Conversion' },
  成交: { icon: Handshake, colorKey: 'accent', sublabel: 'Closing' },
  服务: { icon: HeartHandshake, colorKey: 'success', sublabel: 'Service' },
  忠诚: { icon: Crown, colorKey: 'muted', sublabel: 'Loyalty' },
}

// Legacy static colors for backward compatibility (will be mapped by theme)
const STAGE_META: Record<string, { icon: LucideIcon; color: string; sublabel: string }> = {
  获客: { icon: Megaphone, color: '#00f0ff', sublabel: 'Acquisition' },
  转化: { icon: Target, color: '#00d4ff', sublabel: 'Conversion' },
  成交: { icon: Handshake, color: '#00ffcc', sublabel: 'Closing' },
  服务: { icon: HeartHandshake, color: '#00ffc8', sublabel: 'Service' },
  忠诚: { icon: Crown, color: '#008b9d', sublabel: 'Loyalty' },
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

const ALL_TAGS = Object.keys(TAG_COLORS)

// ---- AI Score Badge ----
const AIScoreBadge = memo(function AIScoreBadge({
  score,
  t,
}: {
  score: number
  t: (k: string) => string
}) {
  const color =
    score >= 90 ? '#00ffc8' : score >= 70 ? '#00ffcc' : score >= 50 ? '#008b9d' : '#005f73'
  const label =
    score >= 90
      ? t('cb.excellent')
      : score >= 70
        ? t('cb.good')
        : score >= 50
          ? t('cb.average')
          : t('cb.needImprovement')
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-8 h-8">
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
          className="absolute inset-0 flex items-center justify-center text-[8px] tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <span className="text-[9px]" style={{ color }}>
        {label}
      </span>
    </div>
  )
})

// ---- Risk Badge ----
function RiskBadge({ level, t }: { level: string; t: (k: string) => string }) {
  const meta: Record<string, { labelKey: string; color: string }> = {
    low: { labelKey: 'cb.riskLow', color: '#00ffc8' },
    medium: { labelKey: 'cb.riskMedium', color: '#00ffcc' },
    high: { labelKey: 'cb.riskHigh', color: '#005f73' },
  }
  const m = meta[level] || meta.low
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded-full"
      style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30` }}
    >
      {t(m.labelKey)}
    </span>
  )
}

// ---- Add/Edit Contact Modal ----
function ContactFormModal({
  contact,
  onSave,
  onClose,
  t,
}: {
  contact: SharedContact | null
  onSave: (c: SharedContact) => void
  onClose: () => void
  t: (k: string) => string
}) {
  const isEdit = !!contact
  const [form, setForm] = useState<SharedContact>(
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

  const updateField = (key: keyof SharedContact, value: string | number | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

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
            {isEdit ? t('cb.editContact') : t('cb.addContact')}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-white/30" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">{t('cb.name')} *</label>
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
                placeholder={t('cb.name')}
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">{t('cb.phone')} *</label>
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
              <label className="text-[10px] text-white/30 mb-1 block">{t('cb.email')}</label>
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
              <label className="text-[10px] text-white/30 mb-1 block">{t('cb.company')}</label>
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
                placeholder={t('cb.company')}
              />
            </div>
          </div>

          {/* Position & Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">{t('cb.position')}</label>
              <input
                value={form.position}
                onChange={(e) => updateField('position', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.15)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
                placeholder={t('cb.position')}
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 mb-1 block">{t('cb.source')}</label>
              <select
                value={form.source}
                onChange={(e) => updateField('source', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.15)',
                }}
              >
                {[
                  '手动录入',
                  '官网注册',
                  '行业展会',
                  '客户推荐',
                  '搜索引擎',
                  '社交媒体',
                  '合作伙伴',
                  '行业会议',
                  '线下活动',
                ].map((s) => (
                  <option key={s} value={s} style={{ background: '#0a0a0a' }}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="text-[10px] text-white/30 mb-2 block">{t('cb.lifecycleStage')}</label>
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
                      boxShadow: active ? `0 0 10px ${meta.color}20` : 'none',
                    }}
                  >
                    {stage}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] text-white/30 mb-2 block">{t('cb.tags')}</label>
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

          {/* Address */}
          <div>
            <label className="text-[10px] text-white/30 mb-1 block">{t('cb.address')}</label>
            <input
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm text-white/80 outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,240,255,0.15)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)')}
              placeholder={t('cb.address')}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] text-white/30 mb-1 block">{t('cb.notes')}</label>
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
              placeholder={t('cb.notes')}
            />
          </div>
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
            {isEdit ? t('cb.saveChanges') : t('cb.addContactBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Contact Detail Panel ----
function ContactDetailPanel({
  contact,
  onClose,
  onEdit,
  onCall,
  onAIEnhance,
  onStageChange,
  t,
}: {
  contact: SharedContact
  onClose: () => void
  onEdit: () => void
  onCall: () => void
  onAIEnhance: () => void
  onStageChange: (stage: SharedContact['stage']) => void
  t: (k: string) => string
}) {
  const stageMeta = STAGE_META[contact.stage]

  return (
    <div
      className="h-full overflow-y-auto border-l"
      style={{
        background: 'rgba(5,5,5,0.95)',
        borderColor: 'rgba(0,240,255,0.15)',
        backdropFilter: 'blur(20px)',
        scrollbarWidth: 'none',
        animation: 'spring-in 0.3s var(--spring-easing) both',
      }}
    >
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
        <div className="flex items-start justify-between mb-4">
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-white/30" />
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title={t('common.edit')}
            >
              <Edit3 className="w-3.5 h-3.5 text-white/30" />
            </button>
            <button
              onClick={onCall}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title={t('cb.phone')}
            >
              <Phone className="w-3.5 h-3.5 text-[#00ffcc]" />
            </button>
          </div>
        </div>

        {/* Avatar & Name */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{
              background: `linear-gradient(135deg, ${stageMeta.color}30, rgba(0,212,255,0.2))`,
              border: `2px solid ${stageMeta.color}50`,
              boxShadow: `0 0 20px ${stageMeta.color}30`,
            }}
          >
            <span className="text-xl text-white/80">{contact.name[0]}</span>
          </div>
          <h3 className="text-white/90 tracking-wider mb-1">{contact.name}</h3>
          <p className="text-[11px] text-white/30">
            {contact.position} · {contact.company}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{
                background: `${stageMeta.color}15`,
                color: stageMeta.color,
                border: `1px solid ${stageMeta.color}30`,
              }}
            >
              {contact.stage} · {stageMeta.sublabel}
            </span>
            <RiskBadge level={contact.riskLevel} t={t} />
          </div>
        </div>
      </div>

      {/* AI Score Section */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-[#00d4ff]" />
            {t('cb.aiPortrait')}
          </h4>
          <button
            onClick={onAIEnhance}
            className="text-[9px] px-2 py-0.5 rounded-full transition-all hover:bg-[#00d4ff]/10"
            style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }}
          >
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
            {t('cb.aiEnhance')}
          </button>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <AIScoreBadge score={contact.aiScore} t={t} />
          <div className="flex-1">
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${contact.aiScore}%`,
                  background:
                    contact.aiScore >= 90
                      ? 'linear-gradient(90deg, #00ffc8, #00f0ff)'
                      : contact.aiScore >= 70
                        ? 'linear-gradient(90deg, #00ffcc, #00ffc8)'
                        : 'linear-gradient(90deg, #008b9d, #00ffcc)',
                  boxShadow: `0 0 6px ${contact.aiScore >= 90 ? '#00ffc8' : contact.aiScore >= 70 ? '#00ffcc' : '#008b9d'}50`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          {contact.aiInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] text-white/40">
              <Sparkles className="w-3 h-3 text-[#00d4ff]/60 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
        <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-3">
          {t('cb.contactInfo')}
        </h4>
        <div className="space-y-2.5">
          {[
            { icon: Phone, label: contact.phone, color: '#00ffcc' },
            { icon: Mail, label: contact.email, color: '#00f0ff' },
            { icon: Building2, label: contact.company, color: '#00d4ff' },
            { icon: MapPin, label: contact.address, color: '#00ffc8' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: `${item.color}60` }} />
                <span className="text-[11px] text-white/50 truncate">{item.label || '-'}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
        <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-3">
          {t('cb.interactionData')}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('cb.callCount'), value: contact.totalCalls.toString(), color: '#00ffcc' },
            {
              label: t('cb.customerValue'),
              value: `¥${(contact.totalValue / 1000).toFixed(0)}K`,
              color: '#00ffc8',
            },
            { label: t('cb.lastContact'), value: contact.lastContact, color: '#00f0ff' },
            { label: t('cb.createdDate'), value: contact.createdAt, color: '#00d4ff' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-2.5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <p className="text-[9px] text-white/20 mb-0.5">{s.label}</p>
              <p className="text-xs tabular-nums" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
        <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-3">{t('cb.tags')}</h4>
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{
                background: `${TAG_COLORS[tag] || '#00f0ff'}15`,
                color: TAG_COLORS[tag] || '#00f0ff',
                border: `1px solid ${TAG_COLORS[tag] || '#00f0ff'}30`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Lifecycle Stage Change */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,240,255,0.08)' }}>
        <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-3">
          {t('cb.lifecycleAdvance')}
        </h4>
        <div className="flex gap-1">
          {(['获客', '转化', '成交', '服务', '忠诚'] as const).map((stage, i) => {
            const meta = STAGE_META[stage]
            const isActive = contact.stage === stage
            const stageIdx = ['获客', '转化', '成交', '服务', '忠诚'].indexOf(contact.stage)
            const isPast = i < stageIdx
            return (
              <button
                key={stage}
                onClick={() => onStageChange(stage)}
                className="flex-1 py-1.5 rounded-lg text-[9px] transition-all duration-300"
                style={{
                  background: isActive
                    ? `${meta.color}20`
                    : isPast
                      ? `${meta.color}08`
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? `${meta.color}50` : isPast ? `${meta.color}20` : 'rgba(255,255,255,0.05)'}`,
                  color: isActive
                    ? meta.color
                    : isPast
                      ? `${meta.color}80`
                      : 'rgba(255,255,255,0.2)',
                  boxShadow: isActive ? `0 0 8px ${meta.color}25` : 'none',
                }}
              >
                {stage}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="p-5">
        <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{t('cb.notes')}</h4>
        <p className="text-[11px] text-white/40 leading-relaxed">
          {contact.notes || t('cb.noNotes')}
        </p>
      </div>
    </div>
  )
}

// ---- Main Page ----
/**
 * Contact book page component (legacy CLM view).
 * Displays the 5-stage customer lifecycle funnel with filterable
 * customer cards, health scores, and stage transition controls.
 */
export function ContactBookPage() {
  const { setActivePage } = useApp()
  const { t } = useI18n()
  const { contacts, addContact, updateContact, deleteContact, toggleStar, updateStage } =
    useContacts()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStage, setFilterStage] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editContact, setEditContact] = useState<SharedContact | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'aiScore' | 'lastContact' | 'totalValue'>('aiScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [aiEnhancing, setAiEnhancing] = useState<string | null>(null)

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedId) || null,
    [contacts, selectedId],
  )

  // Filtered + sorted contacts
  const filteredContacts = useMemo(() => {
    let result = contacts
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (filterStage) result = result.filter((c) => c.stage === filterStage)
    if (filterTag) result = result.filter((c) => c.tags.includes(filterTag))

    result = [...result].sort((a, b) => {
      let va: number, vb: number
      switch (sortBy) {
        case 'aiScore':
          va = a.aiScore
          vb = b.aiScore
          break
        case 'totalValue':
          va = a.totalValue
          vb = b.totalValue
          break
        case 'name':
          return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        default:
          va = a.aiScore
          vb = b.aiScore
      }
      return sortDir === 'asc' ? va - vb : vb - va
    })
    return result
  }, [contacts, searchQuery, filterStage, filterTag, sortBy, sortDir])

  // Stats
  const stats = useMemo(() => {
    const total = contacts.length
    const starred = contacts.filter((c) => c.starred).length
    const avgAI = total > 0 ? Math.round(contacts.reduce((s, c) => s + c.aiScore, 0) / total) : 0
    const totalValue = contacts.reduce((s, c) => s + c.totalValue, 0)
    const stageCount = Object.fromEntries(
      (['获客', '转化', '成交', '服务', '忠诚'] as const).map((s) => [
        s,
        contacts.filter((c) => c.stage === s).length,
      ]),
    )
    return { total, starred, avgAI, totalValue, stageCount }
  }, [contacts])

  // Actions — now using shared context
  const handleSave = useCallback(
    (c: SharedContact) => {
      const exists = contacts.find((p) => p.id === c.id)
      if (exists) {
        updateContact(c.id, c)
      } else {
        addContact(c)
      }
      setShowAddModal(false)
      setEditContact(null)
    },
    [contacts, addContact, updateContact],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteContact(id)
      if (selectedId === id) setSelectedId(null)
    },
    [selectedId, deleteContact],
  )

  const handleToggleStar = useCallback(
    (id: string) => {
      toggleStar(id)
    },
    [toggleStar],
  )

  const handleAIEnhance = useCallback(
    (id: string) => {
      setAiEnhancing(id)
      setTimeout(() => {
        const c = contacts.find((c) => c.id === id)
        if (c) {
          const boost = Math.min(100, c.aiScore + Math.floor(Math.random() * 8) + 3)
          const newInsights = [
            ...c.aiInsights,
            `[AI提档] 综合评分提升至 ${boost}`,
            `[AI分析] ${new Date().toLocaleDateString('zh-CN')} 画像更新`,
          ].slice(-4)
          updateContact(id, { aiScore: boost, aiInsights: newInsights })
        }
        setAiEnhancing(null)
      }, 1500)
    },
    [contacts, updateContact],
  )

  const handleStageChange = useCallback(
    (id: string, stage: SharedContact['stage']) => {
      updateStage(id, stage)
    },
    [updateStage],
  )

  const handleExport = useCallback(() => {
    const json = JSON.stringify(contacts, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yyc3_contacts_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [contacts])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement)?.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (Array.isArray(data)) {
            const ids = new Set(contacts.map((c) => c.id))
            data
              .filter((c: Record<string, unknown>) => c.id && c.name && !ids.has(c.id as string))
              .forEach((c: SharedContact) => addContact(c))
          }
        } catch {
          /* */
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [contacts, addContact])

  return (
    <div className="h-full flex" style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}>
      {/* Main List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="shrink-0 p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className="tracking-wider flex items-center gap-3"
                style={{ color: '#00f0ff', textShadow: '0 0 15px rgba(0,240,255,0.5)' }}
              >
                <BookOpen className="w-6 h-6" />
                {t('cb.title')}
              </h2>
              <p className="text-xs text-white/25 mt-1 tracking-wider">{t('cb.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300"
                style={{
                  background: 'rgba(0,240,255,0.06)',
                  border: '1px solid rgba(0,240,255,0.2)',
                  color: '#00f0ff',
                }}
              >
                <Upload className="w-3 h-3" /> {t('cb.import')}
              </button>
              <button
                onClick={handleExport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300"
                style={{
                  background: 'rgba(0,240,255,0.06)',
                  border: '1px solid rgba(0,240,255,0.2)',
                  color: '#00f0ff',
                }}
              >
                <Download className="w-3 h-3" /> {t('cb.export')}
              </button>
              <button
                onClick={() => {
                  setEditContact(null)
                  setShowAddModal(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.15))',
                  border: '1px solid rgba(0,240,255,0.3)',
                  color: '#00f0ff',
                  boxShadow: '0 0 12px rgba(0,240,255,0.15)',
                }}
              >
                <Plus className="w-3 h-3" /> {t('cb.addContact')}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            {[
              {
                label: t('cb.totalContacts'),
                value: stats.total.toString(),
                icon: Users,
                color: '#00f0ff',
              },
              {
                label: t('cb.starredContacts'),
                value: stats.starred.toString(),
                icon: Star,
                color: '#00ffcc',
              },
              {
                label: t('cb.avgAiScore'),
                value: stats.avgAI.toString(),
                icon: Brain,
                color: '#00d4ff',
              },
              {
                label: t('cb.totalValue'),
                value: `¥${(stats.totalValue / 1000).toFixed(0)}K`,
                icon: TrendingUp,
                color: '#00ffc8',
              },
            ].map((m, i) => {
              const Icon = m.icon
              return (
                <div
                  key={i}
                  className="rounded-xl p-3 border transition-all duration-300"
                  style={{ background: 'rgba(10,10,10,0.5)', borderColor: `${m.color}20` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-white/20 uppercase tracking-wider">{m.label}</p>
                      <p
                        className="text-lg tabular-nums mt-0.5"
                        style={{ color: m.color, textShadow: `0 0 8px ${m.color}40` }}
                      >
                        {m.value}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: `${m.color}70` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white/70 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(0,240,255,0.12)',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.12)')}
                placeholder={t('cb.searchPlaceholder')}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 text-[11px]"
              style={{
                background:
                  filterStage || filterTag ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filterStage || filterTag ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: filterStage || filterTag ? '#00d4ff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              {t('cb.filter')}
              {(filterStage || filterTag) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
              )}
            </button>
            {/* Sort */}
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split('-')
                setSortBy(by as any)
                setSortDir(dir as any)
              }}
              className="px-3 py-2.5 rounded-xl text-[11px] text-white/40 outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <option value="aiScore-desc" style={{ background: '#0a0a0a' }}>
                AI ↓
              </option>
              <option value="aiScore-asc" style={{ background: '#0a0a0a' }}>
                AI ↑
              </option>
              <option value="totalValue-desc" style={{ background: '#0a0a0a' }}>
                ¥ ↓
              </option>
              <option value="totalValue-asc" style={{ background: '#0a0a0a' }}>
                ¥ ↑
              </option>
              <option value="name-asc" style={{ background: '#0a0a0a' }}>
                A-Z
              </option>
              <option value="name-desc" style={{ background: '#0a0a0a' }}>
                Z-A
              </option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div
              className="mb-4 rounded-xl p-4 border"
              style={{
                background: 'rgba(10,10,10,0.6)',
                borderColor: 'rgba(0,212,255,0.15)',
                animation: 'spring-in 0.3s var(--spring-easing) both',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">
                  {t('cb.filterConditions')}
                </span>
                {(filterStage || filterTag) && (
                  <button
                    onClick={() => {
                      setFilterStage(null)
                      setFilterTag(null)
                    }}
                    className="text-[9px] text-[#00d4ff]/60 hover:text-[#00d4ff] transition-colors"
                  >
                    {t('cb.clearAll')}
                  </button>
                )}
              </div>
              {/* Stage Filter */}
              <div className="mb-3">
                <p className="text-[9px] text-white/20 mb-2">{t('cb.lifecycleStage')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['获客', '转化', '成交', '服务', '忠诚'] as const).map((stage) => {
                    const meta = STAGE_META[stage]
                    const active = filterStage === stage
                    return (
                      <button
                        key={stage}
                        onClick={() => setFilterStage(active ? null : stage)}
                        className="px-2.5 py-1 rounded-full text-[10px] transition-all duration-200 border flex items-center gap-1"
                        style={{
                          background: active ? `${meta.color}20` : 'transparent',
                          borderColor: active ? `${meta.color}50` : 'rgba(255,255,255,0.06)',
                          color: active ? meta.color : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {stage}
                        <span className="text-[8px] opacity-60">
                          ({stats.stageCount[stage] || 0})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* Tag Filter */}
              <div>
                <p className="text-[9px] text-white/20 mb-2">{t('cb.tags')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map((tag) => {
                    const active = filterTag === tag
                    const color = TAG_COLORS[tag]
                    return (
                      <button
                        key={tag}
                        onClick={() => setFilterTag(active ? null : tag)}
                        className="px-2.5 py-1 rounded-full text-[10px] transition-all duration-200 border"
                        style={{
                          background: active ? `${color}20` : 'transparent',
                          borderColor: active ? `${color}50` : 'rgba(255,255,255,0.06)',
                          color: active ? color : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'none' }}>
          <div className="text-[10px] text-white/15 mb-2">
            {t('cb.contactCount', { count: filteredContacts.length })}
          </div>
          <div className="space-y-1.5">
            {filteredContacts.map((contact, i) => {
              const stageMeta = STAGE_META[contact.stage]
              const isSelected = selectedId === contact.id
              const isEnhancing = aiEnhancing === contact.id
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedId(isSelected ? null : contact.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer group"
                  style={{
                    background: isSelected ? 'rgba(0,240,255,0.06)' : 'rgba(10,10,10,0.4)',
                    borderColor: isSelected ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.04)',
                    boxShadow: isSelected ? '0 0 15px rgba(0,240,255,0.1)' : 'none',
                    animation: `spring-in 0.3s var(--spring-easing) ${i * 0.03}s both`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)'
                      e.currentTarget.style.background = 'rgba(0,240,255,0.03)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.background = 'rgba(10,10,10,0.4)'
                    }
                  }}
                >
                  {/* Star */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleStar(contact.id)
                    }}
                    className="shrink-0 p-0.5 transition-colors"
                  >
                    {contact.starred ? (
                      <Star
                        className="w-4 h-4 text-[#00ffcc] fill-[#00ffcc]"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,204,0.4))' }}
                      />
                    ) : (
                      <StarOff className="w-4 h-4 text-white/10 group-hover:text-white/20 transition-colors" />
                    )}
                  </button>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${stageMeta.color}20, rgba(0,212,255,0.1))`,
                      border: `1px solid ${stageMeta.color}30`,
                    }}
                  >
                    <span className="text-xs text-white/70">{contact.name[0]}</span>
                  </div>

                  {/* Name & Company */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white/80 truncate">{contact.name}</p>
                      {contact.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] px-1.5 py-0.5 rounded-full hidden lg:inline-block"
                          style={{
                            background: `${TAG_COLORS[tag] || '#00f0ff'}12`,
                            color: `${TAG_COLORS[tag] || '#00f0ff'}90`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-white/25 truncate">
                      {contact.position} · {contact.company}
                    </p>
                  </div>

                  {/* Stage Badge */}
                  <div className="hidden sm:block">
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: `${stageMeta.color}15`,
                        color: stageMeta.color,
                        border: `1px solid ${stageMeta.color}25`,
                      }}
                    >
                      {contact.stage}
                    </span>
                  </div>

                  {/* AI Score */}
                  <div className="hidden md:block">
                    <AIScoreBadge score={contact.aiScore} t={t} />
                  </div>

                  {/* Value */}
                  <div className="hidden lg:block text-right min-w-[70px]">
                    <p
                      className="text-xs text-[#00ffc8] tabular-nums"
                      style={{ textShadow: '0 0 6px rgba(0,255,200,0.3)' }}
                    >
                      ¥{(contact.totalValue / 1000).toFixed(0)}K
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="hidden xl:block text-[10px] text-white/25 tabular-nums min-w-[110px]">
                    {contact.phone}
                  </div>

                  {/* Last Contact */}
                  <span className="text-[10px] text-white/15 hidden xl:block min-w-[60px] text-right">
                    {contact.lastContact}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAIEnhance(contact.id)
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#00d4ff]/10 transition-colors"
                      title={t('cb.aiEnhance')}
                    >
                      {isEnhancing ? (
                        <RefreshCw className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]/60" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditContact(contact)
                        setShowAddModal(true)
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-white/20" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(contact.id)
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#005f73]/10 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/15 hover:text-[#005f73]" />
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredContacts.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-white/5 mx-auto mb-3" />
                <p className="text-sm text-white/20">{t('cb.noMatch')}</p>
                <p className="text-[10px] text-white/10 mt-1">{t('cb.noMatchDesc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedContact && (
        <div className="hidden xl:block w-80 shrink-0">
          <ContactDetailPanel
            contact={selectedContact}
            onClose={() => setSelectedId(null)}
            onEdit={() => {
              setEditContact(selectedContact)
              setShowAddModal(true)
            }}
            onCall={() => setActivePage('aicall')}
            onAIEnhance={() => handleAIEnhance(selectedContact.id)}
            onStageChange={(stage) => handleStageChange(selectedContact.id, stage)}
            t={t}
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ContactFormModal
          contact={editContact}
          onSave={handleSave}
          onClose={() => {
            setShowAddModal(false)
            setEditContact(null)
          }}
          t={t}
        />
      )}
    </div>
  )
}
