/** @file chat-interface.tsx — AI Chat with streaming, markdown, multi-session, editor integration */
import {
  Bot,
  Check,
  Copy,
  Download,
  FileCode,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import { useAIModel } from './ai-model-context'
import { useApp } from './app-context'
import { useChatSession } from './hooks/use-chat-session'
import { useChatStream } from './hooks/use-chat-stream'
import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { cn } from './ui/utils'

import type { ChatMessage } from './hooks/use-chat-session'

interface ChatInterfaceProps {
  compact?: boolean
  onInsertReady?: (inserter: (text: string) => void) => void
}

const SUGGESTED_PROMPTS_ZH = [
  { icon: Sparkles, label: '\u5206\u6790\u5ba2\u6237\u751f\u547d\u5468\u671f', color: '#00d4ff' },
  { icon: FileCode, label: '\u7f16\u5199\u8425\u9500\u8bdd\u672f\u6a21\u677f', color: '#a78bfa' },
  { icon: TrendingUp, label: '\u4f18\u5316\u547c\u53eb\u6392\u671f\u7b56\u7565', color: '#22c55e' },
  { icon: Bot, label: '\u751f\u6210\u6570\u636e\u5206\u6790\u62a5\u544a', color: '#f97316' },
]

const SUGGESTED_PROMPTS_EN = [
  { icon: Sparkles, label: 'Analyze customer lifecycle', color: '#00d4ff' },
  { icon: FileCode, label: 'Write marketing scripts', color: '#a78bfa' },
  { icon: TrendingUp, label: 'Optimize call scheduling', color: '#22c55e' },
  { icon: Bot, label: 'Generate analytics report', color: '#f97316' },
]

export function ChatInterface({ compact = false, onInsertReady }: ChatInterfaceProps) {
  const { aiModels, activeModelId, openModelSettings } = useAIModel()
  const { t, locale } = useI18n()
  const tc = useThemeColors()
  const { addActivity } = useApp()
  const {
    sessions,
    activeId,
    activeSession,
    createSession,
    deleteSession,
    switchSession,
    addMessage,
    updateMessage,
    clearSession,
  } = useChatSession()
  const { streamState, startSimulatedStream, stopStream, isStreamingFor } = useChatStream()

  const [input, setInput] = useState('')
  const [quoteContent, setQuoteContent] = useState<string | null>(null)
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const insertToEditorRef = useRef<((text: string) => void) | null>(null)
  useEffect(() => {
    if (onInsertReady) {
      onInsertReady((text: string) => {
        setInput(text)
        inputRef.current?.focus()
      })
    }
  }, [onInsertReady])

  const activeModel = useMemo(
    () => (activeModelId ? aiModels.find((m) => m.id === activeModelId) : null),
    [aiModels, activeModelId],
  )

  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession?.messages])
  const suggestedPrompts = locale === 'zh' ? SUGGESTED_PROMPTS_ZH : SUGGESTED_PROMPTS_EN

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamState.content])

  const callLLM = useCallback(
    async (userContent: string): Promise<string> => {
      if (!activeModel) return t('chat.modelNotConfigured')
      const { endpoint, apiKey, name: modelName, provider } = activeModel
      try {
        let resp: Response
        if (provider === 'ollama') {
          const base = endpoint.replace(/\/+$/, '')
          const url = base.includes('/api/chat')
            ? base
            : base.replace(/\/api\/.*$/, '') + '/api/chat'
          resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: modelName,
              messages: [{ role: 'user', content: userContent }],
              stream: false,
            }),
          })
        } else if (endpoint.includes('anthropic.com')) {
          resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: modelName,
              max_tokens: 2048,
              messages: [{ role: 'user', content: userContent }],
            }),
          })
        } else {
          resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
            body: JSON.stringify({
              model: modelName,
              messages: [{ role: 'user', content: userContent }],
              stream: false,
              max_tokens: 2048,
              temperature: 0.7,
            }),
          })
        }
        if (!resp.ok) {
          const errText = await resp.text().catch(() => '')
          let detail = ''
          try {
            const j = JSON.parse(errText)
            detail = j.error?.message || j.message || errText.slice(0, 300)
          } catch {
            detail = errText.slice(0, 300)
          }
          return t('chat.apiError', { msg: 'HTTP ' + resp.status + ' - ' + detail })
        }
        const data = await resp.json().catch(() => null)
        if (provider === 'ollama')
          return data?.message?.content || data?.response || t('chat.fallbackReply')
        if (endpoint.includes('anthropic.com'))
          return data?.content?.[0]?.text || t('chat.fallbackReply')
        return data?.choices?.[0]?.message?.content || data?.result || t('chat.fallbackReply')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError'))
          return t('chat.apiError', { msg: t('chat.networkError') })
        return t('chat.apiError', { msg: msg.slice(0, 200) })
      }
    },
    [activeModel, t],
  )

  const handleSend = useCallback(async () => {
    if (!input.trim() || streamState.isStreaming) return
    const userText = input
    setInput('')
    setQuoteContent(null)

    const userMsg: ChatMessage = {
      id: 'm_' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
      quoteContent: quoteContent ?? undefined,
    }
    addMessage(userMsg)

    const aiId = 'm_' + (Date.now() + 1)
    addMessage({ id: aiId, role: 'ai', content: '', timestamp: new Date() })

    const reply = await callLLM(
      quoteContent ? '> ' + quoteContent.replace(/\n/g, '\n> ') + '\n\n' + userText : userText,
    )

    if (reply) {
      await startSimulatedStream(reply, aiId, 6)
      const isError = reply.startsWith(t('chat.apiError', { msg: '' }).split(':')[0])
      updateMessage(aiId, { content: reply, isError })
      addActivity({
        action: t('chat.activityAnswered') || 'AI replied',
        target: userText.slice(0, 40),
        type: 'ai' as const,
        color: '#00d4ff',
      })
    }
  }, [
    input,
    quoteContent,
    streamState.isStreaming,
    callLLM,
    startSimulatedStream,
    addMessage,
    updateMessage,
    addActivity,
    t,
  ])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRetry = useCallback(
    async (msgId: string) => {
      const idx = messages.findIndex((m) => m.id === msgId)
      if (idx < 1) return
      const userMsg = messages
        .slice(0, idx)
        .reverse()
        .find((m) => m.role === 'user')
      if (!userMsg) return
      updateMessage(msgId, { content: '', isError: false })
      const reply = await callLLM(userMsg.content)
      if (reply) {
        await startSimulatedStream(reply, msgId, 6)
        updateMessage(msgId, { content: reply })
      }
    },
    [messages, callLLM, startSimulatedStream, updateMessage],
  )

  const handleQuote = useCallback((content: string) => {
    setQuoteContent(content)
    inputRef.current?.focus()
  }, [])

  const handleCopy = useCallback(async (text: string, msgId?: string) => {
    await navigator.clipboard.writeText(text).catch(() => {})
    if (msgId) {
      setCopiedMsgId(msgId)
      setTimeout(() => setCopiedMsgId(null), 2000)
    }
  }, [])

  const handleInsertCode = useCallback((code: string) => {
    insertToEditorRef.current?.(code)
  }, [])

  const handleExport = useCallback(
    (format: 'md' | 'json') => {
      let content: string
      let mime: string
      let ext: string
      if (format === 'md') {
        content =
          '# AI Chat Export\n\n' +
          messages
            .map((m) => '## ' + (m.role === 'user' ? 'User' : 'AI') + '\n' + m.content + '\n')
            .join('\n')
        mime = 'text/markdown'
        ext = 'md'
      } else {
        content = JSON.stringify(
          messages.map(({ id, role, content, timestamp }) => ({ id, role, content, timestamp })),
          null,
          2,
        )
        mime = 'application/json'
        ext = 'json'
      }
      const blob = new Blob([content], { type: mime })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'yyc3-chat-' + Date.now() + '.' + ext
      a.click()
      URL.revokeObjectURL(a.href)
    },
    [messages],
  )

  const renderMessage = (msg: ChatMessage, i: number) => {
    const isStreaming = isStreamingFor(msg.id)
    const displayContent = isStreaming ? streamState.content : msg.content

    return (
      <div
        key={msg.id}
        className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
        style={{
          animation:
            'bubble-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ' + i * 0.03 + 's both',
        }}
      >
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
          style={{
            background: tc.alpha(msg.role === 'ai' ? tc.primary : tc.secondary, 0.1),
            borderColor: tc.alpha(msg.role === 'ai' ? tc.primary : tc.secondary, 0.4),
            boxShadow: '0 0 10px ' + tc.alpha(msg.role === 'ai' ? tc.primary : tc.secondary, 0.3),
          }}
        >
          {msg.role === 'ai' ? (
            <Bot className="w-4 h-4" style={{ color: tc.primary }} />
          ) : (
            <User className="w-4 h-4" style={{ color: tc.secondary }} />
          )}
        </div>

        <div
          className={cn('relative max-w-[75%] rounded-2xl px-4 py-3', compact && 'max-w-[85%]')}
          style={{
            background: msg.role === 'ai' ? tc.alpha(tc.bgBase, 0.8) : tc.alpha(tc.secondary, 0.1),
            border:
              '1px solid ' +
              (msg.isError
                ? tc.alpha(tc.danger, 0.3)
                : tc.alpha(msg.role === 'ai' ? tc.primary : tc.secondary, 0.2)),
            backdropFilter: 'blur(10px)',
            boxShadow:
              msg.role === 'ai'
                ? msg.isError
                  ? '0 0 15px ' + tc.alpha(tc.muted, 0.1)
                  : '0 0 15px ' + tc.alpha(tc.primary, 0.1)
                : '0 0 15px ' + tc.alpha(tc.secondary, 0.1),
          }}
        >
          {msg.quoteContent && (
            <div
              className="mb-2 pl-3 border-l-2 text-[11px] text-white/30 italic"
              style={{ borderColor: tc.alpha(tc.primary, 0.3) }}
            >
              {msg.quoteContent.slice(0, 100)}
              {msg.quoteContent.length > 100 ? '...' : ''}
            </div>
          )}

          {msg.role === 'ai' ? (
            <div
              className="text-sm leading-relaxed prose prose-invert max-w-none"
              style={{ color: msg.isError ? tc.alpha(tc.danger, 0.8) : tc.textPrimary }}
            >
              {displayContent ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({ className, children, ...props }: any) {
                      const isInline = !className
                      const codeStr = String(children).replace(/\n$/, '')
                      if (isInline) {
                        return (
                          <code
                            className="px-1 py-0.5 rounded text-xs"
                            style={{ background: tc.alpha(tc.primary, 0.1), color: tc.primary }}
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      }
                      return (
                        <div className="relative group my-3">
                          <div
                            className="flex items-center justify-between px-3 py-1.5 rounded-t-lg text-[10px]"
                            style={{ background: 'rgba(0,0,0,0.4)', color: tc.textMuted }}
                          >
                            <span>{className ? className.replace('language-', '') : 'code'}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCopy(codeStr)}
                                className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                                title="Copy"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleInsertCode(codeStr)}
                                className="px-2 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
                                title="Insert into editor"
                              >
                                <FileCode className="w-3 h-3" />
                                <span>Insert</span>
                              </button>
                            </div>
                          </div>
                          <pre
                            className="m-0 rounded-b-lg"
                            style={{ background: 'rgba(0,0,0,0.3)' }}
                          >
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      )
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pre({ children }: any) {
                      return <>{children}</>
                    },
                  }}
                >
                  {displayContent}
                </ReactMarkdown>
              ) : (
                isStreaming && (
                  <span
                    className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm"
                    style={{ background: tc.primary }}
                  />
                )
              )}
            </div>
          ) : (
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: tc.textPrimary }}
            >
              {displayContent}
            </p>
          )}

          <div
            className="flex items-center justify-between mt-2 pt-2 border-t"
            style={{ borderColor: tc.borderSubtle }}
          >
            <span className="text-[10px]" style={{ color: tc.textMuted }}>
              {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex gap-1">
              {msg.role === 'ai' && displayContent && !isStreaming && (
                <>
                  <button
                    onClick={() => handleCopy(displayContent, msg.id)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    title={t('chat.copy')}
                  >
                    {copiedMsgId === msg.id ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-white/30 hover:text-white/60" />
                    )}
                  </button>
                  <button
                    onClick={() => handleQuote(displayContent)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    title="Quote reply"
                  >
                    <MessageSquare className="w-3 h-3 text-white/30 hover:text-white/60" />
                  </button>
                  <button
                    onClick={() => handleRetry(msg.id)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                    title={t('chat.retry')}
                  >
                    <RotateCcw className="w-3 h-3 text-white/30 hover:text-white/60" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full" style={{ background: tc.bgBase }}>
      {/* Session Sidebar */}
      <div
        className="w-56 shrink-0 flex flex-col border-r"
        style={{ borderColor: tc.alpha(tc.primary, 0.1), background: tc.alpha(tc.bgCard, 0.5) }}
      >
        <div className="p-3 border-b" style={{ borderColor: tc.borderSubtle }}>
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: tc.gradientPrimary, boxShadow: tc.shadowGlow }}
          >
            <Plus className="w-3.5 h-3.5" />
            {t('chat.newSession')}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={
                'group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ' +
                (s.id === activeId ? 'border' : 'hover:bg-white/5')
              }
              style={{
                background: s.id === activeId ? tc.alpha(tc.primary, 0.08) : 'transparent',
                borderColor: s.id === activeId ? tc.alpha(tc.primary, 0.3) : 'transparent',
                color: s.id === activeId ? tc.primary : tc.textMuted,
              }}
              onClick={() => switchSession(s.id)}
            >
              <span className="truncate">{s.title}</span>
              {sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSession(s.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-2 border-t space-y-1" style={{ borderColor: tc.borderSubtle }}>
          <button
            onClick={() => handleExport('md')}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] hover:bg-white/5 transition-colors"
            style={{ color: tc.textMuted }}
          >
            <Download className="w-3 h-3" />
            {t('chat.exportMarkdown') || 'Export MD'}
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] hover:bg-white/5 transition-colors"
            style={{ color: tc.textMuted }}
          >
            <Download className="w-3 h-3" />
            {t('chat.exportJSON') || 'Export JSON'}
          </button>
          <button
            onClick={clearSession}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] hover:bg-white/5 transition-colors"
            style={{ color: tc.alpha(tc.danger, 0.6) }}
          >
            <Trash2 className="w-3 h-3" />
            {t('chat.clear') || 'Clear'}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <div
          className="shrink-0 flex items-center justify-between px-4 py-2 border-b"
          style={{ borderColor: tc.alpha(tc.primary, 0.1) }}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                activeModel ? 'bg-emerald-400' : 'bg-white/15',
              )}
              style={activeModel ? { boxShadow: '0 0 4px ' + tc.success } : {}}
            />
            <span className="text-[10px] text-white/30">
              {activeModel
                ? activeModel.name + ' - ' + activeModel.provider
                : t('chat.modelNotConfigured')}
            </span>
            {streamState.isStreaming && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full animate-pulse"
                style={{ background: tc.alpha(tc.primary, 0.15), color: tc.primary }}
              >
                Generating...
              </span>
            )}
          </div>
          <button
            onClick={openModelSettings}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors group"
            title={t('header.aiModel')}
          >
            <Settings2 className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
          style={{ scrollbarWidth: 'none' }}
        >
          {messages.length === 0 && !streamState.isStreaming && (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <Bot className="w-12 h-12 mb-4" style={{ color: tc.alpha(tc.primary, 0.3) }} />
              <p className="text-sm mb-6" style={{ color: tc.textMuted }}>
                How can I help you?
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {suggestedPrompts.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(p.label)
                        inputRef.current?.focus()
                      }}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs transition-all hover:scale-[1.02]"
                      style={{
                        background: p.color + '08',
                        border: '1px solid ' + p.color + '20',
                        color: p.color,
                      }}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {messages.map(renderMessage)}

          {streamState.isStreaming && !messages.find((m) => isStreamingFor(m.id)) && (
            <div
              className="flex gap-3"
              style={{ animation: 'bubble-in 0.4s var(--spring-easing) both' }}
            >
              <div
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  borderColor: tc.alpha(tc.primary, 0.4),
                }}
              >
                <Bot className="w-4 h-4" style={{ color: tc.primary }} />
              </div>
              <div
                className="rounded-2xl px-5 py-4 border"
                style={{
                  background: tc.alpha(tc.bgBase, 0.8),
                  borderColor: tc.alpha(tc.primary, 0.2),
                }}
              >
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: tc.primary,
                        animation: 'thinking-pulse 1.4s ease-in-out ' + i * 0.2 + 's infinite',
                      }}
                    />
                  ))}
                  <span className="ml-2 text-xs" style={{ color: tc.alpha(tc.primary, 0.6) }}>
                    {t('chat.aiThinking')}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {quoteContent && (
          <div
            className="mx-3 px-3 py-2 rounded-xl flex items-center gap-2 text-xs border"
            style={{
              background: tc.alpha(tc.primary, 0.05),
              borderColor: tc.alpha(tc.primary, 0.2),
              color: tc.textMuted,
            }}
          >
            <MessageSquare className="w-3 h-3 shrink-0" style={{ color: tc.primary }} />
            <span className="truncate flex-1">
              {quoteContent.slice(0, 80)}
              {quoteContent.length > 80 ? '...' : ''}
            </span>
            <button
              onClick={() => setQuoteContent(null)}
              className="p-0.5 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="p-3 border-t" style={{ borderColor: tc.alpha(tc.primary, 0.1) }}>
          <div
            className="relative flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all duration-300"
            style={{
              background: tc.alpha(tc.bgBase, 0.6),
              borderColor: tc.alpha(tc.primary, 0.2),
              backdropFilter: 'blur(10px)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={'Type a message...'}
              rows={1}
              className="flex-1 bg-transparent text-white/90 text-sm resize-none outline-none placeholder:text-white/20 max-h-24"
              style={{ scrollbarWidth: 'none' }}
            />
            {streamState.isStreaming ? (
              <button
                onClick={stopStream}
                className="shrink-0 p-2 rounded-xl transition-all duration-300 animate-pulse"
                style={{
                  background: tc.alpha(tc.danger, 0.3),
                  boxShadow: '0 0 10px ' + tc.alpha(tc.danger, 0.2),
                }}
              >
                <Square className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="shrink-0 p-2 rounded-xl transition-all duration-300 disabled:opacity-30"
                style={{
                  background: input.trim() ? tc.gradientPrimary : 'rgba(255,255,255,0.05)',
                  boxShadow: input.trim() ? tc.shadowGlow : 'none',
                }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Sparkles className="w-3 h-3" style={{ color: tc.alpha(tc.accent, 0.4) }} />
            <span className="text-[10px] text-white/20">{t('chat.poweredBy')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
