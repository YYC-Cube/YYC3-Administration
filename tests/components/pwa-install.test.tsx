/**
 * @file pwa-install.test.tsx
 * @description PWAInstallPrompt 单元测试 — 安装横幅 / 关闭持久化 / 离线指示器 / 已安装
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { act, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider } from '@/app/components/i18n-context'
import { PWAInstallPrompt } from '@/app/components/pwa-install'

const wrap = (node: ReactNode) => render(<I18nProvider>{node}</I18nProvider>)

let online = true

function makePromptEvent() {
  const evt = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
  evt.prompt = vi.fn().mockResolvedValue(undefined)
  evt.userChoice = Promise.resolve({ outcome: 'accepted' as const })
  return evt
}

beforeEach(() => {
  localStorage.clear()
  online = true
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => online,
  })
})

describe('PWAInstallPrompt — 初始状态', () => {
  it('未触发 beforeinstallprompt 且在线时不渲染任何内容', () => {
    const { container } = wrap(<PWAInstallPrompt />)
    expect(container).toBeEmptyDOMElement()
  })

  it('近期已关闭过安装横幅时不展示横幅', () => {
    localStorage.setItem('yyc3_pwa_dismissed', String(Date.now()))
    wrap(<PWAInstallPrompt />)
    window.dispatchEvent(makePromptEvent())
    expect(screen.queryByText('安装应用')).not.toBeInTheDocument()
  })
})

describe('PWAInstallPrompt — 离线指示器', () => {
  it('离线时展示 Offline 指示器,回到在线后消失', () => {
    online = false
    wrap(<PWAInstallPrompt />)
    expect(screen.getByText('Offline')).toBeInTheDocument()

    online = true
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText('Offline')).not.toBeInTheDocument()
  })
})

describe('PWAInstallPrompt — 安装流程(定时器)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('beforeinstallprompt 后延时展示横幅,点击安装调用 prompt', async () => {
    const promptEvent = makePromptEvent()
    wrap(<PWAInstallPrompt />)

    await act(async () => {
      window.dispatchEvent(promptEvent)
    })
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText('安装应用')).toBeInTheDocument()

    fireEvent.click(screen.getByText('安装应用'))
    await act(async () => {
      await Promise.resolve()
    })
    expect(promptEvent.prompt).toHaveBeenCalledTimes(1)
    // 接受安装后横幅消失
    expect(screen.queryByText('安装应用')).not.toBeInTheDocument()
  })

  it('点击“稍后再说”关闭横幅并写入 localStorage', async () => {
    const promptEvent = makePromptEvent()
    wrap(<PWAInstallPrompt />)

    await act(async () => {
      window.dispatchEvent(promptEvent)
    })
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    fireEvent.click(screen.getByText('稍后再说'))
    expect(screen.queryByText('安装应用')).not.toBeInTheDocument()
    expect(localStorage.getItem('yyc3_pwa_dismissed')).not.toBeNull()
  })
})
