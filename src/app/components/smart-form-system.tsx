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

import { useApp } from './app-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 智能表单系统 — Smart Form Engine
// Phase 7: 模板选择 · 动态字段 · AI 辅助
// 实时校验 · 霓虹动效提交 · localStorage 持久化
// ==========================================

/** localStorage key for persisting form submission history. */
export const FORM_STORAGE_KEY = 'yyc3_form_submissions'

/** localStorage key for persisting user-created custom form templates. */
export const CUSTOM_TEMPLATES_KEY = 'yyc3_custom_templates'

/** Union type for all possible form field values across all field types. */
export type FormFieldValue = string | number | boolean | string[] | null | undefined

/** Supported field input types in the smart form system. */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'slider'
  | 'date'
  | 'rating'
  | 'file'

/**
 * Definition of a single form field, including type, validation, and AI hints.
 * Used by {@link FormTemplate} to declare the form schema.
 */
export interface FieldDef {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required?: boolean
  options?: string[] // for select/radio/checkbox
  min?: number
  max?: number // for slider/number
  step?: number
  defaultValue?: FormFieldValue
  aiHint?: string // AI suggestion tooltip
  validation?: 'email' | 'phone' | 'url' | 'none'
  color?: string
}

/**
 * Template defining a complete form: metadata, icon, and field schema.
 * Both built-in and user-created templates share this interface.
 */
export interface FormTemplate {
  id: string
  title: string
  subtitle: string
  icon: typeof ClipboardList
  color: string
  description: string
  fields: FieldDef[]
}

// ---- Built-in Templates ----
export const formTemplates: FormTemplate[] = [
  {
    id: 'customer-intake',
    title: '客户录入表',
    subtitle: 'Customer Intake',
    icon: Users,
    color: '#00d4ff',
    description: '新客户信息录入，AI 自动补全公司信息与行业标签',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: '客户姓名',
        placeholder: '请输入客户全名',
        required: true,
        aiHint: 'AI 可从通话记录中自动提取姓名',
        color: '#00d4ff',
      },
      {
        id: 'company',
        type: 'text',
        label: '公司名称',
        placeholder: '请输入公司名称',
        required: true,
        aiHint: '输入后 AI 将自动匹配工商信息',
        color: '#00d4ff',
      },
      {
        id: 'industry',
        type: 'select',
        label: '行业领域',
        required: true,
        options: [
          '科技/互联网',
          '金融/保险',
          '制造/工业',
          '医疗/健康',
          '教育/培训',
          '零售/电商',
          '能源/环保',
          '其他',
        ],
        color: '#00d4ff',
      },
      {
        id: 'phone',
        type: 'text',
        label: '联系电话',
        placeholder: '手机号码',
        required: true,
        validation: 'phone',
        color: '#00f0ff',
      },
      {
        id: 'email',
        type: 'text',
        label: '电子邮箱',
        placeholder: '工作邮箱',
        validation: 'email',
        color: '#00f0ff',
      },
      {
        id: 'value',
        type: 'number',
        label: '预估价值 (¥)',
        placeholder: '客户预估年度价值',
        min: 0,
        max: 10000000,
        color: '#00ffcc',
      },
      {
        id: 'source',
        type: 'radio',
        label: '客户来源',
        required: true,
        options: ['官网注册', 'AI 外呼', '合作伙伴', '行业活动', '社交媒体', '客户推荐'],
        color: '#00ffc8',
      },
      { id: 'priority', type: 'rating', label: '优先级评估', defaultValue: 3, color: '#00ffcc' },
      {
        id: 'tags',
        type: 'checkbox',
        label: '客户标签',
        options: ['高价值', '决策者', '技术型', '价格敏感', '长期合作', '需要跟进'],
        color: '#00f0ff',
      },
      {
        id: 'notes',
        type: 'textarea',
        label: '备注信息',
        placeholder: '补充信息（AI 将分析并生成跟进建议）',
        aiHint: '输入客户详情，AI 将自动生成客户画像',
        color: '#00d4ff',
      },
    ],
  },
  {
    id: 'call-report',
    title: '呼叫报告',
    subtitle: 'Call Report',
    icon: Phone,
    color: '#00ffcc',
    description: '通话结束后快速填写，AI 自动分析对话质量与转化建议',
    fields: [
      {
        id: 'customer',
        type: 'text',
        label: '通话客户',
        placeholder: '客户姓名 · 公司',
        required: true,
        aiHint: 'AI 将从最近通话队列中匹配',
        color: '#00ffcc',
      },
      {
        id: 'duration',
        type: 'text',
        label: '通话时长',
        placeholder: '如 4:32',
        required: true,
        color: '#00ffcc',
      },
      {
        id: 'type',
        type: 'select',
        label: '通话类型',
        required: true,
        options: ['AI 外呼', 'AI 跟进', '人工转接', 'AI 回访', '紧急联络'],
        color: '#00ffcc',
      },
      {
        id: 'sentiment',
        type: 'slider',
        label: '客户情感评分',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 65,
        aiHint: 'AI 已预分析情感指数，可手动微调',
        color: '#00ffc8',
      },
      {
        id: 'intent',
        type: 'radio',
        label: '客户意向',
        required: true,
        options: ['强烈购买', '有兴趣', '需考虑', '暂无需求', '明确拒绝'],
        color: '#00d4ff',
      },
      {
        id: 'outcome',
        type: 'select',
        label: '通话结果',
        required: true,
        options: ['成功转化', '需要回访', '转人工跟进', '客户挂断', '未接通', '加入黑名单'],
        color: '#00f0ff',
      },
      {
        id: 'aiScore',
        type: 'slider',
        label: 'AI 质量评分',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 78,
        color: '#00f0ff',
      },
      { id: 'followup', type: 'toggle', label: '需要跟进', defaultValue: true, color: '#41ffdd' },
      { id: 'followupDate', type: 'date', label: '跟进日期', color: '#41ffdd' },
      {
        id: 'summary',
        type: 'textarea',
        label: '通话摘要',
        placeholder: '通话要点（AI 将自动生成结构化摘要）',
        required: true,
        aiHint: '输入关键词即可，AI 会扩写为完整摘要',
        color: '#00ffcc',
      },
    ],
  },
  {
    id: 'feedback-survey',
    title: '满意度调研',
    subtitle: 'Satisfaction Survey',
    icon: MessageSquare,
    color: '#00f0ff',
    description: '客户服务质量评价表，数据自动汇入数据洞察仪表板',
    fields: [
      {
        id: 'customer',
        type: 'text',
        label: '客户姓名',
        placeholder: '填写客户姓名',
        required: true,
        color: '#00f0ff',
      },
      {
        id: 'overall',
        type: 'rating',
        label: '整体满意度',
        defaultValue: 4,
        required: true,
        color: '#00ffcc',
      },
      { id: 'service', type: 'rating', label: '服务质量', defaultValue: 4, color: '#00ffc8' },
      { id: 'response', type: 'rating', label: '响应速度', defaultValue: 3, color: '#00f0ff' },
      {
        id: 'professionalism',
        type: 'rating',
        label: '专业程度',
        defaultValue: 4,
        color: '#00d4ff',
      },
      {
        id: 'recommend',
        type: 'slider',
        label: '推荐指数 (NPS)',
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 7,
        aiHint: '0=绝不推荐 10=强烈推荐',
        color: '#00ffcc',
      },
      {
        id: 'channels',
        type: 'checkbox',
        label: '常用沟通渠道',
        options: ['电话', '邮件', '微信', '在线会议', '线下见面', 'AI 客服'],
        color: '#00f0ff',
      },
      {
        id: 'improvement',
        type: 'textarea',
        label: '改进建议',
        placeholder: '请分享您的宝贵建议…',
        aiHint: 'AI 将分析情感倾向并分类归档',
        color: '#00d4ff',
      },
      {
        id: 'recontact',
        type: 'toggle',
        label: '愿意接受回访',
        defaultValue: true,
        color: '#00ffc8',
      },
    ],
  },
  {
    id: 'ai-task-config',
    title: 'AI 任务配置',
    subtitle: 'AI Task Config',
    icon: Brain,
    color: '#00ffc8',
    description: '配置 AI 自动化任务参数，精细控制执行策略与触发条件',
    fields: [
      {
        id: 'taskName',
        type: 'text',
        label: '任务名称',
        placeholder: '为此任务命名',
        required: true,
        color: '#00ffc8',
      },
      {
        id: 'taskType',
        type: 'select',
        label: '任务类型',
        required: true,
        options: ['批量外呼', '数据分析', '客户画像', '话术生成', '智能排期', '自动跟进'],
        color: '#00ffc8',
      },
      {
        id: 'priority',
        type: 'radio',
        label: '执行优先级',
        required: true,
        options: ['紧急', '高', '中', '低'],
        color: '#00ffcc',
      },
      {
        id: 'concurrency',
        type: 'slider',
        label: '并发数',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 10,
        color: '#00f0ff',
      },
      {
        id: 'retryCount',
        type: 'number',
        label: '失败重试次数',
        placeholder: '0-5',
        min: 0,
        max: 5,
        defaultValue: 3,
        color: '#41ffdd',
      },
      {
        id: 'aiModel',
        type: 'select',
        label: 'AI 模型',
        options: ['YYC³-Ultra (最强)', 'YYC³-Fast (高速)', 'YYC³-Eco (节能)'],
        color: '#00d4ff',
      },
      { id: 'autoStart', type: 'toggle', label: '立即执行', defaultValue: false, color: '#00ffc8' },
      { id: 'scheduleDate', type: 'date', label: '计划执行时间', color: '#00f0ff' },
      {
        id: 'notifications',
        type: 'checkbox',
        label: '通知方式',
        options: ['系统通知', '邮件通知', '钉钉/企微', '短信通知'],
        color: '#00d4ff',
      },
      {
        id: 'description',
        type: 'textarea',
        label: '任务描述',
        placeholder: '描述任务目标与约束条件…',
        aiHint: 'AI 将根据描述自动优化执行策略',
        color: '#00ffc8',
      },
    ],
  },
]

// ---- Field Type metadata ----
/** Lookup table mapping each {@link FieldType} to its display label, icon component, and theme color. */
export const fieldTypeInfo: Record<FieldType, { label: string; icon: typeof Type; color: string }> =
  {
    text: { label: '文本', icon: Type, color: '#00f0ff' },
    textarea: { label: '多行文本', icon: AlignLeft, color: '#00f0ff' },
    number: { label: '数字', icon: Hash, color: '#00ffcc' },
    select: { label: '下拉选择', icon: List, color: '#00d4ff' },
    radio: { label: '单选', icon: CheckCircle2, color: '#00d4ff' },
    checkbox: { label: '多选', icon: Check, color: '#00ffc8' },
    toggle: { label: '开关', icon: ToggleLeft, color: '#41ffdd' },
    slider: { label: '滑块', icon: Sliders, color: '#00f0ff' },
    date: { label: '日期', icon: Calendar, color: '#00ffcc' },
    rating: { label: '评分', icon: Star, color: '#00ffcc' },
    file: { label: '文件', icon: Upload, color: '#41ffdd' },
  }

// ---- Validation helpers ----
function validateField(field: FieldDef, value: FormFieldValue): string | null {
  if (
    field.required &&
    (value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0))
  ) {
    return `${field.label} 为必填项`
  }
  if (field.validation === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
    return '请输入有效的邮箱地址'
  }
  if (
    field.validation === 'phone' &&
    value &&
    !/^1[3-9]\d{9}$/.test(String(value).replace(/\s/g, ''))
  ) {
    return '请输入有效的手机号码'
  }
  return null
}

// ---- AI suggestion simulator ----
const aiSuggestions: Record<string, string[]> = {
  company: ['星际科技有限公司', '云端据科技', '量子计算集团', '智链网络科技', '未来能源集团'],
  name: ['张明远', '李思琪', '王建华', '陈雅文', '赵鹏飞'],
  taskName: ['Q1 客户复盘外呼', '高价值客户画像分析', '话术 A/B 测试', '流失预警追踪'],
  summary: [
    '客户对新产品方案表现出浓厚兴趣，要求下周安排产品演示会议。',
    '价格敏感，需要提供定制报价方案。建议下次沟通时强调 ROI。',
  ],
  improvement: ['响应速度还可以更快', '希望有更多自助服务选项', 'AI 客服的回答还需要更精准'],
}

// ==========================================
//  Smart Form Page — Main Export
// ==========================================
/**
 * Smart Form page component.
 * Renders a three-tab interface: form filling, submission history, and template builder.
 * Supports AI-assisted field suggestions, real-time validation, and localStorage persistence.
 */
export function SmartFormPage() {
  const { addNotification, addActivity } = useApp()
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
              background: `linear-gradient(135deg, ${template.color}25, rgba(0,212,255,0.15))`,
              border: `2px solid ${template.color}60`,
              boxShadow: `0 0 40px ${template.color}30, inset 0 0 20px ${template.color}10`,
              animation: 'border-glow 2s ease-in-out infinite',
            }}
          >
            <CheckCircle2
              className="w-10 h-10 text-[#00ffc8]"
              style={{ filter: 'drop-shadow(0 0 8px #00ffc8)' }}
            />
          </div>
          <h2
            className="text-xl text-white/90 mb-2"
            style={{ textShadow: '0 0 15px rgba(0,255,200,0.3)' }}
          >
            提交成功
          </h2>
          <p className="text-sm text-white/40 mb-2">「{template.title}」数据已保存并加密传输</p>
          <p className="text-xs text-white/20 mb-8">
            AI 正在分析表单数据，智能建议将在数据洞察面板中呈现
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
              再填一份
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <ChevronRight className="w-4 h-4" />
              返回模板列表
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-[#00ffcc] tracking-wider flex items-center gap-3"
              style={{ textShadow: '0 0 15px rgba(0,255,204,0.5)' }}
            >
              <ClipboardList className="w-6 h-6" />
              智能表单系统
            </h2>
            <p className="text-xs text-white/25 mt-1 tracking-wider">
              Smart Form Engine — AI 辅助动态表单
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5"
              style={{
                background: 'rgba(0,240,255,0.06)',
                border: '1px solid rgba(0,240,255,0.15)',
                color: '#00f0ff',
              }}
            >
              <FileText className="w-3 h-3" />
              已提交 {submissionCount} 份
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: '表单模板',
              value: `${allTemplates.length}`,
              icon: ClipboardList,
              color: '#41ffdd',
              sub: `${formTemplates.length} 内置 · ${customTemplates.length} 自定义`,
            },
            {
              label: '累计提交',
              value: `${submissionCount}`,
              icon: Send,
              color: '#00ffc8',
              sub: '已保存',
            },
            { label: 'AI 辅助率', value: '94.2%', icon: Brain, color: '#00d4ff', sub: '智能补全' },
            {
              label: '校验通过',
              value: '99.8%',
              icon: CheckCircle2,
              color: '#00f0ff',
              sub: '数据质量',
            },
          ].map((m, i) => {
            const Icon = m.icon
            return (
              <NeonCard key={i} color={m.color}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">
                      {m.label}
                    </p>
                    <p
                      className="text-xl"
                      style={{ color: m.color, textShadow: `0 0 10px ${m.color}50` }}
                    >
                      {m.value}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: `${m.color}80` }} />
                  </div>
                </div>
                <p className="text-[10px] mt-2 text-white/20">{m.sub}</p>
              </NeonCard>
            )
          })}
        </div>

        {/* Template Grid */}
        <NeonCard color="#41ffdd" hoverable={false}>
          <h3 className="text-xs text-white/40 mb-5 uppercase tracking-wider">
            选择表单模板 · Form Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTemplates.map((tpl, i) => {
              const Icon = tpl.icon
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className="text-left rounded-2xl p-5 border transition-all duration-400 group relative overflow-hidden hover:-translate-y-1"
                  style={{
                    background: 'rgba(10,10,10,0.5)',
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
                  {/* Glow bg */}
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
                        <h4 className="text-sm text-white/80 mb-0.5">{tpl.title}</h4>
                        <p className="text-[10px] text-white/20">{tpl.subtitle}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors shrink-0 mt-1" />
                    </div>
                    <p className="text-xs text-white/30 leading-relaxed mb-3">{tpl.description}</p>
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
                          background: 'rgba(0,212,255,0.08)',
                          color: '#00d4ff',
                          border: '1px solid rgba(0,212,255,0.2)',
                        }}
                      >
                        <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                        AI 辅助
                      </span>
                      {tpl.fields.some((f) => f.required) && (
                        <span className="text-[9px] text-white/15">
                          {tpl.fields.filter((f) => f.required).length} 必填
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </NeonCard>
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
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ChevronRight className="w-4 h-4 text-white/30 rotate-180" />
          </button>
          <div>
            <h2
              className="tracking-wider flex items-center gap-3"
              style={{ color: template.color, textShadow: `0 0 15px ${template.color}50` }}
            >
              <TemplateIcon className="w-5 h-5" />
              {template.title}
            </h2>
            <p className="text-xs text-white/25 mt-0.5 tracking-wider">
              {template.subtitle} — AI-Powered Smart Form
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Completion indicator */}
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completionPct}%`,
                  background: `linear-gradient(90deg, ${template.color}, #00ffc8)`,
                  boxShadow: `0 0 8px ${template.color}50`,
                }}
              />
            </div>
            <span
              className="text-[10px]"
              style={{ color: completionPct === 100 ? '#00ffc8' : template.color }}
            >
              {filledCount}/{totalFields}
            </span>
          </div>

          <button
            onClick={() => setShowPreview((p) => !p)}
            className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300"
            style={{
              background: showPreview ? `${template.color}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showPreview ? `${template.color}40` : 'rgba(255,255,255,0.08)'}`,
              color: showPreview ? template.color : 'rgba(255,255,255,0.4)',
            }}
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            预览
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main Form */}
        <div className={showPreview ? 'xl:col-span-2' : 'xl:col-span-3'}>
          <NeonCard color={template.color} hoverable={false}>
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
            <div className="mt-8 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px]"
                    style={{
                      background:
                        Object.keys(errors).length > 0
                          ? 'rgba(0,95,115,0.08)'
                          : 'rgba(0,255,200,0.06)',
                      border: `1px solid ${Object.keys(errors).length > 0 ? 'rgba(0,95,115,0.2)' : 'rgba(0,255,200,0.15)'}`,
                      color: Object.keys(errors).length > 0 ? '#005f73' : '#00ffc8',
                    }}
                  >
                    {Object.keys(errors).length > 0 ? (
                      <>
                        <AlertCircle className="w-3 h-3" /> {Object.keys(errors).length} 个错误
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> 校验通过
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all duration-400 relative overflow-hidden disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${template.color}25, rgba(0,212,255,0.15))`,
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
                      AI 处理中…
                      {/* Progress bar inside button */}
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
                      提交表单
                    </>
                  )}
                </button>
              </div>
            </div>
          </NeonCard>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div
            className="xl:col-span-1"
            style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
          >
            <NeonCard color="#00f0ff" hoverable={false}>
              <h3 className="text-xs text-white/40 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-3 h-3" />
                数据预览 · JSON Preview
              </h3>
              <div
                className="rounded-xl p-3 overflow-auto max-h-[60vh]"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(0,240,255,0.1)',
                  scrollbarWidth: 'none',
                }}
              >
                <pre
                  className="text-[10px] text-[#00f0ff]/60 whitespace-pre-wrap break-all"
                  style={{ fontFamily: 'monospace' }}
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
                  <span className="text-white/20">填写进度</span>
                  <span style={{ color: template.color }}>{completionPct}%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/20">必填项</span>
                  <span className="text-[#00ffc8]">
                    {template.fields.filter((f) => f.required && formValues[f.id]).length}/
                    {template.fields.filter((f) => f.required).length}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/20">数据大小</span>
                  <span className="text-white/30">
                    {new Blob([JSON.stringify(formValues)]).size} bytes
                  </span>
                </div>
              </div>
            </NeonCard>
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
    background: 'rgba(10,10,10,0.6)',
    border: `1px solid ${hasError ? 'rgba(0,95,115,0.5)' : `${color}20`}`,
    color: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    transition: 'all 0.3s ease',
    outline: 'none',
  }

  const focusHandler = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = hasError ? 'rgba(0,95,115,0.7)' : `${color}60`
    e.currentTarget.style.boxShadow = `0 0 15px ${hasError ? 'rgba(0,95,115,0.15)' : `${color}15`}`
  }

  const blurHandler = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = hasError ? 'rgba(0,95,115,0.5)' : `${color}20`
    e.currentTarget.style.boxShadow = 'none'
    onBlur()
  }

  return (
    <div style={{ animation: `spring-in 0.3s var(--spring-easing) ${index * 0.04}s both` }}>
      {/* Label Row */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm text-white/60">{field.label}</label>
        {field.required && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(0,95,115,0.08)',
              color: '#005f73',
              border: '1px solid rgba(0,95,115,0.2)',
            }}
          >
            必填
          </span>
        )}
        {field.aiHint && (
          <button
            onClick={onToggleAi}
            className="ml-auto flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-lg transition-all duration-300"
            style={{
              background: showAiSuggestion ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.04)',
              border: `1px solid ${showAiSuggestion ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.12)'}`,
              color: '#00d4ff',
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
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
            color: '#00d4ff',
            animation: 'spring-in 0.3s var(--spring-easing) both',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles
              className="w-3 h-3"
              style={{ animation: 'neon-pulse 2s ease-in-out infinite' }}
            />
            <span className="text-white/40">AI 建议</span>
          </div>
          <p className="text-white/50 mb-2">{field.aiHint}</p>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onApplyAiSuggestion(s)}
                  className="px-2 py-1 rounded-lg text-[9px] transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    color: 'rgba(255,255,255,0.5)',
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="" style={{ background: '#0a0a0a', color: 'rgba(255,255,255,0.3)' }}>
            请选择…
          </option>
          {field.options?.map((opt) => (
            <option
              key={opt}
              value={opt}
              style={{ background: '#0a0a0a', color: 'rgba(255,255,255,0.8)' }}
            >
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
                  background: selected ? `${color}15` : 'rgba(10,10,10,0.5)',
                  border: `1px solid ${selected ? `${color}50` : 'rgba(255,255,255,0.06)'}`,
                  color: selected ? color : 'rgba(255,255,255,0.4)',
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
                  background: checked ? `${color}12` : 'rgba(10,10,10,0.5)',
                  border: `1px solid ${checked ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                  color: checked ? color : 'rgba(255,255,255,0.35)',
                  boxShadow: checked ? `0 0 8px ${color}15` : 'none',
                }}
              >
                {checked ? (
                  <Check className="w-3 h-3 inline mr-1" />
                ) : (
                  <Plus className="w-3 h-3 inline mr-1 opacity-30" />
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
            background: value ? `${color}30` : 'rgba(255,255,255,0.06)',
            border: `1px solid ${value ? `${color}60` : 'rgba(255,255,255,0.1)'}`,
            boxShadow: value ? `0 0 12px ${color}25` : 'none',
          }}
        >
          <div
            className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300"
            style={{
              left: value ? 24 : 4,
              background: value ? color : 'rgba(255,255,255,0.3)',
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
                background: `linear-gradient(to right, ${color} ${(((Number(value) || 0) - (field.min ?? 0)) / ((field.max ?? 100) - (field.min ?? 0))) * 100}%, rgba(255,255,255,0.08) ${(((Number(value) || 0) - (field.min ?? 0)) / ((field.max ?? 100) - (field.min ?? 0))) * 100}%)`,
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
              <span className="text-[9px] text-white/15">{field.min}</span>
              <span className="text-[9px] text-white/15">{field.max}</span>
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
                  color: star <= (Number(value) || 0) ? '#00ffcc' : 'rgba(255,255,255,0.08)',
                  fill: star <= (Number(value) || 0) ? '#00ffcc' : 'transparent',
                  filter:
                    star <= (Number(value) || 0)
                      ? 'drop-shadow(0 0 6px rgba(0,255,204,0.5))'
                      : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </button>
          ))}
          <span className="text-xs text-white/20 ml-2">{value || 0}/5</span>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div
          className="flex items-center gap-1.5 mt-1.5 text-[10px]"
          style={{ color: '#005f73', animation: 'spring-in 0.2s var(--spring-easing) both' }}
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  )
})
