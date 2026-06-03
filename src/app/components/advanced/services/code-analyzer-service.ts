/**
 * @file code-analyzer-service.ts
 * @description AF-01: AI Code Analyzer Engine — Simulated static analysis & AI-powered fix generation.
 *   Provides incremental code analysis, security scanning, performance profiling, and auto-fix.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,ai,code-analysis
 */

import type {
  AnalysisCategory,
  AnalysisResult,
  AnalysisScope,
  AnalysisSummary,
  CodeFix,
} from '../advanced-types'

// ==========================================
// Analysis Rules Database
// ==========================================

interface AnalysisRule {
  id: string
  category: AnalysisCategory
  severity: 'error' | 'warning' | 'info'
  pattern: RegExp
  message: string
  suggestion: string
  fixExample: string
}

const analysisRules: AnalysisRule[] = [
  // Security rules
  {
    id: 'SEC-001',
    category: 'security',
    severity: 'error',
    pattern: /(api[Kk]ey|secret|password|token)\s*[:=]\s*['"][^'"]+['"]/g,
    message: 'Potential hardcoded credential detected',
    suggestion: 'Move secrets to environment variables or a secure vault service',
    fixExample: 'Use process.env.VARIABLE_NAME or a secrets manager',
  },
  {
    id: 'SEC-002',
    category: 'security',
    severity: 'warning',
    pattern: /innerHTML\s*=/g,
    message: 'Using innerHTML can lead to XSS vulnerabilities',
    suggestion: 'Use textContent or a safe DOM API like insertAdjacentHTML with sanitization',
    fixExample: 'element.textContent = safeValue',
  },
  {
    id: 'SEC-003',
    category: 'security',
    severity: 'warning',
    pattern: /eval\s*\(/g,
    message: 'eval() execution can lead to code injection attacks',
    suggestion: 'Avoid eval() — use JSON.parse for JSON, or Function constructor with caution',
    fixExample: 'JSON.parse(str)',
  },

  // Performance rules
  {
    id: 'PERF-001',
    category: 'performance',
    severity: 'warning',
    pattern: /\.map\(.*\)\.filter\(/g,
    message: 'Chained map().filter() iterates twice over the array',
    suggestion: 'Use a single reduce() or flatMap() to iterate once',
    fixExample: 'arr.reduce((acc, x) => { ... }, [])',
  },
  {
    id: 'PERF-002',
    category: 'performance',
    severity: 'info',
    pattern: /useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]*\}[^)]*\)/g,
    message: 'useEffect without dependency array will run on every render',
    suggestion: 'Add an empty dependency array or specify exact dependencies',
    fixExample: 'useEffect(() => { ... }, [])',
  },
  {
    id: 'PERF-003',
    category: 'performance',
    severity: 'warning',
    pattern: /for\s*\(.*\)\s*\{[^}]*\}\s*for\s*\(/g,
    message: 'Nested loops can cause O(n²) performance issues',
    suggestion: 'Consider using a Map or Set for lookups to reduce time complexity',
    fixExample: 'Use const map = new Map(); map.get(key)',
  },

  // Code smell rules
  {
    id: 'SMELL-001',
    category: 'codeSmell',
    severity: 'warning',
    pattern: /function\s+\w+\s*\([^)]*\)\s*\{[^}]{200,}\}/g,
    message: 'Function is too long — consider breaking it down',
    suggestion: 'Split into smaller, single-responsibility functions',
    fixExample: 'Extract logical blocks into separate named functions',
  },
  {
    id: 'SMELL-002',
    category: 'codeSmell',
    severity: 'info',
    pattern: /console\.log/g,
    message: 'Console log left in production code',
    suggestion: 'Remove or replace with a proper logging framework',
    fixExample: 'Use a logger service with log levels',
  },
  {
    id: 'SMELL-003',
    category: 'codeSmell',
    severity: 'info',
    pattern: /\/\/\s*TODO/g,
    message: 'TODO comment found — incomplete implementation',
    suggestion: 'Address the TODO or create a tracking task',
    fixExample: 'Implement the feature or file an issue',
  },

  // Type safety rules
  {
    id: 'TYPE-001',
    category: 'typeSafety',
    severity: 'error',
    pattern: /:\s*any/g,
    message: 'Using `any` type defeats TypeScript type safety',
    suggestion: 'Replace with a specific type or use `unknown` with proper type guards',
    fixExample: 'Replace `: any` with `: string | number`',
  },
  {
    id: 'TYPE-002',
    category: 'typeSafety',
    severity: 'warning',
    pattern: /as\s+any/g,
    message: 'Type assertion `as any` bypasses type checking',
    suggestion: 'Use proper type narrowing or type guards instead',
    fixExample: 'Use `if (typeof x === "string")` for narrowing',
  },
  {
    id: 'TYPE-003',
    category: 'typeSafety',
    severity: 'info',
    pattern: /@ts-(ignore|expect-error)/g,
    message: 'TypeScript ignore comment suppresses type errors',
    suggestion: 'Fix the underlying type issue instead of ignoring it',
    fixExample: 'Define proper interfaces and types',
  },

  // Style rules
  {
    id: 'STYLE-001',
    category: 'style',
    severity: 'info',
    pattern: /const\s+\w+\s*=\s*\(/g,
    message: 'Consider using `function` keyword for top-level functions for better stack traces',
    suggestion: 'Use `function` declaration for top-level functions',
    fixExample: 'function myFunction() { ... }',
  },
  {
    id: 'STYLE-002',
    category: 'style',
    severity: 'info',
    pattern: /{2,}/g,
    message: 'Multiple consecutive blank lines reduce readability',
    suggestion: 'Keep at most one blank line between code blocks',
    fixExample: 'Remove extra blank lines',
  },
]

// ==========================================
// ==========================================
// Analysis Rules & Scoring
// ==========================================

export class CodeAnalyzerEngine {
  private rules: AnalysisRule[]

  constructor(customRules?: AnalysisRule[]) {
    this.rules = customRules ?? analysisRules
  }

  /**
   * Analyze a code snippet against all rules.
   * Returns matched results with AI confidence scoring.
   */
  analyze(code: string, fileName: string, _scope: AnalysisScope): AnalysisResult[] {
    const results: AnalysisResult[] = []
    const lines = code.split('\n')

    for (const rule of this.rules) {
      let match: RegExpExecArray | null
      const regex = new RegExp(
        rule.pattern.source,
        rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g',
      )

      while ((match = regex.exec(code)) !== null) {
        const matchIndex = match.index
        const lineNum = this.getLineNumber(lines, matchIndex)
        const colNum = matchIndex - lines.slice(0, lineNum - 1).join('\n').length - 1

        // AI confidence: simulate based on rule category and severity
        const aiConfidence =
          rule.severity === 'error'
            ? 0.92 + Math.random() * 0.08
            : rule.severity === 'warning'
              ? 0.78 + Math.random() * 0.15
              : 0.6 + Math.random() * 0.25

        results.push({
          id: `${fileName}-${rule.id}-${lineNum}-${Date.now()}`,
          file: fileName,
          line: lineNum,
          column: Math.max(0, colNum),
          severity: rule.severity,
          category: rule.category,
          ruleId: rule.id,
          message: rule.message,
          suggestion: rule.suggestion,
          codeSnippet: lines[lineNum - 1]?.trim().slice(0, 120) ?? '',
          fix: {
            id: `fix-${rule.id}-${lineNum}-${Date.now()}`,
            patch: `--- a/${fileName}\n+++ b/${fileName}\n@@ -${lineNum} +${lineNum} @@\n-${lines[lineNum - 1]}\n+// ${rule.suggestion}\n`,
            description: rule.fixExample,
            isSafe: rule.severity === 'info',
            estimatedImpact:
              rule.severity === 'error' ? 'high' : rule.severity === 'warning' ? 'medium' : 'low',
            applicable: true,
          },
          aiConfidence: Math.round(aiConfidence * 100) / 100,
        })
      }
    }

    return results
  }

  /**
   * Generate a summary of analysis results.
   */
  generateSummary(
    results: AnalysisResult[],
    analyzedFiles: number,
    duration: number,
    scope: AnalysisScope,
  ): AnalysisSummary {
    const bySeverity = { error: 0, warning: 0, info: 0 }
    const byCategory = { security: 0, performance: 0, codeSmell: 0, typeSafety: 0, style: 0 }
    let fixableCount = 0
    let safeFixCount = 0

    for (const r of results) {
      bySeverity[r.severity]++
      byCategory[r.category]++
      if (r.fix?.applicable) {
        fixableCount++
        if (r.fix?.isSafe) safeFixCount++
      }
    }

    // Quality score: 100 - weighted deductions
    const totalIssues = results.length
    const score = Math.max(
      0,
      Math.round(100 - bySeverity.error * 5 - bySeverity.warning * 2 - bySeverity.info * 0.5),
    )

    return {
      totalIssues,
      bySeverity,
      byCategory,
      fixableCount,
      safeFixCount,
      score,
      analyzedFiles,
      duration,
      timestamp: Date.now(),
      scope,
    }
  }

  /**
   * Apply a fix and return the patched code.
   */
  applyFix(code: string, fix: CodeFix): string {
    // Simulated patch application
    const lines = fix.patch.split('\n')
    const hunks = lines.filter((l) => l.startsWith('-') && !l.startsWith('---'))
    const additions = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++'))

    let result = code
    for (let i = 0; i < Math.min(hunks.length, additions.length); i++) {
      const oldLine = hunks[i].slice(1)
      const newLine = additions[i].slice(1)
      result = result.replace(oldLine, newLine)
    }
    return result
  }

  private getLineNumber(lines: string[], charIndex: number): number {
    let count = 0
    for (let i = 0; i < lines.length; i++) {
      count += lines[i].length + 1
      if (count > charIndex) return i + 1
    }
    return lines.length
  }
}

// ==========================================
// Singleton instance
// ==========================================

export const codeAnalyzer = new CodeAnalyzerEngine()

// ==========================================
// Simulation / Demo Helpers
// ==========================================

export function generateDemoAnalysis(): { results: AnalysisResult[]; summary: AnalysisSummary } {
  const demoCode = `
const apiKey = 'sk-1234567890';
function fetchData() {
  const results = data.map(x => x.value).filter(x => x > 0);
  console.log('fetching data...');
  // TODO: add error handling
  element.innerHTML = response;
  return results as any;
}
  `.trim()

  const results = codeAnalyzer.analyze(demoCode, 'demo-component.ts', 'file')
  const summary = codeAnalyzer.generateSummary(results, 1, 342, 'file')

  return { results, summary }
}

export { analysisRules }
export type { AnalysisRule }
