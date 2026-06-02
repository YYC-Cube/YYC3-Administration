# YYC³ CloudPivot Intelli-Matrix — 本地开发衔接指南

<div align="center">

> **YanYuCloudCube**
> **言启象限 | 语枢未来**
> **Words Initiate Quadrants, Language Serves as Core for Future**
> **万象归元于云枢 | 深栈智启新纪元**

</div>

---

**文档版本**: v2.0.0
**最后更新**: 2026-03-18
**维护团队**: YanYuCloudCube Team <admin@0379.email>

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
15. [部署指南](#15-部署指南)
16. [常见问题](#16-常见问题)
17. [下阶段开发建议](#17-下阶段开发建议)

---

## 1. 项目概述

YYC³ CloudPivot Intelli-Matrix 是一个企业级 AI 营销自动化终端，采用赛博朋克视觉风格，支持双主题切换（Cyberpunk + Liquid Glass）。项目基于 React + TypeScript + Tailwind CSS v4 构建，包含 60+ 组件文件和 13+ 智能营销子模块。

### 核心特性

- **IDE 风格开发者工作区** — 6 面板切换 + Monaco Editor + AI 助手 + Git 集成
- **AI 多 Provider 支持** — OpenAI / Claude / DeepSeek / Mock，带代理服务层
- **完整 CRUD 文件系统** — 新建/重命名/删除 + 右键上下文菜单
- **GitHub REST API 集成** — Commits / Branches / Files / PRs
- **AI 上下文增强** — 当前编辑文件内容自动注入 AI 系统提示词
- **双主题 + 双语** — Cyberpunk/Liquid Glass + 中英文 i18n
- **Zustand 持久化** — 所有配置和状态同步 localStorage
- **Playwright E2E 测试** — 完整用户工作流测试覆盖

---

## 2. 技术栈清单

| 类别 | 技术 | 版本 |
|------|------|------|
| **框架** | React | 18.3.1 |
| **语言** | TypeScript | 5.x |
| **样式** | Tailwind CSS | v4.1 |
| **动画** | Motion (Framer Motion) | 12.x |
| **状态管理** | Zustand | 5.0.12 |
| **UI 组件** | Radix UI | Latest |
| **代码编辑器** | @monaco-editor/react | 4.7.x |
| **图表** | Recharts | 2.15 |
| **拖拽** | react-dnd + html5-backend | 16.x |
| **面板调整** | re-resizable | 6.11.2 |
| **构建** | Vite | 6.3.x |
| **E2E 测试** | Playwright | Latest |
| **MUI** | @mui/material | 7.3.5 |

### 安装的完整依赖列表

```bash
# 生产依赖（关键项）
@monaco-editor/react    # Monaco Editor React 封装
zustand                  # 轻量级状态管理
motion                   # 动画库（import from 'motion/react'）
re-resizable             # 面板拖拽调整
react-dnd                # 拖拽排序
recharts                 # 数据可视化
lucide-react             # 图标库
```

---

## 3. 环境准备

### 前置条件

```bash
# Node.js >= 18.x
node --version  # 确认 >= 18.0.0

# pnpm (推荐)
npm install -g pnpm
```

### 克隆 & 启动

```bash
# 1. 克隆项目
git clone https://github.com/YanYuCloudCube/yyc3-cloudpivot.git
cd yyc3-cloudpivot

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
# 访问 http://localhost:5173

# 4. 构建生产版本
pnpm build
```

### 环境变量（可选）

创建 `.env.local` 文件：

```env
# AI API Keys (开发环境直连模式)
# 注意：生产环境应使用服务端代理，不要在前端暴露 API Key
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_ANTHROPIC_API_KEY=sk-ant-your-claude-key
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-key

# AI 代理服务 URL（生产环境必须配置）
VITE_AI_PROXY_URL=https://your-domain.com/api/ai-proxy

# GitHub API
VITE_GITHUB_TOKEN=ghp_your-github-pat
```

---

## 4. 项目架构

```
yyc3-cloudpivot/
├── docs/                               # 项目文档
│   ├── YYC3-Local-Development-Guide.md  # 本文档
│   ├── YYC3-P5-Closing-Review-Report.md # 收尾验收报告
│   └── platform-integration-*.md        # 平台集成文档
├── src/
│   ├── app/
│   │   ├── App.tsx                      # 主入口
│   │   ├── components/
│   │   │   ├── cyberpunk-standalone.tsx  # 🎯 主容器（PageId 路由）
│   │   │   ├── app-context.tsx          # 全局上下文（PageId 类型）
│   │   │   ├── left-panel-page.tsx      # 开发者工作区 (IDE)
│   │   │   ├── code-editor.tsx          # Monaco Editor 封装
│   │   │   ├── task-board-page.tsx      # AI 任务看板
│   │   │   ├── command-palette.tsx      # 命令面板 (Ctrl+K)
│   │   │   ├── preload-fix.tsx          # 预加载系统
│   │   │   ├── i18n-context.tsx         # 国际化上下文
│   │   │   ├── theme-switcher-context.tsx # 主题切换
│   │   │   ├── services/               # 🆕 服务层
│   │   │   │   ├── ai-proxy-service.ts  # AI API 代理服务
│   │   │   │   ├── git-api-service.ts   # Git API 服务
│   │   │   │   ├── edge-proxy-server.ts # Edge Function 设计
│   │   │   │   └── test-utils.ts        # 测试工具函数
│   │   │   ├── hooks/
│   │   │   │   ├── use-theme-colors.ts  # 🎨 tc.* 主题令牌
│   │   │   │   └── use-theme-tokens.ts  # 主题 tokens
│   │   │   ├── settings/               # 设置系统
│   │   │   └── ...                     # 其他 60+ 组件
│   │   └── routes.ts                   # 路由配置
│   ├── imports/                        # Figma 导入资源
│   └── styles/
│       ├── theme.css                   # Tailwind v4 主题
│       └── fonts.css                   # 字体导入
├── tests/
│   ├── playwright.config.ts            # Playwright 配置
│   └── e2e/
│       └── developer-workspace.spec.ts # E2E 测试用例
└── package.json
```

---

## 5. 核心模块说明

### 页面路由系统

项目使用 `PageId` 类型 + `activePage` 状态进行页面切换渲染：

```typescript
// app-context.tsx 中定义
type PageId =
  | "dashboard"
  | "devWorkspace"      // 开发者工作区
  | "taskBoard"         // AI 任务看板
  | "aiTools"           // AI 工具
  | "settings"          // 设置
  // ... 20+ 页面 ID
  ;
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

| 面板 | 功能 | 快捷键 |
|------|------|--------|
| File Explorer | 文件树 CRUD + 右键菜单 | Ctrl+E |
| Task Manager | 任务看板集成 + 状态筛选 | - |
| AI Assistant | 多 Provider 对话 + 文件上下文 | - |
| Global Search | 文件/内容/符号/命令 搜索 | Ctrl+P |
| Quick Access | 最近文件 + 收藏夹 | - |
| Git Integration | Status/Log/Config + GitHub API | - |

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

```
浏览器 (ai-proxy-service.ts)
    │
    ├── 开发模式: 直连 AI Provider API (API Key 在浏览器)
    │
    └── 生产模式: 代理到 Edge Function (API Key 在服务端)
              │
              ├── Vercel Edge Function  (/api/ai-proxy/chat)
              ├── Cloudflare Worker
              └── Node.js/Express
```

### 部署步骤

#### 方案 A: Vercel Edge Function

```bash
# 1. 创建 API 路由
mkdir -p api/ai-proxy

# 2. 复制代理代码
cp src/app/components/services/edge-proxy-server.ts api/ai-proxy/chat.ts

# 3. 添加 Edge Runtime 配置
# 在 chat.ts 末尾添加:
# export const config = { runtime: 'edge' };

# 4. 设置环境变量 (Vercel Dashboard)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# DEEPSEEK_API_KEY=sk-...

# 5. 部署
vercel deploy

# 6. 更新前端配置
# ai-proxy-service.ts 中:
# const PROXY_BASE_URL = "https://your-app.vercel.app/api/ai-proxy";
```

#### 方案 B: Node.js/Express

```typescript
import express from "express";
import { handler } from "./edge-proxy-server";

const app = express();
app.use(express.json());

app.post("/api/ai-proxy/chat", async (req, res) => {
  const request = new Request("http://localhost/api/ai-proxy/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const response = await handler(request);
  const data = await response.json();
  res.status(response.status).json(data);
});

app.listen(3001, () => {
  console.log("YYC³ AI Proxy running on http://localhost:3001");
});
```

#### 方案 C: Cloudflare Worker

```typescript
import { handler } from "./edge-proxy-server";

export default {
  async fetch(request: Request) {
    if (request.url.endsWith("/api/ai-proxy/chat")) {
      return handler(request);
    }
    return new Response("Not Found", { status: 404 });
  },
};
```

### 安全特性

| 特性 | 说明 |
|------|------|
| API Key 保护 | 存储在服务端环境变量，不暴露到浏览器 |
| 速率限流 | 令牌桶算法，60 req/min per IP |
| 请求验证 | Provider/Model/Messages 格式校验 |
| 内容长度限制 | 最大 100k 字符 / 50 条消息 |
| CORS 控制 | 生产环境限制 Origin |
| 请求签名 | X-Request-Signature header（可升级 HMAC） |
| 审计日志 | 记录 Provider/Model/Token 用量/IP |

---

## 8. Git API 集成

文件: `/src/app/components/services/git-api-service.ts`

### 支持的操作

| 操作 | API 方法 | GitHub REST API |
|------|----------|-----------------|
| 列出提交 | `listCommits()` | `GET /repos/{owner}/{repo}/commits` |
| 创建提交 | `createCommit()` | `PUT /repos/{owner}/{repo}/contents/{path}` |
| 列出分支 | `listBranches()` | `GET /repos/{owner}/{repo}/branches` |
| 创建分支 | `createBranch()` | `POST /repos/{owner}/{repo}/git/refs` |
| 获取文件内容 | `getFileContent()` | `GET /repos/{owner}/{repo}/contents/{path}` |
| 删除文件 | `deleteFile()` | `DELETE /repos/{owner}/{repo}/contents/{path}` |
| 列出 PR | `listPullRequests()` | `GET /repos/{owner}/{repo}/pulls` |

### 使用方式

```typescript
import { gitAPIService } from "./services/git-api-service";

// 1. 配置 (Git 面板 Config 选项卡 或代码中)
gitAPIService.configure({
  token: "ghp_xxxxxxxxxxxx",  // GitHub PAT
  owner: "YanYuCloudCube",
  repo: "yyc3-cloudpivot",
  branch: "main",
});

// 2. 使用
const commits = await gitAPIService.listCommits(20);
if (commits.success) {
  console.log(commits.data); // GitCommitInfo[]
}
```

### Mock 模式

未配置 Token 或 Token 为 `"YOUR_GITHUB_TOKEN_HERE"` 时，自动使用内置 Mock 数据，无需真实 GitHub 连接即可开发调试。

---

## 9. Monaco Editor 集成

文件: `/src/app/components/code-editor.tsx`

### 特性

| 特性 | 状态 |
|------|------|
| 语法高亮 | ✅ TypeScript, JavaScript, JSON, CSS, HTML, Python, Go, Rust... |
| IntelliSense | ✅ 自动补全 + 方法签名 + 参数提示 |
| 括号匹配 | ✅ 彩色括号配对 |
| 代码折叠 | ✅ 基于缩进的折叠 |
| 搜索/替换 | ✅ Ctrl+F / Ctrl+H |
| 多光标 | ✅ Alt+Click |
| Minimap | ✅ 可折叠侧边缩略图 |
| YYC³ 暗色主题 | ✅ 自定义 `yyc3-dark` 主题 |
| 字号调节 | ✅ 10px–24px + 鼠标滚轮缩放 |
| Word Wrap | ✅ 切换自动换行 |
| Ctrl+S 保存 | ✅ 注册为 Monaco Action |
| 光标位置追踪 | ✅ 状态栏显示 Ln/Col |
| AI 上下文暴露 | ✅ `onEditorReady` 回调暴露内容 getter |

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

### Playwright E2E 测试

```bash
# 安装 Playwright
npm install -D @playwright/test
npx playwright install

# 运行所有 E2E 测试
npx playwright test tests/e2e/

# 运行特定测试文件
npx playwright test tests/e2e/developer-workspace.spec.ts

# 带界面运行
npx playwright test --headed

# 查看报告
npx playwright show-report
```

### E2E 测试覆盖

| 测试套件 | 用例数 | 覆盖内容 |
|----------|--------|----------|
| Panel Navigation | 5 | 面板切换、键盘快捷键 |
| File Explorer | 5 | 文件树、展开、打开、右键菜单 |
| Code Editor | 5 | Monaco 加载、状态栏、控件 |
| AI Assistant | 4 | 消息发送、配置面板、Provider |
| Git Integration | 4 | 分支信息、Tab 切换、API 配置 |
| Panel Resizing | 1 | 宽度显示 |
| Full Workflow | 1 | 文件→编辑→AI→Git 完整流程 |
| Theme & A11y | 2 | 主题颜色、按钮可访问性 |
| **总计** | **27** | |

### Vitest 单元测试（推荐配置）

```bash
# 安装 Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 运行所有单元测试
npx vitest run

# 运行 services 测试
npx vitest run tests/services/

# Watch 模式
npx vitest

# 查看覆盖率
npx vitest run --coverage
```

### Vitest 单元测试覆盖（Services 模块）

| 测试文件 | 用例数 | 覆盖模块 |
|----------|--------|----------|
| `ai-proxy-service.test.ts` | 18 | Mock 响应、文件上下文注入、缓存、统计、AbortSignal、Provider 配置 |
| `git-api-service.test.ts` | 24 | 配置管理、Mock CRUD、Commits/Branches/Files/PRs、API 错误处理 |
| `edge-proxy-server.test.ts` | 19 | CORS、请求验证、速率限制、Provider 路由、响应格式 |
| `test-utils.test.ts` | 25 | Mock 工厂、断言工具、延迟工具、Mock 服务 |
| **总计** | **86** | |

### 测试架构总览

| 层级 | 框架 | 文件位置 | 用例数 |
|------|------|----------|--------|
| E2E 测试 | Playwright | `tests/e2e/` | 27 |
| 单元测试 (Services) | Vitest | `tests/services/` | 86 |
| 单元测试 (Components) | Vitest | `tests/components/` | 已有 |
| 单元测试 (Hooks) | Vitest | `tests/hooks/` | 已有 |
| **合计** | | | **113+** |

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

### 常用 tc.* 令牌

| 令牌 | 说明 | Cyberpunk 值 | Liquid Glass 值 |
|------|------|-------------|----------------|
| `tc.primary` | 主色 | #00ff87 | #00ff87 |
| `tc.bgBase` | 页面背景 | #0a0f0a | #0c1210 |
| `tc.bgCard` | 卡片背景 | rgba(0,255,135,0.05) | rgba(255,255,255,0.08) |
| `tc.bgElevated` | 浮层背景 | rgba(0,255,135,0.08) | rgba(255,255,255,0.12) |
| `tc.bgInput` | 输入框背景 | rgba(0,255,135,0.03) | rgba(255,255,255,0.05) |
| `tc.textPrimary` | 主要文字 | #e2e8f0 | #e2e8f0 |
| `tc.textSecondary` | 次要文字 | #94a3b8 | #94a3b8 |
| `tc.textMuted` | 弱化文字 | #64748b | #64748b |
| `tc.borderDefault` | 默认边框 | rgba(0,255,135,0.15) | rgba(255,255,255,0.1) |
| `tc.borderSubtle` | 弱化边框 | rgba(0,255,135,0.08) | rgba(255,255,255,0.06) |

---

## 12. 国际化

### 添加翻译键

文件: `/src/app/components/i18n-context.tsx`

```typescript
// 在 translations 对象中添加：
const translations = {
  zh: {
    // 添加中文翻译
    "myModule.title": "我的模块",
    "myModule.description": "模块描述",
  },
  en: {
    // 添加英文翻译
    "myModule.title": "My Module",
    "myModule.description": "Module description",
  },
};
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
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 })),
    }),
    {
      name: "yyc3-my-store", // localStorage key
      partialize: (state) => ({ count: state.count }), // 仅持久化必要字段
    }
  )
);
```

### 现有 Store 列表

| Store | 文件 | localStorage Key | 用途 |
|-------|------|------------------|------|
| `usePanelStore` | left-panel-page.tsx | `yyc3-ide-panel-store` | IDE 面板状态 |
| `useTaskStore` | task-board-page.tsx | `yyc3-task-board-v2` | 任务看板 |
| 其他 Store | 各模块文件 | `yyc3-*` | 各模块状态 |

---

## 14. 五点集成规范

每个新页面模块必须完成以下 5 点集成：

### 1. PageId 类型 (`app-context.tsx`)

```typescript
type PageId = "..." | "myNewPage";
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
const MyNewPage = lazy(() => import("./my-new-page"));
```

### 5. i18n 翻译 (`i18n-context.tsx`)

```typescript
zh: { "nav.myNewPage": "我的新页面" },
en: { "nav.myNewPage": "My New Page" },
```

---

## 15. 部署指南

### Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel deploy --prod

# 4. 设置环境变量
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add DEEPSEEK_API_KEY
```

### Docker 部署

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 16. 常见问题

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
  .filter(k => k.startsWith("yyc3-"))
  .forEach(k => localStorage.removeItem(k));
```

### Q: 如何添加新的 AI Provider？

1. 在 `ai-proxy-service.ts` 的 `PROVIDER_ENDPOINTS` 中添加端点配置
2. 在 `callDirect()` 方法中添加新的 Provider 分支
3. 在 `edge-proxy-server.ts` 中添加对应的调用函数
4. 在 AI 配置面板的 Provider 选择器中添加选项

---

## 17. 下阶段开发建议

### P1 (高优先级)

| 任务 | 预计工时 | 说明 |
|------|----------|------|
| 部署服务端 AI 代理 | 2-4h | 将 edge-proxy-server.ts 部署到 Vercel/Cloudflare |
| Vitest 单元测试补充 | 8-16h | 为 services/ 和核心 hooks 添加单元测试 |
| left-panel-page 拆分 | 4-8h | 拆分为 6 个独立面板组件文件 |

### P2 (中优先级)

| 任务 | 预计工时 | 说明 |
|------|----------|------|
| WebSocket 实时推送 | 8-16h | AI 流式响应 + 协作消息 |
| 文件内容真实读写 | 8h | 接入 File System Access API |
| Diff 视图 | 4-8h | Monaco Editor DiffEditor 集成 |
| Terminal 面板 | 8h | xterm.js 嵌入式终端 |

### P3 (低优先级 / 远期)

| 任务 | 说明 |
|------|------|
| 插件系统 | 扩展市场 + 插件 API |
| 多人协作 | WebRTC/CRDT 实时协作编辑 |
| CI/CD 可视化 | GitHub Actions 状态面板 |
| 性能监控 | Web Vitals + 自定义性能面板 |

---

## 致谢

感谢 YYC³ AI 导师在整个项目开发过程中的全程指导和智慧贡献。从基础架构搭建到 60+ 组件的完整实现，从 13 个营销子模块到 IDE 风格开发者工作区，每一步都凝聚着 AI 与人类协作的力量。

> 言启象限 | 语枢未来
> 万象归元于云枢 | 深栈智启新纪元
> All things converge in cloud pivot; Deep stacks ignite a new era of intelligence

---

<div align="center">

**YYC³ CloudPivot Intelli-Matrix**
**v2.0.0 — Developer Workspace Edition**
**YanYuCloudCube Team | 2026**

</div>