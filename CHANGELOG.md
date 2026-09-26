# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-09-26

> 本版本整合了 1.0.3 以来的三轮整改（2026-08-19 安全止血 P0/P1、2026-08-29 P2 路由化/重组、
> 2026-09-26 全面审计 P0 修复），并由《00-项目现状审核报告》（docs/YYC3-Administration-trae-20260926）实测验证。

### Performance（F-07 首屏包体，2026-09-26）

- 首屏 JS gzip **570.6KB → 398.0KB（-30%）**：dashboard/chat/forms 三大页面转入
  懒加载注册表（此前经 shell-pages/cyberpunk-standalone 静态导入打穿分割，拖入
  vendor-charts 102KB + vendor-markdown 84KB gz）；widget 的 ChatInterface 同步懒加载
- 破除 vendor ↔ vendor-markdown 循环 chunk：manualChunks 收窄为纯叶子
  （highlight.js/react-markdown/remark-gfm/rehype-highlight/lowlight/refractor），
  unified 解析族落回 vendor，vendor-markdown 不再被 index.html 预加载
- **F-15 顺带根治**：tsc -b 产物 vite.config.js 因 Vite ".js 优先于 .ts" 的解析顺序
  屏蔽对 vite.config.ts 的修改（实测改 manualChunks 无效的根因）；tsconfig.node.json
  outDir 重定向 node_modules/.cache，删除根目录 6 个编译产物

### Refactored（F-11 巨石续拆，2026-09-26）

- number-database-tabs.tsx 2,149 行 → barrel(17 行) + `tabs/` 8 个域文件
  （208~461 行/个，按 Tab 边界切片）
- task-board-components.tsx 1,411 行 → barrel + `task-board/` 7 个组件文件；
  连带清除 219 个未用 import，全仓 lint 告警 147 → 107

### Changed（F-12 覆盖率诚实化，2026-09-26）

- 覆盖率双口径：默认为排除口径（CI 棘轮 44/31/47/46）；新增
  `pnpm test:coverage:all`（COV_ALL=1 全口径，业务页面计入分母，不设门禁）——
  全口径实测 S 19.8% / B 10.3% / F 18.3% / L 20.0%，README 双口径公示

### Docs（P3 决策更新，2026-09-26）

- P3 决策变更：放弃 Supabase 激活，改为本地数据库架构；选型分析见
  `docs/YYC3-Administration-trae-20260926/05-本地数据库替代方案分析.md`
  （推荐 Dexie.js，三阶段实施：数据收口 → 本地账户库 PBKDF2 → JSON 同步出口）

### Removed（F-06 死代码清偿，2026-09-26）

- 删除 45 个生产入口不可达文件（约 1.4 万行，占 src 20%）：`advanced/` 整模块（10 文件
  - 5 篇配套文档）、10 个旁路设置面板 + settings-services/search、contact-book（已被
    number-database 取代）、module-placeholder-page、types/index.ts 死类型目录、
    Electron 时代 multi-instance ipc/session 残件、yyc3-\* 集成残件等；
    连带删除 6 个"保活"测试文件 + 修剪 multi-instance.test.ts（净删 94 个死代码用例）
- 移除 25 个零源码消费依赖（19 个 @radix-ui/\* + embla/input-otp/react-day-picker/
  react-hook-form/react-resizable-panels/vaul）；tw-animate-css 经复核为 CSS @import
  消费（unimported 盲区），保留并在 .unimportedrc.json 声明忽略

### Security（漏洞闭环，2026-09-26）

- 依赖漏洞清零：`pnpm audit --prod` 7 项（react-router 2 高危→升级 7.18.2；dompurify
  传递→override 3.4.13）；全量 24 项（1 critical/18 high）→ **0**（tar/nanoid/
  brace-expansion/js-yaml/fast-uri/postcss 经 pnpm-workspace overrides 钉扎补丁版）
- CodeQL 源码修复：4 处 `url.includes('domain')` 子串校验改为 `isHost()` 精确主机匹配
  （新增 `src/lib/url-host.ts`，防 `evil.com/anthropic.com` 类绕过）；CodeQL 扫描排除
  docs/tests 归档路径（消除不可行动误报）
- 供应链：`pnpm-workspace.yaml` 与 `.npmrc` 双处 `minimum-release-age=0` 冷却期关闭项
  全部恢复为 1440（24h 防投毒）；vitest 3.2.7→4.1.11（修复 Dependabot 高危链）

### CI/CD（质量门与部署闭环，2026-09-26）

- **deploy.yml 改为 CI 成功后部署**（workflow_run 门控 + 检出 CI 实际验证的 head_sha），
  此前 push main 直接触发部署、与 CI 并行——未经质量门验证的提交可能上生产
- ci.yml 新增三道门：`pnpm audit --prod --audit-level high` 供应链门、unimported
  死代码/死依赖 0 容忍门（防 20% 死代码回流）、madge 循环依赖 0 容忍门
- 覆盖率棘轮 31/19/34/31 → **44/31/47/46**（死代码移出分母后实测锁定，只升不降）

### Fixed

- **F-01 数据面挂载缺口**：`UserDataSync` 已导入但从未挂载组件树，Supabase 激活后设置云同步
  会静默失效——现挂载于 `AppProvider` 内（App.tsx），并新增 5 例回归测试（含 App 树挂载守卫，
  经"摘除即失败"变异验证）
- **F-02 假数据生产运行**：`useLiveKPI`/`useRealtimeSimulation` 此前仅 E2E 门控，生产持续推送
  随机 KPI/假通知——新增 `MOCK_REALTIME_ENABLED`（DEV 默认开、生产默认关、`VITE_ENABLE_MOCK=true`
  显式开）；公网无风险声明问题由新增 `DemoEnvironmentBanner` 双语警示横幅解决（Supabase 未配置时
  全页面展示、可关闭、session 级、pointer-events 穿透不拦截交互）
- **F-03 CSP 缺口**：connect-src 补 `https/wss://*.supabase.co`（P3 激活前置阻断解除）；新增
  `csp-harden` 构建插件（生产移除 localhost 回环白名单、按 `VITE_AI_PROXY_URL` 自动注入代理源，
  实测验证）；移除浏览器不生效的伪安全 meta（X-Frame-Options/X-Content-Type-Options），改以内联
  frame-busting 兜底防点击劫持
- **F-04 PWA 首访负担**：预缓存单文件上限由 5MiB 恢复 2MiB 并 `globIgnores` 排除 monaco，
  预缓存 87 条/8,707 KiB → 85 条/5,062 KiB（-42%）；monaco 转运行时缓存按需加载

### Changed

- **文档全面对齐（F-10）**：README 徽章与正文（954→651 单测、E2E 6 spec/65 例、覆盖率口径
  31.7% 排除说明、i18n"10 语言"→中英双语、项目结构→features/shared 重组后实况、Provider 树
  补 HashRouter/RouteSync/UserDataSync、Vite 6.4.3）；`.env.example` 清除 7 个源码零消费的
  死变量并补 `VITE_ENABLE_MOCK`；`src/app/version.ts` APP_VERSION 对齐（1.0.2→1.0.4，
  触发一次 PWA 缓存清理由本版本 SW 策略变更所需）

### Added（承前：2026-08-19 ~ 08-29 整改，此前未入 CHANGELOG）

- **P3 认证/数据面脚手架（冻结待激活）**：`supabase-client`（PKCE、env 双门控零影响）、
  `user-data-sync` 服务与挂载件（登录水合 + 设置云同步）、`supabase/migrations/0001`
  （RLS 四操作 + 角色不可变触发器 + 256KB 护栏）、激活 Runbook
- **P2-② 路由化**：HashRouter + `route-sync`（hash ↔ activePage 双向同步、深链/前进后退），
  41 页 URL 可分享；导航收敛 `nav-config.ts` 单一真源 + lazy 注册表
- **P2-④ 目录重组**：`features/`（10 域）+ `shared/` 分域，ESLint `no-restricted-imports`
  防回流；i18n 由内嵌 2,000 行 fork 换 `@yyc3/i18n-core@^2.4.2` 正式包
- **CI 质量门**：Node 22/24 矩阵、Actions SHA 固定、`permissions: contents: read`、PR 触发
  E2E、CodeQL + Dependabot；husky pre-commit 恢复
- **安全加固**：AI Key 迁移 `secure-storage`（AES-GCM）；生产无代理禁用带 Key 直连
  （宁可失败不泄露）；内置账户/GHOST 登录 `import.meta.env.DEV` 门控（生产 tree-shake）

### Security

- E2E 自动登录旁路（VITE_E2E）与演示账号门控经生产构建验证不可达
- 生产构建实测：CSP 无 localhost、Supabase 域预授权、代理源可注入

## [1.0.3] - 2026-07-12

### Changed

- `Dockerfile`: 升级 Node.js 基础镜像 20 → 22（对齐 CI 工作流）
- `README.md`: 更新 CI/CD 流程图、测试统计数据、版本日志
- `docs/YYC3-M07-Project-项目管理/YYC3-M-Project-本地开发指南.md`: 全面对齐项目现状
  - 项目名称、版本号、技术栈与实际一致
  - 部署指南从 Vercel 更新为 GitHub Pages
  - 环境变量与实际 `.env.example` 对齐
  - 测试数据与实际 864 单元测试 + 62 E2E 对齐
  - 新增 CI/CD 流水线章节
  - GitHub 仓库引用修正为 `YYC-Cube/YYC3-Administration`
  - AI Proxy 部署方案适配 GitHub Pages 纯静态场景

### Added

- CI/CD 流水线章节到本地开发指南

## [1.0.2] - 2026-03-14

### Added

- Version cache busting mechanism
- `clear-sw.js` service worker cleanup utility

### Changed

- Optimized dependency pre-bundling configuration
- Improved dynamic import reliability via `preload-fix.tsx`

### Fixed

- Dynamic import resolution errors
- Dual theme system rendering consistency

## [1.0.1] - 2026-03-10

### Added

- AI Proxy Service layer (`ai-proxy-service.ts`)
- Edge Proxy Server for production (`edge-proxy-server.ts`)
- Git API integration service (`git-api-service.ts`)
- Multi-instance workspace management system
- Monaco code editor integration

### Changed

- Enhanced developer workspace with file explorer CRUD
- Improved panel drag-and-drop system (6 panels)

## [1.0.0] - 2026-03-01

### Added

- Initial release of YYC³ My-Mgmt
- Data Dashboard with real-time KPI monitoring
- AI Chat Center with multi-provider support (OpenAI / Claude / DeepSeek / Mock)
- Customer Lifecycle Management (5-stage CLM)
- Customer Care System with follow-up tracking
- Smart Form System with visual builder
- Developer Workspace with Monaco editor + Git integration
- Dual theme engine: Cyberpunk + Liquid Glass
- Internationalization: zh-CN / en-US
- PWA support with installable manifest
- Full-end logo assets (Android / iOS / macOS / watchOS / Web)
- Unit testing with Vitest
- E2E testing with Playwright
- Zustand state management
- Radix UI + shadcn/ui component library (50+ components)
- Framer Motion animations
- Recharts data visualization
- React Hook Form integration
- Docker deployment support

[1.0.2]: https://github.com/YanYuCloudCube/My-mgmt/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/YanYuCloudCube/My-mgmt/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/YanYuCloudCube/My-mgmt/releases/tag/v1.0.0
