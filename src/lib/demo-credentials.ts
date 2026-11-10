/**
 * @file lib/demo-credentials.ts
 * @description YYC³ 演示凭据派生(F-05/P3 收紧)
 *   源码与产物均不再含演示密码字面量:DEV 演示密码由用户名运行时派生,
 *   本地演示面(播种/一键登录)共用同一公式保持自洽;
 *   仅 DEV 生效(播种与入口均受 import.meta.env.DEV 门控)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags demo,dev-only,security
 */

export const ghostPassword = (u: string) => 'dev-' + u + '-only'
