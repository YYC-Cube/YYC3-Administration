/**
 * @file server/db/repositories.ts
 * @description YYC³ Administration 自托管后端 —— 唯一数据访问模块(P2, ADR-0002/0003)
 *   🔒 RLS 等价主防线(P5 路由层禁止绕过本模块直连 db):
 *   - 每个函数首参恒为 userId(assertUserId 运行时守卫 + TS 强制);
 *   - 每条查询 where 必含属主条件;改/删以 and(eq(userId), eq(id)) 双条件——
 *     他人资源 = 0 行受影响,路由层据此回 404(不暴露存在性,见越权矩阵);
 *   - 全部查询经 drizzle 以 $n 占位参数下发,本文件内禁止字符串拼接 SQL;
 *   - 护栏:settings ≤256KB、会话 ≤50/用户、消息 ≤200/会话(事务内强制)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p2,repository,security
 */

import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from './client'
import { aiConfigs, chatMessages, chatSessions, userDocuments, users, userSettings } from './schema'

const MAX_SETTINGS_BYTES = 256 * 1024
const MAX_SESSIONS_PER_USER = 50
const MAX_MESSAGES_PER_SESSION = 200

export class GuardError extends Error {}

function assertUserId(userId: string): void {
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    throw new GuardError('userId 缺失或格式非法 —— 数据访问必须携带属主作用域')
  }
}

// ==========================================
// users(认证落地在 P3;此处仅最小读写)
// ==========================================

export async function findUserByUsername(username: string) {
  return db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1)
}

export async function findUserById(id: string) {
  assertUserId(id)
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return rows[0]
}

export async function createUser(input: {
  username: string
  passwordHash: string
  displayName?: string
}) {
  const [row] = await db
    .insert(users)
    .values({
      username: input.username.toLowerCase(),
      passwordHash: input.passwordHash,
      displayName: input.displayName,
    })
    .returning()
  return row
}

// ==========================================
// user_settings(M1-1)
// ==========================================

export async function getUserSetting(userId: string) {
  assertUserId(userId)
  const rows = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1)
  return rows[0]
}

export async function upsertUserSetting(userId: string, data: unknown) {
  assertUserId(userId)
  const bytes = Buffer.byteLength(JSON.stringify(data) ?? '', 'utf8')
  if (bytes > MAX_SETTINGS_BYTES) {
    throw new GuardError(`settings 文档 ${bytes}B 超 256KB 护栏(需拆分领域)`)
  }
  const [row] = await db
    .insert(userSettings)
    .values({ userId, data })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { data, updatedAt: new Date() },
    })
    .returning()
  return row
}

// ==========================================
// user_documents(M2 批次一:通用域文档;scope 白名单由路由层校验)
// ==========================================

export async function getUserDoc(userId: string, scope: string) {
  assertUserId(userId)
  const rows = await db
    .select()
    .from(userDocuments)
    .where(and(eq(userDocuments.userId, userId), eq(userDocuments.scope, scope)))
    .limit(1)
  return rows[0]
}

export async function upsertUserDoc(userId: string, scope: string, data: unknown) {
  assertUserId(userId)
  const bytes = Buffer.byteLength(JSON.stringify(data) ?? '', 'utf8')
  if (bytes > MAX_SETTINGS_BYTES) {
    throw new GuardError(`文档 ${bytes}B 超 256KB 护栏(需拆分)`)
  }
  const [row] = await db
    .insert(userDocuments)
    .values({ userId, scope, data })
    .onConflictDoUpdate({
      target: [userDocuments.userId, userDocuments.scope],
      set: { data, updatedAt: new Date() },
    })
    .returning()
  return row
}

// ==========================================
// ai_configs(M1-2;apiKey 由路由层加密后以 cipher 形态入库)
// ==========================================

export async function listAiConfigs(userId: string) {
  assertUserId(userId)
  return db
    .select()
    .from(aiConfigs)
    .where(eq(aiConfigs.userId, userId))
    .orderBy(aiConfigs.createdAt)
}

export async function createAiConfig(
  userId: string,
  input: {
    name: string
    provider: 'openai' | 'ollama' | 'custom'
    endpoint: string
    apiKeyCipher: string
    isActive?: boolean
  },
) {
  assertUserId(userId)
  return db.transaction(async (tx) => {
    if (input.isActive) {
      // 单激活约束(partial unique)要求先清同用户既有激活
      await tx.update(aiConfigs).set({ isActive: false }).where(eq(aiConfigs.userId, userId))
    }
    const [row] = await tx
      .insert(aiConfigs)
      .values({ userId, ...input })
      .returning()
    return row
  })
}

export async function updateAiConfig(
  userId: string,
  id: string,
  patch: Partial<{ name: string; endpoint: string; apiKeyCipher: string; isActive: boolean }>,
) {
  assertUserId(userId)
  const rows = await db
    .update(aiConfigs)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(aiConfigs.userId, userId), eq(aiConfigs.id, id)))
    .returning()
  return rows.length > 0
}

export async function deleteAiConfig(userId: string, id: string) {
  assertUserId(userId)
  const rows = await db
    .delete(aiConfigs)
    .where(and(eq(aiConfigs.userId, userId), eq(aiConfigs.id, id)))
    .returning()
  return rows.length > 0
}

export async function setActiveAiConfig(userId: string, id: string) {
  assertUserId(userId)
  return db.transaction(async (tx) => {
    await tx.update(aiConfigs).set({ isActive: false }).where(eq(aiConfigs.userId, userId))
    const rows = await tx
      .update(aiConfigs)
      .set({ isActive: true, updatedAt: new Date() })
      .where(and(eq(aiConfigs.userId, userId), eq(aiConfigs.id, id)))
      .returning()
    return rows.length > 0
  })
}

// ==========================================
// chat_sessions / chat_messages(M1-3)
// ==========================================

export async function listChatSessions(userId: string) {
  assertUserId(userId)
  return db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(MAX_SESSIONS_PER_USER)
}

export async function getChatSession(userId: string, id: string) {
  assertUserId(userId)
  const rows = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.userId, userId), eq(chatSessions.id, id)))
    .limit(1)
  return rows[0]
}

export async function createChatSession(userId: string, title: string) {
  assertUserId(userId)
  return db.transaction(async (tx) => {
    // 50 会话护栏:满则淘汰最旧
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
    if (count >= MAX_SESSIONS_PER_USER) {
      const oldest = await tx
        .select({ id: chatSessions.id })
        .from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(chatSessions.updatedAt)
        .limit(1)
      if (oldest[0]) {
        await tx.delete(chatSessions).where(eq(chatSessions.id, oldest[0].id))
      }
    }
    const [row] = await tx.insert(chatSessions).values({ userId, title }).returning()
    return row
  })
}

export async function deleteChatSession(userId: string, id: string) {
  assertUserId(userId)
  const rows = await db
    .delete(chatSessions)
    .where(and(eq(chatSessions.userId, userId), eq(chatSessions.id, id)))
    .returning()
  return rows.length > 0
}

export async function listChatMessages(userId: string, sessionId: string) {
  assertUserId(userId)
  // 属主双条件:session 归属 + 消息冗余属主列
  return db
    .select()
    .from(chatMessages)
    .where(and(eq(chatMessages.userId, userId), eq(chatMessages.sessionId, sessionId)))
    .orderBy(chatMessages.seq)
}

export async function appendChatMessage(
  userId: string,
  sessionId: string,
  input: { role: 'user' | 'assistant' | 'system'; content: string },
) {
  assertUserId(userId)
  return db.transaction(async (tx) => {
    const owned = await tx
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(and(eq(chatSessions.userId, userId), eq(chatSessions.id, sessionId)))
      .limit(1)
    if (!owned[0]) {
      return null // 他人会话或不存在 → 路由层回 404
    }
    const [{ maxSeq }] = await tx
      .select({ maxSeq: sql<number>`coalesce(max(${chatMessages.seq}), 0)::int` })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
    const seq = maxSeq + 1
    const [row] = await tx
      .insert(chatMessages)
      .values({ sessionId, userId, seq, role: input.role, content: input.content })
      .returning()
    // 200 条护栏:裁剪窗口外最旧
    if (seq > MAX_MESSAGES_PER_SESSION) {
      await tx
        .delete(chatMessages)
        .where(
          and(
            eq(chatMessages.sessionId, sessionId),
            sql`${chatMessages.seq} <= ${seq - MAX_MESSAGES_PER_SESSION}`,
          ),
        )
    }
    await tx
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, sessionId))
    return row
  })
}

// ==========================================
// export(R6 可逆出口;/export 路由 P5 落地)
// 注意:password_hash 恒不导出;api_key_cipher 为密文,解密在 P5 路由以服务端密钥完成
// ==========================================

export async function exportAll(userId: string) {
  assertUserId(userId)
  const [setting] = await db.select().from(userSettings).where(eq(userSettings.userId, userId))
  const configs = await listAiConfigs(userId)
  const sessions = await listChatSessions(userId)
  const withMessages = await Promise.all(
    sessions.map(async (s) => ({
      ...s,
      messages: await db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.userId, userId), eq(chatMessages.sessionId, s.id)))
        .orderBy(chatMessages.seq),
    })),
  )
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    settings: setting?.data ?? {},
    aiConfigs: configs,
    chatSessions: withMessages,
  }
}
