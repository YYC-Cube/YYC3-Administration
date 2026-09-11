#!/usr/bin/env python3
"""
YYC³ FAmily-AI Agent Server v3.1 — 集成治理中枢

新增 (v3.1):
  - 每次推理自动上报行为审计
  - Token 使用量自动上报预算管理
  - 推理前检查 Agent 状态(是否被冻结)
  - 推理前注入上下文图谱
  - 推理后检查协同触发规则

用法: python agent_server.py --port <port> --role <role>
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime, timezone

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"),
                    format="%(asctime)s [%(name)s] %(levelname)s %(message)s")
logger = logging.getLogger(f"yyc3.agent.{os.environ.get('AGENT_NAME', 'unknown')}")

AGENT_NAME = os.environ.get("AGENT_NAME", "unknown")
AGENT_ROLE = os.environ.get("AGENT_ROLE", "unknown")
AGENT_LABEL = os.environ.get("AGENT_LABEL", "Unknown")
VLLM_ENDPOINT = os.environ.get("VLLM_ENDPOINT", "http://host.docker.internal:8000/v1")
VLLM_MODEL = os.environ.get("VLLM_MODEL", "Qwen/Qwen3.6-27B-FP8")
SYSTEM_PROMPT_PATH = os.environ.get("SYSTEM_PROMPT_PATH", "/workspace/SYSTEM.md")
GOVERNANCE_ENDPOINT = os.environ.get("GOVERNANCE_ENDPOINT", "http://localhost:25700")
START_TIME = datetime.now(timezone.utc)

_system_prompt_cache = None

def load_system_prompt():
    global _system_prompt_cache
    if _system_prompt_cache is not None:
        return _system_prompt_cache
    try:
        with open(SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
            _system_prompt_cache = f.read().strip()
    except FileNotFoundError:
        _system_prompt_cache = f"你是{AGENT_LABEL}，YYC³ FAmily-AI 的成员。"
    return _system_prompt_cache

def _governance_report(action, details):
    try:
        requests.post(f"{GOVERNANCE_ENDPOINT}/audit/record",
                      json={"agent": AGENT_NAME, "action": action,
                            "details": details, "correlation_id": ""}, timeout=2)
    except Exception:
        pass

def _governance_token(prompt_tokens, completion_tokens, latency_ms, model):
    try:
        requests.post(f"{GOVERNANCE_ENDPOINT}/budget/record",
                      json={"agent": AGENT_NAME, "prompt_tokens": prompt_tokens,
                            "completion_tokens": completion_tokens,
                            "latency_ms": latency_ms, "model": model}, timeout=2)
    except Exception:
        pass

def _check_frozen():
    try:
        r = requests.get(f"{GOVERNANCE_ENDPOINT}/agent-states", timeout=2)
        for a in r.json():
            if a["agent"] == AGENT_NAME and a["state"] == "frozen":
                return True, a.get("frozen_reason", "Unknown")
    except Exception:
        pass
    return False, ""

def _inject_context(user_message):
    try:
        r = requests.post(f"{GOVERNANCE_ENDPOINT}/context/inject",
                          json={"agent": AGENT_NAME, "task": user_message}, timeout=3)
        data = r.json()
        if data.get("count", 0) > 0:
            entities = data.get("injected_entities", [])
            ctx_str = "\n".join(f"  - {e['type']}/{e['id']}" for e in entities[:5])
            return f"\n\n## 动态上下文注入\n以下实体与当前任务相关:\n{ctx_str}"
    except Exception:
        pass
    return ""

def _check_collaboration(user_message, confidence=1.0, complexity=0.5, risk="low"):
    try:
        r = requests.post(f"{GOVERNANCE_ENDPOINT}/collaboration/check",
                          json={"primary_agent": AGENT_NAME, "confidence": confidence,
                                "complexity": complexity, "risk": risk,
                                "task_description": user_message}, timeout=3)
        return r.json()
    except Exception:
        return {"should_collaborate": False}

def call_vllm(messages, temperature=0.7, max_tokens=4096):
    headers = {"Content-Type": "application/json"}
    payload = {"model": VLLM_MODEL, "messages": messages,
               "temperature": temperature, "max_tokens": max_tokens, "stream": False,
               "chat_template_kwargs": {"enable_thinking": False}}
    try:
        resp = requests.post(f"{VLLM_ENDPOINT}/chat/completions",
                             headers=headers, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        usage = data.get("usage", {})
        content = data["choices"][0]["message"]["content"]
        if content is None:
            content = data["choices"][0]["message"].get("reasoning", "") or "(模型推理超时,请增大max_tokens)"
        return content, usage
    except requests.exceptions.ConnectionError:
        return {"error": "vLLM endpoint unavailable", "endpoint": VLLM_ENDPOINT}, {}
    except Exception as e:
        return {"error": str(e)}, {}

@app.route("/health", methods=["GET"])
def health():
    uptime = (datetime.now(timezone.utc) - START_TIME).total_seconds()
    vllm_ok = False
    try:
        r = requests.get(f"{VLLM_ENDPOINT}/models", timeout=5)
        vllm_ok = r.status_code == 200
    except Exception:
        pass
    frozen, reason = _check_frozen()
    return jsonify({
        "status": "frozen" if frozen else ("healthy" if vllm_ok else "degraded"),
        "agent": AGENT_NAME, "label": AGENT_LABEL, "role": AGENT_ROLE,
        "uptime_seconds": round(uptime, 1), "vllm_reachable": vllm_ok,
        "model": VLLM_MODEL, "frozen": frozen, "frozen_reason": reason,
        "governance_connected": GOVERNANCE_ENDPOINT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    user_message = data.get("message", "")
    temperature = data.get("temperature", 0.7)
    max_tokens = data.get("max_tokens", 4096)
    history = data.get("history", [])
    risk = data.get("risk", "low")
    complexity = data.get("complexity", 0.5)

    if not user_message:
        return jsonify({"error": "message field is required"}), 400

    frozen, reason = _check_frozen()
    if frozen:
        _governance_report("frozen_block", {"reason": reason, "message": user_message[:100]})
        return jsonify({"error": "Agent is frozen", "reason": reason, "agent": AGENT_NAME}), 403

    _governance_report("chat_request", {"message_len": len(user_message), "risk": risk})

    system_prompt = load_system_prompt()
    context_injection = _inject_context(user_message)
    if context_injection:
        system_prompt += context_injection

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    start = time.time()
    response, usage = call_vllm(messages, temperature=temperature, max_tokens=max_tokens)
    latency = round((time.time() - start) * 1000, 1)

    prompt_tokens = usage.get("prompt_tokens", 0)
    completion_tokens = usage.get("completion_tokens", 0)
    _governance_token(prompt_tokens, completion_tokens, latency, VLLM_MODEL)

    _governance_report("chat_response", {"latency_ms": latency,
                                         "tokens": prompt_tokens + completion_tokens})

    confidence = 0.85
    collab = _check_collaboration(user_message, confidence, complexity, risk)

    return jsonify({
        "agent": AGENT_NAME, "label": AGENT_LABEL, "role": AGENT_ROLE,
        "response": response,
        "usage": usage, "latency_ms": latency,
        "collaboration": collab,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

@app.route("/status", methods=["GET"])
def status():
    return jsonify({
        "agent": AGENT_NAME, "label": AGENT_LABEL, "role": AGENT_ROLE,
        "model": VLLM_MODEL, "vllm_endpoint": VLLM_ENDPOINT,
        "governance_endpoint": GOVERNANCE_ENDPOINT,
        "system_prompt_loaded": os.path.exists(SYSTEM_PROMPT_PATH),
        "uptime_seconds": round((datetime.now(timezone.utc) - START_TIME).total_seconds(), 1),
    })

@app.route("/identity", methods=["GET"])
def identity():
    identity_path = os.path.join(os.path.dirname(SYSTEM_PROMPT_PATH), "IDENTITY.md")
    soul_path = os.path.join(os.path.dirname(SYSTEM_PROMPT_PATH), "SOUL.md")
    result = {
        "agent": AGENT_NAME, "label": AGENT_LABEL, "role": AGENT_ROLE,
        "identity_loaded": os.path.exists(identity_path),
        "soul_loaded": os.path.exists(soul_path),
        "system_prompt_loaded": os.path.exists(SYSTEM_PROMPT_PATH),
    }
    if os.path.exists(identity_path):
        with open(identity_path, "r", encoding="utf-8") as f:
            result["identity_content"] = f.read().strip()
    return jsonify(result)

@app.route("/capabilities", methods=["GET"])
def capabilities():
    return jsonify({
        "agent": AGENT_NAME, "label": AGENT_LABEL, "role": AGENT_ROLE,
        "endpoints": ["/health", "/chat", "/status", "/capabilities", "/identity"],
        "model": VLLM_MODEL,
        "governance_integrated": True,
    })

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=f"YYC³ Agent Server — {AGENT_LABEL}")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 6000)))
    parser.add_argument("--role", type=str, default=AGENT_ROLE)
    args = parser.parse_args()
    logger.info(f"Starting {AGENT_LABEL} ({AGENT_NAME}) on port {args.port}")
    logger.info(f"vLLM: {VLLM_ENDPOINT} | Governance: {GOVERNANCE_ENDPOINT}")
    app.run(host="0.0.0.0", port=args.port, debug=False)
