# YYC³ Administration — 本地开发衔接指南

<div align="center">

> **YYC-Cube**
> **言启千行代码 · 语枢万物智能**
> **Words Inspire Thousands Lines of Code, Language Pivots the Intelligence of All Things**

</div>

---

**文档版本**: v1.0.2
**最后更新**: 2026-07-12
**维护团队**: YYC-Cube Team <admin@0379.email>

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈清单](#2-技术栈清单)
3. [环境准备](#3-环境准备)
4. [项目架构](#4-项目架构)
5. [核心模块说明](#5-核心模块说明)
6. [开发工作区 (Developer Workspace)](#6-开发工作区)
7. [AI API 代理服务部署](#7-ai-api-代理服务部署)
8. [Git API 集成](#8-git-api-集成)
9. [Monaco Editor 集成](#9-monaco-editor-集成)
10. [测试体系](#10-测试体系)
11. [主题系统](#11-主题系统)
12. [国际化 (i18n)](#12-国际化)
13. [状态管理](#13-状态管理)
14. [五点集成规范](#14-五点集成规范)
15. [CI/CD 流水线](#cicd-流水线)
16. [部署指南](#16-部署指南)
17. [常见问题](#17-常见问题)
18. [下阶段开发建议](#18-下阶段开发建议)

---

## 1. 项目概述

**YYC³ Administration**（包名：`@yyc3/my-mgmt`）是一款基于 **React 18 + TypeScript + Vite 6** 构建的现代化 **AI 营销自动化终端系统**，专为服务行业设计的 **企业级全维度管理平台**。

平台遵循 **"五高五标五化"** 架构理念（五高架构 · 五标体系 · 五化转型 · 五维评估），集成多模型 AI 能力、双主题引擎、全维度数据驾驶舱和开发者工作区，实现了从客户获取到忠诚管理的全生命周期闭环。

### 核心特性

- **IDE 风格开发者工作区** — 6 面板切换 + Monaco Editor + AI 助手 + Git 集成
- **AI 多 Provider 支持** — OpenAI / Claude / DeepSeek / Qwen / Mock
- **完整 CRUD 文件系统** — 新建/重命名/删除 + 右键上下文菜单
- **GitHub REST API 集成** — Commits / Branches / Files / PRs
- **AI 上下文增强** — 当前编辑文件内容自动注入 AI 系统提示词
- **双主题引擎** — Cyberpunk 霓虹风格 + Liquid Glass 液态玻璃，实时切换与深度定制
- **国际化 (i18n)** — 10 种语言（zh/zh-TW/en/ja/ko/ar/de/es/fr/pt-BR），ICU 消息格式
- **Zustand 持久化** — 所有配置和状态同步 localStorage
- **PWA 全端适配** — 可安装至桌面/移动端，离线支持
- **完整测试体系** — 864 单元测试 + 62 E2E 测试

---

## 2. 技术栈清单

| 类别           | 技术                      | 版本     |
| -------------- | ------------------------- | -------- |
| **框架**       | React                     | 18.3.1   |
| **语言**       | TypeScript                | 5.x      |
| **构建**       | Vite                      | 6.3.5    |
| **样式**       | Tailwind CSS v4           | 4.1.12   |
| **动画**       | Motion (Framer Motion)    | 12.23.24 |
| **状态管理**   | Zustand                   | 5.0.12   |
| **UI 组件库**  | shadcn/ui + Radix UI      | Latest   |
| **MUI**        | @mui/material             | 7.3.5    |
| **代码编辑器** | @monaco-editor/react      | 4.7.x    |
| **图表**       | Recharts                  | 2.15     |
| **拖拽**       | react-dnd + html5-backend | 16.x     |
| **面板调整**   | re-resizable              | 6.11.2   |
| **日期处理**   | date-fns                  | 3.6.0    |
| **表单**       | react-hook-form           | 7.55.0   |
| **单元测试**   | Vitest                    | Latest   |
| **E2E 测试**   | Playwright                | Latest   |
| **包管理**     | pnpm                      | ≥11      |
| **PWA**        | vite-plugin-pwa           | Latest   |
| **图标**       | lucide-react              | 0.487.0  |

### 生产依赖（关键项）

```bash
@monaco-editor/react    # Monaco Editor React 封装
zustand                  # 轻量级状态管理
motion                   # 动画库（import from 'motion/react'）
re-resizable             # 面板拖拽调整
react-dnd                # 拖拽排序
recharts                 # 数据可视化
lucide-react             # 图标库
@mui/material            # Material UI 组件库
date-fns                 # 日期工具库
react-hook-form          # 表单管理
react-markdown           # Markdown 渲染
cmdk                     # 命令面板
embla-carousel-react     # 轮播组件
```

---

## 3. 环境准备

### 前置条件

```bash
# Node.js >= 22.x (pnpm v11 要求 Node ≥22.13)
node --version  # 确认 >= 22.13

# pnpm >= 11
npm install -g pnpm
pnpm --version  # 确认 >= 11.0
```

### 克隆 & 启动

```bash
# 1. 克隆项目
git clone https://github.com/YYC-Cube/YYC3-Administration.git
cd YYC3-Administration

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
# 访问 http://localhost:3171

# 4. 构建生产版本
pnpm build
```

### 环境变量（可选）

复制 `.env.example` 为 `.env` 并根据需要调整：

```bash
cp .env.example .env
```

```env
# Application
VITE_APP_TITLE=YYC³ AI Marketing Terminal
VITE_APP_VERSION=1.0.2

# API Configuration (Development)
VITE_AI_API_BASE_URL=http://localhost:3001/api/ai
VITE_GITHUB_API_BASE_URL=https://api.github.com

# Feature Flags
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=true

# Theme Defaults
VITE_DEFAULT_THEME=cyberpunk
VITE_DEFAULT_LANGUAGE=zh-CN

# Performance
VITE_CACHE_TTL=3600000  # 1 hour in milliseconds
VITE_RATE_LIMIT_RPS=10  # requests per second

# Development Only
VITE_DEBUG_MODE=true
VITE_MOCK_API_DELAY=500  # ms
```

> **安全提示**：不要在 `VITE_` 前缀变量中放置敏感信息（API Key、Token 等），它们会在构建时被嵌入前端代码。生产环境应使用后端代理。

---

## 4. 项目架构

```
YYC3-Administration/
├── docs/                               # 项目文档（M01-M13 模块文档）
├── src/
│   ├── main.tsx                        # 应用入口
│   ├── app/
│   │   ├── App.tsx                     # 主入口
│   │   ├── components/
│   │   │   ├── cyberpunk-standalone.tsx # 🎯 主容器（PageId 路由）
│   │   │   ├── cyberpunk-widget.tsx    # Widget 模式
│   │   │   ├── app-context.tsx         # 全局上下文（PageId 类型）
│   │   │   ├── left-panel-page.tsx     # 开发者工作区 (IDE)
│   │   │   ├── code-editor.tsx         # Monaco Editor 封装
│   │   │   ├── task-board-page.tsx     # AI 任务看板
│   │   │   ├── command-palette.tsx     # 命令面板 (Ctrl+K)
│   │   │   ├── preload-fix.tsx         # 预加载系统
│   │   │   ├── i18n-context.tsx        # 国际化上下文
│   │   │   ├── theme-switcher-context.tsx # 主题切换
│   │   │   ├── auth-context.tsx        # 认证上下文
│   │   │   ├── contacts-context.tsx    # CRM 上下文
│   │   │   ├── ai-model-context.tsx    # AI 模型管理
│   │   │   ├── nav-config.ts           # 导航配置中心
│   │   │   ├── error-boundary.tsx      # 错误边界
│   │   │   ├── services/              # 服务层
│   │   │   │   ├── ai-proxy-service.ts # AI API 代理服务
│   │   │   │   ├── git-api-service.ts  # Git API 服务
│   │   │   │   ├── edge-proxy-server.ts # Edge Function 设计
│   │   │   │   └── test-utils.ts       # 测试工具函数
│   │   │   ├── hooks/
│   │   │   │   ├── use-theme-colors.ts # 🎨 tc.* 主题令牌
│   │   │   │   └── use-theme-tokens.ts # 主题 tokens
│   │   │   ├── ui/                     # shadcn/ui 组件库（48 个）
│   │   │   ├── panels/                # 开发工作台面板（7 个）
│   │   │   ├── settings/              # 设置面板（10 个）
│   │   │   ├── advanced/              # 高级功能
│   │   │   ├── figma/                 # 设计资产
│   │   │   ├── dashboard-page.tsx     # 数据驾驶舱
│   │   │   ├── finance-page.tsx       # 财务管理
│   │   │   ├── salary-page.tsx        # 薪资系统
│   │   │   ├── ...                    # 其他 50+ 页面组件
│   │   │   ├── yyc3-theme-integration.ts    # YYC³ 主题集成
│   │   │   ├── yyc3-components-integration.tsx # YYC³ 组件集成
│   │   │   ├── yyc3-emotion-integration.ts   # 情感引擎集成
│   │   │   ├── yyc3-motion-integration.tsx   # 动效系统集成
│   │   │   └── yyc3-mcp-integration.ts       # MCP 服务集成
│   │   └── locales/                   # 应用层国际化
│   ├── lib/i18n/                      # i18n 核心引擎
│   ├── multi-end/                     # 多端适配模块
│   ├── stores/                        # Zustand 全局状态
│   ├── services/                      # 全局服务
│   ├── types/                         # 全局类型声明
│   ├── hooks/                         # 全局自定义 Hooks
│   └── styles/
│       ├── index.css                  # 全局样式
│       └── themes/                    # 主题样式
├── tests/
│   ├── playwright.config.ts           # Playwright 配置
│   ├── setup.ts                       # 测试全局设置
│   ├── components/                    # 组件测试（18 文件）
│   ├── e2e/                           # E2E 测试（5 文件，62 用例）
│   ├── hooks/                         # Hook 测试
│   ├── lib/                           # 工具库测试
│   ├── multi-end/                     # 多端适配测试
│   └── services/                      # 服务层测试（9 文件）
├── public/
│   ├── CNAME                          # admin.yyc3.vip
│   └── yyc3-icons/                    # PWA 全平台图标
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     # CI 质量门禁
│   │   └── deploy.yml                 # GitHub Pages 部署
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── Dockerfile                         # Docker 部署（node:22-alpine）
├── docker-compose.yml                 # Docker Compose 配置
└── package.json
```

---

## 5. 核心模块说明

### 页面路由系统

项目使用 `PageId` 类型 + `activePage` 状态进行页面切换渲染：

```typescript
// app-context.tsx 中定义
type PageId =
  | 'dashboard'
  | 'devWorkspace' // 开发者工作区
  | 'taskBoard' // AI 任务看板
  | 'aiTools' // AI 工具
  | 'settings' // 设置
// ... 20+ 页面 ID
```

### 主入口流程

```
App.tsx → cyberpunk-standalone.tsx → activePage 状态 → renderPage() → 各页面组件
```

---

## 6. 开发工作区

文件: `/src/app/components/left-panel-page.tsx`

### 面板架构

```
┌──────────┬──────────────────┬────────────────────────────────┐
│ Activity │   Panel Content  │        Monaco Editor           │
│   Bar    │   (Resizable)    │   (Syntax Highlight + AI)      │
│          │                  │                                │
│ [Files]  │ File Explorer    │  ┌─ Tab Bar ──────────────┐    │
│ [Tasks]  │ Task Manager     │  │ App.tsx  x              │    │
│ [AI]     │ AI Assistant     │  ├─────────────────────────┤    │
│ [Search] │ Global Search    │  │                         │    │
│ [Quick]  │ Quick Access     │  │  Monaco Editor          │    │
│ [Git]    │ Git Integration  │  │  (IntelliSense)         │    │
│          │                  │  │                         │    │
│          │  200px–600px     │  ├─ Status Bar ────────────┤    │
│          │  (draggable)     │  │ Ln 1, Col 1 │ TS │ UTF-8│    │
└──────────┴──────────────────┴──────────────────────────────┘
```

### 6 大面板

| 面板            | 功能                           | 快捷键 |
| --------------- | ------------------------------ | ------ |
| File Explorer   | 文件树 CRUD + 右键菜单         | Ctrl+E |
| Task Manager    | 任务看板集成 + 状态筛选        | -      |
| AI Assistant    | 多 Provider 对话 + 文件上下文  | -      |
| Global Search   | 文件/内容/符号/命令 搜索       | Ctrl+P |
| Quick Access    | 最近文件 + 收藏夹              | -      |
| Git Integration | Status/Log/Config + GitHub API | -      |

### AI 上下文增强

当用户在 Monaco Editor 中打开文件时，AI 助手会自动将当前文件内容（最多 6000 字符）注入系统提示词：

```typescript
// ai-proxy-service.ts
async chat(config, messages, signal, fileContext?) {
  let systemPrompt = SYSTEM_PROMPT;
  if (fileContext?.content) {
    systemPrompt += `\n\n--- CURRENT OPEN FILE ---\nFile: ${fileContext.filePath}\n...`;
  }
}
```

这使得 AI 能理解当前代码上下文，提供更精准的建议。

---

## 7. AI API 代理服务部署

### 架构设计

由于项目当前通过 **GitHub Pages 纯静态托管**，不支持服务端运行时，AI API 代理有两种模式：

```
浏览器 (ai-proxy-service.ts)
    │
    ├── 开发模式: 直连 AI Provider API (API Key 在浏览器侧)
    │             适用于本地开发调试
    │
    └── 生产模式: 需要独立部署后端代理服务
                  推荐方案: Node.js/Express 服务
```

### 推荐部署方案：独立 Node.js/Express 服务

```bash
# 1. 新建独立后端项目
mkdir yyc3-ai-proxy && cd yyc3-ai-proxy
npm init -y
npm install express cors dotenv

# 2. 复制代理代码
cp ../YYC3-Administration/src/app/components/services/edge-proxy-server.ts ./server.ts

# 3. 创建 Express 入口
cat > index.js << 'EOF'
const express = require('express');
const { handler } = require('./server');
const app = express();
app.use(express.json());
app.post('/api/ai-proxy/chat', async (req, res) => {
  const request = new Request('http://localhost/api/ai-proxy/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  });
  const response = await handler(request);
  const data = await response.json();
  res.status(response.status).json(data);
});
app.listen(3001, () => console.log('YYC³ AI Proxy on :3001'));
EOF

# 4. 部署并配置前端
# 在 ai-proxy-service.ts 中将 PROXY_BASE_URL 指向部署地址
```

### 安全特性

| 特性         | 说明                                      |
| ------------ | ----------------------------------------- |
| API Key 保护 | 存储在服务端环境变量，不暴露到浏览器      |
| 速率限流     | 令牌桶算法，60 req/min per IP             |
| 请求验证     | Provider/Model/Messages 格式校验          |
| 内容长度限制 | 最大 100k 字符 / 50 条消息                |
| CORS 控制    | 生产环境限制 Origin                       |
| 请求签名     | X-Request-Signature header（可升级 HMAC） |
| 审计日志     | 记录 Provider/Model/Token 用量/IP         |

---

## 8. Git API 集成

文件: `/src/app/components/services/git-api-service.ts`

### 支持的操作

| 操作         | API 方法             | GitHub REST API                                |
| ------------ | -------------------- | ---------------------------------------------- |
| 列出提交     | `listCommits()`      | `GET /repos/{owner}/{repo}/commits`            |
| 创建提交     | `createCommit()`     | `PUT /repos/{owner}/{repo}/contents/{path}`    |
| 列出分支     | `listBranches()`     | `GET /repos/{owner}/{repo}/branches`           |
| 创建分支     | `createBranch()`     | `POST /repos/{owner}/{repo}/git/refs`          |
| 获取文件内容 | `getFileContent()`   | `GET /repos/{owner}/{repo}/contents/{path}`    |
| 删除文件     | `deleteFile()`       | `DELETE /repos/{owner}/{repo}/contents/{path}` |
| 列出 PR      | `listPullRequests()` | `GET /repos/{owner}/{repo}/pulls`              |

### 使用方式

```typescript
import { gitAPIService } from './services/git-api-service'

// 1. 配置 (Git 面板 Config 选项卡 或代码中)
gitAPIService.configure({
  token: 'ghp_xxxxxxxxxxxx', // GitHub PAT
  owner: 'YYC-Cube',
  repo: 'YYC3-Administration',
  branch: 'main',
})

// 2. 使用
const commits = await gitAPIService.listCommits(20)
if (commits.success) {
  console.log(commits.data) // GitCommitInfo[]
}
```

### Mock 模式

未配置 Token 或 Token 为 `"YOUR_GITHUB_TOKEN_HERE"` 时，自动使用内置 Mock 数据，无需真实 GitHub 连接即可开发调试。

---

## 9. Monaco Editor 集成

文件: `/src/app/components/code-editor.tsx`

### 特性

| 特性          | 状态                                                            |
| ------------- | --------------------------------------------------------------- |
| 语法高亮      | ✅ TypeScript, JavaScript, JSON, CSS, HTML, Python, Go, Rust... |
| IntelliSense  | ✅ 自动补全 + 方法签名 + 参数提示                               |
| 括号匹配      | ✅ 彩色括号配对                                                 |
| 代码折叠      | ✅ 基于缩进的折叠                                               |
| 搜索/替换     | ✅ Ctrl+F / Ctrl+H                                              |
| 多光标        | ✅ Alt+Click                                                    |
| Minimap       | ✅ 可折叠侧边缩略图                                             |
| YYC³ 暗色主题 | ✅ 自定义 `yyc3-dark` 主题                                      |
| 字号调节      | ✅ 10px–24px + 鼠标滚轮缩放                                     |
| Word Wrap     | ✅ 切换自动换行                                                 |
| Ctrl+S 保存   | ✅ 注册为 Monaco Action                                         |
| 光标位置追踪  | ✅ 状态栏显示 Ln/Col                                            |
| AI 上下文暴露 | ✅ `onEditorReady` 回调暴露内容 getter                          |

### YYC³ Dark Theme 配色

```
关键词:    #c084fc (紫色)
字符串:    #86efac (绿色)
注释:      #6b7280 (灰色，斜体)
数字:      #fbbf24 (金色)
类型:      #67e8f9 (青色)
函数:      #60a5fa (蓝色)
光标:      #00ff87 (YYC³ 主色)
选中:      #00ff87 20% 透明度
行号高亮:  #00ff87
```

### 语言自动检测

根据文件扩展名自动设置 Monaco Editor 语言模式：

```typescript
.ts/.tsx → typescript    .py → python
.js/.jsx → javascript    .go → go
.json    → json          .rs → rust
.css     → css           .sql → sql
.html    → html          .md → markdown
```

---

## 10. 测试体系

### 测试命令

```bash
# 运行所有单元测试
pnpm test

# Watch 模式（开发时）
pnpm test:watch

# 测试覆盖率
pnpm test:coverage

# 运行 E2E 测试
pnpm test:e2e

# E2E UI 模式（可视化调试）
pnpm test:e2e:ui

# 运行特定测试文件
pnpm test tests/services/ai-proxy-service.test.ts

# 多端适配专项测试
pnpm test tests/multi-end
```

### E2E 测试覆盖

| 测试套件              | 用例数 | 覆盖内容                                  |
| --------------------- | ------ | ----------------------------------------- |
| Chat Workflow         | 10     | AI 聊天流程、主题适配、性能               |
| Developer Workspace   | 28     | 面板导航、文件系统、编辑器、AI、Git、重排 |
| Navigation Flow       | 6      | 导航流程、主题切换、响应式                |
| Settings Flow         | 4      | 设置流程、面板操作                        |
| WindowBar Drag & Drop | 14     | 窗口标签页拖放重排、基本交互              |
| **总计**              | **62** |                                           |

### Vitest 单元测试总览

| 测试类型     | 框架   | 文件数 | 用例数  |
| ------------ | ------ | ------ | ------- |
| 组件测试     | Vitest | 18 个  | —       |
| Hook 测试    | Vitest | 5 个   | —       |
| 多端适配测试 | Vitest | 3 个   | —       |
| 服务层测试   | Vitest | 9 个   | —       |
| 工具库测试   | Vitest | 2 个   | —       |
| **合计**     |        | **47** | **864** |

### 测试架构总览

| 层级        | 框架           | 文件位置                   | 用例数         |
| ----------- | -------------- | -------------------------- | -------------- |
| E2E 测试    | Playwright     | `tests/e2e/`               | 62             |
| 单元测试    | Vitest         | `tests/*/`                 | 864            |
| CI 自动执行 | GitHub Actions | `.github/workflows/ci.yml` | 每次 push 触发 |

---

## 11. 主题系统

### useThemeColors Hook

```typescript
import { useThemeColors } from "./hooks/use-theme-colors";

function MyComponent() {
  const tc = useThemeColors();

  return (
    <div style={{
      background: tc.bgBase,       // 页面背景
      color: tc.textPrimary,       // 主要文字
      borderColor: tc.borderDefault, // 边框
    }}>
      <button style={{ background: tc.primary, color: tc.textOnPrimary }}>
        Action
      </button>
    </div>
  );
}
```

### 常用 tc.\* 令牌

| 令牌               | 说明       | Cyberpunk 值         | Liquid Glass 值        |
| ------------------ | ---------- | -------------------- | ---------------------- |
| `tc.primary`       | 主色       | #00ff87              | #00ff87                |
| `tc.bgBase`        | 页面背景   | #0a0f0a              | #0c1210                |
| `tc.bgCard`        | 卡片背景   | rgba(0,255,135,0.05) | rgba(255,255,255,0.08) |
| `tc.bgElevated`    | 浮层背景   | rgba(0,255,135,0.08) | rgba(255,255,255,0.12) |
| `tc.bgInput`       | 输入框背景 | rgba(0,255,135,0.03) | rgba(255,255,255,0.05) |
| `tc.textPrimary`   | 主要文字   | #e2e8f0              | #e2e8f0                |
| `tc.textSecondary` | 次要文字   | #94a3b8              | #94a3b8                |
| `tc.textMuted`     | 弱化文字   | #64748b              | #64748b                |
| `tc.borderDefault` | 默认边框   | rgba(0,255,135,0.15) | rgba(255,255,255,0.1)  |
| `tc.borderSubtle`  | 弱化边框   | rgba(0,255,135,0.08) | rgba(255,255,255,0.06) |

---

## 12. 国际化

### 添加翻译键

文件: `/src/app/components/i18n-context.tsx`

```typescript
// 在 translations 对象中添加：
const translations = {
  zh: {
    // 添加中文翻译
    'myModule.title': '我的模块',
    'myModule.description': '模块描述',
  },
  en: {
    // 添加英文翻译
    'myModule.title': 'My Module',
    'myModule.description': 'Module description',
  },
}
```

### 使用方式

```typescript
import { useI18n } from "./i18n-context";

function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return <h1>{t("myModule.title")}</h1>;
}
```

---

## 13. 状态管理

### Zustand Store 模式

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MyStore {
  count: number
  increment: () => void
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 })),
    }),
    {
      name: 'yyc3-my-store', // localStorage key
      partialize: (state) => ({ count: state.count }), // 仅持久化必要字段
    },
  ),
)
```

### 现有 Store 列表

| Store           | 文件                | localStorage Key       | 用途         |
| --------------- | ------------------- | ---------------------- | ------------ |
| `usePanelStore` | left-panel-page.tsx | `yyc3-ide-panel-store` | IDE 面板状态 |
| `useTaskStore`  | task-board-page.tsx | `yyc3-task-board-v2`   | 任务看板     |
| 其他 Store      | 各模块文件          | `yyc3-*`               | 各模块状态   |

---

## 14. 五点集成规范

每个新页面模块必须完成以下 5 点集成：

### 1. PageId 类型 (`app-context.tsx`)

```typescript
type PageId = '...' | 'myNewPage'
```

### 2. 导航菜单 + 页面渲染 (`cyberpunk-standalone.tsx`)

```typescript
// 导航菜单项
{ id: "myNewPage", label: "My New Page", icon: SomeIcon }

// 渲染分支
case "myNewPage": return <MyNewPage />;
```

### 3. 命令面板 (`command-palette.tsx`)

```typescript
{ id: "nav-myNewPage", label: "Go to My New Page", action: () => setPage("myNewPage") }
```

### 4. 预加载系统 (`preload-fix.tsx`)

```typescript
const MyNewPage = lazy(() => import('./my-new-page'))
```

### 5. i18n 翻译 (`i18n-context.tsx`)

```typescript
zh: { "nav.myNewPage": "我的新页面" },
en: { "nav.myNewPage": "My New Page" },
```

---

## CI/CD 流水线

### GitHub Actions 工作流

项目使用两套 GitHub Actions 工作流，分别负责**代码质量门禁**和**自动部署**。

### CI 质量门禁 (`.github/workflows/ci.yml`)

```yaml
触发条件: push/PR 到 main 或 develop 分支
```

**Job 1: Quality（代码质量）**

| 步骤            | 命令                 | 说明                            |
| --------------- | -------------------- | ------------------------------- |
| 类型检查        | `pnpm typecheck`     | TypeScript 严格模式编译检查     |
| 代码规范检查    | `pnpm lint`          | ESLint 检查（max-warnings 320） |
| 格式检查        | `pnpm format:check`  | Prettier 格式一致性检查         |
| 单元测试+覆盖率 | `pnpm test:coverage` | Vitest 864 测试用例             |
| 构建验证        | `pnpm build`         | Vite 生产构建                   |

- **Node.js 矩阵**: 22 / 24（两个版本并行验证）
- **包管理**: pnpm v11 + frozen-lockfile
- **覆盖率上传**: Node 22 版本上传 coverage 报告（保留 30 天）

**Job 2: E2E（端到端测试）**

| 步骤                   | 命令                               |
| ---------------------- | ---------------------------------- |
| 安装 Playwright 浏览器 | `npx playwright install chromium`  |
| 运行 E2E 测试          | `pnpm test:e2e --project=chromium` |

- 依赖 `quality` job 通过后执行
- 仅在 push 事件触发（PR 不运行 E2E）
- 上传 Playwright 报告（保留 30 天）

### Deploy 部署流水线 (`.github/workflows/deploy.yml`)

```
触发条件: push 到 main 分支 或 workflow_dispatch (手动触发)
```

```yaml
Job: build-and-deploy
  → Checkout
  → Install pnpm v11 + Node.js 22
  → pnpm install --frozen-lockfile
  → pnpm typecheck
  → pnpm build
  → Verify CNAME in dist/
  → actions/configure-pages@v5
  → actions/upload-pages-artifact@v3 (上传 dist/)
  → actions/deploy-pages@v4 (部署到 GitHub Pages)
```

**部署环境**:

- 域名: https://admin.yyc3.vip
- DNS: CNAME → yyc-cube.github.io
- Pages Source: GitHub Actions（仓库 Settings → Pages 中配置）
- 并发控制: 每次只允许一个部署进行

### 本地模拟 CI 流程

在提交前，建议本地运行完整的 CI 检查：

```bash
# 完整的 CI 检查流程
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test:coverage && pnpm build

# 或逐个步骤排查
pnpm typecheck     # 类型检查
pnpm lint          # 代码规范
pnpm format:check  # 格式检查
pnpm test          # 单元测试
pnpm build         # 构建验证
```

---

## 16. 部署指南

### GitHub Pages（当前生产环境）

```bash
# 自动部署：推送 main 分支即触发 GitHub Actions
# 仓库: YYC-Cube/YYC3-Administration
# 域名: https://admin.yyc3.vip
# DNS: CNAME → yyc-cube.github.io
```

部署流程（`.github/workflows/deploy.yml`）：

1. Checkout 代码
2. 安装 pnpm v11 + Node.js 22
3. `pnpm install --frozen-lockfile`
4. `pnpm typecheck` + `pnpm build`
5. 验证 `dist/CNAME`
6. `actions/upload-pages-artifact@v3` 上传构建产物
7. `actions/deploy-pages@v4` 部署到 GitHub Pages

> **注意**：GitHub Pages 为纯静态托管，不支持服务端 API 代理。AI API 请求需从浏览器直接连接 AI Provider（开发模式）或通过独立部署的后端代理服务。

### Docker 部署

```bash
# 构建镜像
docker build -t yyc3-admin .

# 运行容器
docker run -d -p 8080:80 yyc3-admin
```

Dockerfile 使用 `node:22-alpine` 多阶段构建 + `nginx:alpine` 运行环境。

### Docker Compose

```bash
docker compose up -d
# → http://localhost:8080
```

### 静态部署（任意托管平台）

```bash
pnpm build
# dist/ 目录可直接部署至任何静态托管服务
```

---

## 17. 常见问题

### Q: Monaco Editor 加载缓慢？

Monaco Editor 首次加载需要下载 ~2MB 的语言服务 worker 文件。建议：

- 使用 CDN 加速（`@monaco-editor/react` 默认从 jsDelivr 加载）
- 或配置本地 worker 文件

### Q: AI 对话无响应？

检查顺序：

1. 确认 AI Provider 配置（检查 Mock/OpenAI/Claude 切换）
2. 确认 API Key 是否正确
3. 查看浏览器 Network 面板中的请求状态
4. Mock 模式无需 API Key，应始终有响应

### Q: Git 面板显示 Mock 数据？

Git 面板默认使用 Mock 数据。要连接真实 GitHub：

1. 切换到 Git 面板 → Config 选项卡
2. 输入 GitHub Personal Access Token（需要 `repo` scope）
3. 输入 Owner/Repo
4. 点击 "Connect to GitHub"

### Q: localStorage 数据冲突？

```javascript
// 清除所有 YYC³ 存储
Object.keys(localStorage)
  .filter((k) => k.startsWith('yyc3-'))
  .forEach((k) => localStorage.removeItem(k))
```

### Q: 如何添加新的 AI Provider？

1. 在 `ai-proxy-service.ts` 的 `PROVIDER_ENDPOINTS` 中添加端点配置
2. 在 `callDirect()` 方法中添加新的 Provider 分支
3. 在 `edge-proxy-server.ts` 中添加对应的调用函数
4. 在 AI 配置面板的 Provider 选择器中添加选项

---

## 18. 下阶段开发建议

### P1 (高优先级)

| 任务                  | 预计工时 | 说明                                       |
| --------------------- | -------- | ------------------------------------------ |
| 部署服务端 AI 代理    | 2-4h     | 将 edge-proxy-server.ts 部署到独立后端服务 |
| 测试覆盖率提升        | 8-16h    | 目标覆盖率从 22% → 85%                     |
| 财务/薪资模块深度集成 | 4-8h     | 接入 Dataverse 真实数据源                  |

### P2 (中优先级)

| 任务               | 预计工时 | 说明                          |
| ------------------ | -------- | ----------------------------- |
| WebSocket 实时推送 | 8-16h    | AI 流式响应 + 协作消息        |
| 文件内容真实读写   | 8h       | 接入 File System Access API   |
| Diff 视图          | 4-8h     | Monaco Editor DiffEditor 集成 |
| Terminal 面板      | 8h       | xterm.js 嵌入式终端           |

### P3 (低优先级 / 远期)

| 任务         | 说明                        |
| ------------ | --------------------------- |
| 插件系统     | 扩展市场 + 插件 API         |
| 多人协作     | WebRTC/CRDT 实时协作编辑    |
| CI/CD 可视化 | GitHub Actions 状态面板     |
| 性能监控     | Web Vitals + 自定义性能面板 |

---

## 致谢

感谢 YYC³ 团队在整个项目开发过程中的全程投入和智慧贡献。从基础架构搭建到 50+ 页面组件的完整实现，从多模块功能到 CI/CD 流水线自动化部署，每一步都凝聚着团队协作的力量。

> **言启千行代码 · 语枢万物智能**
> _Words Inspire Thousands Lines of Code, Language Pivots the Intelligence of All Things_

---

<div align="center">

**YYC³ Administration**
**v1.0.2 — Enterprise Management Platform**
**YYC-Cube Team | 2026**

</div>
