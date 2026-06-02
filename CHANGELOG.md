# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
