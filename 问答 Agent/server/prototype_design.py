"""结构化原型需求设计 → module.spec 构建。"""
from __future__ import annotations

import re
from uuid import uuid4

from prototype_slots import _label_to_field, _make_page_id, generate_prototype
from prototype_registry import register_prototype
from prototype_spec import DEFAULT_STATUS_LABELS, merge_toolbar_styles_from_design, normalize_spec, normalize_toolbar_buttons, validate_spec

INPUT_TYPE_LABELS = {
    "text": "文本输入",
    "select": "下拉单选",
    "dateRange": "日期范围",
    "multiSelect": "下拉多选",
    "picker": "弹窗选择",
}

COLUMN_TYPE_LABELS = {
    "text": "文本",
    "status": "状态标签",
    "datetime": "日期时间",
    "amount": "金额",
    "link": "链接",
}

ROW_ACTION_MAP = {
    "编辑": "edit",
    "删除": "delete",
    "查看": "view",
    "复制": "view",
}

DEFAULT_DESIGN: dict = {
    "moduleName": "",
    "breadcrumb": "",
    "notes": "",
    "filters": [
        {
            "label": "状态",
            "inputType": "select",
            "dataSource": "全部/启用/禁用",
            "defaultValue": "全部",
            "required": False,
        },
        {
            "label": "名称",
            "inputType": "text",
            "dataSource": "",
            "defaultValue": "",
            "required": False,
        },
    ],
    "toolbarButtons": [
        {
            "label": "新增",
            "logic": "打开新增表单弹窗，提交后刷新列表",
            "precondition": "",
        },
        {
            "label": "导出",
            "logic": "按当前检索条件导出 Excel，无数据时提示",
            "precondition": "",
        },
    ],
    "columns": [
        {"label": "名称", "fieldType": "text", "sortable": False, "format": ""},
        {"label": "状态", "fieldType": "status", "sortable": False, "format": "启用/禁用"},
        {"label": "创建时间", "fieldType": "datetime", "sortable": True, "format": ""},
    ],
    "rowActions": [
        {"label": "编辑", "logic": "打开编辑弹窗并回填，保存后刷新", "showCondition": ""},
        {"label": "删除", "logic": "二次确认后从列表移除", "showCondition": ""},
    ],
}

STANDARD_TEMPLATE: dict = {
    **DEFAULT_DESIGN,
    "moduleName": "价卡查询",
    "breadcrumb": "费用管理",
    "filters": [
        {
            "label": "状态",
            "inputType": "select",
            "dataSource": "全部/启用/禁用",
            "defaultValue": "全部",
            "required": False,
        },
        {
            "label": "价卡名称",
            "inputType": "text",
            "dataSource": "",
            "defaultValue": "",
            "required": False,
        },
    ],
    "toolbarButtons": [
        {
            "label": "新增价卡",
            "logic": "打开新增表单弹窗，提交后刷新列表",
            "precondition": "",
        },
        {
            "label": "导出",
            "logic": "按当前检索条件导出 Excel",
            "precondition": "有检索结果",
        },
    ],
    "columns": [
        {"label": "价卡名称", "fieldType": "text", "sortable": False, "format": ""},
        {"label": "客户", "fieldType": "text", "sortable": False, "format": ""},
        {"label": "状态", "fieldType": "status", "sortable": False, "format": "启用/禁用"},
        {"label": "创建时间", "fieldType": "datetime", "sortable": True, "format": ""},
    ],
    "rowActions": [
        {"label": "编辑", "logic": "打开编辑弹窗并回填", "showCondition": ""},
        {"label": "删除", "logic": "二次确认后删除", "showCondition": ""},
    ],
}


def get_design_template(name: str = "blank") -> dict:
    from template_store import get_template_design

    template_id = (name or "blank").strip()
    try:
        return _deep_copy(get_template_design(template_id))
    except FileNotFoundError:
        return _deep_copy(DEFAULT_DESIGN)


def _deep_copy(data: dict) -> dict:
    import json

    return json.loads(json.dumps(data, ensure_ascii=False))


def _parse_options(data_source: str) -> list[dict]:
    if not data_source.strip():
        return [{"value": "", "label": "全部"}]
    parts = [p.strip() for p in re.split(r"[/、,，|]", data_source) if p.strip()]
    options: list[dict] = []
    for part in parts:
        if part in ("全部", "所有"):
            options.append({"value": "", "label": part})
        elif part in ("启用", "active"):
            options.append({"value": "active", "label": "启用"})
        elif part in ("禁用", "inactive"):
            options.append({"value": "inactive", "label": "禁用"})
        else:
            slug = re.sub(r"[^a-zA-Z0-9\u4e00-\u9fff]", "", part).lower() or part
            options.append({"value": slug, "label": part})
    return options or [{"value": "", "label": "全部"}]


def _column_field_map(columns: list[dict]) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for i, col in enumerate(columns):
        label = str(col.get("label", "")).strip()
        if not label:
            continue
        field_name, _ = _label_to_field(label, i)
        if col.get("fieldType") == "status":
            field_name = "status" if label in ("状态",) else field_name
        mapping[label] = field_name
    return mapping


def _build_columns(design_columns: list[dict]) -> list[dict]:
    cols: list[dict] = []
    for i, item in enumerate(design_columns):
        label = str(item.get("label", "")).strip()
        if not label:
            continue
        field_name, inferred_type = _label_to_field(label, i)
        field_type = str(item.get("fieldType") or "text")
        col: dict = {"field": field_name, "label": label}
        if field_type == "status" or inferred_type == "status":
            col["type"] = "status"
        elif field_type == "datetime" or inferred_type == "datetime":
            col["type"] = "datetime"
        elif field_type == "amount":
            col["render"] = "html"
            col["template"] = "{{" + field_name + "}}"
        elif field_type == "link":
            col["render"] = "html"
            col["template"] = '<a href="#">{{' + field_name + "}}</a>"
        if item.get("sortable"):
            col["sortable"] = True
        cols.append(col)
    return cols or [{"field": "name", "label": "名称"}]


def _build_filters_from_design(design_filters: list[dict], columns: list[dict]) -> list[dict]:
    field_map = _column_field_map(columns)
    filters: list[dict] = []
    for i, item in enumerate(design_filters):
        label = str(item.get("label", "")).strip()
        if not label:
            continue
        input_type = str(item.get("inputType") or "text")
        field = field_map.get(label)
        if not field:
            field, _ = _label_to_field(label, i)
        filter_id = f"filter{label[:8].replace(' ', '')}{i}" if label else f"filter{i}"
        filter_id = re.sub(r"[^a-zA-Z0-9]", "", filter_id) or f"filter{i}"
        if input_type in ("select", "multiSelect"):
            options = _parse_options(str(item.get("dataSource") or ""))
            filters.append(
                {
                    "id": filter_id,
                    "label": label,
                    "type": "select",
                    "field": field,
                    "match": "exact",
                    "options": options,
                    "defaultValue": str(item.get("defaultValue") or ""),
                }
            )
        else:
            filters.append(
                {
                    "id": filter_id,
                    "label": label,
                    "type": "text",
                    "field": field,
                    "match": "contains",
                    "placeholder": str(item.get("dataSource") or item.get("defaultValue") or "请输入"),
                }
            )
    return filters


def _build_toolbar_buttons(design_buttons: list[dict], module_name: str) -> list[dict]:
    raw_buttons: list[dict] = []
    for i, item in enumerate(design_buttons):
        label = str(item.get("label", "")).strip()
        if not label:
            continue
        raw_btn: dict = {"id": f"toolbarBtn{i}", "label": label}
        if item.get("variant"):
            raw_btn["variant"] = str(item["variant"])
        if item.get("color"):
            raw_btn["color"] = str(item["color"])
        if item.get("logic"):
            raw_btn["logic"] = str(item["logic"])
        if item.get("precondition"):
            raw_btn["precondition"] = str(item["precondition"])
        raw_buttons.append(raw_btn)
    return normalize_toolbar_buttons(raw_buttons, module_name)


def _build_row_actions(design_actions: list[dict]) -> list[str]:
    actions: list[str] = []
    for item in design_actions:
        label = str(item.get("label", "")).strip()
        if not label:
            continue
        action = ROW_ACTION_MAP.get(label, "edit" if "编辑" in label else "delete" if "删" in label else "view")
        if action not in actions:
            actions.append(action)
    return actions or ["edit", "delete"]


def _build_logic_docs(design: dict, columns: list[dict], filters: list[dict]) -> dict:
    module_name = design["moduleName"]
    filter_docs = []
    for item in design.get("filters") or []:
        label = str(item.get("label", "")).strip()
        if not label:
            continue
        input_type = INPUT_TYPE_LABELS.get(str(item.get("inputType") or "text"), "文本")
        detail = str(item.get("dataSource") or item.get("defaultValue") or "按配置匹配")
        filter_docs.append([label, input_type, detail])

    button_docs = []
    for item in design.get("toolbarButtons") or []:
        label = str(item.get("label", "")).strip()
        if not label:
            continue
        pre = str(item.get("precondition") or "无")
        logic = str(item.get("logic") or "—")
        button_docs.append([label, "工具栏", pre, logic])

    for item in design.get("rowActions") or []:
        label = str(item.get("label", "")).strip()
        if not label:
            continue
        cond = str(item.get("showCondition") or "无")
        logic = str(item.get("logic") or "—")
        button_docs.append([label, "行操作", cond, logic])

    field_docs = []
    for col in design.get("columns") or []:
        label = str(col.get("label", "")).strip()
        if not label:
            continue
        field_type = COLUMN_TYPE_LABELS.get(str(col.get("fieldType") or "text"), "文本")
        fmt = str(col.get("format") or "—")
        sortable = "是" if col.get("sortable") else "否"
        field_docs.append([label, field_type, sortable, fmt])

    notes = str(design.get("notes") or "").strip()
    init_note = notes or f"加载 mock 并渲染 data/{_make_page_id(module_name)}-data.json"

    return {
        "init": [["列表数据", init_note, "mock 数据", "默认排序"]],
        "filters": filter_docs or [["无", "-", "展示全部"]],
        "buttons": button_docs
        or [
            [f"新增{module_name}", "工具栏", "无", "打开表单弹窗"],
            ["编辑", "行操作", "无", "回填并编辑"],
            ["删除", "行操作", "confirm", "从列表移除"],
        ],
        "fields": field_docs
        or [[c["field"], c["label"], c.get("type", "text"), "否", "—"] for c in columns],
    }


def validate_design(design: dict) -> list[str]:
    errors: list[str] = []
    if not str(design.get("moduleName", "")).strip():
        errors.append("请填写模块名称")
    if not str(design.get("breadcrumb", "")).strip():
        errors.append("请填写所属业务域")
    columns = [c for c in (design.get("columns") or []) if str(c.get("label", "")).strip()]
    if not columns:
        errors.append("请至少添加一列列表属性")
    return errors


def build_partial_spec_from_design(design: dict) -> dict:
    errors = validate_design(design)
    if errors:
        raise ValueError("；".join(errors))

    module_name = str(design["moduleName"]).strip()
    breadcrumb = str(design["breadcrumb"]).strip()
    page_id = _make_page_id(module_name)
    columns = _build_columns(design.get("columns") or [])

    return {
        "moduleName": module_name,
        "pageId": page_id,
        "breadcrumb": breadcrumb,
        "pageType": "list-crud",
        "version": "1.0.0",
        "dataFile": f"data/{page_id}-data.json",
        "columns": columns,
        "notes": str(design.get("notes") or "").strip(),
    }


def build_spec_from_design(design: dict) -> dict:
    partial = build_partial_spec_from_design(design)
    module_name = partial["moduleName"]
    page_id = partial["pageId"]
    columns = partial["columns"]
    filters = _build_filters_from_design(design.get("filters") or [], design.get("columns") or [])
    toolbar_buttons = _build_toolbar_buttons(design.get("toolbarButtons") or [], module_name)
    row_actions = _build_row_actions(design.get("rowActions") or [])

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
            "breadcrumb": partial["breadcrumb"],
            "pageType": "list-crud",
            "version": "1.0.0",
            "dataFile": partial["dataFile"],
            "filters": filters,
            "columns": columns,
            "rowActions": row_actions,
            "toolbarButtons": toolbar_buttons,
            "statusLabels": DEFAULT_STATUS_LABELS.copy(),
            "mockData": [mock_row],
            "logicDocs": _build_logic_docs(design, columns, filters),
        },
        partial,
    )


async def generate_from_design(design: dict) -> dict:
    from prototype_enrich import enrich_spec_with_fallback

    partial = build_partial_spec_from_design(design)
    spec, enriched = await enrich_spec_with_fallback(partial, design, source="design")
    spec = merge_toolbar_styles_from_design(spec, design.get("toolbarButtons"))
    errors = validate_spec(spec)
    if errors:
        spec = build_spec_from_design(design)
        enriched = False
    generate_prototype(spec)
    entry = register_prototype(spec["pageId"], spec["moduleName"], spec.get("breadcrumb", ""))
    return {
        "pageId": spec["pageId"],
        "moduleName": spec["moduleName"],
        "breadcrumb": spec.get("breadcrumb", ""),
        "previewUrl": entry["previewUrl"],
        "enriched": enriched,
    }


def generate_from_design_sync(design: dict) -> dict:
    spec = build_spec_from_design(design)
    generate_prototype(spec)
    entry = register_prototype(spec["pageId"], spec["moduleName"], spec.get("breadcrumb", ""))
    return {
        "pageId": spec["pageId"],
        "moduleName": spec["moduleName"],
        "breadcrumb": spec.get("breadcrumb", ""),
        "previewUrl": entry["previewUrl"],
        "enriched": False,
    }
