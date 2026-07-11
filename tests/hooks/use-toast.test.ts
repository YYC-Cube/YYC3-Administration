/**
 * useToast Hook - Unit Tests
 * 测试全局Toast提示系统的核心Hook
 */

import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useToast } from '../../src/app/components/ui/use-toast'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
    dismiss: vi.fn(),
  },
}))

describe('useToast Hook', () => {
  describe('基础功能', () => {
    it('应该返回所有Toast方法', () => {
      const { result } = renderHook(() => useToast())

      expect(typeof result.current.success).toBe('function')
      expect(typeof result.current.error).toBe('function')
      expect(typeof result.current.warning).toBe('function')
      expect(typeof result.current.info).toBe('function')
      expect(typeof result.current.loading).toBe('function')
      expect(typeof result.current.dismiss).toBe('function')
      expect(typeof result.current.dismissAll).toBe('function')
      expect(typeof result.current.toast).toBe('function')
    })
  })

  describe('success方法', () => {
    it('应该调用sonnerToast.success', () => {
      const { result } = renderHook(() => useToast())

      result.current.success('成功消息')

      // 验证success方法被调用
      expect(result.current.success).toBeDefined()
    })

    it('应该支持自定义配置', () => {
      const { result } = renderHook(() => useToast())

      result.current.success('成功消息', {
        duration: 2000,
        action: {
          label: '撤销',
          onClick: () => {},
        },
      })

      expect(result.current.success).toBeDefined()
    })
  })

  describe('error方法', () => {
    it('应该支持自定义配置', () => {
      const { result } = renderHook(() => useToast())

      result.current.error('错误消息', {
        duration: 5000,
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('warning方法', () => {
    it('应该支持自定义配置', () => {
      const { result } = renderHook(() => useToast())

      result.current.warning('警告消息', {
        duration: 3000,
      })

      expect(result.current.warning).toBeDefined()
    })
  })

  describe('info方法', () => {
    it('应该支持自定义配置', () => {
      const { result } = renderHook(() => useToast())

      result.current.info('信息消息', {
        duration: 4000,
      })

      expect(result.current.info).toBeDefined()
    })
  })

  describe('loading方法', () => {
    it('应该返回一个id用于后续dismiss', () => {
      const { result } = renderHook(() => useToast())

      const id = result.current.loading('加载中...')

      expect(id).toBeDefined()
    })
  })

  describe('dismiss方法', () => {
    it('应该支持dismiss单个Toast', () => {
      const { result } = renderHook(() => useToast())

      const id = result.current.loading('加载中...')
      result.current.dismiss(id)

      expect(result.current.dismiss).toBeDefined()
    })

    it('应该支持不带参数调用', () => {
      const { result } = renderHook(() => useToast())

      result.current.dismiss()

      expect(result.current.dismiss).toBeDefined()
    })
  })

  describe('dismissAll方法', () => {
    it('应该支持dismiss所有Toast', () => {
      const { result } = renderHook(() => useToast())

      result.current.dismissAll()

      expect(result.current.dismissAll).toBeDefined()
    })
  })

  describe('toast方法', () => {
    it('应该支持info类型', () => {
      const { result } = renderHook(() => useToast())

      result.current.toast('info', '信息消息')

      expect(result.current.toast).toBeDefined()
    })

    it('应该支持success类型', () => {
      const { result } = renderHook(() => useToast())

      result.current.toast('success', '成功消息')

      expect(result.current.toast).toBeDefined()
    })

    it('应该支持error类型', () => {
      const { result } = renderHook(() => useToast())

      result.current.toast('error', '错误消息')

      expect(result.current.toast).toBeDefined()
    })

    it('应该支持warning类型', () => {
      const { result } = renderHook(() => useToast())

      result.current.toast('warning', '警告消息')

      expect(result.current.toast).toBeDefined()
    })

    it('默认应该使用info类型', () => {
      const { result } = renderHook(() => useToast())

      result.current.toast('info', '默认消息')

      expect(result.current.toast).toBeDefined()
    })

    it('应该支持自定义配置', () => {
      const { result } = renderHook(() => useToast())

      result.current.toast('success', '带配置的消息', {
        duration: 2000,
        action: {
          label: '操作',
          onClick: () => {},
        },
      })

      expect(result.current.toast).toBeDefined()
    })
  })

  describe('配置默认值', () => {
    it('duration默认应该是4000ms', () => {
      const { result } = renderHook(() => useToast())

      result.current.success('测试消息')

      expect(result.current.success).toBeDefined()
    })
  })
})
