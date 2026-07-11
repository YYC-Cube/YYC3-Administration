/**
 * @file ui/virtual-tree.tsx
 * @description YYC³ Virtual Scrolling Tree Component — Efficiently renders
 *   large file trees (10,000+ nodes) by only rendering visible rows.
 *   Uses a flattened visible-nodes approach with absolute positioning.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags performance,virtual-scroll,file-tree
 */

import { useCallback, useMemo, useRef, useState } from 'react'

import type { FileNode } from '../panels/panel-types'

// ==========================================
// Types
// ==========================================

interface VisibleNode {
  node: FileNode
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}

interface VirtualTreeProps {
  /** Root nodes of the file tree */
  nodes: FileNode[]
  /** Set of expanded folder IDs */
  expandedIds: Set<string>
  /** Currently selected file path */
  selectedPath: string | null
  /** Called when a file/folder is clicked */
  onSelect: (node: FileNode) => void
  /** Called when a folder's expand state is toggled */
  onToggleExpand: (node: FileNode) => void
  /** Row height in pixels (default: 28) */
  rowHeight?: number
  /** Maximum height of the tree viewport */
  maxHeight?: number | string
  /** Render function for each node row */
  renderNode?: (node: VisibleNode, isSelected: boolean) => React.ReactNode
}

// ==========================================
// Flatten Tree to Visible Rows
// ==========================================

function flattenVisible(
  nodes: FileNode[],
  expandedIds: Set<string>,
  depth: number = 0,
): VisibleNode[] {
  const result: VisibleNode[] = []

  for (const node of nodes) {
    const isExpanded = expandedIds.has(node.id)
    const hasChildren = node.type === 'directory' && (node.children?.length ?? 0) > 0

    result.push({ node, depth, hasChildren, isExpanded })

    if (hasChildren && isExpanded && node.children) {
      result.push(...flattenVisible(node.children, expandedIds, depth + 1))
    }
  }

  return result
}

// ==========================================
// Component
// ==========================================

/**
 * Virtual scrolling file tree.
 * Only renders rows that are visible in the viewport, plus an overscan buffer.
 * Handles large trees (10,000+ nodes) without performance degradation.
 */
export function VirtualTree({
  nodes,
  expandedIds,
  selectedPath,
  onSelect,
  onToggleExpand,
  rowHeight = 28,
  maxHeight = '100%',
  renderNode,
}: VirtualTreeProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(600)

  // Flatten visible nodes (only expanded branches)
  const visibleNodes = useMemo(() => flattenVisible(nodes, expandedIds), [nodes, expandedIds])

  const totalHeight = visibleNodes.length * rowHeight

  // Calculate visible range with overscan
  const overscan = 5
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
  const endIndex = Math.min(
    visibleNodes.length,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan,
  )

  const visibleSlice = visibleNodes.slice(startIndex, endIndex)
  const offsetY = startIndex * rowHeight

  // Track viewport height
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Update viewport height on mount and resize
  const setRef = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el
    if (el) {
      const updateHeight = () => setViewportHeight(el.clientHeight)
      updateHeight()
      const observer = new ResizeObserver(updateHeight)
      observer.observe(el)
    }
  }, [])

  // Default node renderer
  const defaultRenderNode = useCallback(
    (item: VisibleNode, isSelected: boolean) => {
      const { node, depth, hasChildren, isExpanded } = item
      return (
        <div
          className="flex items-center gap-1 cursor-pointer rounded transition-colors"
          style={{
            paddingLeft: `${depth * 16 + 8}px`,
            background: isSelected ? 'rgba(0,240,255,0.1)' : 'transparent',
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(node)
              }}
              className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-white/40 hover:text-white/80"
            >
              {isExpanded ? '▾' : '▸'}
            </button>
          ) : (
            <span className="w-4 flex-shrink-0" />
          )}
          <span
            className="text-sm truncate"
            style={{
              color: isSelected
                ? '#00f0ff'
                : node.type === 'directory'
                  ? '#8b5cf6'
                  : 'rgba(255,255,255,0.7)',
            }}
          >
            {node.name}
          </span>
        </div>
      )
    },
    [onToggleExpand],
  )

  return (
    <div
      ref={setRef}
      onScroll={onScroll}
      className="overflow-auto"
      style={{ maxHeight, position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleSlice.map((item, i) => {
            const isSelected = item.node.path === selectedPath
            return (
              <div
                key={`${item.node.id}-${startIndex + i}`}
                style={{ height: rowHeight }}
                onClick={() => onSelect(item.node)}
              >
                {renderNode ? renderNode(item, isSelected) : defaultRenderNode(item, isSelected)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
