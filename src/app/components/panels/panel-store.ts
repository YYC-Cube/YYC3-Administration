/**
 * @file panel-store.ts
 * @description YYC³ Developer Workspace — Zustand persistent panel store.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,frontend,panels,store,zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  AIChatMessage,
  AIProviderConfig,
  FileNode,
  PanelType,
  QuickAccessItem,
} from './panel-types'

// ==========================================
// Store Interface
// ==========================================

export interface PanelStoreState {
  activePanel: PanelType
  panelCollapsed: boolean
  panelWidth: number
  expandedFolders: string[]
  selectedFile: string | null
  recentFiles: QuickAccessItem[]
  favoriteFiles: QuickAccessItem[]
  aiMessages: AIChatMessage[]
  searchHistory: string[]
  aiProviderConfig: AIProviderConfig
  fileTree: FileNode[]
}

export interface PanelStoreActions {
  setActivePanel: (panel: PanelType) => void
  toggleCollapsed: () => void
  setPanelWidth: (width: number) => void
  toggleFolder: (id: string) => void
  selectFile: (path: string | null) => void
  addRecentFile: (item: QuickAccessItem) => void
  toggleFavorite: (item: QuickAccessItem) => void
  addAIMessage: (msg: AIChatMessage) => void
  clearAIMessages: () => void
  addSearchHistory: (q: string) => void
  setAIProviderConfig: (config: Partial<AIProviderConfig>) => void
  setFileTree: (tree: FileNode[]) => void
  addFileNode: (parentPath: string, node: FileNode) => void
  deleteFileNode: (path: string) => void
  renameFileNode: (oldPath: string, newName: string) => void
}

// ==========================================
// Store Implementation
// ==========================================

export const usePanelStore = create<PanelStoreState & PanelStoreActions>()(
  persist(
    (set, _get) => ({
      activePanel: 'file-explorer',
      panelCollapsed: false,
      panelWidth: 300,
      expandedFolders: ['root', 'src', 'src/app', 'src/app/components'],
      selectedFile: null,
      recentFiles: [],
      favoriteFiles: [],
      aiMessages: [],
      searchHistory: [],
      aiProviderConfig: {
        provider: 'mock',
        apiKey: '',
        model: 'mock-v1',
        temperature: 0.7,
        maxTokens: 2048,
      },
      fileTree: [],

      setActivePanel: (panel) => set({ activePanel: panel }),
      toggleCollapsed: () => set((s) => ({ panelCollapsed: !s.panelCollapsed })),
      setPanelWidth: (width) => set({ panelWidth: Math.max(200, Math.min(600, width)) }),
      toggleFolder: (id) =>
        set((s) => ({
          expandedFolders: s.expandedFolders.includes(id)
            ? s.expandedFolders.filter((f) => f !== id)
            : [...s.expandedFolders, id],
        })),
      selectFile: (path) => set({ selectedFile: path }),
      addRecentFile: (item) =>
        set((s) => ({
          recentFiles: [item, ...s.recentFiles.filter((f) => f.path !== item.path)].slice(0, 20),
        })),
      toggleFavorite: (item) =>
        set((s) => {
          const exists = s.favoriteFiles.some((f) => f.path === item.path)
          return {
            favoriteFiles: exists
              ? s.favoriteFiles.filter((f) => f.path !== item.path)
              : [...s.favoriteFiles, { ...item, type: 'favorite' }],
          }
        }),
      addAIMessage: (msg) => set((s) => ({ aiMessages: [...s.aiMessages, msg] })),
      clearAIMessages: () => set({ aiMessages: [] }),
      addSearchHistory: (q) =>
        set((s) => ({
          searchHistory: [q, ...s.searchHistory.filter((h) => h !== q)].slice(0, 10),
        })),
      setAIProviderConfig: (config) =>
        set((s) => ({ aiProviderConfig: { ...s.aiProviderConfig, ...config } })),
      setFileTree: (tree) => set({ fileTree: tree }),
      addFileNode: (parentPath, node) =>
        set((s) => {
          const addToTree = (nodes: FileNode[]): FileNode[] =>
            nodes.map((n) => {
              if (n.path === parentPath && n.type === 'directory') {
                return { ...n, children: [...(n.children ?? []), node] }
              }
              if (n.children) return { ...n, children: addToTree(n.children) }
              return n
            })
          return { fileTree: addToTree(s.fileTree) }
        }),
      deleteFileNode: (path) =>
        set((s) => {
          const removeFromTree = (nodes: FileNode[]): FileNode[] =>
            nodes
              .filter((n) => n.path !== path)
              .map((n) => (n.children ? { ...n, children: removeFromTree(n.children) } : n))
          return {
            fileTree: removeFromTree(s.fileTree),
            selectedFile: s.selectedFile === path ? null : s.selectedFile,
          }
        }),
      renameFileNode: (oldPath, newName) =>
        set((s) => {
          const renameInTree = (nodes: FileNode[]): FileNode[] =>
            nodes.map((n) => {
              if (n.path === oldPath) {
                const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'))
                const newPath = parentPath ? `${parentPath}/${newName}` : `/${newName}`
                return { ...n, name: newName, path: newPath, id: newPath }
              }
              if (n.children) return { ...n, children: renameInTree(n.children) }
              return n
            })
          return { fileTree: renameInTree(s.fileTree) }
        }),
    }),
    {
      name: 'yyc3-left-panel-storage',
      partialize: (s) => ({
        activePanel: s.activePanel,
        panelWidth: s.panelWidth,
        expandedFolders: s.expandedFolders,
        recentFiles: s.recentFiles,
        favoriteFiles: s.favoriteFiles,
        aiMessages: s.aiMessages,
        searchHistory: s.searchHistory,
        aiProviderConfig: s.aiProviderConfig,
      }),
    },
  ),
)
