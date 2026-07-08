"""LLM 辅助编辑原型 spec：草稿预览 → 用户确认后替换。"""
from __future__ import annotations

import json
import re
import shutil
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from config import PROTOTYPE_SKELETON_DIR, PROTOTYPES_DIR
from embedder import chat_once
from prompts import PROTOTYPE_EDIT_PROMPT
from prototype_design import (
    COLUMN_TYPE_LABELS,
    INPUT_TYPE_LABELS,
    ROW_ACTION_MAP,
    _build_toolbar_buttons,
)
from prototype_registry import register_prototype
from prototype_edit_slots import EditOperationSlots, EditPlanResult, plan_edit_operation
from prototype_spec import apply_instruction_toolbar_variants, normalize_spec, resolve_toolbar_variant
from prototype_runtime import sync_spec_runtime
from prototype_slots import _build_form_fields, _label_to_field

PENDING_DIR = PROTOTYPES_DIR / "pending"
DRAFTS_DIR = PROTOTYPE_SKELETON_DIR / "generated" / "_drafts"
PREVIEW_PREFIX = "/api/prototype-files/generated/_drafts"

ROW_ACTION_LABELS = {"edit": "编辑", "delete": "删除", "view": "查看"}

_TOOLBAR_HINT = re.compile(r"主要按钮|工具栏|顶部按钮|列表上方|toolbar", re.IGNORECASE)
_ROW_HINT = re.compile(r"行内|列表按钮|行按钮|操作列|每行|rowAction", re.IGNORECASE)
_DEFAULT_ROW_LABELS = frozenset({"编辑", "删除", "查看"})
_TOOLBAR_KEYWORDS = re.compile(r"新增|导出|导入|批量|创建|下载|上传")


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _preview_url(draft_id: str) -> str:
    return f"{PREVIEW_PREFIX}/{draft_id}/index.html"


def load_spec(page_id: str) -> dict:
    spec_path = PROTOTYPES_DIR / "specs" / f"{page_id}.spec.json"
    if spec_path.is_file():
        return json.loads(spec_path.read_text(encoding="utf-8"))
    generated = PROTOTYPE_SKELETON_DIR / "generated" / page_id / "module.spec.json"
    if generated.is_file():
        return json.loads(generated.read_text(encoding="utf-8"))
    raise FileNotFoundError(f"未找到原型 spec：{page_id}")


def spec_summary_for_llm(spec: dict) -> str:
    lines = [
        f"moduleName: {spec.get('moduleName', '')}",
        f"pageId: {spec.get('pageId', '')}",
        f"breadcrumb: {spec.get('breadcrumb', '')}",
        "filters:",
    ]
    for f in spec.get("filters") or []:
        lines.append(f"  - {f.get('label')} ({f.get('type')})")
    lines.append("【主要按钮 · 工具栏 toolbarButtons】（列表顶部，不是行内操作）：")
    for b in spec.get("toolbarButtons") or []:
        lines.append(f"  - {b.get('label')} action={b.get('action')}")
    if not spec.get("toolbarButtons"):
        lines.append("  - （无）")
    lines.append("columns:")
    for c in spec.get("columns") or []:
        sortable = "可排序" if c.get("sortable") else ""
        lines.append(f"  - {c.get('label')} type={c.get('type', 'text')} {sortable}".strip())
    lines.append("【行内操作 · 列表行按钮 rowActions】（每行末尾操作列，不是工具栏）：")
    for action in spec.get("rowActions") or []:
        lines.append(f"  - {ROW_ACTION_LABELS.get(action, action)} ({action})")
    if not spec.get("rowActions"):
        lines.append("  - （无）")
    if spec.get("logicDocs", {}).get("buttons"):
        lines.append("logicDocs.buttons（名称 | 位置 | 逻辑）：")
        for row in spec["logicDocs"]["buttons"]:
            pos = row[1] if len(row) > 1 else ""
            logic = row[3] if len(row) > 3 else ""
            lines.append(f"  - {row[0]} | 位置={pos} | {logic}")
    return "\n".join(lines)


def _parse_edit_json(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("LLM 输出必须是 JSON 对象")
    if not isinstance(data.get("ops"), list):
        raise ValueError("缺少 ops 数组")
    data.setdefault("summary", "已根据指令调整原型配置")
    return data


def _match_in_row_actions(spec: dict, match: str) -> bool:
    for action in spec.get("rowActions") or []:
        label = ROW_ACTION_LABELS.get(str(action), str(action))
        if _match_label(label, match):
            return True
    for row in (spec.get("logicDocs") or {}).get("buttons") or []:
        if len(row) > 1 and str(row[1]) == "行操作" and _match_label(str(row[0]), match):
            return True
    return False


def _normalize_button_op(spec: dict, op: dict, instruction: str) -> dict:
    """根据用户指令与当前 spec，纠正 LLM 混用的工具栏/行内按钮 op。"""
    name = str(op.get("op") or "")
    toolbar_ops = {"updateToolbarButton", "removeToolbarButton", "addToolbarButton"}
    row_ops = {"addRowAction", "removeRowAction", "updateRowActionLogic"}
    if name not in toolbar_ops | row_ops:
        return op

    match = str(op.get("match") or op.get("label") or "")
    item = op.get("item") or op
    label = str(item.get("label") or op.get("label") or match)
    prefer_toolbar = bool(_TOOLBAR_HINT.search(instruction))
    prefer_row = bool(_ROW_HINT.search(instruction))
    in_toolbar = _find_toolbar_index(spec, match) is not None or _find_toolbar_index(spec, label) is not None
    in_row = _match_in_row_actions(spec, match) or _match_in_row_actions(spec, label)

    if not prefer_toolbar and not prefer_row:
        if label in _DEFAULT_ROW_LABELS or match in _DEFAULT_ROW_LABELS:
            prefer_row = True
        elif _TOOLBAR_KEYWORDS.search(label) or _TOOLBAR_KEYWORDS.search(match):
            prefer_toolbar = True
        elif in_row and not in_toolbar:
            prefer_row = True
        elif in_toolbar and not in_row:
            prefer_toolbar = True

    if name in toolbar_ops and (prefer_row or (in_row and not in_toolbar and not prefer_toolbar)):
        if name == "removeToolbarButton":
            return {"op": "removeRowAction", "match": match or label}
        if name == "updateToolbarButton":
            patch = op.get("patch") or {}
            return {
                "op": "updateRowActionLogic",
                "match": match or label,
                "logic": str(patch.get("logic") or op.get("logic") or "—"),
                "showCondition": str(patch.get("precondition") or op.get("precondition") or "无"),
            }
        if name == "addToolbarButton":
            return {
                "op": "addRowAction",
                "label": label,
                "logic": str(item.get("logic") or op.get("logic") or "—"),
                "showCondition": str(item.get("precondition") or op.get("precondition") or "无"),
            }

    if name in row_ops and (prefer_toolbar or (in_toolbar and not in_row and not prefer_row)):
        if name == "removeRowAction":
            return {"op": "removeToolbarButton", "match": match or label}
        if name == "updateRowActionLogic":
            return {
                "op": "updateToolbarButton",
                "match": match or label,
                "patch": {
                    "logic": str(op.get("logic") or "—"),
                    "precondition": str(op.get("showCondition") or op.get("precondition") or "无"),
                },
            }
        if name == "addRowAction":
            return {
                "op": "addToolbarButton",
                "label": label,
                "logic": str(op.get("logic") or "—"),
                "precondition": str(op.get("showCondition") or op.get("precondition") or "无"),
            }

    return op


def _normalize_ops(spec: dict, ops: list[dict], instruction: str) -> list[dict]:
    return [_normalize_button_op(spec, op, instruction) for op in ops if isinstance(op, dict)]


async def plan_edits_with_llm(spec: dict, instruction: str) -> dict:
    user_content = (
        f"当前原型配置：\n{spec_summary_for_llm(spec)}\n\n"
        f"用户修改指令：{instruction.strip()}"
    )
    raw = await chat_once(
        [
            {"role": "system", "content": PROTOTYPE_EDIT_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.0,
    )
    plan = _parse_edit_json(raw)
    plan["ops"] = _normalize_ops(spec, plan.get("ops") or [], instruction)
    return plan


def _match_label(text: str, pattern: str) -> bool:
    if not pattern:
        return False
    return pattern in text or text in pattern


def _find_toolbar_index(spec: dict, match: str) -> int | None:
    for i, btn in enumerate(spec.get("toolbarButtons") or []):
        if _match_label(str(btn.get("label", "")), match):
            return i
    return None


def _find_column_index(spec: dict, match: str) -> int | None:
    for i, col in enumerate(spec.get("columns") or []):
        if _match_label(str(col.get("label", "")), match):
            return i
    return None


def _find_filter_index(spec: dict, match: str) -> int | None:
    for i, item in enumerate(spec.get("filters") or []):
        if _match_label(str(item.get("label", "")), match):
            return i
    return None


def _upsert_logic_button(spec: dict, label: str, position: str, logic: str, precondition: str = "无") -> None:
    docs = spec.setdefault("logicDocs", {})
    buttons: list[list[str]] = list(docs.get("buttons") or [])
    for row in buttons:
        if _match_label(str(row[0]), label) and str(row[1]) == position:
            row[2] = precondition
            row[3] = logic
            docs["buttons"] = buttons
            return
    buttons.append([label, position, precondition, logic])
    docs["buttons"] = buttons


def _remove_logic_button(spec: dict, label: str, position: str | None = None) -> None:
    docs = spec.get("logicDocs") or {}
    buttons = docs.get("buttons") or []
    kept = [
        row
        for row in buttons
        if not (_match_label(str(row[0]), label) and (position is None or str(row[1]) == position))
    ]
    if "logicDocs" in spec:
        spec["logicDocs"]["buttons"] = kept


def _sync_form_fields(spec: dict) -> None:
    spec["formFields"] = _build_form_fields(spec.get("columns") or [])


def _sync_logic_fields(spec: dict) -> None:
    docs = spec.setdefault("logicDocs", {})
    field_docs = []
    for col in spec.get("columns") or []:
        field_type = COLUMN_TYPE_LABELS.get(str(col.get("type") or "text"), "文本")
        sortable = "是" if col.get("sortable") else "否"
        field_docs.append([col.get("label"), field_type, sortable, "—"])
    docs["fields"] = field_docs


def _sync_logic_filters(spec: dict) -> None:
    docs = spec.setdefault("logicDocs", {})
    filter_docs = []
    for item in spec.get("filters") or []:
        ftype = "下拉单选" if item.get("type") == "select" else "文本输入"
        detail = item.get("placeholder") or "按配置匹配"
        if item.get("options"):
            detail = "/".join(str(o.get("label")) for o in item["options"] if o.get("label"))
        filter_docs.append([item.get("label"), ftype, detail])
    docs["filters"] = filter_docs or [["无", "-", "展示全部"]]


def _sync_spec_derivatives(spec: dict) -> None:
    _sync_form_fields(spec)
    _sync_logic_fields(spec)
    _sync_logic_filters(spec)


def apply_ops(spec: dict, ops: list[dict]) -> dict:
    updated = deepcopy(spec)
    for op in ops:
        if not isinstance(op, dict):
            continue
        name = str(op.get("op") or "")
        if name == "set":
            path = str(op.get("path") or "")
            if path in ("moduleName", "breadcrumb", "notes"):
                updated[path] = str(op.get("value") or "")
            continue
        if name == "updateModuleName":
            updated["moduleName"] = str(op.get("value") or op.get("label") or "")
            continue
        if name == "updateBreadcrumb":
            updated["breadcrumb"] = str(op.get("value") or "")
            continue
        if name == "updateToolbarButton":
            match = str(op.get("match") or "")
            idx = _find_toolbar_index(updated, match)
            if idx is None:
                continue
            patch = op.get("patch") or {}
            btn = updated["toolbarButtons"][idx]
            if patch.get("label"):
                old_label = btn.get("label")
                btn["label"] = str(patch["label"])
                _remove_logic_button(updated, str(old_label), "工具栏")
                _upsert_logic_button(
                    updated,
                    btn["label"],
                    "工具栏",
                    str(patch.get("logic") or op.get("logic") or "—"),
                    str(patch.get("precondition") or op.get("precondition") or "无"),
                )
            if patch.get("logic") or op.get("logic"):
                _upsert_logic_button(
                    updated,
                    str(btn.get("label")),
                    "工具栏",
                    str(patch.get("logic") or op.get("logic") or "—"),
                    str(patch.get("precondition") or op.get("precondition") or "无"),
                )
            if patch.get("variant") or patch.get("color"):
                btn["variant"] = resolve_toolbar_variant(
                    {"variant": patch.get("variant"), "color": patch.get("color"), "label": btn.get("label")},
                    str(btn.get("action") or "custom"),
                    str(btn.get("label") or ""),
                )
            continue
        if name == "removeToolbarButton":
            match = str(op.get("match") or "")
            idx = _find_toolbar_index(updated, match)
            if idx is None:
                continue
            label = updated["toolbarButtons"][idx].get("label")
            updated["toolbarButtons"].pop(idx)
            _remove_logic_button(updated, str(label), "工具栏")
            continue
        if name == "addToolbarButton":
            item = op.get("item") or op
            label = str(item.get("label") or "")
            if not label:
                continue
            buttons = list(updated.get("toolbarButtons") or [])
            new_btn = _build_toolbar_buttons(
                [{
                    "label": label,
                    "logic": str(item.get("logic") or ""),
                    "precondition": str(item.get("precondition") or op.get("precondition") or ""),
                    "variant": item.get("variant") or op.get("variant"),
                    "color": item.get("color") or op.get("color"),
                }],
                str(updated.get("moduleName") or "模块"),
            )[0]
            if item.get("action"):
                new_btn["action"] = str(item["action"])
            buttons.append(new_btn)
            updated["toolbarButtons"] = buttons
            _upsert_logic_button(
                updated,
                label,
                "工具栏",
                str(item.get("logic") or op.get("logic") or "—"),
                str(item.get("precondition") or op.get("precondition") or "无"),
            )
            continue
        if name == "updateColumn":
            match = str(op.get("match") or "")
            idx = _find_column_index(updated, match)
            if idx is None:
                continue
            patch = op.get("patch") or {}
            col = updated["columns"][idx]
            if patch.get("label"):
                col["label"] = str(patch["label"])
            if patch.get("fieldType"):
                ft = str(patch["fieldType"])
                col.pop("type", None)
                col.pop("render", None)
                col.pop("template", None)
                if ft == "status":
                    col["type"] = "status"
                elif ft == "datetime":
                    col["type"] = "datetime"
            if "sortable" in patch:
                col["sortable"] = bool(patch["sortable"])
            continue
        if name == "removeColumn":
            match = str(op.get("match") or "")
            idx = _find_column_index(updated, match)
            if idx is None:
                continue
            updated["columns"].pop(idx)
            continue
        if name == "addColumn":
            item = op.get("item") or op
            label = str(item.get("label") or "")
            if not label:
                continue
            idx = len(updated.get("columns") or [])
            field_name, inferred = _label_to_field(label, idx)
            col: dict = {"field": field_name, "label": label}
            ft = str(item.get("fieldType") or "text")
            if ft == "status" or inferred == "status":
                col["type"] = "status"
            elif ft == "datetime" or inferred == "datetime":
                col["type"] = "datetime"
            if item.get("sortable"):
                col["sortable"] = True
            updated.setdefault("columns", []).append(col)
            continue
        if name == "removeFilter":
            match = str(op.get("match") or "")
            idx = _find_filter_index(updated, match)
            if idx is None:
                continue
            updated["filters"].pop(idx)
            continue
        if name == "updateRowActionLogic":
            label = str(op.get("match") or op.get("label") or "")
            _upsert_logic_button(
                updated,
                label,
                "行操作",
                str(op.get("logic") or "—"),
                str(op.get("showCondition") or op.get("precondition") or "无"),
            )
            continue
        if name == "removeRowAction":
            match = str(op.get("match") or "")
            action_key = ROW_ACTION_MAP.get(match)
            if not action_key:
                for key, label in ROW_ACTION_LABELS.items():
                    if _match_label(label, match):
                        action_key = key
                        break
            if action_key and action_key in (updated.get("rowActions") or []):
                updated["rowActions"] = [a for a in updated["rowActions"] if a != action_key]
            _remove_logic_button(updated, match, "行操作")
            continue
        if name == "addRowAction":
            label = str(op.get("label") or op.get("match") or "")
            action_key = ROW_ACTION_MAP.get(label, "edit" if "编辑" in label else "delete" if "删" in label else "view")
            actions = list(updated.get("rowActions") or [])
            if action_key not in actions:
                actions.append(action_key)
            updated["rowActions"] = actions
            _upsert_logic_button(
                updated,
                label or ROW_ACTION_LABELS.get(action_key, action_key),
                "行操作",
                str(op.get("logic") or "—"),
                str(op.get("showCondition") or "无"),
            )

    if not updated.get("columns"):
        raise ValueError("修改后至少需保留一列表格列")
    _sync_spec_derivatives(updated)
    partial = {
        "moduleName": updated.get("moduleName"),
        "pageId": updated.get("pageId"),
        "breadcrumb": updated.get("breadcrumb"),
        "pageType": updated.get("pageType", "list-crud"),
        "version": updated.get("version", "1.0.0"),
        "dataFile": updated.get("dataFile"),
        "columns": updated.get("columns"),
    }
    return normalize_spec(updated, partial)


def _pending_path(page_id: str, edit_id: str) -> Path:
    return PENDING_DIR / page_id / f"{edit_id}.json"


def _load_pending(page_id: str, edit_id: str) -> dict:
    path = _pending_path(page_id, edit_id)
    if not path.is_file():
        raise FileNotFoundError("未找到待确认的修改草稿")
    return json.loads(path.read_text(encoding="utf-8"))


def _save_pending(record: dict) -> None:
    page_id = record["pageId"]
    edit_id = record["editId"]
    path = _pending_path(page_id, edit_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _cleanup_pending(record: dict) -> None:
    edit_id = record.get("editId")
    page_id = record.get("pageId")
    if edit_id:
        draft_dir = DRAFTS_DIR / edit_id
        if draft_dir.is_dir():
            shutil.rmtree(draft_dir, ignore_errors=True)
    if page_id and edit_id:
        path = _pending_path(page_id, edit_id)
        path.unlink(missing_ok=True)


def _load_active_pending_record(page_id: str) -> dict | None:
    page_dir = PENDING_DIR / page_id
    if not page_dir.is_dir():
        return None
    files = sorted(page_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not files:
        return None
    return json.loads(files[0].read_text(encoding="utf-8"))


def load_spec_for_edit(page_id: str, *, edit_id: str | None = None) -> tuple[dict, dict | None]:
    """编辑基准 spec：有未确认草稿则用草稿，否则用正式 spec。"""
    record: dict | None = None
    if edit_id:
        try:
            record = _load_pending(page_id, edit_id)
        except FileNotFoundError:
            record = None
    if record is None:
        record = _load_active_pending_record(page_id)
    if record and record.get("spec"):
        return deepcopy(record["spec"]), record
    return load_spec(page_id), None


def _merge_instruction_history(pending: dict | None, instruction: str) -> list[str]:
    history: list[str] = []
    if pending:
        stored = pending.get("instructions")
        if isinstance(stored, list):
            history.extend(str(item).strip() for item in stored if str(item).strip())
        elif pending.get("instruction"):
            history.append(str(pending["instruction"]).strip())
    latest = instruction.strip()
    if latest and (not history or history[-1] != latest):
        history.append(latest)
    return history


async def create_edit_preview(
    page_id: str,
    instruction: str,
    *,
    messages: list[dict[str, str]] | None = None,
    slot_state: EditOperationSlots | dict | None = None,
    preplan: EditPlanResult | None = None,
    existing_edit_id: str | None = None,
) -> dict:
    spec, pending = load_spec_for_edit(page_id, edit_id=existing_edit_id)
    chat_messages = messages or [{"role": "user", "content": instruction}]
    slots = (
        slot_state
        if isinstance(slot_state, EditOperationSlots)
        else EditOperationSlots.from_dict(slot_state)
    )

    plan = preplan or await plan_edit_operation(spec, instruction, chat_messages, slots)
    if not plan.complete:
        raise ValueError(plan.clarification or "修改指令不完整，请补充信息。")

    new_spec = apply_ops(spec, plan.ops or [])
    new_spec = apply_instruction_toolbar_variants(new_spec, instruction, plan.ops or [])
    new_spec["pageId"] = page_id

    if pending:
        edit_id = str(pending["editId"])
        revision = int(pending.get("revision") or 1) + 1
        created_at = str(pending.get("createdAt") or _now_iso())
    else:
        edit_id = uuid4().hex[:12]
        revision = 1
        created_at = _now_iso()

    draft_dir = DRAFTS_DIR / edit_id
    draft_dir.mkdir(parents=True, exist_ok=True)

    sync_spec_runtime(
        new_spec,
        output_dir=draft_dir,
        persist_spec=False,
        bootstrap_html=True,
    )

    instructions = _merge_instruction_history(pending, instruction)
    summary = str(plan.summary or "已生成修改预览")
    record = {
        "editId": edit_id,
        "pageId": page_id,
        "instruction": instruction.strip(),
        "instructions": instructions,
        "revision": revision,
        "summary": summary,
        "previewUrl": _preview_url(edit_id),
        "spec": new_spec,
        "editSlots": plan.slots.to_dict(),
        "createdAt": created_at,
        "updatedAt": _now_iso(),
    }
    _save_pending(record)
    return {
        "editId": edit_id,
        "pageId": page_id,
        "summary": summary,
        "previewUrl": record["previewUrl"],
        "instruction": record["instruction"],
        "instructions": instructions,
        "revision": revision,
        "editSlots": plan.slots.to_dict(),
    }


async def try_plan_edit(
    page_id: str,
    instruction: str,
    messages: list[dict[str, str]],
    slot_state: EditOperationSlots | dict | None = None,
    *,
    existing_edit_id: str | None = None,
) -> dict:
    """槽位规划：complete 时可直接预览，否则返回 clarification。"""
    spec, _ = load_spec_for_edit(page_id, edit_id=existing_edit_id)
    slots = (
        slot_state
        if isinstance(slot_state, EditOperationSlots)
        else EditOperationSlots.from_dict(slot_state)
    )
    plan = await plan_edit_operation(spec, instruction, messages, slots)
    return {
        "complete": plan.complete,
        "summary": plan.summary,
        "clarification": plan.clarification,
        "ops": plan.ops,
        "editSlots": plan.slots.to_dict(),
        "errors": plan.errors,
    }


async def create_edit_preview_legacy(page_id: str, instruction: str) -> dict:
    """旧版：LLM 直接生成 ops（fallback）。"""
    page_dir = PENDING_DIR / page_id
    if page_dir.is_dir():
        for path in list(page_dir.glob("*.json")):
            try:
                _cleanup_pending(json.loads(path.read_text(encoding="utf-8")))
            except (OSError, json.JSONDecodeError):
                path.unlink(missing_ok=True)

    spec = load_spec(page_id)
    plan = await plan_edits_with_llm(spec, instruction)
    new_spec = apply_ops(spec, plan.get("ops") or [])
    new_spec = apply_instruction_toolbar_variants(new_spec, instruction, plan.get("ops") or [])
    new_spec["pageId"] = page_id

    edit_id = uuid4().hex[:12]
    draft_dir = DRAFTS_DIR / edit_id
    draft_dir.mkdir(parents=True, exist_ok=True)

    sync_spec_runtime(
        new_spec,
        output_dir=draft_dir,
        persist_spec=False,
        bootstrap_html=True,
    )

    record = {
        "editId": edit_id,
        "pageId": page_id,
        "instruction": instruction.strip(),
        "summary": str(plan.get("summary") or "已生成修改预览"),
        "previewUrl": _preview_url(edit_id),
        "spec": new_spec,
        "createdAt": _now_iso(),
    }
    _save_pending(record)
    return {
        "editId": edit_id,
        "pageId": page_id,
        "summary": record["summary"],
        "previewUrl": record["previewUrl"],
        "instruction": record["instruction"],
    }


def confirm_edit(page_id: str, edit_id: str) -> dict:
    record = _load_pending(page_id, edit_id)
    spec = record["spec"]
    if str(spec.get("pageId")) != page_id:
        raise ValueError("草稿与原型 pageId 不一致")

    out_dir = PROTOTYPE_SKELETON_DIR / "generated" / page_id
    sync_spec_runtime(spec, output_dir=out_dir, persist_spec=True, bootstrap_html=False)
    entry = register_prototype(page_id, spec["moduleName"], spec.get("breadcrumb", ""))
    _cleanup_pending(record)

    return {
        "pageId": page_id,
        "moduleName": spec["moduleName"],
        "breadcrumb": spec.get("breadcrumb", ""),
        "previewUrl": entry["previewUrl"],
        "summary": record.get("summary", ""),
    }


def cancel_edit(page_id: str, edit_id: str) -> dict:
    record = _load_pending(page_id, edit_id)
    _cleanup_pending(record)
    return {"ok": True, "pageId": page_id, "editId": edit_id}


def get_pending_edit(page_id: str) -> dict | None:
    record = _load_active_pending_record(page_id)
    if not record:
        return None
    return {
        "editId": record["editId"],
        "pageId": record["pageId"],
        "summary": record.get("summary", ""),
        "previewUrl": record.get("previewUrl", ""),
        "instruction": record.get("instruction", ""),
        "instructions": record.get("instructions") or [],
        "revision": record.get("revision", 1),
        "createdAt": record.get("createdAt", ""),
        "updatedAt": record.get("updatedAt", ""),
    }
