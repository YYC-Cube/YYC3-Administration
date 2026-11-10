/**
 * @file server/index.ts
 * @description YYC³ Administration 自托管后端 —— 进程入口(P3)
 *   运行:pnpm dev:server(热更) / pnpm start:server;端口 PORT(默认 8787)。
 *   优雅关闭:SIGINT/SIGTERM → 停止接客 → 连接池回收。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,server
 */

import { serve } from '@hono/node-server'

import { createApp } from './app'
import { pool } from './db/client'

const port = Number(process.env.PORT ?? 8787)

const server = serve({ fetch: createApp().fetch, port }, (info) => {
  console.warn('[server] listening on http://localhost:' + info.port)
})

function shutdown(signal: string) {
  console.warn('[server] ' + signal + ' received, shutting down')
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
  // 兜底:close 回调悬挂时强退
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
