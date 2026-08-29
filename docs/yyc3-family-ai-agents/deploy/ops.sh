#!/usr/bin/env bash
# YYC3 运维快捷命令
# 用法: bash ops.sh [status|start|stop|restart|logs [agent]|test|dashboard]

CMD="${1:-status}"
PYTHON=/home/yyc3/llama-factory-env/bin/python3

case "$CMD" in
    status)
        echo "=== systemd 服务状态 ==="
        printf "%-20s %-10s\n" "服务" "状态"
        printf "%-20s %-10s\n" "-----" "----"
        for svc in yyc3-governance yyc3-embedding yyc3-reranker yyc3-memory; do
            printf "%-20s %-10s\n" "$svc" "$(systemctl is-active $svc 2>/dev/null)"
        done
        for a in tianshu qianxing wanwu xianzhi bole shouhu zongshi lingyun; do
            printf "%-20s %-10s\n" "yyc3-agent@$a" "$(systemctl is-active yyc3-agent@$a 2>/dev/null)"
        done
        echo ""
        echo "=== 治理中枢仪表盘 ==="
        curl -s http://127.0.0.1:25700/dashboard 2>/dev/null | $PYTHON -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(f'  行为事件: {d[\"behavior_events_total\"]} | 高危24h: {d[\"high_risk_events_24h\"]}')
    print(f'  Token 24h: {d[\"tokens_consumed_24h\"]} | 协同24h: {d[\"collaborations_24h\"]}')
    for a, s in sorted(d['agents'].items()):
        print(f'    {a:10s}: {s[\"state\"]}')
except:
    print('  治理中枢不可达')
" 2>/dev/null
        echo ""
        echo "=== GPU ==="
        nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu --format=csv,noheader 2>/dev/null || echo "  nvidia-smi 不可用"
        ;;

    start)
        echo "启动 YYC3 全链路..."
        sudo systemctl start yyc3-governance
        sleep 2
        echo "  启动 Embedding (等待模型加载 15s)..."
        sudo systemctl start yyc3-embedding
        sleep 15
        sudo systemctl start yyc3-memory
        sleep 2
        echo "  启动 Reranker (等待模型加载 20s)..."
        sudo systemctl start yyc3-reranker
        sleep 20
        echo "  启动 8 Agent..."
        for a in tianshu qianxing wanwu xianzhi bole shouhu zongshi lingyun; do
            sudo systemctl start yyc3-agent@$a
        done
        sleep 3
        echo "完成。运行 'bash ops.sh status' 查看。"
        ;;

    stop)
        echo "停止 YYC3 全链路..."
        for a in tianshu qianxing wanwu xianzhi bole shouhu zongshi lingyun; do
            sudo systemctl stop yyc3-agent@$a 2>/dev/null
        done
        sudo systemctl stop yyc3-memory yyc3-reranker yyc3-embedding yyc3-governance 2>/dev/null
        echo "已停止。"
        ;;

    restart)
        echo "重启 YYC3 全链路..."
        bash "$0" stop
        sleep 3
        bash "$0" start
        ;;

    logs)
        TARGET="${2:-governance}"
        if [ "$TARGET" = "governance" ] || [ "$TARGET" = "gov" ]; then
            echo "治理中枢日志 (Ctrl+C 退出):"
            tail -f ~/.nemoclaw/governance/hub.log
        elif [ "$TARGET" = "embedding" ]; then
            tail -f ~/yyc3-102-projects/logs/embedding.log
        elif [ "$TARGET" = "reranker" ]; then
            tail -f ~/yyc3-102-projects/logs/reranker.log
        elif [ "$TARGET" = "memory" ]; then
            tail -f ~/yyc3-102-projects/logs/memory.log
        else
            echo "Agent $TARGET 日志 (Ctrl+C 退出):"
            tail -f ~/.nemoclaw/agents/logs/$TARGET.log
        fi
        ;;

    test)
        echo "=== Agent 人格测试 ==="
        $PYTHON ~/.nemoclaw/agents/launch_agents.py test
        ;;

    dashboard)
        echo "=== 综合仪表盘 ==="
        curl -s http://127.0.0.1:25700/dashboard | $PYTHON -m json.tool
        ;;

    freeze)
        REASON="${2:-手动冻结}"
        echo "冻结所有 Agent: $REASON"
        curl -s -X POST http://127.0.0.1:25700/kill-switch \
            -H 'Content-Type: application/json' \
            -d "{\"agent\": \"ALL\", \"reason\": \"$REASON\"}" | $PYTHON -m json.tool
        ;;

    unfreeze)
        AGENT="${2:-tianshu}"
        echo "解冻 Agent: $AGENT"
        curl -s -X POST http://127.0.0.1:25700/unfreeze \
            -H 'Content-Type: application/json' \
            -d "{\"agent\": \"$AGENT\"}" | $PYTHON -m json.tool
        ;;

    *)
        echo "用法: bash ops.sh [status|start|stop|restart|logs [agent]|test|dashboard|freeze [reason]|unfreeze [agent]]"
        ;;
esac
