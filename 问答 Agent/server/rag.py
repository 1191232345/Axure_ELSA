"""对话编排：意图识别 → 通用对话 / RAG 检索 → 更新上下文。"""
from __future__ import annotations

import asyncio
from typing import AsyncIterator

from chat_history import format_history_text
from config import HISTORY_TURNS, MIN_SCORE, TOP_K
from context import SessionContext, memory_block, refresh_session_context
from embedder import stream_chat
from intent import IntentResult, classify_intent, detect_edit_flow_exit
from prompts import GENERAL_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT, REWRITE_PROMPT, build_context_block, is_refusal
from prototype_flow import (
    PHASE_CONFIRM,
    PHASE_INSTRUCTION,
    PHASE_SELECT,
    PHASE_SLOTS,
    EditIntentSlots,
    extract_edit_intent_slots,
    is_edit_cancel,
    is_edit_confirm,
    is_new_edit_intent,
    prototype_edit_cancel_stream,
    prototype_edit_confirm_stream,
    prototype_edit_stream,
    prototype_new_stream,
    prototype_preview_stream,
)
from prototype_registry import list_prototypes, sync_registry
from prototype_slots import PrototypeSlotState
from store import IndexedChunk, get_store_for_search


# 等待并行 summary 任务的最长时间（秒）。超时则用旧 summary，保证响应不被阻塞。
_SUMMARY_AWAIT_TIMEOUT = 3.0


async def _finalize(
    messages: list[dict[str, str]],
    assistant_reply: str,
    summary: str,
    user_profile: str,
    extra: dict,
    ctx_task: asyncio.Task[SessionContext] | None = None,
) -> dict:
    if ctx_task is not None:
        try:
            ctx = await asyncio.wait_for(ctx_task, timeout=_SUMMARY_AWAIT_TIMEOUT)
        except (asyncio.TimeoutError, Exception):
            ctx = SessionContext(summary, user_profile)
    else:
        ctx = await refresh_session_context(messages, assistant_reply, summary, user_profile)
    return {
        **extra,
        "summary": ctx.summary,
        "userProfile": ctx.user_profile,
    }


def _swallow_task_exception(task: asyncio.Task) -> None:
    """后台 summary 任务的异常吞掉回调，避免 asyncio 未捕获异常警告。"""
    if task.cancelled():
        return
    exc = task.exception()
    if exc:
        # 后台 summary 失败不影响主流程，下一轮会用旧 summary 兜底
        pass


def _build_general_messages(
    messages: list[dict[str, str]],
    summary: str,
    user_profile: str,
) -> list[dict[str, str]]:
    memory = memory_block(summary, user_profile)
    chat_msgs: list[dict[str, str]] = [{"role": "system", "content": GENERAL_SYSTEM_PROMPT}]
    if memory != "（暂无）":
        chat_msgs.append({"role": "system", "content": f"会话记忆：\n{memory}"})
    for m in messages[:-1][-(HISTORY_TURNS * 2) :]:
        chat_msgs.append({"role": m["role"], "content": m["content"][:800]})
    chat_msgs.append({"role": "user", "content": messages[-1]["content"]})
    return chat_msgs


async def rewrite_query(
    messages: list[dict[str, str]],
    summary: str = "",
    user_profile: str = "",
) -> str:
    if len(messages) < 2:
        return messages[-1]["content"]

    memory = memory_block(summary, user_profile)
    rewrite_msgs = [
        {"role": "system", "content": REWRITE_PROMPT},
        {
            "role": "user",
            "content": (
                f"会话记忆：\n{memory}\n\n"
                f"对话历史：\n{format_history_text(messages[:-1], HISTORY_TURNS)}\n\n"
                f"最后一问：{messages[-1]['content']}"
            ),
        },
    ]
    parts: list[str] = []
    async for t in stream_chat(rewrite_msgs):
        parts.append(t)
    return "".join(parts).strip() or messages[-1]["content"]


def _to_citations(
    hits: list[tuple[IndexedChunk, float]],
    kb_id: str | None = None,
    kb_name: str | None = None,
) -> list[dict[str, str]]:
    seen: set[str] = set()
    out: list[dict[str, str]] = []
    for item, _ in hits:
        key = f"{item.doc_title}|{item.section}"
        if key in seen:
            continue
        seen.add(key)
        excerpt = item.text.replace("\n", " ")[:200]
        citation: dict[str, str] = {
            "docTitle": item.doc_title,
            "section": item.section,
            "excerpt": excerpt,
        }
        if kb_id:
            citation["kbId"] = kb_id
        if kb_name:
            citation["kbName"] = kb_name
        out.append(citation)
        if len(out) >= 3:
            break
    return out


def retrieve(
    query: str,
    kb_id: str,
    kb_name: str | None = None,
) -> tuple[list[tuple[IndexedChunk, float]], list[dict[str, str]]]:
    store = get_store_for_search(kb_id)
    hits = store.search_detailed(query, TOP_K)
    filtered = [(c, s) for c, s, _ in hits if s >= MIN_SCORE]
    return filtered, _to_citations(filtered or [(c, s) for c, s, _ in hits[:2]], kb_id=kb_id, kb_name=kb_name)


async def rag_stream(
    messages: list[dict[str, str]],
    summary: str = "",
    user_profile: str = "",
    prototype_state: dict | None = None,
    prototype_edit_state: dict | None = None,
    trigger_prototype_preview: bool = False,
) -> AsyncIterator[tuple[str, dict | None]]:
    if trigger_prototype_preview:
        async for token, meta in prototype_preview_stream(messages, summary, user_profile):
            yield token, meta
        return

    edit_state = prototype_edit_state
    if edit_state:
        last_text = messages[-1]["content"].strip()

        flow_exit = detect_edit_flow_exit(last_text)
        if flow_exit:
            edit_state = None
            if flow_exit.intent == "prototype_preview":
                async for token, meta in prototype_preview_stream(messages, summary, user_profile):
                    yield token, meta
                return
            if flow_exit.intent == "prototype_new":
                state = PrototypeSlotState.from_dict(prototype_state)
                async for token, meta in prototype_new_stream(messages, summary, user_profile, state):
                    yield token, meta
                return
        elif edit_state.get("editId"):
            if is_new_edit_intent(last_text):
                sync_registry()
                items = list_prototypes()
                slots = (
                    extract_edit_intent_slots(last_text, items)
                    if items
                    else EditIntentSlots()
                )
                async for token, meta in prototype_edit_stream(
                    messages,
                    summary,
                    user_profile,
                    None,
                    hint_page_id=slots.page_id,
                    hint_module_name=slots.module_name,
                ):
                    yield token, meta
                return
            if is_edit_confirm(last_text):
                async for token, meta in prototype_edit_confirm_stream(
                    messages, summary, user_profile, edit_state
                ):
                    yield token, meta
                return
            if is_edit_cancel(last_text):
                async for token, meta in prototype_edit_cancel_stream(
                    messages, summary, user_profile, edit_state
                ):
                    yield token, meta
                return
            async for token, meta in prototype_edit_stream(
                messages, summary, user_profile, edit_state
            ):
                yield token, meta
            return
        else:
            if is_new_edit_intent(last_text):
                async for token, meta in prototype_edit_stream(
                    messages, summary, user_profile, None
                ):
                    yield token, meta
                return
            async for token, meta in prototype_edit_stream(
                messages, summary, user_profile, edit_state
            ):
                yield token, meta
            return

    routed: IntentResult = await classify_intent(
        messages,
        summary,
        user_profile,
        prototype_state=prototype_state,
        prototype_edit_state=edit_state,
    )

    if routed.intent == "prototype_preview":
        async for token, meta in prototype_preview_stream(messages, summary, user_profile):
            yield token, meta
        return

    if routed.intent == "prototype_new":
        state = PrototypeSlotState.from_dict(prototype_state)
        async for token, meta in prototype_new_stream(messages, summary, user_profile, state):
            yield token, meta
        return

    if routed.intent == "prototype_edit":
        async for token, meta in prototype_edit_stream(
            messages,
            summary,
            user_profile,
            prototype_edit_state,
            hint_page_id=routed.edit_page_id,
            hint_module_name=routed.edit_module_name,
        ):
            yield token, meta
        return

    if routed.intent == "general":
        chat_msgs = _build_general_messages(messages, summary, user_profile)
        # 并行启动 summary 更新（基于截至本轮 user 提问的对话，不含本轮 assistant reply），
        # 与流式生成同时进行，避免串行等待
        ctx_task = asyncio.create_task(
            refresh_session_context(messages, "", summary, user_profile)
        )
        parts: list[str] = []
        try:
            async for token in stream_chat(chat_msgs):
                parts.append(token)
                yield token, None
        finally:
            if not ctx_task.done():
                ctx_task.add_done_callback(_swallow_task_exception)
        full = "".join(parts)
        meta = await _finalize(
            messages,
            full,
            summary,
            user_profile,
            {"citations": [], "refused": False, "mode": "chat"},
            ctx_task=ctx_task,
        )
        yield "", meta
        return

    kb_id = routed.kb_id
    kb_name = routed.kb_name
    if not kb_id:
        text = "检测到知识库相关问题，但当前没有可用的知识库。请先到「📚 知识库」页创建并构建索引。"
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {"citations": [], "refused": True, "mode": "rag"},
        )
        yield text, meta
        return

    store = get_store_for_search(kb_id)
    if store.size == 0:
        label = kb_name or kb_id
        text = (
            f"检测到你在问「{label}」相关问题，但该知识库索引尚未构建。"
            "请先到「📚 知识库」页选中该库并点击「构建索引」，或继续聊其他话题～"
        )
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {"citations": [], "refused": True, "mode": "rag", "kbId": kb_id, "kbName": kb_name},
        )
        yield text, meta
        return

    # 优先用 intent 阶段已改写好的 query，避免重复调用 LLM
    query = routed.rewritten_query or await rewrite_query(messages, summary, user_profile)
    hits, citations = retrieve(query, kb_id, kb_name)
    memory = memory_block(summary, user_profile)

    if not hits:
        label = kb_name or kb_id
        text = f"唔…在知识库「{label}」里暂时没找到相关规定。你可以换个说法试试，或问我其他问题～"
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {"citations": [], "refused": True, "mode": "rag", "kbId": kb_id, "kbName": kb_name},
        )
        yield text, meta
        return

    ctx = build_context_block(
        [(h.doc_title, h.section, h.text, h.parent_text) for h, _ in hits]
    )
    rag_prompt = RAG_SYSTEM_PROMPT
    if kb_name:
        rag_prompt = f"{RAG_SYSTEM_PROMPT}\n\n当前参考知识库：{kb_name}（id: {kb_id}）"

    chat_msgs = [
        {"role": "system", "content": rag_prompt},
        {
            "role": "user",
            "content": (
                f"会话记忆：\n{memory}\n\n"
                f"参考文档：\n{ctx}\n\n"
                f"对话历史：\n{format_history_text(messages[:-1], HISTORY_TURNS)}\n\n"
                f"当前问题：{messages[-1]['content']}"
            ),
        },
    ]

    # 并行启动 summary 更新（基于截至本轮 user 提问的对话，不含本轮 assistant reply），
    # 与 RAG 流式生成同时进行，避免串行等待
    ctx_task = asyncio.create_task(
        refresh_session_context(messages, "", summary, user_profile)
    )
    parts = []
    try:
        async for token in stream_chat(chat_msgs):
            parts.append(token)
            yield token, None
    finally:
        if not ctx_task.done():
            ctx_task.add_done_callback(_swallow_task_exception)

    full = "".join(parts)
    meta = await _finalize(
        messages,
        full,
        summary,
        user_profile,
        {
            "citations": citations,
            "refused": is_refusal(full) and len(citations) == 0,
            "mode": "rag",
            "kbId": kb_id,
            "kbName": kb_name,
        },
        ctx_task=ctx_task,
    )
    yield "", meta
