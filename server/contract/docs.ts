/**
 * @file server/contract/docs.ts
 * @description YYC³ Administration —— API 契约·通用域文档(P4 细化/M2 批次一)
 *   白名单 scope:'task-board'(toolkit 任务板)/'smart-form'(supply-chain 表单)
 *   ——沿 user_settings 单文档管线(256KB 护栏服务端强制);新域 additive 扩展。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p4,contract,docs,m2
 */

import { z } from 'zod'

export const DocScopeSchema = z.enum(['task-board', 'smart-form'])
export type DocScope = z.infer<typeof DocScopeSchema>

export const PutScopeDocRequestSchema = z.object({
  data: z.record(z.string(), z.unknown()),
})
export type PutScopeDocRequest = z.infer<typeof PutScopeDocRequestSchema>

export const ScopeDocumentSchema = z.object({
  scope: DocScopeSchema,
  data: z.record(z.string(), z.unknown()),
  /** null = 该用户该域尚无云端文档 */
  updatedAt: z.string().nullable(),
})
export type ScopeDocument = z.infer<typeof ScopeDocumentSchema>
