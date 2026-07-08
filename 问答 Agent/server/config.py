"""路径与服务部署配置（模型参数见 settings.json / 前端配置页）。"""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = ROOT / "data" / "knowledge"
PROTOTYPE_SKELETON_DIR = ROOT / "prototype-skeleton"
PROTOTYPES_DIR = ROOT / "data" / "prototypes"
PROTOTYPES_REGISTRY = PROTOTYPES_DIR / "registry.json"
DEMO_DIR = ROOT / "demo"
DEMO_DIST = DEMO_DIR / "dist"
CHUNK_SIZE = 400
CHUNK_OVERLAP = 80

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
SERVE_FRONTEND = os.getenv("SERVE_FRONTEND", "true").lower() != "false"
RELOAD = os.getenv("RELOAD", "true").lower() != "false"
FRONTEND_AUTO_BUILD = os.getenv("FRONTEND_AUTO_BUILD", "true").lower() != "false"
FRONTEND_WATCH = os.getenv(
    "FRONTEND_WATCH",
    "true" if SERVE_FRONTEND and RELOAD else "false",
).lower() != "false"

# 由 settings_store 在启动时写入
LLM_PROVIDER = "ollama"
OPENAI_API_KEY = "ollama"
OPENAI_BASE_URL = "http://localhost:11434/v1"
CHAT_MODEL = "qwen2.5:3b"
EMBED_MODEL = "bge-m3:latest"
TOP_K = 5
MIN_SCORE = 0.35
HISTORY_TURNS = 5
HYBRID_SEARCH = True
RERANK_ENABLED = True
RERANK_CANDIDATES = 20
RRF_K = 60


def apply_runtime_settings(data: dict[str, object]) -> None:
    """将 settings.json 内容应用到运行时模块变量。"""
    global LLM_PROVIDER, OPENAI_API_KEY, OPENAI_BASE_URL, CHAT_MODEL, EMBED_MODEL
    global TOP_K, MIN_SCORE, HISTORY_TURNS
    global HYBRID_SEARCH, RERANK_ENABLED, RERANK_CANDIDATES, RRF_K

    provider = str(data.get("llmProvider", "ollama")).strip().lower()
    LLM_PROVIDER = provider
    OPENAI_BASE_URL = str(data.get("openaiBaseUrl", "http://localhost:11434/v1")).strip()
    CHAT_MODEL = str(data.get("chatModel", "qwen2.5:3b")).strip()
    EMBED_MODEL = str(data.get("embedModel", "bge-m3:latest")).strip()
    TOP_K = int(data.get("topK", 5))
    MIN_SCORE = float(data.get("minScore", 0.35))
    HISTORY_TURNS = int(data.get("historyTurns", 5))
    HYBRID_SEARCH = bool(data.get("hybridSearch", True))
    RERANK_ENABLED = bool(data.get("rerankEnabled", True))
    RERANK_CANDIDATES = int(data.get("rerankCandidates", 20))
    RRF_K = int(data.get("rrfK", 60))

    key = str(data.get("openaiApiKey", "")).strip()
    if provider == "ollama":
        OPENAI_API_KEY = key or "ollama"
    else:
        OPENAI_API_KEY = key
