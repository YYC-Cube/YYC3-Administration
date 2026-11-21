---
file: M2-DOMAIN-DRAFT.md
description: M2 批次三（草案待修订）—— 纯 mock 域字段建模草案（来源：Knowledge 卷 yyc3-mana 架构文档 + 前端既有类型对照）
author: YYC-Cube Team <admin@0379.email>
version: v0.1.0-draft
created: 2026-11-13
updated: 2026-11-13
status: draft
tags: [backend],[m2],[draft],[schema],[crm]
category: plan
---

# 📝 M2 批次三（草案·待修订）—— 纯 mock 域字段建模

> 来源检索：`/Volumes/Knowledge/YYC3-项目资产-文档抽取/01-架构设计/`
> `YYC3-yyc3-mana-架构-03-数据架构需求规划文档.md` §2(核心实体 TS 模型+ER)
> 与 `YYC3-Menu-架构类-营销自动化设计.md`(Campaign 概览)。
> 对照：前端既有类型（contacts-context `SharedContact`、customer-acquisition `Lead`、
> clm `stageCounts`、task-board-data `Task`）。
> 🔒 全表沿用既定范式：uuid PK / user_id 属主 cascade / CHECK 枚举 / 全参数绑定。

## 一、来源模型 → 本项目表草案(映射与裁剪)

| Knowledge 实体        | → 表                         | 裁剪说明                                                                                                                               |
| --------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Customer              | `customers`                  | tier/status/lifecycle 原样收编；profile(画像/行为)折叠为 jsonb `profile`(查询需求出现再行式化)——与 user_settings 单文档先例一致        |
| Task(CRM 任务型)      | `crm_tasks`                  | ⚠️ 与既有 `toolkit task-board Task`(看板任务)是**两个不同域**——CRM 任务挂 customerId,看板任务保持 user_documents 文档;命名区隔避免混淆 |
| Invoice + InvoiceItem | `invoices` + `invoice_items` | 明细行式(金额计算需行级);invoice_number unique(属主内)                                                                                 |
| Transaction           | `transactions`               | method/status 枚举 CHECK;invoiceId FK                                                                                                  |

## 二、表字段草案

### customers(客户域,前端 clm/contacts/customer-care 共用)

| 列                                           | 类型/约束                  | 对齐前端                                  |
| -------------------------------------------- | -------------------------- | ----------------------------------------- |
| id uuid PK                                   | gen_random_uuid()          |                                           |
| user_id FK cascade                           | 属主                       |                                           |
| name text NOT NULL                           |                            | SharedContact.name                        |
| company/industry text                        | 可空                       |                                           |
| tier CHECK(bronze,silver,gold,platinum)      | 默认 bronze                | levelFilter(level)                        |
| status CHECK(active,inactive,churned)        | 默认 active                | statusFilter                              |
| stage CHECK(prospect,active,at_risk,churned) | 默认 prospect              | **SharedContact.stage / clm stageCounts** |
| score integer CHECK(0-100)                   | 生命周期评分               |                                           |
| email/phone/address jsonb                    | 联系信息(ContactInfo 收编) |                                           |
| profile jsonb                                | 画像(折叠)                 |                                           |
| created_at/updated_at                        | timestamptz                |                                           |

索引：unique(user_id, name)?(属主内客户名唯一策略**待修订**)；index(user_id, stage)。

### crm_tasks(客户任务域;区别于 task-board 看板)

| 列                                                    | 类型/约束                         |
| ----------------------------------------------------- | --------------------------------- |
| id / user_id / customer_id FK cascade                 |                                   |
| assigned_to uuid FK→users 可空                        | Knowledge 模型有指派;单用户期可空 |
| title text NOT NULL / description text                |                                   |
| type CHECK(call,meeting,email,follow_up,custom)       |                                   |
| priority CHECK(low,medium,high,urgent)                |                                   |
| status CHECK(pending,in_progress,completed,cancelled) |                                   |
| due_date timestamptz 可空 / completed_at 可空         |                                   |
| tags text[]                                           |                                   |

### invoices / invoice_items / transactions(财务域)

- invoices：customer_id FK、invoice_number text **unique(user_id, invoice_number)**、
  amount numeric(12,2)、currency CHAR(3) 默认 CNY、
  status CHECK(draft,pending,paid,overdue,cancelled)、due_date/paid_at
- invoice_items：invoice_id FK cascade、description、quantity、unit_price、total(应用层算)
- transactions：invoice_id FK、amount、method CHECK(credit_card,bank_transfer,cash,other)、
  status CHECK(pending,completed,failed,refunded)、reference 可空

## 三、与前端 mock 的对齐缺口(待修订清单)

1. `SharedContact` 完整字段清单未逐项比对(contacts-context.tsx 较大)——实施前需并读映射,差异字段进 `_metadata` jsonb 或提列
2. tier/level 前后端命名不一致(levelFilter 用 level)——统一命名**待你定**
3. 十域其余(overview KPI/marketing Campaign/platform)字段粒度需产品输入:营销域 Knowledge 侧有 CampaignBrief/Campaign/channels 骨架,可作 M2 批次三起点
4. 客户名唯一性、软删除(is_archived)策略待定

## 四、实施路径(修订确认后)

1. schema.ts 增 4 表 → `pnpm db:generate`(0002 迁移) → down 脚本
2. repositories(唯一数据访问模块,scope 强制属主) + 路由 `/data/customers|crm-tasks|invoices`
3. 前端接线(customer 域接 /api,P6 模式) + 越权矩阵扩展
4. 云/本地双模 E2E 全绿 → 进入 P11 终审复跑
