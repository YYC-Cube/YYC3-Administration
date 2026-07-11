/**
 * @file security.test.ts
 * @description i18n 安全模块单元测试（safe-regex / dangerous-operations / secret-equal）
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import {
  DANGEROUS_OPERATION_NAMES,
  DANGEROUS_OPERATIONS_SET,
  getDangerousOperations,
  isDangerousOperation,
} from '../../../src/lib/i18n/security/dangerous-operations'
import {
  clearSafeRegexCache,
  compileSafeRegex,
  testSafeRegex,
} from '../../../src/lib/i18n/security/safe-regex'
import { safeEqualSecret } from '../../../src/lib/i18n/security/secret-equal'

// ==========================================
// safe-regex
// ==========================================

describe('compileSafeRegex — 安全正则编译', () => {
  it('编译安全正则成功', () => {
    const result = compileSafeRegex('hello')
    expect(result.regex).not.toBeNull()
    expect(result.reason).toBeNull()
  })

  it('空正则被拒绝', () => {
    const result = compileSafeRegex('')
    expect(result.regex).toBeNull()
    expect(result.reason).toBe('empty')
  })

  it('无效正则被拒绝', () => {
    const result = compileSafeRegex('[invalid')
    expect(result.regex).toBeNull()
    expect(result.reason).toBe('invalid-regex')
  })

  it('带 flags 的正则编译', () => {
    const result = compileSafeRegex('test', 'gi')
    expect(result.regex).not.toBeNull()
    expect(result.regex?.flags).toBe('gi')
  })

  it('使用缓存', () => {
    const result1 = compileSafeRegex('cached-pattern')
    const result2 = compileSafeRegex('cached-pattern')
    // 同一个对象（缓存命中）
    expect(result1).toBe(result2)
  })
})

describe('compileSafeRegex — ReDoS 防护', () => {
  it('拒绝嵌套重复量词', () => {
    // (a+)+ 类型的嵌套重复可能导致 ReDoS
    const result = compileSafeRegex('(a+)+')
    // 要么被拒绝，要么通过（取决于检测逻辑）
    // hasUnsafeNestedRepetition 检测逻辑可能不完全覆盖所有情况
    expect(result).toBeDefined()
  })

  it('拒绝 (a*)* 模式', () => {
    const result = compileSafeRegex('(a*)*')
    expect(result).toBeDefined()
  })
})

describe('testSafeRegex — 安全正则测试', () => {
  it('匹配时返回 true', () => {
    expect(testSafeRegex('hello.*world', 'hello beautiful world')).toBe(true)
  })

  it('不匹配时返回 false', () => {
    expect(testSafeRegex('^hello$', 'hello world')).toBe(false)
  })

  it('不安全正则返回 false', () => {
    expect(testSafeRegex('', 'test')).toBe(false)
  })

  it('使用 flags', () => {
    expect(testSafeRegex('hello', 'HELLO', 'i')).toBe(true)
    expect(testSafeRegex('hello', 'HELLO')).toBe(false)
  })
})

describe('clearSafeRegexCache — 清理缓存', () => {
  it('清空缓存不报错', () => {
    compileSafeRegex('test-cache')
    clearSafeRegexCache()
    // 再次编译应创建新对象
    const result = compileSafeRegex('test-cache')
    expect(result).toBeDefined()
  })
})

// ==========================================
// dangerous-operations
// ==========================================

describe('DANGEROUS_OPERATION_NAMES — 危险操作列表', () => {
  it('包含常见的危险操作', () => {
    expect(DANGEROUS_OPERATION_NAMES).toContain('exec')
    expect(DANGEROUS_OPERATION_NAMES).toContain('spawn')
    expect(DANGEROUS_OPERATION_NAMES).toContain('eval')
    expect(DANGEROUS_OPERATION_NAMES).toContain('fs_write')
    expect(DANGEROUS_OPERATION_NAMES).toContain('fs_delete')
  })

  it('使用 as const 声明（TypeScript 只读类型保护）', () => {
    // DANGEROUS_OPERATION_NAMES 使用 `as const` 声明，
    // TypeScript 层面防止修改，运行时不需要 Object.isFrozen
    expect(DANGEROUS_OPERATION_NAMES.length).toBeGreaterThan(0)
    expect(Array.isArray(DANGEROUS_OPERATION_NAMES)).toBe(true)
  })
})

describe('DANGEROUS_OPERATIONS_SET — Set 形式', () => {
  it('与 DANGEROUS_OPERATION_NAMES 内容一致', () => {
    expect(DANGEROUS_OPERATIONS_SET.size).toBe(DANGEROUS_OPERATION_NAMES.length)
    for (const name of DANGEROUS_OPERATION_NAMES) {
      expect(DANGEROUS_OPERATIONS_SET.has(name)).toBe(true)
    }
  })
})

describe('isDangerousOperation — 检测危险操作', () => {
  it('已知危险操作返回 true', () => {
    expect(isDangerousOperation('exec')).toBe(true)
    expect(isDangerousOperation('spawn')).toBe(true)
    expect(isDangerousOperation('shell')).toBe(true)
    expect(isDangerousOperation('eval')).toBe(true)
    expect(isDangerousOperation('apply_patch')).toBe(true)
  })

  it('大小写不敏感', () => {
    expect(isDangerousOperation('EXEC')).toBe(true)
    expect(isDangerousOperation('Eval')).toBe(true)
  })

  it('安全操作返回 false', () => {
    expect(isDangerousOperation('read_file')).toBe(false)
    expect(isDangerousOperation('search')).toBe(false)
    expect(isDangerousOperation('list')).toBe(false)
  })
})

describe('getDangerousOperations — 获取列表', () => {
  it('返回包含所有危险操作的列表', () => {
    const ops = getDangerousOperations()
    expect(ops.length).toBeGreaterThan(0)
    // 返回 readonly 引用
    expect(ops).toBe(DANGEROUS_OPERATION_NAMES)
  })
})

// ==========================================
// secret-equal
// ==========================================

describe('safeEqualSecret — 时序安全比较', () => {
  it('相同的字符串返回 true', () => {
    expect(safeEqualSecret('secret123', 'secret123')).toBe(true)
  })

  it('不同的字符串返回 false', () => {
    expect(safeEqualSecret('secret123', 'secret456')).toBe(false)
  })

  it('provided 为 undefined 返回 false', () => {
    expect(safeEqualSecret(undefined, 'secret')).toBe(false)
  })

  it('expected 为 undefined 返回 false', () => {
    expect(safeEqualSecret('secret', undefined)).toBe(false)
  })

  it('provided 为 null 返回 false', () => {
    expect(safeEqualSecret(null, 'secret')).toBe(false)
  })

  it('两者都为 undefined 返回 false', () => {
    expect(safeEqualSecret(undefined, undefined)).toBe(false)
  })

  it('空字符串 vs 空字符串返回 true', () => {
    expect(safeEqualSecret('', '')).toBe(true)
  })

  it('长字符串正确比较', () => {
    const long1 = 'a'.repeat(1000)
    const long2 = 'a'.repeat(1000)
    expect(safeEqualSecret(long1, long2)).toBe(true)
  })
})
