import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Filter,
  Search,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { NeonCard } from './neon-card'
import { FORM_STORAGE_KEY, formTemplates } from './smart-form-system'

// ==========================================
// YYC³ 表单历史记录 — Form Submission History
// Phase 8: 搜索 · 筛选 · 详情 · CSV 导出 · 删除
// ==========================================

interface SubmissionEntry {
  id: string
  templateId: string
  templateTitle: string
  values: Record<string, string | number | boolean | string[] | null>
  submittedAt: string
}

const templateColorMap: Record<string, string> = {
  'customer-intake': '#00d4ff',
  'call-report': '#00ffcc',
  'feedback-survey': '#00f0ff',
  'ai-task-config': '#00ffc8',
}

/**
 * Form submission history viewer.
 * Displays all previously submitted forms stored in localStorage,
 * with expandable JSON preview and deletion capability.
 */
export function FormHistory() {
  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([])
  const [search, setSearch] = useState('')
  const [filterTemplate, setFilterTemplate] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Load from localStorage
  const loadSubmissions = useCallback(() => {
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY)
      if (raw) setSubmissions(JSON.parse(raw) || [])
      else setSubmissions([])
    } catch {
      setSubmissions([])
    }
  }, [])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  // Filtered list
  const filtered = useMemo(() => {
    let list = submissions
    if (filterTemplate !== 'all') {
      list = list.filter((s) => s.templateId === filterTemplate)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.templateTitle.toLowerCase().includes(q) ||
          JSON.stringify(s.values).toLowerCase().includes(q),
      )
    }
    return list
  }, [submissions, filterTemplate, search])

  // Delete single
  const handleDelete = useCallback(
    (id: string) => {
      const updated = submissions.filter((s) => s.id !== id)
      setSubmissions(updated)
      try {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(updated))
      } catch {
        /* */
      }
      setConfirmDeleteId(null)
      setExpandedId(null)
    },
    [submissions],
  )

  // Clear all
  const handleClearAll = useCallback(() => {
    setSubmissions([])
    try {
      localStorage.setItem(FORM_STORAGE_KEY, '[]')
    } catch {
      /* */
    }
  }, [])

  // CSV export
  const handleExportCSV = useCallback(() => {
    if (filtered.length === 0) return
    // Collect all unique field keys
    const allKeys = new Set<string>()
    filtered.forEach((s) => Object.keys(s.values).forEach((k) => allKeys.add(k)))
    const keys = Array.from(allKeys)

    const headers = ['ID', '模板', '提交时间', ...keys]
    const rows = filtered.map((s) => [
      s.id,
      s.templateTitle,
      new Date(s.submittedAt).toLocaleString('zh-CN'),
      ...keys.map((k) => {
        const v = s.values[k]
        if (Array.isArray(v)) return v.join('; ')
        if (v === true) return '是'
        if (v === false) return '否'
        return String(v ?? '')
      }),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yyc3_form_export_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  function formatTime(iso: string) {
    try {
      const d = new Date(iso)
      const now = Date.now()
      const diff = now - d.getTime()
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
      return d.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  // Template counts
  const templateCounts = useMemo(() => {
    const map: Record<string, number> = {}
    submissions.forEach((s) => {
      map[s.templateId] = (map[s.templateId] || 0) + 1
    })
    return map
  }, [submissions])

  return (
    <div style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}>
      {/* Top bar: search + filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索表单内容…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
            style={{
              background: 'rgba(10,10,10,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.8)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
            }}
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-white/20" />
          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl appearance-none cursor-pointer"
            style={{
              background: 'rgba(10,10,10,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.6)',
              outline: 'none',
            }}
          >
            <option value="all" style={{ background: '#0a0a0a' }}>
              全部模板 ({submissions.length})
            </option>
            {formTemplates.map((t) => (
              <option key={t.id} value={t.id} style={{ background: '#0a0a0a' }}>
                {t.title} ({templateCounts[t.id] || 0})
              </option>
            ))}
          </select>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300 disabled:opacity-30"
            style={{
              background: 'rgba(0,240,255,0.06)',
              border: '1px solid rgba(0,240,255,0.2)',
              color: '#00f0ff',
            }}
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
        </div>
      </div>

      {/* Empty state */}
      {submissions.length === 0 && (
        <NeonCard color="#008b9d" hoverable={false}>
          <div className="text-center py-12">
            <ClipboardList className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30 mb-1">暂无表单记录</p>
            <p className="text-[10px] text-white/15">提交表单后，历史记录将在此显示</p>
          </div>
        </NeonCard>
      )}

      {/* No match */}
      {submissions.length > 0 && filtered.length === 0 && (
        <NeonCard color="#008b9d" hoverable={false}>
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">没有匹配的记录</p>
          </div>
        </NeonCard>
      )}

      {/* Submission List */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((sub, idx) => {
            const color = templateColorMap[sub.templateId] || '#008b9d'
            const isExpanded = expandedId === sub.id
            const isConfirmDelete = confirmDeleteId === sub.id

            return (
              <div
                key={sub.id}
                className="rounded-2xl border overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(10,10,10,0.6)',
                  borderColor: isExpanded ? `${color}40` : 'rgba(255,255,255,0.04)',
                  boxShadow: isExpanded ? `0 0 20px ${color}15` : 'none',
                  animation: `spring-in 0.3s var(--spring-easing) ${idx * 0.03}s both`,
                }}
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}
                  >
                    <FileText className="w-4 h-4" style={{ color: `${color}80` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 truncate">{sub.templateTitle}</p>
                    <p className="text-[9px] text-white/20 flex items-center gap-1.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(sub.submittedAt)}
                    </p>
                  </div>
                  {/* Field count badge */}
                  <span
                    className="text-[9px] px-2 py-0.5 rounded-full text-white/20"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {Object.keys(sub.values).length} 字段
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-white/20 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 shrink-0 transition-colors" />
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4"
                    style={{ animation: 'spring-in 0.25s var(--spring-easing) both' }}
                  >
                    <div
                      className="border-t mb-3"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                    />
                    {/* Data Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {Object.entries(sub.values).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                          <span className="text-[9px] text-white/25 min-w-[60px] shrink-0 pt-0.5">
                            {key}
                          </span>
                          <span className="text-[10px] text-white/50 break-all">
                            {Array.isArray(val)
                              ? val.join(', ')
                              : val === true
                                ? '✓'
                                : val === false
                                  ? '✗'
                                  : String(val || '—')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-white/15">
                        {new Date(sub.submittedAt).toLocaleString('zh-CN')}
                      </span>
                      <div className="flex items-center gap-2">
                        {isConfirmDelete ? (
                          <div
                            className="flex items-center gap-1.5"
                            style={{ animation: 'spring-in 0.2s var(--spring-easing) both' }}
                          >
                            <span className="text-[9px] text-[#005f73]">确认删除？</span>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="px-2 py-1 rounded-lg text-[9px] transition-all"
                              style={{
                                background: 'rgba(0,95,115,0.15)',
                                border: '1px solid rgba(0,95,115,0.3)',
                                color: '#005f73',
                              }}
                            >
                              删除
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg text-[9px] text-white/30 transition-all"
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(sub.id)}
                            className="p-1.5 rounded-lg text-white/15 hover:text-[#005f73] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom stats */}
      {submissions.length > 0 && (
        <div
          className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="text-[10px] text-white/15">
            共 {submissions.length} 条记录 · 显示 {filtered.length} 条
          </span>
          {submissions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[10px] text-white/15 hover:text-[#005f73] transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              清空全部
            </button>
          )}
        </div>
      )}
    </div>
  )
}
