/**
 * @file server/db/migrate.ts
 * @description YYC³ Administration 自托管后端 —— 迁移入口(P2)
 *   使用 drizzle 官方 migrator:迁移文件由 drizzle-kit 从 schema.ts 生成
 *   (pnpm exec drizzle-kit generate),本入口幂等应用。回滚:手工执行
 *   server/db/rollbacks/*.down.sql(P8 演练留档)。
 *   运行:pnpm db:migrate(DATABASE_URL 必须已配置)。
 *   🔒 本文件零动态 SQL 面:无 query(变量)/sql.raw(变量) —— 执行细节封装在
 *   drizzle migrator(受信任依赖);业务查询恒参数化见 repositories.ts。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p2,migration
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { migrate } from 'drizzle-orm/node-postgres/migrator'

import { db, pool } from './client'

const MIGRATIONS_FOLDER = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

const run = migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })

run
  .then(() => {
    console.log('迁移完成')
  })
  .catch((error) => {
    console.error('[migrate] 失败:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
