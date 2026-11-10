/**
 * @file server/contract/errors.ts
 * @description YYC³ Administration —— API 契约·错误码表(P4)
 *   单一真源:业务码 ↔ HTTP 状态映射 + 错误信封(ApiError)。
 *   规则:① 新增错误码只能"加"不能"改义"(客户端按码分支);
 *        ② message 面向开发者可读,本地化键由前端按 code 自行映射;
 *        ③ issues[].path 为 zod issue path 的 '.' 连接形态。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p4,contract,errors
 */

import { z } from 'zod'

/** 业务错误码 → HTTP 状态(唯一映射表) */
export const ERROR_STATUS = {
  invalid_input: 422,
  conflict: 409,
  rate_limited: 429,
  unauthorized: 401,
  invalid_credentials: 401,
  csrf_rejected: 403,
  forbidden: 403,
  not_found: 404,
  internal_error: 500,
  service_unavailable: 503,
} as const

export type ErrorCode = keyof typeof ERROR_STATUS

/** 校验明细(zod issue 的线上形态) */
export interface ApiErrorIssue {
  path: string
  message: string
}

/** 统一错误信封:所有非 2xx 响应体 */
export interface ApiError {
  error: ErrorCode
  message?: string
  issues?: ApiErrorIssue[]
  /** 仅 rate_limited 携带 */
  retryAfterSec?: number
}

export const ApiErrorSchema = z.object({
  error: z.enum(Object.keys(ERROR_STATUS) as [ErrorCode, ...ErrorCode[]]),
  message: z.string().optional(),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  retryAfterSec: z.number().int().positive().optional(),
})

/** zod issue → 线上形态(路由层统一消费;结构化参数,不耦合 zod 内部类型) */
export function toApiIssues(
  issues: ReadonlyArray<{ path: readonly PropertyKey[]; message: string }>,
): ApiErrorIssue[] {
  return issues.map((i) => ({ path: i.path.map(String).join('.'), message: i.message }))
}
