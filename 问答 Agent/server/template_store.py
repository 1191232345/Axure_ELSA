"""原型设计模板存储与 CRUD。"""
from __future__ import annotations

import json
import re
import shutil
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from config import PROTOTYPES_DIR
from prototype_design import DEFAULT_DESIGN, STANDARD_TEMPLATE

TEMPLATES_DIR = PROTOTYPES_DIR / "templates"
SYSTEM_IDS = frozenset({"blank", "standard"})

SYSTEM_META: dict[str, dict[str, str]] = {
    "blank": {
        "name": "空白模板",
        "description": "仅含基础结构，适合从零配置列表页",
    },
    "standard": {
        "name": "标准 CRUD 列表",
        "description": "价卡查询示例：检索、工具栏、列与行操作",
    },
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _slug(name: str) -> str:
    text = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", name.strip().lower())
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "template"


def _template_dir(template_id: str) -> Path:
    return TEMPLATES_DIR / template_id


def _meta_path(template_id: str) -> Path:
    return _template_dir(template_id) / "meta.json"


def _design_path(template_id: str) -> Path:
    return _template_dir(template_id) / "design.json"


def _system_design(template_id: str) -> dict:
    if template_id == "standard":
        return deepcopy(STANDARD_TEMPLATE)
    return deepcopy(DEFAULT_DESIGN)


def _summary(meta: dict, *, system: bool) -> dict:
    return {
        "id": meta["id"],
        "name": meta.get("name", meta["id"]),
        "description": meta.get("description", ""),
        "system": system,
        "createdAt": meta.get("createdAt"),
        "updatedAt": meta.get("updatedAt"),
    }


def _read_meta(template_id: str) -> dict:
    path = _meta_path(template_id)
    if not path.is_file():
        raise FileNotFoundError(f"模板不存在: {template_id}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"模板 meta 格式错误: {template_id}")
    return data


def _write_meta(template_id: str, meta: dict) -> None:
    meta["updatedAt"] = _now_iso()
    _template_dir(template_id).mkdir(parents=True, exist_ok=True)
    _meta_path(template_id).write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _read_design(template_id: str) -> dict:
    if template_id in SYSTEM_IDS:
        return _system_design(template_id)
    path = _design_path(template_id)
    if not path.is_file():
        raise FileNotFoundError(f"模板设计不存在: {template_id}")
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"模板 design 格式错误: {template_id}")
    return data


def _write_design(template_id: str, design: dict) -> None:
    _template_dir(template_id).mkdir(parents=True, exist_ok=True)
    _design_path(template_id).write_text(json.dumps(design, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _validate_design(design: dict) -> None:
    columns = [c for c in (design.get("columns") or []) if str(c.get("label", "")).strip()]
    if not columns:
        raise ValueError("模板至少需包含一列列表属性")


def ensure_templates() -> None:
    """确保模板目录存在（系统模板仍由代码提供）。"""
    TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)


def list_templates() -> list[dict]:
    ensure_templates()
    items: list[dict] = []
    for template_id in ("blank", "standard"):
        meta = {
            "id": template_id,
            **SYSTEM_META[template_id],
            "createdAt": None,
            "updatedAt": None,
        }
        items.append(_summary(meta, system=True))

    for path in sorted(TEMPLATES_DIR.iterdir()):
        if not path.is_dir() or path.name in SYSTEM_IDS:
            continue
        meta_path = path / "meta.json"
        if not meta_path.is_file():
            continue
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            if isinstance(meta, dict) and meta.get("id"):
                items.append(_summary(meta, system=False))
        except (OSError, json.JSONDecodeError):
            continue

    items.sort(key=lambda x: (not x.get("system"), x.get("name") or x["id"]))
    return items


def get_template(template_id: str) -> dict:
    template_id = template_id.strip()
    if template_id in SYSTEM_IDS:
        meta = {
            "id": template_id,
            **SYSTEM_META[template_id],
            "createdAt": None,
            "updatedAt": None,
        }
        return {
            **_summary(meta, system=True),
            "design": _read_design(template_id),
        }

    meta = _read_meta(template_id)
    return {
        **_summary(meta, system=False),
        "design": _read_design(template_id),
    }


def get_template_design(template_id: str) -> dict:
    return deepcopy(_read_design(template_id))


def create_template(name: str, description: str = "", design: dict | None = None) -> dict:
    ensure_templates()
    clean_name = name.strip()
    if not clean_name:
        raise ValueError("请填写模板名称")

    template_id = f"tpl-{_slug(clean_name)}-{uuid4().hex[:6]}"
    while _template_dir(template_id).exists():
        template_id = f"tpl-{_slug(clean_name)}-{uuid4().hex[:6]}"

    payload = deepcopy(design) if design else deepcopy(DEFAULT_DESIGN)
    payload.setdefault("moduleName", "")
    payload.setdefault("breadcrumb", "")
    _validate_design(payload)

    now = _now_iso()
    meta = {
        "id": template_id,
        "name": clean_name,
        "description": description.strip(),
        "createdAt": now,
        "updatedAt": now,
    }
    _write_meta(template_id, meta)
    _write_design(template_id, payload)
    return get_template(template_id)


def update_template(
    template_id: str,
    *,
    name: str | None = None,
    description: str | None = None,
    design: dict | None = None,
) -> dict:
    if template_id in SYSTEM_IDS:
        raise ValueError("系统内置模板不可修改，请复制后编辑")

    meta = _read_meta(template_id)
    if name is not None:
        clean = name.strip()
        if not clean:
            raise ValueError("模板名称不能为空")
        meta["name"] = clean
    if description is not None:
        meta["description"] = description.strip()

    if design is not None:
        _validate_design(design)
        _write_design(template_id, design)

    _write_meta(template_id, meta)
    return get_template(template_id)


def delete_template(template_id: str) -> None:
    if template_id in SYSTEM_IDS:
        raise ValueError("系统内置模板不可删除")
    path = _template_dir(template_id)
    if not path.is_dir():
        raise FileNotFoundError(f"模板不存在: {template_id}")
    shutil.rmtree(path)


def duplicate_template(template_id: str, name: str | None = None) -> dict:
    source = get_template(template_id)
    base_name = (name or f"{source['name']} 副本").strip()
    return create_template(base_name, source.get("description", ""), source.get("design"))
