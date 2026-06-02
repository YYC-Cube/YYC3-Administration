/**
 * Vitest Global Setup
 * 配置测试环境和全局 Mocks
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

// 每个测试后清理 DOM
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0) as any
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}

// Mock console 方法以减少测试输出噪音（可选）
// global.console = {
//   ...console,
//   log: vi.fn(),
//   debug: vi.fn(),
//   info: vi.fn(),
//   warn: vi.fn(),
// };

// 抑制 React 18 的某些警告
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
