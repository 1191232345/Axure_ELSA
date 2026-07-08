"""原型需求对话流：表单设计、生成、归档预览、对话式编辑。"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import AsyncIterator

from context import refresh_session_context
from prototype_edit import cancel_edit, confirm_edit, create_edit_preview, try_plan_edit
from prototype_registry import list_prototypes, sync_registry

_EDIT_CONFIRM = re.compile(
    r"^(确认|确认替换|应用修改|就这样|可以了|好的确认|确认修改)(吧|了)?[。！!]?$",
    re.IGNORECASE,
)
_EDIT_CANCEL = re.compile(
    r"^(取消|不要了|保持现状|算了|放弃修改|不改了)(吧|了)?[。！!]?$",
    re.IGNORECASE,
)
_PAGE_ID_EXPLICIT = re.compile(
    r"(?:ID|id|pageId|页面)[：:\s]*[`'\"]?([\w-]+)[`'\"]?",
    re.IGNORECASE,
)
_BACKTICK_ID = re.compile(r"`([\w-]+)`")
_LIST_INDEX = re.compile(r"^\s*(?:第\s*)?(\d+)\s*(?:个|\.|、)?\s*$")
_EDIT_START = re.compile(r"^(编辑|修改|调整|更新)(一下)?原型")
_EDIT_VERB_WITH_PROTOTYPE = re.compile(r"(编辑|修改|调整|更新)(?:一下)?[\s\S]*?原型")

PHASE_SELECT = "select_page"
PHASE_INSTRUCTION = "await_instruction"
PHASE_SLOTS = "await_edit_slots"
PHASE_CONFIRM = "await_confirm"


def is_edit_confirm(text: str) -> bool:
    return bool(_EDIT_CONFIRM.match(text.strip()))


def is_edit_cancel(text: str) -> bool:
    return bool(_EDIT_CANCEL.match(text.strip()))


def is_new_edit_intent(text: str) -> bool:
    """用户发起新的编辑意图（含带原型名的编辑请求），而非单纯描述修改内容。"""
    stripped = text.strip()
    if not stripped:
        return False
    if _EDIT_START.match(stripped):
        return True
    return bool(_EDIT_VERB_WITH_PROTOTYPE.search(stripped))


def is_edit_restart(text: str) -> bool:
    """兼容旧名：同 is_new_edit_intent。"""
    return is_new_edit_intent(text)


@dataclass
class EditIntentSlots:
    page_id: str | None = None
    module_name: str | None = None
    instruction: str | None = None


def _strip_edit_intent_prefix(text: str) -> str:
    remaining = text.strip()
    remaining = re.sub(r"^(我想|请帮我|帮我|我要|请)?", "", remaining)
    remaining = re.sub(r"^(编辑|修改|调整|更新)(一下)?", "", remaining)
    return remaining.strip()


def _extract_residual_instruction(
    text: str, page_id: str | None, module_name: str | None
) -> str | None:
    remaining = _strip_edit_intent_prefix(text)
    remaining = re.sub(r"原型", "", remaining)
    if module_name:
        remaining = re.sub(
            re.escape(module_name) + r"(?:\s*(?:里|的|中|这个))*\s*",
            "",
            remaining,
        )
        remaining = remaining.replace(module_name, "")
    if page_id:
        remaining = remaining.replace(page_id, "")
    remaining = re.sub(r"^[，,、：:\s「""''\"]+", "", remaining)
    remaining = re.sub(r"^[的把对给在向从之]+", "", remaining)
    remaining = re.sub(r"[，,、：:\s]+$", "", remaining)
    remaining = remaining.strip()
    return remaining or None


def _extract_instruction_from_query(
    text: str, page_id: str | None, module_name: str | None
) -> str | None:
    """从用户 query 提取修改指令（含无「编辑原型」前缀的自然表述）。"""
    stripped = text.strip()
    if not stripped:
        return None
    if _LIST_INDEX.match(stripped):
        return None
    if is_new_edit_intent(stripped):
        return _extract_residual_instruction(stripped, page_id, module_name)
    if page_id:
        remaining = _extract_residual_instruction(stripped, page_id, module_name)
        if remaining:
            return remaining
    return None


def extract_edit_intent_slots(
    text: str,
    items: list[dict],
    *,
    hint_page_id: str | None = None,
    hint_module_name: str | None = None,
) -> EditIntentSlots:
    """从编辑意图语句中解析目标原型与修改内容槽位。"""
    page_id: str | None = None
    if hint_page_id and _page_id_from_items(hint_page_id, items):
        page_id = hint_page_id
    if not page_id:
        page_id = resolve_target_page_id(text, items, hint_page_id=hint_page_id)
    if not page_id and hint_module_name:
        page_id = resolve_target_page_id(hint_module_name, items)
    module_name = _module_name_for(page_id, items) if page_id else None
    instruction = _extract_instruction_from_query(text, page_id, module_name)
    return EditIntentSlots(page_id=page_id, module_name=module_name, instruction=instruction)


def _resolve_hint_page_id(
    hint_page_id: str | None, hint_module_name: str | None, items: list[dict]
) -> str | None:
    if hint_page_id and _page_id_from_items(hint_page_id, items):
        return hint_page_id
    if hint_module_name:
        return resolve_target_page_id(hint_module_name, items)
    return None


def _cleanup_draft_if_any(edit_state: dict | None) -> None:
    if not edit_state or not edit_state.get("editId"):
        return
    page_id = str(edit_state.get("pageId") or "")
    edit_id = str(edit_state.get("editId") or "")
    if not page_id or not edit_id:
        return
    try:
        cancel_edit(page_id, edit_id)
    except FileNotFoundError:
        pass


def _page_id_from_items(page_id: str, items: list[dict]) -> str | None:
    for item in items:
        if str(item.get("pageId") or "") == page_id:
            return page_id
    return None


def resolve_target_page_id(instruction: str, items: list[dict], hint_page_id: str | None = None) -> str | None:
    """从用户回复中解析目标原型 pageId（优先 ID / 序号 / 最长模块名）。"""
    if not items:
        return None
    if hint_page_id:
        found = _page_id_from_items(hint_page_id, items)
        if found:
            return found

    text = instruction.strip()
    if not text:
        return None

    index_match = _LIST_INDEX.match(text)
    if index_match:
        idx = int(index_match.group(1)) - 1
        if 0 <= idx < len(items):
            return str(items[idx]["pageId"])

    for pattern in (_PAGE_ID_EXPLICIT, _BACKTICK_ID):
        for match in pattern.finditer(text):
            found = _page_id_from_items(match.group(1), items)
            if found:
                return found

    for item in items:
        page_id = str(item.get("pageId") or "")
        if page_id and page_id in text:
            explicit_hits = [
                pid
                for pid in (str(i.get("pageId") or "") for i in items)
                if pid and pid in text
            ]
            if len(set(explicit_hits)) == 1:
                return explicit_hits[0]

    exact_name_hits: list[str] = []
    for item in items:
        module_name = str(item.get("moduleName") or "")
        page_id = str(item.get("pageId") or "")
        if module_name and module_name == text:
            exact_name_hits.append(page_id)
    if len(set(exact_name_hits)) == 1:
        return exact_name_hits[0]

    best_len = 0
    best_ids: list[str] = []
    for item in items:
        module_name = str(item.get("moduleName") or "")
        page_id = str(item.get("pageId") or "")
        if module_name and len(module_name) >= 2 and module_name in text:
            name_len = len(module_name)
            if name_len > best_len:
                best_len = name_len
                best_ids = [page_id]
            elif name_len == best_len:
                best_ids.append(page_id)
    unique_best = list(dict.fromkeys(best_ids))
    if len(unique_best) == 1:
        return unique_best[0]

    if len(items) == 1:
        return str(items[0]["pageId"])
    return None


def _resolve_phase(edit_state: dict | None) -> str | None:
    if not edit_state:
        return None
    phase = edit_state.get("phase")
    if phase in (PHASE_SELECT, PHASE_INSTRUCTION, PHASE_SLOTS, PHASE_CONFIRM):
        return str(phase)
    if edit_state.get("editId"):
        return PHASE_CONFIRM
    if edit_state.get("awaitingPageSelection"):
        return PHASE_SELECT
    if edit_state.get("pageId") and not edit_state.get("editId"):
        return PHASE_INSTRUCTION
    return None


def _select_state() -> dict:
    return {"phase": PHASE_SELECT}


def _instruction_state(page_id: str, module_name: str) -> dict:
    return {"phase": PHASE_INSTRUCTION, "pageId": page_id, "moduleName": module_name}


def _slots_state(page_id: str, module_name: str, edit_slots: dict) -> dict:
    return {
        "phase": PHASE_SLOTS,
        "pageId": page_id,
        "moduleName": module_name,
        "editSlots": edit_slots,
    }


def _confirm_state(result: dict, module_name: str) -> dict:
    return {
        "phase": PHASE_CONFIRM,
        "pageId": result["pageId"],
        "moduleName": module_name,
        "editId": result["editId"],
        "previewUrl": result.get("previewUrl", ""),
        "summary": result.get("summary", ""),
        "instruction": result.get("instruction", ""),
        "revision": result.get("revision", 1),
        "instructions": result.get("instructions") or [],
    }


def _module_name_for(page_id: str, items: list[dict]) -> str:
    return next(
        (str(i.get("moduleName") or page_id) for i in items if i.get("pageId") == page_id),
        page_id,
    )


def _format_prototype_pick_list(items: list[dict]) -> str:
    lines = ["请选择要修改的原型（可回复序号或 ID）：\n"]
    for i, item in enumerate(items, 1):
        domain = item.get("breadcrumb") or "未分类"
        lines.append(
            f"{i}. **{item.get('moduleName', item.get('pageId'))}**"
            f"（{domain}，ID: `{item.get('pageId')}`）"
        )
    return "\n".join(lines)


def _edit_pending_payload(result: dict, module_name: str) -> dict:
    payload = _confirm_state(result, module_name)
    return payload


def _edit_preview_reply(result: dict, module_name: str) -> str:
    preview_path = result.get("previewUrl", "")
    revision = int(result.get("revision") or 1)
    rev_line = f"**累积修改轮次：** 第 {revision} 轮\n\n" if revision > 1 else ""
    instructions = result.get("instructions") or []
    history_line = ""
    if len(instructions) > 1:
        history_line = "**修改记录：**\n" + "\n".join(
            f"{idx}. {text}" for idx, text in enumerate(instructions, 1)
        ) + "\n\n"
    return (
        f"已为原型 **{module_name}** 完成修改。\n\n"
        f"{rev_line}"
        f"**本轮变更：** {result.get('summary', '已调整配置')}\n\n"
        f"{history_line}"
        f"**请点击链接预览草稿（将打开新页面）：**\n`{preview_path}`\n\n"
        "如需继续调整，直接描述新的修改内容即可（变更会累积到同一份草稿）。\n"
        "满意后请使用底部 **全部确认** 应用修改，或 **全部取消** 放弃所有未应用修改。"
    )


def _instruction_prompt(module_name: str) -> str:
    return (
        f"已选择 **{module_name}**。\n\n"
        "请输入修改内容，例如：\n"
        "- **增加**：添加紫色工具栏按钮「批量删除」\n"
        "- **删除**：删除「创建时间」列\n"
        "- **修改**：把「批量删除」改成紫色"
    )


async def _finalize(
    messages: list[dict[str, str]],
    reply: str,
    summary: str,
    user_profile: str,
    extra: dict,
) -> dict:
    ctx = await refresh_session_context(messages, reply, summary, user_profile)
    return {
        **extra,
        "summary": ctx.summary,
        "userProfile": ctx.user_profile,
    }


async def prototype_preview_stream(
    messages: list[dict[str, str]],
    summary: str = "",
    user_profile: str = "",
) -> AsyncIterator[tuple[str, dict | None]]:
    sync_registry()
    items = list_prototypes()
    if not items:
        text = (
            "目前还没有归档的原型模块。\n\n"
            "点击顶部 **「✏️ 新建原型」** 或在对话中说「新建列表页原型」，"
            "在 **需求配置页** 填写四区信息后生成可预览页面。"
        )
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": False,
                "mode": "prototype_preview",
                "prototypes": [],
                "openPrototypePreview": False,
            },
        )
        yield "", meta
        return

    lines = [f"共找到 **{len(items)}** 个归档原型：\n"]
    for i, item in enumerate(items, 1):
        domain = item.get("breadcrumb") or "未分类"
        lines.append(f"{i}. **{item.get('moduleName', item.get('pageId'))}**（{domain}）")
    lines.append("\n点击下方 **「查看原型归档」** 按钮可预览全部页面。")
    text = "\n".join(lines)
    yield text, None
    meta = await _finalize(
        messages,
        text,
        summary,
        user_profile,
        {
            "citations": [],
            "refused": False,
            "mode": "prototype_preview",
            "prototypes": items,
            "openPrototypePreview": True,
        },
    )
    yield "", meta


async def prototype_new_stream(
    messages: list[dict[str, str]],
    summary: str = "",
    user_profile: str = "",
    slot_state=None,
) -> AsyncIterator[tuple[str, dict | None]]:
    text = (
        "已为你打开 **需求配置页**，请按四个区域填写 ERP 列表页原型需求：\n\n"
        "1. **检索条件** — 每项说明输入方式\n"
        "2. **主要按钮** — 说明点击后的逻辑\n"
        "3. **列表属性** — 列名与展示类型\n"
        "4. **行内操作** — 说明触发逻辑\n\n"
        "填写完成后点击 **「生成原型」**，系统会自动归档并进入预览。"
    )
    yield text, None
    meta = await _finalize(
        messages,
        text,
        summary,
        user_profile,
        {
            "citations": [],
            "refused": False,
            "mode": "prototype_new",
            "prototypeState": None,
            "openPrototypeDesign": True,
        },
    )
    yield "", meta


async def prototype_edit_confirm_stream(
    messages: list[dict[str, str]],
    summary: str,
    user_profile: str,
    edit_state: dict,
) -> AsyncIterator[tuple[str, dict | None]]:
    page_id = str(edit_state.get("pageId") or "")
    edit_id = str(edit_state.get("editId") or "")
    try:
        result = confirm_edit(page_id, edit_id)
    except (FileNotFoundError, ValueError) as exc:
        text = f"确认失败：{exc}"
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": True,
                "mode": "prototype_edit",
                "prototypeEditState": None,
            },
        )
        yield "", meta
        return

    preview_path = result.get("previewUrl", "")
    text = (
        f"已全部应用修改：**{result.get('summary') or result.get('moduleName')}**\n\n"
        f"**正式预览路径：**\n`{preview_path}`\n\n"
        "修改已生效，可点击上方路径在新页面中查看。\n\n"
        "如需继续调整，直接描述修改内容；说 **「编辑原型」** 可选择其他页面开始新一轮编辑。"
    )
    yield text, None
    meta = await _finalize(
        messages,
        text,
        summary,
        user_profile,
        {
            "citations": [],
            "refused": False,
            "mode": "prototype_edit",
            "prototypeEditState": None,
        },
    )
    yield "", meta


async def prototype_edit_cancel_stream(
    messages: list[dict[str, str]],
    summary: str,
    user_profile: str,
    edit_state: dict,
) -> AsyncIterator[tuple[str, dict | None]]:
    page_id = str(edit_state.get("pageId") or "")
    edit_id = str(edit_state.get("editId") or "")
    try:
        cancel_edit(page_id, edit_id)
    except FileNotFoundError:
        pass
    text = (
        "已取消全部未应用修改，当前原型保持不变。\n\n"
        "如需继续，可描述新的修改内容，或说 **「编辑原型」** 选择其他页面开始新一轮编辑。"
    )
    yield text, None
    meta = await _finalize(
        messages,
        text,
        summary,
        user_profile,
        {
            "citations": [],
            "refused": False,
            "mode": "prototype_edit",
            "prototypeEditState": None,
        },
    )
    yield "", meta


async def _emit_edit_preview(
    messages: list[dict[str, str]],
    summary: str,
    user_profile: str,
    page_id: str,
    module_name: str,
    instruction: str,
    *,
    recover_state: dict | None = None,
    slot_state: dict | None = None,
) -> AsyncIterator[tuple[str, dict | None]]:
    merged_slots = slot_state or (recover_state or {}).get("editSlots")
    existing_edit_id = str((recover_state or {}).get("editId") or "") or None
    try:
        plan_payload = await try_plan_edit(
            page_id,
            instruction,
            messages,
            merged_slots,
            existing_edit_id=existing_edit_id,
        )
    except FileNotFoundError as exc:
        text = f"未找到原型配置：{exc}"
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": True,
                "mode": "prototype_edit",
                "prototypeEditState": None,
            },
        )
        yield "", meta
        return

    if not plan_payload.get("complete"):
        text = str(plan_payload.get("clarification") or "请补充修改信息。")
        yield text, None
        recover = recover_state or _instruction_state(page_id, module_name)
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": False,
                "mode": "prototype_edit",
                "prototypeEditState": _slots_state(
                    page_id,
                    module_name,
                    plan_payload.get("editSlots") or {},
                ),
            },
        )
        yield "", meta
        return

    from prototype_edit_slots import EditPlanResult, EditOperationSlots

    preplan = EditPlanResult(
        complete=True,
        slots=EditOperationSlots.from_dict(plan_payload.get("editSlots")),
        summary=plan_payload.get("summary"),
        ops=plan_payload.get("ops"),
    )

    try:
        result = await create_edit_preview(
            page_id,
            instruction,
            messages=messages,
            slot_state=merged_slots,
            preplan=preplan,
            existing_edit_id=existing_edit_id,
        )
    except FileNotFoundError as exc:
        text = f"未找到原型配置：{exc}"
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": True,
                "mode": "prototype_edit",
                "prototypeEditState": None,
            },
        )
        yield "", meta
        return
    except ValueError as exc:
        text = str(exc)
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": False,
                "mode": "prototype_edit",
                "prototypeEditState": _slots_state(
                    page_id,
                    module_name,
                    plan_payload.get("editSlots") or {},
                ),
            },
        )
        yield "", meta
        return
    except Exception as exc:
        text = f"生成修改预览失败：{exc}"
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": True,
                "mode": "prototype_edit",
                "prototypeEditState": recover_state or _instruction_state(page_id, module_name),
            },
        )
        yield "", meta
        return

    pending_payload = _edit_pending_payload(result, module_name)
    text = _edit_preview_reply(result, module_name)
    yield text, None
    meta = await _finalize(
        messages,
        text,
        summary,
        user_profile,
        {
            "citations": [],
            "refused": False,
            "mode": "prototype_edit",
            "prototypeEditState": pending_payload,
            "prototypeEditPending": pending_payload,
            "openPrototypePreview": False,
        },
    )
    yield "", meta


async def prototype_edit_stream(
    messages: list[dict[str, str]],
    summary: str = "",
    user_profile: str = "",
    edit_state: dict | None = None,
    *,
    hint_page_id: str | None = None,
    hint_module_name: str | None = None,
) -> AsyncIterator[tuple[str, dict | None]]:
    last = messages[-1]["content"].strip()

    sync_registry()
    items = list_prototypes()
    if not items:
        text = (
            "目前还没有可修改的归档原型。\n\n"
            "请先在对话中说「新建列表页原型」创建页面，或说「查看所有原型」浏览已有归档。"
        )
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": False,
                "mode": "prototype_edit",
                "prototypeEditState": None,
            },
        )
        yield "", meta
        return

    interrupt = is_new_edit_intent(last)
    if interrupt:
        _cleanup_draft_if_any(edit_state)
        edit_state = None

    phase = _resolve_phase(edit_state)

    if phase == PHASE_CONFIRM and edit_state and edit_state.get("editId") and not interrupt:
        page_id = str(edit_state.get("pageId") or "")
        module_name = str(edit_state.get("moduleName") or _module_name_for(page_id, items))
        async for chunk in _emit_edit_preview(
            messages,
            summary,
            user_profile,
            page_id,
            module_name,
            last,
            recover_state=edit_state,
        ):
            yield chunk
        return

    if phase == PHASE_SLOTS and edit_state and not interrupt:
        page_id = str(edit_state.get("pageId") or "")
        module_name = str(edit_state.get("moduleName") or _module_name_for(page_id, items))
        if not last:
            text = "请补充修改信息，例如：工具栏按钮「批量删除」、改成紫色。"
            yield text, None
            meta = await _finalize(
                messages,
                text,
                summary,
                user_profile,
                {
                    "citations": [],
                    "refused": False,
                    "mode": "prototype_edit",
                    "prototypeEditState": edit_state,
                },
            )
            yield "", meta
            return
        async for chunk in _emit_edit_preview(
            messages,
            summary,
            user_profile,
            page_id,
            module_name,
            last,
            recover_state=edit_state,
            slot_state=edit_state.get("editSlots"),
        ):
            yield chunk
        return

    if phase == PHASE_INSTRUCTION and edit_state and not interrupt:
        page_id = str(edit_state.get("pageId") or "")
        module_name = str(edit_state.get("moduleName") or _module_name_for(page_id, items))
        slots = extract_edit_intent_slots(last, items)
        if slots.page_id and slots.page_id != page_id:
            _cleanup_draft_if_any(edit_state)
            edit_state = None
            if slots.instruction:
                async for chunk in _emit_edit_preview(
                    messages,
                    summary,
                    user_profile,
                    slots.page_id,
                    slots.module_name or _module_name_for(slots.page_id, items),
                    slots.instruction,
                ):
                    yield chunk
                return
            text = _instruction_prompt(slots.module_name or _module_name_for(slots.page_id, items))
            yield text, None
            meta = await _finalize(
                messages,
                text,
                summary,
                user_profile,
                {
                    "citations": [],
                    "refused": False,
                    "mode": "prototype_edit",
                    "prototypeEditState": _instruction_state(
                        slots.page_id,
                        slots.module_name or _module_name_for(slots.page_id, items),
                    ),
                },
            )
            yield "", meta
            return
        if not last:
            text = "请输入修改内容，例如：添加紫色工具栏按钮「批量删除」。"
            yield text, None
            meta = await _finalize(
                messages,
                text,
                summary,
                user_profile,
                {
                    "citations": [],
                    "refused": False,
                    "mode": "prototype_edit",
                    "prototypeEditState": _instruction_state(page_id, module_name),
                },
            )
            yield "", meta
            return
        async for chunk in _emit_edit_preview(
            messages, summary, user_profile, page_id, module_name, last
        ):
            yield chunk
        return

    if phase == PHASE_SELECT and not interrupt:
        resolved_hint = _resolve_hint_page_id(hint_page_id, hint_module_name, items)
        slots = extract_edit_intent_slots(
            last,
            items,
            hint_page_id=resolved_hint,
            hint_module_name=hint_module_name,
        )
        page_id = slots.page_id or resolve_target_page_id(last, items)
        if page_id and slots.instruction:
            module_name = slots.module_name or _module_name_for(page_id, items)
            async for chunk in _emit_edit_preview(
                messages,
                summary,
                user_profile,
                page_id,
                module_name,
                slots.instruction,
            ):
                yield chunk
            return
        if not page_id:
            text = _format_prototype_pick_list(items) + "\n\n未能识别所选原型，请回复序号或 ID。"
            yield text, None
            meta = await _finalize(
                messages,
                text,
                summary,
                user_profile,
                {
                    "citations": [],
                    "refused": False,
                    "mode": "prototype_edit",
                    "prototypeEditState": _select_state(),
                    "prototypes": items,
                },
            )
            yield "", meta
            return
        module_name = _module_name_for(page_id, items)
        text = _instruction_prompt(module_name)
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": False,
                "mode": "prototype_edit",
                "prototypeEditState": _instruction_state(page_id, module_name),
            },
        )
        yield "", meta
        return

    resolved_hint = _resolve_hint_page_id(hint_page_id, hint_module_name, items)
    slots = extract_edit_intent_slots(
        last,
        items,
        hint_page_id=resolved_hint,
        hint_module_name=hint_module_name,
    )

    if slots.page_id and slots.instruction:
        module_name = slots.module_name or _module_name_for(slots.page_id, items)
        async for chunk in _emit_edit_preview(
            messages,
            summary,
            user_profile,
            slots.page_id,
            module_name,
            slots.instruction,
        ):
            yield chunk
        return

    if slots.page_id:
        module_name = slots.module_name or _module_name_for(slots.page_id, items)
        text = _instruction_prompt(module_name)
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": False,
                "mode": "prototype_edit",
                "prototypeEditState": _instruction_state(slots.page_id, module_name),
            },
        )
        yield "", meta
        return

    if len(items) == 1:
        only = items[0]
        page_id = str(only["pageId"])
        module_name = str(only.get("moduleName") or page_id)
        text = _instruction_prompt(module_name)
        yield text, None
        meta = await _finalize(
            messages,
            text,
            summary,
            user_profile,
            {
                "citations": [],
                "refused": False,
                "mode": "prototype_edit",
                "prototypeEditState": _instruction_state(page_id, module_name),
            },
        )
        yield "", meta
        return

    text = _format_prototype_pick_list(items)
    yield text, None
    meta = await _finalize(
        messages,
        text,
        summary,
        user_profile,
        {
            "citations": [],
            "refused": False,
            "mode": "prototype_edit",
            "prototypeEditState": _select_state(),
            "prototypes": items,
        },
    )
    yield "", meta
