import {
  AlertCircle,
  AlignLeft,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  FileText,
  Hash,
  List,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  Puzzle,
  RefreshCw,
  Send,
  Sliders,
  Sparkles,
  Star,
  ToggleLeft,
  Type,
  Upload,
  Users,
  Wand2,
} from 'lucide-react'
import {
  type CSSProperties,
  type FocusEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  aiSuggestions,
  CUSTOM_TEMPLATES_KEY,
  fieldTypeInfo,
  FORM_STORAGE_KEY,
  formTemplates,
  validateField,
} from './smart-form-data'

import type { FieldDef, FieldType, FormFieldValue, FormTemplate } from './smart-form-data'

import { useApp } from '@/app/components/app-context'
import { useI18n } from '@/app/components/i18n-context'
import { ContentCard, PageHeader, StatCard, TYPOGRAPHY } from '@/app/components/shared-styles'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 智能表单系统 — Smart Form Engine
// Phase 7: 模板选择 · 动态字段 · AI 辅助
// 实时校验 · 霓虹动效提交 · localStorage 持久化
// ==========================================

/** localStorage key for persisting form submission history. */

/** localStorage key for persisting user-created custom form templates. */

/** Union type for all possible form field values across all field types. */
export function SmartFormPage() {
  const { addNotification, addActivity } = useApp()
  const { t } = useI18n()
  const tc = useThemeColors()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, FormFieldValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [aiSuggestionField, setAiSuggestionField] = useState<string | null>(null)
  const [submissionCount, setSubmissionCount] = useState(0)
  const formRef = useRef<HTMLDivElement>(null)

  // Phase 8.5: Load custom templates from localStorage
  const [customTemplates, setCustomTemplates] = useState<FormTemplate[]>([])
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setCustomTemplates(
            parsed.map((ct: Record<string, unknown>) => ({
              id: ct.id as string,
              title: ct.title as string,
              subtitle: (ct.subtitle as string) || 'Custom Template',
              icon: Puzzle,
              color: (ct.color as string) || '#008b9d',
              description: (ct.description as string) || 'Custom Template',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              fields: (ct.fields as any[]) || [],
            })),
          )
        }
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Combined template list (built-in + custom)
  const allTemplates = useMemo(() => [...formTemplates, ...customTemplates], [customTemplates])

  // Load submission count from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        setSubmissionCount(Array.isArray(data) ? data.length : 0)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const template = useMemo(
    () => allTemplates.find((t) => t.id === selectedTemplate) ?? null,
    [selectedTemplate, allTemplates],
  )

  // Initialize form values when template changes
  useEffect(() => {
    if (!template) return
    const defaults: Record<string, FormFieldValue> = {}
    template.fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.id] = f.defaultValue
      else if (f.type === 'checkbox') defaults[f.id] = []
      else if (f.type === 'toggle') defaults[f.id] = false
      else if (f.type === 'slider') defaults[f.id] = f.min ?? 0
      else if (f.type === 'rating') defaults[f.id] = 0
      else defaults[f.id] = ''
    })
    setFormValues(defaults)
    setErrors({})
    setTouched(new Set())
    setSubmitSuccess(false)
    setShowPreview(false)
  }, [template])

  const updateField = useCallback((fieldId: string, value: FormFieldValue) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }))
    setTouched((prev) => new Set(prev).add(fieldId))
    // Clear error on change
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const validateAll = useCallback((): boolean => {
    if (!template) return false
    const newErrors: Record<string, string> = {}
    template.fields.forEach((f) => {
      const err = validateField(f, formValues[f.id])
      if (err) newErrors[f.id] = err
    })
    setErrors(newErrors)
    // Mark all as touched
    setTouched(new Set(template.fields.map((f) => f.id)))
    return Object.keys(newErrors).length === 0
  }, [template, formValues])

  const handleSubmit = useCallback(async () => {
    if (!validateAll() || !template) return
    setIsSubmitting(true)

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 1800))

    // Save to localStorage
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY)
      const existing = raw ? JSON.parse(raw) : []
      const entry = {
        id: `form_${Date.now()}`,
        templateId: template.id,
        templateTitle: template.title,
        values: formValues,
        submittedAt: new Date().toISOString(),
      }
      const updated = [entry, ...existing].slice(0, 100)
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(updated))
      setSubmissionCount(updated.length)
    } catch {
      /* ignore */
    }

    // Add notification + activity
    addNotification({
      title: `表单提交成功`,
      message: `「${template.title}」已提交并保存，AI 正在处理数据…`,
      type: 'success',
      color: '#00ffc8',
    })
    addActivity({
      action: '表单提交',
      target: `${template.title} · 智能表单系统`,
      type: 'system',
      color: template.color,
    })

    setIsSubmitting(false)
    setSubmitSuccess(true)
  }, [validateAll, template, formValues, addNotification, addActivity])

  const resetForm = useCallback(() => {
    setSubmitSuccess(false)
    setSelectedTemplate(null)
    setFormValues({})
    setErrors({})
    setTouched(new Set())
  }, [])

  const showAiSuggestion = useCallback((fieldId: string) => {
    setAiSuggestionField((prev) => (prev === fieldId ? null : fieldId))
  }, [])

  // ---- Computed stats ----
  const filledCount = useMemo(() => {
    if (!template) return 0
    return template.fields.filter((f) => {
      const v = formValues[f.id]
      if (v === undefined || v === null || v === '') return false
      if (Array.isArray(v) && v.length === 0) return false
      return true
    }).length
  }, [template, formValues])

  const totalFields = template?.fields.length ?? 0
  const completionPct = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0

  // ==================== RENDER ====================

  // Success state
  if (submitSuccess && template) {
    return (
      <div
        className="h-full overflow-y-auto p-6 flex items-center justify-center"
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          className="text-center max-w-md"
          style={{ animation: 'spring-in 0.5s var(--spring-easing) both' }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: `linear-gradient(135deg, ${template.color}25, ${tc.alpha(tc.secondary, 0.15)})`,
              border: `2px solid ${template.color}60`,
              boxShadow: `0 0 40px ${template.color}30, inset 0 0 20px ${template.color}10`,
              animation: 'border-glow 2s ease-in-out infinite',
            }}
          >
            <CheckCircle2
              className="w-10 h-10"
              style={{ color: tc.success, filter: `drop-shadow(0 0 8px ${tc.success})` }}
            />
          </div>
          <h2
            className="text-xl mb-2"
            style={{ color: tc.textPrimary, textShadow: `0 0 15px ${tc.alpha(tc.success, 0.3)}` }}
          >
            {t('form.submitSuccess')}
          </h2>
          <p className="text-sm mb-2" style={{ color: tc.textMuted }}>
            「{template.title}」{t('form.dataSaved')}
          </p>
          <p className="text-xs mb-8" style={{ color: tc.muted }}>
            {t('form.aiAnalyzing')}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitSuccess(false)
              }}
              className="px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all duration-300"
              style={{
                background: `${template.color}12`,
                border: `1px solid ${template.color}40`,
                color: template.color,
              }}
            >
              <RefreshCw className="w-4 h-4" />
              {t('form.fillAgain')}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all duration-300"
              style={{
                background: tc.alpha(tc.borderDefault, 0.04),
                border: `1px solid ${tc.borderDefault}`,
                color: tc.textMuted,
              }}
            >
              <ChevronRight className="w-4 h-4" />
              {t('form.backToList')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Template selector
  if (!template) {
    return (
      <div
        className="h-full overflow-y-auto p-6"
        style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
      >
        {/* Header */}
        <PageHeader
          title={t('nav.smartForm')}
          subtitle="Smart Form Engine — AI 辅助动态表单"
          actions={
            <div
              className="px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5"
              style={{
                background: tc.alpha(tc.primary, 0.06),
                border: `1px solid ${tc.alpha(tc.primary, 0.15)}`,
                color: tc.primary,
              }}
            >
              <FileText className="w-3 h-3" />
              {t('form.submittedCount', { count: submissionCount })}
            </div>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: t('form.templateCount'),
              value: `${allTemplates.length}`,
              icon: ClipboardList,
              color: tc.primary,
            },
            {
              label: t('form.submissionCount'),
              value: `${submissionCount}`,
              icon: Send,
              color: tc.success,
            },
            { label: t('form.aiAssistRate'), value: '94.2%', icon: Brain, color: tc.secondary },
            {
              label: t('form.validationRate'),
              value: '99.8%',
              icon: CheckCircle2,
              color: tc.primary,
            },
          ].map((m, i) => (
            <StatCard key={i} label={m.label} value={m.value} icon={m.icon} color={m.color} />
          ))}
        </div>

        {/* Template Grid */}
        <ContentCard title={t('form.selectTemplate')} color={tc.primary}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTemplates.map((tpl, i) => {
              const Icon = tpl.icon
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className="text-left rounded-2xl p-5 border transition-all duration-400 group relative overflow-hidden hover:-translate-y-1"
                  style={{
                    background: tc.bgCard,
                    borderColor: `${tpl.color}20`,
                    animation: `spring-in 0.4s var(--spring-easing) ${i * 0.08}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${tpl.color}50`
                    e.currentTarget.style.boxShadow = `0 0 25px ${tpl.color}20, inset 0 0 15px ${tpl.color}08`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${tpl.color}20`
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 30% 50%, ${tpl.color}08, transparent 70%)`,
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                        style={{
                          background: `${tpl.color}15`,
                          border: `1px solid ${tpl.color}30`,
                          boxShadow: `0 0 10px ${tpl.color}15`,
                        }}
                      >
                        <Icon className="w-6 h-6" style={{ color: tpl.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm" style={{ color: tc.textPrimary }}>
                          {tpl.title}
                        </h4>
                        <p className={TYPOGRAPHY.bodyMuted}>{tpl.subtitle}</p>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 transition-colors shrink-0 mt-1"
                        style={{ color: tc.muted }}
                      />
                    </div>
                    <p className="text-xs" style={{ color: tc.textMuted }}>
                      {tpl.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full"
                        style={{
                          background: `${tpl.color}10`,
                          color: tpl.color,
                          border: `1px solid ${tpl.color}25`,
                        }}
                      >
                        {tpl.fields.length} 个字段
                      </span>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full"
                        style={{
                          background: tc.alpha(tc.secondary, 0.08),
                          color: tc.secondary,
                          border: `1px solid ${tc.alpha(tc.secondary, 0.2)}`,
                        }}
                      >
                        <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                        {t('form.aiAssist')}
                      </span>
                      {tpl.fields.some((f) => f.required) && (
                        <span className="text-[9px]" style={{ color: tc.muted }}>
                          {tpl.fields.filter((f) => f.required).length} {t('form.required')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </ContentCard>
      </div>
    )
  }

  // ---- Active Form ----
  const TemplateIcon = template.icon

  return (
    <div
      className="h-full overflow-y-auto p-6"
      ref={formRef}
      style={{ scrollbarWidth: 'none', animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Form Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={resetForm}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ border: `1px solid ${tc.alpha(tc.border, 0.06)}` }}
          >
            <ChevronRight className="w-4 h-4" style={{ color: tc.muted }} />
          </button>
          <div>
            <h2
              className="tracking-wider flex items-center gap-3"
              style={{ color: template.color, textShadow: `0 0 15px ${template.color}50` }}
            >
              <TemplateIcon className="w-5 h-5" />
              {template.title}
            </h2>
            <p className={TYPOGRAPHY.bodyMuted}>{template.subtitle} — AI-Powered Smart Form</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Completion indicator */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div
              className="w-24 h-1.5 rounded-full"
              style={{ background: tc.alpha(tc.border, 0.05) }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionPct}%`,
                  background: `linear-gradient(90deg, ${template.color}, ${tc.primary})`,
                  boxShadow: `0 0 8px ${template.color}50`,
                }}
              />
            </div>
            <span
              className="text-[10px]"
              style={{ color: completionPct === 100 ? tc.primary : template.color }}
            >
              {filledCount}/{totalFields}
            </span>
          </div>

          <button
            onClick={() => setShowPreview((p) => !p)}
            className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300"
            style={{
              background: showPreview ? `${template.color}15` : tc.alpha(tc.border, 0.03),
              border: `1px solid ${showPreview ? `${template.color}40` : tc.alpha(tc.border, 0.08)}`,
              color: showPreview ? template.color : tc.muted,
            }}
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {t('form.preview')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main Form */}
        <div className={showPreview ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <ContentCard color={template.color}>
            <div className="space-y-5">
              {template.fields.map((field, idx) => (
                <FormField
                  key={field.id}
                  field={field}
                  value={formValues[field.id]}
                  error={touched.has(field.id) ? errors[field.id] : undefined}
                  onChange={(v) => updateField(field.id, v)}
                  onBlur={() => {
                    setTouched((prev) => new Set(prev).add(field.id))
                    const err = validateField(field, formValues[field.id])
                    if (err) setErrors((prev) => ({ ...prev, [field.id]: err }))
                  }}
                  showAiSuggestion={aiSuggestionField === field.id}
                  onToggleAi={() => showAiSuggestion(field.id)}
                  onApplyAiSuggestion={(v) => {
                    updateField(field.id, v)
                    setAiSuggestionField(null)
                  }}
                  index={idx}
                  templateColor={template.color}
                />
              ))}
            </div>

            {/* Submit Area */}
            <div
              className="mt-8 pt-5 border-t"
              style={{ borderColor: tc.alpha(tc.borderDefault, 0.04) }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px]"
                    style={{
                      background:
                        Object.keys(errors).length > 0
                          ? tc.alpha(tc.danger, 0.08)
                          : tc.alpha(tc.success, 0.06),
                      border: `1px solid ${
                        Object.keys(errors).length > 0
                          ? tc.alpha(tc.danger, 0.2)
                          : tc.alpha(tc.success, 0.15)
                      }`,
                      color: Object.keys(errors).length > 0 ? tc.danger : tc.success,
                    }}
                  >
                    {Object.keys(errors).length > 0 ? (
                      <>
                        <AlertCircle className="w-3 h-3" /> {Object.keys(errors).length}{' '}
                        {t('form.errors')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> {t('form.validated')}
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all duration-400 relative overflow-hidden disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${template.color}25, ${tc.alpha(tc.secondary, 0.15)})`,
                    border: `1px solid ${template.color}60`,
                    color: template.color,
                    boxShadow: `0 0 20px ${template.color}20`,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="w-4 h-4"
                        style={{ animation: 'icon-spin 1s linear infinite' }}
                      />
                      {t('form.processing')}
                      <div
                        className="absolute bottom-0 left-0 h-0.5 rounded-full"
                        style={{
                          background: template.color,
                          animation: 'export-progress 1.8s ease-in-out forwards',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('form.submit')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </ContentCard>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div
            className="xl:col-span-1"
            style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
          >
            <ContentCard title={t('form.dataPreview')} color={tc.primary}>
              <div
                className="rounded-xl p-3 overflow-auto max-h-[60vh]"
                style={{
                  background: tc.alpha(tc.bgCard, 0.4),
                  border: `1px solid ${tc.alpha(tc.primary, 0.1)}`,
                  scrollbarWidth: 'none',
                }}
              >
                <pre
                  className="text-[10px] whitespace-pre-wrap break-all"
                  style={{ fontFamily: 'monospace', color: tc.alpha(tc.primary, 0.6) }}
                >
                  {JSON.stringify(
                    {
                      template: template.id,
                      timestamp: new Date().toISOString(),
                      data: formValues,
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
              {/* Field stats */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: tc.muted }}>{t('form.completion')}</span>
                  <span style={{ color: template.color }}>{completionPct}%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: tc.muted }}>{t('form.requiredFields')}</span>
                  <span style={{ color: tc.primary }}>
                    {template.fields.filter((f) => f.required && formValues[f.id]).length}/
                    {template.fields.filter((f) => f.required).length}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: tc.muted }}>{t('form.dataSize')}</span>
                  <span style={{ color: tc.alpha(tc.textPrimary, 0.3) }}>
                    {new Blob([JSON.stringify(formValues)]).size} bytes
                  </span>
                </div>
              </div>
            </ContentCard>
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
//  Individual Form Field Renderer
// ==========================================
const FormField = memo(function FormField({
  field,
  value,
  error,
  onChange,
  onBlur,
  showAiSuggestion,
  onToggleAi,
  onApplyAiSuggestion,
  index,
  templateColor,
}: {
  field: FieldDef
  value: FormFieldValue
  error?: string
  onChange: (v: FormFieldValue) => void
  onBlur: () => void
  showAiSuggestion: boolean
  onToggleAi: () => void
  onApplyAiSuggestion: (v: FormFieldValue) => void
  index: number
  templateColor: string
}) {
  const { t } = useI18n()
  const tc = useThemeColors()
  const color = field.color || templateColor
  const hasError = !!error
  const suggestions = aiSuggestions[field.id] || []
  const strValue = (
    value == null
      ? ''
      : typeof value === 'boolean'
        ? String(value)
        : Array.isArray(value)
          ? value.join(', ')
          : value
  ) as string | number

  const inputStyle: CSSProperties = {
    background: tc.bgCard,
    border: `1px solid ${hasError ? tc.alpha(tc.danger, 0.5) : `${color}20`}`,
    color: tc.textPrimary,
    borderRadius: 12,
    transition: 'all 0.3s ease',
    outline: 'none',
  }

  const focusHandler = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = hasError ? tc.alpha(tc.danger, 0.7) : `${color}60`
    e.currentTarget.style.boxShadow = `0 0 15px ${hasError ? tc.alpha(tc.danger, 0.15) : `${color}15`}`
  }

  const blurHandler = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = hasError ? tc.alpha(tc.danger, 0.5) : `${color}20`
    e.currentTarget.style.boxShadow = 'none'
    onBlur()
  }

  return (
    <div style={{ animation: `spring-in 0.3s var(--spring-easing) ${index * 0.04}s both` }}>
      {/* Label Row */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm" style={{ color: tc.textMuted }}>
          {field.label}
        </label>
        {field.required && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{
              background: tc.alpha(tc.danger, 0.08),
              color: tc.danger,
              border: `1px solid ${tc.alpha(tc.danger, 0.2)}`,
            }}
          >
            {t('form.required')}
          </span>
        )}
        {field.aiHint && (
          <button
            onClick={onToggleAi}
            className="ml-auto flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-lg transition-all duration-300"
            style={{
              background: showAiSuggestion
                ? tc.alpha(tc.secondary, 0.12)
                : tc.alpha(tc.secondary, 0.04),
              border: `1px solid ${showAiSuggestion ? tc.alpha(tc.secondary, 0.4) : tc.alpha(tc.secondary, 0.12)}`,
              color: tc.secondary,
            }}
          >
            <Wand2 className="w-2.5 h-2.5" />
            AI
          </button>
        )}
      </div>

      {/* AI Hint */}
      {showAiSuggestion && field.aiHint && (
        <div
          className="mb-2 px-3 py-2 rounded-xl text-[10px]"
          style={{
            background: tc.alpha(tc.secondary, 0.06),
            border: `1px solid ${tc.alpha(tc.secondary, 0.15)}`,
            color: tc.secondary,
            animation: 'spring-in 0.3s var(--spring-easing) both',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles
              className="w-3 h-3"
              style={{ animation: 'neon-pulse 2s ease-in-out infinite' }}
            />
            <span style={{ color: tc.muted }}>{t('form.aiSuggestion')}</span>
          </div>
          <p style={{ color: tc.textMuted }} className="mb-2">
            {field.aiHint}
          </p>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onApplyAiSuggestion(s)}
                  className="px-2 py-1 rounded-lg text-[9px] transition-all duration-200 hover:scale-105"
                  style={{
                    background: tc.alpha(tc.secondary, 0.08),
                    border: `1px solid ${tc.alpha(tc.secondary, 0.25)}`,
                    color: tc.textMuted,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Field Input */}
      {field.type === 'text' && (
        <input
          type="text"
          value={strValue || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
          placeholder={field.placeholder}
          className="w-full px-4 py-2.5 text-sm"
          style={inputStyle}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={strValue ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          onFocus={focusHandler}
          onBlur={blurHandler}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          className="w-full px-4 py-2.5 text-sm"
          style={inputStyle}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={strValue || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
          placeholder={field.placeholder}
          rows={3}
          className="w-full px-4 py-2.5 text-sm resize-none"
          style={{ ...inputStyle, scrollbarWidth: 'none' }}
        />
      )}

      {field.type === 'select' && (
        <select
          value={strValue || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
          className="w-full px-4 py-2.5 text-sm appearance-none cursor-pointer"
          style={{
            ...inputStyle,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='${encodeURIComponent(tc.muted)}' stroke-width='2'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="" style={{ background: tc.bgCard, color: tc.muted }}>
            {t('form.select')}
          </option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt} style={{ background: tc.bgCard, color: tc.textPrimary }}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const selected = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className="px-3 py-2 rounded-xl text-xs transition-all duration-300"
                style={{
                  background: selected ? `${color}15` : tc.bgCard,
                  border: `1px solid ${selected ? `${color}50` : tc.borderDefault}`,
                  color: selected ? color : tc.textMuted,
                  boxShadow: selected ? `0 0 10px ${color}20` : 'none',
                }}
              >
                {selected && <Check className="w-3 h-3 inline mr-1" />}
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {field.type === 'checkbox' && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => {
            const arr = Array.isArray(value) ? value : []
            const checked = arr.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const next = checked ? arr.filter((v: string) => v !== opt) : [...arr, opt]
                  onChange(next)
                }}
                className="px-3 py-2 rounded-xl text-xs transition-all duration-300"
                style={{
                  background: checked ? `${color}12` : tc.bgCard,
                  border: `1px solid ${checked ? `${color}40` : tc.borderDefault}`,
                  color: checked ? color : tc.textMuted,
                  boxShadow: checked ? `0 0 8px ${color}15` : 'none',
                }}
              >
                {checked ? (
                  <Check className="w-3 h-3 inline mr-1" />
                ) : (
                  <Plus className="w-3 h-3 inline mr-1" style={{ color: tc.muted }} />
                )}
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {field.type === 'toggle' && (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className="relative w-12 h-7 rounded-full transition-all duration-300"
          style={{
            background: value ? `${color}30` : tc.borderDefault,
            border: `1px solid ${value ? `${color}60` : tc.borderDefault}`,
            boxShadow: value ? `0 0 12px ${color}25` : 'none',
          }}
        >
          <div
            className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
            style={{
              left: value ? 24 : 4,
              background: value ? color : tc.muted,
              boxShadow: value ? `0 0 6px ${color}` : 'none',
            }}
          />
        </button>
      )}

      {field.type === 'slider' && (
        <div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              value={strValue ?? field.min ?? 0}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${color} ${(((Number(value) || 0) - (field.min ?? 0)) / ((field.max ?? 100) - (field.min ?? 0))) * 100}%, ${tc.alpha(tc.borderDefault, 0.5)} ${(((Number(value) || 0) - (field.min ?? 0)) / ((field.max ?? 100) - (field.min ?? 0))) * 100}%)`,
                accentColor: color,
              }}
            />
            <span
              className="text-sm w-12 text-center px-2 py-1 rounded-lg"
              style={{
                background: `${color}10`,
                border: `1px solid ${color}25`,
                color,
                textShadow: `0 0 8px ${color}40`,
              }}
            >
              {value ?? 0}
            </span>
          </div>
          {field.min !== undefined && field.max !== undefined && (
            <div className="flex justify-between mt-1">
              <span className="text-[9px]" style={{ color: tc.muted }}>
                {field.min}
              </span>
              <span className="text-[9px]" style={{ color: tc.muted }}>
                {field.max}
              </span>
            </div>
          )}
        </div>
      )}

      {field.type === 'date' && (
        <input
          type="date"
          value={strValue || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={focusHandler}
          onBlur={blurHandler}
          className="w-full px-4 py-2.5 text-sm"
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />
      )}

      {field.type === 'rating' && (
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star === value ? 0 : star)}
              className="transition-all duration-200 hover:scale-125"
            >
              <Star
                className="w-7 h-7"
                style={{
                  color: star <= (Number(value) || 0) ? color : tc.borderDefault,
                  fill: star <= (Number(value) || 0) ? color : 'transparent',
                  filter:
                    star <= (Number(value) || 0)
                      ? `drop-shadow(0 0 6px ${tc.alpha(color, 0.5)})`
                      : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </button>
          ))}
          <span className="text-xs" style={{ color: tc.muted }}>
            {value || 0}/5
          </span>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div
          className="flex items-center gap-1.5 mt-1.5 text-[10px]"
          style={{ color: tc.danger, animation: 'spring-in 0.2s var(--spring-easing) both' }}
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  )
})
