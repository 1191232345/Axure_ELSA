"""OpenAI 兼容 Embedding / Chat。"""
from __future__ import annotations

from typing import AsyncIterator

from openai import AsyncOpenAI, OpenAI

from config import CHAT_MODEL, EMBED_MODEL, LLM_PROVIDER, OPENAI_API_KEY, OPENAI_BASE_URL

_sync: OpenAI | None = None
_async: AsyncOpenAI | None = None


def _ensure_key() -> None:
    if LLM_PROVIDER == "ollama":
        return
    if not OPENAI_API_KEY:
        raise RuntimeError("未配置 API Key，请打开页面「⚙️ 配置」填写并保存。")


def get_sync_client() -> OpenAI:
    global _sync
    _ensure_key()
    if _sync is None:
        _sync = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
    return _sync


def get_async_client() -> AsyncOpenAI:
    global _async
    _ensure_key()
    if _async is None:
        _async = AsyncOpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
    return _async


def reset_clients() -> None:
    global _sync, _async
    _sync = None
    _async = None


def embed_texts(texts: list[str]) -> list[list[float]]:
    resp = get_sync_client().embeddings.create(model=EMBED_MODEL, input=texts)
    return [d.embedding for d in resp.data]


async def stream_chat(messages: list[dict[str, str]]) -> AsyncIterator[str]:
    stream = await get_async_client().chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        temperature=0.2,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        if delta:
            yield delta


async def chat_once(
    messages: list[dict[str, str]],
    temperature: float = 0.2,
    *,
    json_mode: bool = False,
) -> str:
    kwargs: dict[str, object] = {
        "model": CHAT_MODEL,
        "messages": messages,
        "temperature": temperature,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
    resp = await get_async_client().chat.completions.create(**kwargs)
    return (resp.choices[0].message.content or "").strip()
