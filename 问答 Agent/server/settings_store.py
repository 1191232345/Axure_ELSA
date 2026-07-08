"""读写 settings.json，供前端配置页持久化模型参数。"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import config
from embedder import reset_clients
from kb_registry import get_active_id, get_kb_paths, list_bases
from store import store_manager

SETTINGS_FILE = Path(__file__).resolve().parent / "settings.json"

DEFAULT_SETTINGS: dict[str, Any] = {
    "llmProvider": "ollama",
    "openaiApiKey": "ollama",
    "openaiBaseUrl": "http://localhost:11434/v1",
    "chatModel": "qwen2.5:3b",
    "embedModel": "bge-m3:latest",
    "topK": 5,
    "minScore": 0.35,
    "historyTurns": 5,
    "hybridSearch": True,
    "rerankEnabled": True,
    "rerankCandidates": 20,
    "rrfK": 60,
}


def _mask_secret(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 8:
        return "***"
    return f"{value[:3]}...{value[-4:]}"


def _read_raw() -> dict[str, Any]:
    if not SETTINGS_FILE.exists():
        data = dict(DEFAULT_SETTINGS)
        _write_raw(data)
        return data
    try:
        data = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return {**DEFAULT_SETTINGS, **data}
    except (json.JSONDecodeError, OSError):
        pass
    return dict(DEFAULT_SETTINGS)


def _write_raw(data: dict[str, Any]) -> None:
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    SETTINGS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def reload_settings() -> None:
    config.apply_runtime_settings(_read_raw())


def _should_skip_api_key(value: str | None, current: str) -> bool:
    if value is None:
        return True
    text = value.strip()
    if not text:
        return False
    if text == _mask_secret(current):
        return True
    return bool(re.fullmatch(r"\*{3}|.{3}\.\.\..{4}", text))


def get_public_config() -> dict[str, Any]:
    data = _read_raw()
    key = str(data.get("openaiApiKey", ""))
    return {
        "llmProvider": data.get("llmProvider", "ollama"),
        "openaiBaseUrl": data.get("openaiBaseUrl", DEFAULT_SETTINGS["openaiBaseUrl"]),
        "chatModel": data.get("chatModel", DEFAULT_SETTINGS["chatModel"]),
        "embedModel": data.get("embedModel", DEFAULT_SETTINGS["embedModel"]),
        "topK": data.get("topK", DEFAULT_SETTINGS["topK"]),
        "minScore": data.get("minScore", DEFAULT_SETTINGS["minScore"]),
        "historyTurns": data.get("historyTurns", DEFAULT_SETTINGS["historyTurns"]),
        "hybridSearch": data.get("hybridSearch", DEFAULT_SETTINGS["hybridSearch"]),
        "rerankEnabled": data.get("rerankEnabled", DEFAULT_SETTINGS["rerankEnabled"]),
        "rerankCandidates": data.get("rerankCandidates", DEFAULT_SETTINGS["rerankCandidates"]),
        "rrfK": data.get("rrfK", DEFAULT_SETTINGS["rrfK"]),
        "apiKeySet": bool(key),
        "apiKeyMasked": _mask_secret(key) if key else "",
        "activeKbId": get_active_id(),
    }


def update_config(payload: dict[str, Any]) -> dict[str, Any]:
    current = _read_raw()
    prev_embed = str(current.get("embedModel", config.EMBED_MODEL))
    merged = dict(current)

    for field in (
        "llmProvider",
        "openaiBaseUrl",
        "chatModel",
        "embedModel",
        "topK",
        "minScore",
        "historyTurns",
        "hybridSearch",
        "rerankEnabled",
        "rerankCandidates",
        "rrfK",
    ):
        if field in payload and payload[field] is not None:
            merged[field] = payload[field]

    if "openaiApiKey" in payload and payload["openaiApiKey"] is not None:
        if not _should_skip_api_key(str(payload["openaiApiKey"]), str(current.get("openaiApiKey", ""))):
            merged["openaiApiKey"] = str(payload["openaiApiKey"]).strip()

    provider = str(merged.get("llmProvider", "ollama")).strip().lower()
    if provider == "ollama" and not str(merged.get("openaiApiKey", "")).strip():
        merged["openaiApiKey"] = "ollama"

    _write_raw(merged)
    reload_settings()
    reset_clients()
    if str(merged.get("embedModel", prev_embed)) != prev_embed:
        for base in list_bases():
            kb_id = str(base["id"])
            store_manager.get(kb_id).clear()
            _, index_path = get_kb_paths(kb_id)
            if index_path.exists():
                index_path.unlink(missing_ok=True)
            store_manager.invalidate(kb_id)

    return get_public_config()


reload_settings()
