/**
 * @file server/db/schema.ts
 * @description YYC³ Administration 自托管后端 —— 数据模型(P2, ADR-0003 PG 15 方言)
 *   范围 = P0 冻结的 M1 四实体 + 认证用户表(5 表);ER/护栏/越权矩阵见
 *   docs/backend/P2-DATA-MODEL.md。每表均以属主列承载隔离(主防线为
 *   repositories 唯一数据访问模块;PG 原生 RLS 列为后续硬化项)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p2,schema,drizzle,postgresql
 */

import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

// ==========================================
// users —— 认证用户(P3 落地;密码恒为 argon2id 编码串,禁存明文)
// ==========================================

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    /** 应用层小写归一后写入,唯一性由此索引保证 */
    username: text('username').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name'),
    /** 角色枚举沿用 P0/0001(Supabase 存档)口径 */
    role: text('role').notNull().default('viewer'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('users_username_uq').on(t.username),
    check('users_role_chk', sql`${t.role} in ('viewer', 'agent', 'manager', 'admin')`),
  ],
)

// ==========================================
// user_settings —— 每用户单文档(P1-1/M1-1 目标实体)
// ==========================================

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** 256KB 护栏在应用层(repositories)强制,对齐 0001 先例 */
  data: jsonb('data').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ==========================================
// ai_configs —— AI 模型配置(M1-2;api_key 静态加密存储)
// ==========================================

export const aiConfigs = pgTable(
  'ai_configs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    provider: text('provider').notNull(),
    endpoint: text('endpoint').notNull(),
    /** AES-GCM 密文,格式 base64(iv):base64(tag):base64(ct);密钥仅服务端 env */
    apiKeyCipher: text('api_key_cipher').notNull(),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ai_configs_user_idx').on(t.userId),
    // 单激活:partial unique 保证每用户至多一条 is_active
    uniqueIndex('ai_configs_user_active_uq')
      .on(t.userId)
      .where(sql`${t.isActive} = true`),
    check('ai_configs_provider_chk', sql`${t.provider} in ('openai', 'ollama', 'custom')`),
  ],
)

// ==========================================
// chat_sessions / chat_messages —— 聊天会话(M1-3)
// 护栏:≤50 会话/用户、≤200 消息/会话(repositories 事务内强制)
// ==========================================

export const chatSessions = pgTable(
  'chat_sessions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('chat_sessions_user_updated_idx').on(t.userId, t.updatedAt)],
)

export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => chatSessions.id, { onDelete: 'cascade' }),
    /** 冗余属主列:消息级越权校验无需 join,纵深防御 */
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** 会话内单调递增(1 起),超 200 由应用层裁剪最旧 */
    seq: integer('seq').notNull(),
    role: text('role').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('chat_messages_session_seq_uq').on(t.sessionId, t.seq),
    index('chat_messages_user_session_idx').on(t.userId, t.sessionId),
    check('chat_messages_role_chk', sql`${t.role} in ('user', 'assistant', 'system')`),
  ],
)
