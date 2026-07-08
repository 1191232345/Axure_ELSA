"""编辑模式：增/删/改模板槽位 → 确定性编译 ops。"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Literal

from chat_history import format_history_text
from config import HISTORY_TURNS
from embedder import chat_once
from prompts import (
    PROTOTYPE_EDIT_ADD_SLOT_PROMPT,
    PROTOTYPE_EDIT_REMOVE_SLOT_PROMPT,
    PROTOTYPE_EDIT_UPDATE_SLOT_PROMPT,
)
from prototype_spec import ALLOWED_VARIANTS, extract_variant_from_text

OpType = Literal["add", "remove", "update"]
TargetType = Literal["toolbarButton", "column", "filter", "rowAction", "moduleMeta"]
ChangeKind = Literal["style", "label", "logic", "precondition", "fieldType", "sortable"]

TARGET_TYPE_LABELS: dict[str, str] = {
    "toolbarButton": "工具栏按钮",
    "column": "列表列",
    "filter": "检索项",
    "rowAction": "行内操作",
    "moduleMeta": "模块信息",
}

CHANGE_KIND_LABELS: dict[str, str] = {
    "style": "样式/颜色",
    "label": "名称文字",
    "logic": "交互逻辑",
    "precondition": "前置条件",
    "fieldType": "字段类型",
    "sortable": "是否可排序",
}

_UPDATE_PATTERN = re.compile(
    r"改成|改为|修改为|调整为|调整|换成|设为|变成|改颜色|改样式|改文字|改名叫|改逻辑|改交互|改前置"
)
_ADD_PATTERN = re.compile(r"添加|新增|增加|加一个|加在|加入")
_REMOVE_PATTERN = re.compile(r"删除|移除|去掉|删去")
_TOOLBAR_HINT = re.compile(r"主要按钮|工具栏|顶部按钮|列表上方|toolbar", re.IGNORECASE)
_ROW_HINT = re.compile(r"行内|列表按钮|行按钮|操作列|每行|rowAction", re.IGNORECASE)
_COLUMN_HINT = re.compile(r"列|字段|属性|栏位")
_FILTER_HINT = re.compile(r"检索|筛选|过滤")
_MODULE_HINT = re.compile(r"模块名|业务域|面包屑")
_BUTTON_HINT = re.compile(r"按钮|toolbar|主要按钮|工具栏|顶部按钮|列表上方", re.IGNORECASE)

ROW_ACTION_LABELS = {"edit": "编辑", "delete": "删除", "view": "查看"}


@dataclass
class EditOperationSlots:
    op_type: OpType | None = None
    target_type: TargetType | None = None
    target_match: str | None = None
    change_kind: ChangeKind | None = None
    payload: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "opType": self.op_type,
            "targetType": self.target_type,
            "targetMatch": self.target_match,
            "changeKind": self.change_kind,
            "payload": dict(self.payload),
        }

    @classmethod
    def from_dict(cls, data: dict | None) -> EditOperationSlots:
        if not data:
            return cls()
        payload = data.get("payload")
        if not isinstance(payload, dict):
            payload = {}
        op_type = data.get("opType") or data.get("op_type")
        target_type = data.get("targetType") or data.get("target_type")
        change_kind = data.get("changeKind") or data.get("change_kind")
        return cls(
            op_type=op_type if op_type in ("add", "remove", "update") else None,
            target_type=target_type if target_type in TARGET_TYPE_LABELS else None,
            target_match=_clean_str(data.get("targetMatch") or data.get("target_match")),
            change_kind=change_kind if change_kind in CHANGE_KIND_LABELS else None,
            payload={k: v for k, v in payload.items() if v not in (None, "", "null")},
        )

    def merge(self, other: EditOperationSlots) -> EditOperationSlots:
        if other.op_type:
            self.op_type = other.op_type
        if other.target_type:
            self.target_type = other.target_type
        if other.target_match:
            self.target_match = other.target_match
        if other.change_kind:
            self.change_kind = other.change_kind
        for key, val in other.payload.items():
            if val not in (None, "", "null"):
                self.payload[key] = val
        return self

    def is_complete(self) -> bool:
        return len(self.pending_questions()) == 0

    def pending_questions(self) -> list[str]:
        questions: list[str] = []
        if not self.op_type:
            questions.append("请说明要做哪种操作：**增加**、**删除** 还是 **修改**？")
            return questions

        if not self.target_type:
            questions.append("请说明要改哪一类：**工具栏按钮**、**列表列**、**检索项** 还是 **行内操作**？")
            return questions

        if self.op_type in ("remove", "update") and not self.target_match:
            label = TARGET_TYPE_LABELS.get(self.target_type, "目标")
            verb = "删除" if self.op_type == "remove" else "修改"
            questions.append(f"请说明要{verb}哪个{label}（名称）？")
            return questions

        if self.op_type == "update" and not self.change_kind:
            questions.append("请说明要改什么：**颜色/样式**、**名称**、**交互逻辑** 还是 **前置条件**？")
            return questions

        if self.op_type == "add":
            if self.target_type == "toolbarButton" and not self.payload.get("label"):
                questions.append("请提供要添加的工具栏按钮名称。")
            elif self.target_type == "column" and not self.payload.get("label"):
                questions.append("请提供要添加的列名称。")
            elif self.target_type == "filter" and not self.payload.get("label"):
                questions.append("请提供要添加的检索项名称。")
            elif self.target_type == "rowAction" and not self.payload.get("label"):
                questions.append("请提供要添加的行内操作名称（如编辑、删除）。")
            elif self.target_type == "moduleMeta" and not (
                self.payload.get("moduleName") or self.payload.get("breadcrumb")
            ):
                questions.append("请说明要修改的模块名或业务域。")
            return questions

        if self.op_type == "update":
            missing = _missing_update_payload(self.change_kind, self.payload)
            if missing:
                questions.append(missing)
        return questions


@dataclass
class EditPlanResult:
    complete: bool
    slots: EditOperationSlots
    clarification: str | None = None
    summary: str | None = None
    ops: list[dict] | None = None
    errors: list[str] = field(default_factory=list)


def _clean_str(value: object) -> str | None:
    if value in (None, "", "null"):
        return None
    text = str(value).strip()
    return text or None


def _missing_update_payload(change_kind: ChangeKind | None, payload: dict) -> str | None:
    if change_kind == "style" and not (payload.get("variant") or payload.get("color")):
        return "请说明要改成什么颜色/样式（如紫色、红色、主色）。"
    if change_kind == "label" and not payload.get("label"):
        return "请说明新的名称文字。"
    if change_kind == "logic" and not payload.get("logic"):
        return "请说明新的交互逻辑。"
    if change_kind == "precondition" and not payload.get("precondition"):
        return "请说明新的前置条件。"
    if change_kind == "fieldType" and not payload.get("fieldType"):
        return "请说明新的字段类型（text / status / datetime）。"
    if change_kind == "sortable" and "sortable" not in payload:
        return "请说明是否可排序（是/否）。"
    return None


def classify_op_type(text: str) -> OpType | None:
    stripped = text.strip()
    if not stripped:
        return None
    if _UPDATE_PATTERN.search(stripped):
        return "update"
    if _ADD_PATTERN.search(stripped):
        return "add"
    if _REMOVE_PATTERN.search(stripped):
        return "remove"
    return None


def _infer_column_field_type(label: str) -> str:
    if re.search(r"时间|日期", label):
        return "datetime"
    if re.search(r"状态", label):
        return "status"
    return "text"


def extract_add_column_labels(instruction: str) -> list[str]:
    """从「添加创建人、创建时间列」等表述中提取列名。"""
    text = instruction.strip()
    if not text:
        return []
    if _TOOLBAR_HINT.search(text) or _ROW_HINT.search(text) or _BUTTON_HINT.search(text):
        return []
    if not (_ADD_PATTERN.search(text) or _COLUMN_HINT.search(text)):
        return []

    working = re.sub(r"^(?:请|帮我|我要|想要)?(?:添加|新增|增加)(?:一下)?", "", text).strip()
    working = re.sub(r"(?:两个|几个|多个|若干)?(?:列表)?列$", "", working).strip()
    working = re.sub(r"[的之]+(?=[、，,和及及]|$)", "", working)

    labels: list[str] = []
    for part in re.split(r"[、，,和及及]+", working):
        part = re.sub(r"列$", "", part.strip()).strip()
        if part and len(part) >= 2 and part not in {"一个", "字段", "属性", "列表"}:
            labels.append(part)

    if not labels and _COLUMN_HINT.search(text):
        match = re.search(r"(?:添加|新增|增加)(?:一下)?(.+?)列", text)
        if match:
            inner = match.group(1).strip()
            for part in re.split(r"[、，,和及及]+", inner):
                part = part.strip()
                if part and len(part) >= 2:
                    labels.append(part)

    deduped: list[str] = []
    for label in labels:
        if label not in deduped:
            deduped.append(label)
    return deduped


def _looks_like_column_add(instruction: str) -> bool:
    if _COLUMN_HINT.search(instruction):
        return True
    if extract_add_column_labels(instruction):
        return True
    if _ADD_PATTERN.search(instruction) and re.search(
        r"创建人|创建时间|更新时间|修改时间|操作人|编号|名称|数量|金额|状态|日期|时间",
        instruction,
    ):
        return True
    return False


def _match_label(text: str, pattern: str) -> bool:
    if not pattern:
        return False
    return pattern in text or text in pattern


def _toolbar_labels(spec: dict) -> list[str]:
    return [str(b.get("label") or "") for b in spec.get("toolbarButtons") or [] if b.get("label")]


def _column_labels(spec: dict) -> list[str]:
    return [str(c.get("label") or "") for c in spec.get("columns") or [] if c.get("label")]


def _filter_labels(spec: dict) -> list[str]:
    return [str(f.get("label") or "") for f in spec.get("filters") or [] if f.get("label")]


def _row_action_labels(spec: dict) -> list[str]:
    labels: list[str] = []
    for action in spec.get("rowActions") or []:
        labels.append(ROW_ACTION_LABELS.get(str(action), str(action)))
    for row in (spec.get("logicDocs") or {}).get("buttons") or []:
        if len(row) > 1 and str(row[1]) == "行操作":
            labels.append(str(row[0]))
    return labels


def infer_target_type(spec: dict, target_match: str | None, instruction: str) -> TargetType | None:
    if _TOOLBAR_HINT.search(instruction) or _BUTTON_HINT.search(instruction):
        return "toolbarButton"
    if _ROW_HINT.search(instruction):
        return "rowAction"
    if _FILTER_HINT.search(instruction) and not _COLUMN_HINT.search(instruction):
        return "filter"
    if _MODULE_HINT.search(instruction):
        return "moduleMeta"
    if _looks_like_column_add(instruction):
        return "column"

    if not target_match:
        if _ADD_PATTERN.search(instruction):
            return "toolbarButton"
        return None

    hits: list[TargetType] = []
    if any(_match_label(label, target_match) for label in _toolbar_labels(spec)):
        hits.append("toolbarButton")
    if any(_match_label(label, target_match) for label in _column_labels(spec)):
        hits.append("column")
    if any(_match_label(label, target_match) for label in _filter_labels(spec)):
        hits.append("filter")
    if any(_match_label(label, target_match) for label in _row_action_labels(spec)):
        hits.append("rowAction")

    if len(hits) == 1:
        return hits[0]
    if "column" in hits and (_looks_like_column_add(instruction) or _ADD_PATTERN.search(instruction)):
        return "column"
    if "toolbarButton" in hits and _ADD_PATTERN.search(instruction):
        return "toolbarButton"
    if "rowAction" in hits and target_match in ("编辑", "删除", "查看"):
        return "rowAction"
    if hits:
        return hits[0]
    if _looks_like_column_add(instruction):
        return "column"
    if _ADD_PATTERN.search(instruction):
        return "toolbarButton"
    return None


def infer_change_kind(instruction: str, payload: dict) -> ChangeKind | None:
    if payload.get("variant") or payload.get("color") or extract_variant_from_text(instruction):
        return "style"
    if re.search(r"改颜色|改样式|颜色|样式", instruction):
        return "style"
    if re.search(r"改名叫|改名|名称|文字", instruction):
        return "label"
    if re.search(r"改逻辑|交互|触发", instruction):
        return "logic"
    if re.search(r"前置|条件", instruction):
        return "precondition"
    if re.search(r"字段类型|类型", instruction):
        return "fieldType"
    if re.search(r"排序", instruction):
        return "sortable"
    if payload.get("label") and re.search(r"改成|改为|换成", instruction):
        return "label"
    if payload.get("logic"):
        return "logic"
    return None


def _slot_prompt_for(op_type: OpType) -> str:
    if op_type == "add":
        return PROTOTYPE_EDIT_ADD_SLOT_PROMPT
    if op_type == "remove":
        return PROTOTYPE_EDIT_REMOVE_SLOT_PROMPT
    return PROTOTYPE_EDIT_UPDATE_SLOT_PROMPT


def _parse_slot_json(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("槽位 JSON 必须是对象")
    return data


def _slots_from_parsed(data: dict) -> EditOperationSlots:
    payload = data.get("payload") if isinstance(data.get("payload"), dict) else {}
    op_type = data.get("opType")
    target_type = data.get("targetType")
    change_kind = data.get("changeKind")
    variant = payload.get("variant") or payload.get("color")
    if variant and str(variant) in ALLOWED_VARIANTS:
        payload["variant"] = str(variant)
    elif variant:
        mapped = extract_variant_from_text(str(variant))
        if mapped:
            payload["variant"] = mapped
    return EditOperationSlots(
        op_type=op_type if op_type in ("add", "remove", "update") else None,
        target_type=target_type if target_type in TARGET_TYPE_LABELS else None,
        target_match=_clean_str(data.get("targetMatch")),
        change_kind=change_kind if change_kind in CHANGE_KIND_LABELS else None,
        payload={k: v for k, v in payload.items() if v not in (None, "", "null")},
    )


async def extract_edit_slots(
    messages: list[dict[str, str]],
    spec: dict,
    state: EditOperationSlots,
    *,
    instruction: str,
) -> EditOperationSlots:
    op_type = state.op_type or classify_op_type(instruction)
    if not op_type:
        return state

    spec_summary = _spec_targets_summary(spec)
    user_content = (
        f"## 当前原型配置摘要\n{spec_summary}\n\n"
        f"## 已填槽位\n{json.dumps(state.to_dict(), ensure_ascii=False)}\n\n"
        f"## 对话历史\n{format_history_text(messages[:-1], HISTORY_TURNS)}\n\n"
        f"## 当前用户消息\n{instruction.strip()}\n\n"
        f"## 操作类型（已判定）\n{op_type}\n\n"
        "请抽取/更新槽位，合并已有槽位，只输出 JSON。"
    )
    raw = await chat_once(
        [
            {"role": "system", "content": _slot_prompt_for(op_type)},
            {"role": "user", "content": user_content},
        ],
        temperature=0.0,
    )
    extracted = _slots_from_parsed(_parse_slot_json(raw))
    if not extracted.op_type:
        extracted.op_type = op_type
    state.merge(extracted)

    column_labels = extract_add_column_labels(instruction)
    if state.op_type == "add" and column_labels:
        state.target_type = "column"
        if not state.payload.get("label"):
            state.payload["label"] = column_labels[0]

    if not state.target_type:
        state.target_type = infer_target_type(
            spec,
            state.target_match or _clean_str(state.payload.get("label")),
            instruction,
        )
    elif state.op_type == "add" and state.target_type == "toolbarButton" and _looks_like_column_add(instruction):
        state.target_type = "column"
    if state.op_type == "update" and not state.change_kind:
        state.change_kind = infer_change_kind(instruction, state.payload)
    if state.op_type == "update" and state.change_kind == "style":
        variant = state.payload.get("variant") or extract_variant_from_text(instruction)
        if variant:
            state.payload["variant"] = variant

    return state


def _spec_targets_summary(spec: dict) -> str:
    lines = [
        f"moduleName: {spec.get('moduleName', '')}",
        "toolbarButtons: " + ", ".join(_toolbar_labels(spec)) or "（无）",
        "columns: " + ", ".join(_column_labels(spec)) or "（无）",
        "filters: " + ", ".join(_filter_labels(spec)) or "（无）",
        "rowActions: " + ", ".join(_row_action_labels(spec)) or "（无）",
    ]
    return "\n".join(lines)


def validate_slots_against_spec(slots: EditOperationSlots, spec: dict) -> list[str]:
    errors: list[str] = []
    if not slots.is_complete():
        return errors

    tt = slots.target_type
    match = slots.target_match or ""

    if slots.op_type in ("remove", "update") and tt == "toolbarButton":
        if not any(_match_label(label, match) for label in _toolbar_labels(spec)):
            errors.append(f"工具栏中未找到按钮「{match}」")
    if slots.op_type in ("remove", "update") and tt == "column":
        if not any(_match_label(label, match) for label in _column_labels(spec)):
            errors.append(f"列表中未找到列「{match}」")
    if slots.op_type in ("remove", "update") and tt == "filter":
        if not any(_match_label(label, match) for label in _filter_labels(spec)):
            errors.append(f"检索区未找到项「{match}」")
    if slots.op_type == "remove" and tt == "column" and len(_column_labels(spec)) <= 1:
        errors.append("至少需保留一列表格列")
    return errors


def compile_slots_to_ops(slots: EditOperationSlots) -> list[dict]:
    if not slots.is_complete():
        raise ValueError("槽位不完整，无法编译 ops")

    ops: list[dict] = []
    tt = slots.target_type
    match = str(slots.target_match or "")
    payload = slots.payload

    if slots.op_type == "add":
        if tt == "toolbarButton":
            op: dict = {
                "op": "addToolbarButton",
                "label": str(payload.get("label") or ""),
                "logic": str(payload.get("logic") or "—"),
                "precondition": str(payload.get("precondition") or "无"),
            }
            if payload.get("variant"):
                op["variant"] = payload["variant"]
            ops.append(op)
        elif tt == "column":
            ops.append(
                {
                    "op": "addColumn",
                    "label": str(payload.get("label") or ""),
                    "fieldType": str(payload.get("fieldType") or "text"),
                    "sortable": bool(payload.get("sortable")),
                }
            )
        elif tt == "rowAction":
            ops.append(
                {
                    "op": "addRowAction",
                    "label": str(payload.get("label") or ""),
                    "logic": str(payload.get("logic") or "—"),
                    "showCondition": str(payload.get("showCondition") or "无"),
                }
            )
        elif tt == "moduleMeta":
            if payload.get("moduleName"):
                ops.append({"op": "updateModuleName", "value": str(payload["moduleName"])})
            if payload.get("breadcrumb"):
                ops.append({"op": "updateBreadcrumb", "value": str(payload["breadcrumb"])})
        return ops

    if slots.op_type == "remove":
        remove_map = {
            "toolbarButton": "removeToolbarButton",
            "column": "removeColumn",
            "filter": "removeFilter",
            "rowAction": "removeRowAction",
        }
        op_name = remove_map.get(tt or "")
        if op_name:
            ops.append({"op": op_name, "match": match})
        return ops

    if slots.op_type == "update":
        patch: dict = {}
        ck = slots.change_kind
        if ck == "style":
            patch["variant"] = payload.get("variant")
            if payload.get("color"):
                patch["color"] = payload["color"]
        elif ck == "label":
            patch["label"] = payload.get("label")
        elif ck == "logic":
            patch["logic"] = payload.get("logic")
        elif ck == "precondition":
            patch["precondition"] = payload.get("precondition")
        elif ck == "fieldType":
            patch["fieldType"] = payload.get("fieldType")
        elif ck == "sortable":
            patch["sortable"] = bool(payload.get("sortable"))

        if tt == "toolbarButton":
            ops.append({"op": "updateToolbarButton", "match": match, "patch": patch})
        elif tt == "column":
            ops.append({"op": "updateColumn", "match": match, "patch": patch})
        elif tt == "rowAction" and ck in ("logic", "precondition"):
            ops.append(
                {
                    "op": "updateRowActionLogic",
                    "match": match,
                    "logic": str(patch.get("logic") or payload.get("logic") or "—"),
                    "showCondition": str(
                        patch.get("precondition") or payload.get("showCondition") or "无"
                    ),
                }
            )
        elif tt == "moduleMeta":
            if payload.get("moduleName"):
                ops.append({"op": "updateModuleName", "value": str(payload["moduleName"])})
            if payload.get("breadcrumb"):
                ops.append({"op": "updateBreadcrumb", "value": str(payload["breadcrumb"])})
    return ops


def build_edit_summary(slots: EditOperationSlots, *, column_labels: list[str] | None = None) -> str:
    if slots.op_type == "add" and column_labels and len(column_labels) > 1:
        joined = "」「".join(column_labels)
        return f"添加列表列「{joined}」"
    if slots.op_type == "add":
        label = slots.payload.get("label") or slots.target_match or "新项"
        return f"添加{TARGET_TYPE_LABELS.get(slots.target_type or '', '配置')}「{label}」"
    if slots.op_type == "remove":
        return f"删除{TARGET_TYPE_LABELS.get(slots.target_type or '', '配置')}「{slots.target_match}」"
    if slots.op_type == "update":
        kind = CHANGE_KIND_LABELS.get(slots.change_kind or "", "内容")
        detail = slots.payload.get("variant") or slots.payload.get("label") or slots.payload.get("logic") or ""
        target = slots.target_match or ""
        return f"修改「{target}」的{kind}" + (f"为「{detail}」" if detail else "")
    return "已调整原型配置"


def build_clarification_message(slots: EditOperationSlots, module_name: str) -> str:
    questions = slots.pending_questions()
    header = f"正在编辑 **{module_name}**，还需要补充以下信息：\n\n"
    body = "\n".join(f"- {q}" for q in questions)
    filled: list[str] = []
    if slots.op_type:
        filled.append(f"操作：{slots.op_type}")
    if slots.target_type:
        filled.append(f"目标类型：{TARGET_TYPE_LABELS.get(slots.target_type, slots.target_type)}")
    if slots.target_match:
        filled.append(f"目标：{slots.target_match}")
    if slots.change_kind:
        filled.append(f"修改项：{CHANGE_KIND_LABELS.get(slots.change_kind, slots.change_kind)}")
    if filled:
        header += "已识别：" + "；".join(filled) + "\n\n"
    return header + body


async def plan_edit_operation(
    spec: dict,
    instruction: str,
    messages: list[dict[str, str]],
    slot_state: EditOperationSlots | None = None,
) -> EditPlanResult:
    state = slot_state or EditOperationSlots()
    if not state.op_type:
        state.op_type = classify_op_type(instruction)

    try:
        state = await extract_edit_slots(messages, spec, state, instruction=instruction)
    except (json.JSONDecodeError, ValueError):
        if not state.is_complete():
            return EditPlanResult(
                complete=False,
                slots=state,
                clarification=build_clarification_message(state, str(spec.get("moduleName") or "原型")),
            )
        return EditPlanResult(
            complete=False,
            slots=state,
            clarification="未能理解修改指令，请换一种说法或补充更多细节。",
        )

    if not state.is_complete():
        return EditPlanResult(
            complete=False,
            slots=state,
            clarification=build_clarification_message(state, str(spec.get("moduleName") or "原型")),
        )

    column_labels = extract_add_column_labels(instruction)
    if state.op_type == "add" and column_labels:
        state.target_type = "column"
        state.payload.setdefault("label", column_labels[0])

    errors = validate_slots_against_spec(state, spec)
    if errors:
        return EditPlanResult(
            complete=False,
            slots=state,
            clarification="无法应用修改：\n\n" + "\n".join(f"- {e}" for e in errors),
            errors=errors,
        )

    try:
        if state.op_type == "add" and state.target_type == "column" and column_labels:
            ops = [
                {
                    "op": "addColumn",
                    "label": label,
                    "fieldType": _infer_column_field_type(label),
                    "sortable": bool(state.payload.get("sortable")),
                }
                for label in column_labels
            ]
        else:
            ops = compile_slots_to_ops(state)
    except ValueError as exc:
        return EditPlanResult(
            complete=False,
            slots=state,
            clarification=str(exc),
            errors=[str(exc)],
        )

    if not ops:
        return EditPlanResult(
            complete=False,
            slots=state,
            clarification="未能将指令编译为有效修改，请补充更多细节。",
        )

    return EditPlanResult(
        complete=True,
        slots=state,
        summary=build_edit_summary(state, column_labels=column_labels or None),
        ops=ops,
    )
