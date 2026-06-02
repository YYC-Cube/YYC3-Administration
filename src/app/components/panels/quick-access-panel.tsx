/**
 * @file quick-access-panel.tsx
 * @description YYC³ Developer Workspace — Quick Access panel with recent files,
 *   favorites, and fast file open.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,quick-access
 */

import { Clock, Heart, Star } from 'lucide-react'
import { useCallback } from 'react'

import { getFileIcon, timeAgo } from './panel-helpers'
import { usePanelStore } from './panel-store'

import type { QuickAccessItem } from './panel-types'
import type { ThemeColors } from '../hooks/use-theme-colors'

export function QuickAccessPanel({ tc }: { tc: ThemeColors }) {
  const { recentFiles, favoriteFiles, toggleFavorite, selectFile, addRecentFile } = usePanelStore()

  const handleOpen = useCallback(
    (item: QuickAccessItem) => {
      selectFile(item.path)
      addRecentFile({ ...item, lastAccessed: Date.now() })
    },
    [selectFile, addRecentFile],
  )

  const renderItem = (item: QuickAccessItem, showFavBtn: boolean = true) => {
    const fileIcon = getFileIcon(item.name)
    const FileIconComp = fileIcon.icon
    const isFav = favoriteFiles.some((f) => f.path === item.path)
    return (
      <div
        key={item.path}
        onClick={() => handleOpen(item)}
        className="flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors hover:bg-white/[0.02] group"
      >
        <FileIconComp className="w-3.5 h-3.5 shrink-0" style={{ color: fileIcon.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] truncate" style={{ color: tc.textPrimary }}>
            {item.name}
          </p>
          <p className="text-[8px] truncate" style={{ color: tc.textMuted }}>
            {item.path}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="text-[8px] opacity-0 group-hover:opacity-60 transition-opacity"
            style={{ color: tc.textMuted }}
          >
            {timeAgo(item.lastAccessed)}
          </span>
          {showFavBtn && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(item)
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart
                className="w-3 h-3"
                style={{
                  color: isFav ? '#ef4444' : tc.textMuted,
                  fill: isFav ? '#ef4444' : 'none',
                }}
              />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center px-3 py-2 border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        <span className="text-[11px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
          快捷访问
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {favoriteFiles.length > 0 && (
          <div className="py-2">
            <div className="flex items-center gap-1.5 px-3 mb-1">
              <Star className="w-3 h-3" style={{ color: '#eab308' }} />
              <span className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
                收藏 ({favoriteFiles.length})
              </span>
            </div>
            {favoriteFiles.map((f) => renderItem(f, true))}
          </div>
        )}
        {recentFiles.length > 0 && (
          <div className="py-2 border-t" style={{ borderColor: tc.borderSubtle }}>
            <div className="flex items-center gap-1.5 px-3 mb-1">
              <Clock className="w-3 h-3" style={{ color: '#3b82f6' }} />
              <span className="text-[9px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
                最近 ({recentFiles.length})
              </span>
            </div>
            {recentFiles.slice(0, 10).map((f) => renderItem(f))}
          </div>
        )}
        {recentFiles.length === 0 && favoriteFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 opacity-40">
            <Star className="w-6 h-6 mb-1" style={{ color: tc.textMuted }} />
            <span className="text-[10px]" style={{ color: tc.textMuted }}>
              暂无最近或收藏文件
            </span>
            <span className="text-[8px] mt-0.5" style={{ color: tc.textMuted }}>
              从文件浏览器打开文件后，将在此显示
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
