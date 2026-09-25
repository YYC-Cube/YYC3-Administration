/**
 * @file multi-instance.test.ts
 * @description YYC³ Multi-Instance System — Vitest Unit Tests
 *   Covers: WindowManager, WorkspaceManager, PanelStore
 *   (SessionManager/IPCManager 为 Electron 时代遗留死代码,已随 F-06 清理删除)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.1.0
 * @created 2026-03-18
 * @updated 2026-09-26
 * @tags P2,testing,multi-instance
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { useWindowStore } from '@/features/dev-workspace/multi-instance/window-manager'
import { useWorkspaceStore } from '@/features/dev-workspace/multi-instance/workspace-manager'

// ==========================================
// WindowManager Tests
// ==========================================

describe('WindowManager', () => {
  beforeEach(() => {
    useWindowStore.setState({ instances: [], activeInstanceId: null, mainInstanceId: null })
  })

  it('should create a main window as first instance', () => {
    const instance = useWindowStore.getState().createWindow('main')
    expect(instance.type).toBe('main')
    expect(instance.isMain).toBe(true)
    expect(instance.windowType).toBe('main')
    expect(instance.isVisible).toBe(true)
    expect(instance.isMinimized).toBe(false)
    expect(useWindowStore.getState().instances.length).toBe(1)
    expect(useWindowStore.getState().activeInstanceId).toBe(instance.windowId)
  })

  it('should create secondary windows after main', () => {
    useWindowStore.getState().createWindow('main')
    const secondary = useWindowStore.getState().createWindow('editor', { title: 'Test Editor' })
    expect(secondary.type).toBe('secondary')
    expect(secondary.isMain).toBe(false)
    expect(secondary.title).toBe('Test Editor')
    expect(useWindowStore.getState().instances.length).toBe(2)
  })

  it('should close a window and update active', () => {
    const w1 = useWindowStore.getState().createWindow('main')
    const w2 = useWindowStore.getState().createWindow('editor')
    useWindowStore.getState().closeWindow(w2.windowId)
    expect(useWindowStore.getState().instances.length).toBe(1)
    expect(useWindowStore.getState().instances[0].windowId).toBe(w1.windowId)
  })

  it('should activate a window', () => {
    const w1 = useWindowStore.getState().createWindow('main')
    const _w2 = useWindowStore.getState().createWindow('editor')
    useWindowStore.getState().activateWindow(w1.windowId)
    expect(useWindowStore.getState().activeInstanceId).toBe(w1.windowId)
  })

  it('should minimize and restore', () => {
    const w = useWindowStore.getState().createWindow('main')
    useWindowStore.getState().minimizeWindow(w.windowId)
    expect(useWindowStore.getState().instances[0].isMinimized).toBe(true)
    useWindowStore.getState().restoreWindow(w.windowId)
    expect(useWindowStore.getState().instances[0].isMinimized).toBe(false)
  })

  it('should move and resize', () => {
    const w = useWindowStore.getState().createWindow('main')
    useWindowStore.getState().moveWindow(w.windowId, { x: 200, y: 300 })
    expect(useWindowStore.getState().instances[0].position).toEqual({ x: 200, y: 300 })
    useWindowStore.getState().resizeWindow(w.windowId, { width: 800, height: 600 })
    expect(useWindowStore.getState().instances[0].size).toEqual({ width: 800, height: 600 })
  })

  it('should return all windows and active window', () => {
    const _w1 = useWindowStore.getState().createWindow('main')
    useWindowStore.getState().createWindow('editor')
    expect(useWindowStore.getState().getAllWindows().length).toBe(2)
    const active = useWindowStore.getState().getActiveWindow()
    expect(active).toBeDefined()
  })

  it('should apply custom config', () => {
    const w = useWindowStore.getState().createWindow('ai-chat', {
      title: 'AI Chat',
      size: { width: 500, height: 400 },
      position: { x: 50, y: 50 },
      workspaceId: 'ws-123',
    })
    expect(w.title).toBe('AI Chat')
    expect(w.size).toEqual({ width: 500, height: 400 })
    expect(w.position).toEqual({ x: 50, y: 50 })
    expect(w.workspaceId).toBe('ws-123')
  })

  it('should update window state', () => {
    const w = useWindowStore.getState().createWindow('main')
    useWindowStore.getState().updateWindowState(w.windowId, { title: 'Updated Title' })
    expect(useWindowStore.getState().instances[0].title).toBe('Updated Title')
  })
})

// ==========================================
// WorkspaceManager Tests
// ==========================================

describe('WorkspaceManager', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({ workspaces: [], activeWorkspaceId: null, filter: {} })
  })

  it('should create a workspace', () => {
    const ws = useWorkspaceStore.getState().createWorkspace('My Project', 'project')
    expect(ws.name).toBe('My Project')
    expect(ws.type).toBe('project')
    expect(ws.isActive).toBe(false)
    expect(ws.sessions.length).toBe(0)
    expect(useWorkspaceStore.getState().workspaces.length).toBe(1)
  })

  it('should create workspace with config', () => {
    const ws = useWorkspaceStore.getState().createWorkspace('AI Session', 'ai-session', {
      ai: { provider: 'openai', model: 'gpt-4' },
    })
    expect(ws.config.ai?.provider).toBe('openai')
  })

  it('should update a workspace', () => {
    const ws = useWorkspaceStore.getState().createWorkspace('Test', 'project')
    useWorkspaceStore.getState().updateWorkspace(ws.id, { name: 'Updated' })
    expect(useWorkspaceStore.getState().workspaces[0].name).toBe('Updated')
  })

  it('should delete a workspace', () => {
    const ws = useWorkspaceStore.getState().createWorkspace('Test', 'project')
    useWorkspaceStore.getState().deleteWorkspace(ws.id)
    expect(useWorkspaceStore.getState().workspaces.length).toBe(0)
  })

  it('should activate a workspace', () => {
    const ws1 = useWorkspaceStore.getState().createWorkspace('WS1', 'project')
    const ws2 = useWorkspaceStore.getState().createWorkspace('WS2', 'project')
    useWorkspaceStore.getState().activateWorkspace(ws2.id)
    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe(ws2.id)
    expect(useWorkspaceStore.getState().workspaces.find((w) => w.id === ws2.id)?.isActive).toBe(
      true,
    )
    expect(useWorkspaceStore.getState().workspaces.find((w) => w.id === ws1.id)?.isActive).toBe(
      false,
    )
  })

  it('should duplicate a workspace', () => {
    const ws = useWorkspaceStore
      .getState()
      .createWorkspace('Original', 'project', { theme: 'cyberpunk' })
    const dup = useWorkspaceStore.getState().duplicateWorkspace(ws.id)
    expect(dup.name).toBe('Original (Copy)')
    expect(dup.id).not.toBe(ws.id)
    expect(dup.config.theme).toBe('cyberpunk')
    expect(useWorkspaceStore.getState().workspaces.length).toBe(2)
  })

  it('should throw when duplicating non-existent workspace', () => {
    expect(() => useWorkspaceStore.getState().duplicateWorkspace('non-existent')).toThrow(
      'Workspace not found',
    )
  })

  it('should export and import workspace', () => {
    const ws = useWorkspaceStore
      .getState()
      .createWorkspace('Export Me', 'custom', { editor: { fontSize: 16 } })
    const exported = useWorkspaceStore.getState().exportWorkspace(ws.id)
    expect(exported).toContain('Export Me')

    useWorkspaceStore.setState({ workspaces: [] })
    const imported = useWorkspaceStore.getState().importWorkspace(exported)
    expect(imported.name).toBe('Export Me')
    expect(imported.id).not.toBe(ws.id) // New ID
    expect(imported.config.editor?.fontSize).toBe(16)
  })

  it('should filter workspaces by type', () => {
    useWorkspaceStore.getState().createWorkspace('P1', 'project')
    useWorkspaceStore.getState().createWorkspace('AI1', 'ai-session')
    useWorkspaceStore.getState().createWorkspace('P2', 'project')
    useWorkspaceStore.getState().updateFilter({ type: 'project' })
    const filtered = useWorkspaceStore.getState().getFilteredWorkspaces()
    expect(filtered.length).toBe(2)
  })

  it('should filter workspaces by search', () => {
    useWorkspaceStore.getState().createWorkspace('Alpha Project', 'project')
    useWorkspaceStore.getState().createWorkspace('Beta Project', 'project')
    useWorkspaceStore.getState().updateFilter({ search: 'alpha' })
    const filtered = useWorkspaceStore.getState().getFilteredWorkspaces()
    expect(filtered.length).toBe(1)
    expect(filtered[0].name).toBe('Alpha Project')
  })
})

// ==========================================
// SessionManager / IPCManager Tests — 已删除
// (Electron 时代遗留死代码,源文件随 F-06 死代码清理移除,2026-09-26)
// ==========================================

// ==========================================
// Panel Store Tests
// ==========================================

describe('PanelStore', () => {
  // Import inline to avoid circular dependency issues
  let usePanelStore: typeof import('@/features/dev-workspace/panels/panel-store').usePanelStore

  beforeEach(async () => {
    const mod = await import('@/features/dev-workspace/panels/panel-store')
    usePanelStore = mod.usePanelStore
    usePanelStore.setState({
      activePanel: 'file-explorer',
      panelCollapsed: false,
      panelWidth: 300,
      expandedFolders: [],
      selectedFile: null,
      recentFiles: [],
      favoriteFiles: [],
      aiMessages: [],
      searchHistory: [],
      fileTree: [],
    })
  })

  it('should switch active panel', () => {
    usePanelStore.getState().setActivePanel('ai-assistant')
    expect(usePanelStore.getState().activePanel).toBe('ai-assistant')
  })

  it('should toggle collapsed state', () => {
    usePanelStore.getState().toggleCollapsed()
    expect(usePanelStore.getState().panelCollapsed).toBe(true)
    usePanelStore.getState().toggleCollapsed()
    expect(usePanelStore.getState().panelCollapsed).toBe(false)
  })

  it('should clamp panel width between 200-600', () => {
    usePanelStore.getState().setPanelWidth(100)
    expect(usePanelStore.getState().panelWidth).toBe(200)
    usePanelStore.getState().setPanelWidth(800)
    expect(usePanelStore.getState().panelWidth).toBe(600)
    usePanelStore.getState().setPanelWidth(400)
    expect(usePanelStore.getState().panelWidth).toBe(400)
  })

  it('should toggle folder expansion', () => {
    usePanelStore.getState().toggleFolder('src')
    expect(usePanelStore.getState().expandedFolders).toContain('src')
    usePanelStore.getState().toggleFolder('src')
    expect(usePanelStore.getState().expandedFolders).not.toContain('src')
  })

  it('should select and deselect file', () => {
    usePanelStore.getState().selectFile('/test.ts')
    expect(usePanelStore.getState().selectedFile).toBe('/test.ts')
    usePanelStore.getState().selectFile(null)
    expect(usePanelStore.getState().selectedFile).toBeNull()
  })

  it('should add recent files (max 20, dedupe)', () => {
    for (let i = 0; i < 25; i++) {
      usePanelStore.getState().addRecentFile({
        id: `f${i}`,
        name: `file${i}.ts`,
        path: `/file${i}.ts`,
        type: 'recent',
        lastAccessed: Date.now(),
      })
    }
    expect(usePanelStore.getState().recentFiles.length).toBe(20)
    // Most recent should be first
    expect(usePanelStore.getState().recentFiles[0].name).toBe('file24.ts')
  })

  it('should toggle favorites', () => {
    const item = {
      id: 'f1',
      name: 'test.ts',
      path: '/test.ts',
      type: 'favorite' as const,
      lastAccessed: Date.now(),
    }
    usePanelStore.getState().toggleFavorite(item)
    expect(usePanelStore.getState().favoriteFiles.length).toBe(1)
    usePanelStore.getState().toggleFavorite(item)
    expect(usePanelStore.getState().favoriteFiles.length).toBe(0)
  })

  it('should manage AI messages', () => {
    usePanelStore
      .getState()
      .addAIMessage({ id: 'm1', role: 'user', content: 'Hello', timestamp: Date.now() })
    usePanelStore
      .getState()
      .addAIMessage({ id: 'm2', role: 'assistant', content: 'Hi!', timestamp: Date.now() })
    expect(usePanelStore.getState().aiMessages.length).toBe(2)
    usePanelStore.getState().clearAIMessages()
    expect(usePanelStore.getState().aiMessages.length).toBe(0)
  })

  it('should manage search history (max 10, dedupe)', () => {
    for (let i = 0; i < 12; i++) {
      usePanelStore.getState().addSearchHistory(`query${i}`)
    }
    expect(usePanelStore.getState().searchHistory.length).toBe(10)
    expect(usePanelStore.getState().searchHistory[0]).toBe('query11')
  })

  it('should manage file tree CRUD', () => {
    const tree = [{ id: 'root', type: 'directory' as const, name: 'root', path: '/', children: [] }]
    usePanelStore.getState().setFileTree(tree)
    expect(usePanelStore.getState().fileTree.length).toBe(1)

    // Add file to root
    usePanelStore
      .getState()
      .addFileNode('/', { id: 'f1', type: 'file', name: 'test.ts', path: '/test.ts' })
    expect(usePanelStore.getState().fileTree[0].children?.length).toBe(1)

    // Rename
    usePanelStore.getState().renameFileNode('/test.ts', 'renamed.ts')
    expect(usePanelStore.getState().fileTree[0].children?.[0].name).toBe('renamed.ts')

    // Delete
    usePanelStore.getState().deleteFileNode('/renamed.ts')
    expect(usePanelStore.getState().fileTree[0].children?.length).toBe(0)
  })

  it('should clear selectedFile when deleting selected file', () => {
    usePanelStore.getState().selectFile('/test.ts')
    usePanelStore
      .getState()
      .setFileTree([{ id: 'f1', type: 'file', name: 'test.ts', path: '/test.ts' }])
    usePanelStore.getState().deleteFileNode('/test.ts')
    expect(usePanelStore.getState().selectedFile).toBeNull()
  })
})
