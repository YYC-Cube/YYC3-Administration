/**
 * @file editor-quick-actions.test.ts
 * @description YYC³ EditorQuickActions — Vitest unit tests for Quick Actions config,
 *   AI prompt building, mock fallback responses, and action execution logic.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P1,testing,panels,quick-actions,ai
 */

import { beforeEach, describe, expect, it } from 'vitest'

// ==========================================
// Test: QUICK_ACTIONS Config
// ==========================================

describe('EditorQuickActions — QUICK_ACTIONS Config', () => {
  let QUICK_ACTIONS: typeof import('../../../src/app/components/panels/editor-quick-actions').QUICK_ACTIONS

  beforeEach(async () => {
    const mod = await import('../../../src/app/components/panels/editor-quick-actions')
    QUICK_ACTIONS = mod.QUICK_ACTIONS
  })

  it('EQA-001: should define exactly 8 quick actions', () => {
    expect(QUICK_ACTIONS.length).toBe(8)
  })

  it('EQA-002: each action should have required fields', () => {
    QUICK_ACTIONS.forEach((action) => {
      expect(action.id).toBeTruthy()
      expect(action.label).toBeTruthy()
      expect(action.icon).toBeDefined()
      expect(action.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(action.description).toBeTruthy()
      expect(typeof action.isAI).toBe('boolean')
    })
  })

  it('EQA-003: copy and format should NOT be AI actions', () => {
    const copy = QUICK_ACTIONS.find((a) => a.id === 'copy')
    const format = QUICK_ACTIONS.find((a) => a.id === 'format')
    expect(copy?.isAI).toBe(false)
    expect(format?.isAI).toBe(false)
  })

  it('EQA-004: explain, refactor, test, docs, debug, optimize should be AI actions', () => {
    const aiIds = ['explain', 'refactor', 'test', 'docs', 'debug', 'optimize']
    aiIds.forEach((id) => {
      const action = QUICK_ACTIONS.find((a) => a.id === id)
      expect(action?.isAI).toBe(true)
    })
  })

  it('EQA-005: all action IDs should be unique', () => {
    const ids = QUICK_ACTIONS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('EQA-006: all action labels should be unique', () => {
    const labels = QUICK_ACTIONS.map((a) => a.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})

// ==========================================
// Test: buildActionPrompt
// ==========================================

describe('EditorQuickActions — buildActionPrompt', () => {
  let buildActionPrompt: typeof import('../../../src/app/components/panels/editor-quick-actions').buildActionPrompt

  beforeEach(async () => {
    const mod = await import('../../../src/app/components/panels/editor-quick-actions')
    buildActionPrompt = mod.buildActionPrompt
  })

  it("EQA-010: should build prompt for 'explain' action", () => {
    const messages = buildActionPrompt('explain', 'App.tsx', 'const x = 1;')
    expect(messages.length).toBe(1)
    expect(messages[0].role).toBe('user')
    expect(messages[0].content).toContain('App.tsx')
    expect(messages[0].content).toContain('const x = 1;')
    expect(messages[0].content).toContain('分析')
  })

  it("EQA-011: should build prompt for 'refactor' action", () => {
    const messages = buildActionPrompt('refactor', 'store.ts', 'function foo() {}')
    expect(messages.length).toBe(1)
    expect(messages[0].content).toContain('store.ts')
    expect(messages[0].content).toContain('重构')
  })

  it("EQA-012: should build prompt for 'test' action", () => {
    const messages = buildActionPrompt(
      'test',
      'utils.ts',
      'export function add(a, b) { return a + b; }',
    )
    expect(messages.length).toBe(1)
    expect(messages[0].content).toContain('Vitest')
    expect(messages[0].content).toContain('utils.ts')
  })

  it("EQA-013: should build prompt for 'docs' action", () => {
    const messages = buildActionPrompt('docs', 'component.tsx', 'export function MyComp() {}')
    expect(messages.length).toBe(1)
    expect(messages[0].content).toContain('文档')
    expect(messages[0].content).toContain('component.tsx')
  })

  it("EQA-014: should build prompt for 'debug' action", () => {
    const messages = buildActionPrompt('debug', 'handler.ts', 'async function fetch() {}')
    expect(messages.length).toBe(1)
    expect(messages[0].content).toContain('Bug')
    expect(messages[0].content).toContain('handler.ts')
  })

  it("EQA-015: should build prompt for 'optimize' action", () => {
    const messages = buildActionPrompt('optimize', 'render.tsx', 'function RenderList() {}')
    expect(messages.length).toBe(1)
    expect(messages[0].content).toContain('优化')
    expect(messages[0].content).toContain('render.tsx')
  })

  it('EQA-016: should return empty array for unknown action', () => {
    const messages = buildActionPrompt('unknown_action', 'file.ts', 'code')
    expect(messages).toEqual([])
  })

  it("EQA-017: should return empty array for 'copy' action (non-AI)", () => {
    const messages = buildActionPrompt('copy', 'file.ts', 'code')
    expect(messages).toEqual([])
  })

  it('EQA-018: should truncate code content to 8000 chars', () => {
    const longCode = 'x'.repeat(10000)
    const messages = buildActionPrompt('explain', 'big.ts', longCode)
    expect(messages.length).toBe(1)
    // The code snippet inside the prompt should be truncated
    const codeInPrompt = messages[0].content
    // Total prompt includes the template text + code, but code part is max 8000
    expect(codeInPrompt.length).toBeLessThan(longCode.length + 500)
  })

  it('EQA-019: prompt should include file name in context', () => {
    const specialFile = 'my-special-component.tsx'
    const messages = buildActionPrompt('explain', specialFile, 'code')
    expect(messages[0].content).toContain(specialFile)
  })
})

// ==========================================
// Test: getMockResponse
// ==========================================

describe('EditorQuickActions — getMockResponse', () => {
  let getMockResponse: typeof import('../../../src/app/components/panels/editor-quick-actions').getMockResponse

  beforeEach(async () => {
    const mod = await import('../../../src/app/components/panels/editor-quick-actions')
    getMockResponse = mod.getMockResponse
  })

  it("EQA-020: should return '已复制到剪贴板！' for copy", () => {
    expect(getMockResponse('copy', 'file.ts', 100)).toBe('已复制到剪贴板！')
  })

  it('EQA-021: should include file name in format response', () => {
    const result = getMockResponse('format', 'App.tsx', 100)
    expect(result).toContain('App.tsx')
    expect(result).toContain('Prettier')
  })

  it('EQA-022: should include file name in explain response', () => {
    const result = getMockResponse('explain', 'store.ts', 400)
    expect(result).toContain('store.ts')
    expect(result).toContain('分析')
  })

  it('EQA-023: should return fallback for unknown action', () => {
    expect(getMockResponse('nonexistent', 'file.ts', 100)).toBe('操作已完成。')
  })

  it('EQA-024: should include dynamic content length metric for explain', () => {
    const result = getMockResponse('explain', 'test.ts', 800)
    // Content length / 40 = 20 logical blocks
    expect(result).toContain('20 个逻辑块')
  })

  it('EQA-025: all 8 action IDs should produce non-empty responses', () => {
    const ids = ['copy', 'format', 'explain', 'refactor', 'test', 'docs', 'debug', 'optimize']
    ids.forEach((id) => {
      const result = getMockResponse(id, 'file.ts', 500)
      expect(result.length).toBeGreaterThan(0)
    })
  })
})

// ==========================================
// Test: AI Provider Integration Logic
// ==========================================

describe('EditorQuickActions — AI Provider Integration', () => {
  let QUICK_ACTIONS: typeof import('../../../src/app/components/panels/editor-quick-actions').QUICK_ACTIONS

  beforeEach(async () => {
    const mod = await import('../../../src/app/components/panels/editor-quick-actions')
    QUICK_ACTIONS = mod.QUICK_ACTIONS
  })

  it('EQA-030: AI actions count should be 6 (explain, refactor, test, docs, debug, optimize)', () => {
    const aiActions = QUICK_ACTIONS.filter((a) => a.isAI)
    expect(aiActions.length).toBe(6)
  })

  it('EQA-031: non-AI actions count should be 2 (copy, format)', () => {
    const localActions = QUICK_ACTIONS.filter((a) => !a.isAI)
    expect(localActions.length).toBe(2)
  })

  it('EQA-032: each AI action should have a corresponding prompt template', async () => {
    const { buildActionPrompt } =
      await import('../../../src/app/components/panels/editor-quick-actions')
    const aiActions = QUICK_ACTIONS.filter((a) => a.isAI)
    aiActions.forEach((action) => {
      const msgs = buildActionPrompt(action.id, 'test.ts', 'const x = 1;')
      expect(msgs.length).toBeGreaterThan(0)
      expect(msgs[0].role).toBe('user')
      expect(msgs[0].content.length).toBeGreaterThan(50)
    })
  })
})
