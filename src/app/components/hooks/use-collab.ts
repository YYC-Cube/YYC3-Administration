/**
 * @file hooks/use-collab.ts
 * @description YYC³ Collaboration Hook — React integration for the collab service.
 *   Provides reactive access to collaborative document state, peer presence,
 *   and edit operations. Manages session lifecycle and transport connection.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags collab,hook,realtime,react
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  BroadcastChannelTransport,
  CollabSession,
  type CollabTransport,
  type DocSnapshot,
  generatePeerId,
  MockTransport,
  type PeerId,
  type PeerPresence,
  type TextOperation,
} from '../services/collab-service'

// ==========================================
// Types
// ==========================================

interface UseCollabOptions {
  /** Unique document ID for the collaboration channel */
  docId: string
  /** Initial document content */
  initialContent: string
  /** Display name for this peer */
  userName: string
  /** Transport type: 'broadcast' for cross-tab, 'mock' for testing */
  transport?: 'broadcast' | 'mock'
  /** Enable collaboration (default: true) */
  enabled?: boolean
}

interface UseCollabReturn {
  /** Current document content */
  content: string
  /** Current document version */
  version: number
  /** List of online peers */
  peers: PeerPresence[]
  /** Whether collaboration is connected */
  isConnected: boolean
  /** Apply a text insert at position */
  insert: (position: number, text: string) => void
  /** Delete text at position */
  delete: (position: number, count: number) => void
  /** Update cursor position */
  updateCursor: (line: number, col: number, selectionStart?: number, selectionEnd?: number) => void
  /** Create a snapshot for undo/restore */
  createSnapshot: () => DocSnapshot
  /** Restore from snapshot */
  restoreSnapshot: (snapshot: DocSnapshot) => void
  /** Peer ID for this session */
  peerId: PeerId
}

// ==========================================
// Hook
// ==========================================

/**
 * React hook for real-time collaborative editing.
 * Manages a CollabSession with automatic lifecycle management.
 *
 * @example
 * ```tsx
 * const { content, peers, insert, delete } = useCollab({
 *   docId: 'doc-123',
 *   initialContent: '# Hello World',
 *   userName: 'Alice',
 * })
 * ```
 */
export function useCollab({
  docId,
  initialContent,
  userName,
  transport = 'broadcast',
  enabled = true,
}: UseCollabOptions): UseCollabReturn {
  const peerIdRef = useRef<PeerId>(generatePeerId())
  const sessionRef = useRef<CollabSession | null>(null)
  const transportRef = useRef<CollabTransport | null>(null)

  const [content, setContent] = useState(initialContent)
  const [version, setVersion] = useState(0)
  const [peers, setPeers] = useState<PeerPresence[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Create session and transport on mount
  useEffect(() => {
    if (!enabled) return

    // Create transport
    const transportInstance =
      transport === 'mock'
        ? new MockTransport()
        : new BroadcastChannelTransport(`yyc3_collab_${docId}`)
    transportRef.current = transportInstance

    // Create session
    const session = new CollabSession(initialContent, peerIdRef.current, userName)
    sessionRef.current = session

    // Subscribe to content changes
    const unsubContent = session.onContentChange((newContent) => {
      setContent(newContent)
      setVersion(session.getVersion())
    })

    // Subscribe to presence changes
    const unsubPresence = session.onPresenceChange((newPeers) => {
      setPeers(newPeers)
    })

    // Connect transport
    transportInstance.onConnect(() => {
      setIsConnected(true)
    })
    transportInstance.onDisconnect(() => {
      setIsConnected(false)
    })
    session.connect(transportInstance)

    // Announce join
    transportInstance.send({
      kind: 'peer-join',
      peerId: peerIdRef.current,
      name: userName,
    })

    // Cleanup on unmount
    return () => {
      unsubContent()
      unsubPresence()
      session.disconnect()
      transportInstance.close()
      sessionRef.current = null
      transportRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, enabled, transport])

  // Edit operations
  const insert = useCallback((position: number, text: string) => {
    sessionRef.current?.applyLocalEdit({
      type: 'insert',
      position,
      content: text,
    })
  }, [])

  const deleteText = useCallback((position: number, count: number) => {
    sessionRef.current?.applyLocalEdit({
      type: 'delete',
      position,
      count,
    })
  }, [])

  const updateCursor = useCallback(
    (line: number, col: number, selectionStart?: number, selectionEnd?: number) => {
      sessionRef.current?.updateCursor(line, col, selectionStart, selectionEnd)
    },
    [],
  )

  const createSnapshot = useCallback(() => {
    return sessionRef.current?.createSnapshot() ?? { content, version: 0, timestamp: Date.now() }
  }, [content])

  const restoreSnapshot = useCallback((snapshot: DocSnapshot) => {
    sessionRef.current?.restoreSnapshot(snapshot)
  }, [])

  return useMemo(
    () => ({
      content,
      version,
      peers,
      isConnected,
      insert,
      delete: deleteText,
      updateCursor,
      createSnapshot,
      restoreSnapshot,
      peerId: peerIdRef.current,
    }),
    [
      content,
      version,
      peers,
      isConnected,
      insert,
      deleteText,
      updateCursor,
      createSnapshot,
      restoreSnapshot,
    ],
  )
}

// Re-export types and utilities
export type { PeerPresence, TextOperation, DocSnapshot, CollabSession, CollabTransport }
export { MockTransport, BroadcastChannelTransport, generatePeerId }
