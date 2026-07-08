"""新需求原型槽位：定义、抽取、构建 spec。"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from uuid import uuid4

from chat_history import format_history_text
from config import HISTORY_TURNS, PROTOTYPE_SKELETON_DIR, PROTOTYPES_DIR
from embedder import chat_once
from prompts import PROTOTYPE_SLOT_EXTRACT_PROMPT
from prototype_registry import register_prototype
from prototype_spec import DEFAULT_STATUS_LABELS, normalize_spec, normalize_toolbar_buttons

REQUIRED_SLOTS: list[dict[str, str]] = [
    {"key": "moduleName", "label": "模块名称", "hint": "例如：价卡查询、指令下发管理"},
    {"key": "breadcrumb", "label": "所属业务域", "hint": "例如：费用管理、仓储管理"},
    {"key": "columns", "label": "列表字段", "hint": "逗号分隔，例如：价卡名称,客户,状态,创建时间"},
]

OPTIONAL_SLOTS: list[dict[str, str]] = [
    {"key": "filters", "label": "筛选条件", "hint": "例如：按状态、名称关键字筛选"},
    {"key": "requirements", "label": "补充说明", "hint": "其他交互或业务规则（可选）"},
]

LABEL_FIELD_MAP = {
    "价卡名称": "name",
    "名称": "name",
    "客户": "customer",
    "状态": "status",
    "创建时间": "createdAt",
    "更新时间": "updatedAt",
}


@dataclass
class PrototypeSlotState:
    filled: dict[str, str] = field(default_factory=dict)

    def pending_keys(self) -> list[str]:
        return [s["key"] for s in REQUIRED_SLOTS if not self.filled.get(s["key"], "").strip()]

    def is_complete(self) -> bool:
        return len(self.pending_keys()) == 0

    def to_dict(self) -> dict:
        return {"filled": dict(self.filled)}

    @classmethod
    def from_dict(cls, data: dict | None) -> PrototypeSlotState:
        if not data:
            return cls()
        filled = data.get("filled") if isinstance(data, dict) else {}
        if not isinstance(filled, dict):
            filled = {}
        clean = {k: str(v).strip() for k, v in filled.items() if v not in (None, "")}
        return cls(filled=clean)


def _parse_slot_json(raw: str) -> dict[str, str]:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    try:
        data = json.loads(text)
        if isinstance(data, dict):
            out: dict[str, str] = {}
            for slot in REQUIRED_SLOTS + OPTIONAL_SLOTS:
                val = data.get(slot["key"])
                if val not in (None, "", "null"):
                    out[slot["key"]] = str(val).strip()
            return out
    except json.JSONDecodeError:
        pass
    return {}


async def extract_slots_from_message(
    messages: list[dict[str, str]],
    state: PrototypeSlotState,
) -> PrototypeSlotState:
    if not messages:
        return state
    user_content = (
        f"已有槽位：{json.dumps(state.filled, ensure_ascii=False)}\n\n"
        f"对话历史：\n{format_history_text(messages[:-1], HISTORY_TURNS)}\n\n"
        f"当前用户消息：{messages[-1]['content']}"
    )
    raw = await chat_once(
        [
            {"role": "system", "content": PROTOTYPE_SLOT_EXTRACT_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.0,
    )
    extracted = _parse_slot_json(raw)
    merged = dict(state.filled)
    merged.update({k: v for k, v in extracted.items() if v.strip()})
    return PrototypeSlotState(filled=merged)


def _label_to_field(label: str, index: int) -> tuple[str, str | None]:
    label = label.strip()
    if label in LABEL_FIELD_MAP:
        field_name = LABEL_FIELD_MAP[label]
        col_type = "status" if field_name == "status" else "datetime" if field_name.endswith("At") else None
        return field_name, col_type
    ascii_part = re.sub(r"[^a-zA-Z0-9]", "", label)
    if ascii_part:
        name = ascii_part[0].lower() + ascii_part[1:]
        return name, None
    return f"field{index + 1}", None


def _parse_columns(columns_str: str) -> list[dict]:
    parts = [p.strip() for p in re.split(r"[,，、]", columns_str) if p.strip()]
    cols: list[dict] = []
    for i, label in enumerate(parts):
        field_name, col_type = _label_to_field(label, i)
        col: dict = {"field": field_name, "label": label}
        if col_type:
            col["type"] = col_type
        cols.append(col)
    return cols or [{"field": "name", "label": "名称"}]


def _build_filters(columns_str: str, filters_str: str, columns: list[dict]) -> list[dict]:
    filters: list[dict] = []
    text = f"{columns_str} {filters_str}".lower()
    status_col = next((c for c in columns if c.get("type") == "status"), None)
    if status_col and ("状态" in text or "status" in text):
        filters.append(
            {
                "id": "filterStatus",
                "label": "状态",
                "type": "select",
                "field": status_col["field"],
                "match": "exact",
                "options": [
                    {"value": "", "label": "全部"},
                    {"value": "active", "label": "启用"},
                    {"value": "inactive", "label": "禁用"},
                ],
            }
        )
    name_col = next((c for c in columns if c["field"] in ("name", "title")), columns[0] if columns else None)
    if name_col and any(k in text for k in ("名称", "关键字", "搜索", "keyword", "筛选")):
        filters.append(
            {
                "id": "filterKeyword",
                "label": name_col["label"],
                "type": "text",
                "field": name_col["field"],
                "match": "contains",
                "placeholder": "输入关键字",
            }
        )
    return filters


def _build_form_fields(columns: list[dict]) -> list[dict]:
    fields: list[dict] = []
    for col in columns:
        if col.get("type") == "datetime":
            continue
        field_def: dict = {
            "id": f"field{col['field'].title()}",
            "label": col["label"],
            "field": col["field"],
            "required": True,
        }
        if col.get("type") == "status":
            field_def["type"] = "select"
            field_def["options"] = [
                {"value": "active", "label": "启用"},
                {"value": "inactive", "label": "禁用"},
            ]
        else:
            field_def["type"] = "text"
            field_def["placeholder"] = f"请输入{col['label']}"
        fields.append(field_def)
    return fields


def _make_page_id(module_name: str) -> str:
    ascii_slug = re.sub(r"[^a-zA-Z0-9]+", "-", module_name).strip("-").lower()
    if ascii_slug and re.search(r"[a-z]", ascii_slug):
        return ascii_slug[:40]
    return f"page-{uuid4().hex[:8]}"


def build_spec(state: PrototypeSlotState) -> dict:
    module_name = state.filled["moduleName"]
    breadcrumb = state.filled["breadcrumb"]
    columns_str = state.filled["columns"]
    filters_str = state.filled.get("filters", "")
    columns = _parse_columns(columns_str)
    page_id = _make_page_id(module_name)
    filters = _build_filters(columns_str, filters_str, columns)
    mock_row: dict = {"id": "row_001"}
    for col in columns:
        if col.get("type") == "status":
            mock_row[col["field"]] = "active"
        elif col.get("type") == "datetime":
            mock_row[col["field"]] = "2026-06-27T10:00:00.000Z"
        else:
            mock_row[col["field"]] = f"示例{col['label']}"
    return normalize_spec(
        {
            "moduleName": module_name,
            "pageId": page_id,
            "breadcrumb": breadcrumb,
            "pageType": "list-crud",
            "version": "1.0.0",
            "dataFile": f"data/{page_id}-data.json",
            "filters": filters,
            "columns": columns,
            "rowActions": ["edit", "delete"],
            "toolbarButtons": normalize_toolbar_buttons(
                [{"id": "addBtn", "label": f"新增{module_name}"}],
                module_name,
            ),
            "statusLabels": DEFAULT_STATUS_LABELS.copy(),
            "mockData": [mock_row],
            "logicDocs": {
                "init": [["列表数据", "加载 mock 并渲染", f"data/{page_id}-data.json", "默认排序"]],
                "filters": [[f["label"], f["type"], "按配置匹配"] for f in filters] or [["无", "-", "展示全部"]],
                "buttons": [
                    [f"新增{module_name}", "工具栏", "无", "打开表单弹窗"],
                    ["编辑", "行操作", "无", "回填并编辑"],
                    ["删除", "行操作", "confirm", "从列表移除"],
                ],
                "fields": [[c["field"], c["label"], c.get("type", "text"), "是", "手工输入"] for c in columns],
            },
        },
        {
            "moduleName": module_name,
            "pageId": page_id,
            "breadcrumb": breadcrumb,
            "pageType": "list-crud",
            "version": "1.0.0",
            "dataFile": f"data/{page_id}-data.json",
            "columns": columns,
        },
    )


def run_generate_spec(
    spec: dict,
    *,
    output_dir: Path | None = None,
    persist_spec: bool = True,
) -> Path:
    """运行 generate.py；可选自定义输出目录与是否持久化 spec。"""
    PROTOTYPES_DIR.mkdir(parents=True, exist_ok=True)
    spec_path: Path
    if persist_spec:
        spec_path = PROTOTYPES_DIR / "specs" / f"{spec['pageId']}.spec.json"
        spec_path.parent.mkdir(parents=True, exist_ok=True)
        spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    else:
        draft_specs = PROTOTYPES_DIR / "pending-specs"
        draft_specs.mkdir(parents=True, exist_ok=True)
        spec_path = draft_specs / f"{spec['pageId']}-{uuid4().hex[:8]}.spec.json"
        spec_path.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    generate_script = PROTOTYPE_SKELETON_DIR / "tools" / "generate.py"
    if not generate_script.is_file():
        raise FileNotFoundError(f"未找到生成脚本：{generate_script}")

    out_dir = output_dir or (PROTOTYPE_SKELETON_DIR / "generated" / spec["pageId"])
    cmd = [sys.executable, str(generate_script), str(spec_path), "-o", str(out_dir)]
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=PROTOTYPE_SKELETON_DIR,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "generate.py 执行失败").strip()
        raise RuntimeError(detail)
    if not (out_dir / "index.html").is_file():
        raise RuntimeError(f"生成失败：{out_dir / 'index.html'} 不存在")
    if not persist_spec and spec_path.parent.name == "pending-specs":
        try:
            spec_path.unlink(missing_ok=True)
        except OSError:
            pass
    return out_dir


def generate_prototype(spec: dict) -> Path:
    out_dir = run_generate_spec(spec, persist_spec=True)
    register_prototype(spec["pageId"], spec["moduleName"], spec.get("breadcrumb", ""))
    return out_dir


def format_slot_summary(state: PrototypeSlotState) -> str:
    lines = ["**已收集信息：**"]
    for slot in REQUIRED_SLOTS + OPTIONAL_SLOTS:
        val = state.filled.get(slot["key"], "").strip()
        if val:
            lines.append(f"- {slot['label']}：{val}")
    return "\n".join(lines)


def next_slot_prompt(state: PrototypeSlotState) -> str:
    pending = state.pending_keys()
    if not pending:
        return ""
    slot = next(s for s in REQUIRED_SLOTS if s["key"] == pending[0])
    summary = format_slot_summary(state)
    return (
        f"{summary}\n\n"
        f"还缺 **{slot['label']}**。{slot['hint']}\n\n"
        f"请补充后继续，也可以说「取消」退出原型创建。"
    )
