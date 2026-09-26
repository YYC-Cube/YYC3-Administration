/**
 * @file ndb-contacts-tab.tsx
 * @description 号牌库·联系人标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,ContactsTab
 */

import {
  AlertTriangle,
  Check,
  Edit3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { STAGE_KEYS, STAGE_META, TAG_COLORS } from '../number-database-data'
import { AIBadge } from '../number-database-shared'

import type { Contact } from '../number-database-data'

import { useI18n } from '@/app/components/i18n-context'
import { useContacts } from '@/features/customer/pages/contacts-context'

export function ContactsTab({
  contacts,
  setContacts: _setContacts,
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
          t(c.name).toLowerCase().includes(q) ||
          t(c.company).toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.tags.some((tag) => tag.includes(q)),
      )
    }
    if (filterStage) r = r.filter((c) => c.stage === filterStage)
    return r.sort((a, b) => b.aiScore - a.aiScore)
  }, [contacts, search, filterStage, t])

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
            {STAGE_KEYS.map((s) => {
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
                  {t(`ndb.stage.${s}`)}
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
                  <span className="text-[11px] text-white/70">{t(c.name).charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80 truncate">{t(c.name)}</span>
                    {c.tags.slice(0, 1).map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] px-1.5 py-0.5 rounded-full hidden sm:inline"
                        style={{
                          background: `${TAG_COLORS[tag] || '#00f0ff'}12`,
                          color: `${TAG_COLORS[tag] || '#00f0ff'}90`,
                        }}
                      >
                        {t(`ndb.cat.${tag}`)}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/25 truncate">
                    {t(c.position)} · {t(c.company)}
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
                  {t(`ndb.stage.${c.stage}`)}
                </span>
                <div className="hidden lg:block">
                  <AIBadge score={c.aiScore} />
                </div>
                <span className="text-xs text-[#00ffc8] tabular-nums hidden lg:block">
                  ¥{(c.totalValue / 1000).toFixed(0)}K
                </span>
                <span className="text-[10px] text-white/15 hidden xl:block">
                  {t(c.lastContact)}
                </span>
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
              <span className="text-lg text-white/80">{t(selected.name).charAt(0)}</span>
            </div>
            <h3 className="text-white/90 tracking-wider">{t(selected.name)}</h3>
            <p className="text-[10px] text-white/30">
              {t(selected.position)} · {t(selected.company)}
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
              { label: t('ndb.phone'), value: selected.phone, icon: Phone, color: '#00ffcc' },
              { label: t('ndb.email'), value: selected.email, icon: Mail, color: '#00f0ff' },
              {
                label: t('ndb.address'),
                value: t(selected.source),
                icon: MapPin,
                color: '#00ffc8',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-3 h-3 shrink-0" style={{ color: `${item.color}60` }} />
                <span className="text-[10px] text-white/40 truncate">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {[
              { label: t('ndb.aiScore'), value: selected.aiScore.toString(), color: '#00d4ff' },
              { label: t('ndb.calls'), value: selected.totalCalls.toString(), color: '#00ffcc' },
              {
                label: t('ndb.value'),
                value: `¥${(selected.totalValue / 1000).toFixed(0)}K`,
                color: '#00ffc8',
              },
              {
                label: t('ndb.risk'),
                value:
                  selected.riskLevel === 'low'
                    ? t('ndb.riskLow')
                    : selected.riskLevel === 'medium'
                      ? t('ndb.riskMedium')
                      : t('ndb.riskHigh'),
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
            <p className="text-[9px] text-white/20 mb-1">{t('ndb.notes')}</p>
            <p className="text-[10px] text-white/35">{t(selected.notes)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ===========================================================
// Tab: Analytics (智能分析中心)
// ===========================================================
