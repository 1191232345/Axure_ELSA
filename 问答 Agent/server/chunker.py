"""Markdown 文档切分（表格保护、章节 parent 上下文、元数据）。"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

from config import CHUNK_OVERLAP, CHUNK_SIZE, KNOWLEDGE_DIR

TABLE_BLOCK_RE = re.compile(
    r"(?:^[^\n]*\|[^\n]+\n)(?:^[^\n]*\|[-:\s|]+\|\s*\n)(?:^[^\n]*\|[^\n]+\n?)+",
    re.MULTILINE,
)
LIST_BLOCK_RE = re.compile(
    r"(?:^(?:[-*+]|\d+\.)\s+.+(?:\n|$))+",
    re.MULTILINE,
)


@dataclass
class RawChunk:
    doc_title: str
    section: str
    text: str
    source_file: str
    chunk_id: str = ""
    anchor: str = ""
    parent_text: str = ""
    block_type: str = "text"
    metadata: dict[str, str] = field(default_factory=dict)


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-") or "section"


def title_from_markdown(text: str, fallback: str = "未命名文档") -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def _title_from_file(path: Path) -> str:
    return title_from_markdown(path.read_text(encoding="utf-8"), path.stem)


def _extract_blocks(body: str) -> list[tuple[str, str]]:
    """将正文拆为 (block_type, text) 序列，表格/列表尽量保持完整。"""
    if not body.strip():
        return []

    spans: list[tuple[int, int, str]] = []
    for pattern, kind in ((TABLE_BLOCK_RE, "table"), (LIST_BLOCK_RE, "list")):
        for m in pattern.finditer(body):
            spans.append((m.start(), m.end(), kind))

    spans.sort(key=lambda x: x[0])
    merged: list[tuple[int, int, str]] = []
    for start, end, kind in spans:
        if merged and start < merged[-1][1]:
            continue
        merged.append((start, end, kind))

    blocks: list[tuple[str, str]] = []
    cursor = 0
    for start, end, kind in merged:
        if start > cursor:
            plain = body[cursor:start].strip()
            if plain:
                blocks.append(("text", plain))
        blocks.append((kind, body[start:end].strip()))
        cursor = end
    tail = body[cursor:].strip()
    if tail:
        blocks.append(("text", tail))
    if not blocks:
        blocks.append(("text", body.strip()))
    return blocks


def _split_section(
    section: str,
    body: str,
    doc_title: str,
    source: str,
    chunk_size: int,
    chunk_overlap: int,
    *,
    anchor: str = "",
) -> list[RawChunk]:
    body = body.strip()
    if not body:
        return []

    parent_text = body if len(body) > chunk_size else ""
    anchor = anchor or slugify(section)
    parts: list[RawChunk] = []
    seq = 0

    for block_type, block_text in _extract_blocks(body):
        if len(block_text) <= chunk_size:
            seq += 1
            parts.append(
                RawChunk(
                    doc_title,
                    section,
                    block_text,
                    source,
                    chunk_id=f"{anchor}-{seq}",
                    anchor=anchor,
                    parent_text=parent_text,
                    block_type=block_type,
                    metadata={"anchor": anchor, "blockType": block_type},
                )
            )
            continue

        start = 0
        while start < len(block_text):
            end = min(start + chunk_size, len(block_text))
            seq += 1
            parts.append(
                RawChunk(
                    doc_title,
                    section,
                    block_text[start:end],
                    source,
                    chunk_id=f"{anchor}-{seq}",
                    anchor=anchor,
                    parent_text=parent_text,
                    block_type=block_type,
                    metadata={"anchor": anchor, "blockType": block_type},
                )
            )
            if end >= len(block_text):
                break
            start = max(start + 1, end - chunk_overlap)

    return parts


def chunk_markdown_text(
    text: str,
    doc_title: str,
    source_file: str = "content.md",
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[RawChunk]:
    doc_title = doc_title or title_from_markdown(text)
    chunks: list[RawChunk] = []
    current_title = doc_title
    blocks = re.split(r"(?=^#{1,2}\s+)", text, flags=re.MULTILINE)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        lines = block.splitlines()
        first = lines[0]
        if first.startswith("## "):
            section = first[3:].strip()
            body = "\n".join(lines[1:])
            anchor = slugify(section)
        elif first.startswith("# "):
            current_title = first[2:].strip() or doc_title
            section = "概述"
            body = "\n".join(lines[1:])
            anchor = slugify(current_title)
        else:
            section = "概述"
            body = block
            anchor = slugify(section)
        chunks.extend(
            _split_section(
                section,
                body,
                current_title,
                source_file,
                chunk_size,
                chunk_overlap,
                anchor=anchor,
            )
        )
    return chunks


def chunk_markdown(path: Path, chunk_size: int = CHUNK_SIZE, chunk_overlap: int = CHUNK_OVERLAP) -> list[RawChunk]:
    text = path.read_text(encoding="utf-8")
    return chunk_markdown_text(text, _title_from_file(path), path.name, chunk_size, chunk_overlap)


def load_all_chunks(
    knowledge_dir: Path | None = None,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[RawChunk]:
    base = knowledge_dir or KNOWLEDGE_DIR
    if not base.exists():
        raise FileNotFoundError(f"知识库目录不存在: {base}")
    all_chunks: list[RawChunk] = []
    for path in sorted(base.glob("*.md")):
        all_chunks.extend(chunk_markdown(path, chunk_size, chunk_overlap))
    if not all_chunks:
        raise ValueError("知识库为空，请添加 Markdown 内容")
    return all_chunks


def load_kb_chunks(content_path: Path, chunk_size: int, chunk_overlap: int) -> list[RawChunk]:
    if not content_path.exists():
        raise FileNotFoundError(f"文档不存在: {content_path}")
    text = content_path.read_text(encoding="utf-8")
    title = title_from_markdown(text, content_path.stem)
    chunks = chunk_markdown_text(text, title, content_path.name, chunk_size, chunk_overlap)
    if not chunks:
        raise ValueError("文档内容为空，无法切分")
    return chunks
