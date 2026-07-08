"""混合检索（向量 + BM25）与轻量重排。"""
from __future__ import annotations

import math
import re
from collections import Counter
from typing import TYPE_CHECKING

import numpy as np

from config import (
    HYBRID_SEARCH,
    MIN_SCORE,
    RERANK_CANDIDATES,
    RERANK_ENABLED,
    RRF_K,
    TOP_K,
)
from embedder import embed_texts

if TYPE_CHECKING:
    from store import IndexedChunk, VectorStore

_CJK_RE = re.compile(r"[\u4e00-\u9fff]")
_LATIN_RE = re.compile(r"[a-zA-Z0-9]+")


def tokenize_for_bm25(text: str) -> list[str]:
    """中英文混合分词：CJK 单字 + 英文数字词。"""
    text = text.lower().strip()
    if not text:
        return []
    tokens: list[str] = []
    i = 0
    while i < len(text):
        ch = text[i]
        if _CJK_RE.match(ch):
            tokens.append(ch)
            i += 1
            continue
        m = _LATIN_RE.match(text, i)
        if m:
            tokens.append(m.group(0))
            i = m.end()
            continue
        i += 1
    return tokens


class BM25Index:
    """轻量 BM25 实现，避免额外依赖。"""

    def __init__(self, corpus_tokens: list[list[str]], k1: float = 1.5, b: float = 0.75) -> None:
        self.k1 = k1
        self.b = b
        self.corpus = corpus_tokens
        self.n = len(corpus_tokens)
        self.avgdl = sum(len(doc) for doc in corpus_tokens) / self.n if self.n else 0.0
        self.doc_freq: Counter[str] = Counter()
        for doc in corpus_tokens:
            for term in set(doc):
                self.doc_freq[term] += 1

    def score(self, query_tokens: list[str], doc_index: int) -> float:
        if doc_index < 0 or doc_index >= self.n or not query_tokens:
            return 0.0
        doc = self.corpus[doc_index]
        doc_len = len(doc)
        tf = Counter(doc)
        total = 0.0
        for term in query_tokens:
            if term not in tf:
                continue
            df = self.doc_freq.get(term, 0)
            idf = math.log(1 + (self.n - df + 0.5) / (df + 0.5))
            freq = tf[term]
            denom = freq + self.k1 * (1 - self.b + self.b * doc_len / (self.avgdl or 1.0))
            total += idf * (freq * (self.k1 + 1)) / (denom or 1.0)
        return total

    def top_scores(self, query_tokens: list[str], limit: int) -> list[tuple[int, float]]:
        if not query_tokens or not self.corpus:
            return []
        scored = [(idx, self.score(query_tokens, idx)) for idx in range(self.n)]
        scored.sort(key=lambda x: x[1], reverse=True)
        return [(idx, score) for idx, score in scored[:limit] if score > 0]


def build_bm25_index(items: list[IndexedChunk]) -> BM25Index | None:
    if not items:
        return None
    corpus = [
        tokenize_for_bm25(f"{item.doc_title} {item.section} {item.text}")
        for item in items
    ]
    if not any(corpus):
        return None
    return BM25Index(corpus)


def _normalize_scores(scored: list[tuple[int, float]]) -> dict[int, float]:
    if not scored:
        return {}
    values = [s for _, s in scored]
    lo, hi = min(values), max(values)
    if hi - lo < 1e-9:
        return {idx: 1.0 for idx, _ in scored}
    return {idx: (score - lo) / (hi - lo) for idx, score in scored}


def reciprocal_rank_fusion(rank_lists: list[list[int]], k: int = RRF_K) -> dict[int, float]:
    scores: dict[int, float] = {}
    for ranks in rank_lists:
        for rank, idx in enumerate(ranks):
            scores[idx] = scores.get(idx, 0.0) + 1.0 / (k + rank + 1)
    return scores


def lexical_overlap(query: str, item: IndexedChunk) -> float:
    q_tokens = set(tokenize_for_bm25(query))
    if not q_tokens:
        return 0.0
    doc_tokens = set(
        tokenize_for_bm25(f"{item.doc_title} {item.section} {item.text[:200]}")
    )
    if not doc_tokens:
        return 0.0
    return len(q_tokens & doc_tokens) / len(q_tokens)


def _vector_scores(items: list[IndexedChunk], query: str, limit: int) -> list[tuple[int, float]]:
    if not items:
        return []
    qv = np.array(embed_texts([query])[0], dtype=np.float32)
    return _vector_scores_with_qv(items, qv, limit)


def _vector_scores_with_qv(
    items: list[IndexedChunk],
    qv: np.ndarray,
    limit: int,
) -> list[tuple[int, float]]:
    """向量打分（复用调用方预计算的 query 向量，避免重复 embed）。"""
    if not items:
        return []
    qn = float(np.linalg.norm(qv)) or 1.0
    scored: list[tuple[int, float]] = []
    for idx, item in enumerate(items):
        score = float(np.dot(item.vector, qv) / ((np.linalg.norm(item.vector) or 1.0) * qn))
        scored.append((idx, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:limit]


def _bm25_scores(bm25: BM25Index | None, query: str, limit: int) -> list[tuple[int, float]]:
    if bm25 is None:
        return []
    tokens = tokenize_for_bm25(query)
    return bm25.top_scores(tokens, limit)


def _rerank(
    query: str,
    items: list[IndexedChunk],
    candidate_indices: list[int],
    vector_norm: dict[int, float],
    bm25_norm: dict[int, float],
    rrf_scores: dict[int, float],
) -> list[tuple[int, float]]:
    rrf_norm = _normalize_scores([(i, rrf_scores.get(i, 0.0)) for i in candidate_indices])
    reranked: list[tuple[int, float]] = []
    for idx in candidate_indices:
        overlap = lexical_overlap(query, items[idx])
        score = (
            0.35 * rrf_norm.get(idx, 0.0)
            + 0.30 * vector_norm.get(idx, 0.0)
            + 0.20 * bm25_norm.get(idx, 0.0)
            + 0.15 * overlap
        )
        reranked.append((idx, score))
    reranked.sort(key=lambda x: x[1], reverse=True)
    return reranked


def hybrid_search(
    store: VectorStore,
    query: str,
    top_k: int | None = None,
    *,
    min_score: float | None = None,
    query_vector: np.ndarray | None = None,
) -> list[tuple[IndexedChunk, float, dict[str, float]]]:
    """
    混合检索，返回 (chunk, score, debug) 列表。
    score 为归一化融合分（0~1），用于阈值过滤；debug 含 vector/bm25/rrf 分量。

    若传入 query_vector（预计算的 query 向量），则跳过内部 embed 调用，便于多库探测时复用。
    """
    k = top_k if top_k is not None else TOP_K
    threshold = min_score if min_score is not None else MIN_SCORE
    items = store.items
    if not items:
        return []

    pool = min(len(items), max(k * 4, RERANK_CANDIDATES if RERANK_ENABLED else k * 2))

    if query_vector is not None:
        vector_ranked = _vector_scores_with_qv(items, query_vector, pool)
    else:
        vector_ranked = _vector_scores(items, query, pool)
    vector_by_idx = {idx: score for idx, score in vector_ranked}
    vector_norm = _normalize_scores(vector_ranked)

    if HYBRID_SEARCH and store.bm25 is not None:
        bm25_ranked = _bm25_scores(store.bm25, query, pool)
        bm25_norm = _normalize_scores(bm25_ranked)
        rank_lists = [
            [idx for idx, _ in vector_ranked],
            [idx for idx, _ in bm25_ranked],
        ]
        rrf_scores = reciprocal_rank_fusion(rank_lists)
        candidate_indices = sorted(
            set(vector_by_idx) | {idx for idx, _ in bm25_ranked},
            key=lambda i: rrf_scores.get(i, 0.0),
            reverse=True,
        )[:pool]
    else:
        bm25_norm = {}
        rrf_scores = {idx: 1.0 / (RRF_K + rank + 1) for rank, (idx, _) in enumerate(vector_ranked)}
        candidate_indices = [idx for idx, _ in vector_ranked]

    if RERANK_ENABLED and len(candidate_indices) > k:
        final_ranked = _rerank(query, items, candidate_indices, vector_norm, bm25_norm, rrf_scores)
    else:
        final_ranked = [(idx, rrf_scores.get(idx, vector_by_idx.get(idx, 0.0))) for idx in candidate_indices]
        final_ranked.sort(key=lambda x: x[1], reverse=True)

    fusion_norm = _normalize_scores(final_ranked)

    out: list[tuple[IndexedChunk, float, dict[str, float]]] = []
    for idx, _ in final_ranked:
        vec = vector_by_idx.get(idx, 0.0)
        fusion = fusion_norm.get(idx, 0.0)
        display_score = fusion if HYBRID_SEARCH else vec
        if HYBRID_SEARCH and vec >= threshold and fusion < threshold:
            display_score = max(fusion, vec * 0.85)
        debug = {
            "vector": round(vec, 4),
            "bm25": round(bm25_norm.get(idx, 0.0), 4),
            "rrf": round(rrf_scores.get(idx, 0.0), 4),
            "fusion": round(display_score, 4),
        }
        if display_score >= threshold or (HYBRID_SEARCH and vec >= threshold):
            out.append((items[idx], display_score, debug))
        if len(out) >= k:
            break

    if not out and final_ranked:
        idx = final_ranked[0][0]
        vec = vector_by_idx.get(idx, 0.0)
        out.append((items[idx], vec, {"vector": round(vec, 4), "bm25": 0.0, "rrf": 0.0, "fusion": round(vec, 4)}))

    return out[:k]
