/**
 * @file smart-form-data.ts
 * @description 智能表单数据层:字段/模板类型、内置模板库、字段类型元信息、
 *   校验器与 AI 建议池(P2-③ 巨石拆分,自 smart-form-system.tsx 抽出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags forms,data,supply-chain
 */

import {
  AlignLeft,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Hash,
  List,
  MessageSquare,
  Phone,
  Sliders,
  Star,
  ToggleLeft,
  Type,
  Upload,
  Users,
} from 'lucide-react'

export const FORM_STORAGE_KEY = 'yyc3_form_submissions'
export const CUSTOM_TEMPLATES_KEY = 'yyc3_custom_templates'

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
export function validateField(field: FieldDef, value: FormFieldValue): string | null {
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
export const aiSuggestions: Record<string, string[]> = {
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
