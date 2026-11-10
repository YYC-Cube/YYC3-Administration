/**
 * @file server/contract/settings.ts
 * @description YYC³ Administration —— API 契约·设置域(P4/M1-1)
 *   settings 为用户级单文档(jsonb),内容由前端域自治;契约只锁定信封与护栏
 *   (≤256KB,服务端 repositories 双重强制)。字段级 schema 待 M2 契约细化。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p4,contract,settings
 */

import { z } from 'zod'

export const PutSettingsRequestSchema = z.object({
  data: z.record(z.string(), z.unknown()),
})
export type PutSettingsRequest = z.infer<typeof PutSettingsRequestSchema>

export const SettingsDocumentSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  updatedAt: z.string(),
})
export type SettingsDocument = z.infer<typeof SettingsDocumentSchema>
