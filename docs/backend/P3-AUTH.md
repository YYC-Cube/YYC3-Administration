---
file: P3-AUTH.md
description: 后端闭环 P3 —— 认证与权限实现与验证（argon2id/JWT/httpOnly/CSRF/限流，F-05/F-19 清偿）
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-10
updated: 2026-11-10
status: implemented
tags: [backend],[p3],[auth],[security]
category: plan
---

# 🔐 P3 · 认证与权限（M1-0，F-05/F-19 清偿）

> 代码：`server/auth/*`（password/token/rate-limit/middleware/routes）+ `server/app.ts`
>
> - `server/index.ts`；数据面沿用 P2 唯一数据访问模块。运行：`pnpm dev:server` /
>   `pnpm start:server`（PORT 默认 8787）。

## 一、方案要点（ADR-0002/0003 落地）

| 项         | 实现                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| 密码哈希   | **argon2id**（@node-rs/argon2 预编译二进制，随机盐；损坏哈希 verify=false 不抛出）                          |
| 会话       | JWT **HS256**（hono/jwt），载荷 `{sub, role}`，TTL 7d；**JWT_SECRET 仅 env**（≥32 位强校验）                |
| Cookie     | `yyc3_session` **httpOnly + SameSite=Strict + Path=/**；`COOKIE_SECURE=true` 时加 Secure（反代 https 启用） |
| CSRF       | 写方法强制 **Origin≡Host**（缺失/跨源/不可解析 → 403，测试构造回退请求 URL host）                           |
| 限流(F-19) | 内存滑动窗口：login 5/60s(ip:username)、register 3/1h(ip)；超限 429+retryAfterSec                           |
| 防枚举     | 登录失败统一 401 `invalid_credentials`（不区分用户不存在/密码错误）                                         |
| 角色       | users.role 四枚举(CHECK)；`requireAuth`/`requireRole(...)` 中间件；/me 返回 DB 实时角色                     |
| 会话注销   | logout 清 Cookie；用户已删时 /me 清 Cookie 并 401                                                           |

## 二、路由

`POST /auth/register`（422 校验 / 409 重名 / 429 限流；成功 201 即建会话，role=viewer 最小权限）
`POST /auth/login`（200+Cookie / 401 防枚举 / 429）
`POST /auth/logout`（200 清 Cookie）
`GET /auth/me`（401 / 200 实时档案）
`GET /healthz`（db ping，接 uptime 拨测备选）
`GET /admin/ping`（P3 角色门示例，M2 由真实资源路由替换）

## 三、验证记录

**单测（CI 无库可跑，14 例）**：argon2id 往返/坏哈希容错；JWT 往返/篡改 null/过期 null；
限流窗口滑动与 retryAfter；register 201+Cookie 属性/409；login 防枚举 401；
CSRF 无 Origin/跨源 403（路由未触达）；me 401/200；**越权矩阵：viewer→/admin/ping 403，admin 200**；logout 清 Cookie。全套 729 tests 绿。

**活库端到端（本机 PG 15.15 实测）**：

```
healthz → {"status":"ok","db":true}
register p3_smoke → 201 + set-cookie(yyc3_session, HttpOnly, SameSite=Strict)
me(cookie) → 200 实时档案
login 正确密码 → 200
login 错误密码 ×6 → 401×5 → 429   ← F-19 实证
POST 无 Origin → 403              ← CSRF 实证
烟测数据已清理(users=0)
```

## 四、F-05 前端侧清偿（生产 bundle 无凭据实证）

- `GHOST_ACCOUNTS` 移除 password 字段；演示密码经 `src/lib/demo-credentials.ts`
  运行时派生（`dev-<user>-only`），本地演示 login→register 兜底自洽；
  useAuthStore 播种同公式；GHOST 入口保持 DEV&&VITE_GHOST_MODE 门控；E2E 旁路
  为直接状态注入不受影响。
- **DoD 实证**：生产构建 `dist/assets` grep `admin123|ghost-manager|ghost-agent|
ghost-viewer|dev-admin-only` → **全部 0 命中**。
- locale 提示文案同步去凭据（en/zh），相关单测断言已更新。

## 五、边界与后续

- 多实例部署时限流需换共享存储（P8 评估）；litestream/pg_dump 备份归 P9。
- role 变更即时性：令牌内 role 最长 7d 迟滞，敏感操作可加 /me 重校验（P5 数据面路由统一走 requireAuth+实时查库）。
- 下一节点 **P4 API 契约**：zod schema 单一真源（服务端已用 zod 校验，前端类型共享同源化）。
