/**
 * @file hooks/use-global-shortcuts.ts
 * @description YYC³ Global Keyboard Shortcuts — Centralized registration system
 *   for keyboard shortcuts across the application. Supports modifier combos,
 *   scoped shortcuts, and dynamic enable/disable.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags ux,keyboard,shortcuts,accessibility
 */

import { useEffect, useRef } from 'react'

// ==========================================
// Types
// ==========================================

export interface ShortcutDef {
  /** Unique identifier */
  id: string
  /** Human-readable label for display */
  label: string
  /** Key combo, e.g. "ctrl+k", "shift+/", "alt+f4" */
  combo: string
  /** Handler function */
  handler: () => void
  /** Whether this shortcut is currently active (default: true) */
  enabled?: boolean
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean
  /** Category for grouping in shortcuts help */
  category?: 'navigation' | 'actions' | 'editor' | 'tools'
}

interface ParsedCombo {
  ctrl: boolean
  meta: boolean
  shift: boolean
  alt: boolean
  key: string
}

// ==========================================
// Parsing
// ==========================================

function parseCombo(combo: string): ParsedCombo {
  const parts = combo.toLowerCase().split('+')
  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option'),
    key: parts[parts.length - 1] ?? '',
  }
}

function matchesCombo(e: KeyboardEvent, parsed: ParsedCombo): boolean {
  const key = e.key.toLowerCase()
  // Normalize special keys
  const normalizedKey =
    key === ' ' ? 'space' : key === 'escape' ? 'esc' : key === 'delete' ? 'del' : key

  // Check modifier keys (support both ctrl and meta as interchangeable on their platforms)
  const ctrlOrMeta = e.ctrlKey || e.metaKey
  if (parsed.ctrl && !ctrlOrMeta) return false
  if (parsed.meta && !ctrlOrMeta) return false
  if (parsed.shift && !e.shiftKey) return false
  if (parsed.alt && !e.altKey) return false
  if (!parsed.shift && e.shiftKey && parsed.key !== 'shift') return false
  if (!parsed.alt && e.altKey && parsed.key !== 'alt') return false

  return normalizedKey === parsed.key
}

// ==========================================
// Hook
// ==========================================

/**
 * Register global keyboard shortcuts.
 * Pass an array of shortcut definitions. Shortcuts are active while the component
 * is mounted and automatically cleaned up on unmount.
 *
 * @example
 * ```tsx
 * useGlobalShortcuts([
 *   { id: 'save', label: '保存', combo: 'ctrl+s', handler: handleSave },
 *   { id: 'search', label: '搜索', combo: 'ctrl+f', handler: openSearch },
 * ])
 * ```
 */
export function useGlobalShortcuts(shortcuts: ShortcutDef[]) {
  const shortcutsRef = useRef(shortcuts)

  // Update ref on each render to always use latest handlers
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea (unless it's an escape)
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue

        const parsed = parseCombo(shortcut.combo)

        // Allow Escape even when typing
        if (isTyping && parsed.key !== 'esc') continue

        if (matchesCombo(e, parsed)) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault()
            e.stopPropagation()
          }
          shortcut.handler()
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])
}

/**
 * Get a list of all registered shortcuts for display in a help dialog.
 * Returns shortcut definitions with display-formatted combos.
 */
export function formatCombo(combo: string): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const parts = combo.toLowerCase().split('+')
  return parts
    .map((p) => {
      switch (p) {
        case 'ctrl':
        case 'control':
          return isMac ? '⌃' : 'Ctrl'
        case 'meta':
        case 'cmd':
        case 'command':
          return isMac ? '⌘' : 'Win'
        case 'shift':
          return isMac ? '⇧' : 'Shift'
        case 'alt':
        case 'option':
          return isMac ? '⌥' : 'Alt'
        case 'enter':
          return '↵'
        case 'escape':
          return 'Esc'
        case 'space':
          return 'Space'
        case 'up':
          return '↑'
        case 'down':
          return '↓'
        case 'left':
          return '←'
        case 'right':
          return '→'
        case '/':
          return '/'
        default:
          return p.charAt(0).toUpperCase() + p.slice(1)
      }
    })
    .join(isMac ? '' : '+')
}

// ==========================================
// Default Shortcuts (exported for reference)
// ==========================================

export const DEFAULT_SHORTCUTS: Omit<ShortcutDef, 'handler'>[] = [
  { id: 'cmd-palette', label: '命令面板', combo: 'ctrl+k', category: 'navigation' },
  { id: 'toggle-sidebar', label: '侧边栏开关', combo: 'ctrl+/', category: 'navigation' },
  { id: 'toggle-notif', label: '通知面板', combo: 'ctrl+.', category: 'navigation' },
  { id: 'export', label: '导出数据', combo: 'ctrl+e', category: 'actions' },
  { id: 'new-chat', label: '新对话', combo: 'ctrl+n', category: 'actions' },
  { id: 'save', label: '保存文件', combo: 'ctrl+s', category: 'editor' },
  { id: 'search', label: '全局搜索', combo: 'ctrl+p', category: 'navigation' },
  { id: 'close', label: '关闭/返回', combo: 'escape', category: 'navigation' },
]
