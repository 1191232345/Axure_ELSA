"""多知识库注册表与文件管理。"""
from __future__ import annotations

import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from config import CHUNK_OVERLAP, CHUNK_SIZE, KNOWLEDGE_DIR, ROOT

DATA_DIR = ROOT / "data"
KB_ROOT = DATA_DIR / "kb"
REGISTRY_FILE = DATA_DIR / "knowledge_bases.json"
LEGACY_INDEX = DATA_DIR / "index.cache.json"

DEFAULT_KB_ID = "default"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _slug(name: str) -> str:
    text = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", name.strip().lower())
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "kb"


def _kb_dir(kb_id: str) -> Path:
    return KB_ROOT / kb_id


def _meta_path(kb_id: str) -> Path:
    return _kb_dir(kb_id) / "meta.json"


def _content_path(kb_id: str) -> Path:
    return _kb_dir(kb_id) / "content.md"


def _index_path(kb_id: str) -> Path:
    return _kb_dir(kb_id) / "index.cache.json"


def _default_meta(name: str, description: str = "") -> dict[str, Any]:
    return {
        "id": DEFAULT_KB_ID,
        "name": name,
        "description": description,
        "chunkSize": CHUNK_SIZE,
        "chunkOverlap": CHUNK_OVERLAP,
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
    }


def _read_registry() -> dict[str, Any]:
    if not REGISTRY_FILE.exists():
        return {"activeId": DEFAULT_KB_ID, "bases": []}
    try:
        data = json.loads(REGISTRY_FILE.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return {
                "activeId": str(data.get("activeId", DEFAULT_KB_ID)),
                "bases": data.get("bases", []) if isinstance(data.get("bases"), list) else [],
            }
    except (json.JSONDecodeError, OSError):
        pass
    return {"activeId": DEFAULT_KB_ID, "bases": []}


def _write_registry(data: dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REGISTRY_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _read_meta(kb_id: str) -> dict[str, Any]:
    path = _meta_path(kb_id)
    if not path.exists():
        raise FileNotFoundError(f"知识库不存在: {kb_id}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"meta.json 格式错误: {kb_id}")
    return data


def _write_meta(kb_id: str, meta: dict[str, Any]) -> None:
    meta["updatedAt"] = _now_iso()
    _kb_dir(kb_id).mkdir(parents=True, exist_ok=True)
    _meta_path(kb_id).write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _merge_legacy_markdown(target: Path) -> None:
    if target.exists() and target.stat().st_size > 0:
        return
    if not KNOWLEDGE_DIR.exists():
        target.write_text("# 新文档\n\n在此编写 Markdown 内容…\n", encoding="utf-8")
        return
    parts: list[str] = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        parts.append(path.read_text(encoding="utf-8").strip())
    merged = "\n\n---\n\n".join(parts) if parts else "# 新文档\n\n在此编写 Markdown 内容…\n"
    target.write_text(merged + "\n", encoding="utf-8")


def ensure_migrated() -> None:
    """首次启动：从 legacy data/knowledge 迁移默认知识库。"""
    registry = _read_registry()
    if registry["bases"]:
        return

    KB_ROOT.mkdir(parents=True, exist_ok=True)
    meta = _default_meta("默认知识库", "在此填写该库覆盖的主题范围，供意图路由使用")
    _write_meta(DEFAULT_KB_ID, meta)

    content_path = _content_path(DEFAULT_KB_ID)
    _merge_legacy_markdown(content_path)

    if LEGACY_INDEX.exists() and not _index_path(DEFAULT_KB_ID).exists():
        shutil.copy2(LEGACY_INDEX, _index_path(DEFAULT_KB_ID))

    registry["activeId"] = DEFAULT_KB_ID
    registry["bases"] = [{"id": DEFAULT_KB_ID, "name": meta["name"]}]
    _write_registry(registry)


def list_bases() -> list[dict[str, Any]]:
    ensure_migrated()
    registry = _read_registry()
    active_id = registry["activeId"]
    out: list[dict[str, Any]] = []
    for item in registry["bases"]:
        kb_id = str(item.get("id", ""))
        if not kb_id or not _meta_path(kb_id).exists():
            continue
        meta = _read_meta(kb_id)
        index_path = _index_path(kb_id)
        chunks = 0
        built_at: str | None = None
        if index_path.exists():
            try:
                cache = json.loads(index_path.read_text(encoding="utf-8"))
                chunks = len(cache.get("items", []))
                built_at = cache.get("builtAt")
            except (json.JSONDecodeError, OSError, TypeError):
                pass
        out.append(
            {
                "id": kb_id,
                "name": meta.get("name", kb_id),
                "description": meta.get("description", ""),
                "chunkSize": int(meta.get("chunkSize", CHUNK_SIZE)),
                "chunkOverlap": int(meta.get("chunkOverlap", CHUNK_OVERLAP)),
                "createdAt": meta.get("createdAt"),
                "updatedAt": meta.get("updatedAt"),
                "active": kb_id == active_id,
                "indexReady": chunks > 0,
                "chunks": chunks,
                "indexBuiltAt": built_at,
            }
        )
    return out


def get_active_id() -> str:
    ensure_migrated()
    registry = _read_registry()
    kb_id = registry["activeId"]
    if _meta_path(kb_id).exists():
        return kb_id
    bases = registry.get("bases", [])
    if bases:
        return str(bases[0]["id"])
    return DEFAULT_KB_ID


def set_active_id(kb_id: str) -> dict[str, Any]:
    ensure_migrated()
    if not _meta_path(kb_id).exists():
        raise FileNotFoundError(f"知识库不存在: {kb_id}")
    registry = _read_registry()
    registry["activeId"] = kb_id
    _write_registry(registry)
    return get_base(kb_id)


def get_base(kb_id: str) -> dict[str, Any]:
    ensure_migrated()
    meta = _read_meta(kb_id)
    content_path = _content_path(kb_id)
    content = content_path.read_text(encoding="utf-8") if content_path.exists() else ""
    summary = next((b for b in list_bases() if b["id"] == kb_id), {})
    return {
        **summary,
        "content": content,
        "chunkSize": int(meta.get("chunkSize", CHUNK_SIZE)),
        "chunkOverlap": int(meta.get("chunkOverlap", CHUNK_OVERLAP)),
        "description": meta.get("description", ""),
        "name": meta.get("name", kb_id),
    }


def create_base(name: str, description: str = "") -> dict[str, Any]:
    ensure_migrated()
    trimmed = name.strip()
    if not trimmed:
        raise ValueError("知识库名称不能为空")

    kb_id = f"{_slug(trimmed)}-{uuid4().hex[:6]}"
    while _meta_path(kb_id).exists():
        kb_id = f"{_slug(trimmed)}-{uuid4().hex[:6]}"

    meta = {
        "id": kb_id,
        "name": trimmed,
        "description": description.strip(),
        "chunkSize": CHUNK_SIZE,
        "chunkOverlap": CHUNK_OVERLAP,
        "createdAt": _now_iso(),
        "updatedAt": _now_iso(),
    }
    _write_meta(kb_id, meta)
    _content_path(kb_id).write_text(
        f"# {trimmed}\n\n在此编写 Markdown 内容…\n",
        encoding="utf-8",
    )

    registry = _read_registry()
    registry.setdefault("bases", []).append({"id": kb_id, "name": trimmed})
    if len(registry["bases"]) == 1:
        registry["activeId"] = kb_id
    _write_registry(registry)
    return get_base(kb_id)


def update_base(
    kb_id: str,
    *,
    name: str | None = None,
    description: str | None = None,
    content: str | None = None,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> dict[str, Any]:
    ensure_migrated()
    meta = _read_meta(kb_id)
    if name is not None:
        trimmed = name.strip()
        if not trimmed:
            raise ValueError("知识库名称不能为空")
        meta["name"] = trimmed
    if description is not None:
        meta["description"] = description.strip()
    if chunk_size is not None:
        meta["chunkSize"] = max(100, min(int(chunk_size), 2000))
    if chunk_overlap is not None:
        meta["chunkOverlap"] = max(0, min(int(chunk_overlap), 500))
    _write_meta(kb_id, meta)

    if content is not None:
        _content_path(kb_id).write_text(content, encoding="utf-8")

    registry = _read_registry()
    for item in registry.get("bases", []):
        if item.get("id") == kb_id:
            item["name"] = meta["name"]
            break
    _write_registry(registry)
    return get_base(kb_id)


def delete_base(kb_id: str) -> None:
    ensure_migrated()
    registry = _read_registry()
    bases = registry.get("bases", [])
    if len(bases) <= 1:
        raise ValueError("至少保留一个知识库")
    if not any(str(b.get("id")) == kb_id for b in bases):
        raise FileNotFoundError(f"知识库不存在: {kb_id}")

    registry["bases"] = [b for b in bases if str(b.get("id")) != kb_id]
    if registry.get("activeId") == kb_id:
        registry["activeId"] = str(registry["bases"][0]["id"])
    _write_registry(registry)

    kb_path = _kb_dir(kb_id)
    if kb_path.exists():
        shutil.rmtree(kb_path)


def get_kb_paths(kb_id: str) -> tuple[Path, Path]:
    """返回 (content.md, index.cache.json) 路径。"""
    ensure_migrated()
    if not _meta_path(kb_id).exists():
        raise FileNotFoundError(f"知识库不存在: {kb_id}")
    return _content_path(kb_id), _index_path(kb_id)


def get_kb_chunk_params(kb_id: str) -> tuple[int, int]:
    meta = _read_meta(kb_id)
    return int(meta.get("chunkSize", CHUNK_SIZE)), int(meta.get("chunkOverlap", CHUNK_OVERLAP))
