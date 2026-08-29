/**
 * @file index.ts
 * @description YYC³ Developer Workspace — Panel components barrel export.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,export
 */

// Types
export type {
  PanelType,
  FileNode,
  SearchResult,
  AIChatMessage,
  AISuggestion,
  QuickAccessItem,
  GitStatus,
  GitCommitItem,
} from '@/features/dev-workspace/panels/panel-types'

// Store
export { usePanelStore } from '@/features/dev-workspace/panels/panel-store'
export type {
  PanelStoreState,
  PanelStoreActions,
} from '@/features/dev-workspace/panels/panel-store'

// Helpers
export {
  getFileIcon,
  getGitStatusStyle,
  formatFileSize,
  timeAgo,
  MOCK_FILE_TREE,
  MOCK_GIT_STATUS,
  MOCK_GIT_LOG,
  MOCK_SEARCH_RESULTS,
  AI_RESPONSES,
  AI_SUGGESTIONS_POOL,
} from '@/features/dev-workspace/panels/panel-helpers'

// Panel Components
export { FileExplorerPanel } from '@/features/dev-workspace/panels/file-explorer-panel'
export { TaskManagerPanel } from '@/features/dev-workspace/panels/task-manager-panel'
export { AIAssistantPanel } from '@/features/dev-workspace/panels/ai-assistant-panel'
export { GlobalSearchPanel } from '@/features/dev-workspace/panels/global-search-panel'
export { QuickAccessPanel } from '@/features/dev-workspace/panels/quick-access-panel'
export { GitIntegrationPanel } from '@/features/dev-workspace/panels/git-integration-panel'

// New panels
export { WorkspaceSettingsPanel } from '@/features/dev-workspace/panels/workspace-settings-panel'
export {
  EditorQuickActions,
  QUICK_ACTIONS,
  buildActionPrompt,
  getMockResponse,
} from '@/features/dev-workspace/panels/editor-quick-actions'
export type { QuickAction } from '@/features/dev-workspace/panels/editor-quick-actions'

// Multi-Instance UI
export { WindowBar } from '@/features/dev-workspace/panels/window-bar'
export { WorkspaceSelector } from '@/features/dev-workspace/panels/workspace-selector'
