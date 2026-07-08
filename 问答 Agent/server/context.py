"""会话摘要与用户画像管理。"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass

from chat_history import format_history_text
from config import HISTORY_TURNS
from embedder import chat_once
from prompts import CONTEXT_UPDATE_PROMPT, build_memory_block


@dataclass
class SessionContext:
    summary: str = ""
    user_profile: str = ""


def _parse_context_json(raw: str, fallback: SessionContext) -> SessionContext:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            summary = str(data.get("summary", fallback.summary)).strip()
            profile = str(data.get("userProfile", data.get("user_profile", fallback.user_profile))).strip()
            return SessionContext(summary or fallback.summary, profile or fallback.user_profile)
    except json.JSONDecodeError:
        pass
    return fallback


async def refresh_session_context(
    messages: list[dict[str, str]],
    assistant_reply: str,
    summary: str = "",
    user_profile: str = "",
) -> SessionContext:
    fallback = SessionContext(summary, user_profile)
    if not messages:
        return fallback

    dialogue = format_history_text(messages, HISTORY_TURNS)
    if assistant_reply.strip():
        dialogue = f"{dialogue}\n助手：{assistant_reply[:300]}"

    user_content = (
        f"现有会话摘要：{summary or '（无）'}\n"
        f"现有用户画像：{user_profile or '（无）'}\n\n"
        f"最近对话：\n{dialogue}\n\n"
        "请更新会话摘要和用户画像。"
    )
    raw = await chat_once(
        [
            {"role": "system", "content": CONTEXT_UPDATE_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.1,
    )
    return _parse_context_json(raw, fallback)


def memory_block(summary: str, user_profile: str) -> str:
    return build_memory_block(summary, user_profile)
