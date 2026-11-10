---
file: ADR-0003-pg15-dialect.md
description: 后端闭环 P2 —— 数据库方言与访问库选型（本机 PG 15 主库，修订 ADR-0002 的 SQLite 载体）
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-10
updated: 2026-11-10
status: accepted
tags: [backend],[adr],[postgresql],[drizzle],[p2]
category: adr
---

# 🏛️ ADR-0003 · 数据库方言与访问库选型（P2）

> 触发：用户提供**本机 PostgreSQL 15 主库（localhost:5433，Homebrew postgresql@15）**
> ——ADR-0002 §五的「常驻主机」部署档位实测成立，且常驻**数据库**已就位。
> 本文修订 ADR-0002 §四的 SQLite 载体，其余裁定（单容器/单服务/Hono/唯一数据访问
> 模块/越权矩阵/复用 GHCR 管线）全部不变。端口连通性已实测：`pg_isready → accepting connections`。

## 一、方言对比：SQLite（ADR-0002 原选） vs 本机 PostgreSQL 15

| 维度            | SQLite（better-sqlite3） | 本机 PG 15（实测在位）                                    | 对本项目权重                |
| --------------- | ------------------------ | --------------------------------------------------------- | --------------------------- |
| 新增基础设施    | 零（单文件）             | **零（主库已在运行）**                                    | 打平——SQLite 原最大优势消失 |
| settings 单文档 | TEXT 存 JSON             | **jsonb + GIN 索引**（可查询/部分更新）                   | M1-1 加分                   |
| 单用户激活约束  | 部分索引支持             | **partial unique index 原生**                             | M1-2 加分                   |
| 并发写          | WAL 单写者               | **MVCC 多写者**                                           | 会话增量写加分              |
| 类型/约束       | 弱（CHECK 有限）         | **CHECK/枚举/timestamptz/级联完整**                       | 建模质量加分                |
| 最小权限        | 无角色体系               | **专用 LOGIN 角色**（非 superuser）                       | 🔒 纵深加分                 |
| RLS 等价纵深    | 无                       | **原生 RLS 可用**（本期以访问模块为主，RLS 列为后续硬化） | 远期加分                    |
| 备份/回滚       | 复制文件                 | **pg_dump 单库导出**                                      | 等价                        |
| 可逆性（R6）    | 文件即数据               | /export JSON + pg_dump 双通道                             | 等价                        |

**裁定：采用本机 PostgreSQL 15**。SQLite 的决定性优势（零设施）已被「主库在位」
清零，而 PG 在 jsonb / 部分索引 / 约束 / 角色体系上的增益全部命中 M1 实体需求。

## 二、访问库（ORM/查询构建器）对比

| 候选                            | 类型化 schema    | 迁移工具                 | 🔒 参数绑定                             | 与 ADR-0002 决策连续性                     | 体积/供应链面              |
| ------------------------------- | ---------------- | ------------------------ | --------------------------------------- | ------------------------------------------ | -------------------------- |
| **drizzle-orm + node-postgres** | ✅ schema 即类型 | drizzle-kit（生成/校验） | ✅ 恒为 $n 占位，`sql` 模板亦自动参数化 | ✅ **ADR-0002 原定库，仅换方言，API 不变** | 轻（无引擎二进制）         |
| Kysely                          | ✅ 查询构建      | ❌ 需另配迁移方案        | ✅                                      | ⚠ 需换库 + 补迁移工具                      | 轻                         |
| Prisma                          | ✅               | ✅                       | ✅                                      | ⚠ 换库；引擎二进制                         | 重（引擎 + generate 步骤） |
| pg 裸写 / zapatos               | ⚠ 弱             | ❌ 手工                  | ⚠ 依赖人工纪律                          | ❌ 与「降低人为失误面」目标冲突            | 轻                         |

**裁定：drizzle-orm（方言 pg-core）+ pg 驱动 + drizzle-kit（dev）+ tsx（迁移脚本运行器）**。
连续性理由：ADR-0002 的数据访问模块设计基于 drizzle API，方言切换零返工。

## 三、决策（ACCEPTED）

> **P2 数据面 = PostgreSQL 15（localhost:5433）+ drizzle-orm/pg + drizzle-kit；
> 专用最小权限角色 `yyc3_app` 连接；DATABASE_URL 经环境变量注入（🔒 勿入库）；**
> 隔离主防线 = 唯一数据访问模块（全部查询强制 `user_id` 作用域）+ 每行属主列 +
> 越权测试矩阵（P7）；PG 原生 RLS 列为后续硬化项（非本期门禁）。

安全映射（对应 Mimosa 硬约束）：所有业务查询经 drizzle 恒参数化；迁移 SQL 为静态
DDL（无外部输入拼接）；连接凭据仅存本地 `.env`；`yyc3_app` 仅授予库内 DML/DLL
所需权限，禁 superuser。

## 四、对既有文档的影响

- ADR-0002：§四载体 SQLite→PG 15（本文取代），§五部署档位定为「本机模式（档位①，
  后端与 PG 同主机）」，其余不变。
- 大纲 P2 产出物按本文方言落地（schema/迁移/访问模块/越权矩阵草案）。
- M3 网关同库复用（单库多 schema 或同 schema 分表，P5 定）。

## 五、激活前置（P5 服务端落地前完成即可）

```sql
-- psql -h localhost -p 5433 -d postgres（管理员身份执行一次）
CREATE ROLE yyc3_app LOGIN PASSWORD '<生成强密码>';
CREATE DATABASE yyc3_admin OWNER yyc3_app;
```

`.env`：`DATABASE_URL=postgres://yyc3_app:<密码>@localhost:5433/yyc3_admin` → `pnpm db:migrate`。
备份建议：`pg_dump` 每日 cron（P9 可观测节点一并落地）。
