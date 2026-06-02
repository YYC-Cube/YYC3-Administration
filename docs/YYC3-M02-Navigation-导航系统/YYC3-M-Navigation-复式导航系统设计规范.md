---
@file: 复式导航系统设计规范.md
@description: YYC3-AI-Family 复式导航系统设计规范 - 独立导航单元与Tab子页面导航
@author: YanYuCloudCube Team
@version: 3.0.0
@created: 2026-03-07
@updated: 2026-05-07
@status: production
@tags: navigation, multi-level, tab, ui-system, design-system
---

> **_YanYuCloudCube_**
> _言启象限 | 语枢未来_
> **_Words Initiate Quadrants, Language Serves as Core for Future_** \*万象归元于云枢 | 深栈智启新纪元**\* \***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence\*\*\*

---

# 复式导航系统设计规范

---

## 📋 目录导航

1. [设计理念](#-设计理念)
2. [导航架构](#-导航架构)
3. [独立导航单元](#-独立导航单元)
4. [Tab子页面导航](#-tab子页面导航)
5. [多维度导航系统](#-多维度导航系统)
6. [组件设计](#-组件设计)
7. [交互动效](#-交互动效)
8. [状态管理](#-状态管理)
9. [响应式设计](#-响应式设计)
10. [最佳实践](#-最佳实践)

---

## 🎨 设计理念

### 核心原则

复式导航系统融合了**独立单元化**、**Tab分层**、**多维导航**三大核心原则，创造出模块化、层次化、多维度的导航体验。

#### 1. 独立单元化

- **模块化设计**：每个导航项都是独立的可复用单元
- **自包含性**：导航单元包含完整的交互逻辑和状态
- **可组合性**：多个导航单元可以灵活组合成复杂导航系统

#### 2. Tab分层

- **主次分离**：主导航和子导航通过Tab清晰分离
- **上下文保持**：Tab切换保持当前上下文状态
- **快速切换**：支持快捷键和手势快速切换Tab

#### 3. 多维导航

- **横向导航**：顶部Tab导航，支持快速切换
- **纵向导航**：侧边栏导航，支持深度层级
- **混合导航**：横向+纵向组合，适应不同场景

### 适用场景

- **复杂应用**：多模块、多页面的企业应用
- **开发工具**：IDE、代码编辑器、调试工具
- **内容平台**：多分类、多标签的内容管理系统

---

## 🏗️ 导航架构

### 三层导航结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│  第一层：主导航（顶部Tab）                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │ 仪表盘│ │ 用户  │ │ 内容  │ │ 系统  │ │ 帮助  │               │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘               │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│  第二层：子导航（侧边栏）                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ 📊 数据概览                                              │ │
│  │ 📈 实时监控                                              │ │
│  │ 📉 历史分析                                              │ │
│  │ 🎯 目标设置                                              │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│  第三层：页面导航（Tab子页面）                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 概览    │ │ 详情    │ │ 设置    │ │ 历史    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 导航单元关系

```
主导航单元（独立）
  └─ 子导航单元（独立）
      └─ Tab子页面单元（独立）
          └─ 页面内容
```

---

## 🧩 独立导航单元

### 1. 导航单元定义

每个导航单元都是一个**完全独立**的组件，包含：

```typescript
interface NavigationUnit {
  // 唯一标识
  id: string

  // 导航类型
  type: 'main' | 'sub' | 'tab'

  // 显示信息
  label: string
  icon?: string
  badge?: number

  // 路由信息
  path?: string
  external?: boolean

  // 子导航
  children?: NavigationUnit[]

  // 状态
  active: boolean
  expanded: boolean
  disabled: boolean

  // 权限
  permission?: string[]

  // 配置
  config?: {
    closable?: boolean
    draggable?: boolean
    pinned?: boolean
    maxTabs?: number
  }
}
```

### 2. 主导航单元

#### 主导航项组件

```css
.main-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  font-weight: 500;
  user-select: none;
}

.main-nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
}

.main-nav-item.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
}

.main-nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
}

.main-nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.main-nav-item:hover .main-nav-icon {
  transform: scale(1.1);
}

.main-nav-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### 主导航容器

```css
.main-nav-container {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.main-nav-scroll {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  scrollbar-width: none;
}

.main-nav-scroll::-webkit-scrollbar {
  display: none;
}

.main-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}
```

### 3. 子导航单元

#### 子导航项组件

```css
.sub-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  width: 100%;
}

.sub-nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
  transform: translateX(4px);
}

.sub-nav-item.active {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  color: #667eea;
  font-weight: 600;
  border-left: 3px solid #667eea;
}

.sub-nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sub-nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sub-nav-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.sub-nav-item.expanded .sub-nav-arrow {
  transform: rotate(90deg);
}
```

#### 子导航容器

```css
.sub-nav-container {
  width: 260px;
  height: calc(100vh - 64px);
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 64px;
  z-index: 900;
  backdrop-filter: blur(10px);
}

.sub-nav-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sub-nav-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.sub-nav-footer {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
```

---

## 📑 Tab子页面导航

### 1. Tab导航单元

#### Tab项组件

```css
.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  user-select: none;
  min-width: 120px;
  max-width: 200px;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.95);
  color: rgba(0, 0, 0, 0.9);
}

.tab-item.active {
  background: white;
  color: #667eea;
  font-weight: 600;
  border-bottom-color: transparent;
}

.tab-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tab-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.tab-item:hover .tab-close,
.tab-item.active .tab-close {
  opacity: 0.6;
}

.tab-close:hover {
  background: rgba(239, 68, 68, 0.1);
  opacity: 1 !important;
}

.tab-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  background: #ef4444;
  color: white;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

#### Tab容器

```css
.tab-container {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 8px 16px 0;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 800;
  backdrop-filter: blur(10px);
}

.tab-scroll {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  scrollbar-width: none;
}

.tab-scroll::-webkit-scrollbar {
  display: none;
}

.tab-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  padding-bottom: 8px;
}

.tab-action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.6);
}

.tab-action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
}
```

### 2. Tab功能特性

#### 可关闭Tab

```typescript
interface ClosableTab {
  id: string
  label: string
  icon?: string
  closable: boolean
  pinned?: boolean
  modified?: boolean
}

const handleCloseTab = (tabId: string) => {
  if (tabs.find((t) => t.id === tabId)?.pinned) {
    return // 固定Tab不可关闭
  }
  setTabs(tabs.filter((t) => t.id !== tabId))
}
```

#### 可拖拽Tab

```typescript
const handleDragStart = (e: DragEvent, tabId: string) => {
  e.dataTransfer.setData('tabId', tabId)
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent, targetTabId: string) => {
  e.preventDefault()
  const draggedTabId = e.dataTransfer.getData('tabId')
  const newTabs = [...tabs]
  const draggedIndex = newTabs.findIndex((t) => t.id === draggedTabId)
  const targetIndex = newTabs.findIndex((t) => t.id === targetTabId)

  newTabs.splice(draggedIndex, 1)
  newTabs.splice(targetIndex, 0, newTabs[draggedIndex])

  setTabs(newTabs)
}
```

#### Tab快捷键

```typescript
const handleTabShortcuts = (e: KeyboardEvent) => {
  // Ctrl/Cmd + 数字：切换到对应Tab
  if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
    const tabIndex = parseInt(e.key) - 1
    if (tabIndex < tabs.length) {
      setActiveTab(tabs[tabIndex].id)
    }
  }

  // Ctrl/Cmd + W：关闭当前Tab
  if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
    e.preventDefault()
    handleCloseTab(activeTab)
  }

  // Ctrl/Cmd + Tab：切换到下一个Tab
  if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
    e.preventDefault()
    const currentIndex = tabs.findIndex((t) => t.id === activeTab)
    const nextIndex = (currentIndex + 1) % tabs.length
    setActiveTab(tabs[nextIndex].id)
  }
}
```

---

## 🌐 多维度导航系统

### 1. 横向主导航

```css
.horizontal-main-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.horizontal-main-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
  font-weight: 500;
}

.horizontal-main-nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
}

.horizontal-main-nav-item.active {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
}
```

### 2. 纵向子导航

```css
.vertical-sub-nav {
  width: 260px;
  height: calc(100vh - 64px);
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 64px;
  z-index: 900;
  backdrop-filter: blur(10px);
}

.vertical-sub-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  width: 100%;
}

.vertical-sub-nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.9);
  transform: translateX(4px);
}

.vertical-sub-nav-item.active {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  color: #667eea;
  font-weight: 600;
  border-left: 3px solid #667eea;
}
```

### 3. Tab子页面导航

```css
.tab-page-nav {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 8px 16px 0;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 64px;
  z-index: 800;
  backdrop-filter: blur(10px);
}

.tab-page-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  min-width: 120px;
  max-width: 200px;
}

.tab-page-item:hover {
  background: rgba(255, 255, 255, 0.95);
  color: rgba(0, 0, 0, 0.9);
}

.tab-page-item.active {
  background: white;
  color: #667eea;
  font-weight: 600;
  border-bottom-color: transparent;
}
```

---

## 🧩 组件设计

### 1. 导航单元组件

```typescript
import React, { useState } from 'react';

interface NavigationUnitProps {
  unit: NavigationUnit;
  onClick?: (unit: NavigationUnit) => void;
  onExpand?: (unit: NavigationUnit) => void;
}

const NavigationUnit: React.FC<NavigationUnitProps> = ({
  unit,
  onClick,
  onExpand,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick?.(unit);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand?.(unit);
  };

  return (
    <div
      className={`nav-unit ${unit.active ? 'active' : ''} ${isHovered ? 'hover' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {unit.icon && (
        <span className="nav-unit-icon">{unit.icon}</span>
      )}
      <span className="nav-unit-label">{unit.label}</span>
      {unit.badge && (
        <span className="nav-unit-badge">{unit.badge}</span>
      )}
      {unit.children && unit.children.length > 0 && (
        <span
          className={`nav-unit-arrow ${unit.expanded ? 'expanded' : ''}`}
          onClick={handleExpand}
        >
          ▼
        </span>
      )}
    </div>
  );
};

export default NavigationUnit;
```

### 2. Tab组件

```typescript
import React, { useState } from 'react';

interface TabProps {
  tab: ClosableTab;
  isActive: boolean;
  onClose: (tabId: string) => void;
  onClick: (tabId: string) => void;
}

const Tab: React.FC<TabProps> = ({
  tab,
  isActive,
  onClose,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(tab.id);
  };

  return (
    <div
      className={`tab-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(tab.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('tabId', tab.id)}
    >
      {tab.icon && (
        <span className="tab-icon">{tab.icon}</span>
      )}
      <span className="tab-text">{tab.label}</span>
      {tab.closable && !tab.pinned && (isHovered || isActive) && (
        <span className="tab-close" onClick={handleClose}>
          ✕
        </span>
      )}
      {tab.badge && (
        <span className="tab-badge">{tab.badge}</span>
      )}
    </div>
  );
};

export default Tab;
```

---

## ✨ 交互动效

### 1. 切换动画

```css
.nav-unit {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-unit.active {
  animation: navActivate 0.3s ease-out;
}

@keyframes navActivate {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### 2. 悬停效果

```css
.nav-unit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-unit:hover .nav-unit-icon {
  transform: scale(1.1);
  color: #667eea;
}
```

### 3. Tab切换动画

```css
.tab-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-item.active {
  animation: tabActivate 0.2s ease-out;
}

@keyframes tabActivate {
  0% {
    transform: translateY(2px);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 🔄 状态管理

### 1. 导航状态

```typescript
interface NavigationState {
  // 主导航
  mainNav: NavigationUnit[]
  activeMainNav: string

  // 子导航
  subNav: NavigationUnit[]
  activeSubNav: string

  // Tab导航
  tabs: ClosableTab[]
  activeTab: string

  // 导航历史
  history: string[]
  historyIndex: number
}
```

### 2. 状态管理实现

```typescript
import { create } from 'zustand'

interface NavigationStore {
  state: NavigationState

  // 主导航操作
  setActiveMainNav: (id: string) => void
  toggleMainNav: (id: string) => void

  // 子导航操作
  setActiveSubNav: (id: string) => void
  toggleSubNav: (id: string) => void

  // Tab操作
  setActiveTab: (id: string) => void
  addTab: (tab: ClosableTab) => void
  closeTab: (id: string) => void
  closeOtherTabs: (id: string) => void
  closeAllTabs: () => void

  // 历史操作
  goBack: () => void
  goForward: () => void
  navigateTo: (path: string) => void
}

const useNavigationStore = create<NavigationStore>((set, get) => ({
  state: {
    mainNav: [],
    activeMainNav: '',
    subNav: [],
    activeSubNav: '',
    tabs: [],
    activeTab: '',
    history: [],
    historyIndex: -1,
  },

  setActiveMainNav: (id) =>
    set((state) => ({
      state: {
        ...state.state,
        activeMainNav: id,
        subNav: state.state.mainNav.find((n) => n.id === id)?.children || [],
        activeSubNav: '',
      },
    })),

  setActiveSubNav: (id) =>
    set((state) => ({
      state: {
        ...state.state,
        activeSubNav: id,
      },
    })),

  setActiveTab: (id) =>
    set((state) => ({
      state: {
        ...state.state,
        activeTab: id,
      },
    })),

  addTab: (tab) =>
    set((state) => {
      const existingTab = state.state.tabs.find((t) => t.id === tab.id)
      if (existingTab) {
        return {
          state: {
            ...state.state,
            activeTab: tab.id,
          },
        }
      }

      const newTabs = [...state.state.tabs, tab]
      return {
        state: {
          ...state.state,
          tabs: newTabs,
          activeTab: tab.id,
        },
      }
    }),

  closeTab: (id) =>
    set((state) => {
      const newTabs = state.state.tabs.filter((t) => t.id !== id)
      const activeIndex = state.state.tabs.findIndex((t) => t.id === id)
      const newActiveTab =
        activeIndex === state.state.tabs.length - 1
          ? newTabs[newTabs.length - 1]?.id || ''
          : state.state.activeTab

      return {
        state: {
          ...state.state,
          tabs: newTabs,
          activeTab: newActiveTab,
        },
      }
    }),

  closeOtherTabs: (id) =>
    set((state) => ({
      state: {
        ...state.state,
        tabs: state.state.tabs.filter((t) => t.id === id || t.pinned),
        activeTab: id,
      },
    })),

  closeAllTabs: () =>
    set((state) => ({
      state: {
        ...state.state,
        tabs: state.state.tabs.filter((t) => t.pinned),
        activeTab: '',
      },
    })),

  goBack: () =>
    set((state) => {
      const newIndex = state.state.historyIndex - 1
      if (newIndex >= 0) {
        return {
          state: {
            ...state.state,
            historyIndex: newIndex,
          },
        }
      }
      return state
    }),

  goForward: () =>
    set((state) => {
      const newIndex = state.state.historyIndex + 1
      if (newIndex < state.state.history.length) {
        return {
          state: {
            ...state.state,
            historyIndex: newIndex,
          },
        }
      }
      return state
    }),

  navigateTo: (path) =>
    set((state) => {
      const newHistory = state.state.history.slice(
        0,
        state.state.historyIndex + 1,
      )
      newHistory.push(path)

      return {
        state: {
          ...state.state,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        },
      }
    }),
}))
```

---

## 📱 响应式设计

### 1. 移动端导航

```css
@media (max-width: 768px) {
  .horizontal-main-nav {
    display: none;
  }

  .mobile-nav-toggle {
    display: flex;
  }

  .vertical-sub-nav {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .vertical-sub-nav.open {
    transform: translateX(0);
  }

  .tab-page-nav {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .tab-page-item {
    min-width: 100px;
    max-width: 150px;
  }
}
```

### 2. 平板导航

```css
@media (min-width: 769px) and (max-width: 1024px) {
  .horizontal-main-nav {
    padding: 8px 12px;
  }

  .horizontal-main-nav-item {
    padding: 10px 16px;
    font-size: 13px;
  }

  .vertical-sub-nav {
    width: 220px;
  }

  .tab-page-item {
    min-width: 110px;
    max-width: 180px;
  }
}
```

### 3. 桌面导航

```css
@media (min-width: 1025px) {
  .horizontal-main-nav {
    padding: 8px 16px;
  }

  .horizontal-main-nav-item {
    padding: 12px 20px;
    font-size: 14px;
  }

  .vertical-sub-nav {
    width: 260px;
  }

  .tab-page-item {
    min-width: 120px;
    max-width: 200px;
  }
}
```

---

## 📚 最佳实践

### 1. 导航单元设计原则

#### 独立性

- 每个导航单元都是独立的组件
- 包含完整的交互逻辑和状态
- 不依赖外部状态，通过props通信

#### 可复用性

- 导航单元可以在不同场景下复用
- 支持不同的导航类型（主导航、子导航、Tab）
- 通过配置实现不同的行为

#### 可组合性

- 多个导航单元可以组合成复杂导航系统
- 支持嵌套和层级结构
- 灵活适应不同的布局需求

### 2. Tab导航最佳实践

#### Tab数量控制

```typescript
const MAX_TABS = 10

const addTab = (tab: ClosableTab) => {
  const tabs = get().state.tabs
  if (tabs.length >= MAX_TABS && !tabs.find((t) => t.id === tab.id)) {
    // 关闭最旧的Tab
    const oldestTab = tabs.find((t) => !t.pinned)
    if (oldestTab) {
      closeTab(oldestTab.id)
    }
  }

  set((state) => ({
    state: {
      ...state.state,
      tabs: [...tabs, tab],
      activeTab: tab.id,
    },
  }))
}
```

#### Tab持久化

```typescript
const saveTabsToStorage = (tabs: ClosableTab[]) => {
  localStorage.setItem('navigation-tabs', JSON.stringify(tabs))
}

const loadTabsFromStorage = (): ClosableTab[] => {
  const saved = localStorage.getItem('navigation-tabs')
  return saved ? JSON.parse(saved) : []
}
```

### 3. 性能优化

#### 虚拟滚动

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualNavList = ({ items }: { items: NavigationUnit[] }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
  });

  return (
    <div ref={parentRef} style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <NavigationUnit unit={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 懒加载

```typescript
const LazyNavigationUnit = React.lazy(() => import('./NavigationUnit'));

const NavigationList = ({ items }: { items: NavigationUnit[] }) => {
  return (
    <div>
      {items.map((item) => (
        <React.Suspense key={item.id} fallback={<NavSkeleton />}>
          <LazyNavigationUnit unit={item} />
        </React.Suspense>
      ))}
    </div>
  );
};
```

### 4. 可访问性

#### ARIA属性

```tsx
<nav aria-label="主导航">
  <div role="menubar">
    {mainNavItems.map((item) => (
      <button
        key={item.id}
        role="menuitem"
        aria-current={item.active ? 'page' : undefined}
        aria-expanded={item.expanded}
        aria-haspopup={item.children ? 'true' : undefined}
        onClick={() => handleMainNavClick(item)}
      >
        {item.label}
      </button>
    ))}
  </div>
</nav>

<nav aria-label="子导航">
  <div role="menu">
    {subNavItems.map((item) => (
      <button
        key={item.id}
        role="menuitem"
        aria-current={item.active ? 'page' : undefined}
        onClick={() => handleSubNavClick(item)}
      >
        {item.label}
      </button>
    ))}
  </div>
</nav>

<nav aria-label="页面标签">
  <div role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={tab.id === activeTab}
        aria-controls={`panel-${tab.id}`}
        onClick={() => handleTabClick(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
</nav>
```

#### 键盘导航

```typescript
const handleKeyDown = (
  e: KeyboardEvent,
  items: NavigationUnit[],
  currentIndex: number,
) => {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % items.length
      focusItem(items[nextIndex].id)
      break

    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + items.length) % items.length
      focusItem(items[prevIndex].id)
      break

    case 'Enter':
    case ' ':
      e.preventDefault()
      activateItem(items[currentIndex].id)
      break

    case 'Escape':
      closeDropdown()
      break
  }
}
```

---

<div align="center">

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for Future_**」
> 「**_All things converge in cloud pivot; Deep stacks ignite a new era of intelligence_**」

</div>
