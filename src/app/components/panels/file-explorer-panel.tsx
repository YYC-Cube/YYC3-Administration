/**
 * @file file-explorer-panel.tsx
 * @description YYC³ Developer Workspace — File Explorer panel with CRUD, right-click
 *   context menu, rename, delete confirmation, new file/folder dialog.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P1,frontend,panels,file-explorer
 */

import {
  ChevronRight,
  Copy,
  Edit3,
  ExternalLink,
  File,
  Folder,
  FolderOpen,
  Heart,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { formatFileSize, getFileIcon, getGitStatusStyle, MOCK_FILE_TREE } from './panel-helpers'
import { usePanelStore } from './panel-store'

import type { FileNode } from './panel-types'
import type { ThemeColors } from '../hooks/use-theme-colors'

export function FileExplorerPanel({ tc }: { tc: ThemeColors }) {
  const {
    expandedFolders,
    toggleFolder,
    selectedFile,
    selectFile,
    addRecentFile,
    toggleFavorite,
    favoriteFiles,
    fileTree,
    setFileTree,
    addFileNode,
    deleteFileNode,
    renameFileNode,
  } = usePanelStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(
    null,
  )
  const menuRef = useRef<HTMLDivElement>(null)
  const [newItemDialog, setNewItemDialog] = useState<{
    parentPath: string
    type: 'file' | 'directory'
  } | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<FileNode | null>(null)

  useEffect(() => {
    if (fileTree.length === 0) setFileTree(MOCK_FILE_TREE)
  }, [fileTree.length, setFileTree])

  const activeTree = fileTree.length > 0 ? fileTree : MOCK_FILE_TREE

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenu(null)
    }
    if (contextMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [contextMenu])

  const handleFileClick = useCallback(
    (node: FileNode) => {
      if (node.type === 'directory') {
        toggleFolder(node.id)
      } else {
        selectFile(node.path)
        addRecentFile({
          id: node.id,
          name: node.name,
          path: node.path,
          type: 'recent',
          lastAccessed: Date.now(),
          language: node.language,
        })
      }
    },
    [toggleFolder, selectFile, addRecentFile],
  )

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }, [])

  const isFavorite = useCallback(
    (path: string) => favoriteFiles.some((f) => f.path === path),
    [favoriteFiles],
  )

  const renderNode = useCallback(
    (node: FileNode, depth: number = 0): React.ReactNode => {
      const isExpanded = expandedFolders.includes(node.id)
      const isSelected = selectedFile === node.path
      const gitStyle = getGitStatusStyle(node.gitStatus)
      const fileIcon = node.type === 'file' ? getFileIcon(node.name) : null
      const FolderIcon = isExpanded ? FolderOpen : Folder
      const FileIconComp = fileIcon?.icon ?? File

      return (
        <div key={node.id}>
          <div
            className="flex items-center gap-1 px-2 py-[3px] cursor-pointer group transition-colors rounded-md mx-1"
            style={{
              paddingLeft: `${depth * 14 + 8}px`,
              background: isSelected ? `${tc.primary}12` : 'transparent',
              color: isSelected ? tc.textPrimary : tc.textSecondary,
            }}
            onClick={() => handleFileClick(node)}
            onContextMenu={(e) => handleContextMenu(e, node)}
          >
            {node.type === 'directory' ? (
              <ChevronRight
                className="w-3 h-3 shrink-0 transition-transform"
                style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', color: tc.textMuted }}
              />
            ) : (
              <span className="w-3 shrink-0" />
            )}
            {node.type === 'directory' ? (
              <FolderIcon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: isExpanded ? '#f97316' : '#eab308' }}
              />
            ) : (
              <FileIconComp
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: fileIcon?.color ?? tc.textMuted }}
              />
            )}
            {renamingPath === node.path ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameValue.trim()) {
                    renameFileNode(node.path, renameValue.trim())
                    setRenamingPath(null)
                  }
                  if (e.key === 'Escape') setRenamingPath(null)
                }}
                onBlur={() => {
                  if (renameValue.trim() && renameValue !== node.name)
                    renameFileNode(node.path, renameValue.trim())
                  setRenamingPath(null)
                }}
                className="text-[11px] flex-1 px-1 py-0 rounded border outline-none min-w-0"
                style={{ background: tc.bgInput, borderColor: tc.primary, color: tc.textPrimary }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-[11px] truncate flex-1"
                style={{
                  color:
                    node.gitStatus === 'modified'
                      ? '#eab308'
                      : node.gitStatus === 'added'
                        ? '#22c55e'
                        : undefined,
                }}
              >
                {node.name}
              </span>
            )}
            {gitStyle.label && (
              <span className="text-[8px] px-1 rounded shrink-0" style={{ color: gitStyle.color }}>
                {gitStyle.label}
              </span>
            )}
            {node.type === 'file' && (
              <span
                className="text-[8px] opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
                style={{ color: tc.textMuted }}
              >
                {formatFileSize(node.size)}
              </span>
            )}
          </div>
          {node.type === 'directory' && isExpanded && node.children && (
            <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
          )}
        </div>
      )
    },
    [
      expandedFolders,
      selectedFile,
      tc,
      handleFileClick,
      handleContextMenu,
      renamingPath,
      renameValue,
      renameFileNode,
    ],
  )

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: tc.borderSubtle }}
      >
        <span className="text-[11px] uppercase tracking-wider" style={{ color: tc.textMuted }}>
          文件浏览器
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setNewItemDialog({ parentPath: '/', type: 'file' })
              setNewItemName('')
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
            title="新建文件"
          >
            <Plus className="w-3 h-3" style={{ color: tc.textMuted }} />
          </button>
          <button
            onClick={() => {
              setFileTree([])
              setTimeout(() => setFileTree(MOCK_FILE_TREE), 100)
            }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
            title="刷新"
          >
            <RefreshCw className="w-3 h-3" style={{ color: tc.textMuted }} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {activeTree.map((node) => renderNode(node))}
      </div>

      {/* New File/Folder Dialog */}
      <AnimatePresence>
        {newItemDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40"
            onClick={() => setNewItemDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-72 rounded-xl border p-4"
              style={{
                background: tc.bgElevated,
                borderColor: tc.borderDefault,
                boxShadow: tc.shadowLg,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[12px] mb-2" style={{ color: tc.textPrimary }}>
                {newItemDialog.type === 'file' ? '新建文件' : '新建文件夹'}
              </p>
              <input
                autoFocus
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={newItemDialog.type === 'file' ? 'filename.tsx' : 'folder-name'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemName.trim()) {
                    const path = `${newItemDialog.parentPath}/${newItemName.trim()}`
                    const ext = newItemName.split('.').pop()?.toLowerCase() ?? ''
                    addFileNode(newItemDialog.parentPath, {
                      id: path,
                      type: newItemDialog.type,
                      name: newItemName.trim(),
                      path,
                      ...(newItemDialog.type === 'file'
                        ? {
                            language: ext,
                            size: 0,
                            modifiedAt: Date.now(),
                            gitStatus: 'added' as const,
                          }
                        : { children: [] }),
                    })
                    if (newItemDialog.type === 'directory') toggleFolder(path)
                    setNewItemDialog(null)
                  }
                  if (e.key === 'Escape') setNewItemDialog(null)
                }}
                className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border outline-none mb-2"
                style={{
                  background: tc.bgInput,
                  borderColor: tc.borderDefault,
                  color: tc.textPrimary,
                }}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setNewItemDialog(null)}
                  className="text-[10px] px-3 py-1 rounded-lg border"
                  style={{ borderColor: tc.borderDefault, color: tc.textMuted }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (!newItemName.trim()) return
                    const path = `${newItemDialog.parentPath}/${newItemName.trim()}`
                    const ext = newItemName.split('.').pop()?.toLowerCase() ?? ''
                    addFileNode(newItemDialog.parentPath, {
                      id: path,
                      type: newItemDialog.type,
                      name: newItemName.trim(),
                      path,
                      ...(newItemDialog.type === 'file'
                        ? {
                            language: ext,
                            size: 0,
                            modifiedAt: Date.now(),
                            gitStatus: 'added' as const,
                          }
                        : { children: [] }),
                    })
                    setNewItemDialog(null)
                  }}
                  className="text-[10px] px-3 py-1 rounded-lg border"
                  style={{
                    background: `${tc.primary}15`,
                    borderColor: `${tc.primary}30`,
                    color: tc.primary,
                  }}
                >
                  创建
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-72 rounded-xl border p-4"
              style={{
                background: tc.bgElevated,
                borderColor: tc.borderDefault,
                boxShadow: tc.shadowLg,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[12px] mb-1" style={{ color: tc.textPrimary }}>
                删除 "{deleteConfirm.name}"？
              </p>
              <p className="text-[10px] mb-3" style={{ color: tc.textMuted }}>
                {deleteConfirm.type === 'directory'
                  ? '此操作将删除文件夹及其所有内容。'
                  : '此操作不可撤销。'}
              </p>
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-[10px] px-3 py-1 rounded-lg border"
                  style={{ borderColor: tc.borderDefault, color: tc.textMuted }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    deleteFileNode(deleteConfirm.path)
                    setDeleteConfirm(null)
                  }}
                  className="text-[10px] px-3 py-1 rounded-lg border"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    borderColor: 'rgba(239,68,68,0.3)',
                    color: '#ef4444',
                  }}
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[9999] w-44 rounded-xl border py-1 overflow-hidden"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              background: tc.bgElevated,
              borderColor: tc.borderDefault,
              boxShadow: tc.shadowLg,
            }}
          >
            {[
              {
                label: '打开',
                icon: ExternalLink,
                action: () => {
                  handleFileClick(contextMenu.node)
                  setContextMenu(null)
                },
              },
              ...(contextMenu.node.type === 'directory'
                ? [
                    {
                      label: '新建文件',
                      icon: Plus,
                      action: () => {
                        setNewItemDialog({
                          parentPath: contextMenu.node.path,
                          type: 'file' as const,
                        })
                        setNewItemName('')
                        setContextMenu(null)
                      },
                    },
                    {
                      label: '新建文件夹',
                      icon: Folder,
                      action: () => {
                        setNewItemDialog({
                          parentPath: contextMenu.node.path,
                          type: 'directory' as const,
                        })
                        setNewItemName('')
                        setContextMenu(null)
                      },
                    },
                  ]
                : []),
              {
                label: isFavorite(contextMenu.node.path) ? '取消收藏' : '收藏',
                icon: Heart,
                action: () => {
                  toggleFavorite({
                    id: contextMenu.node.id,
                    name: contextMenu.node.name,
                    path: contextMenu.node.path,
                    type: 'favorite',
                    lastAccessed: Date.now(),
                    language: contextMenu.node.language,
                  })
                  setContextMenu(null)
                },
              },
              {
                label: '复制路径',
                icon: Copy,
                action: () => {
                  navigator.clipboard?.writeText(contextMenu.node.path)
                  setContextMenu(null)
                },
              },
              {
                label: '重命名',
                icon: Edit3,
                action: () => {
                  setRenamingPath(contextMenu.node.path)
                  setRenameValue(contextMenu.node.name)
                  setContextMenu(null)
                },
              },
              {
                label: '删除',
                icon: Trash2,
                action: () => {
                  setDeleteConfirm(contextMenu.node)
                  setContextMenu(null)
                },
                color: '#ef4444',
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors hover:bg-white/5"
                style={{ color: (item as any).color ?? tc.textSecondary }}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
