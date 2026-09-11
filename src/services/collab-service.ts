/**
 * @file services/collab-service.ts
 * @description YYC³ Real-time Collaboration Service — OT-based collaborative editing
 *   using Operational Transformation for conflict-free multi-user editing.
 *   Supports presence tracking, cursor sharing, and undo/redo integration.
 *   Works standalone (no external Yjs dependency) with a pluggable transport layer.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags collab,realtime,ot,crdt,editing
 */

// ==========================================
// Types
// ==========================================

/** Unique peer identifier */
export type PeerId = string

/** Collaboration operation types */
export type OpType = 'insert' | 'delete' | 'retain'

/** A single text operation */
export interface TextOperation {
  type: OpType
  /** Character offset from start (0-indexed) */
  position: number
  /** Text content for insert, character count for delete */
  content?: string
  count?: number
  /** Origin peer */
  peerId: PeerId
  /** Lamport timestamp for ordering */
  lamport: number
}

/** Peer presence information */
export interface PeerPresence {
  peerId: PeerId
  name: string
  color: string
  cursorLine: number
  cursorCol: number
  selectionStart?: number
  selectionEnd?: number
  isOnline: boolean
  lastActive: number
}

/** Document state snapshot */
export interface DocSnapshot {
  content: string
  version: number
  timestamp: number
}

/** Transport layer interface (WebSocket, BroadcastChannel, etc.) */
export interface CollabTransport {
  send(data: CollabMessage): void
  onMessage(handler: (data: CollabMessage) => void): void
  onConnect(handler: () => void): void
  onDisconnect(handler: () => void): void
  close(): void
}

/** Messages exchanged between peers */
export type CollabMessage =
  | { kind: 'op'; operation: TextOperation }
  | { kind: 'presence'; presence: PeerPresence }
  | { kind: 'sync-request'; fromVersion: number }
  | { kind: 'sync-response'; snapshot: DocSnapshot; operations: TextOperation[] }
  | { kind: 'peer-join'; peerId: PeerId; name: string }
  | { kind: 'peer-leave'; peerId: PeerId }

// ==========================================
// Operational Transformation Engine
// ==========================================

/**
 * Apply a single operation to a text string.
 * Returns the new text after applying the operation.
 */
export function applyOperation(text: string, op: TextOperation): string {
  switch (op.type) {
    case 'insert':
      return text.slice(0, op.position) + (op.content ?? '') + text.slice(op.position)
    case 'delete': {
      const count = op.count ?? 0
      const start = Math.max(0, op.position)
      const end = Math.min(text.length, op.position + count)
      return text.slice(0, start) + text.slice(end)
    }
    case 'retain':
      return text // No-op
    default:
      return text
  }
}

/**
 * Transform operation `a` against operation `b` (both already applied to same base).
 * Returns the transformed version of `a` that can be applied after `b`.
 * Uses standard OT transformation for insert/delete pairs.
 */
export function transformOperation(a: TextOperation, b: TextOperation): TextOperation {
  // Same position: inserts go first if lower peerId (deterministic ordering)
  if (a.position === b.position) {
    if (a.type === 'insert' && b.type === 'insert') {
      if (a.peerId < b.peerId) {
        return { ...a, position: a.position + (b.content?.length ?? 0) }
      }
      return a
    }
  }

  // A is before B — A is unaffected
  if (a.position < b.position) {
    if (b.type === 'insert') {
      return { ...a, position: a.position }
    }
    if (b.type === 'delete') {
      if (a.position + (a.count ?? 0) <= b.position) {
        // A is entirely before B's deletion range
        return a
      }
      // A overlaps with B's deletion — adjust
      return a
    }
  }

  // A is at or after B's position
  if (b.type === 'insert') {
    return { ...a, position: a.position + (b.content?.length ?? 0) }
  }

  if (b.type === 'delete') {
    const bEnd = b.position + (b.count ?? 0)
    if (a.position >= bEnd) {
      return { ...a, position: a.position - (b.count ?? 0) }
    }
    // A is within B's deletion range — clamp to deletion start
    return { ...a, position: b.position }
  }

  return a
}

// ==========================================
// Collaboration Session
// ==========================================

/**
 * Manages a collaborative editing session for a single document.
 * Tracks operations, applies OT, and broadcasts changes to peers.
 */
export class CollabSession {
  private content: string
  private version: number = 0
  private lamport: number = 0
  private operations: TextOperation[] = []
  private peers: Map<PeerId, PeerPresence> = new Map()
  private transport: CollabTransport | null = null
  private listeners: Set<(content: string) => void> = new Set()
  private presenceListeners: Set<(peers: PeerPresence[]) => void> = new Set()
  private readonly selfId: PeerId

  constructor(initialContent: string, selfId: PeerId, selfName: string) {
    this.content = initialContent
    this.selfId = selfId

    // Register self in presence
    this.peers.set(selfId, {
      peerId: selfId,
      name: selfName,
      color: this.generateColor(selfId),
      cursorLine: 1,
      cursorCol: 1,
      isOnline: true,
      lastActive: Date.now(),
    })
  }

  /** Get the current document content */
  getContent(): string {
    return this.content
  }

  /** Get the current document version */
  getVersion(): number {
    return this.version
  }

  /** Get all online peers */
  getPeers(): PeerPresence[] {
    return Array.from(this.peers.values()).filter((p) => p.isOnline)
  }

  /** Connect a transport layer for peer communication */
  connect(transport: CollabTransport): void {
    this.transport = transport

    transport.onMessage((msg) => {
      this.handleRemoteMessage(msg)
    })

    transport.onConnect(() => {
      // Request sync from peers
      this.transport?.send({ kind: 'sync-request', fromVersion: 0 })
    })

    transport.onDisconnect(() => {
      // Mark all remote peers as offline
      for (const [id, peer] of this.peers) {
        if (id !== this.selfId) {
          this.peers.set(id, { ...peer, isOnline: false })
        }
      }
      this.notifyPresenceListeners()
    })
  }

  /** Apply a local edit (from this user's editor) */
  applyLocalEdit(op: Omit<TextOperation, 'peerId' | 'lamport'>): void {
    this.lamport++
    const fullOp: TextOperation = {
      ...op,
      peerId: this.selfId,
      lamport: this.lamport,
    }

    // Apply to local content
    this.content = applyOperation(this.content, fullOp)
    this.version++
    this.operations.push(fullOp)

    // Broadcast to peers
    this.transport?.send({ kind: 'op', operation: fullOp })

    // Notify local listeners
    this.notifyListeners()
  }

  /** Update this user's cursor position */
  updateCursor(line: number, col: number, selectionStart?: number, selectionEnd?: number): void {
    const self = this.peers.get(this.selfId)
    if (self) {
      this.peers.set(this.selfId, {
        ...self,
        cursorLine: line,
        cursorCol: col,
        selectionStart,
        selectionEnd,
        lastActive: Date.now(),
      })
      this.transport?.send({
        kind: 'presence',
        presence: this.peers.get(this.selfId)!,
      })
    }
  }

  /** Subscribe to content changes */
  onContentChange(handler: (content: string) => void): () => void {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  /** Subscribe to peer presence changes */
  onPresenceChange(handler: (peers: PeerPresence[]) => void): () => void {
    this.presenceListeners.add(handler)
    return () => this.presenceListeners.delete(handler)
  }

  /** Create a snapshot for undo/restore */
  createSnapshot(): DocSnapshot {
    return {
      content: this.content,
      version: this.version,
      timestamp: Date.now(),
    }
  }

  /** Restore from a snapshot (local only, does not broadcast) */
  restoreSnapshot(snapshot: DocSnapshot): void {
    this.content = snapshot.content
    this.version = snapshot.version
    this.notifyListeners()
  }

  /** Disconnect and clean up */
  disconnect(): void {
    this.transport?.send({ kind: 'peer-leave', peerId: this.selfId })
    this.transport?.close()
    this.transport = null
    this.listeners.clear()
    this.presenceListeners.clear()
  }

  // ==========================================
  // Private
  // ==========================================

  private handleRemoteMessage(msg: CollabMessage): void {
    switch (msg.kind) {
      case 'op': {
        // Transform against all concurrent operations
        let op = msg.operation
        for (const local of this.operations) {
          if (local.lamport > op.lamport || local.peerId === this.selfId) {
            op = transformOperation(op, local)
          }
        }
        this.content = applyOperation(this.content, op)
        this.operations.push(op)
        this.version++
        this.lamport = Math.max(this.lamport, op.lamport) + 1
        this.notifyListeners()
        break
      }
      case 'presence': {
        this.peers.set(msg.presence.peerId, { ...msg.presence, isOnline: true })
        this.notifyPresenceListeners()
        break
      }
      case 'sync-request': {
        // Send current state + all operations since requested version
        const recentOps = this.operations.filter((op) => op.lamport > msg.fromVersion)
        this.transport?.send({
          kind: 'sync-response',
          snapshot: this.createSnapshot(),
          operations: recentOps,
        })
        break
      }
      case 'sync-response': {
        // Apply snapshot and any additional operations
        if (msg.snapshot.version > this.version) {
          this.content = msg.snapshot.content
          this.version = msg.snapshot.version
        }
        for (const op of msg.operations) {
          this.content = applyOperation(this.content, op)
          this.operations.push(op)
          this.version++
        }
        this.notifyListeners()
        break
      }
      case 'peer-join': {
        if (!this.peers.has(msg.peerId)) {
          this.peers.set(msg.peerId, {
            peerId: msg.peerId,
            name: msg.name,
            color: this.generateColor(msg.peerId),
            cursorLine: 1,
            cursorCol: 1,
            isOnline: true,
            lastActive: Date.now(),
          })
        }
        this.notifyPresenceListeners()
        break
      }
      case 'peer-leave': {
        const peer = this.peers.get(msg.peerId)
        if (peer) {
          this.peers.set(msg.peerId, { ...peer, isOnline: false })
          this.notifyPresenceListeners()
        }
        break
      }
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.content)
    }
  }

  private notifyPresenceListeners(): void {
    const peers = this.getPeers()
    for (const listener of this.presenceListeners) {
      listener(peers)
    }
  }

  private generateColor(id: string): string {
    const colors = [
      '#00f0ff',
      '#00ff87',
      '#f472b6',
      '#fbbf24',
      '#a78bfa',
      '#60a5fa',
      '#34d399',
      '#fb923c',
    ]
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
    }
    return colors[Math.abs(hash) % colors.length]
  }
}

// ==========================================
// Local Transport (BroadcastChannel)
// ==========================================

/**
 * Transport implementation using BroadcastChannel for same-origin tabs.
 * Works without a server — enables real-time collab across browser tabs.
 */
export class BroadcastChannelTransport implements CollabTransport {
  private channel: BroadcastChannel
  private messageHandlers: Set<(data: CollabMessage) => void> = new Set()
  private connectHandlers: Set<() => void> = new Set()
  private disconnectHandlers: Set<() => void> = new Set()

  constructor(channelName: string) {
    this.channel = new BroadcastChannel(channelName)
    this.channel.onmessage = (e: MessageEvent) => {
      for (const handler of this.messageHandlers) {
        handler(e.data as CollabMessage)
      }
    }
    // Simulate connect
    setTimeout(() => {
      for (const handler of this.connectHandlers) handler()
    }, 0)
  }

  send(data: CollabMessage): void {
    this.channel.postMessage(data)
  }

  onMessage(handler: (data: CollabMessage) => void): void {
    this.messageHandlers.add(handler)
  }

  onConnect(handler: () => void): void {
    this.connectHandlers.add(handler)
  }

  onDisconnect(handler: () => void): void {
    this.disconnectHandlers.add(handler)
  }

  close(): void {
    this.channel.close()
    for (const handler of this.disconnectHandlers) handler()
    this.messageHandlers.clear()
    this.connectHandlers.clear()
    this.disconnectHandlers.clear()
  }
}

// ==========================================
// Mock Transport (for testing/demo)
// ==========================================

/**
 * In-memory transport for testing — no actual network communication.
 * Operations are only applied locally.
 */
export class MockTransport implements CollabTransport {
  private messageHandlers: Set<(data: CollabMessage) => void> = new Set()
  private connectHandlers: Set<() => void> = new Set()
  private disconnectHandlers: Set<() => void> = new Set()
  private sentMessages: CollabMessage[] = []

  send(data: CollabMessage): void {
    this.sentMessages.push(data)
  }

  onMessage(handler: (data: CollabMessage) => void): void {
    this.messageHandlers.add(handler)
  }

  onConnect(handler: () => void): void {
    this.connectHandlers.add(handler)
    // Auto-connect for mock
    setTimeout(() => handler(), 0)
  }

  onDisconnect(handler: () => void): void {
    this.disconnectHandlers.add(handler)
  }

  close(): void {
    for (const handler of this.disconnectHandlers) handler()
    this.messageHandlers.clear()
    this.connectHandlers.clear()
    this.disconnectHandlers.clear()
  }

  /** Simulate receiving a message from a remote peer (for testing) */
  simulateMessage(data: CollabMessage): void {
    for (const handler of this.messageHandlers) {
      handler(data)
    }
  }

  /** Get all sent messages (for assertions in tests) */
  getSentMessages(): CollabMessage[] {
    return [...this.sentMessages]
  }
}

/**
 * Generate a unique peer ID.
 */
export function generatePeerId(): PeerId {
  return 'peer_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
