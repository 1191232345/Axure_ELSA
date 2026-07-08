"""FastAPI 路由。"""
from __future__ import annotations

import json
from typing import Literal

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from chunker import chunk_markdown_text, title_from_markdown
from config import CHAT_MODEL, CHUNK_OVERLAP, CHUNK_SIZE, EMBED_MODEL, LLM_PROVIDER
from kb_registry import (
    create_base,
    delete_base,
    get_active_id,
    get_base,
    list_bases,
    set_active_id,
    update_base,
)
from recall_eval import run_batch_recall_eval, run_retrieve_test
from rag import rag_stream
from prototype_registry import list_prototypes, sync_registry
from prototype_design import generate_from_design, get_design_template
from prototype_edit import cancel_edit, confirm_edit
from template_store import (
    create_template,
    delete_template,
    duplicate_template,
    get_template,
    list_templates,
    update_template,
)
from settings_store import get_public_config, update_config
from store import get_active_store, store_manager

router = APIRouter()


class ChatMessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessageIn] = Field(min_length=1)
    summary: str = ""
    userProfile: str = ""
    prototypeState: dict | None = None
    prototypeEditState: dict | None = None
    triggerPrototypePreview: bool = False


class ConfigUpdate(BaseModel):
    llmProvider: str | None = None
    openaiApiKey: str | None = None
    openaiBaseUrl: str | None = None
    chatModel: str | None = None
    embedModel: str | None = None
    topK: int | None = None
    minScore: float | None = None
    historyTurns: int | None = None
    hybridSearch: bool | None = None
    rerankEnabled: bool | None = None
    rerankCandidates: int | None = Field(default=None, ge=5, le=50)
    rrfK: int | None = Field(default=None, ge=10, le=120)


class KnowledgeBaseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = ""


class KnowledgeBaseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = None
    content: str | None = None
    chunkSize: int | None = Field(default=None, ge=100, le=2000)
    chunkOverlap: int | None = Field(default=None, ge=0, le=500)


class ChunkPreviewRequest(BaseModel):
    content: str
    title: str = ""
    chunkSize: int = Field(default=CHUNK_SIZE, ge=100, le=2000)
    chunkOverlap: int = Field(default=CHUNK_OVERLAP, ge=0, le=500)


class RetrieveTestRequest(BaseModel):
    query: str = Field(min_length=1)
    topK: int | None = Field(default=None, ge=1, le=20)
    minScore: float | None = Field(default=None, ge=0, le=1)


class BatchRecallEvalRequest(BaseModel):
    topK: int | None = Field(default=None, ge=1, le=20)
    minScore: float | None = Field(default=None, ge=0, le=1)


class PrototypeEditConfirmRequest(BaseModel):
    editId: str = Field(min_length=1)


class PrototypeFilterDesign(BaseModel):
    label: str = ""
    inputType: str = "text"
    dataSource: str = ""
    defaultValue: str = ""
    required: bool = False


class PrototypeToolbarDesign(BaseModel):
    label: str = ""
    logic: str = ""
    precondition: str = ""


class PrototypeColumnDesign(BaseModel):
    label: str = ""
    fieldType: str = "text"
    sortable: bool = False
    format: str = ""


class PrototypeRowActionDesign(BaseModel):
    label: str = ""
    logic: str = ""
    showCondition: str = ""


class PrototypeDesignRequest(BaseModel):
    moduleName: str = ""
    breadcrumb: str = ""
    notes: str = ""
    filters: list[PrototypeFilterDesign] = Field(default_factory=list)
    toolbarButtons: list[PrototypeToolbarDesign] = Field(default_factory=list)
    columns: list[PrototypeColumnDesign] = Field(default_factory=list)
    rowActions: list[PrototypeRowActionDesign] = Field(default_factory=list)


class PrototypeTemplateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = ""
    design: PrototypeDesignRequest | None = None


class PrototypeTemplateUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = None
    design: PrototypeDesignRequest | None = None


class PrototypeTemplateDuplicate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)


@router.get("/config")
def get_config():
    return get_public_config()


@router.put("/config")
def put_config(body: ConfigUpdate):
    try:
        return update_config(body.model_dump(exclude_none=True))
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.get("/knowledge-bases")
def knowledge_bases_list():
    return {"activeId": get_active_id(), "items": list_bases()}


@router.post("/knowledge-bases")
def knowledge_bases_create(body: KnowledgeBaseCreate):
    try:
        kb = create_base(body.name, body.description)
        return kb
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/knowledge-bases/preview-chunks")
def knowledge_bases_preview_chunks(body: ChunkPreviewRequest):
    title = body.title.strip() or title_from_markdown(body.content)
    chunks = chunk_markdown_text(
        body.content,
        title,
        "preview.md",
        body.chunkSize,
        body.chunkOverlap,
    )
    return _chunks_payload(chunks, title)


@router.get("/knowledge-bases/{kb_id}")
def knowledge_bases_get(kb_id: str):
    try:
        return get_base(kb_id)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


@router.put("/knowledge-bases/{kb_id}")
def knowledge_bases_update(kb_id: str, body: KnowledgeBaseUpdate):
    try:
        return update_base(
            kb_id,
            name=body.name,
            description=body.description,
            content=body.content,
            chunk_size=body.chunkSize,
            chunk_overlap=body.chunkOverlap,
        )
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.delete("/knowledge-bases/{kb_id}")
def knowledge_bases_delete(kb_id: str):
    try:
        delete_base(kb_id)
        store_manager.invalidate(kb_id)
        return {"ok": True, "activeId": get_active_id()}
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/knowledge-bases/{kb_id}/activate")
def knowledge_bases_activate(kb_id: str):
    try:
        kb = set_active_id(kb_id)
        store_manager.reload_active()
        return kb
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


def _chunks_payload(chunks, title: str) -> dict:
    return {
        "title": title,
        "total": len(chunks),
        "chunks": [
            {
                "index": i + 1,
                "docTitle": c.doc_title,
                "section": c.section,
                "text": c.text,
                "chars": len(c.text),
                "chunkId": c.chunk_id,
                "anchor": c.anchor,
                "blockType": c.block_type,
                "hasParent": bool(c.parent_text.strip()),
            }
            for i, c in enumerate(chunks)
        ],
    }


@router.get("/knowledge-bases/{kb_id}/preview")
def knowledge_bases_preview_saved(kb_id: str):
    try:
        detail = get_base(kb_id)
        title = title_from_markdown(detail["content"], detail["name"])
        chunks = chunk_markdown_text(
            detail["content"],
            title,
            "content.md",
            int(detail["chunkSize"]),
            int(detail["chunkOverlap"]),
        )
        return _chunks_payload(chunks, title)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


@router.post("/knowledge-bases/{kb_id}/rebuild")
def knowledge_bases_rebuild(kb_id: str):
    try:
        store = store_manager.get(kb_id)
        count = store.build()
        if kb_id == get_active_id():
            store_manager.reload_active()
        return {**store.status(), "message": f"索引完成，共 {count} 个 chunk"}
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.post("/knowledge-bases/{kb_id}/retrieve-test")
def knowledge_bases_retrieve_test(kb_id: str, body: RetrieveTestRequest):
    try:
        return run_retrieve_test(
            kb_id,
            body.query,
            top_k=body.topK,
            min_score=body.minScore,
        )
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.post("/knowledge-bases/{kb_id}/recall-eval-batch")
def knowledge_bases_recall_eval_batch(kb_id: str, body: BatchRecallEvalRequest | None = None):
    try:
        opts = body or BatchRecallEvalRequest()
        return run_batch_recall_eval(
            kb_id,
            top_k=opts.topK,
            min_score=opts.minScore,
        )
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.get("/index")
def index_status():
    return get_active_store().status()


@router.post("/index/rebuild")
def index_rebuild():
    try:
        store = get_active_store()
        count = store.build()
        return {**store.status(), "message": f"索引完成，共 {count} 个 chunk"}
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.get("/health")
def health():
    store = get_active_store()
    return {
        "ok": True,
        "chunks": store.size,
        "activeKbId": get_active_id(),
        "provider": LLM_PROVIDER,
        "chatModel": CHAT_MODEL,
        "embedModel": EMBED_MODEL,
    }


@router.get("/prototypes")
def prototypes_list():
    sync_registry()
    return {"items": list_prototypes()}


@router.get("/prototypes/design-template")
def prototypes_design_template(template: str = "blank"):
    try:
        return get_design_template(template)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


@router.get("/prototype-templates")
def prototype_templates_list():
    return {"items": list_templates()}


@router.get("/prototype-templates/{template_id}")
def prototype_templates_get(template_id: str):
    try:
        return get_template(template_id)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


@router.post("/prototype-templates")
def prototype_templates_create(body: PrototypeTemplateCreate):
    try:
        design = body.design.model_dump() if body.design else None
        return create_template(body.name, body.description, design)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.put("/prototype-templates/{template_id}")
def prototype_templates_update(template_id: str, body: PrototypeTemplateUpdate):
    try:
        design = body.design.model_dump() if body.design else None
        return update_template(
            template_id,
            name=body.name,
            description=body.description,
            design=design,
        )
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.delete("/prototype-templates/{template_id}")
def prototype_templates_delete(template_id: str):
    try:
        delete_template(template_id)
        return {"ok": True}
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/prototype-templates/{template_id}/duplicate")
def prototype_templates_duplicate(template_id: str, body: PrototypeTemplateDuplicate | None = None):
    try:
        name = body.name if body else None
        return duplicate_template(template_id, name)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/prototypes/generate")
async def prototypes_generate(body: PrototypeDesignRequest):
    try:
        return await generate_from_design(body.model_dump())
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.post("/prototypes/{page_id}/edit-confirm")
def prototypes_edit_confirm(page_id: str, body: PrototypeEditConfirmRequest):
    try:
        return confirm_edit(page_id, body.editId)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.post("/prototypes/{page_id}/edit-cancel")
def prototypes_edit_cancel(page_id: str, body: PrototypeEditConfirmRequest):
    try:
        return cancel_edit(page_id, body.editId)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(500, str(exc)) from exc


@router.post("/chat")
async def chat(body: ChatRequest):
    msgs = [{"role": m.role, "content": m.content.strip()} for m in body.messages if m.content.strip()]
    if not body.triggerPrototypePreview:
        if not msgs or msgs[-1]["role"] != "user":
            raise HTTPException(400, "最后一条消息必须是 user")
    elif not msgs:
        msgs = [{"role": "user", "content": "查看所有归档原型"}]

    async def sse():
        meta: dict | None = None
        try:
            async for token, done in rag_stream(
                msgs,
                body.summary,
                body.userProfile,
                prototype_state=body.prototypeState,
                prototype_edit_state=body.prototypeEditState,
                trigger_prototype_preview=body.triggerPrototypePreview,
            ):
                if token:
                    yield f"event: token\ndata: {json.dumps({'text': token}, ensure_ascii=False)}\n\n"
                if done is not None:
                    meta = done
            payload = meta or {"citations": [], "refused": False}
            yield f"event: done\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
        except Exception as exc:
            err = {"message": str(exc)}
            yield f"event: error\ndata: {json.dumps(err, ensure_ascii=False)}\n\n"

    return StreamingResponse(sse(), media_type="text/event-stream")
