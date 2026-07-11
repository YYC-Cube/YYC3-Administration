/**
 * @file settings-store.test.ts
 * @description Settings Store — Unit Tests
 *   Covers: CRUD operations for agents, MCP, models, rules, skills.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { useSettingsStore } from '../../src/stores/useSettingsStore'

import type {
  AgentConfig,
  MCPConfig,
  ModelConfig,
  RuleConfig,
  SkillConfig,
} from '../../src/types/settings'

beforeEach(() => {
  useSettingsStore.setState({
    settings: useSettingsStore.getInitialState().settings,
    searchQuery: '',
    loading: false,
    error: null,
  })
  localStorage.clear()
})

describe('useSettingsStore — General Settings', () => {
  it('updates general settings', () => {
    useSettingsStore.getState().updateGeneralSettings({ editorFontSize: 18 })
    expect(useSettingsStore.getState().settings.general.editorFontSize).toBe(18)
  })

  it('updates user profile', () => {
    useSettingsStore.getState().updateUserProfile({ username: 'test-user' })
    expect(useSettingsStore.getState().settings.userProfile.username).toBe('test-user')
  })

  it('merges partial settings', () => {
    useSettingsStore.getState().updateGeneralSettings({ wordWrap: false })
    expect(useSettingsStore.getState().settings.general.wordWrap).toBe(false)
    // Other fields should remain unchanged
    expect(useSettingsStore.getState().settings.general.editorFont).toBeTruthy()
  })
})

describe('useSettingsStore — Agents CRUD', () => {
  const mockAgent: AgentConfig = {
    id: 'agent-1',
    name: 'Test Agent',
    description: 'An agent for testing',
    systemPrompt: 'You are a test agent',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    isBuiltIn: false,
    isCustom: true,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('adds a new agent', () => {
    useSettingsStore.getState().addAgent(mockAgent)
    expect(useSettingsStore.getState().settings.agents).toHaveLength(1)
    expect(useSettingsStore.getState().settings.agents[0].name).toBe('Test Agent')
  })

  it('updates an existing agent', () => {
    useSettingsStore.getState().addAgent(mockAgent)
    useSettingsStore.getState().updateAgent('agent-1', { temperature: 0.9 })
    expect(useSettingsStore.getState().settings.agents[0].temperature).toBe(0.9)
  })

  it('removes an agent', () => {
    useSettingsStore.getState().addAgent(mockAgent)
    useSettingsStore.getState().removeAgent('agent-1')
    expect(useSettingsStore.getState().settings.agents).toHaveLength(0)
  })
})

describe('useSettingsStore — MCP Configs CRUD', () => {
  const mockMCP: MCPConfig = {
    id: 'mcp-1',
    name: 'Test MCP',
    type: 'manual',
    endpoint: 'http://localhost:8080',
    enabled: true,
    projectLevel: false,
    description: 'A test MCP connection',
    createdAt: new Date().toISOString(),
  }

  it('adds a new MCP config', () => {
    useSettingsStore.getState().addMCP(mockMCP)
    expect(useSettingsStore.getState().settings.mcpConfigs).toHaveLength(1)
  })

  it('updates an MCP config', () => {
    useSettingsStore.getState().addMCP(mockMCP)
    useSettingsStore.getState().updateMCP('mcp-1', { enabled: false })
    expect(useSettingsStore.getState().settings.mcpConfigs[0].enabled).toBe(false)
  })

  it('removes an MCP config', () => {
    useSettingsStore.getState().addMCP(mockMCP)
    useSettingsStore.getState().removeMCP('mcp-1')
    expect(useSettingsStore.getState().settings.mcpConfigs).toHaveLength(0)
  })
})

describe('useSettingsStore — Models CRUD', () => {
  const mockModel: ModelConfig = {
    id: 'model-1',
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: 'sk-test',
    baseUrl: 'https://api.openai.com/v1',
    temperature: 0.7,
    maxTokens: 4096,
    enabled: true,
    createdAt: new Date().toISOString(),
  }

  it('adds a new model', () => {
    useSettingsStore.getState().addModel(mockModel)
    expect(useSettingsStore.getState().settings.models).toHaveLength(1)
  })

  it('updates a model', () => {
    useSettingsStore.getState().addModel(mockModel)
    useSettingsStore.getState().updateModel('model-1', { temperature: 0.5 })
    expect(useSettingsStore.getState().settings.models[0].temperature).toBe(0.5)
  })

  it('removes a model', () => {
    useSettingsStore.getState().addModel(mockModel)
    useSettingsStore.getState().removeModel('model-1')
    expect(useSettingsStore.getState().settings.models).toHaveLength(0)
  })
})

describe('useSettingsStore — Rules CRUD', () => {
  const mockRule: RuleConfig = {
    id: 'rule-1',
    name: 'Test Rule',
    description: 'A test rule',
    content: '*.tsx: warning',
    scope: 'project',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('adds a new rule', () => {
    useSettingsStore.getState().addRule(mockRule)
    expect(useSettingsStore.getState().settings.rules).toHaveLength(1)
  })

  it('updates a rule', () => {
    useSettingsStore.getState().addRule(mockRule)
    useSettingsStore.getState().updateRule('rule-1', { content: 'updated rule content' })
    expect(useSettingsStore.getState().settings.rules[0].content).toBe('updated rule content')
  })

  it('removes a rule', () => {
    useSettingsStore.getState().addRule(mockRule)
    useSettingsStore.getState().removeRule('rule-1')
    expect(useSettingsStore.getState().settings.rules).toHaveLength(0)
  })
})

describe('useSettingsStore — Skills CRUD', () => {
  const mockSkill: SkillConfig = {
    id: 'skill-1',
    name: 'Test Skill',
    description: 'A test skill',
    content: 'Analyze code for patterns',
    scope: 'global',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  it('adds a new skill', () => {
    useSettingsStore.getState().addSkill(mockSkill)
    expect(useSettingsStore.getState().settings.skills).toHaveLength(1)
  })

  it('updates a skill', () => {
    useSettingsStore.getState().addSkill(mockSkill)
    useSettingsStore.getState().updateSkill('skill-1', { scope: 'project' })
    expect(useSettingsStore.getState().settings.skills[0].scope).toBe('project')
  })

  it('removes a skill', () => {
    useSettingsStore.getState().addSkill(mockSkill)
    useSettingsStore.getState().removeSkill('skill-1')
    expect(useSettingsStore.getState().settings.skills).toHaveLength(0)
  })
})

describe('useSettingsStore — Import/Export/Reset', () => {
  it('exports config without error', () => {
    const config = useSettingsStore.getState().exportConfig()
    expect(config).toBeTruthy()
    expect(config.general).toBeTruthy()
    expect(config.userProfile).toBeTruthy()
  })

  it('imports config data', () => {
    const newConfig = {
      ...useSettingsStore.getState().settings,
      general: { ...useSettingsStore.getState().settings.general, editorFontSize: 24 },
    }
    useSettingsStore.getState().importConfig(newConfig)
    expect(useSettingsStore.getState().settings.general.editorFontSize).toBe(24)
  })

  it('resets settings to defaults', () => {
    useSettingsStore.getState().updateGeneralSettings({ editorFontSize: 999 })
    useSettingsStore.getState().resetSettings()
    expect(useSettingsStore.getState().settings.general.editorFontSize).toBe(14)
  })
})

describe('useSettingsStore — Search Query', () => {
  it('sets search query', () => {
    useSettingsStore.getState().setSearchQuery('theme')
    expect(useSettingsStore.getState().searchQuery).toBe('theme')
  })
})

describe('useSettingsStore — Context Settings', () => {
  it('updates context settings', () => {
    useSettingsStore.getState().updateContextSettings({ autoIndex: false })
    expect(useSettingsStore.getState().settings.context.autoIndex).toBe(false)
  })

  it('updates conversation settings', () => {
    useSettingsStore.getState().updateConversationSettings({ autoSave: false })
    expect(useSettingsStore.getState().settings.conversation.autoSave).toBe(false)
  })

  it('updates import settings', () => {
    useSettingsStore.getState().updateImportSettings({ includeAgentsMD: true })
    expect(useSettingsStore.getState().settings.importSettings.includeAgentsMD).toBe(true)
  })
})
