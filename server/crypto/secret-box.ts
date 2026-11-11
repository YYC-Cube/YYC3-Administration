/**
 * @file server/crypto/secret-box.ts
 * @description YYC³ Administration —— 静态加密盒(P5/M1-2)
 *   AES-256-GCM;密钥经 scrypt 派生自 DATA_ENC_KEY(缺省回落 JWT_SECRET,
 *   密钥轮换时二者均可独立换),静态上下文串隔离用途。密文格式
 *   base64(iv):base64(tag):base64(ct)。🔒 主密钥仅环境变量,永不入库/入码。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p5,crypto,aes-gcm
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

const SALT_CONTEXT = 'yyc3-ai-config-v1'

function dataKey(): Buffer {
  const material = process.env.DATA_ENC_KEY ?? process.env.JWT_SECRET
  if (!material) {
    throw new Error('[secret-box] DATA_ENC_KEY/JWT_SECRET 均未配置,拒绝加密操作')
  }
  return scryptSync(material, SALT_CONTEXT, 32)
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', dataKey(), iv)
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return iv.toString('base64') + ':' + tag.toString('base64') + ':' + ct.toString('base64')
}

export function decryptSecret(cipherText: string): string {
  const [ivB64, tagB64, ctB64] = cipherText.split(':')
  if (!ivB64 || !tagB64 || !ctB64) {
    throw new Error('[secret-box] 密文格式非法')
  }
  const decipher = createDecipheriv('aes-256-gcm', dataKey(), Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]).toString(
    'utf8',
  )
}
