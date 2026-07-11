/**
 * @file services/sync-service.ts
 * @description YYC³ File Sync Service — Bidirectional file synchronization
 *   with conflict detection, intelligent merging, and pluggable backend adapter.
 *   Supports local-to-remote and remote-to-local sync with change detection.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags sync,files,database,backend,integration
 */

// ==========================================
// Types
// ==========================================

/** Sync direction */
export type SyncDirection = 'push' | 'pull' | 'both'

/** Sync conflict resolution strategy */
export type ConflictStrategy = 'ours' | 'theirs' | 'merge' | 'manual'

/** File change type */
export type ChangeType = 'created' | 'modified' | 'deleted' | 'renamed' | 'moved'

/** A detected file change */
export interface FileChange {
  path: string
  type: ChangeType
  /** Old path for rename/move operations */
  oldPath?: string
  /** Local content hash (SHA-256 hex) */
  localHash?: string
  /** Remote content hash */
  remoteHash?: string
  /** Last modified timestamp (local) */
  localMtime?: number
  /** Last modified timestamp (remote) */
  remoteMtime?: number
  /** File size in bytes */
  size?: number
}

/** A sync conflict between local and remote */
export interface SyncConflict {
  path: string
  localChange: FileChange
  remoteChange: FileChange
  /** Whether automatic merge is possible */
  autoMergeable: boolean
}

/** Sync result summary */
export interface SyncResult {
  direction: SyncDirection
  pushed: number
  pulled: number
  conflicts: SyncConflict[]
  errors: { path: string; error: string }[]
  timestamp: number
}

/** Backend adapter interface — implement for different backends (REST, WebSocket, Git) */
export interface SyncBackendAdapter {
  /** Get remote file list with hashes */
  listRemote(): Promise<{ path: string; hash: string; mtime: number; size: number }[]>
  /** Download a file from remote */
  pullFile(path: string): Promise<{ content: string; hash: string; mtime: number }>
  /** Upload a file to remote */
  pushFile(path: string, content: string): Promise<{ hash: string; mtime: number }>
  /** Delete a file on remote */
  deleteRemote(path: string): Promise<void>
  /** Rename/move a file on remote */
  renameRemote(oldPath: string, newPath: string): Promise<void>
}

// ==========================================
// Hash Utility (browser-safe SHA-256)
// ==========================================

async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ==========================================
// Sync Engine
// ==========================================

/**
 * File synchronization engine.
 * Compares local and remote file states, detects changes, and applies sync operations.
 */
export class FileSyncEngine {
  private adapter: SyncBackendAdapter
  private localFiles: Map<string, { content: string; hash: string; mtime: number }> = new Map()
  private lastSyncHashes: Map<string, string> = new Map()

  constructor(adapter: SyncBackendAdapter) {
    this.adapter = adapter
  }

  /**
   * Register or update a local file.
   * Called by the editor when a file is saved.
   */
  async setLocalFile(path: string, content: string): Promise<void> {
    const hash = await computeHash(content)
    this.localFiles.set(path, { content, hash, mtime: Date.now() })
  }

  /** Remove a local file (when deleted locally). */
  removeLocalFile(path: string): void {
    this.localFiles.delete(path)
  }

  /** Rename a local file. */
  renameLocalFile(oldPath: string, newPath: string): void {
    const file = this.localFiles.get(oldPath)
    if (file) {
      this.localFiles.delete(oldPath)
      this.localFiles.set(newPath, file)
    }
  }

  /** Get a local file's content. */
  getLocalFile(path: string): string | undefined {
    return this.localFiles.get(path)?.content
  }

  /**
   * Detect changes between local, last-sync, and remote states.
   */
  async detectChanges(): Promise<{ local: FileChange[]; remote: FileChange[] }> {
    const remoteList = await this.adapter.listRemote()
    const remoteMap = new Map(remoteList.map((r) => [r.path, r]))

    const localChanges: FileChange[] = []
    const remoteChanges: FileChange[] = []

    // Check local files for changes
    for (const [path, local] of this.localFiles) {
      const lastSyncHash = this.lastSyncHashes.get(path)
      const remote = remoteMap.get(path)

      if (!remote) {
        // File doesn't exist on remote
        if (lastSyncHash) {
          // Was synced before — deleted on remote
          remoteChanges.push({
            path,
            type: 'deleted',
            remoteHash: undefined,
          })
        } else {
          // Never synced — new local file
          localChanges.push({
            path,
            type: 'created',
            localHash: local.hash,
            localMtime: local.mtime,
            size: local.content.length,
          })
        }
      } else if (local.hash !== remote.hash) {
        // Content differs
        if (local.hash !== lastSyncHash && remote.hash !== lastSyncHash) {
          // Both changed — conflict
          localChanges.push({
            path,
            type: 'modified',
            localHash: local.hash,
            localMtime: local.mtime,
          })
          remoteChanges.push({
            path,
            type: 'modified',
            remoteHash: remote.hash,
            remoteMtime: remote.mtime,
          })
        } else if (local.hash !== lastSyncHash) {
          // Only local changed
          localChanges.push({
            path,
            type: 'modified',
            localHash: local.hash,
            localMtime: local.mtime,
          })
        } else {
          // Only remote changed
          remoteChanges.push({
            path,
            type: 'modified',
            remoteHash: remote.hash,
            remoteMtime: remote.mtime,
          })
        }
      }
    }

    // Check for remote files not present locally
    for (const [path, remote] of remoteMap) {
      if (!this.localFiles.has(path)) {
        if (this.lastSyncHashes.has(path)) {
          // Was synced before — deleted locally
          localChanges.push({ path, type: 'deleted' })
        } else {
          // New remote file
          remoteChanges.push({
            path,
            type: 'created',
            remoteHash: remote.hash,
            remoteMtime: remote.mtime,
            size: remote.size,
          })
        }
      }
    }

    return { local: localChanges, remote: remoteChanges }
  }

  /**
   * Detect conflicts where both local and remote changed the same file.
   */
  detectConflicts(local: FileChange[], remote: FileChange[]): SyncConflict[] {
    const conflicts: SyncConflict[] = []
    const remoteMap = new Map(remote.map((r) => [r.path, r]))

    for (const localChange of local) {
      const remoteChange = remoteMap.get(localChange.path)
      if (remoteChange && localChange.type === 'modified' && remoteChange.type === 'modified') {
        conflicts.push({
          path: localChange.path,
          localChange,
          remoteChange,
          autoMergeable: false, // Text merge requires diff algorithm
        })
      }
    }

    return conflicts
  }

  /**
   * Execute a full sync cycle.
   * @param direction - Sync direction (push, pull, or both)
   * @param strategy - Conflict resolution strategy
   */
  async sync(
    direction: SyncDirection = 'both',
    strategy: ConflictStrategy = 'manual',
  ): Promise<SyncResult> {
    const result: SyncResult = {
      direction,
      pushed: 0,
      pulled: 0,
      conflicts: [],
      errors: [],
      timestamp: Date.now(),
    }

    try {
      const { local, remote } = await this.detectChanges()
      const conflicts = this.detectConflicts(local, remote)
      result.conflicts = conflicts

      // Resolve conflicts based on strategy
      const unresolvedConflicts: SyncConflict[] = []
      for (const conflict of conflicts) {
        const resolved = this.resolveConflict(conflict, strategy)
        if (resolved) {
          if (strategy === 'ours') local.push(conflict.localChange)
          else remote.push(conflict.remoteChange)
        } else {
          unresolvedConflicts.push(conflict)
        }
      }
      result.conflicts = unresolvedConflicts

      // Push local changes
      if (direction === 'push' || direction === 'both') {
        for (const change of local) {
          try {
            await this.applyLocalChange(change)
            result.pushed++
          } catch (err) {
            result.errors.push({
              path: change.path,
              error: err instanceof Error ? err.message : 'Push failed',
            })
          }
        }
      }

      // Pull remote changes
      if (direction === 'pull' || direction === 'both') {
        for (const change of remote) {
          try {
            await this.applyRemoteChange(change)
            result.pulled++
          } catch (err) {
            result.errors.push({
              path: change.path,
              error: err instanceof Error ? err.message : 'Pull failed',
            })
          }
        }
      }

      // Update last-sync hashes
      const remoteList = await this.adapter.listRemote()
      this.lastSyncHashes.clear()
      for (const r of remoteList) {
        this.lastSyncHashes.set(r.path, r.hash)
      }
    } catch (err) {
      result.errors.push({
        path: '__global__',
        error: err instanceof Error ? err.message : 'Sync failed',
      })
    }

    return result
  }

  /** Resolve a conflict based on the chosen strategy. Returns true if resolved. */
  private resolveConflict(conflict: SyncConflict, strategy: ConflictStrategy): boolean {
    switch (strategy) {
      case 'ours':
        return true
      case 'theirs':
        return true
      case 'merge':
        return conflict.autoMergeable
      case 'manual':
        return false
      default:
        return false
    }
  }

  /** Apply a local change to the remote backend */
  private async applyLocalChange(change: FileChange): Promise<void> {
    switch (change.type) {
      case 'created':
      case 'modified': {
        const file = this.localFiles.get(change.path)
        if (file) {
          await this.adapter.pushFile(change.path, file.content)
        }
        break
      }
      case 'deleted':
        await this.adapter.deleteRemote(change.path)
        break
      case 'renamed':
      case 'moved':
        if (change.oldPath) {
          await this.adapter.renameRemote(change.oldPath, change.path)
        }
        break
    }
  }

  /** Apply a remote change to local state */
  private async applyRemoteChange(change: FileChange): Promise<void> {
    switch (change.type) {
      case 'created':
      case 'modified': {
        const pulled = await this.adapter.pullFile(change.path)
        const hash = await computeHash(pulled.content)
        this.localFiles.set(change.path, {
          content: pulled.content,
          hash,
          mtime: pulled.mtime,
        })
        break
      }
      case 'deleted':
        this.localFiles.delete(change.path)
        break
      // rename/move handled by local side
    }
  }

  /** Get all local files (for reading synced content) */
  getAllLocalFiles(): { path: string; content: string }[] {
    return Array.from(this.localFiles.entries()).map(([path, { content }]) => ({ path, content }))
  }
}

// ==========================================
// Mock Backend Adapter (for testing/demo)
// ==========================================

/**
 * In-memory backend adapter for testing and demo purposes.
 * Simulates a remote file storage with hash-based change detection.
 */
export class MockSyncBackend implements SyncBackendAdapter {
  private remoteFiles: Map<string, { content: string; hash: string; mtime: number; size: number }> =
    new Map()

  async listRemote(): Promise<{ path: string; hash: string; mtime: number; size: number }[]> {
    return Array.from(this.remoteFiles.entries()).map(([path, { hash, mtime, size }]) => ({
      path,
      hash,
      mtime,
      size,
    }))
  }

  async pullFile(path: string): Promise<{ content: string; hash: string; mtime: number }> {
    const file = this.remoteFiles.get(path)
    if (!file) throw new Error(`Remote file not found: ${path}`)
    return { content: file.content, hash: file.hash, mtime: file.mtime }
  }

  async pushFile(path: string, content: string): Promise<{ hash: string; mtime: number }> {
    const hash = await computeHash(content)
    const mtime = Date.now()
    this.remoteFiles.set(path, { content, hash, mtime, size: content.length })
    return { hash, mtime }
  }

  async deleteRemote(path: string): Promise<void> {
    this.remoteFiles.delete(path)
  }

  async renameRemote(oldPath: string, newPath: string): Promise<void> {
    const file = this.remoteFiles.get(oldPath)
    if (file) {
      this.remoteFiles.delete(oldPath)
      this.remoteFiles.set(newPath, file)
    }
  }

  /** Simulate a remote change (for testing) */
  async simulateRemoteChange(path: string, content: string): Promise<void> {
    await this.pushFile(path, content)
  }

  /** Simulate a remote deletion (for testing) */
  async simulateRemoteDelete(path: string): Promise<void> {
    this.remoteFiles.delete(path)
  }

  /** Check if a file exists on remote */
  hasRemoteFile(path: string): boolean {
    return this.remoteFiles.has(path)
  }
}
