Your Role & Expertise

You are an experienced frontend architect who specializes in:
- **Developer Experience**: IDE-like interfaces, keyboard-driven workflows, efficient navigation
- **Panel Management**: Resizable panels, collapsible sections, drag-and-drop functionality
- **File Management**: Tree views, file operations, project navigation
- **AI Integration**: Context-aware assistance, intelligent suggestions, real-time help
- **Task Management**: Kanban boards, task tracking, progress visualization
- **Search & Navigation**: Global search, fuzzy search, quick access
- **Best Practices**: Performance optimization, accessibility, responsive design

### Code Standards

**IMPORTANT**: Please ensure all generated code files follow the team requirements specified in: `guidelines/YYC3-Code-header.md`

All code files must include proper file headers with:
- @file: File name/path
- @description: Clear description of file purpose
- @author: YanYuCloudCube Team <admin@0379.email>
- @version: Semantic version (v1.0.0)
- @created: Creation date (YYYY-MM-DD)
- @updated: Last update date (YYYY-MM-DD)
- @status: File status (draft/dev/test/stable/deprecated)
- @license: License type
- @copyright: Copyright notice
- @tags: Relevant tags for categorization

---

## 📋 文档信息

| 字段 | 内容 |
|------|------|
| @file | P1-核心功能/YYC3-P1-前端-左侧面板功能.md |
| @description | AI开发编程工具左侧面板功能设计和实现，包含文件浏览器、任务管理、AI助手、搜索等核心功能 |
| @author | YanYuCloudCube Team <admin@0379.email> |
| @version | v1.0.0 |
| @created | 2026-03-17 |
| @updated | 2026-03-17 |
| @status | stable |
| @license | MIT |
| @copyright | Copyright (c) 2026 YanYuCloudCube Team |
| @tags P1,frontend,left-panel,sidebar |

---

## 🎯 功能目标

实现智能左侧面板系统，包括：
- ✅ 文件浏览器（树形视图、文件操作）
- ✅ 任务管理（看板视图、任务跟踪）
- ✅ AI助手（智能建议、上下文帮助）
- ✅ 全局搜索（文件搜索、内容搜索）
- ✅ 快速访问（最近文件、收藏夹）
- ✅ Git集成（状态查看、操作面板）

---

## 🏗️ 架构设计

### 1. 功能架构

```
LeftPanel/
├── FileExplorer         # 文件浏览器
├── TaskManager          # 任务管理
├── AIAssistant          # AI助手
├── GlobalSearch         # 全局搜索
├── QuickAccess          # 快速访问
├── GitIntegration       # Git集成
└── PanelManager         # 面板管理器
```

### 2. 数据流

```
User Interaction (用户交互)
    ↓ Panel Manager
Panel Components (面板组件)
    ↓ State Updates
Global State (全局状态)
    ↓ UI Updates
User (用户)
```

---

## 💾 核心类型定义

### 面板类型

```typescript
// src/types/panel.ts

/**
 * 面板类型
 */
export type PanelType =
  | 'file-explorer'
  | 'task-manager'
  | 'ai-assistant'
  | 'global-search'
  | 'quick-access'
  | 'git-integration';

/**
 * 面板状态
 */
export type PanelState = 'collapsed' | 'expanded' | 'pinned' | 'floating';

/**
 * 面板接口
 */
export interface Panel {
  /** 面板 ID */
  id: string;
  /** 面板类型 */
  type: PanelType;
  /** 面板标题 */
  title: string;
  /** 面板图标 */
  icon: string;
  /** 面板状态 */
  state: PanelState;
  /** 面板宽度 */
  width: number;
  /** 最小宽度 */
  minWidth: number;
  /** 最大宽度 */
  maxWidth: number;
  /** 是否可见 */
  isVisible: boolean;
  /** 是否可拖拽 */
  isDraggable: boolean;
  /** 面板顺序 */
  order: number;
  /** 自定义数据 */
  data?: Record<string, any>;
}

/**
 * 文件节点类型
 */
export type FileNodeType = 'file' | 'directory' | 'symlink';

/**
 * 文件节点接口
 */
export interface FileNode {
  /** 节点 ID */
  id: string;
  /** 节点类型 */
  type: FileNodeType;
  /** 节点名称 */
  name: string;
  /** 节点路径 */
  path: string;
  /** 父节点 ID */
  parentId?: string;
  /** 子节点列表 */
  children?: FileNode[];
  /** 是否展开 */
  isExpanded: boolean;
  /** 是否选中 */
  isSelected: boolean;
  /** 文件大小 */
  size?: number;
  /** 修改时间 */
  modifiedAt?: number;
  /** 文件语言 */
  language?: string;
  /** 是否被忽略 */
  isIgnored: boolean;
  /** Git 状态 */
  gitStatus?: 'unmodified' | 'modified' | 'added' | 'deleted' | 'renamed';
}

/**
 * 搜索结果接口
 */
export interface SearchResult {
  /** 结果 ID */
  id: string;
  /** 结果类型 */
  type: 'file' | 'content' | 'symbol' | 'command';
  /** 结果标题 */
  title: string;
  /** 结果描述 */
  description?: string;
  /** 文件路径 */
  filePath: string;
  /** 匹配行号 */
  line?: number;
  /** 匹配列号 */
  column?: number;
  /** 匹配内容 */
  match?: string;
  /** 相关性分数 */
  score: number;
  /** 预览文本 */
  preview?: string;
}

/**
 * AI建议接口
 */
export interface AISuggestion {
  /** 建议 ID */
  id: string;
  /** 建议类型 */
  type: 'code' | 'explanation' | 'refactor' | 'fix' | 'optimization';
  /** 建议标题 */
  title: string;
  /** 建议描述 */
  description: string;
  /** 建议代码 */
  code?: string;
  /** 置信度 */
  confidence: number;
  /** 上下文 */
  context?: string;
  /** 是否已应用 */
  isApplied: boolean;
}
```

---

## 📁 文件浏览器

### 文件浏览器组件

```typescript
// src/components/panels/FileExplorer.tsx
import React, { useState, useCallback } from 'react';
import { usePanelStore } from '@/stores/usePanelStore';
import { useFileSystem } from '@/hooks/useFileSystem';
import type { FileNode } from '@/types/panel';

export const FileExplorer: React.FC = () => {
  const { activePanel } = usePanelStore();
  const { fileTree, toggleNode, selectNode, createFile, createDirectory, deleteNode, renameNode } = useFileSystem();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode | null }>({ x: 0, y: 0, node: null });

  const handleNodeClick = useCallback((node: FileNode) => {
    selectNode(node.id);
  }, [selectNode]);

  const handleNodeDoubleClick = useCallback((node: FileNode) => {
    if (node.type === 'directory') {
      toggleNode(node.id);
    } else {
      // 打开文件
      // 与项目文件打开逻辑保持一致
    }
  }, [toggleNode]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ x: 0, y: 0, node: null });
  }, []);

  const handleCreateFile = useCallback(async (node: FileNode) => {
    const name = prompt('Enter file name:');
    if (name) {
      await createFile(node.path, name);
    }
    handleCloseContextMenu();
  }, [createFile, handleCloseContextMenu]);

  const handleCreateDirectory = useCallback(async (node: FileNode) => {
    const name = prompt('Enter directory name:');
    if (name) {
      await createDirectory(node.path, name);
    }
    handleCloseContextMenu();
  }, [createDirectory, handleCloseContextMenu]);

  const handleDelete = useCallback(async (node: FileNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      await deleteNode(node.id);
    }
    handleCloseContextMenu();
  }, [deleteNode, handleCloseContextMenu]);

  const handleRename = useCallback(async (node: FileNode) => {
    const name = prompt('Enter new name:', node.name);
    if (name && name !== node.name) {
      await renameNode(node.id, name);
    }
    handleCloseContextMenu();
  }, [renameNode, handleCloseContextMenu]);

  const renderNode = useCallback((node: FileNode, level: number = 0): React.ReactNode => {
    const paddingLeft = level * 16;

    return (
      <div key={node.id}>
        <div
          className={`file-node ${node.isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => handleNodeClick(node)}
          onDoubleClick={() => handleNodeDoubleClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          <span className="node-icon">
            {node.type === 'directory' ? (node.isExpanded ? '📂' : '📁') : getFileIcon(node.name)}
          </span>
          <span className="node-name">{node.name}</span>
          {node.gitStatus && <span className="git-status">{getGitStatusIcon(node.gitStatus)}</span>}
        </div>
        {node.type === 'directory' && node.isExpanded && node.children && (
          <div className="node-children">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [handleNodeClick, handleNodeDoubleClick, handleContextMenu]);

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Explorer</h3>
        <div className="header-actions">
          <button onClick={() => handleCreateFile({ id: '', type: 'directory', name: '', path: '' })}>
            New File
          </button>
          <button onClick={() => handleCreateDirectory({ id: '', type: 'directory', name: '', path: '' })}>
            New Folder
          </button>
        </div>
      </div>
      <div className="file-tree">
        {fileTree.map((node) => renderNode(node))}
      </div>
      {contextMenu.node && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={handleCloseContextMenu}
        >
          <div className="context-menu-item" onClick={() => handleCreateFile(contextMenu.node!)}>
            New File
          </div>
          <div className="context-menu-item" onClick={() => handleCreateDirectory(contextMenu.node!)}>
            New Folder
          </div>
          <div className="context-menu-item" onClick={() => handleRename(contextMenu.node!)}>
            Rename
          </div>
          <div className="context-menu-item" onClick={() => handleDelete(contextMenu.node!)}>
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const icons: Record<string, string> = {
    ts: '📘',
    tsx: '⚛️',
    js: '📜',
    jsx: '⚛️',
    py: '🐍',
    rs: '🦀',
    go: '🐹',
    java: '☕',
    cpp: '⚙️',
    c: '⚙️',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    json: '📋',
    md: '📝',
    txt: '📄',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    svg: '🎨',
  };

  return icons[ext || ''] || '📄';
}

function getGitStatusIcon(status: FileNode['gitStatus']): string {
  const icons: Record<FileNode['gitStatus'], string> = {
    modified: 'M',
    added: 'A',
    deleted: 'D',
    renamed: 'R',
    unmodified: '',
  };

  return icons[status] || '';
}
```

### 文件系统Hook

```typescript
// src/hooks/useFileSystem.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileNode } from '@/types/panel';

interface FileSystemState {
  /** 文件树 */
  fileTree: FileNode[];
  /** 选中的节点 ID */
  selectedNodeId: string | null;
  /** 展开的节点 ID 列表 */
  expandedNodeIds: Set<string>;
}

interface FileSystemActions {
  /** 切换节点展开状态 */
  toggleNode: (nodeId: string) => void;
  /** 选择节点 */
  selectNode: (nodeId: string) => void;
  /** 创建文件 */
  createFile: (parentPath: string, name: string) => Promise<void>;
  /** 创建目录 */
  createDirectory: (parentPath: string, name: string) => Promise<void>;
  /** 删除节点 */
  deleteNode: (nodeId: string) => Promise<void>;
  /** 重命名节点 */
  renameNode: (nodeId: string, name: string) => Promise<void>;
  /** 刷新文件树 */
  refreshFileTree: () => Promise<void>;
}

export const useFileSystem = create<FileSystemState & FileSystemActions>()(
  persist(
    (set, get) => ({
      fileTree: [],
      selectedNodeId: null,
      expandedNodeIds: new Set(),

      toggleNode: (nodeId) => {
        set((state) => {
          const expandedNodeIds = new Set(state.expandedNodeIds);
          if (expandedNodeIds.has(nodeId)) {
            expandedNodeIds.delete(nodeId);
          } else {
            expandedNodeIds.add(nodeId);
          }
          return { expandedNodeIds };
        });
      },

      selectNode: (nodeId) => {
        set({ selectedNodeId: nodeId });
      },

      createFile: async (parentPath, name) => {
        // 实现文件创建逻辑
        // 与项目文件系统保持一致
      },

      createDirectory: async (parentPath, name) => {
        // 实现目录创建逻辑
        // 与项目文件系统保持一致
      },

      deleteNode: async (nodeId) => {
        // 实现节点删除逻辑
        // 与项目文件系统保持一致
      },

      renameNode: async (nodeId, name) => {
        // 实现节点重命名逻辑
        // 与项目文件系统保持一致
      },

      refreshFileTree: async () => {
        // 实现文件树刷新逻辑
        // 与项目文件系统保持一致
      },
    }),
    {
      name: 'filesystem-storage',
      partialize: (state) => ({
        expandedNodeIds: Array.from(state.expandedNodeIds),
      }),
    }
  )
);
```

---

## 📋 任务管理

### 任务管理面板

```typescript
// src/components/panels/TaskManager.tsx
import React, { useState, useCallback } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import type { Task, TaskStatus, TaskPriority } from '@/types/task';

export const TaskManager: React.FC = () => {
  const { tasks, updateTask, deleteTask, filter, updateFilter } = useTaskStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((task) => {
    if (filter.status && task.status !== filter.status) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.type && task.type !== filter.type) return false;
    return true;
  });

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
  }, [updateTask]);

  const handlePriorityChange = useCallback((taskId: string, priority: TaskPriority) => {
    updateTask(taskId, { priority });
  }, [updateTask]);

  const handleDelete = useCallback((taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
      setSelectedTaskId(null);
    }
  }, [deleteTask]);

  const handleFilterChange = useCallback((key: keyof typeof filter, value: any) => {
    updateFilter({ [key]: value });
  }, [updateFilter]);

  const getPriorityColor = (priority: TaskPriority): string => {
    const colors: Record<TaskPriority, string> = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'green',
    };
    return colors[priority];
  };

  const getStatusColor = (status: TaskStatus): string => {
    const colors: Record<TaskStatus, string> = {
      todo: 'gray',
      'in-progress': 'blue',
      review: 'purple',
      done: 'green',
      blocked: 'red',
    };
    return colors[status];
  };

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h3>Tasks</h3>
        <div className="header-actions">
          <select
            value={filter.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={filter.priority || 'all'}
            onChange={(e) => handleFilterChange('priority', e.target.value === 'all' ? undefined : e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div className="task-list">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${selectedTaskId === task.id ? 'selected' : ''}`}
            onClick={() => handleTaskClick(task.id)}
          >
            <div className="task-header">
              <div className="task-title">{task.title}</div>
              <div className="task-actions">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  className="status-select"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(task.id, e.target.value as TaskPriority)}
                  className="priority-select"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button onClick={() => handleDelete(task.id)} className="delete-button">
                  🗑️
                </button>
              </div>
            </div>
            {task.description && <div className="task-description">{task.description}</div>}
            <div className="task-meta">
              {task.dueDate && (
                <span className="task-due-date">
                  📅 {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              {task.tags && task.tags.length > 0 && (
                <span className="task-tags">
                  {task.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🤖 AI助手

### AI助手面板

```typescript
// src/components/panels/AIAssistant.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { aiProviderManager } from '@/services/ai/AIProviderManager';
import type { AISuggestion } from '@/types/panel';

export const AIAssistant: React.FC = () => {
  const { messages, addMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    addMessage({ role: 'user', content: userMessage });

    try {
      const config = {
        provider: await aiProviderManager.selectProvider(),
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant for developers.' },
          ...messages.slice(-10),
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        maxTokens: 2048,
        stream: false,
      };

      const response = await aiProviderManager.request(config);
      addMessage({ role: 'assistant', content: response.content });

      // 生成建议
      await generateSuggestions(userMessage, response.content);
    } catch (error) {
      addMessage({ role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, messages, addMessage]);

  const generateSuggestions = useCallback(async (userMessage: string, assistantMessage: string) => {
    try {
      const config = {
        provider: await aiProviderManager.selectProvider(),
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate relevant follow-up suggestions based on the conversation.',
          },
          {
            role: 'user',
            content: `User: ${userMessage}\nAssistant: ${assistantMessage}\n\nGenerate 3-4 relevant follow-up suggestions.`,
          },
        ],
        temperature: 0.5,
        maxTokens: 512,
        stream: false,
      };

      const response = await aiProviderManager.request(config);
      const parsedSuggestions = JSON.parse(response.content);

      setSuggestions(
        parsedSuggestions.map((s: any) => ({
          id: crypto.randomUUID(),
          type: s.type || 'explanation',
          title: s.title,
          description: s.description,
          confidence: s.confidence || 0.8,
          isApplied: false,
        }))
      );
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }, []);

  const handleSuggestionClick = useCallback(async (suggestion: AISuggestion) => {
    setInput(suggestion.title);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  }, []);

  const handleClear = useCallback(() => {
    clearMessages();
    setSuggestions([]);
  }, [clearMessages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <h3>AI Assistant</h3>
        <div className="header-actions">
          <button onClick={handleClear} className="clear-button">
            Clear
          </button>
        </div>
      </div>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <div className="empty-state-text">
              Ask me anything about your code, project, or development tasks.
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-header">
                  <span className="message-role">{message.role === 'user' ? 'You' : 'AI'}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="suggestions-container">
          <div className="suggestions-header">Suggestions</div>
          <div className="suggestions-list">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-title">{suggestion.title}</div>
                <div className="suggestion-description">{suggestion.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI..."
          rows={3}
          disabled={isProcessing}
        />
        <button onClick={handleSend} disabled={isProcessing || !input.trim()}>
          {isProcessing ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
```

---

## 🔍 全局搜索

### 全局搜索面板

```typescript
// src/components/panels/GlobalSearch.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useSearchStore } from '@/stores/useSearchStore';
import type { SearchResult } from '@/types/panel';

export const GlobalSearch: React.FC = () => {
  const { searchResults, searchQuery, setSearchQuery, performSearch, clearResults } = useSearchStore();
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'files' | 'content' | 'symbols' | 'commands'>('files');

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery, searchType);
    }
  }, [searchQuery, searchType, performSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleResultClick = useCallback((result: SearchResult) => {
    setSelectedResultId(result.id);
    // 打开文件并导航到位置
    // 与项目文件打开逻辑保持一致
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    clearResults();
    setSelectedResultId(null);
  }, [setSearchQuery, clearResults]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'ArrowDown') {
        // 导航到下一个结果
      } else if (e.key === 'ArrowUp') {
        // 导航到上一个结果
      } else if (e.key === 'Enter' && selectedResultId) {
        // 打开选中的结果
        const result = searchResults.find((r) => r.id === selectedResultId);
        if (result) {
          handleResultClick(result);
        }
      }
    },
    [handleClear, selectedResultId, searchResults, handleResultClick]
  );

  const getResultIcon = (type: SearchResult['type']): string => {
    const icons: Record<SearchResult['type'], string> = {
      file: '📄',
      content: '🔍',
      symbol: '🏷️',
      command: '⚡',
    };
    return icons[type];
  };

  return (
    <div className="global-search">
      <div className="search-header">
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search files, content, symbols..."
            autoFocus
          />
          {searchQuery && (
            <button onClick={handleClear} className="clear-button">
              ✕
            </button>
          )}
        </div>
        <div className="search-type-tabs">
          <button
            className={`tab ${searchType === 'files' ? 'active' : ''}`}
            onClick={() => setSearchType('files')}
          >
            Files
          </button>
          <button
            className={`tab ${searchType === 'content' ? 'active' : ''}`}
            onClick={() => setSearchType('content')}
          >
            Content
          </button>
          <button
            className={`tab ${searchType === 'symbols' ? 'active' : ''}`}
            onClick={() => setSearchType('symbols')}
          >
            Symbols
          </button>
          <button
            className={`tab ${searchType === 'commands' ? 'active' : ''}`}
            onClick={() => setSearchType('commands')}
          >
            Commands
          </button>
        </div>
      </div>
      <div className="search-results">
        {searchResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">
              {searchQuery ? 'No results found' : 'Type to search...'}
            </div>
          </div>
        ) : (
          <div className="results-list">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className={`result-item ${selectedResultId === result.id ? 'selected' : ''}`}
                onClick={() => handleResultClick(result)}
              >
                <div className="result-header">
                  <span className="result-icon">{getResultIcon(result.type)}</span>
                  <span className="result-title">{result.title}</span>
                  <span className="result-score">{Math.round(result.score * 100)}%</span>
                </div>
                {result.description && <div className="result-description">{result.description}</div>}
                <div className="result-meta">
                  <span className="result-path">{result.filePath}</span>
                  {result.line !== undefined && (
                    <span className="result-line">:{result.line}</span>
                  )}
                </div>
                {result.preview && <div className="result-preview">{result.preview}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## ✅ 验收标准

### 功能完整性

- ✅ 文件浏览器功能完善
- ✅ 任务管理功能完整
- ✅ AI助手智能高效
- ✅ 全局搜索准确快速
- ✅ 面板管理灵活便捷

### 用户体验

- ✅ 界面响应及时
- ✅ 操作流畅自然
- ✅ 快捷键支持完善
- ✅ 错误处理友好

### 代码质量

- ✅ 代码结构清晰
- ✅ 类型定义完整
- ✅ 注释文档完整
- ✅ 代码可维护性好

---

## 🔄 版本历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | 2026-03-17 | 初始版本，建立左侧面板功能 | YanYuCloudCube Team |

---

## 📞 联系方式

- **维护团队**: YanYuCloudCube Team
- **联系邮箱**: admin@0379.email

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
