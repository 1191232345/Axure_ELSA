"""用户意图识别：通用对话 vs 知识库检索，并按库描述路由到指定 RAG。"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Literal

import numpy as np

from chat_history import format_history_text
from config import HISTORY_TURNS
from context import memory_block
from embedder import chat_once, embed_texts
from kb_registry import get_active_id, get_kb_paths, list_bases
from prompts import INTENT_PROMPT_HEADER
from prototype_flow import (
    PHASE_CONFIRM,
    PHASE_INSTRUCTION,
    PHASE_SELECT,
    PHASE_SLOTS,
    extract_edit_intent_slots,
    is_new_edit_intent,
)
from prototype_registry import list_prototypes, sync_registry
from store import get_store_for_search

IntentKind = Literal["general", "rag", "prototype_new", "prototype_preview", "prototype_edit"]

RAG_INTENT_ALIASES = frozenset({"rag", "warehouse", "kb", "knowledge"})
PROTOTYPE_NEW_ALIASES = frozenset({"prototype_new", "prototype-new", "prototype_create", "new_prototype"})
PROTOTYPE_PREVIEW_ALIASES = frozenset(
    {"prototype_preview", "prototype-preview", "prototype_list", "preview_prototype"}
)
PROTOTYPE_EDIT_ALIASES = frozenset(
    {"prototype_edit", "prototype-edit", "edit_prototype", "modify_prototype"}
)

PROTOTYPE_PREVIEW_PATTERNS = re.compile(
    r"原型预览|查看原型|预览原型|原型列表|归档原型|所有原型|有哪些原型|打开原型"
)
PROTOTYPE_NEW_PATTERNS = re.compile(
    r"新建原型|生成原型|添加需求|新需求|做一个.*列表|创建.*页面|列表页原型|帮我做.*页面"
)
PROTOTYPE_EDIT_PATTERNS = re.compile(
    r"编辑(?:一下)?原型|修改(?:一下)?原型|更新(?:一下)?原型|调整(?:一下)?原型"
)

# LLM 判 general 时，向量检索高于此阈值则回退为 rag（避免小模型漏判）
INTENT_PROBE_MIN_SCORE = 0.55


@dataclass
class IntentResult:
    intent: IntentKind
    kb_id: str | None = None
    kb_name: str | None = None
    edit_page_id: str | None = None
    edit_module_name: str | None = None
    reason: str = ""
    rewritten_query: str | None = None


def _kb_doc_titles(kb_id: str) -> str:
    try:
        content_path, _ = get_kb_paths(kb_id)
        if not content_path.exists():
            return ""
        titles = [
            line[2:].strip()
            for line in content_path.read_text(encoding="utf-8").splitlines()
            if line.startswith("# ") and not line.startswith("## ")
        ]
        if not titles:
            return ""
        return "；涵盖：" + "、".join(titles[:8])
    except (OSError, FileNotFoundError, ValueError):
        return ""


def _build_kb_catalog() -> str:
    indexed = [b for b in list_bases() if b.get("indexReady")]
    if not indexed:
        return "（当前无已构建索引的知识库）"
    lines = []
    for item in indexed:
        desc = str(item.get("description") or "").strip() or "（未填写范围描述）"
        topics = _kb_doc_titles(str(item["id"]))
        lines.append(f'- id: {item["id"]} | 名称: {item["name"]} | 范围: {desc}{topics}')
    return "\n".join(lines)


def _probe_retrieval_intent(query: str) -> IntentResult | None:
    """LLM 判 general 时，用向量检索探测是否其实属于某已索引知识库。

    优化：query 向量只 embed 一次，所有候选库复用同一向量，避免每库重复 embed。
    """
    text = query.strip()
    if not text:
        return None

    indexed = [b for b in list_bases() if b.get("indexReady")]
    if not indexed:
        return None

    # 仅 embed 一次，所有库共用
    try:
        qv = np.array(embed_texts([text])[0], dtype=np.float32)
    except Exception:
        qv = None

    best_kb_id: str | None = None
    best_kb_name: str | None = None
    best_score = 0.0

    for item in indexed:
        kb_id = str(item["id"])
        store = get_store_for_search(kb_id)
        if store.size == 0:
            continue
        hits = store.search_with_vector(text, qv, 1)
        if not hits:
            continue
        score = hits[0][1]
        if score > best_score:
            best_score = score
            best_kb_id = kb_id
            best_kb_name = str(item.get("name") or kb_id)

    if best_kb_id and best_score >= INTENT_PROBE_MIN_SCORE:
        return IntentResult(
            "rag",
            kb_id=best_kb_id,
            kb_name=best_kb_name,
            reason=f"检索探测命中（score={best_score:.2f}）",
        )
    return None


def resolve_search_kb(llm_kb_id: str | None) -> tuple[str | None, str | None]:
    """将 LLM 选库结果解析为可检索的 kb_id；无效时回退 activeId 或首个已索引库。"""
    indexed = {str(b["id"]): b for b in list_bases() if b.get("indexReady")}
    if llm_kb_id and llm_kb_id in indexed:
        item = indexed[llm_kb_id]
        return llm_kb_id, str(item.get("name") or llm_kb_id)

    active_id = get_active_id()
    if active_id in indexed:
        item = indexed[active_id]
        return active_id, str(item.get("name") or active_id)

    if indexed:
        item = next(iter(indexed.values()))
        return str(item["id"]), str(item.get("name") or item["id"])

    return active_id, None


def _keyword_intent(text: str) -> IntentResult | None:
    stripped = text.strip()
    if not stripped:
        return None
    if PROTOTYPE_PREVIEW_PATTERNS.search(stripped):
        return IntentResult("prototype_preview", reason="关键词命中原型预览")
    if PROTOTYPE_EDIT_PATTERNS.search(stripped):
        sync_registry()
        items = list_prototypes()
        slots = extract_edit_intent_slots(stripped, items) if items else None
        return IntentResult(
            "prototype_edit",
            edit_page_id=slots.page_id if slots else None,
            edit_module_name=slots.module_name if slots else None,
            reason="关键词命中原型修改",
        )
    if PROTOTYPE_NEW_PATTERNS.search(stripped):
        return IntentResult("prototype_new", reason="关键词命中新建原型")
    return None


def _parse_intent(
    raw: str,
) -> tuple[IntentKind, str | None, str | None, str | None, str, str | None]:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            intent_raw = str(data.get("intent", "general")).strip().lower()
            reason = str(data.get("reason", "")).strip()
            kb_id_raw = data.get("kbId")
            kb_id = str(kb_id_raw).strip() if kb_id_raw not in (None, "", "null") else None
            page_id_raw = data.get("pageId")
            page_id = (
                str(page_id_raw).strip() if page_id_raw not in (None, "", "null") else None
            )
            module_raw = data.get("moduleName")
            module_name = (
                str(module_raw).strip() if module_raw not in (None, "", "null") else None
            )
            rewrite_raw = data.get("rewriteQuery")
            rewrite_query = (
                str(rewrite_raw).strip()
                if rewrite_raw not in (None, "", "null")
                else None
            )
            if intent_raw in RAG_INTENT_ALIASES:
                return "rag", kb_id, page_id, module_name, reason, rewrite_query
            if intent_raw in PROTOTYPE_NEW_ALIASES:
                return "prototype_new", None, page_id, module_name, reason, None
            if intent_raw in PROTOTYPE_PREVIEW_ALIASES:
                return "prototype_preview", None, page_id, module_name, reason, None
            if intent_raw in PROTOTYPE_EDIT_ALIASES:
                return "prototype_edit", None, page_id, module_name, reason, None
            return "general", None, page_id, module_name, reason, None
    except json.JSONDecodeError:
        pass
    lowered = text.lower()
    if any(alias in lowered for alias in RAG_INTENT_ALIASES):
        return "rag", None, None, None, "", None
    if any(alias in lowered for alias in PROTOTYPE_NEW_ALIASES):
        return "prototype_new", None, None, None, "", None
    if any(alias in lowered for alias in PROTOTYPE_PREVIEW_ALIASES):
        return "prototype_preview", None, None, None, "", None
    if any(alias in lowered for alias in PROTOTYPE_EDIT_ALIASES):
        return "prototype_edit", None, None, None, "", None
    return "general", None, None, None, "", None


def detect_edit_flow_exit(text: str) -> IntentResult | None:
    """编辑流程中，检测是否应退出并切换至预览/新建等其他意图。"""
    keyword = _keyword_intent(text)
    if keyword and keyword.intent in ("prototype_preview", "prototype_new"):
        return keyword
    return None


async def classify_intent(
    messages: list[dict[str, str]],
    summary: str = "",
    user_profile: str = "",
    prototype_state: dict | None = None,
    prototype_edit_state: dict | None = None,
) -> IntentResult:
    if not messages:
        return IntentResult("general")

    last_text = messages[-1]["content"]
    edit_phase = None
    if prototype_edit_state:
        edit_phase = prototype_edit_state.get("phase")
        if not edit_phase and prototype_edit_state.get("editId"):
            edit_phase = PHASE_CONFIRM
        elif not edit_phase and prototype_edit_state.get("awaitingPageSelection"):
            edit_phase = PHASE_SELECT
        elif not edit_phase and prototype_edit_state.get("pageId"):
            edit_phase = PHASE_INSTRUCTION

    if edit_phase in (PHASE_SELECT, PHASE_INSTRUCTION, PHASE_SLOTS, PHASE_CONFIRM):
        keyword = _keyword_intent(last_text)
        if keyword and keyword.intent in ("prototype_preview", "prototype_new"):
            return keyword
        if is_new_edit_intent(last_text):
            sync_registry()
            items = list_prototypes()
            slots = extract_edit_intent_slots(last_text, items) if items else None
            return IntentResult(
                "prototype_edit",
                edit_page_id=slots.page_id if slots else None,
                edit_module_name=slots.module_name if slots else None,
                reason="新的编辑意图，打断当前流程",
            )
        reason = {
            PHASE_SELECT: "等待选择要修改的原型",
            PHASE_INSTRUCTION: "等待输入修改内容",
            PHASE_SLOTS: "等待补充修改槽位",
            PHASE_CONFIRM: "原型修改待确认",
        }.get(str(edit_phase), "原型编辑流程中")
        return IntentResult("prototype_edit", reason=reason)

    if prototype_state and prototype_state.get("filled"):
        return IntentResult("prototype_new", reason="打开需求配置页")

    keyword = _keyword_intent(last_text)
    if keyword:
        return keyword

    memory = memory_block(summary, user_profile)
    prompt = INTENT_PROMPT_HEADER.format(kb_catalog=_build_kb_catalog())
    user_content = (
        f"会话记忆：\n{memory}\n\n"
        f"对话历史：\n{format_history_text(messages[:-1], HISTORY_TURNS)}\n\n"
        f"当前用户消息：{messages[-1]['content']}"
    )
    intent_messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user_content},
    ]
    # 优先用 JSON 模式（结构化输出）；模型/网关不支持时回退到普通文本模式
    try:
        raw = await chat_once(intent_messages, temperature=0.0, json_mode=True)
    except Exception:
        raw = await chat_once(intent_messages, temperature=0.0)
    intent, llm_kb_id, edit_page_id, edit_module_name, reason, rewrite_query = _parse_intent(raw)
    if intent == "prototype_new":
        return IntentResult("prototype_new", reason=reason)
    if intent == "prototype_preview":
        return IntentResult("prototype_preview", reason=reason)
    if intent == "prototype_edit":
        return IntentResult(
            "prototype_edit",
            edit_page_id=edit_page_id,
            edit_module_name=edit_module_name,
            reason=reason,
        )
    if intent == "general":
        probed = _probe_retrieval_intent(messages[-1]["content"])
        if probed:
            return probed
        return IntentResult("general", reason=reason)

    kb_id, kb_name = resolve_search_kb(llm_kb_id)
    return IntentResult(
        "rag",
        kb_id=kb_id,
        kb_name=kb_name,
        reason=reason,
        rewritten_query=rewrite_query,
    )
