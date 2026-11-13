/**
 * @file server/routes/data.ts
 * @description YYC³ Administration 自托管后端 —— 数据面路由(P5/M1-1~3)
 *   全路由 requireAuth;消费 server/contract(校验+DTO)+ P2 repositories
 *   (唯一数据访问模块);api_key 仅在创建/更新出现 → 服务端 AES-GCM 加密入库,
 *   DTO 恒无密文/明文;export 按 P0 红线不含任何 api key(恢复时需重填)。
 *   越权语义:他人资源 = 0 行受影响 → 404(不暴露存在性)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p5,routes,data
 */

import { type AuthedContext, requireAuth } from '@server/auth/middleware'
import {
  type AiConfig,
  type AiConfigList,
  type CreateAiConfigRequest,
  CreateAiConfigRequestSchema,
  type UpdateAiConfigRequest,
  UpdateAiConfigRequestSchema,
} from '@server/contract/ai-configs'
import {
  type AppendChatMessageRequest,
  AppendChatMessageRequestSchema,
  type ChatSession,
  type ChatSessionDetail,
  CreateChatSessionRequestSchema,
} from '@server/contract/chat'
import {
  type DocScope,
  DocScopeSchema,
  type PutScopeDocRequest,
  PutScopeDocRequestSchema,
  type ScopeDocument,
} from '@server/contract/docs'
import { type ApiError, toApiIssues } from '@server/contract/errors'
import {
  type PutSettingsRequest,
  PutSettingsRequestSchema,
  type SettingsDocument,
} from '@server/contract/settings'
import { encryptSecret } from '@server/crypto/secret-box'
import {
  appendChatMessage,
  createAiConfig,
  createChatSession,
  deleteAiConfig,
  deleteChatSession,
  exportAll,
  getChatSession,
  getUserDoc,
  getUserSetting,
  listAiConfigs,
  listChatMessages,
  listChatSessions,
  setActiveAiConfig,
  updateAiConfig,
  upsertUserDoc,
  upsertUserSetting,
} from '@server/db/repositories'
import { Hono } from 'hono'

import type { SessionPayload } from '@server/auth/token'

type DataApp = Hono<{ Variables: { session: SessionPayload } }>

function toAiConfigDto(row: {
  id: string
  name: string
  provider: string
  endpoint: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): AiConfig {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider as AiConfig['provider'],
    endpoint: row.endpoint,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function toChatSessionDto(row: {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}): ChatSession {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const notFound: ApiError = { error: 'not_found', message: '资源不存在' }

export function dataRoutes() {
  const app: DataApp = new Hono()

  // ── settings(M1-1) ────────────────────────────────────────────────
  app.get('/settings', requireAuth, async (c: AuthedContext) => {
    const userId = c.get('session').sub
    const row = await getUserSetting(userId)
    const doc: SettingsDocument = row
      ? {
          data: (row.data ?? {}) as Record<string, unknown>,
          updatedAt: row.updatedAt.toISOString(),
        }
      : { data: {}, updatedAt: null }
    return c.json(doc)
  })

  app.put('/settings', requireAuth, async (c: AuthedContext) => {
    const parsed = PutSettingsRequestSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) {
      return c.json(
        { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
        422,
      )
    }
    const userId = c.get('session').sub
    try {
      const row = await upsertUserSetting(userId, (parsed.data as PutSettingsRequest).data)
      const doc: SettingsDocument = {
        data: (row.data ?? {}) as Record<string, unknown>,
        updatedAt: row.updatedAt.toISOString(),
      }
      return c.json(doc)
    } catch (error) {
      // 护栏触发(256KB)等 → 422 语义
      const message = error instanceof Error ? error.message : '写入失败'
      return c.json({ error: 'invalid_input', message } satisfies ApiError, 422)
    }
  })

  // ── docs(M2 批次一:通用域文档;scope 白名单校验) ─────────────────
  app.get('/docs/:scope', requireAuth, async (c: AuthedContext) => {
    const parsed = DocScopeSchema.safeParse(c.req.param('scope'))
    if (!parsed.success) {
      return c.json({ error: 'invalid_input', message: '未知文档域' } satisfies ApiError, 422)
    }
    const userId = c.get('session').sub
    const row = await getUserDoc(userId, parsed.data)
    const doc: ScopeDocument = row
      ? {
          scope: parsed.data,
          data: (row.data ?? {}) as Record<string, unknown>,
          updatedAt: row.updatedAt.toISOString(),
        }
      : { scope: parsed.data, data: {}, updatedAt: null }
    return c.json(doc)
  })

  app.put('/docs/:scope', requireAuth, async (c: AuthedContext) => {
    const parsedScope = DocScopeSchema.safeParse(c.req.param('scope'))
    if (!parsedScope.success) {
      return c.json({ error: 'invalid_input', message: '未知文档域' } satisfies ApiError, 422)
    }
    const parsed = PutScopeDocRequestSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) {
      return c.json(
        { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
        422,
      )
    }
    const userId = c.get('session').sub
    const reqBody: PutScopeDocRequest = parsed.data
    try {
      const row = await upsertUserDoc(userId, parsedScope.data, reqBody.data)
      const doc: ScopeDocument = {
        scope: parsedScope.data,
        data: (row.data ?? {}) as Record<string, unknown>,
        updatedAt: row.updatedAt.toISOString(),
      }
      return c.json(doc)
    } catch (error) {
      const message = error instanceof Error ? error.message : '写入失败'
      return c.json({ error: 'invalid_input', message } satisfies ApiError, 422)
    }
  })

  // ── ai-configs(M1-2) ─────────────────────────────────────────────
  app.get('/ai-configs', requireAuth, async (c: AuthedContext) => {
    const userId = c.get('session').sub
    const rows = await listAiConfigs(userId)
    const active = rows.find((r) => r.isActive)
    const list: AiConfigList = {
      configs: rows.map(toAiConfigDto),
      activeId: active?.id ?? null,
    }
    return c.json(list)
  })

  app.post('/ai-configs', requireAuth, async (c: AuthedContext) => {
    const parsed = CreateAiConfigRequestSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) {
      return c.json(
        { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
        422,
      )
    }
    const userId = c.get('session').sub
    const req: CreateAiConfigRequest = parsed.data
    const row = await createAiConfig(userId, {
      name: req.name,
      provider: req.provider,
      endpoint: req.endpoint,
      apiKeyCipher: encryptSecret(req.apiKey),
      isActive: req.isActive,
    })
    return c.json(toAiConfigDto(row), 201)
  })

  app.put('/ai-configs/:id', requireAuth, async (c: AuthedContext) => {
    const parsed = UpdateAiConfigRequestSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) {
      return c.json(
        { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
        422,
      )
    }
    const userId = c.get('session').sub
    const id = c.req.param('id')
    if (!id) return c.json(notFound, 404)
    const req: UpdateAiConfigRequest = parsed.data
    const ok = await updateAiConfig(userId, id, {
      ...(req.name !== undefined ? { name: req.name } : {}),
      ...(req.endpoint !== undefined ? { endpoint: req.endpoint } : {}),
      ...(req.apiKey !== undefined ? { apiKeyCipher: encryptSecret(req.apiKey) } : {}),
    })
    if (!ok) return c.json(notFound, 404)
    const rows = await listAiConfigs(userId)
    const dto = rows.find((r) => r.id === id)
    return dto ? c.json(toAiConfigDto(dto)) : c.json(notFound, 404)
  })

  app.delete('/ai-configs/:id', requireAuth, async (c: AuthedContext) => {
    const id = c.req.param('id')
    if (!id) return c.json(notFound, 404)
    const ok = await deleteAiConfig(c.get('session').sub, id)
    return ok ? c.json({ ok: true }) : c.json(notFound, 404)
  })

  app.post('/ai-configs/:id/activate', requireAuth, async (c: AuthedContext) => {
    const id = c.req.param('id')
    if (!id) return c.json(notFound, 404)
    const ok = await setActiveAiConfig(c.get('session').sub, id)
    return ok ? c.json({ ok: true }) : c.json(notFound, 404)
  })

  // ── chat(M1-3) ───────────────────────────────────────────────────
  app.get('/chat/sessions', requireAuth, async (c: AuthedContext) => {
    const rows = await listChatSessions(c.get('session').sub)
    return c.json({ sessions: rows.map(toChatSessionDto) })
  })

  app.post('/chat/sessions', requireAuth, async (c: AuthedContext) => {
    const parsed = CreateChatSessionRequestSchema.safeParse(await c.req.json().catch(() => ({})))
    if (!parsed.success) {
      return c.json(
        { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
        422,
      )
    }
    const row = await createChatSession(c.get('session').sub, parsed.data.title ?? '')
    return c.json(toChatSessionDto(row), 201)
  })

  app.get('/chat/sessions/:id', requireAuth, async (c: AuthedContext) => {
    const userId = c.get('session').sub
    const id = c.req.param('id')
    if (!id) return c.json(notFound, 404)
    const session = await getChatSession(userId, id)
    if (!session) return c.json(notFound, 404)
    const messages = await listChatMessages(userId, session.id)
    const detail: ChatSessionDetail = {
      session: toChatSessionDto(session),
      messages: messages.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        seq: m.seq,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    }
    return c.json(detail)
  })

  app.delete('/chat/sessions/:id', requireAuth, async (c: AuthedContext) => {
    const id = c.req.param('id')
    if (!id) return c.json(notFound, 404)
    const ok = await deleteChatSession(c.get('session').sub, id)
    return ok ? c.json({ ok: true }) : c.json(notFound, 404)
  })

  app.post('/chat/sessions/:id/messages', requireAuth, async (c: AuthedContext) => {
    const parsed = AppendChatMessageRequestSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) {
      return c.json(
        { error: 'invalid_input', issues: toApiIssues(parsed.error.issues) } satisfies ApiError,
        422,
      )
    }
    const req: AppendChatMessageRequest = parsed.data
    const id = c.req.param('id')
    if (!id) return c.json(notFound, 404)
    const row = await appendChatMessage(c.get('session').sub, id, {
      role: req.role,
      content: req.content,
    })
    if (!row) return c.json(notFound, 404)
    return c.json(
      {
        id: row.id,
        sessionId: row.sessionId,
        seq: row.seq,
        role: row.role as 'user' | 'assistant' | 'system',
        content: row.content,
        createdAt: row.createdAt.toISOString(),
      },
      201,
    )
  })

  // ── export(R6 可逆出口;P0 红线:不含任何 api key——密文/明文均不导出) ──
  app.get('/export', requireAuth, async (c: AuthedContext) => {
    const data = await exportAll(c.get('session').sub)
    return c.json({
      exportedAt: data.exportedAt,
      version: data.version,
      settings: data.settings,
      aiConfigs: data.aiConfigs.map(toAiConfigDto),
      chatSessions: data.chatSessions,
    })
  })

  return app
}
