"""对话历史格式化（供意图识别、RAG、上下文更新共用）。"""
from __future__ import annotations


def format_history_text(messages: list[dict[str, str]], max_turns: int, *, content_limit: int = 300) -> str:
    """将最近 max_turns 轮对话格式化为可读文本。"""
    recent = messages[-max_turns * 2 :]
    lines: list[str] = []
    for m in recent:
        role = "用户" if m["role"] == "user" else "助手"
        content = m["content"][:content_limit]
        lines.append(f"{role}：{content}")
    return "\n".join(lines) if lines else "（无）"
