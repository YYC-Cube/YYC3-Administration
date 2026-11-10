/**
 * @file server/contract/chat.ts
 * @description YYC³ Administration —— API 契约·聊天会话域(P4/M1-3)
 *   护栏(≤50 会话/用户、≤200 消息/会话)由服务端事务强制;契约锁字段形态。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p4,contract,chat
 */

import { z } from 'zod'

export const ChatRoleSchema = z.enum(['user', 'assistant', 'system'])
export type ChatRole = z.infer<typeof ChatRoleSchema>

export const CreateChatSessionRequestSchema = z.object({
  title: z.string().trim().max(200).optional(),
})
export type CreateChatSessionRequest = z.infer<typeof CreateChatSessionRequestSchema>

export const AppendChatMessageRequestSchema = z.object({
  role: ChatRoleSchema,
  content: z.string().min(1).max(64_000),
})
export type AppendChatMessageRequest = z.infer<typeof AppendChatMessageRequestSchema>

export const ChatSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ChatSession = z.infer<typeof ChatSessionSchema>

export const ChatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  seq: z.number().int(),
  role: ChatRoleSchema,
  content: z.string(),
  createdAt: z.string(),
})
export type ChatMessage = z.infer<typeof ChatMessageSchema>

export const ChatSessionDetailSchema = z.object({
  session: ChatSessionSchema,
  messages: z.array(ChatMessageSchema),
})
export type ChatSessionDetail = z.infer<typeof ChatSessionDetailSchema>
