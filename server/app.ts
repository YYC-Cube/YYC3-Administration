/**
 * @file server/app.ts
 * @description YYC³ Administration 自托管后端 —— Hono 应用装配(P3)
 *   createApp() 返回可测实例(测试经 app.request() 无需监听端口);
 *   server/index.ts 负责真实监听。路由挂载:healthz + auth(P5 再挂
 *   /settings、/ai-configs、/chat 等数据面路由)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,app,hono
 */

import { sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { csrfOriginGuard, requireAuth, requireRole } from './auth/middleware'
import { authRoutes } from './auth/routes'
import { db, pool } from './db/client'

import type { SessionPayload } from './auth/token'

export function createApp() {
  const app = new Hono<{ Variables: { session: SessionPayload } }>()

  app.use('*', csrfOriginGuard)

  app.get('/healthz', async (c) => {
    try {
      await db.execute(sql`select 1`)
      return c.json({ status: 'ok', db: true })
    } catch {
      return c.json({ status: 'degraded', db: false }, 503)
    }
  })

  app.route('/auth', authRoutes)

  // 角色门示例(供 P3 越权矩阵测试;M2 业务表落地后由真实资源路由替换)
  app.get('/admin/ping', requireAuth, requireRole('admin'), (c) => c.json({ pong: true }))

  // 优雅关闭通道(测试/运维可触发连接池回收)
  app.get('/__health/pool', (c) => c.json({ total: pool.totalCount, idle: pool.idleCount }))

  return app
}
