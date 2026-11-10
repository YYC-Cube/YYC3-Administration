/**
 * @file server/auth/password.ts
 * @description YYC³ Administration 自托管后端 —— 密码哈希(P3/M1-0, F-05 清偿)
 *   argon2id(@node-rs/argon2 预编译二进制,无 node-gyp);库默认参数即
 *   argon2id + 随机盐;明文密码仅存在于本模块入参,禁止落日志。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,auth,argon2
 */

import { hash, verify } from '@node-rs/argon2'

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain)
}

export async function verifyPassword(hashStr: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashStr, plain)
  } catch {
    // 哈希串格式损坏等一律视为验证失败,不向调用方泄露细节
    return false
  }
}
