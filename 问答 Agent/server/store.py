"""向量索引与混合检索（支持多知识库）。"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone

import numpy as np

from chunker import RawChunk, load_kb_chunks
from config import EMBED_MODEL
from embedder import embed_texts
from kb_registry import get_active_id, get_kb_paths, get_kb_chunk_params
from retrieval import BM25Index, build_bm25_index, hybrid_search

INDEX_VERSION = 2


@dataclass
class IndexedChunk:
    doc_title: str
    section: str
    text: str
    source_file: str
    vector: np.ndarray
    chunk_id: str = ""
    anchor: str = ""
    parent_text: str = ""
    block_type: str = "text"
    metadata: dict[str, str] = field(default_factory=dict)


class VectorStore:
    def __init__(self, kb_id: str, index_path) -> None:
        self.kb_id = kb_id
        self.index_path = index_path
        self._items: list[IndexedChunk] = []
        self._bm25: BM25Index | None = None
        self._built_at: str | None = None
        self._embed_model: str | None = None
        self._index_version: int = INDEX_VERSION

    @property
    def items(self) -> list[IndexedChunk]:
        return self._items

    @property
    def bm25(self) -> BM25Index | None:
        return self._bm25

    @property
    def size(self) -> int:
        return len(self._items)

    def _rebuild_bm25(self) -> None:
        self._bm25 = build_bm25_index(self._items)

    def status(self) -> dict[str, object]:
        return {
            "kbId": self.kb_id,
            "chunks": self.size,
            "ready": self.size > 0,
            "embedModel": self._embed_model,
            "builtAt": self._built_at,
            "indexVersion": self._index_version,
            "cachePath": str(self.index_path),
        }

    @staticmethod
    def _item_from_raw(c: RawChunk, vector: list[float]) -> IndexedChunk:
        return IndexedChunk(
            c.doc_title,
            c.section,
            c.text,
            c.source_file,
            np.array(vector, dtype=np.float32),
            chunk_id=c.chunk_id,
            anchor=c.anchor,
            parent_text=c.parent_text,
            block_type=c.block_type,
            metadata=dict(c.metadata),
        )

    @staticmethod
    def _item_from_cache(item: dict) -> IndexedChunk:
        return IndexedChunk(
            item["doc_title"],
            item["section"],
            item["text"],
            item["source_file"],
            np.array(item["vector"], dtype=np.float32),
            chunk_id=str(item.get("chunk_id", "")),
            anchor=str(item.get("anchor", "")),
            parent_text=str(item.get("parent_text", "")),
            block_type=str(item.get("block_type", "text")),
            metadata=dict(item.get("metadata") or {}),
        )

    def load_cache(self) -> bool:
        if not self.index_path.exists():
            return False
        try:
            data = json.loads(self.index_path.read_text(encoding="utf-8"))
            if data.get("embedModel") != EMBED_MODEL:
                return False
            version = int(data.get("indexVersion", 1))
            items = data.get("items", [])
            if not isinstance(items, list) or not items:
                return False
            self._items = [self._item_from_cache(item) for item in items]
            self._built_at = data.get("builtAt")
            self._embed_model = data.get("embedModel")
            self._index_version = version
            self._rebuild_bm25()
            return True
        except (json.JSONDecodeError, KeyError, OSError, TypeError, ValueError):
            self.clear()
            return False

    def save_cache(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "kbId": self.kb_id,
            "embedModel": EMBED_MODEL,
            "builtAt": self._built_at,
            "indexVersion": INDEX_VERSION,
            "items": [
                {
                    "doc_title": item.doc_title,
                    "section": item.section,
                    "text": item.text,
                    "source_file": item.source_file,
                    "vector": item.vector.tolist(),
                    "chunk_id": item.chunk_id,
                    "anchor": item.anchor,
                    "parent_text": item.parent_text,
                    "block_type": item.block_type,
                    "metadata": item.metadata,
                }
                for item in self._items
            ],
        }
        self.index_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    def clear(self) -> None:
        self._items = []
        self._bm25 = None
        self._built_at = None
        self._embed_model = None

    def build(self) -> int:
        content_path, _ = get_kb_paths(self.kb_id)
        chunk_size, chunk_overlap = get_kb_chunk_params(self.kb_id)
        raw = load_kb_chunks(content_path, chunk_size, chunk_overlap)
        vectors = embed_texts([f"{c.doc_title}\n{c.section}\n{c.text}" for c in raw])
        self._items = [self._item_from_raw(c, v) for c, v in zip(raw, vectors)]
        self._built_at = datetime.now(timezone.utc).isoformat()
        self._embed_model = EMBED_MODEL
        self._index_version = INDEX_VERSION
        self._rebuild_bm25()
        self.save_cache()
        return self.size

    def search(self, query: str, top_k: int = 5) -> list[tuple[IndexedChunk, float]]:
        """混合检索，返回 (chunk, score)。"""
        hits = hybrid_search(self, query, top_k)
        return [(chunk, score) for chunk, score, _ in hits]

    def search_with_vector(
        self,
        query: str,
        query_vector: np.ndarray | None,
        top_k: int = 5,
    ) -> list[tuple[IndexedChunk, float]]:
        """混合检索（可传入预计算的 query 向量，避免重复 embed）。"""
        hits = hybrid_search(self, query, top_k, query_vector=query_vector)
        return [(chunk, score) for chunk, score, _ in hits]

    def search_detailed(self, query: str, top_k: int = 5) -> list[tuple[IndexedChunk, float, dict[str, float]]]:
        return hybrid_search(self, query, top_k)


class StoreManager:
    def __init__(self) -> None:
        self._stores: dict[str, VectorStore] = {}

    def get(self, kb_id: str) -> VectorStore:
        if kb_id not in self._stores:
            _, index_path = get_kb_paths(kb_id)
            self._stores[kb_id] = VectorStore(kb_id, index_path)
        return self._stores[kb_id]

    @property
    def active(self) -> VectorStore:
        return self.get(get_active_id())

    def reload_active(self) -> VectorStore:
        kb_id = get_active_id()
        self._stores.pop(kb_id, None)
        store = self.get(kb_id)
        store.load_cache()
        return store

    def invalidate(self, kb_id: str) -> None:
        self._stores.pop(kb_id, None)


store_manager = StoreManager()


def get_active_store() -> VectorStore:
    return store_manager.active


def get_store_for_search(kb_id: str) -> VectorStore:
    """获取指定知识库向量存储，必要时从磁盘加载索引。"""
    store = store_manager.get(kb_id)
    if store.size == 0:
        store.load_cache()
    return store
