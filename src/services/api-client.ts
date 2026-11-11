/**
 * @file services/api-client.ts
 * @description YYC³ Administration —— 自托管 API 客户端(P6/M1)
 *   启用条件:构建期 VITE_API_MODE=true(自托管部署线置位;Pages 纯静态线
 *   不设 → 全部回落本地模式,零破坏)。调用走相对路径 /api(经 vite dev/preview
 *   代理或生产反代转到后端),同源 Cookie 即会话,CSRF/限流由服务端强制。
 *   错误统一抛 ApiClientError(status + ApiError 信封)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags p6,api,client,self-hosted
 */

import type { ApiError } from '@server/contract/errors'

export const isApiConfigured: boolean = import.meta.env.VITE_API_MODE === 'true'

export class ApiClientError extends Error {
  readonly status: number
  readonly body: ApiError
  constructor(status: number, body: ApiError) {
    super(body.message ?? body.error)
    this.name = 'ApiClientError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch('/api' + path, {
    credentials: 'include',
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    let body: ApiError = { error: 'internal_error', message: 'HTTP ' + res.status }
    try {
      body = (await res.json()) as ApiError
    } catch {
      /* 非 JSON 错误体,保留兜底 */
    }
    throw new ApiClientError(res.status, body)
  }
  return (await res.json()) as T
}
