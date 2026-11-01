---
file: RELEASE-RUNBOOK.md
description: YYC3-Administration 生产发布手册 —— 发布流程 / 灰度与回滚 / 应急预案
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-01
updated: 2026-11-01
status: active
tags: [ops],[release],[runbook],[rollback]
category: runbook
---

# 🚀 生产发布手册（RELEASE RUNBOOK）

> 适用基线：v1.0.4+，GitHub Pages 生产域 **https://admin.yyc3.vip**（CNAME → yyc-cube.github.io）
> 本手册为终审（2026-11-01）产出的运维三件套之一：发布流程 / 回滚 / 应急预案。

---

## 一、发布架构一览

```text
git push main
   └─▶ CI（ci.yml）：typecheck → lint → format:check → pnpm audit --prod(high 门)
        → unimported(死代码 0 容忍) → madge(循环依赖 0 容忍) → vitest+coverage(棘轮)
        → build → E2E(Playwright chromium, 65 例)
   └─▶ CI success 后自动触发 Deploy（deploy.yml, workflow_run）
        └─▶ 复检 typecheck + build → 校验 dist/CNAME → deploy-pages → admin.yyc3.vip
```

- **发布即合并**：任何进入 main 且 CI 全绿的提交自动发布；**CI 红盘 = 不发布**（Deploy job 的
  `workflow_run.conclusion == 'success'` 条件拦截，2026-09-26 闭环修复）。
- **并发控制**：`concurrency: pages` 组，同一时刻仅一个部署，新部署取消旧排队。
- **可追溯**：每次生产部署在仓库 Deployments 留痕（sha + 时间 + 指向的 Actions run）。

## 二、发布前检查单（Checklist）

| #   | 检查项                                                              | 依据                              |
| --- | ------------------------------------------------------------------- | --------------------------------- |
| 1   | `package.json` / `src/app/version.ts` / `CHANGELOG.md` 三处版本一致 | 终审合规项                        |
| 2   | 打 git tag：`git tag vX.Y.Z && git push origin vX.Y.Z`              | 发版记录归档（当前缺失，P2 整改） |
| 3   | CHANGELOG 增补本次变更条目                                          | Keep a Changelog 规范             |
| 4   | `pnpm build` 本地预验 + `pnpm test:e2e` 冒烟                        | 质量门前置自查                    |
| 5   | `.env.example` 有新增变量时同步文档                                 | 配置一致性                        |

## 三、正常发布流程

1. 功能分支 → PR → CI 全绿 → merge（**建议开启分支保护**，当前缺失，见应急预案 §6.3）。
2. push main 后观察：`gh run watch`（CI 约 7~15 分钟）→ Deploy（约 2~3 分钟）。
3. 发布验证（黄金三探）：
   - `curl -sfI https://admin.yyc3.vip/ | head -5`（HTTP 200 + index.html）
   - 浏览器强刷验证版本号（设置页 APP_VERSION 与本次发布一致）
   - PWA：DevTools → Application → Service Worker 更新激活
4. 在 GitHub Releases 页按 tag 发布 Release Notes（CHANGELOG 自动引用）。

## 四、回滚流程（分级）

### 4.1 首选：git revert 重验回滚（全链路重走质量门）

```bash
git revert <坏提交SHA> && git push origin main   # CI 全绿后自动重发布上一良好状态
```

适用：缺陷已定位到提交；耗时约 10~15 分钟，但回滚版本本身经过完整质量门。

### 4.2 次选：重跑历史成功 Deploy run（分钟级应急止血）

```bash
gh run list --workflow "Deploy to GitHub Pages" --status success --limit 5
gh run rerun <历史成功run_id>     # 以该 run 固定的旧 SHA 重新构建并覆盖发布
```

适用：P0 线上事故需分钟级止血。**注意**：该路径绕过 CI 质量门，仅回退到「历史上
最后一次成功构建」；90 天后旧 run 过期不可重跑，届时只能走 4.1。

### 4.3 容器发布线（备用路径）回滚

```bash
docker compose up -d --no-deps --build   # 当前为 build-on-deploy 模式
# 生产建议升级为镜像 tag 模式后回滚（见 §6.2 整改）：
docker pull ghcr.io/yyc-cube/yyc3-administration:<上一良好tag>
docker compose up -d                      # healthcheck 通过即恢复
```

### 4.4 回滚后动作

- 在 CHANGELOG 增补 `### Reverted` 条目并关联事故记录。
- 复现缺陷补回归测试（单测或 E2E），防止回滚状态被后续提交无意覆盖。

## 五、应急预案

### 5.1 场景：生产站不可访问 / 白屏

1. 确认范围：`curl -I https://admin.yyc3.vip/`；GitHub Pages 平台状态
   <https://www.githubstatus.com>（平台级故障不可自愈，等待恢复即可）。
2. 白屏多为前端运行时错误 → 判断是否本次发布引入 → 执行 §4.2 分钟级回滚。
3. 留存现场：`playwright-report/`、浏览器 Console 截图、deploy run 日志。

### 5.2 场景：安全事件（密钥泄露 / 高危漏洞披露）

1. 依赖高危披露（dompurify 类传递漏洞）：在 `pnpm-workspace.yaml` overrides 抬升钉扎线 →
   `pnpm install` → 本地 `pnpm audit --prod --audit-level high` 验证 → 走正常发布。
2. 真实密钥泄露：立即在提供方吊销/轮换（AppID 类标识符不属密钥，假数据告警按
   false_positive 关闭）→ 请求 GitHub 清缓存 → 复盘入 CHANGELOG Security 段。
3. 联系渠道：见 [SECURITY.md](../SECURITY.md)（私密漏洞上报已开启）。

### 5.3 场景：CI 连续红盘（发布链路停摆）

1. 红盘即停发是**设计行为**，不是故障；但超过 48h 未修复即为闭环断点
   （本次终审取证：branches 棘轮抖动致停发 35 天）。
2. 恢复步骤：`gh run view <run_id> --log-failed` 定位失败门 → 修复或按「棘轮取整
   防抖动」惯例校准阈值（附取证注释）→ push 后确认 CI 绿 → 确认 Deploy run 不再被 skip。

## 六、已知缺口与整改（终审遗留）

| #   | 缺口                                                            | 级别 | 整改方向                                                |
| --- | --------------------------------------------------------------- | ---- | ------------------------------------------------------- |
| 6.1 | 前端运行时错误监控未接入（Sentry 仅预留）                       | P2   | 接入 Sentry + release 绑定，PWA 全局错误上报            |
| 6.2 | Docker 为 build-on-deploy，无版本化镜像 tag，容器回滚依赖重构建 | P3   | CI 增加镜像构建 push 到 GHCR，按 tag 回滚               |
| 6.3 | main 分支未启用分支保护，存在直推绕过评审风险                   | P1   | Settings → Branches 启用 protection（要求状态检查通过） |
| 6.4 | 发版未打 git tag / 未发布 GitHub Release                        | P2   | 发布检查单固化 tag 步骤                                 |
