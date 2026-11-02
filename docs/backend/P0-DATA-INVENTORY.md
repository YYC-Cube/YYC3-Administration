---
file: P0-DATA-INVENTORY.md
description: 后端构建 P0 —— 数据清单与隐私分级表 + 一期（M1）范围冻结
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-02
updated: 2026-11-02
status: frozen-signed
tags: [backend],[p0],[data-inventory],[privacy],[m1]
category: plan
---

# 📋 P0 · 数据清单与隐私分级表（需求与数据边界冻结）

> 闭环大纲节点 P0 交付物。基线：main(4308028) 实测扫描；审计基线：F-09（真实数据
> 闭环 25-30%）、F-02（mock 生产门控）、F-05（演示级认证）。
> 🔒 红线：P0 级实体（凭据/密钥类）**永不明文上传输、永不经前端持有服务端密钥**。

## 一、方法与取证面

- 全仓扫描 `localStorage` 直写、`secure-storage`(AES-GCM+PBKDF2) 消费方、
  zustand `persist` 键名、Supabase 客户端与同步服务、十域 features 目录结构。
- 键级清单为**源码实测**（非文档推断），每键标注代码位置。

## 二、存储键总表（实测）

| 存储键                                                                                           | 载体/加密                   | 内容                                             | 敏感级    | 代码位置                                                |
| ------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------ | --------- | ------------------------------------------------------- |
| `auth_users`                                                                                     | localStorage · AES-GCM 加密 | 注册用户表（用户名+密码哈希+F-05 无盐 SHA-256⚠） | **P0** 🔒 | `src/stores/useAuthStore.ts:31`                         |
| `auth_session`                                                                                   | localStorage · AES-GCM 加密 | 本地会话（登录态）                               | **P0** 🔒 | `src/stores/useAuthStore.ts:30`                         |
| `yyc3_ai_models`                                                                                 | localStorage · AES-GCM 加密 | AI 模型配置（endpoint + **apiKey**）             | **P0** 🔒 | `src/stores/useAIModelStore.ts:43`                      |
| `yyc3-active-model-id`                                                                           | localStorage 明文           | 激活模型 id                                      | P3        | 同上 `:44`                                              |
| `yyc3-settings-storage`                                                                          | zustand persist · 明文      | 全局设置（主题/语言/偏好）                       | P2        | `src/stores/useSettingsStore.ts`                        |
| `yyc3_chat_sessions` / `yyc3_chat_active_session`                                                | localStorage 明文           | 聊天会话（≤50 会话×≤200 消息护栏）               | P2        | `src/shared/hooks/use-chat-session.ts:37-38`            |
| `yyc3_form_submissions`                                                                          | localStorage 明文           | 智能表单提交（supply-chain 域业务数据）          | P1        | `src/features/supply-chain/pages/smart-form-data.ts:29` |
| `yyc3-task-board-storage`                                                                        | zustand persist · 明文      | 任务板数据（toolkit 域）                         | P2        | `src/features/toolkit/pages/task-board-store.ts`        |
| `yyc3-left-panel-storage` / `yyc3-window-storage` / `yyc3-workspace-storage` / `yyc3-cloudpivot` | zustand persist · 明文      | dev-workspace 布局/窗口/面板                     | P3        | `src/features/dev-workspace/**`                         |
| `yyc_app_version`                                                                                | localStorage 明文           | 版本缓存标记                                     | P3        | app 壳层                                                |

## 三、Supabase 存量资产（可激活面）

| 资产                             | 状态          | 内容                                                                                                                  |
| -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/0001`       | 已备未激活    | `profiles`（uuid 属主+角色 check）+ `user_settings`（jsonb 单文档，RLS 属主，256KB 护栏）                             |
| `src/lib/supabase-client.ts`     | 已实现        | URL/ANON_KEY 双变量齐备才激活，否则回落本地模式                                                                       |
| `src/services/user-data-sync.ts` | 已实现+已挂载 | `user_settings` upsert/hydrate 双向同步（剔除运行时字段，256KB 超限跳过上行并告警）——**激活 Supabase 即通，零新开发** |

## 四、十域数据形态矩阵

| 域                                                   | 数据现状                                                             | 云端化判断（一期/M1）                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| settings                                             | 真实持久化（settings-storage + 云同步就绪）                          | ✅ **M1-1**：激活即通（最低垂）                                        |
| settings/model-settings                              | 加密持久化（AI 模型）                                                | ✅ **M1-2**：迁云端用户级加密表                                        |
| conversation                                         | 真实持久化（chat_sessions）                                          | ✅ **M1-3**：云端会话表                                                |
| overview / customer / marketing / platform / finance | 内联 mock/常量数组（L2/L3 原型，F-09）；KPI 假实时已被 F-02 生产门控 | ⏸ **M2 起按契约逐域建模**（一期只冻结不实现）                          |
| supply-chain                                         | 表单提交真实持久化（本地）                                           | ⏸ 一期暂缓（P1 数据，M2 建 `form_submissions` 表）                     |
| toolkit                                              | 任务板持久化（本地）+ 工具集合                                       | ⏸ 一期暂缓（M2 `task_boards` 表）                                      |
| dev-workspace                                        | 窗口/布局持久化（本地）                                              | ♾ **保持本地**（UI 偏好无云同步价值）                                  |
| 认证（auth-context/useAuthStore）                    | 本地演示级认证（F-05）                                               | ✅ **M1-0（前置）**：Supabase PKCE 替换，GHOST 演示账号降级为 DEV-only |

## 五、隐私分级标准与红线 🔒

| 级别   | 定义               | 实例                                   | 处置规则                                                                                               |
| ------ | ------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **P0** | 凭据/密钥/会话令牌 | apiKey、密码哈希、session              | **永不明文过网、永不经前端持有服务端密钥**；云上存储必须服务端加密或仅存哈希；迁移 M1-0 时旧本地键清除 |
| **P1** | 个人标识/业务敏感  | 用户名邮箱、表单提交、（未来）客户档案 | 云端必挂属主 RLS；导出/删除权随用户                                                                    |
| **P2** | 业务内容           | 聊天记录、任务板、设置                 | 属主 RLS；256KB/条护栏（对齐 user_settings 先例）                                                      |
| **P3** | UI 偏好/非敏感     | 布局、主题、版本标记                   | 留本地，不入云                                                                                         |

## 六、读写频次与保留策略（定性）

- `settings`：高频写（每变更即 upsert）→ 云端单文档合并写；保留：随账号存续，删除账号即删。
- `chat_sessions`：中频增量（每消息）、容量护栏已有（50×200）→ 云端按会话行存储（非单文档），保留：用户自删 + 账号级联。
- `auth`：低频（登录/注册）→ 由 Supabase Auth 托管；保留：平台策略。
- `ai_models`：低频 → 用户级加密行；保留：随账号。
- 全局导出口：JSON 打包下载（呼应 Dexie 三阶段「同步出口」设计，可整体退回本地）。

## 七、一期（M1）范围冻结 ✂️

**进**：M1-0 认证替换（PKCE + profiles）→ M1-1 settings 云同步（激活即通）→
M1-2 AI 模型配置云端化 → M1-3 聊天会话云端化。顺序即依赖序（认证先行）。

**不进**（含理由）：十域业务数据（无契约与建模，M2 起）；表单提交/任务板（M2）；
窗口布局（P3 无价值）；**P0 红线**：服务端 AI 网关的密钥持有属 M3（B 线），M1 不迁移
apiKey 到任何服务端，仅做用户级加密存储搬迁。

## 八、开放问题（→P1 架构决策输入）

1. `auth_users` 存量本地用户（F-05 无盐哈希）**不可信**：切换 PKCE 后要求重新注册，
   本地演示数据不做迁移（写入 ADR-0001 理由链）。
2. `yyc3_settings-storage` 单文档 vs 拆域文档：256KB 护栏已实测逼近风险？（M1-1 前
   实测文档体积，超 60% 即拆域）。
3. 多端并发写冲突：settings upsert 以 updated_at 最后写赢是否够用（M1-1 决定）。
4. RLS 角色矩阵：0001 的 viewer/agent/manager/admin 与前端 UserRole 对齐已确认，
   业务表（M2）沿用同一枚举。

## 九、DoD 核验

- [x] 存储键级清单（源码实测定位）✅
- [x] 十域形态矩阵与云端化判断 ✅
- [x] 隐私四级标准 + P0 红线条款 ✅
- [x] 一期范围冻结（进/不进 + 理由）✅
- [x] 开放问题移交 P1 ✅
- [x] **签署**：✅ 已签署——用户于 2026-11-02 会话批复「继续衔接推进」，视为接受冻结
      范围（M1-0 认证替换 → M1-1 settings → M1-2 AI 配置 → M1-3 聊天会话；修订请求可
      随时提出，变更走本表 §七增补条目）
