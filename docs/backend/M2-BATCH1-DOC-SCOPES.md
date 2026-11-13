---
file: M2-BATCH1-DOC-SCOPES.md
description: M2 批次一 —— user_documents 通用域文档表(任务板/智能表单云端化)实施与验收
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-13
updated: 2026-11-13
status: implemented-verified
tags: [backend],[m2],[user-documents],[task-board],[smart-form]
category: plan
---

# 📦 M2 批次一 · 通用域文档表（task-board / smart-form 云端化）

> M2 首批落地：P0 §四判定「M2 建表」的两个真实持久化域（task-board / smart-form）
> 以**通用域文档表**接入自托管后端。行式细粒度建模留待该域出现查询需求时演进。

## 一、数据模型

`user_documents`（迁移 0001_stormy_vulcan + rollbacks/0001_user_documents.down.sql）：

| 列                             | 说明                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| id uuid PK                     |                                                                                          |
| user_id uuid FK→users(cascade) | 属主                                                                                     |
| scope text                     | 域标识；**白名单校验在路由层**（DocScopeSchema: task-board / smart-form，additive 扩展） |
| data jsonb                     | 域文档(≤256KB 护栏,服务端强制)                                                           |
| updated_at                     |                                                                                          |

索引：unique(user_id, scope)（每用户每域一份）；index(scope)。

**架构决策**：单文档而非行式——前端 store 即整文档持久化(zustand persist)，
单文档映射零阻抗；细粒度行式留待查询/协作需求出现（写入 ADR 后续版本）。

## 二、管线（全复用 M1 模式）

- 契约：`server/contract/docs.ts`（DocScopeSchema 白名单 + ScopeDocument 信封，
  updatedAt nullable 语义同 settings）
- repositories：`getUserDoc` / `upsertUserDoc`（assertUserId + 256KB 护栏 +
  onConflictDoUpdate）
- 路由：GET/PUT `/data/docs/:scope`（requireAuth；白名单外 scope → 422 未知域）

## 三、活库验收（compose 部署栈实测）

```
迁移重放 → user_documents 表建立
GET 未建域 → 200 {scope, data:{}, updatedAt:null}
PUT 写入 → 200 回读一致(tasks:[...])
第二域 smart-form 独立写入 → 200
非法 scope → 422 | 未登录 → 401
演练数据清理 → users 归零
```

## 四、前端接线(下一批)

smart-form / task-board 前端 store 接线复用 P6 模式
(apiFetch + 数据源开关)，随 M2 批次二推进。
