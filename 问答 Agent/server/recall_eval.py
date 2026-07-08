"""知识库检索召回测试（单条 + 批量）。"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from config import MIN_SCORE, TOP_K
from kb_registry import get_kb_paths
from store import get_store_for_search

RECALL_TESTS_FILENAME = "recall_tests.json"


def _recall_tests_path(kb_id: str) -> Path:
    content_path, _ = get_kb_paths(kb_id)
    return content_path.parent / RECALL_TESTS_FILENAME


def load_recall_cases(kb_id: str) -> list[dict[str, Any]]:
    path = _recall_tests_path(kb_id)
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        cases = data.get("cases", []) if isinstance(data, dict) else []
        if not isinstance(cases, list):
            return []
        out: list[dict[str, Any]] = []
        for item in cases:
            if isinstance(item, dict) and str(item.get("question", "")).strip():
                out.append(item)
        return out
    except (json.JSONDecodeError, OSError):
        return []


def _case_passed(
    chunk_doc_title: str,
    chunk_section: str,
    score: float,
    *,
    expected_title: str | None,
    expected_section: str | None,
    threshold: float,
) -> bool:
    if score < threshold:
        return False
    if expected_title and chunk_doc_title != expected_title:
        return False
    if expected_section and chunk_section != expected_section:
        return False
    return True


def run_retrieve_test(
    kb_id: str,
    query: str,
    *,
    top_k: int | None = None,
    min_score: float | None = None,
) -> dict[str, object]:
    text = query.strip()
    if not text:
        raise ValueError("请输入测试问题")

    k = top_k if top_k is not None else TOP_K
    threshold = min_score if min_score is not None else MIN_SCORE

    store = get_store_for_search(kb_id)
    if store.size == 0:
        raise ValueError("索引未构建，请先构建索引")

    detailed = store.search_detailed(text, k)
    items: list[dict[str, object]] = []
    passed_count = 0

    for rank, (chunk, score, debug) in enumerate(detailed, start=1):
        passed = score >= threshold
        if passed:
            passed_count += 1
        items.append(
            {
                "rank": rank,
                "docTitle": chunk.doc_title,
                "section": chunk.section,
                "text": chunk.text,
                "excerpt": chunk.text.replace("\n", " ")[:200],
                "score": round(score, 4),
                "passed": passed,
                "vectorScore": debug.get("vector"),
                "bm25Score": debug.get("bm25"),
                "fusionScore": debug.get("fusion"),
            }
        )

    return {
        "kbId": kb_id,
        "query": text,
        "topK": k,
        "minScore": threshold,
        "total": passed_count,
        "candidates": len(items),
        "items": items,
    }


def run_batch_recall_eval(
    kb_id: str,
    *,
    top_k: int | None = None,
    min_score: float | None = None,
) -> dict[str, object]:
    cases = load_recall_cases(kb_id)
    if not cases:
        raise ValueError(f"未找到测试用例，请在 {RECALL_TESTS_FILENAME} 中添加 cases")

    k = top_k if top_k is not None else TOP_K
    threshold = min_score if min_score is not None else MIN_SCORE

    store = get_store_for_search(kb_id)
    if store.size == 0:
        raise ValueError("索引未构建，请先构建索引")

    results: list[dict[str, object]] = []
    passed = 0

    for index, case in enumerate(cases, start=1):
        question = str(case.get("question", "")).strip()
        expected_title = str(case.get("docTitle", "")).strip() or None
        expected_section = str(case.get("section", "")).strip() or None

        detailed = store.search_detailed(question, k)
        hit = False
        matched_rank: int | None = None
        matched: dict[str, object] | None = None

        for rank, (chunk, score, debug) in enumerate(detailed, start=1):
            if _case_passed(
                chunk.doc_title,
                chunk.section,
                score,
                expected_title=expected_title,
                expected_section=expected_section,
                threshold=threshold,
            ):
                hit = True
                matched_rank = rank
                matched = {
                    "docTitle": chunk.doc_title,
                    "section": chunk.section,
                    "score": round(score, 4),
                    "vectorScore": debug.get("vector"),
                    "bm25Score": debug.get("bm25"),
                }
                break

        if hit:
            passed += 1

        results.append(
            {
                "index": index,
                "question": question,
                "expectedDocTitle": expected_title,
                "expectedSection": expected_section,
                "passed": hit,
                "matchedRank": matched_rank,
                "matched": matched,
                "topHit": (
                    {
                        "docTitle": detailed[0][0].doc_title,
                        "section": detailed[0][0].section,
                        "score": round(detailed[0][1], 4),
                    }
                    if detailed
                    else None
                ),
            }
        )

    total = len(results)
    return {
        "kbId": kb_id,
        "topK": k,
        "minScore": threshold,
        "total": total,
        "passed": passed,
        "failed": total - passed,
        "passRate": round(passed / total, 4) if total else 0.0,
        "cases": results,
    }
