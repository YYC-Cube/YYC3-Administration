/**
 * @file advanced-features.test.ts
 * @description Advanced Features Stores — Unit Tests
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  useCodeAnalyzerStore,
  usePipelineStore,
} from '../../src/app/components/advanced/advanced-stores'

beforeEach(() => {
  useCodeAnalyzerStore.setState({
    results: [],
    summary: null,
    isAnalyzing: false,
    selectedResult: null,
    appliedFixes: [],
    history: [],
    scope: 'file',
  })
  usePipelineStore.setState({
    pipelines: [],
    runs: [],
    activeRunId: null,
    isExecuting: false,
  })
})

// ── Code Analyzer Store ──

describe('CodeAnalyzerStore — State Management', () => {
  it('sets analysis results', () => {
    useCodeAnalyzerStore.getState().setResults([
      {
        id: 'r1',
        file: 'test.ts',
        line: 10,
        column: 1,
        severity: 'warning',
        category: 'typeSafety',
        ruleId: 'no-any',
        message: 'Avoid using any',
        suggestion: 'Use unknown instead',
        aiConfidence: 0.9,
      },
    ])
    expect(useCodeAnalyzerStore.getState().results).toHaveLength(1)
    expect(useCodeAnalyzerStore.getState().results[0].id).toBe('r1')
  })

  it('toggles analysis state', () => {
    useCodeAnalyzerStore.getState().setIsAnalyzing(true)
    expect(useCodeAnalyzerStore.getState().isAnalyzing).toBe(true)
  })

  it('selects a result', () => {
    useCodeAnalyzerStore.getState().selectResult('r1')
    expect(useCodeAnalyzerStore.getState().selectedResult).toBe('r1')
  })

  it('applies a fix', () => {
    useCodeAnalyzerStore.getState().applyFix('fix-1')
    expect(useCodeAnalyzerStore.getState().appliedFixes).toContain('fix-1')
  })

  it('dismisses a result', () => {
    useCodeAnalyzerStore.getState().setResults([
      {
        id: 'r1',
        file: 'a.ts',
        line: 1,
        column: 1,
        severity: 'info',
        category: 'style',
        ruleId: 'r1',
        message: 'msg',
        suggestion: 'sug',
        aiConfidence: 0.5,
      },
    ])
    useCodeAnalyzerStore.getState().dismissResult('r1')
    expect(useCodeAnalyzerStore.getState().results).toHaveLength(0)
  })

  it('clears all results', () => {
    useCodeAnalyzerStore.getState().setResults([
      {
        id: 'r1',
        file: 'a.ts',
        line: 1,
        column: 1,
        severity: 'error',
        category: 'security',
        ruleId: 'r1',
        message: 'msg',
        suggestion: 'sug',
        aiConfidence: 0.9,
      },
    ])
    useCodeAnalyzerStore.getState().clearResults()
    expect(useCodeAnalyzerStore.getState().results).toHaveLength(0)
  })

  it('sets analysis scope', () => {
    useCodeAnalyzerStore.getState().setScope('project')
    expect(useCodeAnalyzerStore.getState().scope).toBe('project')
  })
})

// ── Pipeline Store ──

describe('PipelineStore — State Management', () => {
  it('adds a pipeline definition', () => {
    usePipelineStore.getState().addPipeline({
      id: 'p1',
      name: 'Build & Test',
      description: 'Build and run tests',
      stages: [],
      triggers: [],
      env: {},
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    expect(usePipelineStore.getState().pipelines).toHaveLength(1)
    expect(usePipelineStore.getState().pipelines[0].name).toBe('Build & Test')
  })

  it('sets executing state', () => {
    usePipelineStore.getState().setIsExecuting(true)
    expect(usePipelineStore.getState().isExecuting).toBe(true)
  })

  it('adds a pipeline run to history', () => {
    usePipelineStore.getState().addRun({
      id: 'run1',
      pipelineId: 'p1',
      pipelineName: 'Test Pipeline',
      status: 'success',
      stages: [],
      startedAt: Date.now(),
      finishedAt: Date.now(),
      duration: 5000,
      triggeredBy: 'manual',
      triggeredVia: 'ui',
      logs: [],
    })
    expect(usePipelineStore.getState().runs).toHaveLength(1)
  })

  it('toggles pipeline active state', () => {
    usePipelineStore.getState().addPipeline({
      id: 'p2',
      name: 'Test Pipeline',
      description: '',
      stages: [],
      triggers: [],
      env: {},
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    usePipelineStore.getState().togglePipeline('p2')
    expect(usePipelineStore.getState().pipelines[0].isActive).toBe(false)
  })

  it('removes a pipeline', () => {
    usePipelineStore.getState().addPipeline({
      id: 'p3',
      name: 'Remove Me',
      description: '',
      stages: [],
      triggers: [],
      env: {},
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    usePipelineStore.getState().removePipeline('p3')
    expect(usePipelineStore.getState().pipelines).toHaveLength(0)
  })
})
