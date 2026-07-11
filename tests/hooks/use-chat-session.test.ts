/**
 * @file use-chat-session.test.ts
 * @description YYC³ Chat Session Hook — Unit Tests
 *   Covers: session CRUD, message cap enforcement, session count cap.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useChatSession } from '../../src/app/components/hooks/use-chat-session'

import type { ChatMessage } from '../../src/app/components/hooks/use-chat-session'

// ==========================================
// Helpers
// ==========================================

function makeMessage(overrides?: Partial<ChatMessage>): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random()}`,
    role: 'user',
    content: 'Test message',
    timestamp: new Date(),
    ...overrides,
  }
}

// ==========================================
// Tests
// ==========================================

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('useChatSession — Session Management', () => {
  it('creates a default session on mount', () => {
    const { result } = renderHook(() => useChatSession())
    expect(result.current.sessions.length).toBe(1)
    expect(result.current.activeSession).toBeTruthy()
    expect(result.current.activeSession?.title).toBe('新会话')
  })

  it('creates a new session via createSession', () => {
    const { result } = renderHook(() => useChatSession())
    const initialCount = result.current.sessions.length

    act(() => {
      result.current.createSession()
    })

    expect(result.current.sessions.length).toBe(initialCount + 1)
  })

  it('switches active session via switchSession', () => {
    const { result } = renderHook(() => useChatSession())
    const firstId = result.current.activeId

    act(() => {
      result.current.createSession()
    })
    const secondId = result.current.activeId
    expect(secondId).not.toBe(firstId)

    act(() => {
      result.current.switchSession(firstId!)
    })
    expect(result.current.activeId).toBe(firstId)
  })

  it('deletes a session via deleteSession', () => {
    const { result } = renderHook(() => useChatSession())
    act(() => {
      result.current.createSession()
    })
    const count = result.current.sessions.length
    const idToDelete = result.current.sessions[0].id

    act(() => {
      result.current.deleteSession(idToDelete)
    })

    expect(result.current.sessions.length).toBe(count - 1)
    expect(result.current.sessions.find((s) => s.id === idToDelete)).toBeUndefined()
  })

  it('always keeps at least one session after delete', () => {
    const { result } = renderHook(() => useChatSession())
    const id = result.current.sessions[0].id

    act(() => {
      result.current.deleteSession(id)
    })

    // After deleting the only session, a new default session is created
    expect(result.current.sessions.length).toBeGreaterThanOrEqual(1)
    expect(result.current.sessions[0].id).not.toBe(id)
  })
})

describe('useChatSession — Messages', () => {
  it('adds a message to active session', () => {
    const { result } = renderHook(() => useChatSession())
    const msg = makeMessage()

    act(() => {
      result.current.addMessage(msg)
    })

    expect(result.current.activeSession?.messages.length).toBe(1)
    expect(result.current.activeSession?.messages[0].id).toBe(msg.id)
  })

  it('updates a message via updateMessage', () => {
    const { result } = renderHook(() => useChatSession())
    const msg = makeMessage({ content: 'Original' })

    act(() => {
      result.current.addMessage(msg)
    })
    act(() => {
      result.current.updateMessage(msg.id, { content: 'Updated' })
    })

    expect(result.current.activeSession?.messages[0].content).toBe('Updated')
  })

  it('clears all messages via clearSession', () => {
    const { result } = renderHook(() => useChatSession())

    act(() => {
      result.current.addMessage(makeMessage())
      result.current.addMessage(makeMessage())
    })
    expect(result.current.activeSession?.messages.length).toBe(2)

    act(() => {
      result.current.clearSession()
    })

    expect(result.current.activeSession?.messages.length).toBe(0)
    expect(result.current.activeSession?.title).toBe('新会话')
  })

  it('auto-titles session from first user message', () => {
    const { result } = renderHook(() => useChatSession())
    const longText = 'This is my first question about system configuration'

    act(() => {
      result.current.addMessage(makeMessage({ role: 'user', content: longText }))
    })

    expect(result.current.activeSession?.title).toContain('This is my first')
  })
})

describe('useChatSession — Message Cap Enforcement', () => {
  it('caps messages at 200 per session (oldest trimmed)', () => {
    const { result } = renderHook(() => useChatSession())

    // Add 210 messages (exceeds 200 cap)
    act(() => {
      for (let i = 0; i < 210; i++) {
        result.current.addMessage(makeMessage({ content: `Message ${i}` }))
      }
    })

    // Should have exactly 200 messages
    expect(result.current.activeSession?.messages.length).toBe(200)
    // Oldest messages should be trimmed
    expect(result.current.activeSession?.messages[0].content).toBe('Message 10')
  })
})

describe('useChatSession — Session Cap Enforcement', () => {
  it('caps sessions at 50 total', () => {
    const { result } = renderHook(() => useChatSession())

    // Create 55 sessions (exceeds 50 cap)
    act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.createSession()
      }
    })

    // Should have at most 50 sessions
    expect(result.current.sessions.length).toBeLessThanOrEqual(50)
  })
})

describe('useChatSession — Persistence', () => {
  it('persists sessions to localStorage', () => {
    const { result, unmount } = renderHook(() => useChatSession())

    act(() => {
      result.current.addMessage(makeMessage({ content: 'Persist test' }))
    })

    const key = 'yyc3_chat_sessions'
    unmount()

    // Re-mount and check data persists
    const { result: result2 } = renderHook(() => useChatSession())
    const persisted = result2.current.sessions.find((s) => s.id === result.current.activeId)
    expect(persisted).toBeTruthy()
  })
})
