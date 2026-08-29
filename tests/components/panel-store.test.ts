/**
 * @file panel-store.test.ts
 * @description Panel Zustand Store 单元测试
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { usePanelStore } from '../../src/app/components/panels/panel-store'

import type { FileNode, QuickAccessItem } from '../../src/app/components/panels/panel-types'

// ==========================================
// Helper: 重置 store 状态
// ==========================================

beforeEach(() => {
  usePanelStore.setState({
    activePanel: 'file-explorer',
    panelCollapsed: false,
    panelWidth: 300,
    expandedFolders: ['root', 'src'],
    selectedFile: null,
    recentFiles: [],
    favoriteFiles: [],
    aiMessages: [],
    searchHistory: [],
    fileTree: [],
  })
})

// ==========================================
// Panel 状态
// ==========================================

describe('PanelStore — 面板状态', () => {
  it('初始状态正确', () => {
    const state = usePanelStore.getState()
    expect(state.activePanel).toBe('file-explorer')
    expect(state.panelCollapsed).toBe(false)
    expect(state.panelWidth).toBe(300)
  })

  it('setActivePanel 切换面板', () => {
    usePanelStore.getState().setActivePanel('task-manager')
    expect(usePanelStore.getState().activePanel).toBe('task-manager')
  })

  it('toggleCollapsed 切换折叠状态', () => {
    usePanelStore.getState().toggleCollapsed()
    expect(usePanelStore.getState().panelCollapsed).toBe(true)
    usePanelStore.getState().toggleCollapsed()
    expect(usePanelStore.getState().panelCollapsed).toBe(false)
  })

  it('setPanelWidth 限制范围 [200, 600]', () => {
    usePanelStore.getState().setPanelWidth(150)
    expect(usePanelStore.getState().panelWidth).toBe(200) // min

    usePanelStore.getState().setPanelWidth(800)
    expect(usePanelStore.getState().panelWidth).toBe(600) // max

    usePanelStore.getState().setPanelWidth(400)
    expect(usePanelStore.getState().panelWidth).toBe(400) // normal
  })
})

// ==========================================
// 文件夹展开
// ==========================================

describe('PanelStore — 文件夹展开', () => {
  it('toggleFolder 切换展开状态', () => {
    usePanelStore.getState().toggleFolder('src')
    expect(usePanelStore.getState().expandedFolders).not.toContain('src')

    usePanelStore.getState().toggleFolder('src')
    expect(usePanelStore.getState().expandedFolders).toContain('src')
  })

  it('toggleFolder 添加新文件夹', () => {
    usePanelStore.getState().toggleFolder('new-folder')
    expect(usePanelStore.getState().expandedFolders).toContain('new-folder')
  })
})

// ==========================================
// 文件选择
// ==========================================

describe('PanelStore — 文件选择', () => {
  it('selectFile 设置选中文件', () => {
    usePanelStore.getState().selectFile('/src/app/App.tsx')
    expect(usePanelStore.getState().selectedFile).toBe('/src/app/App.tsx')
  })

  it('selectFile(null) 清除选中', () => {
    usePanelStore.getState().selectFile('/src/file.ts')
    usePanelStore.getState().selectFile(null)
    expect(usePanelStore.getState().selectedFile).toBeNull()
  })
})

// ==========================================
// 最近文件
// ==========================================

describe('PanelStore — 最近文件', () => {
  const item1: QuickAccessItem = {
    id: '1',
    name: 'file1.ts',
    path: '/src/file1.ts',
    type: 'recent',
    lastAccessed: 1000,
  }
  const item2: QuickAccessItem = {
    id: '2',
    name: 'file2.ts',
    path: '/src/file2.ts',
    type: 'recent',
    lastAccessed: 2000,
  }

  it('addRecentFile 添加到列表头部', () => {
    usePanelStore.getState().addRecentFile(item2)
    usePanelStore.getState().addRecentFile(item1)
    expect(usePanelStore.getState().recentFiles[0]).toEqual(item1)
    expect(usePanelStore.getState().recentFiles[1]).toEqual(item2)
  })

  it('addRecentFile 去重（相同 path）', () => {
    usePanelStore.getState().addRecentFile(item1)
    usePanelStore.getState().addRecentFile(item1)
    expect(usePanelStore.getState().recentFiles).toHaveLength(1)
  })

  it('addRecentFile 限制最多 20 条', () => {
    for (let i = 0; i < 25; i++) {
      usePanelStore.getState().addRecentFile({
        id: `item-${i}`,
        name: `file${i}.ts`,
        path: `/src/file${i}.ts`,
        type: 'recent',
        lastAccessed: Date.now() + i,
      })
    }
    expect(usePanelStore.getState().recentFiles).toHaveLength(20)
  })
})

// ==========================================
// 收藏文件
// ==========================================

describe('PanelStore — 收藏文件', () => {
  const item: QuickAccessItem = {
    id: '1',
    name: 'favorite.ts',
    path: '/src/fav.ts',
    type: 'favorite',
    lastAccessed: 1000,
  }

  it('toggleFavorite 添加收藏', () => {
    usePanelStore.getState().toggleFavorite(item)
    expect(usePanelStore.getState().favoriteFiles).toHaveLength(1)
    expect(usePanelStore.getState().favoriteFiles[0].path).toBe('/src/fav.ts')
  })

  it('toggleFavorite 取消收藏', () => {
    usePanelStore.getState().toggleFavorite(item)
    usePanelStore.getState().toggleFavorite(item)
    expect(usePanelStore.getState().favoriteFiles).toHaveLength(0)
  })
})

// ==========================================
// AI 消息
// ==========================================

describe('PanelStore — AI 消息', () => {
  it('addAIMessage 追加消息', () => {
    usePanelStore.getState().addAIMessage({
      id: 'msg1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now(),
    })
    usePanelStore.getState().addAIMessage({
      id: 'msg2',
      role: 'assistant',
      content: 'Hi there',
      timestamp: Date.now(),
    })
    expect(usePanelStore.getState().aiMessages).toHaveLength(2)
  })

  it('clearAIMessages 清空所有消息', () => {
    usePanelStore.getState().addAIMessage({
      id: 'msg1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now(),
    })
    usePanelStore.getState().clearAIMessages()
    expect(usePanelStore.getState().aiMessages).toHaveLength(0)
  })
})

// ==========================================
// 搜索历史
// ==========================================

describe('PanelStore — 搜索历史', () => {
  it('addSearchHistory 添加搜索词', () => {
    usePanelStore.getState().addSearchHistory('test query')
    expect(usePanelStore.getState().searchHistory).toContain('test query')
  })

  it('addSearchHistory 去重', () => {
    usePanelStore.getState().addSearchHistory('test')
    usePanelStore.getState().addSearchHistory('test')
    expect(usePanelStore.getState().searchHistory.filter((q) => q === 'test')).toHaveLength(1)
  })

  it('addSearchHistory 限制最多 10 条', () => {
    for (let i = 0; i < 15; i++) {
      usePanelStore.getState().addSearchHistory(`query-${i}`)
    }
    expect(usePanelStore.getState().searchHistory).toHaveLength(10)
  })
})

// ==========================================
// AI Provider 配置
// ==========================================
