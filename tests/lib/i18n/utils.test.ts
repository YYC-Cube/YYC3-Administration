/**
 * @file utils.test.ts
 * @description i18n 工具函数单元测试（format-time / path-guards / json-file）
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { formatRelativeTimestamp, formatTimeAgo } from '../../../src/lib/i18n/utils/format-time'
import {
  deleteJsonFile,
  jsonFileExists,
  loadJsonFile,
  saveJsonFile,
} from '../../../src/lib/i18n/utils/json-file'
import {
  hasNodeErrorCode,
  isNodeError,
  isNotFoundPathError,
  isPathInside,
  isSymlinkOpenError,
  normalizeWindowsPathForComparison,
} from '../../../src/lib/i18n/utils/path-guards'

// ==========================================
// format-time: formatTimeAgo
// ==========================================

describe('formatTimeAgo — 时间差格式化', () => {
  it('null/undefined 返回 fallback', () => {
    expect(formatTimeAgo(null)).toBe('unknown')
    expect(formatTimeAgo(undefined)).toBe('unknown')
    expect(formatTimeAgo(null, { fallback: 'N/A' })).toBe('N/A')
  })

  it('NaN / 负数返回 fallback', () => {
    expect(formatTimeAgo(NaN)).toBe('unknown')
    expect(formatTimeAgo(-1)).toBe('unknown')
    expect(formatTimeAgo(Infinity)).toBe('unknown')
  })

  it('< 30 秒返回 just now（minutes < 1）', () => {
    expect(formatTimeAgo(0)).toBe('just now')
    expect(formatTimeAgo(10 * 1000)).toBe('just now') // 10秒 → minutes=0
    expect(formatTimeAgo(20 * 1000)).toBe('just now') // 20秒 → minutes=0
  })

  it('< 30 秒无后缀返回秒数', () => {
    expect(formatTimeAgo(0, { suffix: false })).toBe('0s')
    expect(formatTimeAgo(10 * 1000, { suffix: false })).toBe('10s')
  })

  it('分钟级别', () => {
    expect(formatTimeAgo(5 * 60 * 1000)).toBe('5m ago')
    expect(formatTimeAgo(5 * 60 * 1000, { suffix: false })).toBe('5m')
  })

  it('小时级别', () => {
    expect(formatTimeAgo(3 * 60 * 60 * 1000)).toBe('3h ago')
    expect(formatTimeAgo(3 * 60 * 60 * 1000, { suffix: false })).toBe('3h')
  })

  it('天级别', () => {
    expect(formatTimeAgo(2 * 24 * 60 * 60 * 1000)).toBe('2d ago')
    expect(formatTimeAgo(2 * 24 * 60 * 60 * 1000, { suffix: false })).toBe('2d')
  })
})

// ==========================================
// format-time: formatRelativeTimestamp
// ==========================================

describe('formatRelativeTimestamp — 时间戳格式化', () => {
  it('null/undefined 返回 fallback', () => {
    expect(formatRelativeTimestamp(null)).toBe('n/a')
    expect(formatRelativeTimestamp(undefined)).toBe('n/a')
  })

  it('NaN 返回 fallback', () => {
    expect(formatRelativeTimestamp(NaN)).toBe('n/a')
  })

  it('过去时间 < 60s 返回 just now', () => {
    const now = Date.now()
    expect(formatRelativeTimestamp(now)).toBe('just now')
  })

  it('过去时间分钟级别', () => {
    const tenMinAgo = Date.now() - 10 * 60 * 1000
    expect(formatRelativeTimestamp(tenMinAgo)).toBe('10m ago')
  })

  it('未来时间返回 in X 格式', () => {
    const inTenMin = Date.now() + 10 * 60 * 1000
    expect(formatRelativeTimestamp(inTenMin)).toBe('in 10m')
  })
})

// ==========================================
// path-guards
// ==========================================

describe('path-guards — 路径安全守卫', () => {
  describe('isNodeError', () => {
    it('识别 NodeJS 错误', () => {
      const err = Object.assign(new Error('test'), { code: 'ENOENT' })
      expect(isNodeError(err)).toBe(true)
    })

    it('非错误对象返回 false', () => {
      expect(isNodeError('string')).toBe(false)
      expect(isNodeError(null)).toBe(false)
      expect(isNodeError({})).toBe(false)
    })
  })

  describe('hasNodeErrorCode', () => {
    it('匹配 code 返回 true', () => {
      const err = Object.assign(new Error('not found'), { code: 'ENOENT' })
      expect(hasNodeErrorCode(err, 'ENOENT')).toBe(true)
    })

    it('不匹配 code 返回 false', () => {
      const err = Object.assign(new Error('denied'), { code: 'EACCES' })
      expect(hasNodeErrorCode(err, 'ENOENT')).toBe(false)
    })
  })

  describe('isNotFoundPathError', () => {
    it('ENOENT 是路径未找到错误', () => {
      const err = Object.assign(new Error('not found'), { code: 'ENOENT' })
      expect(isNotFoundPathError(err)).toBe(true)
    })

    it('ENOTDIR 是路径未找到错误', () => {
      const err = Object.assign(new Error('not a directory'), { code: 'ENOTDIR' })
      expect(isNotFoundPathError(err)).toBe(true)
    })

    it('其他错误不是路径未找到错误', () => {
      const err = Object.assign(new Error('denied'), { code: 'EACCES' })
      expect(isNotFoundPathError(err)).toBe(false)
    })
  })

  describe('isSymlinkOpenError', () => {
    it('ELOOP 是符号链接错误', () => {
      const err = Object.assign(new Error('loop'), { code: 'ELOOP' })
      expect(isSymlinkOpenError(err)).toBe(true)
    })

    it('EINVAL 是符号链接错误', () => {
      const err = Object.assign(new Error('invalid'), { code: 'EINVAL' })
      expect(isSymlinkOpenError(err)).toBe(true)
    })
  })

  describe('isPathInside', () => {
    it('子路径在根路径内返回 true', () => {
      const root = process.cwd()
      const target = path.join(root, 'src', 'app')
      expect(isPathInside(root, target)).toBe(true)
    })

    it('根路径自身返回 true', () => {
      const root = process.cwd()
      expect(isPathInside(root, root)).toBe(true)
    })

    it('外部路径返回 false', () => {
      const root = process.cwd()
      const target = path.resolve(root, '..', 'other-project')
      expect(isPathInside(root, target)).toBe(false)
    })
  })

  describe('normalizeWindowsPathForComparison', () => {
    it('统一分隔符为反斜杠', () => {
      const result = normalizeWindowsPathForComparison('C:/Users/test/file.txt')
      expect(result).toBe('c:\\users\\test\\file.txt')
    })

    it('转为小写', () => {
      const result = normalizeWindowsPathForComparison('C:\\Users\\Test')
      expect(result).toBe('c:\\users\\test')
    })
  })
})

// ==========================================
// json-file
// ==========================================

describe('json-file — JSON 文件操作', () => {
  const tmpDir = path.join(os.tmpdir(), 'yyc3-test-json-' + Date.now())
  const tmpFile = path.join(tmpDir, 'test.json')

  afterEach(() => {
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true })
      }
    } catch {
      // cleanup
    }
  })

  it('saveJsonFile 创建目录并写入文件', () => {
    saveJsonFile(tmpFile, { name: 'test', value: 42 })
    expect(fs.existsSync(tmpFile)).toBe(true)
    const raw = fs.readFileSync(tmpFile, 'utf8')
    expect(JSON.parse(raw)).toEqual({ name: 'test', value: 42 })
  })

  it('loadJsonFile 读取存在的文件', () => {
    saveJsonFile(tmpFile, { key: 'value' })
    const data = loadJsonFile<{ key: string }>(tmpFile)
    expect(data).toEqual({ key: 'value' })
  })

  it('loadJsonFile 不存在的文件返回 undefined', () => {
    expect(loadJsonFile('/nonexistent/path/file.json')).toBeUndefined()
  })

  it('jsonFileExists 检测文件是否存在', () => {
    expect(jsonFileExists(tmpFile)).toBe(false)
    saveJsonFile(tmpFile, { data: 1 })
    expect(jsonFileExists(tmpFile)).toBe(true)
  })

  it('deleteJsonFile 删除文件', () => {
    saveJsonFile(tmpFile, { temp: true })
    expect(deleteJsonFile(tmpFile)).toBe(true)
    expect(jsonFileExists(tmpFile)).toBe(false)
  })

  it('deleteJsonFile 删除不存在的文件返回 false', () => {
    expect(deleteJsonFile('/nonexistent/file.json')).toBe(false)
  })
})
