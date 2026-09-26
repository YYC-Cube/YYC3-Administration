/**
 * @file smart-form-data.ts
 * @description 智能表单数据层:字段/模板类型、内置模板库、字段类型元信息、
 *   校验器与 AI 建议池(P2-③ 巨石拆分,自 smart-form-system.tsx 抽出)
 *   注:显示值均为 i18n 键(sfd.*),渲染点须以 t() 包裹
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
// Display strings (title/description/label/placeholder/options/aiHint) are i18n keys (sfd.*);
// render points must wrap them with t(). Non-key legacy values fall through t() unchanged.
export const formTemplates: FormTemplate[] = [
  {
    id: 'customer-intake',
    title: 'sfd.tpl.customerIntake.title',
    subtitle: 'Customer Intake',
    icon: Users,
    color: '#00d4ff',
    description: 'sfd.tpl.customerIntake.description',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'sfd.field.customerName.label',
        placeholder: 'sfd.field.customerName.placeholder',
        required: true,
        aiHint: 'sfd.field.customerName.aiHint',
        color: '#00d4ff',
      },
      {
        id: 'company',
        type: 'text',
        label: 'sfd.field.companyName.label',
        placeholder: 'sfd.field.companyName.placeholder',
        required: true,
        aiHint: 'sfd.field.companyName.aiHint',
        color: '#00d4ff',
      },
      {
        id: 'industry',
        type: 'select',
        label: 'sfd.field.industry.label',
        required: true,
        options: [
          'sfd.opt.industry.tech',
          'sfd.opt.industry.finance',
          'sfd.opt.industry.manufacturing',
          'sfd.opt.industry.healthcare',
          'sfd.opt.industry.education',
          'sfd.opt.industry.retail',
          'sfd.opt.industry.energy',
          'sfd.opt.other',
        ],
        color: '#00d4ff',
      },
      {
        id: 'phone',
        type: 'text',
        label: 'sfd.field.phone.label',
        placeholder: 'sfd.field.phone.placeholder',
        required: true,
        validation: 'phone',
        color: '#00f0ff',
      },
      {
        id: 'email',
        type: 'text',
        label: 'sfd.field.email.label',
        placeholder: 'sfd.field.email.placeholder',
        validation: 'email',
        color: '#00f0ff',
      },
      {
        id: 'value',
        type: 'number',
        label: 'sfd.field.estimatedValue.label',
        placeholder: 'sfd.field.estimatedValue.placeholder',
        min: 0,
        max: 10000000,
        color: '#00ffcc',
      },
      {
        id: 'source',
        type: 'radio',
        label: 'sfd.field.source.label',
        required: true,
        options: [
          'sfd.opt.source.website',
          'sfd.opt.source.aiCall',
          'sfd.opt.source.partner',
          'sfd.opt.source.event',
          'sfd.opt.source.social',
          'sfd.opt.source.referral',
        ],
        color: '#00ffc8',
      },
      {
        id: 'priority',
        type: 'rating',
        label: 'sfd.field.priority.label',
        defaultValue: 3,
        color: '#00ffcc',
      },
      {
        id: 'tags',
        type: 'checkbox',
        label: 'sfd.field.tags.label',
        options: [
          'sfd.opt.tag.highValue',
          'sfd.opt.tag.decisionMaker',
          'sfd.opt.tag.technical',
          'sfd.opt.tag.priceSensitive',
          'sfd.opt.tag.longTerm',
          'sfd.opt.tag.needsFollowUp',
        ],
        color: '#00f0ff',
      },
      {
        id: 'notes',
        type: 'textarea',
        label: 'sfd.field.notes.label',
        placeholder: 'sfd.field.notes.placeholder',
        aiHint: 'sfd.field.notes.aiHint',
        color: '#00d4ff',
      },
    ],
  },
  {
    id: 'call-report',
    title: 'sfd.tpl.callReport.title',
    subtitle: 'Call Report',
    icon: Phone,
    color: '#00ffcc',
    description: 'sfd.tpl.callReport.description',
    fields: [
      {
        id: 'customer',
        type: 'text',
        label: 'sfd.field.callContact.label',
        placeholder: 'sfd.field.callContact.placeholder',
        required: true,
        aiHint: 'sfd.field.callContact.aiHint',
        color: '#00ffcc',
      },
      {
        id: 'duration',
        type: 'text',
        label: 'sfd.field.callDuration.label',
        placeholder: 'sfd.field.callDuration.placeholder',
        required: true,
        color: '#00ffcc',
      },
      {
        id: 'type',
        type: 'select',
        label: 'sfd.field.callType.label',
        required: true,
        options: [
          'sfd.opt.source.aiCall',
          'sfd.opt.callType.aiFollowUp',
          'sfd.opt.callType.manualTransfer',
          'sfd.opt.callType.aiCallback',
          'sfd.opt.callType.urgent',
        ],
        color: '#00ffcc',
      },
      {
        id: 'sentiment',
        type: 'slider',
        label: 'sfd.field.sentimentScore.label',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 65,
        aiHint: 'sfd.field.sentimentScore.aiHint',
        color: '#00ffc8',
      },
      {
        id: 'intent',
        type: 'radio',
        label: 'sfd.field.intent.label',
        required: true,
        options: [
          'sfd.opt.intent.strongBuy',
          'sfd.opt.intent.interested',
          'sfd.opt.intent.considering',
          'sfd.opt.intent.noNeed',
          'sfd.opt.intent.declined',
        ],
        color: '#00d4ff',
      },
      {
        id: 'outcome',
        type: 'select',
        label: 'sfd.field.outcome.label',
        required: true,
        options: [
          'sfd.opt.outcome.converted',
          'sfd.opt.outcome.needsCallback',
          'sfd.opt.outcome.transferHuman',
          'sfd.opt.outcome.hungUp',
          'sfd.opt.outcome.noAnswer',
          'sfd.opt.outcome.blacklisted',
        ],
        color: '#00f0ff',
      },
      {
        id: 'aiScore',
        type: 'slider',
        label: 'sfd.field.aiQualityScore.label',
        min: 0,
        max: 100,
        step: 1,
        defaultValue: 78,
        color: '#00f0ff',
      },
      {
        id: 'followup',
        type: 'toggle',
        label: 'sfd.field.needsFollowUp.label',
        defaultValue: true,
        color: '#41ffdd',
      },
      { id: 'followupDate', type: 'date', label: 'sfd.field.followUpDate.label', color: '#41ffdd' },
      {
        id: 'summary',
        type: 'textarea',
        label: 'sfd.field.callSummary.label',
        placeholder: 'sfd.field.callSummary.placeholder',
        required: true,
        aiHint: 'sfd.field.callSummary.aiHint',
        color: '#00ffcc',
      },
    ],
  },
  {
    id: 'feedback-survey',
    title: 'sfd.tpl.feedbackSurvey.title',
    subtitle: 'Satisfaction Survey',
    icon: MessageSquare,
    color: '#00f0ff',
    description: 'sfd.tpl.feedbackSurvey.description',
    fields: [
      {
        id: 'customer',
        type: 'text',
        label: 'sfd.field.customerName.label',
        placeholder: 'sfd.field.surveyCustomer.placeholder',
        required: true,
        color: '#00f0ff',
      },
      {
        id: 'overall',
        type: 'rating',
        label: 'sfd.field.overallSatisfaction.label',
        defaultValue: 4,
        required: true,
        color: '#00ffcc',
      },
      { id: 'service', type: 'rating', label: 'sfd.field.serviceQuality.label', defaultValue: 4, color: '#00ffc8' },
      { id: 'response', type: 'rating', label: 'sfd.field.responseSpeed.label', defaultValue: 3, color: '#00f0ff' },
      {
        id: 'professionalism',
        type: 'rating',
        label: 'sfd.field.professionalism.label',
        defaultValue: 4,
        color: '#00d4ff',
      },
      {
        id: 'recommend',
        type: 'slider',
        label: 'sfd.field.nps.label',
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 7,
        aiHint: 'sfd.field.nps.aiHint',
        color: '#00ffcc',
      },
      {
        id: 'channels',
        type: 'checkbox',
        label: 'sfd.field.channels.label',
        options: [
          'sfd.opt.channel.phone',
          'sfd.opt.channel.email',
          'sfd.opt.channel.wechat',
          'sfd.opt.channel.onlineMeeting',
          'sfd.opt.channel.inPerson',
          'sfd.opt.channel.aiAgent',
        ],
        color: '#00f0ff',
      },
      {
        id: 'improvement',
        type: 'textarea',
        label: 'sfd.field.improvement.label',
        placeholder: 'sfd.field.improvement.placeholder',
        aiHint: 'sfd.field.improvement.aiHint',
        color: '#00d4ff',
      },
      {
        id: 'recontact',
        type: 'toggle',
        label: 'sfd.field.openToRecontact.label',
        defaultValue: true,
        color: '#00ffc8',
      },
    ],
  },
  {
    id: 'ai-task-config',
    title: 'sfd.tpl.aiTaskConfig.title',
    subtitle: 'AI Task Config',
    icon: Brain,
    color: '#00ffc8',
    description: 'sfd.tpl.aiTaskConfig.description',
    fields: [
      {
        id: 'taskName',
        type: 'text',
        label: 'sfd.field.taskName.label',
        placeholder: 'sfd.field.taskName.placeholder',
        required: true,
        color: '#00ffc8',
      },
      {
        id: 'taskType',
        type: 'select',
        label: 'sfd.field.taskType.label',
        required: true,
        options: [
          'sfd.opt.taskType.bulkCalls',
          'sfd.opt.taskType.dataAnalysis',
          'sfd.opt.taskType.profiling',
          'sfd.opt.taskType.scriptGen',
          'sfd.opt.taskType.scheduling',
          'sfd.opt.taskType.autoFollowUp',
        ],
        color: '#00ffc8',
      },
      {
        id: 'priority',
        type: 'radio',
        label: 'sfd.field.executionPriority.label',
        required: true,
        options: [
          'sfd.opt.priority.urgent',
          'sfd.opt.priority.high',
          'sfd.opt.priority.medium',
          'sfd.opt.priority.low',
        ],
        color: '#00ffcc',
      },
      {
        id: 'concurrency',
        type: 'slider',
        label: 'sfd.field.concurrency.label',
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 10,
        color: '#00f0ff',
      },
      {
        id: 'retryCount',
        type: 'number',
        label: 'sfd.field.retryCount.label',
        placeholder: '0-5',
        min: 0,
        max: 5,
        defaultValue: 3,
        color: '#41ffdd',
      },
      {
        id: 'aiModel',
        type: 'select',
        label: 'sfd.field.aiModel.label',
        options: [
          'sfd.opt.aiModel.ultra',
          'sfd.opt.aiModel.fast',
          'sfd.opt.aiModel.eco',
        ],
        color: '#00d4ff',
      },
      { id: 'autoStart', type: 'toggle', label: 'sfd.field.autoStart.label', defaultValue: false, color: '#00ffc8' },
      { id: 'scheduleDate', type: 'date', label: 'sfd.field.scheduleDate.label', color: '#00f0ff' },
      {
        id: 'notifications',
        type: 'checkbox',
        label: 'sfd.field.notifications.label',
        options: [
          'sfd.opt.notify.system',
          'sfd.opt.notify.email',
          'sfd.opt.notify.dingtalk',
          'sfd.opt.notify.sms',
        ],
        color: '#00d4ff',
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'sfd.field.taskDescription.label',
        placeholder: 'sfd.field.taskDescription.placeholder',
        aiHint: 'sfd.field.taskDescription.aiHint',
        color: '#00ffc8',
      },
    ],
  },
]

// ---- Field Type metadata ----
/** Lookup table mapping each {@link FieldType} to its display label (i18n key), icon component, and theme color. */
export const fieldTypeInfo: Record<FieldType, { label: string; icon: typeof Type; color: string }> =
  {
    text: { label: 'sfd.fieldType.text', icon: Type, color: '#00f0ff' },
    textarea: { label: 'sfd.fieldType.textarea', icon: AlignLeft, color: '#00f0ff' },
    number: { label: 'sfd.fieldType.number', icon: Hash, color: '#00ffcc' },
    select: { label: 'sfd.fieldType.select', icon: List, color: '#00d4ff' },
    radio: { label: 'sfd.fieldType.radio', icon: CheckCircle2, color: '#00d4ff' },
    checkbox: { label: 'sfd.fieldType.checkbox', icon: Check, color: '#00ffc8' },
    toggle: { label: 'sfd.fieldType.toggle', icon: ToggleLeft, color: '#41ffdd' },
    slider: { label: 'sfd.fieldType.slider', icon: Sliders, color: '#00f0ff' },
    date: { label: 'sfd.fieldType.date', icon: Calendar, color: '#00ffcc' },
    rating: { label: 'sfd.fieldType.rating', icon: Star, color: '#00ffcc' },
    file: { label: 'sfd.fieldType.file', icon: Upload, color: '#41ffdd' },
  }

// ---- Validation helpers ----
/**
 * Returns an i18n message key (sfd.validation.*) describing the first validation
 * failure, or null when the value is valid. Callers resolve the key via t();
 * the required-message placeholder {label} is filled with t(field.label).
 */
export function validateField(field: FieldDef, value: FormFieldValue): string | null {
  if (
    field.required &&
    (value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0))
  ) {
    return 'sfd.validation.required'
  }
  if (field.validation === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
    return 'sfd.validation.email'
  }
  if (
    field.validation === 'phone' &&
    value &&
    !/^1[3-9]\d{9}$/.test(String(value).replace(/\s/g, ''))
  ) {
    return 'sfd.validation.phone'
  }
  return null
}

// ---- AI suggestion simulator ----
// Suggestion strings are i18n keys (sfd.sugg.*); render points wrap them with t().
export const aiSuggestions: Record<string, string[]> = {
  company: [
    'sfd.sugg.company.1',
    'sfd.sugg.company.2',
    'sfd.sugg.company.3',
    'sfd.sugg.company.4',
    'sfd.sugg.company.5',
  ],
  name: ['sfd.sugg.name.1', 'sfd.sugg.name.2', 'sfd.sugg.name.3', 'sfd.sugg.name.4', 'sfd.sugg.name.5'],
  taskName: ['sfd.sugg.taskName.1', 'sfd.sugg.taskName.2', 'sfd.sugg.taskName.3', 'sfd.sugg.taskName.4'],
  summary: ['sfd.sugg.summary.1', 'sfd.sugg.summary.2'],
  improvement: ['sfd.sugg.improvement.1', 'sfd.sugg.improvement.2', 'sfd.sugg.improvement.3'],
}

// ==========================================
//  Smart Form Page — Main Export
// ==========================================
/**
 * Smart Form page component.
 * Renders a three-tab interface: form filling, submission history, and template builder.
 * Supports AI-assisted field suggestions, real-time validation, and localStorage persistence.
 */
