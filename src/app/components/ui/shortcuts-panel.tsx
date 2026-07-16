'use client'

import { useState } from 'react'

import { DEFAULT_SHORTCUTS, formatCombo } from '../hooks/use-global-shortcuts'

import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

import type { ShortcutDef } from '../hooks/use-global-shortcuts'

interface ShortcutsPanelProps {
  shortcuts?: Omit<ShortcutDef, 'handler'>[]
}

export function ShortcutsPanel({ shortcuts = DEFAULT_SHORTCUTS }: ShortcutsPanelProps) {
  const [open, setOpen] = useState(false)

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || '通用'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(shortcut)
      return acc
    },
    {} as Record<string, Omit<ShortcutDef, 'handler'>[]>,
  )

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        快捷键
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>键盘快捷键</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{category}</h3>
                <div className="space-y-1">
                  {items.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{shortcut.label}</span>
                      <kbd className="px-2 py-1 text-xs font-medium bg-muted rounded-md">
                        {formatCombo(shortcut.combo)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground text-center">按 Escape 关闭面板</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
