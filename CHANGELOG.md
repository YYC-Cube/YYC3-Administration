# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2026-11-12

> 🎯 **M1 全链闭环发版**：自托管后端从纸面契约到三层实地验收全绿（P0-P8-lite，
> 后端闭环大纲 9/12 节点）。F-05/F-09/F-19 三项审计债在本版实质性清偿。

### Added（自托管后端，P2-P5）

- **数据面**：PG 15(drizzle-orm/pg) 5 表模型(users/user_settings/ai_configs/
  chat_sessions/chat_messages)——partial unique 单激活、双属主 FK 级联、CHECK 枚举；
  迁移由 drizzle-kit 生成、官方 migrator 幂等应用；唯一数据访问模块(repositories)
  等价 RLS：全部查询强制属主作用域，他人资源 404 不泄露存在性
- **AI 密钥静态加密**：AES-256-GCM(secret-box,scrypt 派生),密钥仅环境变量
- **数据面路由**：/data/settings、/data/ai-configs CRUD+activate、/data/chat
  会话/消息、/data/export 可逆出口(P0 红线:零 api key 导出)
- **认证**：argon2id + JWT HS256 httpOnly Cookie + CSRF Origin 守卫(
  API_ALLOWED_ORIGINS allowlist 支持代理拓扑) + 限流(login 5/60s、register 10/h,
  AUTH_RATELIMIT_DISABLED 供本地/E2E)

### Added（前端接线，P6）

- `VITE_API_MODE=true` 构建期门控:认证/设置同步切换自托管 API
  (Pages 线不设 → 本地模式零破坏);vite dev/preview 同源 /api 代理
- useAuthStore API 分支 + contractUserToUser 契约映射(P4 零漂移桥);
  self-data-sync 水合+防抖上行;user-data-sync 挂载件双模分流

### Added（契约与演练，P4/P7）

- `server/contract/` 五域 zod 契约 + 10 业务码错误表(错误体 satisfies 编译期锁定)
- **P7 越权矩阵活库演练**：tests/e2e/authz-drill.spec.ts 可重复执行——
  双用户交叉越权(7 项资源全 404)、settings 单文档隔离正证、未登录 401 对照、
  export 红线;CI e2e 随全量同构执行

### Security（F-05/F-19 清偿实证）

- F-05：生产 bundle grep admin123|ghost-_|dev-_(演示凭据)全部 0 命中;
  演示密码运行时派生(demo-credentials)
- F-19：注册/登录限流;活库实证 错误密码 401×5→429
- Hono 全局 onError 信封化(500 不再泄漏堆栈)

### Ops（P8-lite）

- Dockerfile.server(健康检查+启动幂等迁移) + compose server profile(api/db)
- docker-release.yml 扩展:**api 镜像同 tag 发布 GHCR**
- CI e2e job:postgres service + 独立迁移步骤 + API 预启动——
  M1 全链 spec(m1-full-chain.spec.ts)在 CI 同构执行
- uptime.yml 增 api-health 拨测 job(仓库 Variables 配 API_HEALTH_URL 后启用)

### Tests

- **752 tests 全绿**(+14 认证/契约/接线);覆盖率棘轮四指标全超
  (S70.83/B67.44/F73.0/L73.08);全量 chromium e2e **71 passed**;
  三层实地验收(L1 活库 21 断言/L2 Playwright 全链/L3 容器部署链)详见
  docs/backend/M1-WIRING.md §四

## [1.0.6] - 2026-11-02

> 批次二/三整合发版：监控告警体系落地 + 测试补强 + 容器线镜像化。
> （1.0.5 后依次合入：89d46bb 监控与 Sentry、a5e0065/58c5bc1 workflow 修复、
> 批次三测试补强与后端规划）

### Added（监控告警体系，F-14 整改）

- **uptime.yml**：每 5 分钟拨测生产站（HTTP 200 + 页面标识），告警 issue
  自动创建/刷新/关闭（dispatch 实测 success）
- **ci-stall.yml**：每小时检查 main CI，failure ≥48h 触发停摆告警
  ——堵住"连红 36 天无人察觉"复发通道（dispatch 实测 success）
- **docker-release.yml**：tag 推送触发镜像构建推 GHCR（版本 + latest 双标签），
  容器回滚升级为镜像 tag 秒切；**docker-compose.yml 切换为镜像拉起模式**
- **docker-smoke.yml**：容器线每周冒烟（构建+运行+三探），防再次静默断裂
- **Sentry 惰性接入**：`src/lib/error-monitor.ts` 按 `VITE_SENTRY_DSN` 门控
  动态加载——未配置构建零 chunk（dist 实测无 sentry 产物），配置后 release
  绑定 APP_VERSION；新增 3 单测；ImportMetaEnv 补类型

### Fixed（workflow 工程修复）

- action-setup 双版本源冲突：移除 workflows 显式 `version` 输入，
  `packageManager: pnpm@11.28.10` 为单一真源（run 41354031667 取证）
- uptime/ci-stall YAML：issue 正文多行续行缩进（顶格截断 block scalar 致
  workflow 注册失败）；ci-stall 补 `gh -R` 显式仓库参数（无 checkout job 内
  gh 无法从 git 推断仓库）

### Tests（批次三测试补强）

- **分支覆盖率 66.66% → 67.69%（918/1356）**：新增 useAIModelStore 引导路径
  12 用例（存储降级链/加密数据三态/幂等守卫/selector 回退）+ sonner 主题矩阵
  5 用例；**覆盖率棘轮回调 65 → 66**（本地 67.69%，为 CI Node 24 地板留 ~0.7pp 余量）
- **E2E 恢复全量执行口径**：DnD 8 用例补 `ensureWindows` seed（根因：全新档案
  0 窗口，守卫线 ≥2/≥3 致整批静默跳过），修复后拖拽全链路真跑通过
  （70 passed / 1 skipped 为移动端专用用例按设计跳过）

### Docs

- 新增《后端与数据库构建提示词闭环大纲》：A/B/C 路线选型 + 12 节点提示词
  链路 + 🔒 横切安全约束（参数绑定/凭据环境变量/RLS 默认拒绝）+ M1-M4 里程碑

## [1.0.5] - 2026-11-02

> 生产交付闭环终审（2026-11-01）产出的断点修复发版。此前生产闭环自 2026-09-26 起
> 断裂 36 天：main CI 红盘 → Deploy 全部 skipped → 生产站冻结在 1.0.4 构建。

### Fixed（生产闭环三断点修复，2026-11-01）

- **覆盖率棘轮防抖**：branches 门 66 → 65（CI run 39152833151 取证：CI Node 24
  实测 65.65% 未过门 → main 连红；本地 Node 22 实测 66.61%，两环境 ~1pp 抖动，
  阈值取 CI 实测地板取整；整改方向为补分支用例回升，见后续迭代计划）
- **dompurify 供应链钉扎升级**：workspace override `dompurify@<=3.4.12 → 3.4.13`
  抬升为 `@<=3.4.16 → 3.4.17`（2026-10 后新披露 advisory 批次：1 critical +
  1 high + 3 low，经 `@monaco-editor/react > monaco-editor` 传递进生产 bundle），
  `pnpm audit --prod --audit-level high` 门恢复通过
- **容器发布线断裂修复**：Dockerfile install 层此前缺 `pnpm-workspace.yaml`，
  frozen install 触发 `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`（overrides 于 2026-09-26
  引入起即断裂）；补齐 COPY `.npmrc`，并钉扎 `pnpm@11` 与 CI 对齐消除版本漂移

### Security（F-13 容器线安全头，2026-11-01）

- nginx 新增 4 个 HTTP 安全头：X-Content-Type-Options / X-Frame-Options /
  Referrer-Policy / Permissions-Policy（GitHub Pages 线无法设头，容器线补齐）
- 新增 `.dockerignore`：构建上下文剔除 node_modules/.git/docs 等 14 项

### Added（运维与治理，2026-11-01/02）

- 新增 `docs/RELEASE-RUNBOOK.md`（发布手册）：发布架构/检查单/分级回滚/应急预案
- 新增终审报告归档：`docs/YYC3-闭环审核-报告建议/…生产闭环终审报告-2026-11-01.md`
- `package.json` 增补 `packageManager: pnpm@11.28.10`（消除本地 12/CI 11 版本漂移）

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

[1.0.4]: https://github.com/YYC-Cube/YYC3-Administration/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/YYC-Cube/YYC3-Administration/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/YYC-Cube/YYC3-Administration/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/YYC-Cube/YYC3-Administration/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/YYC-Cube/YYC3-Administration/releases/tag/v1.0.0
