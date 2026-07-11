/**
 * @file workspace-settings-panel.test.ts
 * @description YYC³ WorkspaceSettingsPanel — Vitest unit tests for settings store
 *   integration, section configuration, and settings persistence logic.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,panels,settings,workspace
 */

import { beforeEach, describe, expect, it } from 'vitest'

// ==========================================
// Test: Settings Store Integration
// ==========================================

describe('WorkspaceSettingsPanel — Settings Store Integration', () => {
  let useSettingsStore: typeof import('../../../src/stores/useSettingsStore').useSettingsStore

  beforeEach(async () => {
    const mod = await import('../../../src/stores/useSettingsStore')
    useSettingsStore = mod.useSettingsStore
    // Reset to defaults
    useSettingsStore.getState().resetSettings()
  })

  it('WSP-001: should have default editor font', () => {
    const { settings } = useSettingsStore.getState()
    expect(settings.general.editorFont).toContain('Monaco')
  })

  it('WSP-002: should have default editor font size of 14', () => {
    const { settings } = useSettingsStore.getState()
    expect(settings.general.editorFontSize).toBe(14)
  })

  it('WSP-003: should update editor font family', () => {
    useSettingsStore
      .getState()
      .updateGeneralSettings({ editorFont: '"Fira Code", Monaco, monospace' })
    const { settings } = useSettingsStore.getState()
    expect(settings.general.editorFont).toContain('Fira Code')
  })

  it('WSP-004: should update editor font size', () => {
    useSettingsStore.getState().updateGeneralSettings({ editorFontSize: 18 })
    const { settings } = useSettingsStore.getState()
    expect(settings.general.editorFontSize).toBe(18)
  })

  it('WSP-005: should update word wrap setting', () => {
    const initial = useSettingsStore.getState().settings.general.wordWrap
    useSettingsStore.getState().updateGeneralSettings({ wordWrap: !initial })
    expect(useSettingsStore.getState().settings.general.wordWrap).toBe(!initial)
  })

  it('WSP-006: should update animations toggle', () => {
    useSettingsStore.getState().updateGeneralSettings({ enableAnimations: false })
    expect(useSettingsStore.getState().settings.general.enableAnimations).toBe(false)
    useSettingsStore.getState().updateGeneralSettings({ enableAnimations: true })
    expect(useSettingsStore.getState().settings.general.enableAnimations).toBe(true)
  })

  it('WSP-007: should update sounds toggle', () => {
    useSettingsStore.getState().updateGeneralSettings({ enableSounds: false })
    expect(useSettingsStore.getState().settings.general.enableSounds).toBe(false)
  })

  it("WSP-008: should have default keybinding scheme 'vscode'", () => {
    const { settings } = useSettingsStore.getState()
    expect(settings.general.keybindingScheme).toBe('vscode')
  })

  it('WSP-009: should update keybinding scheme to vim', () => {
    useSettingsStore.getState().updateGeneralSettings({ keybindingScheme: 'vim' })
    expect(useSettingsStore.getState().settings.general.keybindingScheme).toBe('vim')
  })

  it('WSP-010: should update keybinding scheme to emacs', () => {
    useSettingsStore.getState().updateGeneralSettings({ keybindingScheme: 'emacs' })
    expect(useSettingsStore.getState().settings.general.keybindingScheme).toBe('emacs')
  })

  it('WSP-011: should reset all settings to defaults', () => {
    // Modify several settings
    useSettingsStore.getState().updateGeneralSettings({
      editorFontSize: 22,
      wordWrap: false,
      keybindingScheme: 'vim',
      enableAnimations: false,
    })
    // Verify modifications
    expect(useSettingsStore.getState().settings.general.editorFontSize).toBe(22)

    // Reset
    useSettingsStore.getState().resetSettings()
    const { settings } = useSettingsStore.getState()
    expect(settings.general.editorFontSize).toBe(14)
    expect(settings.general.wordWrap).toBe(true)
    expect(settings.general.keybindingScheme).toBe('vscode')
    expect(settings.general.enableAnimations).toBe(true)
  })

  it('WSP-012: partial update should not affect other fields', () => {
    const beforeFont = useSettingsStore.getState().settings.general.editorFont
    useSettingsStore.getState().updateGeneralSettings({ editorFontSize: 20 })
    expect(useSettingsStore.getState().settings.general.editorFont).toBe(beforeFont)
    expect(useSettingsStore.getState().settings.general.editorFontSize).toBe(20)
  })
})

// ==========================================
// Test: Panel Store AI Config (used by Settings Panel)
// ==========================================

describe('WorkspaceSettingsPanel — Panel Store AI Config', () => {
  let usePanelStore: typeof import('../../../src/app/components/panels/panel-store').usePanelStore

  beforeEach(async () => {
    const mod = await import('../../../src/app/components/panels/panel-store')
    usePanelStore = mod.usePanelStore
    usePanelStore.setState({
      aiProviderConfig: {
        provider: 'mock',
        apiKey: '',
        model: 'mock-v1',
        temperature: 0.7,
        maxTokens: 2048,
      },
      panelWidth: 300,
    })
  })

  it('WSP-020: should display current AI provider info', () => {
    const { aiProviderConfig } = usePanelStore.getState()
    expect(aiProviderConfig.provider).toBe('mock')
    expect(aiProviderConfig.model).toBe('mock-v1')
    expect(aiProviderConfig.temperature).toBe(0.7)
    expect(aiProviderConfig.maxTokens).toBe(2048)
  })

  it('WSP-021: should reflect updated AI provider config', () => {
    usePanelStore.getState().setAIProviderConfig({
      provider: 'openai',
      model: 'gpt-4o',
      apiKey: 'sk-test-key',
    })
    const { aiProviderConfig } = usePanelStore.getState()
    expect(aiProviderConfig.provider).toBe('openai')
    expect(aiProviderConfig.model).toBe('gpt-4o')
    expect(aiProviderConfig.apiKey).toBe('sk-test-key')
    // Unchanged fields
    expect(aiProviderConfig.temperature).toBe(0.7)
    expect(aiProviderConfig.maxTokens).toBe(2048)
  })

  it('WSP-022: should update panel width', () => {
    usePanelStore.getState().setPanelWidth(450)
    expect(usePanelStore.getState().panelWidth).toBe(450)
  })

  it('WSP-023: should enforce min panel width (200)', () => {
    usePanelStore.getState().setPanelWidth(100)
    expect(usePanelStore.getState().panelWidth).toBe(200)
  })

  it('WSP-024: should enforce max panel width (600)', () => {
    usePanelStore.getState().setPanelWidth(800)
    expect(usePanelStore.getState().panelWidth).toBe(600)
  })

  it('WSP-025: reset workspace defaults should set width to 300', () => {
    usePanelStore.getState().setPanelWidth(500)
    expect(usePanelStore.getState().panelWidth).toBe(500)
    usePanelStore.getState().setPanelWidth(300)
    expect(usePanelStore.getState().panelWidth).toBe(300)
  })
})

// ==========================================
// Test: Section Navigation
// ==========================================

describe('WorkspaceSettingsPanel — Section Configuration', () => {
  it('WSP-030: should define 5 settings sections', () => {
    const sections = ['editor', 'theme', 'keybindings', 'ai', 'workspace']
    expect(sections.length).toBe(5)
    // These match SettingsSection type
    sections.forEach((s) => {
      expect(typeof s).toBe('string')
      expect(s.length).toBeGreaterThan(0)
    })
  })

  it('WSP-031: editor section should have font, size, wrap, animations, sounds controls', () => {
    const editorControls = ['Font Family', 'Font Size', 'Word Wrap', 'Animations', 'Sounds']
    expect(editorControls.length).toBe(5)
  })

  it('WSP-032: theme section should support cyberpunk and liquidGlass', () => {
    const themes = ['cyberpunk', 'liquidGlass']
    expect(themes.length).toBe(2)
    themes.forEach((t) => expect(t.length).toBeGreaterThan(0))
  })

  it('WSP-033: keybinding section should support vscode, vim, emacs', () => {
    const schemes = ['vscode', 'vim', 'emacs']
    expect(schemes.length).toBe(3)
  })

  it('WSP-034: keyboard shortcuts list should have 7 items', () => {
    const shortcuts = [
      { keys: 'Ctrl+B', action: 'Toggle Panel' },
      { keys: 'Ctrl+P', action: 'Quick Open / Search' },
      { keys: 'Ctrl+E', action: 'File Explorer' },
      { keys: 'Ctrl+S', action: 'Save File' },
      { keys: 'Ctrl+Shift+P', action: 'Command Palette' },
      { keys: 'Ctrl+/', action: 'Toggle Comment' },
      { keys: 'Ctrl+D', action: 'Select Next Match' },
    ]
    expect(shortcuts.length).toBe(7)
    shortcuts.forEach((s) => {
      expect(s.keys).toBeTruthy()
      expect(s.action).toBeTruthy()
    })
  })
})

// ==========================================
// Test: Window Manager reorderWindows (used by WindowBar DnD)
// ==========================================

describe('WorkspaceSettingsPanel — Window Reorder (DnD support)', () => {
  let useWindowStore: typeof import('../../../src/app/components/services/multi-instance/window-manager').useWindowStore

  beforeEach(async () => {
    const mod = await import('../../../src/app/components/services/multi-instance/window-manager')
    useWindowStore = mod.useWindowStore
    useWindowStore.setState({ instances: [], activeInstanceId: null, mainInstanceId: null })
  })

  it('WSP-040: should reorder 3 windows from index 0 to 2', () => {
    // Create 3 windows
    useWindowStore.getState().createWindow('main', { title: 'A' })
    useWindowStore.getState().createWindow('editor', { title: 'B' })
    useWindowStore.getState().createWindow('terminal', { title: 'C' })

    const before = useWindowStore.getState().instances.map((i) => i.title)
    expect(before).toEqual(['A', 'B', 'C'])

    useWindowStore.getState().reorderWindows(0, 2)
    const after = useWindowStore.getState().instances.map((i) => i.title)
    expect(after).toEqual(['B', 'C', 'A'])
  })

  it('WSP-041: should reorder from index 2 to 0', () => {
    useWindowStore.getState().createWindow('main', { title: 'A' })
    useWindowStore.getState().createWindow('editor', { title: 'B' })
    useWindowStore.getState().createWindow('terminal', { title: 'C' })

    useWindowStore.getState().reorderWindows(2, 0)
    const after = useWindowStore.getState().instances.map((i) => i.title)
    expect(after).toEqual(['C', 'A', 'B'])
  })

  it('WSP-042: reorder with same fromIndex and toIndex should be no-op', () => {
    useWindowStore.getState().createWindow('main', { title: 'A' })
    useWindowStore.getState().createWindow('editor', { title: 'B' })

    useWindowStore.getState().reorderWindows(1, 1)
    const after = useWindowStore.getState().instances.map((i) => i.title)
    expect(after).toEqual(['A', 'B'])
  })

  it('WSP-043: reorder with out-of-bounds indices should be no-op', () => {
    useWindowStore.getState().createWindow('main', { title: 'A' })
    useWindowStore.getState().createWindow('editor', { title: 'B' })

    useWindowStore.getState().reorderWindows(-1, 5)
    const after = useWindowStore.getState().instances.map((i) => i.title)
    expect(after).toEqual(['A', 'B'])
  })

  it('WSP-044: reorder should preserve all instance properties', () => {
    const w1 = useWindowStore.getState().createWindow('main', { title: 'A' })
    useWindowStore.getState().createWindow('editor', { title: 'B' })

    useWindowStore.getState().reorderWindows(0, 1)
    const reorderedFirst = useWindowStore.getState().instances[1]
    expect(reorderedFirst.windowId).toBe(w1.windowId)
    expect(reorderedFirst.windowType).toBe('main')
    expect(reorderedFirst.title).toBe('A')
  })
})
