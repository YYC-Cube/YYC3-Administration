/** @file hooks/use-chat-session.ts — Multi-session management with localStorage */
import { useCallback, useEffect, useState } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  isError?: boolean
  quoteContent?: string // quoted message content for reply
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'yyc3_chat_sessions'
const ACTIVE_KEY = 'yyc3_chat_active_session'

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw).map((s: any) => ({
      ...s,
      messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }))
  } catch { /* ignore */ }
  return []
}

function saveSessions(sessions: ChatSession[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)) } catch { /* ignore */ }
}

function loadActiveId(): string | null {
  try { return localStorage.getItem(ACTIVE_KEY) || null } catch { return null }
}

function saveActiveId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch { /* ignore */ }
}

let idCounter = Date.now()
function genId() {
  idCounter++
  return 'chat_' + idCounter
}

function makeTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user')
  if (firstUser) return firstUser.content.slice(0, 30) + (firstUser.content.length > 30 ? '…' : '')
  return '新会话'
}

/**
 * Multi-session chat management with localStorage persistence.
 * Supports create / delete / switch sessions; auto-titles from first user message.
 */
export function useChatSession() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions)
  const [activeId, setActiveId] = useState<string | null>(loadActiveId)

  // Persist on change
  useEffect(() => { saveSessions(sessions) }, [sessions])
  useEffect(() => { saveActiveId(activeId) }, [activeId])

  // Ensure at least one session exists
  useEffect(() => {
    if (sessions.length === 0) {
      const id = genId()
      const session: ChatSession = {
        id,
        title: '新会话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      setSessions([session])
      setActiveId(id)
    } else if (!activeId || !sessions.find((s) => s.id === activeId)) {
      setActiveId(sessions[0].id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeSession = sessions.find((s) => s.id === activeId) ?? null

  const createSession = useCallback(() => {
    const id = genId()
    const session: ChatSession = {
      id,
      title: '新会话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setSessions((prev) => [...prev, session])
    setActiveId(id)
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (next.length === 0) {
        const freshId = genId()
        return [{
          id: freshId,
          title: '新会话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }]
      }
      return next
    })
    setActiveId((prev) => {
      if (prev === id) return null
      return prev
    })
  }, [])

  const switchSession = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const addMessage = useCallback((message: ChatMessage) => {
    setSessions((prev) => prev.map((s) => {
      if (s.id !== activeId) return s
      const next = { ...s, messages: [...s.messages, message], updatedAt: Date.now() }
      // Auto-title from first user message
      if (next.title === '新会话' && message.role === 'user') {
        next.title = message.content.slice(0, 30) + (message.content.length > 30 ? '…' : '')
      }
      return next
    }))
  }, [activeId])

  const updateMessage = useCallback((msgId: string, updates: Partial<ChatMessage>) => {
    setSessions((prev) => prev.map((s) => {
      if (s.id !== activeId) return s
      return {
        ...s,
        messages: s.messages.map((m) => m.id === msgId ? { ...m, ...updates } : m),
        updatedAt: Date.now(),
      }
    }))
  }, [activeId])

  const clearSession = useCallback(() => {
    setSessions((prev) => prev.map((s) => {
      if (s.id !== activeId) return s
      return { ...s, messages: [], updatedAt: Date.now(), title: '新会话' }
    }))
  }, [activeId])

  return {
    sessions,
    activeId,
    activeSession,
    createSession,
    deleteSession,
    switchSession,
    addMessage,
    updateMessage,
    clearSession,
  }
}
