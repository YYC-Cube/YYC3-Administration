/**
 * @file panel-helpers.ts
 * @description YYC³ Developer Workspace — Shared helper functions, mock data,
 *   and constants used across all panel components.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,helpers
 */

import {
  File, FileCode, FileImage, FileJson, FileText,
} from "lucide-react";

import type { AIProviderType, AISuggestion, FileNode, GitCommitItem, GitStatus, SearchResult } from "./panel-types";

// ==========================================
// File Icon Mapping
// ==========================================

export const FILE_ICONS: Record<string, { icon: typeof File; color: string }> = {
  tsx: { icon: FileCode, color: "#3b82f6" },
  ts: { icon: FileCode, color: "#3b82f6" },
  jsx: { icon: FileCode, color: "#f97316" },
  js: { icon: FileCode, color: "#eab308" },
  css: { icon: FileText, color: "#8b5cf6" },
  json: { icon: FileJson, color: "#22c55e" },
  md: { icon: FileText, color: "#6b7280" },
  png: { icon: FileImage, color: "#ec4899" },
  jpg: { icon: FileImage, color: "#ec4899" },
  svg: { icon: FileImage, color: "#f97316" },
};

export function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICONS[ext] ?? { icon: File, color: "#6b7280" };
}

export function getGitStatusStyle(status?: FileNode["gitStatus"]) {
  const map: Record<string, { color: string; label: string }> = {
    modified: { color: "#eab308", label: "M" },
    added: { color: "#22c55e", label: "A" },
    deleted: { color: "#ef4444", label: "D" },
    renamed: { color: "#3b82f6", label: "R" },
    unmodified: { color: "transparent", label: "" },
  };
  return map[status ?? "unmodified"] ?? map.unmodified;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function timeAgo(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${Math.floor(diff / 86400000)}天前`;
}

// ==========================================
// AI Provider Models Config
// ==========================================

export const AI_PROVIDER_MODELS: Record<AIProviderType, { label: string; models: { id: string; name: string }[]; defaultBaseUrl: string }> = {
  mock: { label: "模拟（内置）", models: [{ id: "mock-v1", name: "YYC³ 模拟引擎" }], defaultBaseUrl: "" },
  openai: {
    label: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    ],
    defaultBaseUrl: "https://api.openai.com/v1",
  },
  claude: {
    label: "Anthropic Claude",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
    ],
    defaultBaseUrl: "https://api.anthropic.com/v1",
  },
  deepseek: {
    label: "DeepSeek",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat" },
      { id: "deepseek-coder", name: "DeepSeek Coder" },
    ],
    defaultBaseUrl: "https://api.deepseek.com/v1",
  },
};

// ==========================================
// Mock Data
// ==========================================

export const MOCK_FILE_TREE: FileNode[] = [
  {
    id: "root", type: "directory", name: "yyc3-cloudpivot", path: "/", children: [
      {
        id: "src", type: "directory", name: "src", path: "/src", children: [
          {
            id: "src/app", type: "directory", name: "app", path: "/src/app", children: [
              {
                id: "src/app/components", type: "directory", name: "components", path: "/src/app/components", children: [
                  { id: "c1", type: "file", name: "cyberpunk-standalone.tsx", path: "/src/app/components/cyberpunk-standalone.tsx", language: "tsx", gitStatus: "modified", size: 45200, modifiedAt: Date.now() - 3600000 },
                  { id: "c2", type: "file", name: "task-board-page.tsx", path: "/src/app/components/task-board-page.tsx", language: "tsx", gitStatus: "modified", size: 38400, modifiedAt: Date.now() - 1800000 },
                  { id: "c3", type: "file", name: "left-panel-page.tsx", path: "/src/app/components/left-panel-page.tsx", language: "tsx", gitStatus: "added", size: 0, modifiedAt: Date.now() },
                  { id: "c4", type: "file", name: "dashboard-page.tsx", path: "/src/app/components/dashboard-page.tsx", language: "tsx", size: 22100, modifiedAt: Date.now() - 86400000 },
                  { id: "c5", type: "file", name: "chat-interface.tsx", path: "/src/app/components/chat-interface.tsx", language: "tsx", size: 18600, modifiedAt: Date.now() - 7200000 },
                  { id: "c6", type: "file", name: "app-context.tsx", path: "/src/app/components/app-context.tsx", language: "tsx", gitStatus: "modified", size: 12400, modifiedAt: Date.now() - 900000 },
                  { id: "c7", type: "file", name: "i18n-context.tsx", path: "/src/app/components/i18n-context.tsx", language: "tsx", size: 8200, modifiedAt: Date.now() - 172800000 },
                  { id: "c8", type: "file", name: "command-palette.tsx", path: "/src/app/components/command-palette.tsx", language: "tsx", size: 9100, modifiedAt: Date.now() - 5400000 },
                ],
              },
              {
                id: "src/app/locales", type: "directory", name: "locales", path: "/src/app/locales", children: [
                  { id: "l1", type: "file", name: "zh.ts", path: "/src/app/locales/zh.ts", language: "ts", gitStatus: "modified", size: 5200 },
                  { id: "l2", type: "file", name: "en.ts", path: "/src/app/locales/en.ts", language: "ts", gitStatus: "modified", size: 4800 },
                ],
              },
              { id: "app-tsx", type: "file", name: "App.tsx", path: "/src/app/App.tsx", language: "tsx", size: 1200 },
            ],
          },
          {
            id: "src/styles", type: "directory", name: "styles", path: "/src/styles", children: [
              { id: "s1", type: "file", name: "theme.css", path: "/src/styles/theme.css", language: "css", size: 6800 },
              { id: "s2", type: "file", name: "fonts.css", path: "/src/styles/fonts.css", language: "css", size: 920 },
            ],
          },
        ],
      },
      { id: "pkg", type: "file", name: "package.json", path: "/package.json", language: "json", size: 2100 },
      { id: "tsconfig", type: "file", name: "tsconfig.json", path: "/tsconfig.json", language: "json", size: 580 },
      { id: "readme", type: "file", name: "README.md", path: "/README.md", language: "md", size: 3400 },
    ],
  },
];

export const MOCK_GIT_STATUS: GitStatus = {
  branch: "feature/left-panel-v2",
  ahead: 3,
  behind: 1,
  staged: 2,
  modified: 5,
  untracked: 1,
  conflicts: 0,
};

export const MOCK_GIT_LOG: GitCommitItem[] = [
  { hash: "a1b2c3d", message: "feat: implement left-panel-page with IDE workspace", author: "YYC3 Dev", date: Date.now() - 600000, files: 5 },
  { hash: "e4f5g6h", message: "feat: task-board v2 with Zustand + DnD + AI inference", author: "YYC3 Dev", date: Date.now() - 3600000, files: 3 },
  { hash: "i7j8k9l", message: "fix: resolve sidebar overlay on iOS Safari", author: "YYC3 Dev", date: Date.now() - 7200000, files: 2 },
  { hash: "m0n1o2p", message: "refactor: upgrade Tailwind CSS v4 configuration", author: "YYC3 Dev", date: Date.now() - 86400000, files: 8 },
  { hash: "q3r4s5t", message: "feat: add command palette with fuzzy search", author: "YYC3 Dev", date: Date.now() - 172800000, files: 4 },
];

export const MOCK_SEARCH_RESULTS: Record<string, SearchResult[]> = {
  files: [
    { id: "sr1", type: "file", title: "task-board-page.tsx", filePath: "/src/app/components/task-board-page.tsx", score: 0.95 },
    { id: "sr2", type: "file", title: "cyberpunk-standalone.tsx", filePath: "/src/app/components/cyberpunk-standalone.tsx", score: 0.88 },
    { id: "sr3", type: "file", title: "left-panel-page.tsx", filePath: "/src/app/components/left-panel-page.tsx", score: 0.85 },
  ],
  content: [
    { id: "sr4", type: "content", title: "useTaskStore", description: "Zustand persistent task store", filePath: "/src/app/components/task-board-page.tsx", line: 180, match: "const useTaskStore = create<TaskStoreState>()", score: 0.97 },
    { id: "sr5", type: "content", title: "DraggableTaskCard", description: "DnD task card component", filePath: "/src/app/components/task-board-page.tsx", line: 342, match: "function DraggableTaskCard({", score: 0.92 },
    { id: "sr6", type: "content", title: "AIInferenceSimulator", description: "AI task inference engine", filePath: "/src/app/components/task-board-page.tsx", line: 275, match: "class AIInferenceSimulator {", score: 0.89 },
  ],
  symbols: [
    { id: "sr7", type: "symbol", title: "TaskBoardPage", description: "Main task board component", filePath: "/src/app/components/task-board-page.tsx", line: 1313, score: 0.99 },
    { id: "sr8", type: "symbol", title: "LeftPanelPage", description: "IDE workspace panel", filePath: "/src/app/components/left-panel-page.tsx", line: 1, score: 0.98 },
    { id: "sr9", type: "symbol", title: "useThemeColors", description: "Theme color tokens hook", filePath: "/src/app/components/hooks/use-theme-colors.ts", line: 1, score: 0.94 },
  ],
  commands: [
    { id: "sr10", type: "command", title: "打开文件", description: "Ctrl+P 打开文件选择器", filePath: "", score: 0.96 },
    { id: "sr11", type: "command", title: "切换终端", description: "Ctrl+` 切换终端", filePath: "", score: 0.88 },
  ],
};

export const AI_RESPONSES = [
  "Based on your current codebase analysis, I recommend implementing the WebSocket integration using a custom hook pattern for better reusability across components.",
  "I've analyzed your Zustand store structure. Consider using `immer` middleware for more ergonomic immutable state updates in deeply nested objects.",
  "Looking at the task-board-page, the DnD implementation can be optimized by memoizing the `useDrag` and `useDrop` configurations with `useMemo` to reduce re-renders.",
  "Your theme system using `useThemeColors` is well-structured. To add animation tokens, extend the `ThemeColors` interface with transition/easing presets.",
  "For the file explorer's virtual scrolling, I suggest using `react-window` to efficiently render large file trees with 10,000+ nodes without performance degradation.",
];

export const AI_SUGGESTIONS_POOL: AISuggestion[] = [
  { id: "s1", type: "optimization", title: "虚拟化文件树渲染", description: "对大目录使用窗口化技术", confidence: 0.92 },
  { id: "s2", type: "refactor", title: "抽取拖放逻辑到自定义 Hook", description: "创建 useDragAndDrop hook 提高复用性", confidence: 0.88 },
  { id: "s3", type: "fix", title: "修复 AI 推理中的内存泄漏", description: "为异步操作添加 AbortController", confidence: 0.95 },
  { id: "s4", type: "code", title: "添加错误边界包装器", description: "使用 React 错误边界包裹面板", confidence: 0.86 },
];