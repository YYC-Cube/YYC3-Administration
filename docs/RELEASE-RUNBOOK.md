---
file: RELEASE-RUNBOOK.md
description: YYC3-Administration 生产发布手册 —— 发布流程 / 灰度与回滚 / 应急预案
author: YYC-Cube Team <admin@0379.email>
version: v1.0.0
created: 2026-11-01
updated: 2026-11-02
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

### 5.1b 场景：个别 hashed 资源 404（如 vendor-monaco.*.css）——旧缓存竞态，非部署损坏

1. **判定**：拉取线上 index.html，逐一 HEAD 其引用资产——若全部 200 而报障哈希
   不在其中（如 2026-11-02 `Cuo9tjen` vs 现行 `CNgQWNDj`），即「旧 index.html/SW
   引用已被快照替换的旧哈希产物」，属高频重部署竞态（Pages 单快照，旧产物被清）。
2. **自愈机制**（已在位，勿重复建设）：PWA `autoUpdate` + `cleanupOutdatedCaches`
   → 老用户下次访问自动换新 SW 与 precache；monaco 类运行时缓存资产随之重积累。
   最长恢复窗口 ≈ index.html CDN TTL（10 min）+ 用户一次完整访问。
3. **用户侧立即恢复**：强刷（Cmd/Ctrl+Shift+R）或关闭重开 PWA 一次。
4. **运维侧无需回滚**；仅当「当前 index.html 的引用也 404」才是真部署损坏 → 重发布。

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

| #   | 缺口                                                                                                     | 级别      | 整改方向                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | ~~前端运行时错误监控未接入~~ ✅ 已接线（v1.0.6，`error-monitor.ts` 按 DSN 门控，未配置零开销）           | P2→已闭合 | **激活三步**：Sentry 控制台建项目 → DSN 写入本地 `.env`（`VITE_SENTRY_DSN=…`，勿入库）→ 重新构建发布，面板 release 即见 v1.0.6 事件 |
| 6.2 | ~~Docker 无版本化镜像 tag~~ ✅ 已闭合（v1.0.6）：docker-release.yml 按 tag 推 GHCR，compose 已切镜像拉起 | P3→已闭合 | 回滚 = 改 compose 镜像 tag 后 `up -d`（§4.3）                                                                                       |
| 6.3 | ~~main 分支未启用分支保护~~ ✅ 已闭合（v1.0.5）：checks 门 + 禁强推/删除                                 | P1→已闭合 | 如需强制 PR 评审，可叠加 ruleset（管理员保留应急直推）                                                                              |
| 6.4 | ~~发版未打 tag/Release~~ ✅ 已闭合：发布检查单固化 tag + Release 步骤（§二）                             | P2→已闭合 | —                                                                                                                                   |

> 终审四项遗留缺口已于 v1.0.5/v1.0.6 全部闭合；当前开放项见终审报告 §九批次三待办
> （覆盖率棘轮回升已完成、DnD 已恢复全量执行、GHCR 首跑与调度周期观察中）。
