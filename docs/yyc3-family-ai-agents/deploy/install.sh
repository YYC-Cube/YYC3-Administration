#!/usr/bin/env bash
set -euo pipefail

echo "╔══════════════════════════════════════════════╗"
echo "║  YYC3 FAmily-AI 全链路部署                   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SYSTEMD_SRC="$SCRIPT_DIR/systemd"
PYTHON="/home/yyc3/llama-factory-env/bin/python3"

# === 1. 前置检查 ===
echo "=== [1/6] 前置检查 ==="

check_ok=true
nvidia-smi --query-gpu=name --format=csv,noheader >/dev/null 2>&1 || { echo "  FAIL: nvidia-smi 不可用"; check_ok=false; }
[ -f "$PYTHON" ] || { echo "  FAIL: Python venv 不存在: $PYTHON"; check_ok=false; }
$PYTHON -c "import flask, requests" 2>/dev/null || { echo "  FAIL: flask/requests 缺失"; check_ok=false; }
$PYTHON -c "import chromadb" 2>/dev/null || { echo "  FAIL: chromadb 缺失"; check_ok=false; }
$PYTHON -c "from sentence_transformers import SentenceTransformer" 2>/dev/null || { echo "  FAIL: sentence-transformers 缺失"; check_ok=false; }
docker ps --format '{{.Names}}' 2>/dev/null | grep -q nemoclaw-vllm || { echo "  WARN: nemoclaw-vllm 容器未运行 (Agent 将以 degraded 模式启动)"; }

if [ "$check_ok" = false ]; then
    echo ""
    echo "前置检查失败,请修复后重试。"
    echo "安装依赖: $PYTHON -m pip install flask requests chromadb sentence-transformers"
    exit 1
fi
echo "  [OK] 前置检查通过"
echo ""

# === 2. 创建目录 ===
echo "=== [2/6] 创建目录 ==="
mkdir -p ~/yyc3-102-projects/logs
mkdir -p ~/yyc3-102-projects/data/chromadb
mkdir -p ~/.nemoclaw/governance/data
mkdir -p ~/.nemoclaw/agents/logs
echo "  [OK] 目录创建完成"
echo ""

# === 3. 安装 systemd 服务 ===
echo "=== [3/6] 安装 systemd 服务 ==="

if [ ! -d "$SYSTEMD_SRC" ]; then
    echo "FAIL: systemd 源目录不存在: $SYSTEMD_SRC"
    exit 1
fi

sudo cp "$SYSTEMD_SRC"/yyc3-*.service /etc/systemd/system/
for d in "$SYSTEMD_SRC"/yyc3-agent@*.service.d; do
    [ -d "$d" ] && sudo cp -r "$d" /etc/systemd/system/
done
sudo systemctl daemon-reload
echo "  [OK] systemd 服务已安装 ($(ls "$SYSTEMD_SRC"/yyc3-*.service | wc -l) unit 文件 + 8 override)"
echo ""

# === 4. 启用开机自启 ===
echo "=== [4/6] 启用开机自启 ==="
sudo systemctl enable yyc3-governance yyc3-embedding yyc3-reranker yyc3-memory 2>/dev/null
for agent in tianshu qianxing wanwu xianzhi bole shouhu zongshi lingyun; do
    sudo systemctl enable "yyc3-agent@$agent" 2>/dev/null
done
echo "  [OK] 12 个服务已启用开机自启"
echo ""

# === 5. 按序启动 ===
echo "=== [5/6] 启动服务 (约需 1 分钟) ==="

echo "  [1/4] 启动治理中枢 :25700..."
sudo systemctl start yyc3-governance
sleep 3

echo "  [2/4] 启动 Embedding :8100 (加载 ~15GB 模型)..."
sudo systemctl start yyc3-embedding
sleep 15

echo "  [3/4] 启动 Memory :8102 + Reranker :8101 (加载 ~18GB 模型)..."
sudo systemctl start yyc3-memory
sleep 2
sudo systemctl start yyc3-reranker
sleep 20

echo "  [4/4] 启动 8 Agent 服务 :25600-25607..."
for agent in tianshu qianxing wanwu xianzhi bole shouhu zongshi lingyun; do
    sudo systemctl start "yyc3-agent@$agent"
    sleep 1
done
sleep 3
echo "  [OK] 全部服务已启动"
echo ""

# === 6. 注册协同拓扑 ===
echo "=== [6/6] 注册协同拓扑 ==="
$PYTHON ~/.nemoclaw/agents/register_topology.py 2>/dev/null && echo "  [OK] 五维协同拓扑已注册" || echo "  [WARN] 拓扑注册跳过 (可稍后手动执行)"
echo ""

# === 完成 ===
echo "╔══════════════════════════════════════════════════╗"
echo "║  部署完成!                                       ║"
echo "║                                                  ║"
echo "║  验证:  bash $SCRIPT_DIR/verify.sh               ║"
echo "║  状态:  bash $SCRIPT_DIR/ops.sh status            ║"
echo "║  测试:  bash $SCRIPT_DIR/ops.sh test              ║"
echo "║  仪表盘: curl -s http://127.0.0.1:25700/dashboard ║"
echo "╚══════════════════════════════════════════════════╝"
