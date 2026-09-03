# YYC³ FAmily-AI Agent 部署目录

## 目录结构

```
yyc3-family-ai-agents/
├── docker-compose.yml          ← 8 Agent 容器编排
├── agent_server.py             ← 通用 Agent Flask 服务
├── .env                        ← 环境变量
├── prompts/ → ~/.nemoclaw/agent-prompts/v3/  (符号链接)
└── agents/
    ├── yuanqi-tianshu/         ← 元启天枢 (25600)
    ├── yanqi-qianhang/         ← 言启千行 (25601)
    ├── yushu-wanwu/            ← 语枢万物 (25602)
    ├── yujian-xianzhi/         ← 预见先知 (25603)
    ├── zhiyu-bole/             ← 知遇伯乐 (25604)
    ├── zhiyun-shouhu/          ← 智云守护 (25605)
    ├── gewu-zongshi/           ← 格物宗师 (25606)
    └── chuangxiang-lingyun/    ← 创想灵韵 (25607)
```

## 部署

```bash
cd ~/yyc3-102-projects/yyc3-family-ai-agents
docker compose up -d
docker compose ps
```

## 使用

```bash
# 测试单个 Agent
curl -X POST http://localhost:25600/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "分析当前系统状态"}'

# 健康检查
curl http://localhost:25600/health | python3 -m json.tool
```
