/**
 * @file server/contract/ai-configs.ts
 * @description YYC³ Administration —— API 契约·AI 模型配置域(P4/M1-2)
 *   🔒 隐私属性(由类型承载):线上 DTO 恒无 api_key_cipher —— 密文只存
 *   服务端,apiKey 明文仅出现在创建/更新请求(要求 HTTPS 反代终结)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p4,contract,ai-configs
 */

import { z } from 'zod'

export const AiProviderSchema = z.enum(['openai', 'ollama', 'custom'])
export type AiProvider = z.infer<typeof AiProviderSchema>

const endpointField = z
  .string()
  .min(1)
  .max(500)
  .refine((s) => /^https?:\/\//.test(s), 'endpoint 需为 http(s) URL')

export const CreateAiConfigRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  provider: AiProviderSchema,
  endpoint: endpointField,
  apiKey: z.string().min(1).max(500),
  isActive: z.boolean().optional(),
})
export type CreateAiConfigRequest = z.infer<typeof CreateAiConfigRequestSchema>

export const UpdateAiConfigRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    endpoint: endpointField.optional(),
    apiKey: z.string().min(1).max(500).optional(),
  })
  .refine((o) => o.name !== undefined || o.endpoint !== undefined || o.apiKey !== undefined, {
    message: '至少提供一个待更新字段',
  })
export type UpdateAiConfigRequest = z.infer<typeof UpdateAiConfigRequestSchema>

/** 线上 DTO:无密文/无明文 key */
export const AiConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: AiProviderSchema,
  endpoint: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type AiConfig = z.infer<typeof AiConfigSchema>

export const AiConfigListSchema = z.object({
  configs: z.array(AiConfigSchema),
  activeId: z.string().nullable(),
})
export type AiConfigList = z.infer<typeof AiConfigListSchema>
