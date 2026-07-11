/**
 * @file panel-components.test.ts
 * @description YYC³ Panel Components — Vitest unit tests for the extracted
 *   panel store, helpers, and panel type system.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,panels
 */

import { beforeEach, describe, expect, it } from 'vitest'

describe('Panel Helpers', () => {
  let helpers: typeof import('../../../src/app/components/panels/panel-helpers')

  beforeEach(async () => {
    helpers = await import('../../../src/app/components/panels/panel-helpers')
  })

  describe('getFileIcon', () => {
    it('should return correct icon for .tsx files', () => {
      const result = helpers.getFileIcon('App.tsx')
      expect(result.color).toBe('#3b82f6')
    })

    it('should return correct icon for .json files', () => {
      const result = helpers.getFileIcon('package.json')
      expect(result.color).toBe('#22c55e')
    })

    it('should return correct icon for .css files', () => {
      const result = helpers.getFileIcon('theme.css')
      expect(result.color).toBe('#8b5cf6')
    })

    it('should return fallback icon for unknown extensions', () => {
      const result = helpers.getFileIcon('unknown.xyz')
      expect(result.color).toBe('#6b7280')
    })

    it('should handle files with no extension', () => {
      const result = helpers.getFileIcon('Makefile')
      expect(result.color).toBe('#6b7280')
    })

    it('should handle case-insensitive extensions', () => {
      const result = helpers.getFileIcon('image.PNG')
      expect(result.color).toBe('#ec4899')
    })
  })

  describe('getGitStatusStyle', () => {
    it('should return yellow for modified', () => {
      const result = helpers.getGitStatusStyle('modified')
      expect(result.color).toBe('#eab308')
      expect(result.label).toBe('M')
    })

    it('should return green for added', () => {
      const result = helpers.getGitStatusStyle('added')
      expect(result.color).toBe('#22c55e')
      expect(result.label).toBe('A')
    })

    it('should return red for deleted', () => {
      const result = helpers.getGitStatusStyle('deleted')
      expect(result.color).toBe('#ef4444')
      expect(result.label).toBe('D')
    })

    it('should return transparent for unmodified', () => {
      const result = helpers.getGitStatusStyle('unmodified')
      expect(result.color).toBe('transparent')
      expect(result.label).toBe('')
    })

    it('should handle undefined status', () => {
      const result = helpers.getGitStatusStyle(undefined)
      expect(result.color).toBe('transparent')
    })
  })

  describe('formatFileSize', () => {
    it('should return empty for 0 bytes', () => {
      expect(helpers.formatFileSize(0)).toBe('')
    })

    it('should return empty for undefined', () => {
      expect(helpers.formatFileSize(undefined)).toBe('')
    })

    it('should format bytes', () => {
      expect(helpers.formatFileSize(500)).toBe('500B')
    })

    it('should format kilobytes', () => {
      expect(helpers.formatFileSize(5120)).toBe('5.0KB')
    })

    it('should format megabytes', () => {
      expect(helpers.formatFileSize(2097152)).toBe('2.0MB')
    })
  })

  describe('timeAgo', () => {
    it('should return empty for undefined', () => {
      expect(helpers.timeAgo(undefined)).toBe('')
    })

    it("should return 'just now' for recent timestamps", () => {
      expect(helpers.timeAgo(Date.now() - 5000)).toBe('刚刚')
    })

    it('should return minutes ago', () => {
      expect(helpers.timeAgo(Date.now() - 300000)).toBe('5分钟前')
    })

    it('should return hours ago', () => {
      expect(helpers.timeAgo(Date.now() - 7200000)).toBe('2小时前')
    })

    it('should return days ago', () => {
      expect(helpers.timeAgo(Date.now() - 172800000)).toBe('2天前')
    })
  })

  describe('AI_PROVIDER_MODELS', () => {
    it('should have all 4 providers', () => {
      const providers = Object.keys(helpers.AI_PROVIDER_MODELS)
      expect(providers).toContain('mock')
      expect(providers).toContain('openai')
      expect(providers).toContain('claude')
      expect(providers).toContain('deepseek')
      expect(providers.length).toBe(4)
    })

    it('each provider should have models', () => {
      Object.values(helpers.AI_PROVIDER_MODELS).forEach((provider) => {
        expect(provider.label).toBeTruthy()
        expect(provider.models.length).toBeGreaterThan(0)
        provider.models.forEach((m) => {
          expect(m.id).toBeTruthy()
          expect(m.name).toBeTruthy()
        })
      })
    })

    it('OpenAI should have GPT models', () => {
      const openai = helpers.AI_PROVIDER_MODELS.openai
      expect(openai.models.some((m) => m.id.includes('gpt'))).toBe(true)
      expect(openai.defaultBaseUrl).toContain('openai.com')
    })
  })

  describe('Mock Data Integrity', () => {
    it('MOCK_FILE_TREE should have root directory', () => {
      expect(helpers.MOCK_FILE_TREE.length).toBe(1)
      expect(helpers.MOCK_FILE_TREE[0].type).toBe('directory')
      expect(helpers.MOCK_FILE_TREE[0].name).toBe('yyc3-cloudpivot')
    })

    it('MOCK_GIT_STATUS should have branch info', () => {
      expect(helpers.MOCK_GIT_STATUS.branch).toBeTruthy()
      expect(typeof helpers.MOCK_GIT_STATUS.modified).toBe('number')
      expect(typeof helpers.MOCK_GIT_STATUS.staged).toBe('number')
    })

    it('MOCK_GIT_LOG should have commits', () => {
      expect(helpers.MOCK_GIT_LOG.length).toBeGreaterThan(0)
      helpers.MOCK_GIT_LOG.forEach((commit) => {
        expect(commit.hash).toBeTruthy()
        expect(commit.message).toBeTruthy()
        expect(commit.author).toBeTruthy()
      })
    })

    it('MOCK_SEARCH_RESULTS should have all categories', () => {
      expect(helpers.MOCK_SEARCH_RESULTS.files).toBeTruthy()
      expect(helpers.MOCK_SEARCH_RESULTS.content).toBeTruthy()
      expect(helpers.MOCK_SEARCH_RESULTS.symbols).toBeTruthy()
      expect(helpers.MOCK_SEARCH_RESULTS.commands).toBeTruthy()
    })

    it('AI_RESPONSES should be non-empty', () => {
      expect(helpers.AI_RESPONSES.length).toBeGreaterThan(0)
    })

    it('AI_SUGGESTIONS_POOL should have typed suggestions', () => {
      expect(helpers.AI_SUGGESTIONS_POOL.length).toBeGreaterThan(0)
      helpers.AI_SUGGESTIONS_POOL.forEach((s) => {
        expect(['code', 'explanation', 'refactor', 'fix', 'optimization']).toContain(s.type)
        expect(s.confidence).toBeGreaterThanOrEqual(0)
        expect(s.confidence).toBeLessThanOrEqual(1)
      })
    })
  })
})

describe('Panel Store (extracted)', () => {
  let usePanelStore: typeof import('../../../src/app/components/panels/panel-store').usePanelStore

  beforeEach(async () => {
    const mod = await import('../../../src/app/components/panels/panel-store')
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
      aiProviderConfig: {
        provider: 'mock',
        apiKey: '',
        model: 'mock-v1',
        temperature: 0.7,
        maxTokens: 2048,
      },
      fileTree: [],
    })
  })

  it('should default to file-explorer panel', () => {
    expect(usePanelStore.getState().activePanel).toBe('file-explorer')
  })

  it('should switch panels', () => {
    usePanelStore.getState().setActivePanel('ai-assistant')
    expect(usePanelStore.getState().activePanel).toBe('ai-assistant')

    usePanelStore.getState().setActivePanel('git-integration')
    expect(usePanelStore.getState().activePanel).toBe('git-integration')
  })

  it('should toggle panel collapsed state', () => {
    expect(usePanelStore.getState().panelCollapsed).toBe(false)
    usePanelStore.getState().toggleCollapsed()
    expect(usePanelStore.getState().panelCollapsed).toBe(true)
  })

  it('should enforce panel width constraints', () => {
    usePanelStore.getState().setPanelWidth(150)
    expect(usePanelStore.getState().panelWidth).toBe(200) // min

    usePanelStore.getState().setPanelWidth(700)
    expect(usePanelStore.getState().panelWidth).toBe(600) // max
  })

  it('should manage folder expansion', () => {
    usePanelStore.getState().toggleFolder('src')
    expect(usePanelStore.getState().expandedFolders).toContain('src')

    usePanelStore.getState().toggleFolder('src/app')
    expect(usePanelStore.getState().expandedFolders).toEqual(['src', 'src/app'])

    usePanelStore.getState().toggleFolder('src')
    expect(usePanelStore.getState().expandedFolders).toEqual(['src/app'])
  })

  it('should manage AI provider config', () => {
    usePanelStore.getState().setAIProviderConfig({
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: 'sk-test',
    })

    const config = usePanelStore.getState().aiProviderConfig
    expect(config.provider).toBe('openai')
    expect(config.model).toBe('gpt-4o')
    expect(config.apiKey).toBe('sk-test')
    expect(config.temperature).toBe(0.7) // unchanged
    expect(config.maxTokens).toBe(2048) // unchanged
  })

  it('should manage file tree with nested CRUD', () => {
    // Set up tree
    usePanelStore
      .getState()
      .setFileTree([
        {
          id: 'root',
          type: 'directory',
          name: 'root',
          path: '/',
          children: [{ id: 'src', type: 'directory', name: 'src', path: '/src', children: [] }],
        },
      ])

    // Add file to /src
    usePanelStore.getState().addFileNode('/src', {
      id: '/src/test.ts',
      type: 'file',
      name: 'test.ts',
      path: '/src/test.ts',
    })

    const tree = usePanelStore.getState().fileTree
    const srcDir = tree[0].children?.[0]
    expect(srcDir?.children?.length).toBe(1)
    expect(srcDir?.children?.[0].name).toBe('test.ts')

    // Rename
    usePanelStore.getState().renameFileNode('/src/test.ts', 'renamed.ts')
    const renamed = usePanelStore.getState().fileTree[0].children?.[0].children?.[0]
    expect(renamed?.name).toBe('renamed.ts')

    // Delete
    usePanelStore.getState().deleteFileNode('/src/renamed.ts')
    expect(usePanelStore.getState().fileTree[0].children?.[0].children?.length).toBe(0)
  })

  it('should deduplicate search history', () => {
    usePanelStore.getState().addSearchHistory('react')
    usePanelStore.getState().addSearchHistory('zustand')
    usePanelStore.getState().addSearchHistory('react') // duplicate

    const history = usePanelStore.getState().searchHistory
    expect(history.length).toBe(2)
    expect(history[0]).toBe('react') // most recent
    expect(history[1]).toBe('zustand')
  })

  it('should deduplicate recent files by path', () => {
    const file = {
      id: 'f1',
      name: 'test.ts',
      path: '/test.ts',
      type: 'recent' as const,
      lastAccessed: Date.now(),
    }
    usePanelStore.getState().addRecentFile(file)
    usePanelStore.getState().addRecentFile({ ...file, lastAccessed: Date.now() + 1000 })

    expect(usePanelStore.getState().recentFiles.length).toBe(1)
  })
})
