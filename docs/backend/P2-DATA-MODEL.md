---
file: P2-DATA-MODEL.md
description: 后端闭环 P2 —— 数据模型 / 迁移 / 唯一数据访问模块 / 越权矩阵（PG 15 方言）
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-10
updated: 2026-11-10
status: implemented
tags: [backend],[p2],[schema],[postgresql],[drizzle]
category: plan
---

# 🗄️ P2 · 数据模型与迁移（PostgreSQL 15 方言，ADR-0003）

> 代码位置：`server/db/`（schema / client / repositories / migrate / migrations）。
> 范围 = P0 冻结的 M1 四实体 + 认证用户表；护栏与隐私分级沿用 P0 §五。

## 一、ER 概览（5 表）

```text
users ──1:1── user_settings            （jsonb 单文档，last-write-wins）
  │
  ├────1:N── ai_configs                （静态加密 api_key_cipher；partial unique 保证单激活）
  │
  └────1:N── chat_sessions ──1:N── chat_messages
                （≤50 会话）            （≤200 条/会话，seq 单调；user_id 冗余属主列）
```

| 表              | 关键列                                                                           | 约束/索引                                                 | 敏感级 |
| --------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- | ------ |
| `users`         | username(唯一，应用层小写归一) / password_hash(argon2id) / role                  | role CHECK 四枚举；username 唯一索引                      | 🔒 P0  |
| `user_settings` | user_id(PK/FK cascade) / data jsonb                                              | 主键即属主                                                | P2     |
| `ai_configs`    | user_id / provider CHECK / api_key_cipher(AES-GCM iv:tag:ct) / is_active         | **partial unique(user_id) WHERE is_active**；user_id 索引 | 🔒 P0  |
| `chat_sessions` | user_id / title / updated_at                                                     | (user_id, updated_at) 索引                                | P2     |
| `chat_messages` | session_id / **user_id（冗余属主列）** / seq / role CHECK(user,assistant,system) | unique(session_id, seq)；(user_id, session_id) 索引       | P2     |

护栏（应用层强制，P7 测试）：会话 ≤50/用户、消息 ≤200/会话（超限裁剪最旧）；
`user_settings.data` ≤256KB（对齐 P0/0001 先例）。

## 二、迁移

- 初始迁移 `server/db/migrations/0000_*.sql` 由 **drizzle-kit 从 schema.ts 生成**
  （`pnpm db:generate`），应用走 **drizzle 官方 migrator**（`pnpm db:migrate`，
  migrate.ts 入口，幂等、journal 记账）——源码零动态 SQL 面。
- 回滚脚本：`server/db/rollbacks/0001_init.down.sql`（psql 手工执行，P8 演练留档）。
- 后续演进：改 `schema.ts` → `pnpm db:generate` 生成 0001+ → `pnpm db:migrate` 应用。

## 三、唯一数据访问模块（RLS 等价主防线）🔒

`server/db/repositories.ts`——**全服务唯一的 SQL 出口**（P5 路由禁止直连 db）：

- 每函数首参恒为 `userId`（`assertUserId` 运行时守卫 + TS 强制）；
- 每条查询 `where` 必含属主条件；写路径全部携带属主列；
- `updateXxx/deleteXxx` 以 `and(eq(userId), eq(id))` 双条件——**他人资源=0 行受影响
  → 路由层回 404**（不暴露存在性）；
- 事务：单激活切换、消息追加+超限裁剪，均原子；
- 🔒 参数绑定：drizzle 恒以 `$n` 占位下发（`sql` 模板亦自动参数化），模块内禁止
  字符串拼接 SQL；迁移为静态 DDL。

## 四、越权测试矩阵（P7 执行基线草案）

| 资源          | 操作               | 匿名(未登录) | 他人(已登录, 非属主)                          | 属主                           |
| ------------- | ------------------ | ------------ | --------------------------------------------- | ------------------------------ |
| user_settings | GET/PUT            | 401          | 404（按 userId 路由参数取数据，本表天然单人） | 200                            |
| ai_configs    | 列表/新建          | 401          | 仅见自己（列表恒作用域）                      | 200                            |
| ai_configs    | 改/删/激活他人 id  | 401          | **0 行 → 404**（不得 403 泄露存在性）         | 200                            |
| chat_sessions | 建/列/删           | 401          | 他人会话 id → 0 行 → 404                      | 200                            |
| chat_messages | 追加(他人 session) | 401          | 会话属主校验失败 → 404                        | 200（seq 单调，>200 触发裁剪） |
| export        | GET                | 401          | —（恒自身数据）                               | 200 JSON                       |

## 五、激活步骤（需本机凭据，一次性）

1. 管理员执行 ADR-0003 §五 SQL（建 `yyc3_app` 角色 + `yyc3_admin` 库）；
2. `.env` 写 `DATABASE_URL`（🔒 gitignored，勿入库）；
3. `pnpm db:migrate` → 验证 5 表 + 索引建立；
4. 回滚演练：`psql -f 0001_init.down.sql`（P8 前置演练留档）。

## 六、与存量资产的关系

- Supabase `0001_phase1_profiles_settings.sql` **保留存档不激活**（ADR-0001/0002 决策链）；
  其 RLS 属主范式由本模型「属主列 + 访问模块」等价承载；
- 前端 `user-data-sync.ts` 在 P6 接线时改指自建 API（M1-1），本地模式零破坏不变。
