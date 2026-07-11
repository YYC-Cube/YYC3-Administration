# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
