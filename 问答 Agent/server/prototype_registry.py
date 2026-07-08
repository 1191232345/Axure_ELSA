"""原型归档注册表：扫描 generated 目录并维护 registry.json。"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from config import PROTOTYPE_SKELETON_DIR, PROTOTYPES_DIR, PROTOTYPES_REGISTRY

GENERATED_DIR = PROTOTYPE_SKELETON_DIR / "generated"
PREVIEW_PREFIX = "/api/prototype-files/generated"


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _preview_url(page_id: str) -> str:
    return f"{PREVIEW_PREFIX}/{page_id}/index.html"


def _load_registry() -> dict:
    if not PROTOTYPES_REGISTRY.exists():
        return {"items": []}
    try:
        data = json.loads(PROTOTYPES_REGISTRY.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("items"), list):
            return data
    except (OSError, json.JSONDecodeError):
        pass
    return {"items": []}


def _save_registry(data: dict) -> None:
    PROTOTYPES_DIR.mkdir(parents=True, exist_ok=True)
    PROTOTYPES_REGISTRY.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def _scan_generated() -> list[dict]:
    if not GENERATED_DIR.is_dir():
        return []
    found: list[dict] = []
    for entry in sorted(GENERATED_DIR.iterdir()):
        if not entry.is_dir():
            continue
        index_file = entry / "index.html"
        if not index_file.is_file():
            continue
        page_id = entry.name
        spec_file = entry / "module.spec.json"
        module_name = page_id
        breadcrumb = ""
        if spec_file.is_file():
            try:
                spec = json.loads(spec_file.read_text(encoding="utf-8"))
                module_name = str(spec.get("moduleName") or page_id)
                breadcrumb = str(spec.get("breadcrumb") or "")
            except (OSError, json.JSONDecodeError):
                pass
        mtime = datetime.fromtimestamp(index_file.stat().st_mtime, tz=timezone.utc)
        found.append(
            {
                "pageId": page_id,
                "moduleName": module_name,
                "breadcrumb": breadcrumb,
                "previewUrl": _preview_url(page_id),
                "updatedAt": mtime.replace(microsecond=0).isoformat(),
            }
        )
    return found


def sync_registry() -> None:
    """将 generated 目录与 registry 合并（以磁盘为准补全）。"""
    registry = _load_registry()
    by_page: dict[str, dict] = {
        str(item.get("pageId")): item for item in registry.get("items", []) if item.get("pageId")
    }
    for scanned in _scan_generated():
        page_id = scanned["pageId"]
        existing = by_page.get(page_id, {})
        by_page[page_id] = {
            "id": existing.get("id") or str(uuid4()),
            "pageId": page_id,
            "moduleName": scanned["moduleName"],
            "breadcrumb": scanned["breadcrumb"],
            "previewUrl": scanned["previewUrl"],
            "createdAt": existing.get("createdAt") or scanned["updatedAt"],
            "updatedAt": scanned["updatedAt"],
        }
    items = sorted(by_page.values(), key=lambda x: x.get("updatedAt", ""), reverse=True)
    _save_registry({"items": items})


def list_prototypes() -> list[dict]:
    sync_registry()
    registry = _load_registry()
    items = list(registry.get("items", []))
    items.sort(key=lambda x: x.get("updatedAt", ""), reverse=True)
    return items


def register_prototype(page_id: str, module_name: str, breadcrumb: str = "") -> dict:
    sync_registry()
    registry = _load_registry()
    items: list[dict] = registry.get("items", [])
    now = _now_iso()
    preview = _preview_url(page_id)
    for item in items:
        if item.get("pageId") == page_id:
            item.update(
                {
                    "moduleName": module_name,
                    "breadcrumb": breadcrumb,
                    "previewUrl": preview,
                    "updatedAt": now,
                }
            )
            _save_registry({"items": items})
            return item
    entry = {
        "id": str(uuid4()),
        "pageId": page_id,
        "moduleName": module_name,
        "breadcrumb": breadcrumb,
        "previewUrl": preview,
        "createdAt": now,
        "updatedAt": now,
    }
    items.insert(0, entry)
    _save_registry({"items": items})
    return entry
