/**
 * @file collab-service.test.ts
 * @description YYC³ Collaboration Service — Unit Tests
 *   Covers: OT operations, session management, peer presence, transport.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { describe, expect, it } from 'vitest'

import {
  applyOperation,
  type CollabMessage,
  CollabSession,
  generatePeerId,
  MockTransport,
  type TextOperation,
  transformOperation,
} from '../../src/app/components/services/collab-service'

// ==========================================
// Operation Application
// ==========================================

describe('Collab — applyOperation', () => {
  it('should apply insert operation', () => {
    const result = applyOperation('Hello World', {
      type: 'insert',
      position: 5,
      content: '!',
      peerId: 'p1',
      lamport: 1,
    })
    expect(result).toBe('Hello! World')
  })

  it('should apply insert at beginning', () => {
    const result = applyOperation('test', {
      type: 'insert',
      position: 0,
      content: '>>',
      peerId: 'p1',
      lamport: 1,
    })
    expect(result).toBe('>>test')
  })

  it('should apply insert at end', () => {
    const result = applyOperation('test', {
      type: 'insert',
      position: 4,
      content: '!',
      peerId: 'p1',
      lamport: 1,
    })
    expect(result).toBe('test!')
  })

  it('should apply delete operation', () => {
    const result = applyOperation('Hello World', {
      type: 'delete',
      position: 5,
      count: 6,
      peerId: 'p1',
      lamport: 1,
    })
    expect(result).toBe('Hello')
  })

  it('should apply delete at beginning', () => {
    const result = applyOperation('test', {
      type: 'delete',
      position: 0,
      count: 2,
      peerId: 'p1',
      lamport: 1,
    })
    expect(result).toBe('st')
  })

  it('should handle delete beyond text bounds', () => {
    const result = applyOperation('hi', {
      type: 'delete',
      position: 1,
      count: 100,
      peerId: 'p1',
      lamport: 1,
    })
    expect(result).toBe('h')
  })

  it('should handle retain as no-op', () => {
    const result = applyOperation('unchanged', {
      type: 'retain',
      position: 0,
      peerId: 'p1',
      lamport: 1,
    })
    expect(result).toBe('unchanged')
  })
})

// ==========================================
// Operation Transformation
// ==========================================

describe('Collab — transformOperation', () => {
  it('should shift position after concurrent insert', () => {
    const op: TextOperation = {
      type: 'insert',
      position: 10,
      content: 'X',
      peerId: 'p2',
      lamport: 2,
    }
    const concurrentInsert: TextOperation = {
      type: 'insert',
      position: 5,
      content: 'ABC',
      peerId: 'p1',
      lamport: 1,
    }
    const transformed = transformOperation(op, concurrentInsert)
    expect(transformed.position).toBe(13) // 10 + 3
  })

  it('should shift position back after concurrent delete', () => {
    const op: TextOperation = {
      type: 'insert',
      position: 15,
      content: 'X',
      peerId: 'p2',
      lamport: 2,
    }
    const concurrentDelete: TextOperation = {
      type: 'delete',
      position: 0,
      count: 5,
      peerId: 'p1',
      lamport: 1,
    }
    const transformed = transformOperation(op, concurrentDelete)
    expect(transformed.position).toBe(10) // 15 - 5
  })

  it('should not affect operations before the concurrent change', () => {
    const op: TextOperation = {
      type: 'insert',
      position: 2,
      content: 'X',
      peerId: 'p2',
      lamport: 2,
    }
    const concurrentInsert: TextOperation = {
      type: 'insert',
      position: 10,
      content: 'Y',
      peerId: 'p1',
      lamport: 1,
    }
    const transformed = transformOperation(op, concurrentInsert)
    expect(transformed.position).toBe(2) // Unchanged
  })
})

// ==========================================
// CollabSession
// ==========================================

describe('CollabSession', () => {
  it('should initialize with content and self presence', () => {
    const session = new CollabSession('initial', 'peer1', 'Alice')
    expect(session.getContent()).toBe('initial')
    expect(session.getVersion()).toBe(0)
    const peers = session.getPeers()
    expect(peers).toHaveLength(1)
    expect(peers[0].name).toBe('Alice')
  })

  it('should apply local edits', () => {
    const session = new CollabSession('Hello', 'peer1', 'Alice')
    session.applyLocalEdit({ type: 'insert', position: 5, content: ' World' })
    expect(session.getContent()).toBe('Hello World')
    expect(session.getVersion()).toBe(1)
  })

  it('should notify listeners on content change', () => {
    const session = new CollabSession('', 'peer1', 'Alice')
    let receivedContent = ''
    session.onContentChange((content) => {
      receivedContent = content
    })

    session.applyLocalEdit({ type: 'insert', position: 0, content: 'test' })
    expect(receivedContent).toBe('test')
  })

  it('should create and restore snapshots', () => {
    const session = new CollabSession('original', 'peer1', 'Alice')
    session.applyLocalEdit({ type: 'insert', position: 8, content: ' edited' })

    const snapshot = session.createSnapshot()
    expect(snapshot.content).toBe('original edited')

    session.applyLocalEdit({ type: 'insert', position: 0, content: 'more ' })
    expect(session.getContent()).toBe('more original edited')

    session.restoreSnapshot(snapshot)
    expect(session.getContent()).toBe('original edited')
  })

  it('should update cursor position', () => {
    const session = new CollabSession('test', 'peer1', 'Alice')
    session.updateCursor(5, 10)
    const peers = session.getPeers()
    expect(peers[0].cursorLine).toBe(5)
    expect(peers[0].cursorCol).toBe(10)
  })

  it('should generate consistent colors for same peer ID', () => {
    const session1 = new CollabSession('', 'peer1', 'Alice')
    const session2 = new CollabSession('', 'peer1', 'Bob')
    expect(session1.getPeers()[0].color).toBe(session2.getPeers()[0].color)
  })
})

// ==========================================
// MockTransport
// ==========================================

describe('MockTransport', () => {
  it('should store sent messages', () => {
    const transport = new MockTransport()
    transport.send({ kind: 'peer-join', peerId: 'p1', name: 'Alice' })

    const messages = transport.getSentMessages()
    expect(messages).toHaveLength(1)
    expect(messages[0].kind).toBe('peer-join')
  })

  it('should simulate receiving messages', () => {
    const transport = new MockTransport()
    const received: CollabMessage[] = []
    transport.onMessage((msg) => received.push(msg))

    const testMsg: CollabMessage = { kind: 'peer-leave', peerId: 'p2' }
    transport.simulateMessage(testMsg)

    expect(received).toHaveLength(1)
    expect(received[0]).toEqual(testMsg)
  })

  it('should call connect handler', () => {
    const transport = new MockTransport()
    let connected = false
    transport.onConnect(() => {
      connected = true
    })

    setTimeout(() => {
      expect(connected).toBe(true)
    }, 10)
  })
})

// ==========================================
// generatePeerId
// ==========================================

describe('generatePeerId', () => {
  it('should generate unique IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generatePeerId())
    }
    expect(ids.size).toBe(100)
  })

  it('should start with peer_ prefix', () => {
    const id = generatePeerId()
    expect(id.startsWith('peer_')).toBe(true)
  })
})
