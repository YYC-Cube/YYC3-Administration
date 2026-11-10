---
file: P4-CONTRACT.md
description: 后端闭环 P4 —— API 契约与类型共享（zod 单一真源 + 错误码表 + 前端零漂移桥）
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-11
updated: 2026-11-11
status: implemented
tags: [backend],[p4],[contract],[zod]
category: plan
---

# 📜 P4 · API 契约与类型共享（单一真源）

> 代码：`server/contract/`（errors / auth / settings / ai-configs / chat / index barrel）。
> 消费方：服务端路由（运行时校验）+ 前端（`import type` 零运行时成本，zod 不进前端 bundle）。

## 一、设计原则

1. **单一真源**：请求/响应/错误信封全部以 zod schema 定义，类型经 `z.infer` 派生，
   禁止手写第二份字段清单（DoD：类型恒等测试 `expectTypeOf` 锁定）。
2. **错误码表**：`ERROR_STATUS`（业务码 ↔ HTTP 状态唯一映射）+ `ApiError` 统一信封；
   路由错误体以 `satisfies ApiError` 编译期锁定——**新增错误码必须先入表**。
3. **隐私由类型承载**：`AiConfig` 线上 DTO 恒无 `api_key_cipher`/`apiKey`（测试锁定
   shape）；密文不出服务端，明文 key 仅出现在创建/更新请求（HTTPS 反代终结）。
4. **演进策略**：M1 期内 additive-only（只加字段/码，不改义）；字段级 settings schema
   待 M2 契约细化；破坏性变更走 v2 路径。

## 二、错误码表（10 码）

| 码                  | HTTP | 场景                                          |
| ------------------- | ---- | --------------------------------------------- |
| invalid_input       | 422  | zod 校验失败（issues[].path 为 '.' 连接形态） |
| conflict            | 409  | 用户名占用                                    |
| rate_limited        | 429  | 限流（携带 retryAfterSec）                    |
| unauthorized        | 401  | 会话缺失/无效/用户已删                        |
| invalid_credentials | 401  | 登录失败（防枚举统一码）                      |
| csrf_rejected       | 403  | Origin 校验失败                               |
| forbidden           | 403  | 角色权限不足                                  |
| not_found           | 404  | 资源不存在/他人资源（不暴露存在性）           |
| internal_error      | 500  | 兜底                                          |
| service_unavailable | 503  | healthz 降级                                  |

## 三、域契约

| 域         | 请求                                                                                     | DTO/响应                                      |
| ---------- | ---------------------------------------------------------------------------------------- | --------------------------------------------- |
| auth       | CredentialsSchema（username 归一小写+字符白名单、password 8-128）/ RegisterRequestSchema | AuthUser（无私有列）、AuthResponse            |
| settings   | PutSettingsRequest `{data: Record<string,unknown>}`（256KB 护栏服务端强制）              | SettingsDocument                              |
| ai-configs | Create/UpdateAiConfigRequest（endpoint http(s) refine、provider 白名单）                 | AiConfig（无 cipher）、AiConfigList           |
| chat       | CreateChatSessionRequest / AppendChatMessageRequest（role 白名单、content ≤64k）         | ChatSession / ChatMessage / ChatSessionDetail |

## 四、消费方式

- **服务端**：`import { CredentialsSchema } from '@server/contract/auth'` → safeParse；
  错误体 `satisfies ApiError`（P4 已改造 routes.ts 落地）。
- **前端（零漂移桥）**：`src/types/auth.ts` 增 `ContractAuthUser = import('@server/contract/auth').AuthUser`
  ——类型级引用，vite 无需解析 `@server`（import type 编译期消除）；
  P6 接线时 User↔AuthUser 映射以此类型为唯一基准。

## 五、验证记录（本节点实证）

- **9 个契约单测**（全套 738 绿）：错误码全覆盖信封 parse；HTTP 状态区间；
  toApiIssues 路径拍平（`user.tags.2`）；Credentials 语义（小写归一/白名单/长度）；
  RegisterRequest 裁剪；**类型恒等 expectTypeOf**（AuthUser/AiConfig）；
  **隐私 shape 锁定**（DTO 无 cipher/key）；endpoint http(s) 与 provider 白名单。
- 门禁：typecheck / lint 0 err / 738 tests / build 全绿。

## 六、后续衔接

**P5 服务端实现**：/settings、/ai-configs、/chat 数据面路由直接消费本契约 +
P2 repositories；/ai-proxy 网关（M3）同源扩展。**P6 前端接线**：api-client +
数据源开关，M1-1 settings 云同步切换。
