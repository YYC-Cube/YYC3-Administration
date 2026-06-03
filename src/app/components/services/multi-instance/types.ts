/**
 * @file types.ts
 * @description YYC³ Multi-Instance System — Core type definitions for
 *   window management, workspace isolation, session management, and IPC.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P2,multi-instance,types
 */

/** Instance type classification */
export type InstanceType = 'main' | 'secondary' | 'popup' | 'preview'

/** Window type classification */
export type WindowType = 'main' | 'editor' | 'preview' | 'terminal' | 'ai-chat' | 'settings'

/** Workspace type classification */
export type WorkspaceType = 'project' | 'ai-session' | 'debug' | 'custom'

/** Session type classification */
export type SessionType = 'ai-chat' | 'code-edit' | 'debug' | 'preview' | 'terminal'

/** Application instance */
export interface AppInstance {
  id: string
  type: InstanceType
  windowId: string
  windowType: WindowType
  title: string
  createdAt: number
  lastActiveAt: number
  isMain: boolean
  isVisible: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  workspaceId?: string
  sessionIds: string[]
  state: Record<string, unknown>
}

/** Workspace */
export interface Workspace {
  id: string
  name: string
  type: WorkspaceType
  icon?: string
  createdAt: number
  updatedAt: number
  projectPath?: string
  config: WorkspaceConfig
  sessions: Session[]
  windowIds: string[]
  isActive: boolean
}

/** Workspace configuration */
export interface WorkspaceConfig {
  editor?: { fontSize?: number; tabSize?: number; wordWrap?: boolean }
  ai?: { provider?: string; model?: string; temperature?: number }
  theme?: string
}

/** Session */
export interface Session {
  id: string
  type: SessionType
  name: string
  createdAt: number
  updatedAt: number
  status: 'active' | 'idle' | 'suspended' | 'closed'
  data: SessionData
  workspaceId: string
  windowId: string
}

/** Session data */
export interface SessionData {
  aiMessages?: Array<{ role: string; content: string }>
  editedFiles?: Array<{ path: string; content: string }>
  terminalHistory?: Array<{ command: string; output: string }>
  debugState?: unknown
  previewUrl?: string
}

/** IPC message types */
export type IPCMessageType =
  | 'instance-created'
  | 'instance-closed'
  | 'workspace-created'
  | 'workspace-updated'
  | 'workspace-closed'
  | 'session-created'
  | 'session-updated'
  | 'session-closed'
  | 'state-sync'
  | 'resource-share'
  | 'clipboard-share'

/** IPC message */
export interface IPCMessage {
  id: string
  type: IPCMessageType
  senderId: string
  receiverId?: string
  data: unknown
  timestamp: number
}

/** Window creation config */
export interface WindowConfig {
  title?: string
  size?: { width: number; height: number }
  position?: { x: number; y: number }
  resizable?: boolean
  alwaysOnTop?: boolean
  workspaceId?: string
}
