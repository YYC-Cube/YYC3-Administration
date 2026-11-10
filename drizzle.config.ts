/**
 * @file drizzle.config.ts
 * @description YYC³ Administration 自托管后端 —— drizzle-kit 配置(P2)
 *   用法:改 schema.ts 后 `pnpm exec drizzle-kit generate` 生成迁移至
 *   server/db/migrations/;应用走 `pnpm db:migrate`。
 *   凭据不进本配置:migrate 运行时读 DATABASE_URL;generate 不需要连接。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p2,drizzle-kit
 */

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
})
