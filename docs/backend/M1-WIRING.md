---
file: M1-WIRING.md
description: 后端闭环 P5+P6+P8 —— 数据面路由 / 前端接线 / 容器化与实地验收记录（M1 全链闭环）
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-12
updated: 2026-11-12
status: implemented-verified
tags: [backend],[p5],[p6],[p8],[m1],[e2e]
category: plan
---

# 🔗 M1 全链接线与实地验收（P5 + P6 + P8-lite）

> M1 冻结范围四项全部打通并实地验证：M1-0 认证(P3)、M1-1 settings 云同步、
> M1-2 AI 配置(加密)、M1-3 聊天会话——UI → 同源代理 → Hono → PG 全链绿。

## 一、P5 数据面路由（`server/routes/data.ts`，挂载 `/data` 前缀）

| 端点                                                            | 说明                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------- |
| GET/PUT `/data/settings`                                        | 单文档读写(契约信封 + 256KB 护栏);无文档返回 `{data:{},updatedAt:null}` |
| GET/POST `/data/ai-configs`                                     | 列表(契约 DTO 恒无密文)/创建(**AES-256-GCM 静态加密**入库)              |
| PUT/DELETE `/data/ai-configs/:id`                               | 更新(key 可换密)/删除;他人资源 → **404 不泄露存在性**                   |
| POST `/data/ai-configs/:id/activate`                            | 单激活切换(事务 + partial unique 双保险)                                |
| POST/GET `/data/chat/sessions`、`/:id`、`/:id/messages`、DELETE | 会话/消息全链(50×200 护栏、seq 单调、消息冗余属主列)                    |
| GET `/data/export`                                              | R6 可逆出口;**P0 红线:不含任何 api key(密文/明文均不导出)**             |

加密:`server/crypto/secret-box.ts`(AES-256-GCM,scrypt 派生自 DATA_ENC_KEY→回落 JWT_SECRET)。

## 二、P6 前端接线

- `src/services/api-client.ts`:`apiFetch` + `ApiClientError`(信封解析);
  启用开关 = **构建期 `VITE_API_MODE=true`**(Pages 纯静态线不设 → 本地模式零破坏)。
- 认证分支:`useAuthStore` login/register/logout/checkSession 四路 API 分支
  (同源 `/api/*`,Cookie 会话);契约映射唯一实现 `contractUserToUser`
  (消费 P4 `ContractAuthUser` 零漂移桥)。
- settings 同步:`src/services/self-data-sync.ts`(水合 GET + 防抖 PUT,1.5s)
  ——镜像 Supabase 版生命周期;挂载件 `user-data-sync.tsx` 双模分流
  (API 模式优先,Supabase 路径存量保留)。
- 同源代理:`vite.config` server/preview 均 `/api → localhost:8787`
  (生产=反代同域转发,runbook 已注);Cookie SameSite=Strict 天然成立。

## 三、P8-lite 容器化与 CI

- `Dockerfile.server`:node22-alpine + pnpm@11 钉扎 + HEALTHCHECK +
  **启动即幂等迁移**(`pnpm db:migrate && pnpm start:server`)。
- `docker-compose.yml`:`--profile server` 三服务(api/db/前端 app 独立);
  db 为项目专用 PG 15 容器(数据卷持久化),外部主库时可用 DATABASE_URL 替代。
- CI e2e job:**services postgres:15-alpine**(5433) + `DATABASE_URL` job env +
  API 预启动(迁移+serve)——M1 全链 spec 在 CI 与本地同构执行。

## 四、实地验收记录（全部实测,2026-11-12）

**L1 活库全 CRUD 链(bash, 真服务+真 PG)**:21 项断言全过——register 201/settings
PUT 回读(theme:cyberpunk)/AI 配置创建(响应零明文)+单激活切换/会话+消息(seq=[1,2])/
export 零密钥/守卫组(无 Origin 403、未登录 401×4、坏请求体 422)/**越权写语义
(他人资源改删激活追读 全 404)**/库内零明文 key。

**L2 Playwright M1 全链(浏览器 UI → preview 代理 → API → PG)**:
`tests/e2e/m1-full-chain.spec.ts` 单流测试全绿(1.8s)——UI 注册(注册模式表单
四字段)→ 认证态入应用 → settings PUT/GET 闭环(e2eMarker 回读)→ ai-configs
契约边界 → **独立未登录上下文 401 隔离对照**。
配套:playwright 双 webServer(preview 5173 + API 8787/healthz);全量 chromium
回归 **70 passed**(CSRF allowlist 修复后登录态 spec 全恢复)。

**L3 容器部署链**:Dockerfile.server 构建 → 容器运行(挂专用 PG)→ 迁移幂等
应用 → healthz db:true → 注册 201。

## 五、本节发现与修复(过程留档)

| 发现                                                    | 处置                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| CSRF 拒绝代理拓扑(Origin=5173≠Host=8787)                | 守卫增 `API_ALLOWED_ORIGINS` allowlist(同源直连仍默认放行);全量回归恢复 70 绿     |
| PG 15 主库(5433)已变更为 **PG 17 流复制 standby**(只读) | 环境演进实证;改用**项目专用 PG 15 容器**(55432/yyc3-pg)承载 M1 验证;ADR-0003 增补 |
| E2E 限流耗尽(register 3/h/ip 被多轮测试打满)            | register 放宽 10/h + `AUTH_RATELIMIT_DISABLED=true`(仅本地/E2E;生产勿设)          |
| Playwright 每测试新建 context                           | spec 改单流顺序设计;401 隔离用独立 context 对照                                   |
| tsx 不读 .env                                           | scripts 统一 `--env-file-if-exists=.env`(CI 文件缺失回落 job env)                 |

## 六、遗留(不阻塞 M1)

- 服务器镜像 GHCR tag 化(docker-release.yml 仅构建前端镜像)——P8 续。
- settings 字段级契约细化(P4 备注,M2)。
- 多实例限流共享存储、pg_dump 定时备份(P8/P9)。
