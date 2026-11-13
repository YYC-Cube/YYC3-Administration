/**
 * @file server/contract/index.ts
 * @description YYC³ Administration —— API 契约统一出口(P4)
 *   前端只允许 `import type`(零运行时成本,zod 不进前端 bundle);
 *   服务端路由消费 schema 做运行时校验。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p4,contract
 */

export * from './ai-configs'
export * from './auth'
export * from './chat'
export * from './docs'
export * from './errors'
export * from './settings'
