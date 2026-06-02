/**
 * @file panel-types.ts
 * @description YYC³ Developer Workspace — Shared panel types and interfaces.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,frontend,panels,types
 */

export type PanelType =
  | 'file-explorer'
  | 'task-manager'
  | 'ai-assistant'
  | 'global-search'
  | 'quick-access'
  | 'git-integration'
  | 'settings'

export type AIProviderType = 'mock' | 'openai' | 'claude' | 'deepseek'

export interface AIProviderConfig {
  provider: AIProviderType
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  baseUrl?: string
}

export interface FileNode {
  id: string
  type: 'file' | 'directory'
  name: string
  path: string
  children?: FileNode[]
  isExpanded?: boolean
  size?: number
  modifiedAt?: number
  language?: string
  gitStatus?: 'unmodified' | 'modified' | 'added' | 'deleted' | 'renamed'
}

export interface SearchResult {
  id: string
  type: 'file' | 'content' | 'symbol' | 'command'
  title: string
  description?: string
  filePath: string
  line?: number
  match?: string
  score: number
}

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface AISuggestion {
  id: string
  type: 'code' | 'explanation' | 'refactor' | 'fix' | 'optimization'
  title: string
  description: string
  confidence: number
}

export interface QuickAccessItem {
  id: string
  name: string
  path: string
  type: 'recent' | 'favorite' | 'pinned'
  lastAccessed: number
  language?: string
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: number
  modified: number
  untracked: number
  conflicts: number
}

export interface GitCommitItem {
  hash: string
  message: string
  author: string
  date: number
  files: number
}
