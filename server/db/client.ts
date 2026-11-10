/**
 * @file server/db/client.ts
 * @description YYC³ Administration 自托管后端 —— 数据库连接池(P2, ADR-0003)
 *   🔒 安全基线:
 *   - 连接串仅经 DATABASE_URL 环境变量注入(gitignored 的 .env),禁止入库/入码;
 *   - 所有业务查询经 drizzle 恒以 $n 占位参数下发(含 `sql` 模板),模块内禁止
 *     字符串拼接 SQL —— 迁移文件为静态 DDL,不受此约束影响;
 *   - 连接角色 yyc3_app 为最小权限 LOGIN(禁 superuser),见 ADR-0003 §三。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p2,db,drizzle,postgresql
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('[db] DATABASE_URL 未配置 —— 自托管后端拒绝无凭据启动(见 ADR-0003 §五)')
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

export const db = drizzle(pool, { schema })

export type Db = typeof db
