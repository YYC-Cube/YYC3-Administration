/**
 * @file number-database-modals.tsx
 * @description 客户号牌库弹窗:联系人表单与回收站面板
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,modals
 */

import { Check, Database, Phone, Repeat, Trash2, Undo2, UserPlus, X, Zap } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { ALL_TAGS, STAGE_KEYS, STAGE_META, TAG_COLORS } from './number-database-data'

import type { Contact } from './number-database-data'

import { useI18n } from '@/app/components/i18n-context'
import { useContacts } from '@/features/customer/pages/contacts-context'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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
      stage: 'acquisition',
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
  const showValueField = form.stage !== 'acquisition' // Value only visible after acquisition
  const showRenewalField = form.stage === 'service' || form.stage === 'loyalty' // Renewal notes for service/loyalty
  const showRiskField = form.stage !== 'loyalty' // Risk not relevant for loyal customers

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
              {STAGE_KEYS.map((stage) => {
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
                    {t(`ndb.stage.${stage}`)}
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

export { ContactFormModal, RecycleBinPanel }
