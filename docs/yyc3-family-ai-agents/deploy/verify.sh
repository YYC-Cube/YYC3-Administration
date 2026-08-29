#!/usr/bin/env bash
set -euo pipefail

PASS=0; FAIL=0; WARN=0
PYTHON=/home/yyc3/llama-factory-env/bin/python3

check() {
    local name="$1" cmd="$2" expect="$3"
    local result
    result=$(eval "$cmd" 2>/dev/null) || result=""
    if echo "$result" | grep -qi "$expect"; then
        echo "  [OK]   $name"
        PASS=$((PASS+1))
    else
        echo "  [FAIL] $name"
        FAIL=$((FAIL+1))
    fi
}

echo "=== YYC3 全链路验证 ==="
echo ""

echo "--- 1. systemd 服务状态 ---"
for svc in yyc3-governance yyc3-embedding yyc3-reranker yyc3-memory; do
    check "$svc" "systemctl is-active $svc" "active"
done
for agent in tianshu qianxing wanwu xianzhi bole shouhu zongshi lingyun; do
    check "yyc3-agent@$agent" "systemctl is-active yyc3-agent@$agent" "active"
done

echo ""
echo "--- 2. 端口可达性 ---"
for port_desc in "治理中枢:25700" "vLLM:8000" "Gateway:8080" "Embedding:8100" "Reranker:8101" "Memory:8102" "Ollama:11434"; do
    name="${port_desc%%:*}"
    port="${port_desc##*:}"
    check "$name :$port" "$PYTHON -c \"import socket; s=socket.socket(); s.settimeout(2); s.connect(('127.0.0.1',$port)); print('open'); s.close()\"" "open"
done
for port in 25600 25601 25602 25603 25604 25605 25606 25607; do
    check "Agent :$port" "$PYTHON -c \"import socket; s=socket.socket(); s.settimeout(2); s.connect(('127.0.0.1',$port)); print('open'); s.close()\"" "open"
done

echo ""
echo "--- 3. 服务健康 ---"
check "治理中枢" "curl -s http://127.0.0.1:25700/health" "healthy"
check "vLLM 推理" "$PYTHON -c \"import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/v1/models')\"" "200"
check "Embedding" "curl -s http://127.0.0.1:8100/health" "healthy"
check "Reranker" "curl -s http://127.0.0.1:8101/health" "healthy"
check "Memory" "curl -s http://127.0.0.1:8102/health" "healthy"

echo ""
echo "--- 4. Agent 端到端 ---"
check "天枢 health" "curl -s http://127.0.0.1:25600/health" "healthy"
check "天枢 identity" "curl -s http://127.0.0.1:25600/identity" "tianshu"
check "千行 health" "curl -s http://127.0.0.1:25601/health" "healthy"
check "灵韵 health" "curl -s http://127.0.0.1:25607/health" "healthy"

echo ""
echo "--- 5. 治理中枢功能 ---"
check "预算仪表盘" "curl -s http://127.0.0.1:25700/budget/dashboard" "tianshu"
check "Agent 状态" "curl -s http://127.0.0.1:25700/agent-states" "active"
check "协同规则" "curl -s http://127.0.0.1:25700/collaboration/rules" "tianshu"
check "综合仪表盘" "curl -s http://127.0.0.1:25700/dashboard" "agents"

echo ""
echo "--- 6. GPU 状态 ---"
GPU_USED=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits 2>/dev/null | head -1)
echo "  GPU 显存使用: ${GPU_USED} MiB"
if [ "${GPU_USED:-0}" -lt 110000 ] 2>/dev/null; then
    echo "  [OK]   GPU 显存 < 110G (安全范围)"
    PASS=$((PASS+1))
else
    echo "  [WARN] GPU 显存 >= 110G,接近上限"
    WARN=$((WARN+1))
fi

echo ""
echo "═══════════════════════════════════════"
echo "  验证结果: $PASS 通过, $FAIL 失败, $WARN 警告"
echo "═══════════════════════════════════════"
exit $FAIL
