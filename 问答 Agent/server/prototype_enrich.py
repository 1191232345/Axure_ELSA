"""Spec 富化：design / 槽位 → 完整 module.spec（P1）。"""
from __future__ import annotations

import json
import re
from copy import deepcopy
from pathlib import Path
from typing import Literal

from config import PROTOTYPE_SKELETON_DIR
from embedder import chat_once
from prompts import PROTOTYPE_ENRICH_PROMPT
from prototype_spec import normalize_spec, validate_spec

_EXAMPLE_SPEC_PATH = PROTOTYPE_SKELETON_DIR / "examples" / "demo-list.spec.json"


class EnrichError(Exception):
    pass


def _load_example_spec() -> dict:
    if _EXAMPLE_SPEC_PATH.is_file():
        return json.loads(_EXAMPLE_SPEC_PATH.read_text(encoding="utf-8"))
    return {}


def _parse_spec_json(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    data = json.loads(text)
    if not isinstance(data, dict):
        raise EnrichError("LLM 输出必须是 JSON 对象")
    return data


def assemble_enrich_prompt(
    partial: dict,
    raw: dict | None,
    source: Literal["design", "chat"],
) -> str:
    example = _load_example_spec()
    raw_payload = raw or {}
    source_label = "设计页四区配置" if source == "design" else "对话槽位"
    return (
        f"## 来源：{source_label}\n"
        f"{json.dumps(raw_payload, ensure_ascii=False, indent=2)}\n\n"
        f"## 已确定 partial spec（moduleName/pageId/breadcrumb/columns 不可修改）\n"
        f"{json.dumps(partial, ensure_ascii=False, indent=2)}\n\n"
        f"## 参考示例\n"
        f"{json.dumps(example, ensure_ascii=False, indent=2)}\n\n"
        "请输出完整 module.spec.json，补全 filters、toolbarButtons（含 action/variant/icon）、"
        "rowActions、formFields、statusLabels、mockData（2～3 行）、logicDocs。"
    )


async def enrich_spec(
    partial: dict,
    *,
    source: Literal["design", "chat"] = "design",
    raw: dict | None = None,
    repair_hint: str = "",
) -> dict:
    user_content = assemble_enrich_prompt(partial, raw, source)
    if repair_hint:
        user_content += f"\n\n## 上次校验错误（请修正）\n{repair_hint}"

    raw_llm = await chat_once(
        [
            {"role": "system", "content": PROTOTYPE_ENRICH_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.0,
    )
    parsed = _parse_spec_json(raw_llm)
    spec = normalize_spec(parsed, partial)
    errors = validate_spec(spec)
    if errors:
        raise EnrichError("；".join(errors))
    return spec


async def enrich_spec_with_fallback(
    partial: dict,
    raw: dict | None = None,
    *,
    source: Literal["design", "chat"] = "design",
) -> tuple[dict, bool]:
    """返回 (spec, enriched)。失败时 fallback 到规则 build_spec_from_design。"""
    from prototype_design import build_spec_from_design

    try:
        spec = await enrich_spec(partial, source=source, raw=raw)
        return spec, True
    except EnrichError as first_err:
        try:
            spec = await enrich_spec(
                partial,
                source=source,
                raw=raw,
                repair_hint=str(first_err),
            )
            return spec, True
        except (EnrichError, json.JSONDecodeError, RuntimeError):
            pass
    except (json.JSONDecodeError, RuntimeError):
        pass

    if source == "design" and raw:
        fallback = build_spec_from_design(raw)
        fallback = normalize_spec(fallback, partial)
        return fallback, False

    fallback = normalize_spec(deepcopy(partial), partial)
    return fallback, False
