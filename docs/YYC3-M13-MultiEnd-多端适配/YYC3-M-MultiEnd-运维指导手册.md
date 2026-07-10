---
file: YYC3-M-MultiEnd-运维指导手册.md
description: YYC³ 多端适配运维指导手册 — 部署、监控、故障排查、性能优化
author: YanYuCloudCube Team <admin@0379.email>
version: v2.0.0
created: 2026-07-11
updated: 2026-07-11
status: stable
tags: [运维],[多端适配],[PWA],[部署],[监控]
category: operations
language: zh-CN
audience: devops,developers
complexity: intermediate
---

# YYC³ 多端适配运维指导手册

---

> **文档版本**：v2.0.0
> **更新日期**：2026-07-11
> **全局测试**：347/347 全部通过 (11 测试文件)

---

## 1. 部署流程

### 1.1 构建产物

```bash
pnpm build
```

产物目录 `dist/` 关键文件：

| 文件               | 用途                                       |
| ------------------ | ------------------------------------------ |
| `index.html`       | 应用入口                                   |
| `sw.js`            | Service Worker（PWA 离线核心）             |
| `workbox-*.js`     | Workbox 运行时                             |
| `assets/*.js`      | 代码分包（vendor-react, vendor-charts 等） |
| `site.webmanifest` | PWA 清单                                   |
| `CNAME`            | 自定义域名（admin.yyc3.vip）               |

### 1.2 部署到 GitHub Pages

自动触发：`main` 分支 push → [deploy.yml](file:///Users/yanyu/YYC-Cube/YYC3-Administration/.github/workflows/deploy.yml)

手动触发：

```bash
gh workflow run deploy.yml
```

### 1.3 Docker 部署

```bash
docker build -t yyc3-admin .
docker run -p 80:80 yyc3-admin
```

Nginx 配置已内置在 [Dockerfile](file:///Users/yanyu/YYC-Cube/YYC3-Administration/Dockerfile) 中，包含：

- SPA 路由回退（`try_files $uri /index.html`）
- 静态资源 1 年强缓存
- Gzip 压缩

---

## 2. 监控指标

### 2.1 PWA 关键指标

| 指标          | 获取方式                        | 正常范围 |
| ------------- | ------------------------------- | -------- |
| SW 注册成功率 | `navigator.serviceWorker.ready` | > 95%    |
| 缓存命中率    | Workbox 事件                    | > 80%    |
| 离线可用率    | `navigator.onLine` + SW         | > 99%    |
| 安装转化率    | `beforeinstallprompt` 事件      | 监控趋势 |

### 2.2 响应式适配指标

| 指标           | 获取方式          | 正常范围 |
| -------------- | ----------------- | -------- |
| 移动端加载时间 | Lighthouse Mobile | < 3s     |
| 断点切换卡顿   | Performance API   | < 50ms   |
| 触控响应延迟   | 自定义事件        | < 100ms  |

### 2.3 离线存储指标

| 指标             | 获取方式                       | 正常范围 |
| ---------------- | ------------------------------ | -------- |
| IndexedDB 可用率 | 功能检测                       | > 95%    |
| 存储配额使用率   | `navigator.storage.estimate()` | < 80%    |
| 读写延迟         | 自定义计时                     | < 50ms   |

---

## 3. 性能优化

### 3.1 构建优化

已配置的代码分包策略（[vite.config.ts](file:///Users/yanyu/YYC-Cube/YYC3-Administration/vite.config.ts)）：

| Chunk           | 内容             | 大小    |
| --------------- | ---------------- | ------- |
| vendor-react    | React + ReactDOM | ~189 KB |
| vendor-charts   | Recharts + D3    | ~388 KB |
| vendor-markdown | Markdown 渲染    | ~231 KB |
| vendor-other    | 其他依赖         | ~327 KB |
| vendor-monaco   | Monaco 编辑器    | ~12 KB  |
| vendor-radix    | Radix UI 原语    | ~22 KB  |
| vendor-motion   | 动画库           | ~33 KB  |
| vendor-lucide   | 图标库           | ~80 KB  |

### 3.2 PWA 缓存优化

- 静态资源 30 天强缓存，通过文件名 hash 自动更新
- API 数据 5 分钟 NetworkFirst，优先网络
- 图片资源 60 天缓存

---

## 4. 版本管理与回滚

### 4.1 版本检测

应用启动时自动检测版本（[App.tsx](file:///Users/yanyu/YYC-Cube/YYC3-Administration/src/app/App.tsx)）：

```typescript
// 版本变更时自动清除所有缓存
const storedVersion = localStorage.getItem('yyc_app_version')
if (storedVersion !== APP_VERSION) {
  localStorage.setItem('yyc_app_version', APP_VERSION)
  caches.keys().then((names) => names.forEach((name) => caches.delete(name)))
}
```

### 4.2 回滚步骤

```bash
# GitHub Pages 回滚
git revert <commit-hash>
git push origin main

# Docker 回滚
docker pull yyc3-admin:<previous-version>
docker stop yyc3-admin && docker rm yyc3-admin
docker run -d -p 80:80 --name yyc3-admin yyc3-admin:<previous-version>
```

---

## 5. 安全注意事项

1. **HTTPS 强制**：Service Worker 仅支持 HTTPS 或 localhost
2. **CSP 配置**：确保 Service Worker 脚本不被 CSP 阻止
3. **缓存敏感数据**：不要在 SW 缓存中存储用户凭证或敏感信息
4. **IndexedDB 隔离**：不同源的数据天然隔离，无需额外配置

---

## 6. 常见问题速查

| 问题               | 快速诊断                     | 解决                                     |
| ------------------ | ---------------------------- | ---------------------------------------- |
| PWA 无法安装       | 检查 HTTPS + manifest 有效性 | Chrome DevTools → Application → Manifest |
| 离线时白屏         | SW 未缓存关键资源            | 检查 `dist/sw.js` 预缓存列表             |
| 移动端布局错乱     | 检查 viewport meta 标签      | 确认 `viewport-fit=cover`                |
| 底部导航遮挡内容   | 安全区域未适配               | 检查 `.pb-safe` 类是否生效               |
| IndexedDB 写入失败 | 隐私模式 / 配额已满          | 降级方案 + 清理过期缓存                  |

---

## 7. 测试验证

### 7.1 快速验证

```bash
# 运行多端模块测试
pnpm vitest run tests/multi-end/

# 运行全局测试
pnpm vitest run
```

### 7.2 测试状态

| 时间       | 测试文件 | 测试用例 | 结果        |
| ---------- | -------- | -------- | ----------- |
| 2026-07-11 | 11       | 347      | ✅ 全部通过 |

---

## 8. 变更记录

| 版本   | 日期       | 变更内容                                   |
| ------ | ---------- | ------------------------------------------ |
| v1.0.0 | 2026-07-11 | 初始版本                                   |
| v2.0.0 | 2026-07-11 | 新增测试验证章节，更新全局测试状态 347/347 |
