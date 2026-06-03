/**
 * @file use-code-analyzer.ts
 * @description React hook for AF-01: AI Code Analyzer Engine.
 *   Wraps CodeAnalyzerEngine with store integration and auto-scaffold helpers.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,hooks,code-analysis
 */

import { useCallback } from 'react'

import { useCodeAnalyzerStore } from '../advanced-stores'
import { codeAnalyzer, generateDemoAnalysis } from '../services/code-analyzer-service'

import type { AnalysisScope, CodeFix } from '../advanced-types'

export function useCodeAnalyzer() {
  const {
    results,
    summary,
    isAnalyzing,
    selectedResult,
    appliedFixes,
    setResults,
    setSummary,
    setIsAnalyzing,
    selectResult,
    applyFix,
    dismissResult,
    setScope,
    clearResults,
    addHistory,
    scope,
  } = useCodeAnalyzerStore()

  const runAnalysis = useCallback(
    (code: string, fileName: string, analysisScope: AnalysisScope) => {
      setIsAnalyzing(true)
      setScope(analysisScope)

      const id = setTimeout(
        () => {
          const analysisResults = codeAnalyzer.analyze(code, fileName, analysisScope)
          const analysisSummary = codeAnalyzer.generateSummary(
            analysisResults,
            1,
            Math.random() * 500 + 200,
            analysisScope,
          )
          setResults(analysisResults)
          setSummary(analysisSummary)
          addHistory(analysisSummary)
          setIsAnalyzing(false)
        },
        800 + Math.random() * 400,
      )

      return () => clearTimeout(id)
    },
    [setResults, setSummary, setIsAnalyzing, setScope, addHistory],
  )

  const runDemoAnalysis = useCallback(() => {
    setIsAnalyzing(true)
    setScope('file')

    setTimeout(() => {
      const { results: demoResults, summary: demoSummary } = generateDemoAnalysis()
      setResults(demoResults)
      setSummary(demoSummary)
      addHistory(demoSummary)
      setIsAnalyzing(false)
    }, 1000)
  }, [setResults, setSummary, setIsAnalyzing, addHistory, setScope])

  const handleApplyFix = useCallback(
    (fix: CodeFix) => {
      applyFix(fix.id)
      return fix
    },
    [applyFix],
  )

  const handleDismiss = useCallback(
    (id: string) => {
      dismissResult(id)
    },
    [dismissResult],
  )

  const qualityScore = summary?.score ?? 0
  const qualityColor = qualityScore >= 90 ? '#00ff88' : qualityScore >= 70 ? '#ffaa00' : '#ff4444'
  const qualityLabel =
    qualityScore >= 90 ? 'Excellent' : qualityScore >= 70 ? 'Good' : 'Needs Improvement'

  const getResultsBySeverity = useCallback(
    (severity: string) => {
      return results.filter((r) => r.severity === severity)
    },
    [results],
  )

  const getResultsByCategory = useCallback(
    (category: string) => {
      return results.filter((r) => r.category === category)
    },
    [results],
  )

  return {
    results,
    summary,
    isAnalyzing,
    selectedResult,
    appliedFixes,
    scope,
    runAnalysis,
    runDemoAnalysis,
    handleApplyFix,
    handleDismiss,
    selectResult,
    clearResults,
    qualityScore,
    qualityColor,
    qualityLabel,
    getResultsBySeverity,
    getResultsByCategory,
  }
}
