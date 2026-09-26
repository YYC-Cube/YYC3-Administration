/**
 * @file ai-inference-panel.tsx
 * @description 任务看板·AI 推理面板(F-11 自 task-board-components.tsx 拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,AIInferencePanel
 */

import { Brain, Check, Code, Edit3, Loader2, MessageSquare, Sparkles, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { aiInference } from '../task-board-ai'
import { PRIORITY_CONFIG, TYPE_CONFIG } from '../task-board-data'
import { useTaskStore } from '../task-board-store'

import type { TaskInferenceResult } from '../task-board-data'

import { useI18n } from '@/app/components/i18n-context'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

export function AIInferencePanel({ tc }: { tc: ReturnType<typeof useThemeColors> }) {
  const { t } = useI18n()
  const addTask = useTaskStore((s) => s.addTask)
  const [mode, setMode] = useState<'conversation' | 'code' | 'description'>('conversation')
  const [input, setInput] = useState('')
  const [inferring, setInferring] = useState(false)
  const [results, setResults] = useState<TaskInferenceResult[]>([])

  const placeholders: Record<string, string> = {
    conversation:
      'Paste AI conversation text here... e.g. "We need to add rate limiting to the API and fix the WebSocket reconnection bug"',
    code: 'Paste code with TODO/FIXME comments... e.g.\n// TODO: implement retry logic\n// FIXME: memory leak in useEffect',
    description:
      'Describe the work to be done... e.g. "Optimize the first load performance, implement code splitting with React.lazy"',
  }

  const handleInfer = async () => {
    if (!input.trim() && results.length === 0) return
    setInferring(true)
    setResults([])
    try {
      let res: TaskInferenceResult[]
      if (mode === 'conversation') res = await aiInference.inferFromConversation(input)
      else if (mode === 'code') res = await aiInference.inferFromCode(input)
      else res = await aiInference.inferFromDescription(input)
      setResults(res)
    } catch {
      // ignore
    }
    setInferring(false)
  }

  const handleAccept = (r: TaskInferenceResult) => {
    addTask({
      title: r.title,
      description: r.description,
      status: 'todo',
      priority: r.priority,
      type: r.type,
      tags: r.tags,
      estimatedHours: r.estimatedHours,
      relatedFiles: r.relatedFiles,
      source: 'ai-inferred',
      confidence: r.confidence,
    })
    setResults((prev) => prev.filter((x) => x !== r))
  }

  const modeConfig = [
    { id: 'conversation' as const, label: 'Conversation', icon: MessageSquare, color: '#3b82f6' },
    { id: 'code' as const, label: 'Code Scan', icon: Code, color: '#22c55e' },
    { id: 'description' as const, label: 'Description', icon: Edit3, color: '#f97316' },
  ]

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ background: tc.bgCard, borderColor: tc.borderDefault }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" style={{ color: '#a78bfa' }} />
          <span className="text-[12px]" style={{ color: tc.textPrimary }}>
            AI Task Inference
          </span>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="flex gap-1">
        {modeConfig.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id)
              setResults([])
            }}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all"
            style={{
              background: mode === m.id ? `${m.color}12` : 'transparent',
              borderColor: mode === m.id ? `${m.color}30` : tc.borderSubtle,
              color: mode === m.id ? m.color : tc.textMuted,
            }}
          >
            <m.icon className="w-3 h-3" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholders[mode]}
        rows={3}
        className="w-full px-3 py-2 text-[11px] rounded-xl border outline-none resize-none transition-all"
        style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#a78bfa50'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.1)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = tc.borderDefault
          e.currentTarget.style.boxShadow = 'none'
        }}
      />

      <button
        onClick={handleInfer}
        disabled={inferring || !input.trim()}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] px-3 py-2 rounded-xl border transition-all"
        style={{
          background: inferring
            ? 'transparent'
            : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
          borderColor: 'rgba(139,92,246,0.3)',
          color: '#a78bfa',
          opacity: !input.trim() && !inferring ? 0.5 : 1,
        }}
      >
        {inferring ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        {inferring
          ? 'AI Analyzing...'
          : `Infer Tasks from ${modeConfig.find((m) => m.id === mode)?.label}`}
      </button>

      {/* Results */}
      <AnimatePresence>
        {results.map((r, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-xl border p-3"
            style={{
              background: `${TYPE_CONFIG[r.type].color}06`,
              borderColor: `${TYPE_CONFIG[r.type].color}20`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <Sparkles
                    className="w-3 h-3 shrink-0"
                    style={{ color: PRIORITY_CONFIG[r.priority].color }}
                  />
                  <span className="text-[12px] truncate" style={{ color: tc.textPrimary }}>
                    {t(r.title)}
                  </span>
                </div>
                <p className="text-[10px] mb-1.5 line-clamp-2" style={{ color: tc.textMuted }}>
                  {t(r.description)}
                </p>
                <p className="text-[9px] italic mb-2" style={{ color: tc.textMuted }}>
                  Reasoning: {t(r.reasoning)}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${TYPE_CONFIG[r.type].color}15`,
                      color: TYPE_CONFIG[r.type].color,
                    }}
                  >
                    {TYPE_CONFIG[r.type].label}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${PRIORITY_CONFIG[r.priority].color}15`,
                      color: PRIORITY_CONFIG[r.priority].color,
                    }}
                  >
                    {PRIORITY_CONFIG[r.priority].label}
                  </span>
                  {r.estimatedHours && (
                    <span className="text-[9px]" style={{ color: tc.textMuted }}>
                      {r.estimatedHours}h
                    </span>
                  )}
                  <span className="text-[9px]" style={{ color: tc.textMuted }}>
                    Confidence: {Math.round(r.confidence * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => handleAccept(r)}
                  className="text-[9px] px-2 py-1 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}
                >
                  <Check className="w-3 h-3 inline mr-0.5" />
                  Accept
                </button>
                <button
                  onClick={() => setResults((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-[9px] px-2 py-1 rounded-lg border transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                >
                  <X className="w-3 h-3 inline mr-0.5" />
                  Dismiss
                </button>
              </div>
            </div>
            <div
              className="mt-2 h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${r.confidence * 100}%` }}
                transition={{ delay: idx * 0.1 + 0.3, duration: 0.6 }}
                style={{ background: PRIORITY_CONFIG[r.priority].color }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ==========================================
// Reminders Panel
// ==========================================
