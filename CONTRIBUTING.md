# 贡献指南

感谢您对 **YYC³ My-Mgmt** 项目的关注！本文档将帮助您快速参与项目开发。

---

## 开发环境准备

### 前置要求

- **Node.js** >= 18.0.0 (推荐 20.x)
- **pnpm** >= 8.0.0
- **Git**

### 本地启动

```bash
git clone <repository-url>
cd My-mgmt
pnpm install
pnpm dev          # → http://localhost:3171
```

---

## 开发流程

### 1. 分支策略

| 分支 | 用途 |
|:-----|:-----|
| `main` | 生产稳定版 |
| `develop` | 开发主分支 |
| `feature/*` | 功能开发 |
| `bugfix/*` | 问题修复 |
| `hotfix/*` | 紧急修复 |

### 2. 工作流程

1. 从 `develop` 创建特性分支
2. 完成开发并确保测试通过
3. 提交 Pull Request 到 `develop`
4. Code Review 通过后合并

---

## 代码规范

### 命名约定

| 类型 | 规范 | 示例 |
|:-----|:-----|:-----|
| 组件文件 | PascalCase | `DashboardPage.tsx` |
| 工具/服务 | camelCase | `aiProxyService.ts` |
| 样式文件 | kebab-case | `liquid-glass.css` |
| 组件名 | PascalCase | `SmartFormSystem` |
| 变量/函数 | camelCase | `handleSubmit` |
| 常量 | UPPER_SNAKE | `API_BASE_URL` |
| 类型/接口 | PascalCase | `CustomerData` |

### TypeScript 规范

- 严格模式，禁止 `any`（必要时添加注释说明）
- 公共 API 必须使用 JSDoc 文档化
- 使用绝对路径 `@/` 别名导入

### 导入顺序

```typescript
// 1. React / 框架
import { useState, useEffect } from 'react';

// 2. 第三方库
import { motion } from 'motion/react';
import { useStore } from 'zustand';

// 3. 内部模块
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n-context';

// 4. 类型
import type { DashboardData } from '@/types';
```

---

## Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

<body>
```

### Type 列表

| Type | 描述 |
|:-----|:-----|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响功能） |
| `refactor` | 重构（非新功能 / 非修复） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建 / 工具链 |
| `ci` | CI/CD 配置 |

### 示例

```
feat(dashboard): add real-time KPI monitoring widget
fix(chat): resolve stream response interruption issue
docs(readme): update tech stack version table
```

---

## 测试规范

### 单元测试

```bash
pnpm test              # 运行所有
pnpm test:watch        # 监听模式
pnpm test:coverage     # 覆盖率
```

### E2E 测试

```bash
pnpm test:e2e          # Playwright
pnpm test:e2e:ui       # UI 模式
```

### 测试要求

- 新功能必须附带单元测试
- Bug 修复必须附带回归测试
- 覆盖率目标：行 / 分支 / 函数 / 语句 ≥ 80%

---

## 代码质量

### 提交前检查

```bash
pnpm typecheck         # TypeScript 类型检查
pnpm lint              # ESLint 检查
pnpm format:check      # Prettier 格式检查
pnpm test              # 运行测试
```

### 自动化

项目已配置 `lint-staged` + `husky`，提交时自动执行：

- ESLint 自动修复
- Prettier 格式化

---

## UI / 组件规范

### 组件结构

```
ComponentName/
├── ComponentName.tsx       # 组件实现
├── ComponentName.test.tsx  # 测试文件（可选）
```

### 主题适配

所有新组件必须同时支持 **Cyberpunk** 和 **Liquid Glass** 双主题：

```typescript
import { useTheme } from '@/components/theme-switcher-context';

const { theme } = useTheme();
// 根据主题切换样式
```

### 国际化

所有用户可见文本必须通过 i18n 系统：

```typescript
const { t } = useI18n();
// ✅ 正确
<span>{t('dashboard.title')}</span>
// ❌ 错误
<span>数据驾驶舱</span>
```

---

## Pull Request 规范

### 标题格式

```
<type>(<scope>): <description>
```

### PR 检查清单

- [ ] 代码通过 `typecheck`
- [ ] 代码通过 `lint`
- [ ] 新功能已编写测试
- [ ] 双主题适配完成
- [ ] 国际化文本已添加
- [ ] 无 `console.log` 残留
- [ ] 无 `any` 类型引入

---

## 问题反馈

- **Bug 报告**: GitHub Issues，使用 Bug Report 模板
- **功能建议**: GitHub Issues，使用 Feature Request 模板
- **安全问题**: 邮件 admin@0379.email

---

## 联系方式

- **邮箱**: admin@0379.email
- **团队**: YanYuCloudCube (YYC³) Development Team

---

感谢您的贡献！
