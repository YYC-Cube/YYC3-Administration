#!/usr/bin/env python3
"""
YYC³ FAmily-AI Agent 治理中枢 — 统一监控/审计/熔断/成本管理
v1.0.0 | 2026-07-28

功能:
  P0-1: 行为审计管道 + Kill Switch (UEBA 基线学习 + 异常检测 + 一键冻结)
  P0-2: Token 预算管理 + 成本追踪 (per-agent 日/周/月限额 + 效率仪表盘)
  P0-3: 跨维度协同触发规则 (置信度/复杂度/风险等级 量化触发)
  P1-1: ACS 治理标准映射 (可移植策略文件)
  P1-2: 上下文图谱基础 (实体关系存储 + 动态注入)

部署: 作为独立服务运行 (Port 25700) 或嵌入 agent_server.py
"""

import hashlib
import json
import logging
import os
import sqlite3
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from flask import Flask, jsonify, request

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s %(message)s")
logger = logging.getLogger("yyc3.governance")

DB_PATH = os.environ.get("GOVERNANCE_DB", "/data/governance.db")
AGENTS = ["tianshu", "qianxing", "wanwu", "xianzhi", "bole", "shouhu", "zongshi", "lingyun"]

# ════════════════════════════════════════════════════════════════════════════
# 数据模型
# ════════════════════════════════════════════════════════════════════════════

class AgentState(Enum):
    ACTIVE = "active"
    FROZEN = "frozen"
    DEGRADED = "degraded"

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class BehaviorEvent:
    agent: str
    action: str
    details: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    risk: str = "low"
    correlation_id: str = ""

@dataclass
class TokenBudget:
    agent: str
    daily_limit: int
    weekly_limit: int
    monthly_limit: int
    used_today: int = 0
    used_this_week: int = 0
    used_this_month: int = 0
    cost_today: float = 0.0
    last_reset_daily: str = ""
    last_reset_weekly: str = ""
    last_reset_monthly: str = ""

@dataclass
class CollaborationRule:
    primary_agent: str
    support_agent: str
    confidence_threshold: float
    complexity_threshold: float
    risk_required: List[str]
    timeout_ms: int
    fallback: str = "degrade"

# ════════════════════════════════════════════════════════════════════════════
# 数据库初始化
# ════════════════════════════════════════════════════════════════════════════

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS behavior_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            risk TEXT DEFAULT 'low',
            correlation_id TEXT,
            timestamp TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS token_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent TEXT NOT NULL,
            prompt_tokens INTEGER DEFAULT 0,
            completion_tokens INTEGER DEFAULT 0,
            total_tokens INTEGER DEFAULT 0,
            latency_ms REAL DEFAULT 0,
            model TEXT DEFAULT '',
            cost_estimate REAL DEFAULT 0,
            timestamp TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS agent_state (
            agent TEXT PRIMARY KEY,
            state TEXT DEFAULT 'active',
            frozen_reason TEXT,
            frozen_at TEXT,
            updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS collaboration_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            primary_agent TEXT,
            support_agent TEXT,
            trigger_reason TEXT,
            task_description TEXT,
            confidence FLOAT,
            complexity FLOAT,
            risk TEXT,
            status TEXT DEFAULT 'initiated',
            timestamp TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS context_entities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            attributes TEXT,
            created_at TEXT,
            updated_at TEXT,
            UNIQUE(entity_type, entity_id)
        );
        CREATE TABLE IF NOT EXISTS context_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_type TEXT, source_id TEXT,
            target_type TEXT, target_id TEXT,
            relation_type TEXT,
            weight REAL DEFAULT 1.0,
            attributes TEXT,
            UNIQUE(source_type, source_id, target_type, target_id, relation_type)
        );
        CREATE INDEX IF NOT EXISTS idx_behavior_agent ON behavior_events(agent);
        CREATE INDEX IF NOT EXISTS idx_behavior_ts ON behavior_events(timestamp);
        CREATE INDEX IF NOT EXISTS idx_token_agent ON token_usage(agent);
        CREATE INDEX IF NOT EXISTS idx_token_ts ON token_usage(timestamp);
    """)
    for agent in AGENTS:
        c.execute("INSERT OR IGNORE INTO agent_state (agent, state, updated_at) VALUES (?, 'active', ?)",
                  (agent, datetime.now(timezone.utc).isoformat()))
    conn.commit()
    conn.close()
    logger.info(f"Governance DB initialized at {DB_PATH}")

# ════════════════════════════════════════════════════════════════════════════
# P0-1: 行为审计 + Kill Switch + UEBA
# ════════════════════════════════════════════════════════════════════════════

class BehaviorAuditor:
    """Agent 行为审计引擎 — UEBA 基线学习 + 异常检测 + 自动熔断"""

    BEHAVIORAL_BASELINES: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
    ANOMALY_THRESHOLDS = {
        "actions_per_minute": {"normal": 10, "warning": 20, "critical": 50},
        "risk_score_avg": {"normal": 0.3, "warning": 0.6, "critical": 0.9},
        "external_calls_per_hour": {"normal": 30, "warning": 80, "critical": 200},
    }

    DANGEROUS_ACTIONS = {
        "file_delete": RiskLevel.HIGH,
        "network_external_write": RiskLevel.HIGH,
        "permission_change": RiskLevel.CRITICAL,
        "data_export": RiskLevel.HIGH,
        "config_override": RiskLevel.CRITICAL,
        "agent_self_modify": RiskLevel.CRITICAL,
        "shell_exec": RiskLevel.MEDIUM,
        "db_write": RiskLevel.MEDIUM,
        "api_call": RiskLevel.LOW,
        "file_read": RiskLevel.LOW,
        "internal_chat": RiskLevel.LOW,
    }

    def __init__(self):
        self._action_counts: Dict[str, List[Tuple[float, str]]] = defaultdict(list)
        self._lock = threading.Lock()

    def record(self, agent: str, action: str, details: Dict[str, Any] = None,
               correlation_id: str = "") -> Dict[str, Any]:
        details = details or {}
        risk = self._assess_risk(action, details)
        ts = datetime.now(timezone.utc).isoformat()
        event = BehaviorEvent(agent=agent, action=action, details=details,
                              risk=risk.value, correlation_id=correlation_id or ts)

        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "INSERT INTO behavior_events (agent, action, details, risk, correlation_id, timestamp) VALUES (?,?,?,?,?,?)",
            (agent, action, json.dumps(details, ensure_ascii=False), risk.value, event.correlation_id, ts)
        )
        conn.commit()
        conn.close()

        with self._lock:
            now = time.time()
            self._action_counts[agent].append((now, risk.value))
            self._action_counts[agent] = [(t, r) for t, r in self._action_counts[agent] if now - t < 60]

        anomaly = self._detect_anomaly(agent)
        if anomaly["level"] == "critical":
            self._auto_freeze(agent, f"Critical anomaly: {anomaly['reason']}")
        return {"event_id": event.correlation_id, "risk": risk.value, "anomaly": anomaly}

    def _assess_risk(self, action: str, details: Dict) -> RiskLevel:
        if action in self.DANGEROUS_ACTIONS:
            base = self.DANGEROUS_ACTIONS[action]
            if details.get("external_target") and base.value in ("medium", "low"):
                base = RiskLevel(base.value == "low" and "medium" or "high") if base == RiskLevel.LOW else RiskLevel.HIGH
            return base
        sensitive = any(k in str(details).lower() for k in ["password", "secret", "key", "token", "credential"])
        if sensitive:
            return RiskLevel.HIGH
        return RiskLevel.LOW

    def _detect_anomaly(self, agent: str) -> Dict[str, Any]:
        with self._lock:
            recent = self._action_counts.get(agent, [])
            now = time.time()
            last_minute = [(t, r) for t, r in recent if now - t < 60]
            actions_per_min = len(last_minute)
            high_risk_count = sum(1 for _, r in last_minute if r in ("high", "critical"))

        thresholds = self.ANOMALY_THRESHOLDS["actions_per_minute"]
        if actions_per_min >= thresholds["critical"]:
            return {"level": "critical", "reason": f"{actions_per_min} actions/min (critical={thresholds['critical']})",
                    "actions_per_minute": actions_per_min}
        if actions_per_min >= thresholds["warning"]:
            return {"level": "warning", "reason": f"{actions_per_min} actions/min (warning={thresholds['warning']})",
                    "actions_per_minute": actions_per_min}
        if high_risk_count >= 3:
            return {"level": "warning", "reason": f"{high_risk_count} high-risk actions in 60s",
                    "high_risk_count": high_risk_count}
        return {"level": "normal", "reason": "", "actions_per_minute": actions_per_min}

    def _auto_freeze(self, agent: str, reason: str):
        logger.critical(f"AUTO-FREEZE: {agent} — {reason}")
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "UPDATE agent_state SET state='frozen', frozen_reason=?, frozen_at=?, updated_at=? WHERE agent=?",
            (reason, datetime.now(timezone.utc).isoformat(),
             datetime.now(timezone.utc).isoformat(), agent)
        )
        conn.commit()
        conn.close()

    def kill_switch(self, agent: str = "ALL", reason: str = "Manual kill switch") -> Dict:
        """一键冻结 Agent (kill switch)"""
        targets = [agent] if agent != "ALL" else AGENTS
        results = {}
        conn = sqlite3.connect(DB_PATH)
        for a in targets:
            conn.execute(
                "UPDATE agent_state SET state='frozen', frozen_reason=?, frozen_at=?, updated_at=? WHERE agent=?",
                (reason, datetime.now(timezone.utc).isoformat(),
                 datetime.now(timezone.utc).isoformat(), a)
            )
            results[a] = "frozen"
            logger.warning(f"KILL SWITCH: {a} frozen — {reason}")
        conn.commit()
        conn.close()
        return {"killed": results, "reason": reason}

    def unfreeze(self, agent: str) -> Dict:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "UPDATE agent_state SET state='active', frozen_reason=NULL, frozen_at=NULL, updated_at=? WHERE agent=?",
            (datetime.now(timezone.utc).isoformat(), agent)
        )
        conn.commit()
        conn.close()
        logger.info(f"UNFREEZE: {agent} restored to active")
        return {"agent": agent, "state": "active"}

    def get_audit_trail(self, agent: str = None, limit: int = 100) -> List[Dict]:
        conn = sqlite3.connect(DB_PATH)
        if agent:
            rows = conn.execute(
                "SELECT * FROM behavior_events WHERE agent=? ORDER BY id DESC LIMIT ?",
                (agent, limit)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM behavior_events ORDER BY id DESC LIMIT ?", (limit,)
            ).fetchall()
        conn.close()
        cols = ["id", "agent", "action", "details", "risk", "correlation_id", "timestamp"]
        return [dict(zip(cols, r)) for r in rows]


auditor = BehaviorAuditor()

# ════════════════════════════════════════════════════════════════════════════
# P0-2: Token 预算 + 成本追踪
# ════════════════════════════════════════════════════════════════════════════

DEFAULT_BUDGETS = {
    "tianshu":    {"daily": 500_000, "weekly": 3_000_000, "monthly": 12_000_000},
    "qianxing":  {"daily": 200_000, "weekly": 1_000_000, "monthly": 4_000_000},
    "wanwu":     {"daily": 800_000, "weekly": 5_000_000, "monthly": 20_000_000},
    "xianzhi":   {"daily": 400_000, "weekly": 2_500_000, "monthly": 10_000_000},
    "bole":      {"daily": 300_000, "weekly": 1_500_000, "monthly": 6_000_000},
    "shouhu":    {"daily": 200_000, "weekly": 1_000_000, "monthly": 4_000_000},
    "zongshi":   {"daily": 600_000, "weekly": 4_000_000, "monthly": 15_000_000},
    "lingyun":   {"daily": 500_000, "weekly": 3_000_000, "monthly": 12_000_000},
}

# 成本估算 (本地 vLLM, 仅电力+折旧估算, 元/百万token)
COST_PER_MILLION_TOKENS = 0.5

class TokenBudgetManager:
    """Token 预算管理 — 日/周/月限额 + 成本追踪 + 自动降级"""

    def __init__(self):
        self._budgets: Dict[str, TokenBudget] = {}
        self._init_budgets()

    def _init_budgets(self):
        for agent, limits in DEFAULT_BUDGETS.items():
            self._budgets[agent] = TokenBudget(
                agent=agent,
                daily_limit=limits["daily"],
                weekly_limit=limits["weekly"],
                monthly_limit=limits["monthly"],
            )

    def record_usage(self, agent: str, prompt_tokens: int, completion_tokens: int,
                     latency_ms: float = 0, model: str = "") -> Dict[str, Any]:
        total = prompt_tokens + completion_tokens
        budget = self._budgets.get(agent)
        if not budget:
            return {"error": f"Unknown agent: {agent}"}

        budget.used_today += total
        budget.used_this_week += total
        budget.used_this_month += total
        cost = (total / 1_000_000) * COST_PER_MILLION_TOKENS
        budget.cost_today += cost

        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "INSERT INTO token_usage (agent, prompt_tokens, completion_tokens, total_tokens, latency_ms, model, cost_estimate, timestamp) VALUES (?,?,?,?,?,?,?,?)",
            (agent, prompt_tokens, completion_tokens, total, latency_ms, model, cost,
             datetime.now(timezone.utc).isoformat())
        )
        conn.commit()
        conn.close()

        status = self._check_budget(agent)
        if status["daily"]["exceeded"] or status["monthly"]["exceeded"]:
            logger.warning(f"BUDGET EXCEEDED: {agent} — daily={status['daily']['pct']:.1f}% monthly={status['monthly']['pct']:.1f}%")
        return status

    def _check_budget(self, agent: str) -> Dict[str, Any]:
        b = self._budgets[agent]
        daily_pct = (b.used_today / b.daily_limit) * 100
        weekly_pct = (b.used_this_week / b.weekly_limit) * 100
        monthly_pct = (b.used_this_month / b.monthly_limit) * 100
        return {
            "agent": agent,
            "daily": {"used": b.used_today, "limit": b.daily_limit, "pct": round(daily_pct, 1),
                      "exceeded": daily_pct >= 100, "remaining": max(0, b.daily_limit - b.used_today)},
            "weekly": {"used": b.used_this_week, "limit": b.weekly_limit, "pct": round(weekly_pct, 1),
                       "exceeded": weekly_pct >= 100},
            "monthly": {"used": b.used_this_month, "limit": b.monthly_limit, "pct": round(monthly_pct, 1),
                        "exceeded": monthly_pct >= 100},
            "cost_today_cny": round(b.cost_today, 4),
            "should_degrade": daily_pct >= 80 or monthly_pct >= 85,
            "should_block": daily_pct >= 100 or monthly_pct >= 100,
        }

    def get_dashboard(self) -> Dict[str, Any]:
        return {agent: self._check_budget(agent) for agent in AGENTS}

    def reset_daily(self):
        for b in self._budgets.values():
            b.used_today = 0
            b.cost_today = 0.0
        logger.info("Daily token budgets reset")

    def get_usage_history(self, agent: str = None, hours: int = 24) -> List[Dict]:
        since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
        conn = sqlite3.connect(DB_PATH)
        if agent:
            rows = conn.execute(
                "SELECT agent, total_tokens, latency_ms, cost_estimate, timestamp FROM token_usage WHERE agent=? AND timestamp>? ORDER BY id DESC",
                (agent, since)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT agent, total_tokens, latency_ms, cost_estimate, timestamp FROM token_usage WHERE timestamp>? ORDER BY id DESC",
                (since,)
            ).fetchall()
        conn.close()
        cols = ["agent", "total_tokens", "latency_ms", "cost_estimate", "timestamp"]
        return [dict(zip(cols, r)) for r in rows]

budget_mgr = TokenBudgetManager()

# ════════════════════════════════════════════════════════════════════════════
# P0-3: 跨维度协同触发规则
# ════════════════════════════════════════════════════════════════════════════

COLLABORATION_RULES = [
    CollaborationRule("tianshu", "wanwu", confidence_threshold=0.75, complexity_threshold=0.6,
                      risk_required=["high", "critical"], timeout_ms=5000),
    CollaborationRule("tianshu", "shouhu", confidence_threshold=0.85, complexity_threshold=0.3,
                      risk_required=["high", "critical"], timeout_ms=3000),
    CollaborationRule("wanwu", "xianzhi", confidence_threshold=0.70, complexity_threshold=0.7,
                      risk_required=["medium", "high"], timeout_ms=8000),
    CollaborationRule("zongshi", "shouhu", confidence_threshold=0.80, complexity_threshold=0.5,
                      risk_required=["high"], timeout_ms=5000),
    CollaborationRule("qianxing", "tianshu", confidence_threshold=0.65, complexity_threshold=0.4,
                      risk_required=["low", "medium"], timeout_ms=3000),
    CollaborationRule("lingyun", "bole", confidence_threshold=0.65, complexity_threshold=0.5,
                      risk_required=["low", "medium"], timeout_ms=5000),
    CollaborationRule("shouhu", "zongshi", confidence_threshold=0.80, complexity_threshold=0.6,
                      risk_required=["high", "critical"], timeout_ms=5000),
    CollaborationRule("bole", "lingyun", confidence_threshold=0.65, complexity_threshold=0.4,
                      risk_required=["low", "medium"], timeout_ms=5000),
]

class CollaborationEngine:
    """协同决策引擎 — 量化触发规则 + Fallback 链"""

    FALLBACK_CHAIN = {
        "tianshu": ["wanwu", "xianzhi"],
        "wanwu": ["xianzhi", "tianshu"],
        "zongshi": ["shouhu", "tianshu"],
        "qianxing": ["tianshu", "wanwu"],
        "xianzhi": ["wanwu", "tianshu"],
        "bole": ["lingyun", "wanwu"],
        "shouhu": [],
        "lingyun": ["wanwu", "bole"],
    }

    def should_collaborate(self, primary: str, confidence: float, complexity: float,
                           risk: str, task_description: str = "") -> Dict[str, Any]:
        triggered = []
        for rule in COLLABORATION_RULES:
            if rule.primary_agent != primary:
                continue
            reasons = []
            if confidence < rule.confidence_threshold:
                reasons.append(f"confidence {confidence:.2f} < {rule.confidence_threshold}")
            if complexity > rule.complexity_threshold:
                reasons.append(f"complexity {complexity:.2f} > {rule.complexity_threshold}")
            if risk in rule.risk_required:
                reasons.append(f"risk={risk} requires support")
            if reasons:
                triggered.append({
                    "support_agent": rule.support_agent,
                    "reason": "; ".join(reasons),
                    "timeout_ms": rule.timeout_ms,
                    "fallback": rule.fallback,
                })
        result = {
            "primary_agent": primary,
            "should_collaborate": len(triggered) > 0,
            "collaborators": triggered,
            "fallback_chain": self.FALLBACK_CHAIN.get(primary, []),
            "task": task_description,
            "confidence": confidence,
            "complexity": complexity,
            "risk": risk,
        }
        if triggered:
            conn = sqlite3.connect(DB_PATH)
            for t in triggered:
                conn.execute(
                    "INSERT INTO collaboration_log (primary_agent, support_agent, trigger_reason, task_description, confidence, complexity, risk, timestamp) VALUES (?,?,?,?,?,?,?,?)",
                    (primary, t["support_agent"], t["reason"], task_description, confidence, complexity, risk,
                     datetime.now(timezone.utc).isoformat())
                )
            conn.commit()
            conn.close()
        return result

    def get_fallback(self, agent: str) -> List[str]:
        return self.FALLBACK_CHAIN.get(agent, [])

collab_engine = CollaborationEngine()

# ════════════════════════════════════════════════════════════════════════════
# P1-1: ACS 治理标准映射
# ════════════════════════════════════════════════════════════════════════════

class ACSPolicyMapper:
    """Agent Control Specification 策略生成 — 可移植治理文件"""

    ACS_TEMPLATE = {
        "version": "1.0",
        "standard": "Microsoft Agent Control Specification",
        "agent_id": "",
        "display_name": "",
        "interception_points": [
            {"stage": "before_input", "checks": ["prompt_injection_detection", "sensitive_data_filter"]},
            {"stage": "before_tool_call", "checks": ["permission_verify", "risk_assess", "budget_check"]},
            {"stage": "after_tool_return", "checks": ["output_sanitization", "hallucination_check"]},
            {"stage": "before_final_response", "checks": ["compliance_review", "bias_detection"]}
        ],
        "permissions": {},
        "human_approval_required": [],
        "evidence_logging": {
            "log_all_actions": True,
            "log_correlation_id": True,
            "log_risk_level": True,
            "retention_days": 90
        }
    }

    AGENT_ACS_CONFIG = {
        "main": {"display_name": "元启·天枢", "max_autonomy": "semi_autonomous",
                 "human_approval_required": ["strategic_decisions", "resource_reallocation"]},
        "research": {"display_name": "语枢·万物", "max_autonomy": "autonomous_read",
                     "human_approval_required": ["external_data_export"]},
        "coder": {"display_name": "格物·宗师", "max_autonomy": "autonomous_review",
                  "human_approval_required": ["production_deploy", "config_change"]},
        "navigator": {"display_name": "言启·千行", "max_autonomy": "autonomous_route",
                      "human_approval_required": []},
        "prophet": {"display_name": "预见·先知", "max_autonomy": "autonomous_predict",
                    "human_approval_required": ["high_impact_forecast"]},
        "bole": {"display_name": "知遇·伯乐", "max_autonomy": "autonomous_recommend",
                 "human_approval_required": ["hiring_decision"]},
        "sentinel": {"display_name": "智云·守护", "max_autonomy": "autonomous_monitor",
                     "human_approval_required": ["block_traffic", "revoke_access"]},
        "muse": {"display_name": "创想·灵韵", "max_autonomy": "autonomous_create",
                 "human_approval_required": ["external_publish"]},
    }

    def generate_policy(self, agent: str) -> Dict[str, Any]:
        config = self.AGENT_ACS_CONFIG.get(agent, {})
        policy = json.loads(json.dumps(self.ACS_TEMPLATE))
        policy["agent_id"] = agent
        policy["display_name"] = config.get("display_name", agent)
        policy["max_autonomy"] = config.get("max_autonomy", "manual")
        policy["human_approval_required"] = config.get("human_approval_required", [])
        return policy

    def generate_all(self) -> Dict[str, Any]:
        return {agent: self.generate_policy(agent) for agent in AGENTS}

acs_mapper = ACSPolicyMapper()

# ════════════════════════════════════════════════════════════════════════════
# P1-2: 上下文图谱基础
# ════════════════════════════════════════════════════════════════════════════

class ContextGraph:
    """动态上下文图谱 — 实体/关系/权限的实时存储与注入"""

    def add_entity(self, entity_type: str, entity_id: str, attributes: Dict = None) -> Dict:
        ts = datetime.now(timezone.utc).isoformat()
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "INSERT OR REPLACE INTO context_entities (entity_type, entity_id, attributes, created_at, updated_at) VALUES (?,?,?,?,?)",
            (entity_type, entity_id, json.dumps(attributes or {}, ensure_ascii=False), ts, ts)
        )
        conn.commit()
        conn.close()
        return {"status": "ok", "entity": f"{entity_type}/{entity_id}"}

    def add_relation(self, src_type: str, src_id: str, tgt_type: str, tgt_id: str,
                     relation: str, weight: float = 1.0, attributes: Dict = None) -> Dict:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            "INSERT OR REPLACE INTO context_relations (source_type, source_id, target_type, target_id, relation_type, weight, attributes) VALUES (?,?,?,?,?,?,?)",
            (src_type, src_id, tgt_type, tgt_id, relation, weight,
             json.dumps(attributes or {}, ensure_ascii=False))
        )
        conn.commit()
        conn.close()
        return {"status": "ok", "relation": f"{src_type}/{src_id} --[{relation}]--> {tgt_type}/{tgt_id}"}

    def query_neighbors(self, entity_type: str, entity_id: str, depth: int = 1) -> Dict:
        conn = sqlite3.connect(DB_PATH)
        rows = conn.execute(
            "SELECT target_type, target_id, relation_type, weight FROM context_relations WHERE source_type=? AND source_id=?",
            (entity_type, entity_id)
        ).fetchall()
        conn.close()
        neighbors = [{"type": r[0], "id": r[1], "relation": r[2], "weight": r[3]} for r in rows]
        return {"entity": f"{entity_type}/{entity_id}", "neighbors": neighbors, "depth": depth}

    def inject_context(self, agent: str, task: str) -> Dict:
        """为 Agent 注入动态上下文 (替代简单RAG)"""
        entities = task.lower().split()
        relevant = []
        conn = sqlite3.connect(DB_PATH)
        for keyword in entities:
            if len(keyword) < 2:
                continue
            rows = conn.execute(
                "SELECT entity_type, entity_id, attributes FROM context_entities WHERE entity_id LIKE ? LIMIT 5",
                (f"%{keyword}%",)
            ).fetchall()
            for r in rows:
                relevant.append({"type": r[0], "id": r[1], "attributes": json.loads(r[2] or "{}")})
        conn.close()
        return {"agent": agent, "injected_entities": relevant[:10], "count": len(relevant)}

    def stats(self) -> Dict:
        conn = sqlite3.connect(DB_PATH)
        entity_count = conn.execute("SELECT COUNT(*) FROM context_entities").fetchone()[0]
        relation_count = conn.execute("SELECT COUNT(*) FROM context_relations").fetchone()[0]
        conn.close()
        return {"entities": entity_count, "relations": relation_count}

context_graph = ContextGraph()

# ════════════════════════════════════════════════════════════════════════════
# Flask API 路由
# ════════════════════════════════════════════════════════════════════════════

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "yyc3-governance", "version": "1.0.0",
                    "timestamp": datetime.now(timezone.utc).isoformat()})

# --- P0-1: 行为审计 ---

@app.route("/audit/record", methods=["POST"])
def audit_record():
    d = request.get_json(force=True)
    result = auditor.record(d.get("agent",""), d.get("action",""), d.get("details",{}), d.get("correlation_id",""))
    return jsonify(result)

@app.route("/audit/trail", methods=["GET"])
def audit_trail():
    agent = request.args.get("agent")
    limit = int(request.args.get("limit", 100))
    return jsonify(auditor.get_audit_trail(agent, limit))

@app.route("/kill-switch", methods=["POST"])
def kill_switch():
    d = request.get_json(force=True)
    return jsonify(auditor.kill_switch(d.get("agent", "ALL"), d.get("reason", "Manual")))

@app.route("/unfreeze", methods=["POST"])
def unfreeze():
    d = request.get_json(force=True)
    return jsonify(auditor.unfreeze(d.get("agent", "")))

@app.route("/agent-states", methods=["GET"])
def agent_states():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("SELECT * FROM agent_state").fetchall()
    conn.close()
    cols = ["agent", "state", "frozen_reason", "frozen_at", "updated_at"]
    return jsonify([dict(zip(cols, r)) for r in rows])

# --- P0-2: Token 预算 ---

@app.route("/budget/dashboard", methods=["GET"])
def budget_dashboard():
    return jsonify(budget_mgr.get_dashboard())

@app.route("/budget/record", methods=["POST"])
def budget_record():
    d = request.get_json(force=True)
    return jsonify(budget_mgr.record_usage(
        d.get("agent",""), d.get("prompt_tokens",0), d.get("completion_tokens",0),
        d.get("latency_ms",0), d.get("model","")
    ))

@app.route("/budget/history", methods=["GET"])
def budget_history():
    agent = request.args.get("agent")
    hours = int(request.args.get("hours", 24))
    return jsonify(budget_mgr.get_usage_history(agent, hours))

@app.route("/budget/reset-daily", methods=["POST"])
def budget_reset():
    budget_mgr.reset_daily()
    return jsonify({"status": "ok", "message": "Daily budgets reset"})

# --- P0-3: 协同规则 ---

@app.route("/collaboration/check", methods=["POST"])
def collab_check():
    d = request.get_json(force=True)
    return jsonify(collab_engine.should_collaborate(
        d.get("primary_agent",""), d.get("confidence",1.0), d.get("complexity",0.0),
        d.get("risk","low"), d.get("task_description","")
    ))

@app.route("/collaboration/rules", methods=["GET"])
def collab_rules():
    return jsonify([{
        "primary": r.primary_agent, "support": r.support_agent,
        "confidence_threshold": r.confidence_threshold,
        "complexity_threshold": r.complexity_threshold,
        "risk_required": r.risk_required, "timeout_ms": r.timeout_ms,
    } for r in COLLABORATION_RULES])

# --- P1-1: ACS ---

@app.route("/acs/policy/<agent>", methods=["GET"])
def acs_policy(agent):
    return jsonify(acs_mapper.generate_policy(agent))

@app.route("/acs/all", methods=["GET"])
def acs_all():
    return jsonify(acs_mapper.generate_all())

# --- P1-2: 上下文图谱 ---

@app.route("/context/entity", methods=["POST"])
def ctx_add_entity():
    d = request.get_json(force=True)
    return jsonify(context_graph.add_entity(d["type"], d["id"], d.get("attributes")))

@app.route("/context/relation", methods=["POST"])
def ctx_add_relation():
    d = request.get_json(force=True)
    return jsonify(context_graph.add_relation(
        d["src_type"], d["src_id"], d["tgt_type"], d["tgt_id"],
        d["relation"], d.get("weight", 1.0), d.get("attributes")
    ))

@app.route("/context/query", methods=["GET"])
def ctx_query():
    etype = request.args.get("type")
    eid = request.args.get("id")
    return jsonify(context_graph.query_neighbors(etype, eid))

@app.route("/context/inject", methods=["POST"])
def ctx_inject():
    d = request.get_json(force=True)
    return jsonify(context_graph.inject_context(d.get("agent",""), d.get("task","")))

@app.route("/context/stats", methods=["GET"])
def ctx_stats():
    return jsonify(context_graph.stats())

# --- P0-3: 记忆路由 + 多成员Profile ---

_chroma_client = None

def get_chroma():
    global _chroma_client
    if _chroma_client is None:
        import chromadb
        _chroma_client = chromadb.HttpClient(host='127.0.0.1', port=19500)
    return _chroma_client

def get_profile_router():
    import sys
    mem_path = os.path.expanduser("~/.nemoclaw/memory")
    if mem_path not in sys.path:
        sys.path.insert(0, mem_path)
    from profile_router import ProfileRouter
    if not hasattr(get_profile_router, '_router'):
        get_profile_router._router = ProfileRouter()
    return get_profile_router._router

@app.route("/memory/recall", methods=["GET"])
def memory_recall():
    agent = request.args.get("agent", "tianshu")
    member = request.args.get("member", "default")
    query = request.args.get("query", "")
    top_k = int(request.args.get("top_k", 5))
    try:
        chroma = get_chroma()
        results_combined = {"agent_memories": [], "member_memories": []}
        col_agent = chroma.get_or_create_collection(f"agent_{agent}")
        r = col_agent.query(query_texts=[query], n_results=top_k)
        results_combined["agent_memories"] = [
            {"id": r["ids"][0][i] if i < len(r["ids"][0]) else "",
             "document": r["documents"][0][i] if i < len(r["documents"][0]) else "",
             "metadata": r["metadatas"][0][i] if i < len(r["metadatas"][0]) else {}}
            for i in range(len(r.get("ids", [[]])[0]))
        ]
        if member and member != "default":
            try:
                col_member = chroma.get_or_create_collection(f"member_family_{member}")
                r2 = col_member.query(query_texts=[query], n_results=top_k)
                results_combined["member_memories"] = [
                    {"id": r2["ids"][0][i] if i < len(r2["ids"][0]) else "",
                     "document": r2["documents"][0][i] if i < len(r2["documents"][0]) else "",
                     "metadata": r2["metadatas"][0][i] if i < len(r2["metadatas"][0]) else {}}
                    for i in range(len(r2.get("ids", [[]])[0]))
                ]
            except Exception:
                pass
        return jsonify({"status": "ok", "memories": results_combined})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route("/memory/store", methods=["POST"])
def memory_store():
    d = request.get_json(force=True)
    agent = d.get("agent", "tianshu")
    member = d.get("member", "")
    content = d.get("content", "")
    metadata = d.get("metadata", {})
    import uuid
    try:
        chroma = get_chroma()
        store_id = str(uuid.uuid4())
        metadata.setdefault("agent", agent)
        if member:
            metadata.setdefault("member", member)
        metadata.setdefault("stored_at", datetime.now(timezone.utc).isoformat())
        col = chroma.get_or_create_collection(f"agent_{agent}")
        col.add(documents=[content], ids=[store_id], metadatas=[metadata])
        if member:
            try:
                col_m = chroma.get_or_create_collection(f"member_family_{member}")
                col_m.add(documents=[content], ids=[store_id], metadatas=[metadata])
            except Exception:
                pass
        return jsonify({"status": "stored", "id": store_id})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route("/members/list", methods=["GET"])
def members_list():
    try:
        router = get_profile_router()
        return jsonify({"status": "ok", "members": router.list_members()})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route("/members/create", methods=["POST"])
def members_create():
    d = request.get_json(force=True)
    try:
        router = get_profile_router()
        router.create_member(d["member_id"], d)
        return jsonify({"status": "created", "member_id": d["member_id"]})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route("/members/profile-prompt", methods=["GET"])
def members_profile_prompt():
    member_id = request.args.get("member", "patriarch")
    agent_id = request.args.get("agent", "tianshu")
    try:
        router = get_profile_router()
        router.update_active(member_id)
        prompt = router.build_agent_prompt(member_id, agent_id)
        return jsonify({"status": "ok", "prompt_suffix": prompt})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route("/memory/stats", methods=["GET"])
def memory_stats():
    try:
        chroma = get_chroma()
        cols = chroma.list_collections()
        stats = {}
        for c in cols:
            try:
                stats[c.name] = c.count()
            except Exception:
                stats[c.name] = -1
        return jsonify({"status": "ok", "collections": stats, "total": len(stats)})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

# --- Agent SOUL 端点 ---

@app.route("/agents/list", methods=["GET"])
def agents_list():
    try:
        import sys as _sys
        _agent_path = os.path.expanduser("~/.nemoclaw/agents")
        if _agent_path not in _sys.path:
            _sys.path.insert(0, _agent_path)
        from agent_registry import AGENTS
        result = []
        for aid, a in AGENTS.items():
            result.append({
                "id": aid, "name": a["name"], "role": a["role"],
                "tier": a["tier"], "port": a["port"],
                "model": a["model"], "engine": a["engine"],
                "hotline": a["hotline"], "email": a["email"],
            })
        return jsonify({"status": "ok", "agents": result, "total": len(result)})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route("/agents/<agent_id>/soul", methods=["GET"])
def agent_soul(agent_id):
    try:
        import sys as _sys
        _agent_path = os.path.expanduser("~/.nemoclaw/agents")
        if _agent_path not in _sys.path:
            _sys.path.insert(0, _agent_path)
        from soul_prompts import build_soul_prompt, build_compact_prompt
        from agent_registry import AGENTS
        if agent_id not in AGENTS:
            return jsonify({"status": "error", "detail": f"Unknown agent: {agent_id}"}), 404
        full = request.args.get("format", "full") == "full"
        if full:
            prompt = build_soul_prompt(agent_id)
        else:
            prompt = build_compact_prompt(agent_id)
        return jsonify({
            "status": "ok",
            "agent_id": agent_id,
            "agent_name": AGENTS[agent_id]["name"],
            "soul_prompt": prompt,
            "prompt_length": len(prompt),
            "estimated_tokens": len(prompt) // 3,
        })
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

@app.route("/agents/<agent_id>/profile", methods=["GET"])
def agent_profile(agent_id):
    try:
        import sys as _sys
        _agent_path = os.path.expanduser("~/.nemoclaw/agents")
        if _agent_path not in _sys.path:
            _sys.path.insert(0, _agent_path)
        from agent_registry import AGENTS, FAMILY_CREED, FAMILY_MISSION, COLLABORATION_MATRIX
        if agent_id not in AGENTS:
            return jsonify({"status": "error", "detail": f"Unknown agent: {agent_id}"}), 404
        a = AGENTS[agent_id]
        collab_functions = [k for k, v in COLLABORATION_MATRIX.items() if agent_id in v.get("primary", [])]
        return jsonify({
            "status": "ok",
            "agent": a,
            "primary_functions": collab_functions,
            "family_creed": FAMILY_CREED,
        })
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500

# --- 综合仪表盘 ---

@app.route("/dashboard", methods=["GET"])
def full_dashboard():
    conn = sqlite3.connect(DB_PATH)
    states = {r[0]: {"state": r[1], "frozen_reason": r[2]} for r in conn.execute("SELECT agent, state, frozen_reason FROM agent_state").fetchall()}
    event_count = conn.execute("SELECT COUNT(*) FROM behavior_events").fetchone()[0]
    high_risk_24h = conn.execute(
        "SELECT COUNT(*) FROM behavior_events WHERE risk IN ('high','critical') AND timestamp > ?",
        ((datetime.now(timezone.utc) - timedelta(hours=24)).isoformat(),)
    ).fetchone()[0]
    token_24h = conn.execute(
        "SELECT COALESCE(SUM(total_tokens),0) FROM token_usage WHERE timestamp > ?",
        ((datetime.now(timezone.utc) - timedelta(hours=24)).isoformat(),)
    ).fetchone()[0]
    collab_24h = conn.execute(
        "SELECT COUNT(*) FROM collaboration_log WHERE timestamp > ?",
        ((datetime.now(timezone.utc) - timedelta(hours=24)).isoformat(),)
    ).fetchone()[0]
    ctx = context_graph.stats()
    conn.close()

    memory_info = {"available": False}
    try:
        import chromadb as _cdb
        _cc = _cdb.HttpClient(host="127.0.0.1", port=19500)
        _cols = _cc.list_collections()
        memory_info = {"available": True, "collections": len(_cols)}
    except Exception:
        pass

    return jsonify({
        "agents": states,
        "behavior_events_total": event_count,
        "high_risk_events_24h": high_risk_24h,
        "tokens_consumed_24h": token_24h,
        "collaborations_24h": collab_24h,
        "context_graph": ctx,
        "memory": memory_info,
        "budgets": budget_mgr.get_dashboard(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("GOVERNANCE_PORT", "25700"))
    logger.info(f"YYC³ Governance Hub starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
