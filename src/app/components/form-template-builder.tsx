import {
  AlignLeft,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  Eye,
  GripVertical,
  Hash,
  List,
  Plus,
  Save,
  Settings2,
  Sliders,
  Star,
  ToggleLeft,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { NeonCard } from './neon-card'
import { CUSTOM_TEMPLATES_KEY, type FieldDef, type FieldType } from './smart-form-system'

// ==========================================
// YYC³ 自定义模板构建器 — Template Builder
// Phase 8: 拖拽编排 · 字段配置 · 预览 · 持久化
// ==========================================

interface BuilderField extends FieldDef {
  _editing?: boolean
}

interface CustomTemplate {
  id: string
  title: string
  subtitle: string
  color: string
  description: string
  fields: FieldDef[]
  createdAt: string
}

const FIELD_PALETTE: { type: FieldType; label: string; icon: typeof Type; color: string }[] = [
  { type: 'text', label: '文本', icon: Type, color: '#00f0ff' },
  { type: 'textarea', label: '多行文本', icon: AlignLeft, color: '#00f0ff' },
  { type: 'number', label: '数字', icon: Hash, color: '#00ffcc' },
  { type: 'select', label: '下拉选择', icon: List, color: '#00d4ff' },
  { type: 'radio', label: '单选', icon: CheckCircle2, color: '#00d4ff' },
  { type: 'checkbox', label: '多选', icon: Check, color: '#00ffc8' },
  { type: 'toggle', label: '开关', icon: ToggleLeft, color: '#008b9d' },
  { type: 'slider', label: '滑块', icon: Sliders, color: '#00f0ff' },
  { type: 'date', label: '日期', icon: Calendar, color: '#00ffcc' },
  { type: 'rating', label: '评分', icon: Star, color: '#00ffcc' },
]

const COLOR_OPTIONS = ['#00f0ff', '#00d4ff', '#00ffcc', '#00ffc8', '#008b9d', '#005f73']

function loadSavedTemplates(): CustomTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTpl(templates: CustomTemplate[]) {
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates))
  } catch {
    /* */
  }
}

/**
 * Custom form template builder.
 * Provides a drag-and-drop interface for creating custom form templates
 * with configurable field types, validation rules, and AI hint support.
 * Persists templates to localStorage under `yyc3_custom_templates`.
 */
export function FormTemplateBuilder() {
  // Template meta
  const [title, setTitle] = useState('自定义表单')
  const [subtitle, setSubtitle] = useState('Custom Form')
  const [description, setDescription] = useState('')
  const [tplColor, setTplColor] = useState('#00f0ff')

  // Fields
  const [fields, setFields] = useState<BuilderField[]>([])
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Saved templates list
  const [savedTemplates, setSavedTemplates] = useState<CustomTemplate[]>(loadSavedTemplates)
  const [showSaved, setShowSaved] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const fieldCounter = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add field
  const addField = useCallback((type: FieldType) => {
    fieldCounter.current += 1
    const info = FIELD_PALETTE.find((f) => f.type === type)!
    const newField: BuilderField = {
      id: `field_${fieldCounter.current}_${Date.now()}`,
      type,
      label: `${info.label}字段 ${fieldCounter.current}`,
      placeholder:
        type === 'text' || type === 'textarea' || type === 'number' ? '请输入…' : undefined,
      required: false,
      options:
        type === 'select' || type === 'radio' || type === 'checkbox'
          ? ['选项 1', '选项 2', '选项 3']
          : undefined,
      min: type === 'slider' ? 0 : type === 'number' ? 0 : undefined,
      max: type === 'slider' ? 100 : type === 'number' ? 999999 : undefined,
      step: type === 'slider' ? 1 : undefined,
      defaultValue:
        type === 'toggle' ? false : type === 'rating' ? 0 : type === 'slider' ? 50 : undefined,
      color: info.color,
    }
    setFields((prev) => [...prev, newField])
    setEditingFieldId(newField.id)
  }, [])

  // Remove field
  const removeField = useCallback(
    (id: string) => {
      setFields((prev) => prev.filter((f) => f.id !== id))
      if (editingFieldId === id) setEditingFieldId(null)
    },
    [editingFieldId],
  )

  // Update field property
  const updateField = useCallback((id: string, partial: Partial<BuilderField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...partial } : f)))
  }, [])

  // Duplicate field
  const duplicateField = useCallback((id: string) => {
    fieldCounter.current += 1
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx === -1) return prev
      const copy = { ...prev[idx], id: `field_${fieldCounter.current}_${Date.now()}` }
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }, [])

  // Drag & drop reorder
  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }, [])

  const handleDrop = useCallback(
    (idx: number) => {
      if (dragIdx === null || dragIdx === idx) {
        setDragIdx(null)
        setDragOverIdx(null)
        return
      }
      setFields((prev) => {
        const next = [...prev]
        const [item] = next.splice(dragIdx, 1)
        next.splice(idx, 0, item)
        return next
      })
      setDragIdx(null)
      setDragOverIdx(null)
    },
    [dragIdx],
  )

  // Move field up/down
  const _moveField = useCallback((id: string, dir: -1 | 1) => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx === -1) return prev
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }, [])

  // Save template
  const handleSave = useCallback(() => {
    if (!title.trim() || fields.length === 0) return
    const tpl: CustomTemplate = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      color: tplColor,
      description: description.trim(),
      fields: fields.map(({ _editing, ...f }) => f),
      createdAt: new Date().toISOString(),
    }
    const updated = [tpl, ...savedTemplates].slice(0, 20)
    saveTpl(updated)
    setSavedTemplates(updated)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }, [title, subtitle, tplColor, description, fields, savedTemplates])

  // Delete saved template
  const deleteSaved = useCallback(
    (id: string) => {
      const updated = savedTemplates.filter((t) => t.id !== id)
      saveTpl(updated)
      setSavedTemplates(updated)
    },
    [savedTemplates],
  )

  // Load saved template into editor
  const loadTemplate = useCallback((tpl: CustomTemplate) => {
    setTitle(tpl.title)
    setSubtitle(tpl.subtitle)
    setTplColor(tpl.color)
    setDescription(tpl.description)
    setFields(tpl.fields.map((f) => ({ ...f })))
    setShowSaved(false)
    setEditingFieldId(null)
  }, [])

  // Phase 8.5: Export current template as JSON
  const handleExportJSON = useCallback(() => {
    const tpl = {
      _yyc3_template: true,
      version: '1.8.5',
      title: title.trim() || '未命名模板',
      subtitle: subtitle.trim(),
      color: tplColor,
      description: description.trim(),
      fields: fields.map(({ _editing, ...f }) => f),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yyc3_template_${(title.trim() || 'custom').replace(/\s+/g, '_')}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [title, subtitle, tplColor, description, fields])

  // Phase 8.5: Import template from JSON file
  const handleImportJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data && data.fields && Array.isArray(data.fields)) {
          setTitle(data.title || '导入模板')
          setSubtitle(data.subtitle || 'Imported Template')
          setTplColor(data.color || '#00f0ff')
          setDescription(data.description || '')
          setFields(
            data.fields.map((f: Record<string, unknown>) => ({ ...f }) as unknown as FieldDef),
          )
          setEditingFieldId(null)
          setImportSuccess(true)
          setTimeout(() => setImportSuccess(false), 2000)
        }
      } catch {
        /* invalid JSON */
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be re-imported
    e.target.value = ''
  }, [])

  // Current editing field
  const editingField = editingFieldId ? fields.find((f) => f.id === editingFieldId) : null

  return (
    <div style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}>
      {/* Top: Meta + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${tplColor}15`, border: `1px solid ${tplColor}30` }}
          >
            <ClipboardList className="w-5 h-5" style={{ color: tplColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm bg-transparent border-none outline-none text-white/70"
              placeholder="模板名称…"
            />
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-[10px] bg-transparent border-none outline-none text-white/25"
              placeholder="英文副标题…"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Color picker */}
          <div
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setTplColor(c)}
                className="w-5 h-5 rounded-full transition-all duration-200"
                style={{
                  background: c,
                  border: tplColor === c ? '2px solid white' : '2px solid transparent',
                  boxShadow: tplColor === c ? `0 0 8px ${c}` : 'none',
                  transform: tplColor === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Saved templates */}
          <button
            onClick={() => setShowSaved((p) => !p)}
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300"
            style={{
              background: showSaved ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showSaved ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: showSaved ? '#00d4ff' : 'rgba(255,255,255,0.4)',
            }}
          >
            <List className="w-3 h-3" />
            已保存 ({savedTemplates.length})
          </button>

          {/* Preview */}
          <button
            onClick={() => setShowPreview((p) => !p)}
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300"
            style={{
              background: showPreview ? `${tplColor}12` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showPreview ? `${tplColor}35` : 'rgba(255,255,255,0.06)'}`,
              color: showPreview ? tplColor : 'rgba(255,255,255,0.4)',
            }}
          >
            <Eye className="w-3 h-3" />
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!title.trim() || fields.length === 0}
            className="px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300 disabled:opacity-30"
            style={{
              background: saveSuccess ? 'rgba(0,255,200,0.15)' : `${tplColor}15`,
              border: `1px solid ${saveSuccess ? 'rgba(0,255,200,0.4)' : `${tplColor}40`}`,
              color: saveSuccess ? '#00ffc8' : tplColor,
            }}
          >
            {saveSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            {saveSuccess ? '已保存' : '保存'}
          </button>
        </div>
      </div>

      {/* Saved Templates dropdown */}
      {showSaved && savedTemplates.length > 0 && (
        <NeonCard color="#00d4ff" hoverable={false} noReveal>
          <div
            className="space-y-2 mb-4"
            style={{ animation: 'spring-in 0.25s var(--spring-easing) both' }}
          >
            <h4 className="text-[10px] text-white/25 uppercase tracking-wider mb-2">已保存模板</h4>
            {savedTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(10,10,10,0.5)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: `${tpl.color}15` }}
                >
                  <ClipboardList className="w-3 h-3" style={{ color: tpl.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/50 truncate">{tpl.title}</p>
                  <p className="text-[8px] text-white/15">
                    {tpl.fields.length} 字段 · {new Date(tpl.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <button
                  onClick={() => loadTemplate(tpl)}
                  className="text-[9px] px-2 py-1 rounded-lg"
                  style={{
                    background: `${tpl.color}10`,
                    color: tpl.color,
                    border: `1px solid ${tpl.color}20`,
                  }}
                >
                  加载
                </button>
                <button
                  onClick={() => deleteSaved(tpl.id)}
                  className="p-1 text-white/15 hover:text-[#005f73] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </NeonCard>
      )}

      {/* Description input */}
      <div className="mb-4">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="模板描述（可选）…"
          className="w-full px-4 py-2 text-xs rounded-xl"
          style={{
            background: 'rgba(10,10,10,0.4)',
            border: '1px solid rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.5)',
            outline: 'none',
          }}
        />
      </div>

      {/* Phase 8.5: Import / Export Bar */}
      <div className="flex items-center gap-2 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportJSON}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] transition-all duration-300"
          style={{
            background: importSuccess ? 'rgba(0,255,200,0.1)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${importSuccess ? 'rgba(0,255,200,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: importSuccess ? '#00ffc8' : 'rgba(255,255,255,0.35)',
          }}
        >
          {importSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
          {importSuccess ? '导入成功' : '导入 JSON 模板'}
        </button>
        <button
          onClick={handleExportJSON}
          disabled={fields.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] transition-all duration-300 disabled:opacity-30"
          style={{
            background: 'rgba(0,240,255,0.04)',
            border: '1px solid rgba(0,240,255,0.15)',
            color: '#00f0ff',
          }}
        >
          <Download className="w-3 h-3" />
          导出 JSON
        </button>
        <span className="text-[9px] text-white/15 ml-1">跨设备模板共享</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Field palette + canvas */}
        <div className={showPreview ? 'xl:col-span-2' : 'xl:col-span-3'}>
          {/* Field Palette */}
          <NeonCard color={tplColor} hoverable={false} noReveal>
            <h4 className="text-[10px] text-white/25 uppercase tracking-wider mb-3">
              字段面板 · 点击添加
            </h4>
            <div className="flex flex-wrap gap-2 mb-5">
              {FIELD_PALETTE.map((fp) => {
                const Icon = fp.icon
                return (
                  <button
                    key={fp.type}
                    onClick={() => addField(fp.type)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] transition-all duration-300 hover:scale-105"
                    style={{
                      background: `${fp.color}08`,
                      border: `1px solid ${fp.color}20`,
                      color: fp.color,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {fp.label}
                  </button>
                )
              })}
            </div>

            {/* Canvas */}
            <div className="border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] text-white/25 uppercase tracking-wider">
                  表单字段 ({fields.length})
                </h4>
                {fields.length > 0 && (
                  <span className="text-[9px] text-white/15">拖拽排序 · 点击编辑</span>
                )}
              </div>

              {fields.length === 0 && (
                <div
                  className="text-center py-10 border-2 border-dashed rounded-2xl"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <Plus className="w-8 h-8 text-white/8 mx-auto mb-2" />
                  <p className="text-[10px] text-white/15">点击上方字段类型添加到表单</p>
                </div>
              )}

              <div className="space-y-2">
                {fields.map((field, idx) => {
                  const isEditing = editingFieldId === field.id
                  const isDragOver = dragOverIdx === idx
                  const fInfo = FIELD_PALETTE.find((f) => f.type === field.type)
                  const FieldIcon = fInfo?.icon || Type

                  return (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={() => {
                        setDragIdx(null)
                        setDragOverIdx(null)
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 cursor-move group"
                      style={{
                        background: isEditing
                          ? `${field.color || tplColor}08`
                          : 'rgba(10,10,10,0.3)',
                        borderColor: isDragOver
                          ? `${tplColor}60`
                          : isEditing
                            ? `${field.color || tplColor}30`
                            : 'rgba(255,255,255,0.04)',
                        boxShadow: isDragOver
                          ? `0 0 12px ${tplColor}20`
                          : isEditing
                            ? `0 0 8px ${field.color || tplColor}10`
                            : 'none',
                        transform: isDragOver ? 'scale(1.01)' : 'none',
                      }}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-white/10 shrink-0 cursor-grab active:cursor-grabbing" />
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: `${field.color || tplColor}10`,
                          border: `1px solid ${field.color || tplColor}20`,
                        }}
                      >
                        <FieldIcon
                          className="w-3.5 h-3.5"
                          style={{ color: field.color || tplColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 truncate">{field.label}</p>
                        <p className="text-[9px] text-white/15">
                          {fInfo?.label || field.type}
                          {field.required ? ' · 必填' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                          className="p-1 rounded text-white/20 hover:text-white/50 transition-colors"
                        >
                          <Settings2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => duplicateField(field.id)}
                          className="p-1 rounded text-white/20 hover:text-white/50 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeField(field.id)}
                          className="p-1 rounded text-white/20 hover:text-[#005f73] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </NeonCard>

          {/* Field Config Panel (inline below canvas) */}
          {editingField && (
            <div
              className="mt-4"
              style={{ animation: 'spring-in 0.25s var(--spring-easing) both' }}
            >
              <NeonCard color={editingField.color || tplColor} hoverable={false} noReveal>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings2 className="w-3 h-3" />
                    字段配置
                  </h4>
                  <button
                    onClick={() => setEditingFieldId(null)}
                    className="p-1 text-white/15 hover:text-white/40 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Label */}
                  <div>
                    <label className="text-[9px] text-white/20 mb-1 block">字段名称</label>
                    <input
                      value={editingField.label}
                      onChange={(e) => updateField(editingField.id, { label: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg"
                      style={{
                        background: 'rgba(10,10,10,0.5)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)',
                        outline: 'none',
                      }}
                    />
                  </div>
                  {/* Placeholder */}
                  {(editingField.type === 'text' ||
                    editingField.type === 'textarea' ||
                    editingField.type === 'number') && (
                    <div>
                      <label className="text-[9px] text-white/20 mb-1 block">占位文本</label>
                      <input
                        value={editingField.placeholder || ''}
                        onChange={(e) =>
                          updateField(editingField.id, { placeholder: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg"
                        style={{
                          background: 'rgba(10,10,10,0.5)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.7)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}
                  {/* Required toggle */}
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] text-white/20">必填项</label>
                    <button
                      onClick={() =>
                        updateField(editingField.id, { required: !editingField.required })
                      }
                      className="relative w-10 h-6 rounded-full transition-all duration-200"
                      style={{
                        background: editingField.required
                          ? 'rgba(0,95,115,0.25)'
                          : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${editingField.required ? 'rgba(0,95,115,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all"
                        style={{
                          left: editingField.required ? 18 : 3,
                          width: 18,
                          height: 18,
                          background: editingField.required ? '#005f73' : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    </button>
                  </div>
                  {/* Color */}
                  <div>
                    <label className="text-[9px] text-white/20 mb-1 block">颜色</label>
                    <div className="flex gap-1.5">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateField(editingField.id, { color: c })}
                          className="w-5 h-5 rounded-full transition-all"
                          style={{
                            background: c,
                            border:
                              editingField.color === c
                                ? '2px solid white'
                                : '2px solid transparent',
                            transform: editingField.color === c ? 'scale(1.2)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Options (for select/radio/checkbox) */}
                  {(editingField.type === 'select' ||
                    editingField.type === 'radio' ||
                    editingField.type === 'checkbox') && (
                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-white/20 mb-1 block">
                        选项（每行一个）
                      </label>
                      <textarea
                        value={(editingField.options || []).join('\n')}
                        onChange={(e) =>
                          updateField(editingField.id, {
                            options: e.target.value.split('\n').filter((s) => s.trim()),
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 text-xs rounded-lg resize-none"
                        style={{
                          background: 'rgba(10,10,10,0.5)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.7)',
                          outline: 'none',
                          scrollbarWidth: 'none',
                        }}
                      />
                    </div>
                  )}
                  {/* Slider range */}
                  {editingField.type === 'slider' && (
                    <>
                      <div>
                        <label className="text-[9px] text-white/20 mb-1 block">最小值</label>
                        <input
                          type="number"
                          value={editingField.min ?? 0}
                          onChange={(e) =>
                            updateField(editingField.id, { min: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg"
                          style={{
                            background: 'rgba(10,10,10,0.5)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.7)',
                            outline: 'none',
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/20 mb-1 block">最大值</label>
                        <input
                          type="number"
                          value={editingField.max ?? 100}
                          onChange={(e) =>
                            updateField(editingField.id, { max: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg"
                          style={{
                            background: 'rgba(10,10,10,0.5)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.7)',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </>
                  )}
                  {/* Validation */}
                  {editingField.type === 'text' && (
                    <div>
                      <label className="text-[9px] text-white/20 mb-1 block">验证规则</label>
                      <select
                        value={editingField.validation || 'none'}
                        onChange={(e) =>
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          updateField(editingField.id, { validation: e.target.value as any })
                        }
                        className="w-full px-3 py-2 text-xs rounded-lg appearance-none"
                        style={{
                          background: 'rgba(10,10,10,0.5)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.6)',
                          outline: 'none',
                        }}
                      >
                        <option value="none" style={{ background: '#0a0a0a' }}>
                          无
                        </option>
                        <option value="email" style={{ background: '#0a0a0a' }}>
                          邮箱
                        </option>
                        <option value="phone" style={{ background: '#0a0a0a' }}>
                          手机号
                        </option>
                        <option value="url" style={{ background: '#0a0a0a' }}>
                          URL
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </NeonCard>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div
            className="xl:col-span-1"
            style={{ animation: 'spring-in 0.3s var(--spring-easing) both' }}
          >
            <NeonCard color={tplColor} hoverable={false} noReveal>
              <h4 className="text-[10px] text-white/25 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                模板预览
              </h4>
              <div className="space-y-3">
                <div
                  className="px-3 py-2 rounded-xl"
                  style={{ background: `${tplColor}08`, border: `1px solid ${tplColor}15` }}
                >
                  <p className="text-xs" style={{ color: tplColor }}>
                    {title || '未命名模板'}
                  </p>
                  <p className="text-[9px] text-white/20">{subtitle}</p>
                </div>
                {fields.map((f, _i) => {
                  const FIcon = FIELD_PALETTE.find((p) => p.type === f.type)?.icon || Type
                  return (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <FIcon
                        className="w-3 h-3 shrink-0"
                        style={{ color: `${f.color || tplColor}60` }}
                      />
                      <span className="text-[10px] text-white/40 truncate flex-1">{f.label}</span>
                      {f.required && <span className="text-[8px] text-[#005f73]">*</span>}
                    </div>
                  )
                })}
                {fields.length === 0 && (
                  <p className="text-[10px] text-white/15 text-center py-4">暂无字段</p>
                )}
              </div>
              <div
                className="mt-3 pt-2 border-t flex justify-between text-[9px]"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-white/15">{fields.length} 个字段</span>
                <span className="text-white/15">
                  {fields.filter((f) => f.required).length} 必填
                </span>
              </div>
            </NeonCard>
          </div>
        )}
      </div>
    </div>
  )
}
