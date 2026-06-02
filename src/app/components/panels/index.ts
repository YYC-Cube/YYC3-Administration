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
export type { PanelType, AIProviderType, AIProviderConfig, FileNode, SearchResult, AIChatMessage, AISuggestion, QuickAccessItem, GitStatus, GitCommitItem } from "./panel-types";

// Store
export { usePanelStore } from "./panel-store";
export type { PanelStoreState, PanelStoreActions } from "./panel-store";

// Helpers
export { getFileIcon, getGitStatusStyle, formatFileSize, timeAgo, AI_PROVIDER_MODELS, MOCK_FILE_TREE, MOCK_GIT_STATUS, MOCK_GIT_LOG, MOCK_SEARCH_RESULTS, AI_RESPONSES, AI_SUGGESTIONS_POOL } from "./panel-helpers";

// Panel Components
export { FileExplorerPanel } from "./file-explorer-panel";
export { TaskManagerPanel } from "./task-manager-panel";
export { AIAssistantPanel } from "./ai-assistant-panel";
export { GlobalSearchPanel } from "./global-search-panel";
export { QuickAccessPanel } from "./quick-access-panel";
export { GitIntegrationPanel } from "./git-integration-panel";

// New panels
export { WorkspaceSettingsPanel } from "./workspace-settings-panel";
export { EditorQuickActions, QUICK_ACTIONS, buildActionPrompt, getMockResponse } from "./editor-quick-actions";
export type { QuickAction } from "./editor-quick-actions";

// Multi-Instance UI
export { WindowBar } from "./window-bar";
export { WorkspaceSelector } from "./workspace-selector";