/**
 * @file ai-assistant-panel.tsx
 * @description YYC³ Developer Workspace — AI Assistant panel with multi-provider
 *   support (OpenAI/Claude/DeepSeek/Mock), SSE streaming responses, real-time
 *   token usage statistics, file context injection, and chat history.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,ai-assistant,streaming,token-stats
 */

import {
  ArrowDownToLine,
  BarChart3,
  Bot,
  Brain,
  Check,
  Clock,
  Copy,
  Eye,
  Loader2,
  Send,
  Settings,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { aiProxyService } from '../services/ai-proxy-service'

import { AI_PROVIDER_MODELS, AI_SUGGESTIONS_POOL, timeAgo } from './panel-helpers'
import { usePanelStore } from './panel-store'

import type { AIChatMessage, AIProviderType, AISuggestion } from './panel-types'
import type { ThemeColors } from '../hooks/use-theme-colors'

// ==========================================
// Token 用量统计接口
// ==========================================

interface TokenUsageStats {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  latencyMs: number
  tokensPerSecond: number
  provider: string
  model: string
  timestamp: number
}

/** 简易 token 估算（约 4 字符 = 1 token，中文约 1.5 字 = 1 token） */
function estimateTokens(text: string): number {
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || []).length
  const otherChars = text.length - cjkChars
  return Math.ceil(cjkChars / 1.5 + otherChars / 4)
}

// ==========================================
// Props
// ==========================================

interface AIAssistantPanelProps {
  tc: ThemeColors
  selectedFile?: string | null
  editorContentGetter: React.RefObject<(() => string) | null>
  editorInsertRef?: React.RefObject<((text: string) => void) | null>
}

export function AIAssistantPanel({
  tc,
  selectedFile,
  editorContentGetter,
  editorInsertRef,
}: AIAssistantPanelProps) {
  const { aiMessages, addAIMessage, clearAIMessages, aiProviderConfig, setAIProviderConfig } =
    usePanelStore()
  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Token 用量统计历史
  const [tokenHistory, setTokenHistory] = useState<TokenUsageStats[]>([])
  const [currentStats, setCurrentStats] = useState<TokenUsageStats | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, streamingContent])

  const providerInfo = AI_PROVIDER_MODELS[aiProviderConfig.provider]
  const isRealProvider = aiProviderConfig.provider !== 'mock' && aiProviderConfig.apiKey.length > 0

  // 累计 token 统计
  const totalStats = tokenHistory.reduce(
    (acc, s) => ({
      promptTokens: acc.promptTokens + s.promptTokens,
      completionTokens: acc.completionTokens + s.completionTokens,
      totalTokens: acc.totalTokens + s.totalTokens,
      avgLatency: acc.avgLatency + s.latencyMs,
      count: acc.count + 1,
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0, avgLatency: 0, count: 0 },
  )

  // ==========================================
  // 流式发送
  // ==========================================

  const handleSend = useCallback(async () => {
    if (!input.trim() || processing) return
    const userMsg: AIChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }
    addAIMessage(userMsg)
    setInput('')
    setProcessing(true)
    setStreamingContent('')

    const history = [...aiMessages, userMsg]
      .slice(-10)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    abortRef.current = new AbortController()

    const startTime = Date.now()
    let fullContent = ''

    try {
      const fileContext =
        selectedFile && editorContentGetter.current
          ? { filePath: selectedFile, content: editorContentGetter.current() }
          : undefined

      const stream = aiProxyService.chatStream(
        aiProviderConfig,
        history,
        abortRef.current.signal,
        fileContext,
      )

      for await (const chunk of stream) {
        if (chunk.done) break
        fullContent += chunk.token
        setStreamingContent(fullContent)
      }

      const latencyMs = Date.now() - startTime
      const promptTokens = estimateTokens(history.map((m) => m.content).join(' '))
      const completionTokens = estimateTokens(fullContent)
      const tokensPerSecond = latencyMs > 0 ? Math.round((completionTokens / latencyMs) * 1000) : 0

      const stats: TokenUsageStats = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        latencyMs,
        tokensPerSecond,
        provider: aiProviderConfig.provider,
        model: aiProviderConfig.model,
        timestamp: Date.now(),
      }
      setCurrentStats(stats)
      setTokenHistory((prev) => [...prev.slice(-49), stats])

      const aiMsg: AIChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullContent || '（无响应内容）',
        timestamp: Date.now(),
      }
      addAIMessage(aiMsg)
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        addAIMessage({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `⚠️ 错误: ${err.message}`,
          timestamp: Date.now(),
        })
      }
    }

    setStreamingContent('')
    const count = 1 + Math.floor(Math.random() * 2)
    const pool = [...AI_SUGGESTIONS_POOL].sort(() => Math.random() - 0.5)
    setSuggestions(
      pool
        .slice(0, count)
        .map((s) => ({ ...s, id: crypto.randomUUID(), confidence: 0.8 + Math.random() * 0.19 })),
    )
    setProcessing(false)
    abortRef.current = null
  }, [
    input,
    processing,
    addAIMessage,
    aiMessages,
    aiProviderConfig,
    selectedFile,
    editorContentGetter,
  ])

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
    setProcessing(false)
    setStreamingContent('')
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleCopy = useCallback((id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }, [])

  const handleInsert = useCallback(
    (content: string) => {
      editorInsertRef?.current?.(content)
    },
    [editorInsertRef],
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
            AI 助手
          </span>
          {processing && <Loader2 className="w-3 h-3 animate-spin" style={{ color: tc.primary }} />}
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full"
            style={{
              background: isRealProvider ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
              color: isRealProvider ? '#22c55e' : '#a78bfa',
              border: `1px solid ${isRealProvider ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)'}`,
            }}
          >
            {isRealProvider ? providerInfo.label : 'Mock'}
          </span>
          {processing && streamingContent && (
            <span
              className="text-[8px] px-1 py-0.5 rounded"
              style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308' }}
            >
              流式传输中…
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
            title="Token 统计"
          >
            <BarChart3
              className="w-3 h-3"
              style={{ color: showStats ? '#eab308' : tc.textMuted }}
            />
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
            title="提供商设置"
          >
            <Settings
              className="w-3 h-3"
              style={{ color: showConfig ? tc.primary : tc.textMuted }}
            />
          </button>
          <button
            onClick={() => {
              clearAIMessages()
              setTokenHistory([])
              setCurrentStats(null)
            }}
            className="text-[9px] px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
            style={{ color: tc.textMuted }}
          >
            清除
          </button>
        </div>
      </div>

      {/* Token Usage Stats Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b"
            style={{ borderColor: tc.borderSubtle }}
          >
            <div className="px-3 py-2 space-y-2">
              <p
                className="text-[9px] uppercase tracking-wider flex items-center gap-1"
                style={{ color: tc.textMuted }}
              >
                <Zap className="w-3 h-3" style={{ color: '#eab308' }} /> Token 用量统计
              </p>

              {/* 当前请求统计 */}
              {currentStats && (
                <div className="grid grid-cols-3 gap-1.5">
                  <div
                    className="px-2 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(139,92,246,0.08)',
                      border: '1px solid rgba(139,92,246,0.15)',
                    }}
                  >
                    <p className="text-[8px]" style={{ color: 'rgba(139,92,246,0.7)' }}>
                      提示词 Token
                    </p>
                    <p className="text-[12px]" style={{ color: '#a78bfa' }}>
                      {currentStats.promptTokens.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="px-2 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(34,197,94,0.08)',
                      border: '1px solid rgba(34,197,94,0.15)',
                    }}
                  >
                    <p className="text-[8px]" style={{ color: 'rgba(34,197,94,0.7)' }}>
                      补全 Token
                    </p>
                    <p className="text-[12px]" style={{ color: '#22c55e' }}>
                      {currentStats.completionTokens.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="px-2 py-1.5 rounded-lg"
                    style={{
                      background: 'rgba(234,179,8,0.08)',
                      border: '1px solid rgba(234,179,8,0.15)',
                    }}
                  >
                    <p className="text-[8px]" style={{ color: 'rgba(234,179,8,0.7)' }}>
                      总计 Token
                    </p>
                    <p className="text-[12px]" style={{ color: '#eab308' }}>
                      {currentStats.totalTokens.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* 性能指标 */}
              {currentStats && (
                <div className="flex items-center gap-3 text-[9px]" style={{ color: tc.textMuted }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" style={{ color: '#3b82f6' }} />
                    延迟: {currentStats.latencyMs}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" style={{ color: '#eab308' }} />
                    速度: {currentStats.tokensPerSecond} tok/s
                  </span>
                  <span>
                    {currentStats.provider}/{currentStats.model}
                  </span>
                </div>
              )}

              {/* 累计统计 */}
              {tokenHistory.length > 0 && (
                <div className="pt-1 border-t" style={{ borderColor: tc.borderSubtle }}>
                  <div
                    className="flex items-center justify-between text-[8px]"
                    style={{ color: tc.textMuted }}
                  >
                    <span>
                      会话累计: {totalStats.totalTokens.toLocaleString()} tokens（{totalStats.count}{' '}
                      次请求）
                    </span>
                    <span>
                      平均延迟:{' '}
                      {totalStats.count > 0
                        ? Math.round(totalStats.avgLatency / totalStats.count)
                        : 0}
                      ms
                    </span>
                  </div>
                  {/* Mini token usage bar */}
                  <div
                    className="flex gap-0.5 mt-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: tc.bgInput }}
                  >
                    <div
                      className="rounded-full transition-all"
                      style={{
                        width: `${totalStats.totalTokens > 0 ? (totalStats.promptTokens / totalStats.totalTokens) * 100 : 50}%`,
                        background: '#a78bfa',
                      }}
                    />
                    <div
                      className="rounded-full transition-all"
                      style={{
                        width: `${totalStats.totalTokens > 0 ? (totalStats.completionTokens / totalStats.totalTokens) * 100 : 50}%`,
                        background: '#22c55e',
                      }}
                    />
                  </div>
                  <div className="flex gap-3 mt-0.5 text-[7px]" style={{ color: tc.textMuted }}>
                    <span className="flex items-center gap-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: '#a78bfa' }}
                      />{' '}
                      提示词
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: '#22c55e' }}
                      />{' '}
                      补全
                    </span>
                  </div>
                </div>
              )}

              {!currentStats && tokenHistory.length === 0 && (
                <p className="text-[9px] text-center py-2" style={{ color: tc.textMuted }}>
                  发送消息后将显示 Token 用量统计
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provider Config Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b"
            style={{ borderColor: tc.borderSubtle }}
          >
            <div className="px-3 py-2 space-y-2">
              <p className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
                提供商配置
              </p>
              <div>
                <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                  提供商
                </label>
                <select
                  value={aiProviderConfig.provider}
                  onChange={(e) => {
                    const p = e.target.value as AIProviderType
                    setAIProviderConfig({
                      provider: p,
                      model: AI_PROVIDER_MODELS[p].models[0].id,
                      baseUrl: AI_PROVIDER_MODELS[p].defaultBaseUrl,
                    })
                  }}
                  className="w-full text-[10px] px-2 py-1.5 rounded-lg border outline-none"
                  style={{
                    background: tc.bgInput,
                    borderColor: tc.borderDefault,
                    color: tc.textPrimary,
                  }}
                >
                  {Object.entries(AI_PROVIDER_MODELS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                  模型
                </label>
                <select
                  value={aiProviderConfig.model}
                  onChange={(e) => setAIProviderConfig({ model: e.target.value })}
                  className="w-full text-[10px] px-2 py-1.5 rounded-lg border outline-none"
                  style={{
                    background: tc.bgInput,
                    borderColor: tc.borderDefault,
                    color: tc.textPrimary,
                  }}
                >
                  {providerInfo.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              {aiProviderConfig.provider !== 'mock' && (
                <div>
                  <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                    API 密钥
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={aiProviderConfig.apiKey}
                      onChange={(e) => setAIProviderConfig({ apiKey: e.target.value })}
                      placeholder="YOUR_API_KEY_HERE"
                      className="w-full text-[10px] px-2 py-1.5 pr-7 rounded-lg border outline-none font-mono"
                      style={{
                        background: tc.bgInput,
                        borderColor: tc.borderDefault,
                        color: tc.textPrimary,
                      }}
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2"
                    >
                      <Eye className="w-3 h-3" style={{ color: tc.textMuted }} />
                    </button>
                  </div>
                  <p className="text-[8px] mt-0.5" style={{ color: tc.textMuted }}>
                    ⚠️ API 密钥存储在 localStorage。生产环境请配置服务端代理。
                  </p>
                </div>
              )}
              {aiProviderConfig.provider !== 'mock' && (
                <div>
                  <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                    基础 URL（可选）
                  </label>
                  <input
                    type="text"
                    value={aiProviderConfig.baseUrl ?? ''}
                    onChange={(e) => setAIProviderConfig({ baseUrl: e.target.value })}
                    placeholder={providerInfo.defaultBaseUrl}
                    className="w-full text-[10px] px-2 py-1.5 rounded-lg border outline-none font-mono"
                    style={{
                      background: tc.bgInput,
                      borderColor: tc.borderDefault,
                      color: tc.textPrimary,
                    }}
                  />
                </div>
              )}
              <div>
                <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                  温度: {aiProviderConfig.temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={aiProviderConfig.temperature}
                  onChange={(e) => setAIProviderConfig({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${tc.primary} 0%, ${tc.primary} ${(aiProviderConfig.temperature / 2) * 100}%, ${tc.borderDefault} ${(aiProviderConfig.temperature / 2) * 100}%, ${tc.borderDefault} 100%)`,
                  }}
                />
              </div>
              <div>
                <label className="text-[9px] block mb-0.5" style={{ color: tc.textMuted }}>
                  最大令牌数
                </label>
                <input
                  type="number"
                  value={aiProviderConfig.maxTokens}
                  onChange={(e) =>
                    setAIProviderConfig({ maxTokens: parseInt(e.target.value) || 2048 })
                  }
                  className="w-full text-[10px] px-2 py-1.5 rounded-lg border outline-none"
                  style={{
                    background: tc.bgInput,
                    borderColor: tc.borderDefault,
                    color: tc.textPrimary,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {aiMessages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Brain className="w-8 h-8 mb-2 opacity-30" style={{ color: '#a78bfa' }} />
            <p className="text-[11px] mb-1" style={{ color: tc.textSecondary }}>
              AI 助手就绪
            </p>
            <p className="text-[9px] mb-2" style={{ color: tc.textMuted }}>
              {isRealProvider
                ? `已连接 ${providerInfo.label} (${aiProviderConfig.model})`
                : '使用模拟引擎 — 通过 ⚙️ 配置真实提供商'}
            </p>
            <p className="text-[8px] mb-3" style={{ color: tc.textMuted }}>
              支持 SSE 流式响应 · 实时 Token 统计
            </p>
            <div className="flex gap-1.5">
              <span
                className="text-[8px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(139,92,246,0.08)',
                  color: '#a78bfa',
                  border: '1px solid rgba(139,92,246,0.15)',
                }}
              >
                流式输出
              </span>
              <span
                className="text-[8px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(234,179,8,0.08)',
                  color: '#eab308',
                  border: '1px solid rgba(234,179,8,0.15)',
                }}
              >
                Token 统计
              </span>
              <span
                className="text-[8px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  color: '#22c55e',
                  border: '1px solid rgba(34,197,94,0.15)',
                }}
              >
                上下文注入
              </span>
            </div>
          </div>
        )}
        {aiMessages.map((msg) => (
          <div key={msg.id} className="flex gap-2 group">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: msg.role === 'user' ? `${tc.primary}15` : 'rgba(139,92,246,0.12)',
              }}
            >
              {msg.role === 'user' ? (
                <Terminal className="w-3 h-3" style={{ color: tc.primary }} />
              ) : (
                <Bot className="w-3 h-3" style={{ color: '#a78bfa' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[9px]" style={{ color: tc.textMuted }}>
                  {msg.role === 'user' ? '你' : isRealProvider ? aiProviderConfig.model : '模拟 AI'}{' '}
                  · {timeAgo(msg.timestamp)}
                </p>
                {/* Actions for assistant messages */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/5"
                      title="复制"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-2.5 h-2.5" style={{ color: '#22c55e' }} />
                      ) : (
                        <Copy className="w-2.5 h-2.5" style={{ color: tc.textMuted }} />
                      )}
                    </button>
                    {editorInsertRef && (
                      <button
                        onClick={() => handleInsert(msg.content)}
                        className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/5"
                        title="插入编辑器"
                      >
                        <ArrowDownToLine className="w-2.5 h-2.5" style={{ color: tc.textMuted }} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div
                className="text-[11px] whitespace-pre-wrap"
                style={{ color: tc.textPrimary, lineHeight: '1.5' }}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message (real-time) */}
        {processing && streamingContent && (
          <div className="flex gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(139,92,246,0.12)' }}
            >
              <Bot className="w-3 h-3" style={{ color: '#a78bfa' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] flex items-center gap-1" style={{ color: tc.textMuted }}>
                {isRealProvider ? aiProviderConfig.model : '模拟 AI'} · 生成中
                <Loader2 className="w-2.5 h-2.5 animate-spin" style={{ color: '#a78bfa' }} />
                <span className="text-[8px]" style={{ color: '#eab308' }}>
                  ~{estimateTokens(streamingContent)} tokens
                </span>
              </p>
              <div
                className="text-[11px] whitespace-pre-wrap"
                style={{ color: tc.textPrimary, lineHeight: '1.5' }}
              >
                {streamingContent}
                <span
                  className="inline-block w-[2px] h-[13px] ml-0.5 align-middle animate-pulse"
                  style={{ background: '#a78bfa' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Processing indicator (before streaming starts) */}
        {processing && !streamingContent && (
          <div className="flex gap-2 items-center">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(139,92,246,0.12)' }}
            >
              <Bot className="w-3 h-3" style={{ color: '#a78bfa' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#a78bfa' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-[9px]" style={{ color: tc.textMuted }}>
                正在思考...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {suggestions.length > 0 && !processing && (
          <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: tc.borderSubtle }}>
            <p className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
              建议
            </p>
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setInput(s.title)
                  setSuggestions((prev) => prev.filter((x) => x.id !== s.id))
                }}
                className="w-full text-left flex items-start gap-2 p-2 rounded-lg border transition-all hover:bg-white/[0.03]"
                style={{ borderColor: tc.borderSubtle }}
              >
                <Sparkles className="w-3 h-3 shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
                <div className="min-w-0">
                  <p className="text-[10px] truncate" style={{ color: tc.textPrimary }}>
                    {s.title}
                  </p>
                  <p className="text-[8px]" style={{ color: tc.textMuted }}>
                    {s.description} · {Math.round(s.confidence * 100)}%
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Inline token stats bar (always visible when there's history) */}
      {currentStats && !showStats && (
        <div
          className="flex items-center justify-between px-3 py-1 border-t text-[8px]"
          style={{ borderColor: tc.borderSubtle, color: tc.textMuted }}
        >
          <span className="flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" style={{ color: '#eab308' }} />
            {currentStats.totalTokens} tokens · {currentStats.latencyMs}ms ·{' '}
            {currentStats.tokensPerSecond} tok/s
          </span>
          <button
            onClick={() => setShowStats(true)}
            className="hover:underline"
            style={{ color: '#a78bfa' }}
          >
            详情
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-2 border-t" style={{ borderColor: tc.borderSubtle }}>
        <div className="flex items-end gap-1.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRealProvider
                ? `向 ${providerInfo.label} 提问（流式响应）...`
                : '向 AI 提问（模拟流式响应）...'
            }
            rows={2}
            disabled={processing}
            className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg border outline-none resize-none transition-all"
            style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a78bfa50'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = tc.borderDefault
            }}
          />
          {processing ? (
            <button
              onClick={handleStop}
              className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all shrink-0"
              style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <X className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-7 h-7 flex items-center justify-center rounded-lg border transition-all shrink-0"
              style={{
                background: input.trim() ? 'rgba(139,92,246,0.15)' : 'transparent',
                borderColor: 'rgba(139,92,246,0.3)',
                opacity: !input.trim() ? 0.4 : 1,
              }}
            >
              <Send className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
